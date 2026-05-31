import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { TokenInfo } from "../types/token";
import { useAllTokens } from "../hooks/useTokens";
import { getChainName } from "../config/chainInfo";
import { Icon } from "./Icon";

interface TokenPickerProps {
  tokens?: TokenInfo[];
  selectedToken?: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  onClose: () => void;
}

export const TokenPicker: FC<TokenPickerProps> = ({
  tokens: tokensProp,
  selectedToken,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState<number | null>(null);

  const chainTokens = useAllTokens();
  const tokens = useMemo(
    () => tokensProp ?? chainTokens.map((t) => ({ ...t, logo: t.logoUrl })),
    [tokensProp, chainTokens],
  );

  const chains = useMemo(() => {
    const ids = new Set(tokens.map((t) => t.chainId));
    return Array.from(ids).sort((a, b) => a - b);
  }, [tokens]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tokens.filter((t) => {
      if (chainFilter !== null && t.chainId !== chainFilter) return false;
      if (!q) return true;
      return (
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
      );
    });
  }, [tokens, search, chainFilter]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ">
      <div
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-2xl sm:p-8"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Select Token</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, symbol, or address"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full rounded-2xl border border-border/60 bg-muted/50 px-5 py-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/20"
            autoFocus
          />
        </div>

        {chains.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setChainFilter(null);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                chainFilter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted hover:text-foreground"
              }`}
            >
              All
            </button>
            {chains.map((cid) => (
              <button
                key={cid}
                type="button"
                onClick={() => {
                  setChainFilter(cid);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  chainFilter === cid
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted hover:text-foreground"
                }`}
              >
                {getChainName(cid)}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <Icon name="search" size={40} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">No tokens found</p>
              <p className="mt-1 text-xs opacity-70">
                Try searching with a different term
              </p>
            </div>
          ) : (
            filtered.map((token) => (
              <button
                key={token.address}
                type="button"
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all ${
                  selectedToken?.address === token.address
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-accent/50"
                }`}
              >
                <img
                  src={token.logo}
                  alt={token.symbol}
                  className="h-10 w-10 rounded-full object-contain ring-2 ring-border/40"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {token.symbol}
                    </span>
                    <span className="text-[10px] font-medium uppercase text-muted">
                      {getChainName(token.chainId)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {token.name}
                  </p>
                </div>
                {selectedToken?.address === token.address && (
                  <Icon
                    name="check"
                    size={16}
                    className="shrink-0 text-primary"
                  />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TokenPicker;
