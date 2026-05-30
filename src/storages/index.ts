import { createJSONStorage } from 'jotai/utils'

export const storage = <T,>() => createJSONStorage<T>(() => localStorage)
