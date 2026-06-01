import { useEffect } from "react";
import { useAtom } from "jotai";
import { tokenPricesAtom } from "../storages/tokenPrices";
import { getTokenPriceBySymbol } from "../services/AlchemyService";

export function useTokenPrice(symbol?: string): number | undefined {
  const [prices, setPrices] = useAtom(tokenPricesAtom);
  // const [pending, setPending] = useAtom(pendingPricesAtom);

  const key = symbol?.toUpperCase();
  // console.log("useTokenPrice called with symbol:", symbol, "key:", key);

  useEffect(() => {
    const handler = async () => {
      if (key === undefined) return;
      if (key in prices) return;
      // if (pending[key]) return;

      // setPending((prev) => ({ ...prev, [key]: true }));
      const price = await getTokenPriceBySymbol(key);
      console.log("Fetched price for", key, ":", price);
      setPrices((prev) => ({ ...prev, [key]: price }));
      // setPending((prev) => ({ ...prev, [key]: false }));
    };
    handler().catch(console.error);
  }, [key]);

  if (key === undefined) return undefined;
  // console.log("Token price for", key, "is", prices);
  return prices[key] ?? undefined;
}
