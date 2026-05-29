import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

/**
 * Dark mode theme provider with localStorage persistence
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme-mode')
    const prefersLightMode = window.matchMedia('(prefers-color-scheme: light)').matches

    if (saved) {
      setIsDark(saved === 'dark')
    } else if (!prefersLightMode) {
      setIsDark(true)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme-mode', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme-mode', 'light')
    }
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export default ThemeProvider
