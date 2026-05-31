export interface TokenListItem {
  symbol: string
  name: string
  address: string
  chainId: number
  logoUrl: string
  type?: string
}

export interface ChainTokenGroup {
  chainId: number
  chainName: string
  tokens: TokenListItem[]
}

export type TokenList = ChainTokenGroup[]
