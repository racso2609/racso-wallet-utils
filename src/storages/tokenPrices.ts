import { atom } from 'jotai'

export type PriceKey = string

export function priceKey(chainId: string | number, address: string): PriceKey {
  return `${String(chainId)}:${address.toLowerCase()}`
}

export const tokenPricesAtom = atom<Record<PriceKey, number>>({})
