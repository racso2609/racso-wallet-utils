import { FC, useCallback } from 'react'
import { type ChainConfig } from '../config/chains'
import Icon from './Icon'

interface ScannerButtonProps {
  address: string
  chain: ChainConfig
}

export const ScannerButton: FC<ScannerButtonProps> = ({ address, chain }) => {
  const handleOpen = useCallback(() => {
    const url = `${chain.scannerUrl}/address/${address}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [address, chain])

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`View on ${chain.name} scanner`}
      title={`View on ${chain.name} scanner`}
    >
      <Icon name="external-link" size={14} />
    </button>
  )
}

export default ScannerButton
