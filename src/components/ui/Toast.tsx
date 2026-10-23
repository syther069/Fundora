import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '../../context/ThemeContext'

export function AppToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--surface-elevated)',
          color: 'var(--ink)',
          borderColor: 'var(--border)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '13px',
          fontFamily: 'inherit',
        },
        className: 'border',
      }}
    />
  )
}
