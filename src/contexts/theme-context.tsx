import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  rootSelector?: string
  applyToDocumentRoot?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  actualTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function isTheme (value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function resolveSystemTheme (): 'light' | 'dark' {
  if (typeof document !== 'undefined') {
    const colorScheme = document.documentElement.getAttribute('data-color-scheme')
    if (colorScheme === 'dark' || colorScheme === 'light') return colorScheme

    const bootstrapTheme = document.documentElement.getAttribute('data-bs-theme')
    if (bootstrapTheme === 'dark' || bootstrapTheme === 'light') return bootstrapTheme
  }

  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function resolveTheme (theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? resolveSystemTheme() : theme
}

function findAppRoot (rootSelector?: string): HTMLElement | null {
  if (typeof document === 'undefined') return null

  if (rootSelector) {
    try {
      return document.querySelector<HTMLElement>(rootSelector)
    } catch {
      return null
    }
  }

  return document.getElementById('easycommerce-admin-root')
    || document.getElementById('easycommerce-store-root')
    || document.getElementById('root')
    || document.querySelector<HTMLElement>('[data-theme-root]')
}

function applyResolvedTheme (
  resolvedTheme: 'light' | 'dark',
  rootSelector: string | undefined,
  applyToDocumentRoot: boolean,
): void {
  if (typeof document === 'undefined') return

  const htmlRoot = document.documentElement
  const appRoot = findAppRoot(rootSelector)

  if (applyToDocumentRoot) {
    htmlRoot.classList.remove('light', 'dark')
    htmlRoot.classList.add(resolvedTheme)
    htmlRoot.style.colorScheme = resolvedTheme
  }

  if (appRoot && appRoot !== htmlRoot) {
    appRoot.classList.remove('light', 'dark')
    appRoot.classList.add(resolvedTheme)
    appRoot.dataset.colorScheme = resolvedTheme
    appRoot.style.colorScheme = resolvedTheme
  }
}

export function ThemeProvider ({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  rootSelector,
  applyToDocumentRoot = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey)
        return isTheme(storedTheme) ? storedTheme : defaultTheme
      } catch {
        return defaultTheme
      }
    }
    return defaultTheme
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => resolveTheme(theme))

  useLayoutEffect(() => {
    const resolvedTheme = resolveTheme(theme)
    applyResolvedTheme(resolvedTheme, rootSelector, applyToDocumentRoot)
    setActualTheme(resolvedTheme)
  }, [applyToDocumentRoot, rootSelector, theme])

  useEffect(() => {
    if (theme !== 'system') return

    const syncSystemTheme = () => {
      const resolvedTheme = resolveSystemTheme()
      applyResolvedTheme(resolvedTheme, rootSelector, applyToDocumentRoot)
      setActualTheme(resolvedTheme)
    }

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    mediaQuery?.addEventListener?.('change', syncSystemTheme)

    const observer = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(syncSystemTheme)
      : null

    observer?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-scheme', 'data-bs-theme'],
    })

    return () => {
      mediaQuery?.removeEventListener?.('change', syncSystemTheme)
      observer?.disconnect()
    }
  }, [applyToDocumentRoot, rootSelector, theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme)
      } catch {
        // Storage can be unavailable in privacy-restricted browser contexts.
      }
      setThemeState(theme)
    },
    actualTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

