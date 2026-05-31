import { FC, PropsWithChildren } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

export const PrivyAuthProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PrivyProvider
      appId={
        (import.meta.env.VITE_PRIVY_APP_ID as string | undefined) ??
        "your-privy-app-id"
      }
      clientId={
        (import.meta.env.VITE_PRIVY_CLIENT_ID as string | undefined) ??
        "your-app-client-id"
      }
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
};

export default PrivyAuthProvider;
