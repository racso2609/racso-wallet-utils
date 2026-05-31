import { Address, formatUnits, Hash } from 'viem'
import { relayFetcher } from '../utils/fetcher/relayFetcher'
import type {
  CurrencyGasTopup,
  RelayQuoteResponse,
  RelayRequestInfo,
  SwapParams,
  SwapQuote,
  SwapTransaction,
  TokenBalance,
} from './swap.types'

const EXCLUDED_SWAP_SOURCES = [
  'dflow',
  'wsol',
  'camelot',
  'open-ocean',
  'odos',
  'okxSvm',
  'okxEvm',
  'bebopPmm',
  'bebopJam',
  'cetus',
  'rooster',
  'eisen',
  'okxSui',
  'fabric',
  'hyperswap',
  'eisen-v2',
  'fynd',
]

export class SwapService {
  private static instance: SwapService | null = null

  private constructor() {
    /* intentionally empty */
  }

  static getInstance(): SwapService {
    SwapService.instance ??= new SwapService()
    return SwapService.instance
  }

  async getTxsByUser(user: string): Promise<
    {
      metadata: { tokenFrom: string; tokenTo: string }
      txs: SwapTransaction[]
    }[]
  > {
    const response = await relayFetcher<RelayRequestInfo>(
      `/requests/v2?user=${user}`,
    )

    return response.requests.map((request) => ({
      metadata: {
        tokenFrom: request.data.metadata.currencyIn,
        tokenTo: request.data.metadata.currencyOut,
      },
      txs: [...request.data.inTxs, ...request.data.outTxs]
        .filter((tx): tx is typeof tx & { data: NonNullable<typeof tx.data> } =>
          Boolean(tx.data?.to && tx.data.data),
        )
        .map((tx) => ({
          to: tx.data.to as Address,
          data: tx.data.data as Hash,
          value: BigInt(tx.data.value),
          hash: tx.hash as Hash,
        })),
    }))
  }

  async getDestinationTxHash(
    user: string,
    sourceHash: string,
    destChainId?: number,
  ): Promise<string | null> {
    const response = await relayFetcher<RelayRequestInfo>(
      `/requests/v2?user=${user}`,
    )

    const requestBySourceHash = new Map<
      string,
      (typeof response.requests)[number]
    >()
    for (const request of response.requests) {
      for (const tx of request.data.inTxs) {
        if (tx.hash && !requestBySourceHash.has(tx.hash)) {
          requestBySourceHash.set(tx.hash, request)
        }
      }
    }

    const matchedRequest = requestBySourceHash.get(sourceHash)
    if (!matchedRequest) return null

    const outTxs = matchedRequest.data.outTxs
    if (!destChainId) {
      return outTxs[0]?.hash ?? null
    }

    const destTx = outTxs.find((tx) => tx.chainId === destChainId)
    return destTx?.hash ?? null
  }

  async getQuote(data: SwapParams): Promise<SwapQuote> {
    const response = await relayFetcher<RelayQuoteResponse>('/quote/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tradeType: data.tradeType ?? 'EXACT_INPUT',
        user: data.from,
        originChainId: data.chainIdFrom,
        destinationChainId: data.chainIdTo,
        originCurrency: data.tokenFrom,
        destinationCurrency: data.tokenTo,
        amount: data.amount,
        recipient: data.txs?.length ? undefined : data.to ?? data.from,
        txs: data.txs?.map((tx) => ({ ...tx, value: tx.value.toString() })),
        refundTo: data.from,
        slippageTolerance: 200,
        excludedSwapSources: EXCLUDED_SWAP_SOURCES,
      }),
    })

    const fee = Object.keys(response.fees).reduce<TokenBalance>(
      (acc, key) => {
        const raw = response.fees[key]
        const usd =
          raw && typeof raw === 'object' && 'amountUsd' in raw
            ? Number((raw as CurrencyGasTopup).amountUsd)
            : 0

        return {
          formatted: (Number(acc.formatted) + usd).toString(),
          currency: 'USD',
        }
      },
      { formatted: '0', currency: 'USDC' },
    )

    return {
      isFiat: false,
      txs: response.steps.flatMap((step) =>
        step.items.map((item) => ({
          to: item.data.to as Address,
          data: item.data.data as Hash,
          value: BigInt(item.data.value),
        })),
      ),
      fee,
      amountInRaw: response.details.currencyIn.amount,
      amountInFormatted: response.details.currencyIn.amountFormatted,
      amountToReceive: formatUnits(
        BigInt(response.details.currencyOut.minimumAmount),
        response.details.currencyOut.currency.decimals,
      ),
      amountToReceiveRaw: response.details.currencyOut.minimumAmount,
      slippage:
        response.details.slippageTolerance?.destination?.percent ?? '1',
      impact: response.details.totalImpact,
      fees: response.fees,
      details: response.details,
    }
  }
}

export const swapService = SwapService.getInstance()
