import { FC, PropsWithChildren } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { env } from "../config/env";

export const PrivyAuthProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <PrivyProvider
      appId={env.VITE_PRIVY_APP_ID}
      clientId={env.VITE_PRIVY_CLIENT_ID}
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
