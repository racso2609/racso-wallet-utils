import { FC } from 'react'
import { useParams, useNavigate } from 'react-router'
import { XSTOCKS_PRODUCTS } from '../../src/utils/xstocksProducts'
import { ETF_SUPPORTED_CHAINS } from '../../src/types/etf'
import CopyButton from '../../src/components/CopyButton'
import Icon from '../../src/components/Icon'

const EtfDetail: FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const product = XSTOCKS_PRODUCTS.find((p) => p.slug === slug)

  if (!product) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">ETF Not Found</h1>
          <p className="mt-2 text-sm text-muted">
            The requested ETF does not exist.
          </p>
          <button
            onClick={() => {
              void navigate('/')
            }}
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const supportedAddresses = ETF_SUPPORTED_CHAINS
    .map((chain) => [chain, product.addresses[chain]] as const)
    .filter(([, address]) => address !== null)
    .map(([chain, address]) => [chain, address] as [string, string])

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back */}
        <button
          onClick={() => {
            void navigate(-1)
          }}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" />
          Back
        </button>

        {/* Header Card */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-5">
            <img
              src={product.iconUrl}
              alt={product.name}
              className="h-16 w-16 shrink-0 rounded-xl object-contain sm:h-20 sm:w-20"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {product.name}
                </h1>
                <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                  {product.symbol}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {supportedAddresses.length} chain
                {supportedAddresses.length === 1 ? '' : 's'} available
              </p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Contract Addresses
          </h2>
          {supportedAddresses.map(([chain, address]) => (
            <div
              key={chain}
              className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/60 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium uppercase text-muted">
                  {chain}
                </span>
                <p className="mt-0.5 truncate font-mono text-sm text-foreground">
                  {address}
                </p>
              </div>
              <CopyButton text={address} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EtfDetail
