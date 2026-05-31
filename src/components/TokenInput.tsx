import { FC, useCallback, useMemo, useState } from "react";
import { useAtom } from "jotai";
import type { TokenInfo } from "../types/token";
import type { ChainId } from "../types/tokenList";
import TokenPicker from "./TokenPicker";
import { Icon } from "./Icon";
import { useTokenBalance } from "../hooks/usePortfolio";
import { useTokenPrice } from "../hooks/useTokenPrice";
import { activeWalletAtom } from "../storages/activeWallet";

const EVM_CHAINS: ChainId[] = [42161, 56, 8453]
const SOLANA_CHAINS: ChainId[] = ['solana-mainnet-beta']

function formatUsd(value: number): string {
  if (value === 0) return "$0.00"
  return value >= 0.01
    ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${value.toPrecision(4)}`
}

interface TokenInputProps {
  label: string;
  token?: TokenInfo;
  balance?: string;
  amount?: string;
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
  amount: amountProp,
  placeholder = "0",
  onAmountChange,
  onTokenClick,
  onTokenChange,
  type = "from",
}) => {
  const [internalAmount, setInternalAmount] = useState(token?.amount ?? "");
  const amount = amountProp ?? internalAmount;
  const setAmount = amountProp !== undefined ? undefined : setInternalAmount;
  const [showPicker, setShowPicker] = useState(false);
  const [activeWallet] = useAtom(activeWalletAtom);

  const allowedChains = useMemo<ChainId[] | undefined>(() => {
    if (type !== "from" || activeWallet === null) return undefined
    return activeWallet.startsWith("0x") ? EVM_CHAINS : SOLANA_CHAINS
  }, [type, activeWallet])

  const { data: fetchedBalance } = useTokenBalance(
    undefined,
    balanceProp !== undefined ? undefined : token?.address,
    balanceProp !== undefined ? undefined : token?.chainId,
  );
  const balance = balanceProp ?? fetchedBalance?.balance.formatted ?? "0.00";

  const usdPrice = useTokenPrice(token?.symbol);

  const usdValue = useMemo(() => {
    if (usdPrice === undefined) return null;
    const val = Number(amount);
    if (Number.isNaN(val) || val === 0) return formatUsd(0);
    return formatUsd(val * usdPrice);
  }, [amount, usdPrice]);

  const usdBalance = useMemo(() => {
    if (usdPrice === undefined) return null;
    const val = Number(balance);
    if (Number.isNaN(val) || val === 0) return null;
    return formatUsd(val * usdPrice);
  }, [balance, usdPrice]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^\d*\.?\d*$/.test(val)) {
        setAmount?.(val);
        onAmountChange?.(val);
      }
    },
    [onAmountChange, setAmount],
  );

  const handleMax = useCallback(() => {
    setAmount?.(balance);
    onAmountChange?.(balance);
  }, [balance, onAmountChange, setAmount]);

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
          {isSelected && <>
            Balance:{" "}
            <span className="font-medium text-foreground">{balance}</span>
            {usdBalance !== null && (
              <span className="ml-1 text-muted">({usdBalance})</span>
            )}
          </>}
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
          allowedChains={allowedChains}
        />
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">
          {usdValue ?? <>&nbsp;</>}
        </span>
        {isSelected && Number(balance) > 0 && type === "from" && (
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
