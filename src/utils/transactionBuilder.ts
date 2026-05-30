export interface EoaTransaction {
  to: string
  value: bigint
  data?: string
  chainId?: number
}

export type SolanaTransaction = Uint8Array

export interface BuiltEoaTransaction {
  provider: 'eoa'
  txs: EoaTransaction[]
}

export interface BuiltSolanaTransaction {
  provider: 'solana'
  txs: SolanaTransaction[]
}

export type BuiltTransaction = BuiltEoaTransaction | BuiltSolanaTransaction

export interface SendAction {
  type: 'send'
  token: string
  from: string
  to: string
  amount: bigint
  chain: number
}

export type Action = SendAction

export const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000'

export function isNativeToken(token: string): boolean {
  return token.toLowerCase() === NATIVE_TOKEN.toLowerCase()
}

export function encodeErc20Transfer(to: string, amount: bigint): string {
  const selector = '0xa9059cbb'
  const paddedTo = to.toLowerCase().slice(2).padStart(64, '0')
  const paddedAmount = amount.toString(16).padStart(64, '0')
  return selector + paddedTo + paddedAmount
}

function buildSendTransactions(action: SendAction): EoaTransaction[] {
  if (isNativeToken(action.token)) {
    return [
      {
        to: action.to,
        value: action.amount,
        data: '0x',
        chainId: action.chain,
      },
    ]
  }

  return [
    {
      to: action.token,
      value: 0n,
      data: encodeErc20Transfer(action.to, action.amount),
      chainId: action.chain,
    },
  ]
}

export function buildTransaction(actions: Action[]): BuiltTransaction {
  if (actions.length === 0) {
    throw new Error('No actions provided')
  }

  return {
    provider: 'eoa',
    txs: actions.flatMap(buildSendTransactions),
  }
}
