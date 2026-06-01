import { FC, useCallback, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useSwapQuote } from "../hooks/useSwapQuote";
import { useExecuteTransaction } from "../hooks/useExecuteTransaction";
import { activeWalletAtom, walletsAtom } from "../storages/activeWallet";
import SwapPanel from "./SwapPanel";
import { formatUsd } from "../utils/formatters";
import type { TokenInfo } from "../types/token";

export interface SwapSectionProps {
  /** Token that stays fixed when toggling (e.g. ETF). When provided, toggle moves it between buy/sell. */
  fixedToken?: TokenInfo;
  /** Which side the fixed token starts on. Defaults to "buy" (fixed token is destination). */
  fixedTokenSide?: "buy" | "sell";
  /** Overrides the action button text. When omitted, defaults to "Buy"/"Sell" with fixed token, or "Swap" without. */
  actionLabel?: string;
  /** Called when a swap succeeds */
  onSuccess?: () => void;
  /** Called when a swap fails */
  onError?: (error: Error) => void;
}

export const SwapSection: FC<SwapSectionProps> = ({
  fixedToken,
  fixedTokenSide = "buy",
  actionLabel: actionLabelProp,
  onSuccess,
  onError,
}) => {
  const [activeWallet] = useAtom(activeWalletAtom);
  const wallets = useAtomValue(walletsAtom);

  const [freeToken, setFreeToken] = useState<TokenInfo | undefined>(undefined);
  const [mode, setMode] = useState<"buy" | "sell">(fixedTokenSide);
  const [fromAmount, setFromAmount] = useState("");

  const fromToken = fixedToken ? (mode === "buy" ? freeToken : fixedToken) : undefined;
  const toToken = fixedToken ? (mode === "buy" ? fixedToken : freeToken) : undefined;

  const swapParams = useMemo(() => {
    if (!fromToken || !toToken || !fromAmount) return null;
    return {
      tokenFrom: fromToken.address,
      tokenTo: toToken.address,
      amount: fromAmount,
      chainIdFrom: Number(fromToken.chainId),
      chainIdTo: Number(toToken.chainId),
      from: activeWallet ?? "",
    };
  }, [fromToken, toToken, fromAmount, activeWallet]);

  const { data: quote, isValidating: quoteLoading } = useSwapQuote(swapParams);

  const activeWalletInfo = useMemo(
    () => wallets.find((w) => w.address === activeWallet),
    [wallets, activeWallet],
  );

  const {
    executeTransaction,
    buildTransaction: buildTx,
    isLoading: txLoading,
  } = useExecuteTransaction({
    onSuccess: (result) => {
      console.log("Swap succeeded:", result);
      setFromAmount("");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Swap failed:", error);
      onError?.(error);
    },
  });

  const handleSwap = useCallback(() => {
    if (!quote || !swapParams || !activeWalletInfo) return;

    const { chainType, walletType } = activeWalletInfo;
    const provider: "safe" | "eoa" | "solana" =
      chainType === "solana"
        ? "solana"
        : walletType === "smart_wallet"
          ? "safe"
          : "eoa";

    const builtTx = buildTx(
      [{ type: "swap", swapParams, txs: quote.txs }],
      provider,
      swapParams.chainIdFrom,
    );

    void executeTransaction(builtTx);
  }, [quote, swapParams, activeWalletInfo, buildTx, executeTransaction]);

  const handleFromTokenChange = useCallback(
    (token: TokenInfo) => {
      if (fixedToken && mode === "buy") {
        setFreeToken(token);
      } else {
        // free swap or sell mode — from side is free
        setFreeToken(token);
      }
    },
    [fixedToken, mode],
  );

  const handleToTokenChange = useCallback(
    (token: TokenInfo) => {
      if (fixedToken && mode === "sell") {
        setFreeToken(token);
      } else {
        // free swap or buy mode — to side is free
        setFreeToken(token);
      }
    },
    [fixedToken, mode],
  );

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
  }, []);

  const handleToggle = useCallback(() => {
    setMode((prev) => (prev === "buy" ? "sell" : "buy"));
    setFreeToken(undefined);
    setFromAmount("");
  }, []);

  const toAmount = quote?.amountToReceive;

  const isFreeSwap = !fixedToken;
  const actionLabel =
    actionLabelProp ?? (fixedToken ? (mode === "buy" ? "Buy" : "Sell") : "Swap");

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col items-center gap-4 lg:items-start">
        <SwapPanel
          fromToken={fromToken}
          toToken={toToken}
          toAmount={toAmount}
          isSwapping={txLoading}
          actionLabel={actionLabel}
          onFromTokenChange={handleFromTokenChange}
          onToTokenChange={isFreeSwap ? handleToTokenChange : undefined}
          onFromAmountChange={handleFromAmountChange}
          onSwap={handleSwap}
          onToggle={handleToggle}
        />

        {quoteLoading && !quote ? (
          <p className="text-xs text-muted animate-pulse">Fetching quote…</p>
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
  );
};

export default SwapSection;
