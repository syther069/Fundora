import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Tooltip } from './ui/Tooltip'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('system')
    }
  }

  const label =
    theme === 'system'
      ? `System Theme (${resolvedTheme})`
      : theme === 'dark'
      ? 'Dark Mode'
      : 'Light Mode'

  return (
    <Tooltip content={`Theme: ${label} (Click to switch)`} position="bottom">
      <button
        onClick={handleToggle}
        aria-label={`Current theme is ${label}. Click to cycle themes.`}
        className="touch-target w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--ink)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-all duration-150 btn-focus interactive-press"
      >
        {theme === 'system' ? (
          <Laptop size={17} className="text-[var(--spring)]" aria-hidden="true" />
        ) : theme === 'dark' ? (
          <Moon size={17} className="text-amber-300" aria-hidden="true" />
        ) : (
          <Sun size={17} className="text-amber-500" aria-hidden="true" />
        )}
      </button>
    </Tooltip>
  )
}
