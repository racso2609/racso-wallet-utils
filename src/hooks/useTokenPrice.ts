import { useEffect } from "react";
import { useAtom } from "jotai";
import { tokenPricesAtom, pendingPricesAtom } from "../storages/tokenPrices";
import { getTokenPriceBySymbol } from "../services/AlchemyService";

export function useTokenPrice(symbol?: string): number | undefined {
  const [prices, setPrices] = useAtom(tokenPricesAtom);
  const [pending, setPending] = useAtom(pendingPricesAtom);

  const key = symbol?.toUpperCase();

  useEffect(() => {
    if (key === undefined) return;
    if (key in prices) return;
    if (pending[key]) return;

    setPending((prev) => ({ ...prev, [key]: true }));
    void getTokenPriceBySymbol(key)
      .then((price) => {
        setPrices((prev) => ({ ...prev, [key]: price }));
      })
      .finally(() => {
        setPending((prev) => ({ ...prev, [key]: false }));
      });
  }, [key, prices, pending, setPrices, setPending]);

  if (key === undefined) return undefined;
  if (key in prices) return prices[key] ?? undefined;

  return undefined;
}
