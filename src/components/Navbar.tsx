import { FC } from 'react'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'
import WalletDropdown from './WalletDropdown'

export const Navbar: FC = () => {
  return (
    <nav className="relative z-10 flex items-center justify-between border-b border-border/50 bg-card/60 px-6 py-4 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon name="wallet" size={20} />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Wallet Utils
        </span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <WalletDropdown />
      </div>
    </nav>
  )
}

export default Navbar
