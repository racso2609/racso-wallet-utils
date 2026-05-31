export interface EtfProduct {
  slug: string
  name: string
  symbol: string
  iconUrl: string
  addresses: {
    ethereum: string | null
    solana: string | null
    ton: string | null
    ink: string | null
    bsc: string | null
    mantle: string | null
  }
}
