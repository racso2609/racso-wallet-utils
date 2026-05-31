import { FC, useCallback, useMemo, useState } from "react";
import type { TokenInfo } from "../types/token";
import TokenPicker from "./TokenPicker";
import { Icon } from "./Icon";
import { useTokenBalance } from "../hooks/usePortfolio";

interface TokenInputProps {
  label: string;
  token?: TokenInfo;
  balance?: string;
  usdRate?: string;
  placeholder?: string;
  onAmountChange?: (value: string) => void;
  onTokenClick?: () => void;
  onTokenChange?: (newToken: TokenInfo) => void;
  type?: "from" | "to";
}

export const TokenInput: FC<TokenInputProps> = ({
  label,
  token,
  balance: balanceProp,
  usdRate = "1.00",
  placeholder = "0",
  onAmountChange,
  onTokenClick,
  onTokenChange,
  type = "from",
}) => {
  const [amount, setAmount] = useState(token?.amount ?? "");
  const [showPicker, setShowPicker] = useState(false);

  const { data: fetchedBalance } = useTokenBalance(
    undefined,
    balanceProp !== undefined ? undefined : token?.address,
    balanceProp !== undefined ? undefined : token?.chainId,
  );
  const balance = balanceProp ?? fetchedBalance?.balance ?? "0.00";

  const usdValue = useMemo(() => {
    const val = Number(amount);
    if (Number.isNaN(val) || val === 0) return "$0.00";
    const rate = Number(usdRate);
    const total = val * (Number.isNaN(rate) ? 1 : rate);
    return `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [amount, usdRate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^\d*\.?\d*$/.test(val)) {
        setAmount(val);
        onAmountChange?.(val);
      }
    },
    [onAmountChange],
  );

  const handleMax = useCallback(() => {
    setAmount(balance);
    onAmountChange?.(balance);
  }, [balance, onAmountChange]);

  const openPicker = useCallback(() => {
    if (onTokenChange) {
      setShowPicker(true);
    }
    onTokenClick?.();
  }, [onTokenClick, onTokenChange]);

  const handleSelectToken = useCallback(
    (selectedToken: TokenInfo) => {
      setShowPicker(false);
      onTokenChange?.(selectedToken);
    },
    [onTokenChange],
  );

  const isSelected = Boolean(token);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span className="text-xs text-muted">
          {isSelected && type === "from" && (
            <>
              Balance:{" "}
              <span className="font-medium text-foreground">{balance}</span>
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={amount}
          onChange={handleChange}
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-gray-6"
        />

        {token ? (
          <button
            type="button"
            onClick={openPicker}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 transition-colors hover:bg-card/80"
          >
            <img
              src={token.logo}
              alt={token.symbol}
              className="h-7 w-7 rounded-full object-contain"
              loading="lazy"
            />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-semibold text-foreground">
                {token.symbol}
              </span>
            </div>
            <Icon name="chevron-down" size={12} className="ml-1 text-muted" />
          </button>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            SELECT TOKEN
            <Icon name="arrow-right" size={12} />
          </button>
        )}
      </div>

      {showPicker && (
        <TokenPicker
          selectedToken={token}
          onSelect={handleSelectToken}
          onClose={() => {
            setShowPicker(false);
          }}
        />
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">{usdValue}</span>
        {isSelected && Number(balance) > 0 && (
          <button
            type="button"
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            onClick={handleMax}
          >
            Max
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenInput;
