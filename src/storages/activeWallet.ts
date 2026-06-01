import { atom } from 'jotai'

export interface StoredWallet {
  address: string
  chainType: 'evm' | 'solana'
  walletType: 'wallet' | 'smart_wallet'
}

export const activeWalletAtom = atom<string | null>(null)
export const walletsAtom = atom<StoredWallet[]>([])
