import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useCustomFetch from './utils/useCustomFetch'
import {
  getPortfolio as fetchPortfolio,
  getTokenBalance as fetchTokenBalance,
  PortfolioToken,
} from '../services/AlchemyService'

export function usePortfolio(address?: string, chainId?: number) {
  const key =
    address !== undefined && chainId !== undefined
      ? `portfolio_${address}_${String(chainId)}`
      : null

  const fetcher = useCallback(async (): Promise<PortfolioToken[]> => {
    if (address === undefined || chainId === undefined) return []
    return fetchPortfolio(address, chainId)
  }, [address, chainId])

  return useCustomFetch<PortfolioToken[]>({ url: key, fetcher })
}

export function useTokenBalance(
  address?: string,
  tokenAddress?: string,
  chainId?: number,
) {
  const key =
    address !== undefined && tokenAddress !== undefined && chainId !== undefined
      ? `tokenBalance_${address}_${String(chainId)}_${tokenAddress}`
      : null

  const { cache } = useSWRConfig()
  const portfolioKey =
    address !== undefined && chainId !== undefined
      ? `portfolio_${address}_${String(chainId)}`
      : null

  const fetcher = useCallback(async (): Promise<PortfolioToken | null> => {
    if (address === undefined || tokenAddress === undefined || chainId === undefined) return null

    if (portfolioKey !== null) {
      const cached = cache.get(portfolioKey)
      if (cached?.data !== undefined) {
        const portfolio = cached.data as PortfolioToken[]
        const match = portfolio.find(
          (t) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
        )
        if (match !== undefined) return match
      }
    }
    return fetchTokenBalance(address, tokenAddress, chainId)
  }, [address, tokenAddress, chainId, portfolioKey, cache])

  return useCustomFetch<PortfolioToken | null>({ url: key, fetcher })
}
