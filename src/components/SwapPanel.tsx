import { FC, useCallback, useState } from "react";
import type { TokenInfo } from "../types/token";
import TokenInput from "./TokenInput";
import { Icon } from "./Icon";

interface SwapPanelProps {
  fromToken?: TokenInfo;
  toToken?: TokenInfo;
  fromBalance?: string;
  toBalance?: string;
  toAmount?: string;
  isSwapping?: boolean;
  actionLabel?: string;
  onFromTokenClick?: () => void;
  onToTokenClick?: () => void;
  onFromTokenChange?: (token: TokenInfo) => void;
  onToTokenChange?: (token: TokenInfo) => void;
  onSwap?: () => void;
  onFromAmountChange?: (value: string) => void;
  onToggle?: () => void;
}

export const SwapPanel: FC<SwapPanelProps> = ({
  fromToken,
  toToken,
  fromBalance,
  toBalance,
  toAmount,
  isSwapping = false,
  actionLabel = "Swap",
  onFromTokenClick,
  onToTokenClick,
  onFromTokenChange,
  onToTokenChange,
  onSwap,
  onFromAmountChange,
  onToggle,
}) => {
  const [fromAmount, setFromAmount] = useState("");

  const handleToggle = useCallback(() => {
    setFromAmount("");
    onToggle?.();
  }, [onToggle]);

  const handleFromChange = useCallback(
    (val: string) => {
      setFromAmount(val);
      onFromAmountChange?.(val);
    },
    [onFromAmountChange],
  );

  return (
    <div className="relative w-full rounded-3xl border border-border bg-card/80 p-5 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:p-6">
      {/* From */}
      <TokenInput
        label="Sell"
        token={fromToken}
        balance={fromBalance}
        onAmountChange={handleFromChange}
        onTokenClick={onFromTokenClick}
        onTokenChange={onFromTokenChange}
      />

      {/* Swap button */}
      <div className="relative z-10 -my-3 flex justify-center">
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:shadow-lg hover:rotate-180 active:scale-95"
          title="Swap tokens"
        >
          <Icon name="arrow-down" size={16} className="text-foreground" />
        </button>
      </div>

      {/* To */}
      <TokenInput
        label="Buy"
        token={toToken}
        balance={toBalance}
        amount={toAmount}
        placeholder={fromAmount || "0"}
        onTokenClick={onToTokenClick}
        onTokenChange={onToTokenChange}
        type="to"
      />

      {/* Action button */}
      <button
        type="button"
        onClick={onSwap}
        disabled={isSwapping}
        className="mt-5 w-full rounded-2xl bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSwapping ? "Processing…" : actionLabel}
      </button>
    </div>
  );
};

export default SwapPanel;
