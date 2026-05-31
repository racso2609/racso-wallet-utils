import { atom } from 'jotai'

export interface StoredWallet {
  address: string
  chainType: 'evm' | 'solana'
}

export const activeWalletAtom = atom<string | null>(null)
export const walletsAtom = atom<StoredWallet[]>([])
