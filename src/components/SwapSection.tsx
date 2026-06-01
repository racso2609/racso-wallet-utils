import { FC, useCallback, useMemo, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useSwapQuote } from '../hooks/useSwapQuote'
import { useExecuteTransaction } from '../hooks/useExecuteTransaction'
import { activeWalletAtom, walletsAtom } from '../storages/activeWallet'
import SwapPanel from './SwapPanel'
import { formatUsd } from '../utils/formatters'
import type { TokenInfo } from '../types/token'

export interface SwapSectionProps {
  /** Pre-selected token on the "from" side. If provided, this side is disabled. */
  fromToken?: TokenInfo
  /** Pre-selected token on the "to" side. If provided, this side is disabled. */
  toToken?: TokenInfo
  /** Overrides the action button text. */
  actionLabel?: string
  /** Called when a swap succeeds */
  onSuccess?: () => void
  /** Called when a swap fails */
  onError?: (error: Error) => void
}

export const SwapSection: FC<SwapSectionProps> = ({
  fromToken: fromTokenProp,
  toToken: toTokenProp,
  actionLabel: actionLabelProp,
  onSuccess,
  onError,
}) => {
  const [activeWallet] = useAtom(activeWalletAtom)
  const wallets = useAtomValue(walletsAtom)

  const [tokenA, setTokenA] = useState<TokenInfo | undefined>(fromTokenProp)
  const [tokenB, setTokenB] = useState<TokenInfo | undefined>(toTokenProp)
  const [fromAmount, setFromAmount] = useState('')

  const fromToken = tokenA
  const toToken = tokenB

  const fixedTokenAddress = (fromTokenProp ?? toTokenProp)?.address

  const isFromDisabled =
    fixedTokenAddress !== undefined && fromToken?.address === fixedTokenAddress
  const isToDisabled =
    fixedTokenAddress !== undefined && toToken?.address === fixedTokenAddress

  const actionLabel = useMemo(() => {
    if (actionLabelProp) return actionLabelProp
    if (!fixedTokenAddress) return 'Swap'
    // "Buy" when fixed token is on the "to" side, "Sell" when on "from"
    return toToken?.address === fixedTokenAddress ? 'Buy' : 'Sell'
  }, [actionLabelProp, fixedTokenAddress, toToken])

  const swapParams = useMemo(() => {
    if (!fromToken || !toToken || !fromAmount) return null
    return {
      tokenFrom: fromToken.address,
      tokenTo: toToken.address,
      amount: fromAmount,
      chainIdFrom: Number(fromToken.chainId),
      chainIdTo: Number(toToken.chainId),
      from: activeWallet ?? '',
    }
  }, [fromToken, toToken, fromAmount, activeWallet])

  const { data: quote, isValidating: quoteLoading } = useSwapQuote(swapParams)

  const activeWalletInfo = useMemo(
    () => wallets.find((w) => w.address === activeWallet),
    [wallets, activeWallet],
  )

  const {
    executeTransaction,
    buildTransaction: buildTx,
    isLoading: txLoading,
  } = useExecuteTransaction({
    onSuccess: (result) => {
      console.log('Swap succeeded:', result)
      setFromAmount('')
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Swap failed:', error)
      onError?.(error)
    },
  })

  const handleSwap = useCallback(() => {
    if (!quote || !swapParams || !activeWalletInfo) return

    const { chainType, walletType } = activeWalletInfo
    const provider: 'safe' | 'eoa' | 'solana' =
      chainType === 'solana'
        ? 'solana'
        : walletType === 'smart_wallet'
          ? 'safe'
          : 'eoa'

    const builtTx = buildTx(
      [{ type: 'swap', swapParams, txs: quote.txs }],
      provider,
      swapParams.chainIdFrom,
    )

    void executeTransaction(builtTx)
  }, [quote, swapParams, activeWalletInfo, buildTx, executeTransaction])

  const handleFromTokenChange = useCallback(
    (token: TokenInfo) => {
      if (!isFromDisabled) {
        setTokenA(token)
      }
    },
    [isFromDisabled],
  )

  const handleToTokenChange = useCallback(
    (token: TokenInfo) => {
      if (!isToDisabled) {
        setTokenB(token)
      }
    },
    [isToDisabled],
  )

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value)
  }, [])

  const handleToggle = useCallback(() => {
    setFromAmount('')
    setTokenA(toToken)
    setTokenB(fromToken)
  }, [fromToken, toToken])

  const toAmount = quote?.amountToReceive

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex flex-col items-center gap-4 lg:items-start">
        <SwapPanel
          fromToken={fromToken}
          toToken={toToken}
          toAmount={toAmount}
          isSwapping={txLoading}
          actionLabel={actionLabel}
          onFromTokenChange={!isFromDisabled ? handleFromTokenChange : undefined}
          onToTokenChange={!isToDisabled ? handleToTokenChange : undefined}
          onFromAmountChange={handleFromAmountChange}
          onSwap={handleSwap}
          onToggle={handleToggle}
        />

        {quoteLoading && !quote ? (
          <p className="animate-pulse text-xs text-muted">Fetching quote…</p>
        ) : (
          <div className="w-full space-y-1.5 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-xs text-muted">
            <div className="flex justify-between">
              <span>Fee</span>
              <span className="font-medium text-foreground">
                {formatUsd(Number(quote?.fee?.formatted || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span className="font-medium text-foreground">
                {quote?.impact?.percent || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Slippage</span>
              <span className="font-medium text-foreground">
                {quote?.slippage || 0}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SwapSection
