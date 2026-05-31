import { FC } from 'react'
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'
import Icon from './Icon'

export const LoginButton: FC = () => {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl bg-muted px-6 py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed transition-colors"
      >
        Loading…
      </button>
    )
  }

  if (authenticated && user) {
    const label =
      typeof user.email === 'string'
        ? user.email
        : user.email?.address ?? user.wallet?.address ?? 'User'

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-foreground truncate max-w-[16rem]">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            logout().catch(console.error)
          }}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        login()
      }}
      className="group relative w-full overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        <Icon
          name="wallet"
          size={18}
          className="transition-transform group-hover:rotate-12"
        />
        Connect Wallet
      </span>
    </button>
  )
}

export default LoginButton
