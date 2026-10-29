import { createContext, useContext, useState, type ReactNode } from 'react'

export type AppMode = 'demo' | 'live'

const STORAGE_KEY = 'fundora_mode'

function readPersistedMode(): AppMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'live' || stored === 'demo') return stored
  } catch { /* SSR / private browsing */ }
  return 'demo'
}

interface ModeContextValue {
  mode: AppMode
  setMode: (m: AppMode) => void
  isDemo: boolean
  isLive: boolean
}

const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, _setMode] = useState<AppMode>(readPersistedMode)

  const setMode = (m: AppMode) => {
    _setMode(m)
    try { localStorage.setItem(STORAGE_KEY, m) } catch { /* ignore */ }
  }

  return (
    <ModeContext.Provider value={{ mode, setMode, isDemo: mode === 'demo', isLive: mode === 'live' }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within a ModeProvider')
  return ctx
}
