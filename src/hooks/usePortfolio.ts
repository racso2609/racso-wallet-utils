import { useCallback } from "react";
import { useAtom } from "jotai";
import { formatUnits } from "viem";
import useCustomFetch from "./utils/useCustomFetch";
import type { ChainId } from "../types/tokenList";
import {
  getPortfolioForAllChains as fetchPortfolioForAllChains,
  getTokenBalance as fetchTokenBalance,
  PortfolioToken,
} from "../services/AlchemyService";
import { activeWalletAtom } from "../storages/activeWallet";

export interface TokenBalanceInfo {
  raw: string;
  formatted: string;
  decimals: number;
}

export interface PortfolioTokenEnriched {
  address: string;
  symbol: string;
  name: string;
  logoUrl: string | null;
  chainId: number;
  balance: TokenBalanceInfo;
}

function enrichToken(token: PortfolioToken): PortfolioTokenEnriched {
  return {
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    logoUrl: token.logoUrl,
    chainId: token.chainId,
    balance: {
      raw: token.balance,
      formatted: formatUnits(BigInt(token.balance), token.decimals),
      decimals: token.decimals,
    },
  };
}

export function usePortfolio(address?: string) {
  const [activeWallet] = useAtom(activeWalletAtom);
  const resolvedAddress = address ?? activeWallet ?? undefined;

  const key =
    resolvedAddress !== undefined ? `portfolio_${resolvedAddress}` : null;

  const fetcher = useCallback(async (): Promise<PortfolioTokenEnriched[]> => {
    if (resolvedAddress === undefined) return [];
    const raw = await fetchPortfolioForAllChains(resolvedAddress);
    return raw.map(enrichToken);
  }, [resolvedAddress]);

  return useCustomFetch<PortfolioTokenEnriched[]>({ url: key, fetcher });
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

  const { data: portfolio } = usePortfolio(resolvedAddress);

  const fetcher = useCallback(async (): Promise<PortfolioTokenEnriched | null> => {
    if (
      resolvedAddress === undefined ||
      tokenAddress === undefined ||
      chainId === undefined
    )
      return null;

    const match = portfolio?.find(
      (t) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (match !== undefined) return match;

    if (typeof chainId === "number") {
      const raw = await fetchTokenBalance(resolvedAddress, tokenAddress, chainId);
      return raw !== null ? enrichToken(raw) : null;
    }
    return null;
  }, [resolvedAddress, tokenAddress, chainId, portfolio]);

  return useCustomFetch<PortfolioTokenEnriched | null>({ url: key, fetcher });
}
