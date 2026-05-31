export interface ChainConfig {
  id: number
  name: string
  scannerUrl: string
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 42161,
    name: 'Arbitrum',
    scannerUrl: 'https://arbiscan.io',
  },
  {
    id: 8453,
    name: 'Base',
    scannerUrl: 'https://basescan.org',
  },
  {
    id: 137,
    name: 'Polygon',
    scannerUrl: 'https://polygonscan.com',
  },
]

export function getChainById(id: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === id)
}

export const CHAIN_ID_MAP: Record<string, number> = {
  ethereum: 1,
  solana: 101,
  ton: 114,
  ink: 7777777,
  bsc: 56,
  mantle: 5000,
}
