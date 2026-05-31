import type { ChainId } from '../types/tokenList'

export interface ChainInfo {
  chainId: ChainId
  chainName: string
}

const CHAIN_DATA: ChainInfo[] = [
  { chainId: 42161, chainName: 'Arbitrum One' },
  { chainId: 56, chainName: 'BNB Smart Chain' },
  { chainId: 8453, chainName: 'Base' },
  { chainId: 'solana-mainnet-beta', chainName: 'Solana' },
]

const chainMap = new Map<ChainId, string>(
  CHAIN_DATA.map((c) => [c.chainId, c.chainName]),
)

export function getChainName(chainId: ChainId): string {
  return chainMap.get(chainId) ?? `Chain ${String(chainId)}`
}

export function getChains(): ChainInfo[] {
  return CHAIN_DATA
}
