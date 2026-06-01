import { FC, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { XSTOCKS_PRODUCTS } from "../../src/utils/xstocksProducts";
import { ETF_SUPPORTED_CHAINS } from "../../src/types/etf";
import { getFirstSupportedChain, toTokenInfo } from "../../src/utils/stocks";
import CopyButton from "../../src/components/CopyButton";
import SwapSection from "../../src/components/SwapSection";
import Icon from "../../src/components/Icon";

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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* Left: ETF Info */}
          <div className="flex flex-col gap-6">
            {/* Header Card */}
            <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl sm:p-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
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
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Contract Addresses
              </h2>
              {supportedAddresses.map(([chain, address]) => {
                const isSelected = chain === selectedChain;
                return (
                  <div
                    key={chain}
                    className={`flex flex-col items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4 ${
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-card/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {chain}
                        </span>
                        {isSelected && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 truncate font-mono text-sm text-foreground">
                        {address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChain(chain);
                          }}
                          className="rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-muted transition-all hover:bg-primary/10 hover:text-primary"
                        >
                          Select
                        </button>
                      )}
                      <CopyButton text={address} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Swap Panel */}
          <div className="flex h-full w-full">
            <SwapSection
              toToken={etfToken ?? undefined}
              onSuccess={() => {
                console.log("ETF purchase succeeded");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtfDetail;
