export interface ChainInfo {
  chainId: number
  chainName: string
}

const CHAIN_DATA: ChainInfo[] = [
  { chainId: 42161, chainName: 'Arbitrum One' },
  { chainId: 56, chainName: 'BNB Smart Chain' },
  { chainId: 8453, chainName: 'Base' },
]

const chainById: Record<number, string> = {}
for (const c of CHAIN_DATA) {
  chainById[c.chainId] = c.chainName
}

export function getChainName(chainId: number): string {
  return chainById[chainId] ?? `Chain ${String(chainId)}`
}

export function getChains(): ChainInfo[] {
  return CHAIN_DATA
}
