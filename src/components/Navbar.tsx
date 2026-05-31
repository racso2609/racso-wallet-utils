import { FC, useCallback, useState } from "react";
import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth";
import { useThemeContext } from "../contexts/ThemeContext";
import CopyButton from "./CopyButton";
import ChainSelectorModal from "./ChainSelectorModal";
import Dropdown from "./Dropdown";
import Icon from "./Icon";

export const Navbar: FC = () => {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { theme, setTheme } = useThemeContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const wallets =
    authenticated && user
      ? ([user.wallet?.address, user.smartWallet?.address].filter(
          Boolean,
        ) as string[])
      : [];

  const primaryLabel =
    authenticated && user
      ? typeof user.email === "string"
        ? user.email
        : (user.email?.address ?? user.wallet?.address ?? "User")
      : null;

  const handleOpenModal = useCallback((address: string) => {
    setSelectedAddress(address);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

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
        {/* Theme picker */}
        <div className="flex items-center rounded-lg border border-border bg-background/80 p-0.5">
          <button
            type="button"
            onClick={() => {
              setTheme("light");
            }}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              theme === "light"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Light mode"
          >
            <Icon name="sun" size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme("dark");
            }}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Dark mode"
          >
            <Icon name="moon" size={16} />
          </button>
        </div>

        {/* Auth */}
        {!ready ? (
          <span className="text-xs text-muted-foreground">Loading…</span>
        ) : authenticated && primaryLabel ? (
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
                wallets.map((address, index) => (
                  <div
                    key={`${address}-${String(index)}`}
                    className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {index === 0 ? "Wallet" : "Smart Wallet"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-xs text-foreground">
                        {address}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <CopyButton text={address} />
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenModal(address);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="View on explorer"
                          title="View on explorer"
                        >
                          <Icon name="external-link" size={14} />
                        </button>
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
                    logout().catch(console.error);
                  }}
                  className="w-full rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                >
                  Log out
                </button>
              </div>
            </div>
          </Dropdown>
        ) : (
          <button
            type="button"
            onClick={() => {
              login();
            }}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Log in
          </button>
        )}
      </div>

      <ChainSelectorModal
        address={selectedAddress}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </nav>
  );
};

export default Navbar;
