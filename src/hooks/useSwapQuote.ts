import { useCallback, useMemo } from 'react'
import useCustomFetch from './utils/useCustomFetch'
import { swapService } from '../services/SwapService'
import type { SwapParams, SwapQuote } from '../services/swap.types'

export function useSwapQuote(params: SwapParams | null) {
  const disabled = !params?.tokenFrom || !params.tokenTo || !params.amount

  const key = useMemo(() => {
    if (params === null) return null
    return `swapQuote_${JSON.stringify(params)}`
  }, [params])

  const fetcher = useCallback(async (): Promise<SwapQuote> => {
    if (params === null) return Promise.reject(new Error('No params'))
    return swapService.getQuote(params)
  }, [params])

  return useCustomFetch<SwapQuote>({ url: key, fetcher, disabled })
}
