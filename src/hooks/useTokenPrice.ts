import { useAtom } from "jotai";
import { tokenPricesAtom, pendingPricesAtom } from "../storages/tokenPrices";
import { getTokenPriceBySymbol } from "../services/AlchemyService";

export function useTokenPrice(symbol?: string): number | undefined {
  const [prices, setPrices] = useAtom(tokenPricesAtom);
  const [pending, setPending] = useAtom(pendingPricesAtom);

  if (symbol === undefined) return undefined;

  const key = symbol.toUpperCase();
  if (key in prices) return prices[key] ?? undefined;

  if (!pending[key]) {
    setPending((prev) => ({ ...prev, [key]: true }));
    void getTokenPriceBySymbol(key).then((price) => {
      setPrices((prev) => ({ ...prev, [key]: price }));
      setPending((prev) => ({ ...prev, [key]: false }));
    });
  }

  return undefined;
}
