import { FC, useCallback, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { useSwapQuote } from "../hooks/useSwapQuote";
import { useExecuteTransaction } from "../hooks/useExecuteTransaction";
import { activeWalletAtom, walletsAtom } from "../storages/activeWallet";
import SwapPanel from "./SwapPanel";
import { formatUsd } from "../utils/formatters";
import type { TokenInfo } from "../types/token";
import type { SwapParams } from "../services/swap.types";

export const SwapSection: FC = () => {
  const [activeWallet] = useAtom(activeWalletAtom);
  const [wallets] = useAtom(walletsAtom);

  const [fromToken, setFromToken] = useState<TokenInfo | undefined>(undefined);
  const [toToken, setToToken] = useState<TokenInfo | undefined>(undefined);
  const [fromAmount, setFromAmount] = useState("");

  const swapParams = useMemo<SwapParams | null>(() => {
    if (!fromToken || !toToken || !fromAmount || !activeWallet) return null;
    return {
      tokenFrom: fromToken.address,
      tokenTo: toToken.address,
      amount: fromAmount,
      chainIdFrom: Number(fromToken.chainId),
      chainIdTo: Number(toToken.chainId),
      from: activeWallet,
    };
  }, [fromToken, toToken, fromAmount, activeWallet]);

  const { data: quote, isValidating: quoteLoading } = useSwapQuote(swapParams);

  const activeWalletInfo = useMemo(
    () => wallets.find((w) => w.address === activeWallet),
    [wallets, activeWallet],
  );

  const { executeTransaction, buildTransaction: buildTx, isLoading: txLoading } = useExecuteTransaction({
    onSuccess: (result) => {
      console.log("Swap succeeded:", result);
      setFromAmount("");
    },
    onError: (error) => {
      console.error("Swap failed:", error);
    },
  });

  const handleSwap = useCallback(() => {
    if (!quote || !swapParams || !activeWalletInfo) return;

    const { chainType, walletType } = activeWalletInfo;
    if (chainType === "solana") {
      console.error("Solana swaps not yet supported");
      return;
    }

    const provider = walletType === "smart_wallet" ? "safe" : "eoa";
    const builtTx = buildTx(
      [{ type: "swap", swapParams, txs: quote.txs }],
      provider,
      swapParams.chainIdFrom,
    );

    void executeTransaction(builtTx);
  }, [quote, swapParams, activeWalletInfo, buildTx, executeTransaction]);

  const handleFromTokenChange = useCallback(
    (token: TokenInfo) => {
      setFromToken(token);
    },
    [],
  );

  const handleToTokenChange = useCallback(
    (token: TokenInfo) => {
      setToToken(token);
    },
    [],
  );

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
  }, []);

  const toAmount = quote?.amountToReceive;

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Swap Tokens
      </h2>
      <div className="flex flex-col items-center gap-4 lg:items-start">
        <SwapPanel
          fromToken={fromToken}
          toToken={toToken}
          toAmount={toAmount}
          isSwapping={txLoading}
          onFromTokenChange={handleFromTokenChange}
          onToTokenChange={handleToTokenChange}
          onFromAmountChange={handleFromAmountChange}
          onSwap={handleSwap}
        />

        {quoteLoading && (
          <p className="text-xs text-muted animate-pulse">Fetching quote…</p>
        )}

        {quote && (
          <div className="w-full max-w-md space-y-1.5 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-xs text-muted">
            <div className="flex justify-between">
              <span>Fee</span>
              <span className="font-medium text-foreground">
                {formatUsd(Number(quote.fee.formatted))}
              </span>
            </div>
            {quote.impact && (
              <div className="flex justify-between">
                <span>Price Impact</span>
                <span className="font-medium text-foreground">
                  {quote.impact.percent}%
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Slippage</span>
              <span className="font-medium text-foreground">
                {quote.slippage}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapSection;
