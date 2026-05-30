import { useCallback, useState } from 'react'
import { useSendTransaction } from '@privy-io/react-auth'
import {
  useSignAndSendTransaction,
  useWallets as useSolanaWallets,
} from '@privy-io/react-auth/solana'
import {
  type Action,
  type BuiltEoaTransaction,
  type BuiltSolanaTransaction,
  type BuiltTransaction,
  type EoaTransaction,
  type SolanaTransaction,
  buildTransaction,
} from '../utils/transactionBuilder'

export type {
  Action,
  BuiltEoaTransaction,
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
  const signAndSend = useSignAndSendTransaction()
  const solanaWallets = useSolanaWallets()
  const [isLoading, setIsLoading] = useState(false)

  const buildTx = useCallback(
    (actions: Action[]) => buildTransaction(actions),
    [],
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
        const result =
          builtTx.provider === 'eoa'
            ? await sendEoa(builtTx)
            : await sendSolana(builtTx)
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
    [sendEoa, sendSolana, onSuccess, onError],
  )

  const getClient = useCallback(
    (provider: 'eoa' | 'solana'): TransactionClient => ({
      sendTransaction: async (builtTx: BuiltTransaction) => {
        const result =
          provider === 'eoa'
            ? await sendEoa(builtTx as BuiltEoaTransaction)
            : await sendSolana(builtTx as BuiltSolanaTransaction)
        return result
      },
    }),
    [sendEoa, sendSolana],
  )

  return { getClient, executeTransaction, buildTransaction: buildTx, isLoading }
}

export default useExecuteTransaction
