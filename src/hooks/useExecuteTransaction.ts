import { useCallback, useMemo, useState } from 'react'
import { useSendTransaction } from '@privy-io/react-auth'
import {
  useSignAndSendTransaction,
  useWallets as useSolanaWallets,
} from '@privy-io/react-auth/solana'

export interface EoaTransaction {
  to: string
  value: bigint
  data?: string
}

export type SolanaTransaction = Uint8Array

export interface BuiltTransaction {
  provider: 'eoa' | 'solana'
  txs: EoaTransaction[] | SolanaTransaction
}

export interface TransactionClient {
  sendTransaction: (
    builtTx: BuiltTransaction,
  ) => Promise<{ hash: string } | { signature: Uint8Array }>
}

interface UseExecuteTransactionOptions {
  onSuccess?: (result: { hash: string } | { signature: Uint8Array }) => void
  onError?: (error: Error) => void
}

export const useExecuteTransaction = ({
  onSuccess,
  onError,
}: UseExecuteTransactionOptions = {}) => {
  const { sendTransaction: privySendTx } = useSendTransaction()
  const { signAndSendTransaction: privySignAndSend } = useSignAndSendTransaction()
  const { wallets: solanaWallets } = useSolanaWallets()
  const [isLoading, setIsLoading] = useState(false)

  const buildTransaction = useMemo(
    (): BuiltTransaction => ({
      provider: 'eoa',
      txs: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: 0n,
          data: '0x',
        },
      ],
    }),
    [],
  )

  const getClient = useCallback(
    (provider: 'eoa' | 'solana'): TransactionClient => {
      return {
        sendTransaction: async (builtTx: BuiltTransaction) => {
          setIsLoading(true)
          try {
            if (provider === 'eoa') {
              const txs = builtTx.txs as EoaTransaction[]
              const tx = txs[0]
              if (!tx) {
                throw new Error('No EOA transactions to execute')
              }

              const result = await privySendTx({
                to: tx.to,
                value: tx.value,
                data: tx.data,
              })

              const output = { hash: result.hash }
              onSuccess?.(output)
              return output
            }

            if (provider === 'solana') {
              const tx = builtTx.txs as SolanaTransaction
              const wallet = solanaWallets[0]
              if (!wallet) {
                throw new Error('No Solana wallet connected')
              }

              const result = await privySignAndSend({
                transaction: tx,
                wallet,
              })

              const output = { signature: result.signature }
              onSuccess?.(output)
              return output
            }

            throw new Error(`Unsupported provider: ${provider}`)
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error))
            onError?.(err)
            throw err
          } finally {
            setIsLoading(false)
          }
        },
      }
    },
    [privySendTx, privySignAndSend, solanaWallets, onSuccess, onError],
  )

  const executeTransaction = useCallback(
    async (builtTx: BuiltTransaction) => {
      const client = getClient(builtTx.provider)
      return client.sendTransaction(builtTx)
    },
    [getClient],
  )

  return { getClient, executeTransaction, buildTransaction, isLoading }
}

export default useExecuteTransaction
