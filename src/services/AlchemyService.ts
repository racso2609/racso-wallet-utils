import { Alchemy, Network } from "alchemy-sdk";
import { formatUnits } from "viem";
import { env } from "../config/env";
import type { ChainId } from "../types/tokenList";
import tokenList from "../data/tokenList.json";
import { XSTOCKS_PRODUCTS } from "../utils/xstocksProducts";
import type { EtfChain } from "../types/etf";

const ETF_CHAIN_TO_CHAIN_ID: Record<EtfChain, ChainId | undefined> = {
  ethereum: 1,
  solana: "solana-mainnet-beta",
  bsc: 56,
  ton: undefined,
  ink: undefined,
  mantle: undefined,
};

function buildKnownTokenMap(): Map<string, { symbol: string; name: string; logoUrl: string | null; decimals?: number }> {
  const map = new Map<string, { symbol: string; name: string; logoUrl: string | null; decimals?: number }>();

  // tokenList.json
  for (const chainGroup of tokenList) {
    for (const token of chainGroup.tokens) {
      const addr = typeof token.address === "string" ? token.address.toLowerCase() : token.address;
      const key = `${String(token.chainId)}-${addr}`;
      map.set(key, {
        symbol: token.symbol,
        name: token.name,
        logoUrl: token.logoUrl,
        decimals: token.decimals,
      });
    }
  }

  // xstocksProducts
  for (const product of XSTOCKS_PRODUCTS) {
    for (const [chainName, addr] of Object.entries(product.addresses)) {
      if (addr === null) continue;
      const chainId = ETF_CHAIN_TO_CHAIN_ID[chainName as EtfChain];
      if (chainId === undefined) continue;
      const normalized = typeof addr === "string" && addr.startsWith("0x")
        ? addr.toLowerCase()
        : addr;
      const key = `${String(chainId)}-${normalized}`;
      map.set(key, {
        symbol: product.symbol,
        name: product.name,
        logoUrl: product.iconUrl,
      });
    }
  }

  return map;
}

const knownTokenMap = buildKnownTokenMap();

function augmentTokenMetadata(
  chainId: ChainId,
  tokenAddress: string | undefined,
  meta: { symbol: string | null; name: string | null; logo: string | null; decimals: number | null },
): { symbol: string; name: string; logoUrl: string | null; decimals: number } {
  let symbol = meta.symbol ?? "";
  let name = meta.name ?? "";
  let logoUrl = meta.logo ?? null;
  let decimals = meta.decimals ?? 18;

  if ((!symbol || !name || !logoUrl) && tokenAddress) {
    const normalized = typeof tokenAddress === "string" && tokenAddress.startsWith("0x")
      ? tokenAddress.toLowerCase()
      : tokenAddress;
    const key = `${String(chainId)}-${normalized}`;
    const known = knownTokenMap.get(key);
    if (known) {
      symbol ||= known.symbol;
      name ||= known.name;
      logoUrl ??= known.logoUrl;
      if (known.decimals !== undefined) decimals = known.decimals;
    }
  }

  return { symbol, name, logoUrl, decimals };
}

const SUPPORTED_CHAINS = [
  [42161, Network.ARB_MAINNET] as const,
  [56, Network.BNB_MAINNET] as const,
  [8453, Network.BASE_MAINNET] as const,
];

const chainNetwork = new Map<number, Network>(SUPPORTED_CHAINS);
const networkChainId = new Map<Network, ChainId>(
  SUPPORTED_CHAINS.map(([chainId, network]) => [network, chainId]),
);
networkChainId.set(Network.SOLANA_MAINNET, "solana-mainnet-beta");

export interface PortfolioToken {
  address: string;
  balance: string;
  decimals: number;
  symbol: string;
  name: string;
  logoUrl: string | null;
  chainId: ChainId;
}

const instances = new Map<number, Alchemy>();

function getAlchemy(chainId: number): Alchemy | null {
  const network = chainNetwork.get(chainId);
  if (network === undefined) return null;
  const existing = instances.get(chainId);
  if (existing !== undefined) return existing;
  const alchemy = new Alchemy({ apiKey: env.VITE_ALCHEMY_API_KEY, network });
  instances.set(chainId, alchemy);
  return alchemy;
}

export async function getPortfolio(
  address: string,
  chainId: number,
): Promise<PortfolioToken[]> {
  const alchemy = getAlchemy(chainId);
  if (alchemy === null) return [];

  const { tokens } = await alchemy.core.getTokensForOwner(address);

  return tokens
    .filter((t) => t.error === undefined && t.rawBalance !== undefined)
    .map((t) => ({
      address: t.contractAddress,
      balance: t.rawBalance ?? "0",
      decimals: t.decimals ?? 18,
      symbol: t.symbol ?? "",
      name: t.name ?? "",
      logoUrl: t.logo ?? null,
      chainId,
    }))
    .filter((t) => t.balance !== "0");
}

const EVM_CHAIN_IDS = [42161, 56, 8453] as const;

export async function getPortfolioForAllChains(
  address: string,
): Promise<PortfolioToken[]> {
  if (!address.startsWith("0x")) return [];

  const results = await Promise.allSettled(
    EVM_CHAIN_IDS.map((chainId) => getPortfolio(address, chainId)),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<PortfolioToken[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}

export async function getTokenBalance(
  address: string,
  tokenAddress: string,
  chainId: number,
): Promise<PortfolioToken | null> {
  const alchemy = getAlchemy(chainId);
  if (alchemy === null) return null;

  const tokenBalances = await alchemy.core.getTokenBalances(address, [
    tokenAddress as `0x${string}`,
  ]);
  if (tokenBalances.tokenBalances.length < 1) return null;
  const tb = tokenBalances.tokenBalances[0];
  const tokenBalance = tb.tokenBalance;
  if (tokenBalance === null || tokenBalance === "0") return null;

  const meta = await alchemy.core.getTokenMetadata(
    tb.contractAddress as `0x${string}`,
  );

  return {
    address: tb.contractAddress,
    balance: tokenBalance,
    decimals: meta.decimals ?? 18,
    symbol: meta.symbol ?? "",
    name: meta.name ?? "",
    logoUrl: meta.logo ?? null,
    chainId,
  };
}

export interface PortfolioTokenWithPrice extends PortfolioToken {
  price: number | null;
  valueUsd: number;
}

let portfolioAlchemy: Alchemy | null = null;

function getPortfolioAlchemy(): Alchemy {
  portfolioAlchemy ??= new Alchemy({
    apiKey: env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  });
  return portfolioAlchemy;
}

export async function getPortfolioWithPrices(
  addresses: { address: string; chainType: "evm" | "solana" }[],
): Promise<PortfolioTokenWithPrice[]> {
  if (addresses.length === 0) return [];

  const evmNetworks = Array.from(chainNetwork.values());

  const request = addresses.map(({ address, chainType }) => ({
    address,
    networks: chainType === "solana" ? [Network.SOLANA_MAINNET] : evmNetworks,
  }));

  try {
    const alchemy = getPortfolioAlchemy();
    const response = await alchemy.portfolio.getTokensByWallet(
      request,
      true,
      true,
      true,
    );

    return response.data.tokens
      .filter((t) => t.tokenBalance !== "0")
      .map((t) => {
        const chainId = networkChainId.get(t.network) ?? 0;
        const meta = t.tokenMetadata;
        const tokenAddress = (t as unknown as { tokenAddress?: string }).tokenAddress;
        const augmented = augmentTokenMetadata(
          chainId,
          tokenAddress,
          { symbol: meta?.symbol ?? null, name: meta?.name ?? null, logo: meta?.logo ?? null, decimals: meta?.decimals ?? null },
        );
        const balanceRaw = t.tokenBalance;
        const balanceFormatted = formatUnits(BigInt(balanceRaw), augmented.decimals);
        const priceItem = t.tokenPrices.find((p) => p.currency === "usd");
        const price = priceItem !== undefined ? Number(priceItem.value) : null;
        const valueUsd =
          price !== null ? parseFloat(balanceFormatted) * price : 0;

        return {
          address: tokenAddress ?? "",
          balance: balanceRaw,
          decimals: augmented.decimals,
          symbol: augmented.symbol,
          name: augmented.name,
          logoUrl: augmented.logoUrl,
          chainId,
          price,
          valueUsd,
        };
      });
  } catch {
    return [];
  }
}

export async function getTokenPriceBySymbol(
  symbol: string,
): Promise<number | null> {
  const alchemy = getAlchemy(8453);
  if (alchemy === null) return null;

  try {
    const response = await alchemy.prices.getTokenPriceBySymbol([symbol]);
    const value = response.data[0]?.prices[0]?.value;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (value === undefined) return null;
    return Number(value);
  } catch {
    return null;
  }
}


