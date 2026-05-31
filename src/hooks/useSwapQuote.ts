import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { parseUnits } from "viem";
import useCustomFetch from "./utils/useCustomFetch";
import { swapService } from "../services/SwapService";
import { useToken } from "./useTokens";
import { activeWalletAtom, walletsAtom } from "../storages/activeWallet";
import { RELAY_CHAIN_MAP } from "../config/chains";
import type { SwapParams, SwapQuote } from "../services/swap.types";

function toRelayChainId(chainId: number): number {
  return RELAY_CHAIN_MAP[chainId] ?? chainId;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}

function resolveAddress(
  chainId: number,
  wallets: { address: string; chainType: string }[],
  fallback: string | null,
): string | null {
  const targetChainType = chainId === 101 ? "solana" : "evm";
  if (targetChainType === "evm" && fallback?.startsWith("0x")) return fallback;

  return (
    wallets.find((w) => w.chainType === targetChainType)?.address ?? fallback
  );
}

export function useSwapQuote(params: SwapParams | null, debounceMs = 500) {
  const [activeWallet] = useAtom(activeWalletAtom);
  const [wallets] = useAtom(walletsAtom);
  const fromToken = useToken(
    params?.tokenFrom ?? "",
    params?.chainIdFrom,
  );
  const debouncedRaw = useDebounce(params, debounceMs);

  const debouncedParams = useMemo(() => {
    if (debouncedRaw === null) return null;

    const fromAddr = resolveAddress(
      debouncedRaw.chainIdTo,
      wallets,
      activeWallet,
    );
    const refundToAddr = resolveAddress(
      debouncedRaw.chainIdFrom,
      wallets,
      activeWallet,
    );

    if (!fromAddr || !refundToAddr) return null;

    const decimals = fromToken?.decimals ?? 18;
    const parsedAmount = parseUnits(debouncedRaw.amount, decimals).toString();

    return {
      ...debouncedRaw,
      amount: parsedAmount,
      chainIdFrom: toRelayChainId(debouncedRaw.chainIdFrom),
      chainIdTo: toRelayChainId(debouncedRaw.chainIdTo),
      from: refundToAddr,
      refundTo: refundToAddr,
      to: fromAddr,
    };
  }, [debouncedRaw, wallets, activeWallet, fromToken]);

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
