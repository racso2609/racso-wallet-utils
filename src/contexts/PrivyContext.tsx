import { FC, PropsWithChildren } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'

export const PrivyAuthProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || 'your-privy-app-id'}
      clientId={import.meta.env.VITE_PRIVY_CLIENT_ID || 'your-app-client-id'}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

export default PrivyAuthProvider
