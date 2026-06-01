import { FC, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { XSTOCKS_PRODUCTS } from "../../src/utils/xstocksProducts";
import { ETF_SUPPORTED_CHAINS } from "../../src/types/etf";
import { getFirstSupportedChain, toTokenInfo } from "../../src/utils/stocks";
import CopyButton from "../../src/components/CopyButton";
import SwapPanel from "../../src/components/SwapPanel";
import Icon from "../../src/components/Icon";
import { useSwapQuote } from "../../src/hooks/useSwapQuote";
import { useExecuteTransaction } from "../../src/hooks/useExecuteTransaction";
import { useAtom, useAtomValue } from "jotai";
import { activeWalletAtom, walletsAtom } from "../../src/storages/activeWallet";
import type { TokenInfo } from "../../src/types/token";

const EtfDetail: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const product = XSTOCKS_PRODUCTS.find((p) => p.slug === slug);

  // Compute etfToken early so hooks below can reference it
  const firstChain = product ? getFirstSupportedChain(product) : "";
  const [selectedChain, setSelectedChain] = useState<string>(firstChain);

  const selectedAddress = product
    ? (product.addresses[selectedChain as keyof typeof product.addresses] ?? "")
    : "";

  const etfToken =
    product && selectedAddress
      ? toTokenInfo(product, selectedAddress, selectedChain)
      : null;

  const [fromToken, setFromToken] = useState<TokenInfo | undefined>(undefined);
  const [fromAmount, setFromAmount] = useState("");

  const swapParams = useMemo(() => {
    if (!fromToken || !fromAmount || !etfToken) return null;

    return {
      tokenFrom: fromToken.address,
      tokenTo: etfToken.address,
      amount: fromAmount,
      chainIdFrom: Number(fromToken.chainId),
      chainIdTo: Number(etfToken.chainId),
      from: "",
    };
  }, [fromToken, fromAmount, etfToken]);

  const { data: quote, isValidating: quoteLoading } = useSwapQuote(swapParams);

  const [activeWallet] = useAtom(activeWalletAtom);
  const wallets = useAtomValue(walletsAtom);

  const activeWalletInfo = useMemo(
    () =>
      wallets.find(
        (w: { address: string | null }) => w.address === activeWallet,
      ),
    [wallets, activeWallet],
  );

  const {
    executeTransaction,
    buildTransaction: buildTx,
    isLoading: txLoading,
  } = useExecuteTransaction({
    onSuccess: (result) => {
      console.log("Swap succeeded:", result);
    },
    onError: (error) => {
      console.error("Swap failed:", error);
    },
  });

  const handleSwapVoid = useCallback(() => {
    if (!quote || !swapParams || !activeWalletInfo) return;

    const { walletType } = activeWalletInfo;

    const provider: "safe" | "eoa" =
      walletType === "smart_wallet" ? "safe" : "eoa";
    const builtTx = buildTx(
      [
        {
          type: "swap",
          swapParams,
          txs: quote.txs,
          chainId: swapParams.chainIdFrom,
        },
      ],
      provider,
    );

    void executeTransaction(builtTx);
  }, [quote, swapParams, activeWalletInfo, buildTx, executeTransaction]);

  const handleFromTokenChange = useCallback((token: TokenInfo) => {
    setFromToken(token);
  }, []);

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
  }, []);

  if (!product) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">ETF Not Found</h1>
          <p className="mt-2 text-sm text-muted">
            The requested ETF does not exist.
          </p>
          <button
            onClick={() => {
              void navigate("/");
            }}
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const supportedAddresses = ETF_SUPPORTED_CHAINS.map(
    (chain) => [chain, product.addresses[chain]] as const,
  )
    .filter(([, address]) => address !== null)
    .map(([chain, address]) => [chain, address] as [string, string]);

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Back */}
        <button
          onClick={() => {
            void navigate(-1);
          }}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" />
          Back
        </button>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          {/* Left: ETF Info */}
          <div className="space-y-6">
            {/* Header Card */}
            <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl sm:p-8">
              <div className="flex items-start gap-5">
                <img
                  src={product.iconUrl}
                  alt={product.name}
                  className="h-16 w-16 shrink-0 rounded-xl object-contain sm:h-20 sm:w-20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {product.name}
                    </h1>
                    <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                      {product.symbol}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {supportedAddresses.length} chain
                    {supportedAddresses.length === 1 ? "" : "s"} available
                  </p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Contract Addresses
              </h2>
              {supportedAddresses.map(([chain, address]) => {
                const isSelected = chain === selectedChain;
                return (
                  <div
                    key={chain}
                    className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-card/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium uppercase text-muted">
                        {chain}
                      </span>
                      <p className="mt-0.5 truncate font-mono text-sm text-foreground">
                        {address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChain(chain);
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-muted hover:bg-card/80"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                      <CopyButton text={address} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Swap Panel */}
          <div className="flex flex-col items-center gap-4 lg:items-end">
            <SwapPanel
              fromToken={fromToken}
              toToken={etfToken ?? undefined}
              toAmount={quote?.amountToReceive}
              onFromTokenChange={handleFromTokenChange}
              onFromAmountChange={handleFromAmountChange}
              onSwap={handleSwapVoid}
              isSwapping={txLoading}
            />

            {quoteLoading && (
              <p className="text-xs text-muted animate-pulse">
                Fetching quote…
              </p>
            )}

            {quote && (
              <div className="w-full max-w-md space-y-1.5 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Fee</span>
                  <span className="font-medium text-foreground">
                    ${quote.fee.formatted}
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
      </div>
    </div>
  );
};

export default EtfDetail;
