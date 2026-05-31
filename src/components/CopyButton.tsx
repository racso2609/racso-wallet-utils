import { FC, useCallback, useState } from 'react'
import Icon from './Icon'

interface CopyButtonProps {
  text: string
}

export const CopyButton: FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => {
      setCopied(false)
    }, 2000)
  }, [text])

  return (
    <button
      type="button"
      onClick={() => {
        handleCopy().catch(console.error)
      }}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
    >
      <Icon name={copied ? 'check' : 'copy'} size={14} />
    </button>
  )
}

export default CopyButton
