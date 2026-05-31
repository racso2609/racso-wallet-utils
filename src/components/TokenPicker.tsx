import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { TokenInfo } from "../types/token";
import { useAllTokens } from "../hooks/useTokens";
import { getChainName } from "../config/chainInfo";
import { Icon } from "./Icon";
import { TokenItem } from "./TokenItem";

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[80vh] w-full max-w-sm flex-col rounded-3xl border border-border/60 bg-card p-5 shadow-2xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Select Token</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Search name or symbol"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full rounded-xl border border-border/60 bg-muted/50 px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-primary/50 focus:bg-background focus:ring-1 focus:ring-primary/20"
            autoFocus
          />
        </div>

        {chains.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setChainFilter(null);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
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
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
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

        <div className="token-list flex-1 -mr-1 space-y-0.5 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted">
              <Icon name="search" size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">No tokens found</p>
              <p className="mt-0.5 text-xs opacity-70">
                Try another search term
              </p>
            </div>
          ) : (
            filtered.map((token) => (
              <TokenItem
                key={token.address}
                token={token}
                selected={selectedToken?.address === token.address}
                onSelect={() => {
                  onSelect(token);
                  onClose();
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TokenPicker;
