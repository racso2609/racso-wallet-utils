import { atomWithStorage } from 'jotai/utils'
import { storage } from '.'

export type ThemeOptions = 'light' | 'dark'

export const themeAtom = atomWithStorage<ThemeOptions>(
  'theme',
  'dark',
  storage(),
)
