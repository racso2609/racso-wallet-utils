import { FC } from 'react'
import { useThemeContext } from '../contexts/ThemeContext'
import Icon from './Icon'

export const ThemeToggle: FC = () => {
  const { theme, setTheme } = useThemeContext()

  return (
    <div className="flex items-center rounded-lg border border-border bg-background/80 p-0.5">
      <button
        type="button"
        onClick={() => {
          setTheme('light')
        }}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          theme === 'light'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Light mode"
      >
        <Icon name="sun" size={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          setTheme('dark')
        }}
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Dark mode"
      >
        <Icon name="moon" size={16} />
      </button>
    </div>
  )
}

export default ThemeToggle
