import { FC, useCallback, useMemo, useState } from 'react'
import type { EtfProduct } from '../types/etf'

interface TokenInputProps {
  label: string
  token: EtfProduct
  chain: string
  balance?: string
  usdRate?: string
  onAmountChange?: (value: string) => void
  onTokenClick?: () => void
}

export const TokenInput: FC<TokenInputProps> = ({
  label,
  token,
  chain,
  balance = '0.00',
  usdRate = '1.00',
  onAmountChange,
  onTokenClick,
}) => {
  const [amount, setAmount] = useState('')

  const usdValue = useMemo(() => {
    const val = Number(amount)
    if (Number.isNaN(val) || val === 0) return '$0.00'
    const rate = Number(usdRate)
    const total = val * (Number.isNaN(rate) ? 1 : rate)
    return `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [amount, usdRate])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      // Allow only numbers and one decimal point
      if (/^\d*\.?\d*$/.test(val)) {
        setAmount(val)
        onAmountChange?.(val)
      }
    },
    [onAmountChange],
  )

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      {/* Top row: label + balance */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="text-xs text-muted">
          Balance:{' '}
          <span className="font-medium text-foreground">{balance}</span>
        </span>
      </div>

      {/* Middle row: input + token selector */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={handleChange}
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-gray-6"
        />

        <button
          type="button"
          onClick={onTokenClick}
          className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 transition-colors hover:bg-card/80"
        >
          <img
            src={token.iconUrl}
            alt={token.symbol}
            className="h-7 w-7 rounded-full object-contain"
            loading="lazy"
          />
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm font-semibold text-foreground">
              {token.symbol}
            </span>
            <span className="mt-0.5 text-[10px] uppercase text-muted">
              {chain}
            </span>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 text-muted"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Bottom row: USD value */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">{usdValue}</span>
        {Number(balance) > 0 && (
          <button
            type="button"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            onClick={() => {
              setAmount(balance)
              onAmountChange?.(balance)
            }}
          >
            Max
          </button>
        )}
      </div>
    </div>
  )
}

export default TokenInput
