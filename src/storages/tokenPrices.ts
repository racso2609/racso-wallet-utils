import { atom } from 'jotai'

export const tokenPricesAtom = atom<Record<string, number | null>>({})

export const pendingPricesAtom = atom<Record<string, boolean>>({})
