import { FC, PropsWithChildren, createContext, useContext } from 'react'
import { useAtom } from 'jotai'
import { themeAtom, ThemeOptions } from '../storages/theme'

interface ThemeContextType {
  theme: ThemeOptions
  setTheme: (theme: ThemeOptions) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useAtom(themeAtom)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider')
  return context
}
