import type { Address, Hash } from "viem";

export interface SwapParams {
  tokenTo: string;
  tokenFrom: string;
  amount: string;
  chainIdTo: number;
  chainIdFrom: number;
  from: string;
  to?: string;
  txs?: SwapTransaction[];
  tradeType?: "EXACT_INPUT" | "EXPECTED_OUTPUT" | "EXACT_OUTPUT";
  refundTo?: string;
}

export interface SwapTransaction {
  to: Address;
  data: Hash;
  value: bigint;
  hash?: Hash;
}

export interface TokenBalance {
  formatted: string;
  currency: string;
}

export interface CurrencyGasTopup {
  amountUsd: string;
}

export interface RelayQuoteResponse {
  steps: {
    items: {
      data: {
        to: string;
        data: string;
        value: string;
      };
    }[];
  }[];
  fees: Record<string, unknown>;
  details: {
    currencyIn: {
      amount: string;
      amountFormatted: string;
    };
    currencyOut: {
      minimumAmount: string;
      amountFormatted: string;
      currency: {
        decimals: number;
      };
    };
    slippageTolerance?: {
      destination?: {
        percent: string;
      };
    };
    totalImpact?: {
      usd: string;
      percent: string;
    };
  };
}

export interface RelayTransaction {
  hash: string;
  chainId?: number;
  data?: {
    to: string;
    data: string;
    value: string;
  };
}

export interface RelayRequestInfo {
  requests: {
    data: {
      metadata: {
        currencyIn: string;
        currencyOut: string;
      };
      inTxs: RelayTransaction[];
      outTxs: RelayTransaction[];
    };
  }[];
}

export interface SwapQuote {
  isFiat: false;
  txs: SwapTransaction[];
  amountInRaw?: string;
  amountInFormatted?: string;
  amountToReceive: string;
  amountToReceiveRaw: string;
  fee: TokenBalance;
  slippage: string;
  impact?: {
    usd: string;
    percent: string;
  };
  fees?: RelayQuoteResponse["fees"];
  details?: RelayQuoteResponse["details"];
}
