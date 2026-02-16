import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface ThemeContextType {
  darkMode: boolean
  setDarkMode: (v: boolean) => void
  highContrast: boolean
  setHighContrast: (v: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function loadSettings(): { darkMode: boolean; highContrast: boolean } {
  try {
    const raw = localStorage.getItem('wordle-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        darkMode: parsed.darkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches,
        highContrast: parsed.highContrast ?? false,
      }
    }
  } catch { /* ignore */ }
  return {
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    highContrast: false,
  }
}

function saveSettings(darkMode: boolean, highContrast: boolean) {
  const existing = JSON.parse(localStorage.getItem('wordle-settings') || '{}')
  localStorage.setItem('wordle-settings', JSON.stringify({ ...existing, darkMode, highContrast }))
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState(() => loadSettings().darkMode)
  const [highContrast, setHighContrastState] = useState(() => loadSettings().highContrast)

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const root = document.documentElement
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }, [highContrast])

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v)
    saveSettings(v, highContrast)
  }

  const setHighContrast = (v: boolean) => {
    setHighContrastState(v)
    saveSettings(darkMode, v)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, highContrast, setHighContrast }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
