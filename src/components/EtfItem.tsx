import { FC } from 'react'
import { useNavigate } from 'react-router'
import type { EtfWithSupportedAddresses } from '../hooks/useStock'

interface EtfItemProps {
  product: EtfWithSupportedAddresses
  onClick?: (product: EtfWithSupportedAddresses) => void
}

export const EtfItem: FC<EtfItemProps> = ({ product, onClick }) => {
  const navigate = useNavigate()

  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-3 text-left transition-colors hover:bg-card/80"
      onClick={() => {
        onClick?.(product)
        void navigate(`/etf/${product.slug}`)
      }}
    >
      <img
        src={product.iconUrl}
        alt={product.name}
        className="h-10 w-10 shrink-0 rounded-lg object-contain"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-foreground">
            {product.name}
          </span>
          <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            {product.symbol}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
          {product.supportedAddresses.map(([chain]) => (
            <span
              key={chain}
              className="text-[10px] capitalize text-muted"
            >
              {chain}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

export default EtfItem
