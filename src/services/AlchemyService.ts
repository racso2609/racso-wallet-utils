import { Alchemy, Network } from 'alchemy-sdk'
import { env } from '../config/env'

const SUPPORTED_CHAINS = [
  [42161, Network.ARB_MAINNET] as const,
  [56, Network.BNB_MAINNET] as const,
  [8453, Network.BASE_MAINNET] as const,
]

const chainNetwork = new Map<number, Network>(SUPPORTED_CHAINS)

export interface PortfolioToken {
  address: string
  balance: string
  decimals: number
  symbol: string
  name: string
  logoUrl: string | null
}

const instances = new Map<number, Alchemy>()

function getAlchemy(chainId: number): Alchemy | null {
  const network = chainNetwork.get(chainId)
  if (network === undefined) return null
  const existing = instances.get(chainId)
  if (existing !== undefined) return existing
  const alchemy = new Alchemy({ apiKey: env.VITE_ALCHEMY_API_KEY, network })
  instances.set(chainId, alchemy)
  return alchemy
}

export async function getPortfolio(
  address: string,
  chainId: number,
): Promise<PortfolioToken[]> {
  const alchemy = getAlchemy(chainId)
  if (alchemy === null) return []

  const { tokenBalances } = await alchemy.core.getTokenBalances(address)

  const results = await Promise.allSettled(
    tokenBalances.map(async (tb) => {
      const meta = await alchemy.core.getTokenMetadata(tb.contractAddress)
      return {
        address: tb.contractAddress,
        balance: tb.tokenBalance ?? '0',
        decimals: meta.decimals ?? 18,
        symbol: meta.symbol ?? '',
        name: meta.name ?? '',
        logoUrl: meta.logo ?? null,
      }
    }),
  )

  return results
    .filter(
      (r): r is PromiseFulfilledResult<PortfolioToken> =>
        r.status === 'fulfilled',
    )
    .map((r) => r.value)
    .filter((t) => t.balance !== '0')
}

export async function getTokenBalance(
  address: string,
  tokenAddress: string,
  chainId: number,
): Promise<PortfolioToken | null> {
  const alchemy = getAlchemy(chainId)
  if (alchemy === null) return null

  const tokenBalances = await alchemy.core.getTokenBalances(address, [
    tokenAddress as `0x${string}`,
  ])
  if (tokenBalances.tokenBalances.length < 1) return null
  const tb = tokenBalances.tokenBalances[0]
  const tokenBalance = tb.tokenBalance
  if (tokenBalance === null || tokenBalance === '0') return null

  const meta = await alchemy.core.getTokenMetadata(
    tb.contractAddress as `0x${string}`,
  )

  return {
    address: tb.contractAddress,
    balance: tokenBalance,
    decimals: meta.decimals ?? 18,
    symbol: meta.symbol ?? '',
    name: meta.name ?? '',
    logoUrl: meta.logo ?? null,
  }
}
