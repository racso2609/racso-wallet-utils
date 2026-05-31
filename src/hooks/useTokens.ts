import { useMemo } from 'react'
import type { TokenList, TokenListItem } from '../types/tokenList'
import tokenListData from '../data/tokenList.json'

const TOKEN_LIST = tokenListData as TokenList

export function useTokenList(): TokenList {
  return TOKEN_LIST
}

export function useTokensByChain(chainId: number): TokenListItem[] {
  const list = useTokenList()
  const chain = list.find((c) => c.chainId === chainId)
  return chain?.tokens ?? []
}

export function useToken(
  addressOrSymbol: string,
  chainId?: number,
): TokenListItem | undefined {
  const list = useTokenList()

  return useMemo(() => {
    for (const group of list) {
      if (chainId !== undefined && group.chainId !== chainId) {
        continue
      }
      const found = group.tokens.find(
        (t) =>
          t.address.toLowerCase() === addressOrSymbol.toLowerCase() ||
          t.symbol.toLowerCase() === addressOrSymbol.toLowerCase(),
      )
      if (found) return found
    }
    return undefined
  }, [list, addressOrSymbol, chainId])
}

export function useAllTokens(): TokenListItem[] {
  const list = useTokenList()
  return useMemo(() => list.flatMap((group) => group.tokens), [list])
}

export function useSearchTokens(query: string): TokenListItem[] {
  const all = useAllTokens()
  const q = query.trim().toLowerCase()

  return useMemo(() => {
    if (!q) return all
    return all.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q),
    )
  }, [all, q])
}
