import { FC, useCallback, useState } from 'react'
import type { TokenInfo } from '../types/token'
import TokenInput from './TokenInput'

interface SwapPanelProps {
  fromToken?: TokenInfo
  toToken?: TokenInfo
  fromChainName?: string
  toChainName?: string
  fromBalance?: string
  toBalance?: string
  onFromTokenClick?: () => void
  onToTokenClick?: () => void
  onSwap?: () => void
}

export const SwapPanel: FC<SwapPanelProps> = ({
  fromToken,
  toToken,
  fromChainName,
  toChainName,
  fromBalance = '0.00',
  toBalance = '0.00',
  onFromTokenClick,
  onToTokenClick,
  onSwap,
}) => {
  const [fromAmount, setFromAmount] = useState('')

  const handleFromChange = useCallback((val: string) => {
    setFromAmount(val)
  }, [])

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 p-5 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:p-6">
      {/* From */}
      <TokenInput
        label="Sell"
        token={fromToken}
        chainName={fromChainName}
        balance={fromBalance}
        usdRate="1.00"
        onAmountChange={handleFromChange}
        onTokenClick={onFromTokenClick}
      />

      {/* Swap button */}
      <div className="relative z-10 -my-3 flex justify-center">
        <button
          type="button"
          onClick={onSwap}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:shadow-lg active:scale-95"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </button>
      </div>

      {/* To */}
      <TokenInput
        label="Buy"
        token={toToken}
        chainName={toChainName}
        balance={toBalance}
        placeholder={fromAmount || '0'}
        onTokenClick={onToTokenClick}
      />

      {/* Action button */}
      <button
        type="button"
        onClick={onSwap}
        className="mt-5 w-full rounded-2xl bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
      >
        Connect Wallet
      </button>
    </div>
  )
}

export default SwapPanel
