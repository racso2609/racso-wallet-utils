import { FC } from 'react'
import type { TokenInfo } from '../types/token'
import { getChainName } from '../config/chainInfo'
import { Icon } from './Icon'

export type TokenItemType = 'default'

export interface TokenItemProps {
  token: TokenInfo
  type?: TokenItemType
  selected?: boolean
  onSelect: () => void
}

const DefaultTokenItem: FC<TokenItemProps> = ({ token, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
        selected
          ? 'bg-primary/10 ring-1 ring-primary/30'
          : 'hover:bg-accent/50'
      }`}
    >
      <img
        src={token.logo}
        alt={token.symbol}
        className="h-8 w-8 rounded-full object-contain"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            {token.symbol}
          </span>
          <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
            {getChainName(token.chainId)}
          </span>
        </div>
        <p className="truncate text-xs text-muted">{token.name}</p>
      </div>
      {selected && (
        <Icon name="check" size={14} className="shrink-0 text-primary" />
      )}
    </button>
  )
}

const RENDERERS: Record<TokenItemType, FC<TokenItemProps>> = {
  default: DefaultTokenItem,
}

export const TokenItem: FC<TokenItemProps> = ({ type = 'default', ...props }) => {
  const Renderer = RENDERERS[type]
  return <Renderer {...props} />
}
