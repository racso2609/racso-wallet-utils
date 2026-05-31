import { FC, useCallback, useState } from "react";
import type { TokenInfo } from "../types/token";
import TokenInput from "./TokenInput";
import { Icon } from "./Icon";

interface SwapPanelProps {
  fromToken?: TokenInfo;
  toToken?: TokenInfo;
  fromBalance?: string;
  toBalance?: string;
  onFromTokenClick?: () => void;
  onToTokenClick?: () => void;
  onFromTokenChange?: (token: TokenInfo) => void;
  onToTokenChange?: (token: TokenInfo) => void;
  onSwap?: () => void;
  onFromAmountChange?: (value: string) => void;
}

export const SwapPanel: FC<SwapPanelProps> = ({
  fromToken: initialFromToken,
  toToken: initialToToken,
  fromBalance = "0.00",
  toBalance = "0.00",
  onFromTokenClick,
  onToTokenClick,
  onFromTokenChange,
  onToTokenChange,
  onSwap,
  onFromAmountChange,
}) => {
  const [swapped, setSwapped] = useState(false);
  const [fromAmount, setFromAmount] = useState("");

  const fromToken = swapped ? initialToToken : initialFromToken;
  const toToken = swapped ? initialFromToken : initialToToken;

  const handleToggle = useCallback(() => {
    setSwapped((prev) => !prev);
    setFromAmount("");
    onSwap?.();
  }, [onSwap]);

  const handleFromChange = useCallback((val: string) => {
    setFromAmount(val);
    onFromAmountChange?.(val);
  }, [onFromAmountChange]);

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 p-5 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:p-6">
      {/* From */}
      <TokenInput
        label="Sell"
        token={fromToken}
        balance={swapped ? toBalance : fromBalance}
        usdRate="1.00"
        onAmountChange={handleFromChange}
        onTokenClick={swapped ? onToTokenClick : onFromTokenClick}
        onTokenChange={swapped ? onToTokenChange : onFromTokenChange}
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
        balance={swapped ? fromBalance : toBalance}
        placeholder={fromAmount || "0"}
        onTokenClick={swapped ? onFromTokenClick : onToTokenClick}
        onTokenChange={swapped ? onFromTokenChange : onToTokenChange}
        type="to"
      />

      {/* Action button */}
      <button
        type="button"
        onClick={onSwap}
        className="mt-5 w-full rounded-2xl bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
      >
        Buy Etf
      </button>
    </div>
  );
};

export default SwapPanel;
