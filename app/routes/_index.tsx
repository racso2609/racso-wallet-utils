import { FC } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import LoginButton from '../../src/components/LoginButton'
import EtfList from '../../src/components/EtfList'
import PortfolioSection from '../../src/components/PortfolioSection'
import SwapSection from '../../src/components/SwapSection'
import Icon from '../../src/components/Icon'

const Home: FC = () => {
  const { ready, authenticated, user } = usePrivy()

  const isLoggedIn = ready && authenticated

  const userLabel =
    user?.email && typeof user.email === 'object'
      ? user.email.address
      : user?.wallet?.address ?? 'User'

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      {isLoggedIn ? (
        <div className="mx-auto w-full max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                ETF Marketplace
              </h1>
              <p className="mt-1 text-sm text-muted">
                Browse and trade xStock ETFs across multiple chains.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="max-w-[12rem] truncate text-sm font-medium text-foreground">
                {userLabel}
              </span>
            </div>
          </div>

          {/* Portfolio + Swap XStack */}
          <div className="mb-8 flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 min-w-0">
              <PortfolioSection />
            </div>
            <div className="flex-1 min-w-0">
              <SwapSection />
            </div>
          </div>

          {/* ETF Grid */}
          <EtfList />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-20">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card/80 p-8 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:p-10">
              {/* Logo */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon name="wallet" size={28} />
              </div>

              {/* Text */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Wallet Utils
                </h1>
                <p className="max-w-[16rem] text-sm leading-relaxed text-muted">
                  Connect your wallet to execute transactions securely across EVM
                  and Solana networks.
                </p>
              </div>

              {/* Login */}
              <div className="w-full">
                <LoginButton />
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-muted/60">
              Powered by Privy &middot; Secure embedded wallets
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
