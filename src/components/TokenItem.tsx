import { FC } from "react";
import type { TokenInfo } from "../types/token";
import type { PortfolioTokenWithValue } from "../hooks/usePortfolio";
import { formatUsd } from "../utils/formatters";
import { getChainName } from "../config/chainInfo";
import { Icon } from "./Icon";

export type TokenItemType = "default" | "portfolio";

export interface TokenItemProps {
  token: TokenInfo | PortfolioTokenWithValue;
  type?: TokenItemType;
  selected?: boolean;
  onSelect?: () => void;
}

const DefaultTokenItem: FC<TokenItemProps> = ({
  token,
  selected,
  onSelect,
}) => {
  const t = token as TokenInfo;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
        selected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent/50"
      }`}
    >
      <img
        src={t.logo}
        alt={t.symbol}
        className="h-8 w-8 rounded-full object-contain"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{t.symbol}</span>
          <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
            {getChainName(t.chainId)}
          </span>
        </div>
        <p className="truncate text-xs text-muted">{t.name}</p>
      </div>
      {selected && (
        <Icon name="check" size={14} className="shrink-0 text-primary" />
      )}
    </button>
  );
};

const PortfolioTokenItem: FC<TokenItemProps> = ({ token }) => {
  const t = token as PortfolioTokenWithValue;
  return (
    <div className="break-inside-avoid rounded-xl border border-border bg-card/80 p-4 shadow-md backdrop-blur-xl transition-all hover:border-primary/30 hover:shadow-lg w-full">
      <div className="flex items-center gap-3">
        {t.logoUrl ? (
          <img
            src={t.logoUrl}
            alt={t.symbol}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon name="coins" size={20} className="text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {t.name}
          </p>
          <p className="text-xs text-muted">{t.symbol}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between">
          <span className="text-xs text-muted">Balance</span>
          <span className="text-xs font-medium text-foreground">
            {parseFloat(t.balance.formatted).toLocaleString("en-US", {
              maximumFractionDigits: 6,
            })}{" "}
            {t.symbol}
          </span>
        </div>
        {t.price !== null && (
          <div className="flex justify-between">
            <span className="text-xs text-muted">Price</span>
            <span className="text-xs font-medium text-foreground">
              {formatUsd(t.price)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-xs text-muted">Value</span>
          <span className="text-sm font-semibold text-primary">
            {formatUsd(t.valueUsd)}
          </span>
        </div>
      </div>
    </div>
  );
};

const RENDERERS: Record<TokenItemType, FC<TokenItemProps>> = {
  default: DefaultTokenItem,
  portfolio: PortfolioTokenItem,
};

export const TokenItem: FC<TokenItemProps> = ({
  type = "default",
  ...props
}) => {
  const Renderer = RENDERERS[type];
  return <Renderer {...props} />;
};

export default TokenItem;
