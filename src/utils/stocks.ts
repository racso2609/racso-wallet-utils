import { XSTOCKS_PRODUCTS } from './xstocksProducts'
import { ETF_SUPPORTED_CHAINS } from '../types/etf'
import type { TokenInfo } from '../types/token'
import { CHAIN_ID_MAP } from '../config/chains'

export function getFirstSupportedChain(
  product: (typeof XSTOCKS_PRODUCTS)[number],
): string {
  for (const chain of ETF_SUPPORTED_CHAINS) {
    if (product.addresses[chain]) {
      return chain
    }
  }
  return ''
}

export function toTokenInfo(
  product: (typeof XSTOCKS_PRODUCTS)[number],
  address: string,
  chain: string,
): TokenInfo {
  return {
    address,
    symbol: product.symbol,
    name: product.name,
    logo: product.iconUrl,
    chainId: CHAIN_ID_MAP[chain] ?? 56,
    decimals: 18,
  }
}
