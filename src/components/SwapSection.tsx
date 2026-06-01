import { FC, useCallback, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useSwapQuote } from "../hooks/useSwapQuote";
import { useExecuteTransaction } from "../hooks/useExecuteTransaction";
import { activeWalletAtom, walletsAtom } from "../storages/activeWallet";
import SwapPanel from "./SwapPanel";
import { formatUsd } from "../utils/formatters";
import type { TokenInfo } from "../types/token";

export interface SwapSectionProps {
  /** Pre-selected destination token (e.g. ETF). When provided, the buy side is read-only. */
  toToken?: TokenInfo;
  /** Button text — defaults to "Swap" */
  actionLabel?: string;
  /** Called when a swap succeeds */
  onSuccess?: () => void;
  /** Called when a swap fails */
  onError?: (error: Error) => void;
}

export const SwapSection: FC<SwapSectionProps> = ({
  toToken: fixedToToken,
  actionLabel = "Swap",
  onSuccess,
  onError,
}) => {
  const [activeWallet] = useAtom(activeWalletAtom);
  const wallets = useAtomValue(walletsAtom);

  const [fromToken, setFromToken] = useState<TokenInfo | undefined>(undefined);
  const [userToToken, setUserToToken] = useState<TokenInfo | undefined>(
    undefined,
  );
  const [fromAmount, setFromAmount] = useState("");

  const toToken = fixedToToken ?? userToToken;

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
      chainType === "solana" ? "solana" : walletType === "smart_wallet" ? "safe" : "eoa";

    const builtTx = buildTx(
      [{ type: "swap", swapParams, txs: quote.txs }],
      provider,
      swapParams.chainIdFrom,
    );

    void executeTransaction(builtTx);
  }, [quote, swapParams, activeWalletInfo, buildTx, executeTransaction]);

  const handleFromTokenChange = useCallback((token: TokenInfo) => {
    setFromToken(token);
  }, []);

  const handleToTokenChange = useCallback((token: TokenInfo) => {
    setUserToToken(token);
  }, []);

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
  }, []);

  const handleToggle = useCallback(() => {
    setFromToken(toToken);
    if (!fixedToToken) {
      setUserToToken(fromToken);
    }
    setFromAmount("");
  }, [fromToken, toToken, fixedToToken]);

  const toAmount = quote?.amountToReceive;

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
          onToTokenChange={fixedToToken ? undefined : handleToTokenChange}
          onFromAmountChange={handleFromAmountChange}
          onSwap={handleSwap}
          onToggle={fixedToToken ? undefined : handleToggle}
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
