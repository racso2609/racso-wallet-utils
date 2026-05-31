import type { ChainId } from './tokenList'

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  amount?: string
  logo: string
  chainId: ChainId
  decimals: number
}
