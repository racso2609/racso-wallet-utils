import { useCallback } from "react";
import { useAtom } from "jotai";
import { useSWRConfig } from "swr";
import useCustomFetch from "./utils/useCustomFetch";
import type { ChainId } from "../types/tokenList";
import {
  getPortfolioForAllChains as fetchPortfolioForAllChains,
  getTokenBalance as fetchTokenBalance,
  PortfolioToken,
} from "../services/AlchemyService";
import { activeWalletAtom } from "../storages/activeWallet";

export function usePortfolio(address?: string) {
  const [activeWallet] = useAtom(activeWalletAtom);
  const resolvedAddress = address ?? activeWallet ?? undefined;

  const key =
    resolvedAddress !== undefined ? `portfolio_${resolvedAddress}` : null;

  const fetcher = useCallback(async (): Promise<PortfolioToken[]> => {
    if (resolvedAddress === undefined) return [];
    return await fetchPortfolioForAllChains(resolvedAddress);
  }, [resolvedAddress]);

  return useCustomFetch<PortfolioToken[]>({ url: key, fetcher });
}

export function useTokenBalance(
  address?: string,
  tokenAddress?: string,
  chainId?: ChainId,
) {
  const [activeWallet] = useAtom(activeWalletAtom);
  const resolvedAddress = address ?? activeWallet ?? undefined;

  const key =
    resolvedAddress !== undefined &&
    tokenAddress !== undefined &&
    chainId !== undefined
      ? `tokenBalance_${resolvedAddress}_${String(chainId)}_${tokenAddress}`
      : null;

  const { cache } = useSWRConfig();
  const portfolioKey =
    resolvedAddress !== undefined ? `portfolio_${resolvedAddress}` : null;

  const fetcher = useCallback(async (): Promise<PortfolioToken | null> => {
    if (
      resolvedAddress === undefined ||
      tokenAddress === undefined ||
      chainId === undefined
    )
      return null;

    if (portfolioKey !== null) {
      const cached = cache.get(portfolioKey);
      if (cached?.data !== undefined) {
        const portfolio = cached.data as PortfolioToken[];
        const match = portfolio.find(
          (t) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
        );
        if (match !== undefined) return match;
      }
    }
    if (typeof chainId === 'number') {
      return fetchTokenBalance(resolvedAddress, tokenAddress, chainId);
    }
    return null;
  }, [resolvedAddress, tokenAddress, chainId, portfolioKey, cache]);

  return useCustomFetch<PortfolioToken | null>({ url: key, fetcher });
}
