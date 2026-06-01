import { FC } from "react";
import { usePortfolioAllWallets } from "../hooks/usePortfolio";
import { formatUsd } from "../utils/formatters";
import { Icon } from "./Icon";
import TokenItem from "./TokenItem";

export const PortfolioSection: FC = () => {
  const { data: tokens, isValidating } = usePortfolioAllWallets();

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
    <div className="mb-8 space-y-4">
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

      {/* Masonry Grid */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 gap-y-0.5">
        {tokens
          .filter((t) => BigInt(t.balance.raw) > 0n)
          .map((token) => (
            <div
              key={`${String(token.chainId)}-${token.address}`}
              className="flex-1 flex"
            >
              <TokenItem token={token} type="portfolio" />
            </div>
          ))}
      </div>
    </div>
  );
};

export default PortfolioSection;
