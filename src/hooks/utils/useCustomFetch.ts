import useSWR from 'swr'

export interface UseCustomFetchProps<T> {
  url?: string | null
  fetcher?: () => Promise<T>
  options?: Parameters<typeof useSWR<T>>[2]
  disabled?: boolean
}

const useCustomFetch = <T>({
  url,
  fetcher,
  options = {},
  disabled = false,
}: UseCustomFetchProps<T>) => {
  const key = disabled ? undefined : url
  const swrFetcher = fetcher
    ? async (): Promise<T> => fetcher()
    : null

  return useSWR<T>(key, swrFetcher, options)
}

export default useCustomFetch
