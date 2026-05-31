import { useAtom } from "jotai";
import { tokenPricesAtom, priceKey } from "../storages/tokenPrices";
import { getTokenPrice } from "../services/AlchemyService";
import type { ChainId } from "../types/tokenList";

export function useTokenPrice(
  address?: string,
  chainId?: ChainId,
): number | undefined {
  const [prices, setPrices] = useAtom(tokenPricesAtom);

  if (address === undefined || chainId === undefined) return undefined;

  const key = priceKey(chainId, address);
  if (key in prices) return prices[key];

  if (typeof chainId === "number") {
    void getTokenPrice(address, chainId).then((price) => {
      if (price !== null) {
        setPrices((prev) => ({ ...prev, [key]: price }));
      }
    });
  }

  return undefined;
}
