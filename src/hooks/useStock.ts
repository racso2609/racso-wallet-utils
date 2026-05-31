import { useMemo, useState } from 'react'
import type { EtfProduct } from '../types/etf'
import { ETF_SUPPORTED_CHAINS } from '../types/etf'

interface UseStockOptions {
  products: EtfProduct[]
}

export interface EtfWithSupportedAddresses extends EtfProduct {
  supportedAddresses: [string, string][]
}

interface UseStockReturn {
  search: string
  setSearch: (value: string) => void
  filtered: EtfWithSupportedAddresses[]
}

export function useStock({ products }: UseStockOptions): UseStockReturn {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    const matched = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.symbol.toLowerCase().includes(q),
        )
      : products

    return matched.map((product) => {
      const supportedAddresses = ETF_SUPPORTED_CHAINS
        .map((chain) => [chain, product.addresses[chain]] as const)
        .filter(([, address]) => address !== null)
        .map(([chain, address]) => [chain, address] as [string, string])

      return { ...product, supportedAddresses }
    })
  }, [products, search])

  return { search, setSearch, filtered }
}
