import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import { formatUnits } from "viem";
import useCustomFetch from "./utils/useCustomFetch";
import type { ChainId } from "../types/tokenList";
import {
  getPortfolioForAllChains as fetchPortfolioForAllChains,
  getPortfolioWithPrices,
  getTokenBalance as fetchTokenBalance,
  PortfolioToken,
} from "../services/AlchemyService";
import { activeWalletAtom, walletsAtom } from "../storages/activeWallet";

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
  chainId: ChainId;
  balance: TokenBalanceInfo;
}

export interface PortfolioTokenWithValue extends PortfolioTokenEnriched {
  price: number | null;
  valueUsd: number;
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

function toPortfolioTokenWithValue(token: PortfolioToken & { price: number | null; valueUsd: number }): PortfolioTokenWithValue {
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
    price: token.price,
    valueUsd: token.valueUsd,
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

export function usePortfolioAllWallets() {
  const [wallets] = useAtom(walletsAtom);

  const allAddresses = useMemo(
    () => wallets.map((w) => ({ address: w.address, chainType: w.chainType })),
    [wallets],
  );

  const key = allAddresses.length > 0
    ? `portfolio_all_${allAddresses.map((w) => w.address).join('_')}`
    : null;

  const fetcher = useCallback(async (): Promise<PortfolioTokenWithValue[]> => {
    if (allAddresses.length === 0) return [];

    const tokens = await getPortfolioWithPrices(allAddresses);
    const result = tokens.map(toPortfolioTokenWithValue);

    // Merge by address + chainId if the same token appears across wallets
    const merged = new Map<string, PortfolioTokenWithValue>();
    for (const token of result) {
      const mapKey = token.address
        ? `${String(token.chainId)}-${token.address.toLowerCase()}`
        : `${String(token.chainId)}-${token.symbol.toLowerCase()}`;
      const existing = merged.get(mapKey);
      if (existing !== undefined) {
        const rawSum = (BigInt(existing.balance.raw) + BigInt(token.balance.raw)).toString();
        const decimals = token.balance.decimals;
        const formatted = formatUnits(BigInt(rawSum), decimals);
        const valueUsd = token.price !== null ? parseFloat(formatted) * token.price : 0;
        existing.balance = { raw: rawSum, formatted, decimals };
        existing.valueUsd = valueUsd;
      } else {
        merged.set(mapKey, token);
      }
    }

    return Array.from(merged.values()).filter((t) => t.valueUsd > 0);
  }, [allAddresses]);

  return useCustomFetch<PortfolioTokenWithValue[]>({ url: key, fetcher });
}
