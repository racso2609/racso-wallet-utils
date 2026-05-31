import { FC, useState } from 'react'
import { XSTOCKS_PRODUCTS } from '../utils/xstocksProducts'
import EtfItem from './EtfItem'

export const EtfList: FC = () => {
  const [search, setSearch] = useState('')

  const filtered = XSTOCKS_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.symbol.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search ETFs..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
        }}
        className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/50"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <EtfItem
            key={product.slug}
            product={product}
            onClick={() => {
              /* TODO: handle selection */
            }}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted">No ETFs found</p>
      )}
    </div>
  )
}

export default EtfList
