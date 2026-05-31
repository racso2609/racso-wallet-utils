import { FC, useCallback, useEffect, useRef } from 'react'
import { SUPPORTED_CHAINS, type ChainConfig } from '../config/chains'
import Icon from './Icon'

interface ChainSelectorModalProps {
  address: string
  open: boolean
  onClose: () => void
}

export const ChainSelectorModal: FC<ChainSelectorModalProps> = ({
  address,
  open,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  const handleOpenScanner = useCallback(
    (chain: ChainConfig) => {
      const url = `${chain.scannerUrl}/address/${address}`
      window.open(url, '_blank', 'noopener,noreferrer')
      onClose()
    },
    [address, onClose],
  )

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose()
        }
      }}
      className="m-auto rounded-2xl border border-border bg-card p-0 shadow-2xl shadow-primary/10 backdrop:bg-background/80 backdrop:backdrop-blur-sm open:animate-in open:fade-in-0 open:zoom-in-95"
    >
      <div className="flex w-80 flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            View on explorer
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {address}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {SUPPORTED_CHAINS.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => {
                handleOpenScanner(chain)
              }}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              <span>{chain.name}</span>
              <Icon
                name="external-link"
                size={14}
                className="text-muted-foreground"
              />
            </button>
          ))}
        </div>
      </div>
    </dialog>
  )
}

export default ChainSelectorModal
