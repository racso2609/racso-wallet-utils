import { useMemo, useState } from 'react'
import type { EtfProduct } from '../types/etf'

interface UseStockOptions {
  products: EtfProduct[]
}

interface UseStockReturn {
  search: string
  setSearch: (value: string) => void
  filtered: EtfProduct[]
}

export function useStock({ products }: UseStockOptions): UseStockReturn {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.symbol.toLowerCase().includes(q),
    )
  }, [products, search])

  return { search, setSearch, filtered }
}
