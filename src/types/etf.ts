export type EtfChain = 'ethereum' | 'solana' | 'ton' | 'ink' | 'bsc' | 'mantle'

export const ETF_SUPPORTED_CHAINS: EtfChain[] = ['solana', 'bsc']

export interface EtfProduct {
  slug: string
  name: string
  symbol: string
  iconUrl: string
  addresses: Record<EtfChain, string | null>
}
