import { FC, useCallback, useState } from 'react'
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'
import CopyButton from './CopyButton'
import ChainSelectorModal from './ChainSelectorModal'
import Dropdown from './Dropdown'
import Icon from './Icon'

const typeToLabel = (connectorType?: string) => {
  if (!connectorType) return 'SmartWallet'
  return connectorType === 'ethereum' ? 'Wallet' : 'Solana'
}

export const WalletDropdown: FC = () => {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  const wallets =
    authenticated && user
      ? user.linkedAccounts
          .filter(
            (a) =>
              (a.type === 'wallet' || a.type === 'smart_wallet') &&
              ('chainType' in a || 'smartWalletType' in a),
          )
          .map((a) => {
            return {
              address: a.address,
              // @ts-expect-error - the types for linked accounts are a bit inconsistent, so we need to assert here
              label: typeToLabel(a.chainType as string),
            }
          })
      : []

  const primaryLabel =
    authenticated && user
      ? typeof user.email === 'string'
        ? user.email
        : (user.email?.address ?? user.wallet?.address ?? 'User')
      : null

  const handleOpenModal = useCallback((address: string) => {
    setSelectedAddress(address)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  const handleOpenSolanaScanner = useCallback((address: string) => {
    const url = `https://solscan.io/account/${address}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  if (!ready) {
    return <span className="text-xs text-muted-foreground">Loading…</span>
  }

  if (authenticated && primaryLabel) {
    return (
      <>
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-card">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="hidden truncate max-w-[8rem] sm:inline">
                {primaryLabel}
              </span>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {wallets.length > 0 ? (
              wallets.map(({ address, label }, index) => (
                <div
                  key={`${address}-${String(index)}`}
                  className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-xs text-foreground">
                      {address}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <CopyButton text={address} />
                      {label === 'Solana' ? (
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenSolanaScanner(address)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="View on Solscan"
                          title="View on Solscan"
                        >
                          <Icon name="external-link" size={14} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenModal(address)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="View on explorer"
                          title="View on explorer"
                        >
                          <Icon name="external-link" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No wallets connected
              </span>
            )}

            <div className="mt-1 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => {
                  logout().catch(console.error)
                }}
                className="w-full rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                Log out
              </button>
            </div>
          </div>
        </Dropdown>

        <ChainSelectorModal
          address={selectedAddress}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        login()
      }}
      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
    >
      Log in
    </button>
  )
}

export default WalletDropdown
