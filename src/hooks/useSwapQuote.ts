import { useCallback, useEffect, useMemo, useState } from "react";
import useCustomFetch from "./utils/useCustomFetch";
import { swapService } from "../services/SwapService";
import type { SwapParams, SwapQuote } from "../services/swap.types";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(value) }, delay);
    return () => { clearTimeout(timer) };
  }, [value, delay]);

  return debounced;
}

export function useSwapQuote(params: SwapParams | null, debounceMs = 500) {
  const debouncedParams = useDebounce(params, debounceMs);
  const disabled = !params?.tokenFrom || !params.tokenTo || !params.amount;

  const key = useMemo(() => {
    if (debouncedParams === null) return null;
    return `swapQuote_${JSON.stringify(debouncedParams)}`;
  }, [debouncedParams]);

  const fetcher = useCallback(async (): Promise<SwapQuote> => {
    if (debouncedParams === null) return Promise.reject(new Error("No params"));
    return swapService.getQuote(debouncedParams);
  }, [debouncedParams]);

  return useCustomFetch<SwapQuote>({ url: key, fetcher, disabled });
}
