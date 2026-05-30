import { useCallback, useState } from 'react'
import { useSendTransaction } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import {
  useSignAndSendTransaction,
  useWallets as useSolanaWallets,
} from '@privy-io/react-auth/solana'
import {
  type Action,
  type BuiltEoaTransaction,
  type BuiltSafeTransaction,
  type BuiltSolanaTransaction,
  type BuiltTransaction,
  type EoaTransaction,
  type SolanaTransaction,
  buildTransaction,
} from '../utils/transactionBuilder'

export type {
  Action,
  BuiltEoaTransaction,
  BuiltSafeTransaction,
  BuiltSolanaTransaction,
  BuiltTransaction,
  EoaTransaction,
  SolanaTransaction,
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
  const sendTx = useSendTransaction()
  const smartWallets = useSmartWallets()
  const signAndSend = useSignAndSendTransaction()
  const solanaWallets = useSolanaWallets()
  const [isLoading, setIsLoading] = useState(false)

  const buildTx = useCallback(
    (actions: Action[]) => buildTransaction(actions),
    [],
  )

  const sendSafe = useCallback(
    async (builtTx: BuiltSafeTransaction) => {
      const client = smartWallets.client
      if (!client) {
        throw new Error('Smart wallet client not available')
      }

      const { txs } = builtTx
      const results = []
      for (const tx of txs) {
        const hash = await client.sendTransaction({
          to: tx.to as `0x${string}`,
          value: tx.value,
          data: (tx.data ?? '0x') as `0x${string}`,
        })
        results.push(hash)
      }
      return { hash: results[results.length - 1] }
    },
    [smartWallets],
  )

  const sendEoa = useCallback(
    async (builtTx: BuiltEoaTransaction) => {
      const { txs } = builtTx
      const results = []
      for (const tx of txs) {
        const result = await sendTx.sendTransaction({
          to: tx.to,
          value: tx.value,
          data: tx.data,
          chainId: tx.chainId,
        })
        results.push(result)
      }
      return { hash: results[results.length - 1].hash }
    },
    [sendTx],
  )

  const sendSolana = useCallback(
    async (builtTx: BuiltSolanaTransaction) => {
      const { txs } = builtTx
      const wallets = solanaWallets.wallets
      if (wallets.length === 0) {
        throw new Error('No Solana wallet connected')
      }
      const wallet = wallets[0]
      const results = []
      for (const tx of txs) {
        const result = await signAndSend.signAndSendTransaction({
          transaction: tx,
          wallet,
        })
        results.push(result)
      }
      return { signature: results[results.length - 1].signature }
    },
    [signAndSend, solanaWallets],
  )

  const executeTransaction = useCallback(
    async (builtTx: BuiltTransaction) => {
      setIsLoading(true)
      try {
        let result: { hash: string } | { signature: Uint8Array }
        switch (builtTx.provider) {
          case 'safe':
            result = await sendSafe(builtTx)
            break
          case 'eoa':
            result = await sendEoa(builtTx)
            break
          case 'solana':
            result = await sendSolana(builtTx)
            break
          default:
            throw new Error(`Unsupported provider: ${(builtTx as BuiltTransaction).provider}`)
        }
        onSuccess?.(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [sendSafe, sendEoa, sendSolana, onSuccess, onError],
  )

  const getClient = useCallback(
    (provider: 'safe' | 'eoa' | 'solana'): TransactionClient => ({
      sendTransaction: async (builtTx: BuiltTransaction) => {
        let result: { hash: string } | { signature: Uint8Array }
        switch (provider) {
          case 'safe':
            result = await sendSafe(builtTx as BuiltSafeTransaction)
            break
          case 'eoa':
            result = await sendEoa(builtTx as BuiltEoaTransaction)
            break
          case 'solana':
            result = await sendSolana(builtTx as BuiltSolanaTransaction)
            break
          default:
            throw new Error(`Unsupported provider: ${String(provider)}`)
        }
        return result
      },
    }),
    [sendSafe, sendEoa, sendSolana],
  )

  return { getClient, executeTransaction, buildTransaction: buildTx, isLoading }
}

export default useExecuteTransaction
