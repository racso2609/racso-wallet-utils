import { FC } from 'react'
import LoginButton from '../../src/components/LoginButton'
import Icon from '../../src/components/Icon'

const Home: FC = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
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
            <p className="text-sm leading-relaxed text-muted-foreground max-w-[16rem]">
              Connect your wallet to execute transactions securely across EVM and Solana networks.
            </p>
          </div>

          {/* Login */}
          <div className="w-full">
            <LoginButton />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          Powered by Privy &middot; Secure embedded wallets
        </p>
      </div>
    </div>
  )
}

export default Home
