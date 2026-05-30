import { FC } from 'react'
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'

export const LoginButton: FC = () => {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
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
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground truncate max-w-[12rem]">
          {label}
        </span>
        <button
          type="button"
          onClick={() => {
            logout().catch(console.error)
          }}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Log out
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
      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      Log in
    </button>
  )
}

export default LoginButton
