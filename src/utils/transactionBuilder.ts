import type { SwapParams, SwapTransaction } from "../services/swap.types";

export interface EoaTransaction {
  to: string;
  value: bigint;
  data?: string;
  chainId?: number;
}

export type SolanaTransaction = Uint8Array;

export interface BuiltSafeTransaction {
  provider: "safe";
  txs: EoaTransaction[];
  chainId: number;
}

export interface BuiltEoaTransaction {
  provider: "eoa";
  txs: EoaTransaction[];
  chainId: number;
}

export interface BuiltSolanaTransaction {
  provider: "solana";
  txs: SolanaTransaction[];
}

export type BuiltTransaction =
  | BuiltSafeTransaction
  | BuiltEoaTransaction
  | BuiltSolanaTransaction;

export interface SendAction {
  type: "send";
  token: string;
  from: string;
  to: string;
  amount: bigint;
  chain: number;
}

export interface SwapAction {
  type: "swap";
  swapParams: SwapParams;
  txs: SwapTransaction[];
}

export type Action = SendAction | SwapAction;

export const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

export function isNativeToken(token: string): boolean {
  return token.toLowerCase() === NATIVE_TOKEN.toLowerCase();
}

export function encodeErc20Transfer(to: string, amount: bigint): string {
  const selector = "0xa9059cbb";
  const paddedTo = to.toLowerCase().slice(2).padStart(64, "0");
  const paddedAmount = amount.toString(16).padStart(64, "0");
  return selector + paddedTo + paddedAmount;
}

function buildSendTransactions(action: SendAction): EoaTransaction[] {
  if (isNativeToken(action.token)) {
    return [
      {
        to: action.to,
        value: action.amount,
        data: "0x",
        chainId: action.chain,
      },
    ];
  }

  return [
    {
      to: action.token,
      value: 0n,
      data: encodeErc20Transfer(action.to, action.amount),
      chainId: action.chain,
    },
  ];
}

function buildSwapTransactions(action: SwapAction): EoaTransaction[] {
  return action.txs.map((tx: { to: string; value: bigint; data: string }) => ({
    to: tx.to,
    value: tx.value,
    data: tx.data,
  }));
}

export function buildTransaction(
  actions: Action[],
  provider: "safe" | "eoa" = "safe",
  chainId?: number,
): BuiltTransaction {
  if (actions.length === 0) {
    throw new Error("No actions provided");
  }

  let txs = actions.flatMap((action) => {
    if (action.type === "send") return buildSendTransactions(action);
    return buildSwapTransactions(action);
  });

  if (chainId === undefined) {
    throw new Error("chainId is required");
  }

  txs = txs.map((tx) => ({ ...tx, chainId }));

  if (provider === "safe") {
    return { provider: "safe", txs, chainId };
  }
  return { provider: "eoa", txs, chainId };
}
