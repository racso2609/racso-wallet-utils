import { FC } from "react";
import { useAtom } from "jotai";
import { usePortfolioAllWallets } from "../hooks/usePortfolio";
import { walletsAtom } from "../storages/activeWallet";
import { formatUsd } from "../utils/formatters";
import { Icon } from "./Icon";
import TokenItem from "./TokenItem";

export const PortfolioSection: FC = () => {
  const { data: tokens, isValidating } = usePortfolioAllWallets();
  const [wallets] = useAtom(walletsAtom);

  const totalValue = tokens?.reduce((sum, t) => sum + t.valueUsd, 0) ?? 0;

  if (isValidating && !tokens) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl">
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Total Value Card */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted">
              Total Portfolio Value
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {formatUsd(totalValue)}
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="wallet" size={24} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Masonry Token Grid */}
      <div className="flex gap-4 overflow-x-auto h-[200px] items-center ">
        {!tokens.length && (
          <p className="text-sm text-muted animate-pulse">
            No tokens with balance found.
          </p>
        )}

        {tokens
          .filter((t) => BigInt(t.balance.raw) > 0n)
          .map((token) => (
            <div
              key={`${String(token.chainId)}-${token.address}`}
              className="mb-3 min-w-[200px] max-w-[200px] flex "
            >
              <TokenItem token={token} type="portfolio" />
            </div>
          ))}
      </div>

      {/* Wallet Summary */}
      {wallets.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-lg shadow-primary/5 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="wallet" size={16} className="text-muted" />
            <h3 className="text-sm font-semibold text-foreground">Wallets</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {wallets.map((w) => (
              <div
                key={w.address}
                className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs border border-border"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    w.chainType === "solana" ? "bg-purple-400" : "bg-blue-400"
                  }`}
                />
                <span className="font-mono text-muted">
                  {w.address.slice(0, 6)}…{w.address.slice(-4)}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                  {w.chainType}
                </span>
                {w.walletType === "smart_wallet" && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary">
                    Smart
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSection;
