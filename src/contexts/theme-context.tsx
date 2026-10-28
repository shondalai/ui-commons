import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  /** Enforce a site policy instead of a visitor's saved preference. */
  forcedTheme?: Theme
  storageKey?: string
  rootSelector?: string
  /** Owned body-level hosts that must share the app's resolved theme. */
  portalSelector?: string
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

  return document.getElementById('ec-admin-root')
    || document.getElementById('ec-store-root')
    || document.getElementById('easycommerce-admin-root')
    || document.getElementById('easycommerce-store-root')
    || document.getElementById('root')
    || document.querySelector<HTMLElement>('[data-theme-root]')
}

/** Set only the theme markers on an application-owned element. */
function applyElementTheme (element: HTMLElement, resolvedTheme: 'light' | 'dark'): void {
  element.classList.remove('light', 'dark')
  element.classList.add(resolvedTheme)
  element.dataset.colorScheme = resolvedTheme
  element.style.colorScheme = resolvedTheme
}

/** Theme existing and newly inserted portal hosts without touching the document. */
function applyPortalTheme (node: ParentNode, selector: string, resolvedTheme: 'light' | 'dark'): void {
  try {
    if (node instanceof HTMLElement && node !== document.documentElement && node.matches(selector)) {
      applyElementTheme(node, resolvedTheme)
    }
    node.querySelectorAll<HTMLElement>(selector).forEach(element => {
      if (element !== document.documentElement) applyElementTheme(element, resolvedTheme)
    })
  } catch {
    // A malformed optional selector must not break rendering the application.
  }
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
    applyElementTheme(appRoot, resolvedTheme)
  }
}

export function ThemeProvider ({
  children,
  defaultTheme = 'system',
  forcedTheme,
  storageKey = 'ui-theme',
  rootSelector,
  portalSelector,
  applyToDocumentRoot = true,
  ...props
}: ThemeProviderProps) {
  const [preferredTheme, setThemeState] = useState<Theme>(() => {
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

  const theme = forcedTheme ?? preferredTheme
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => resolveTheme(theme))

  useLayoutEffect(() => {
    const resolvedTheme = resolveTheme(theme)
    applyResolvedTheme(resolvedTheme, rootSelector, applyToDocumentRoot)
    setActualTheme(resolvedTheme)
  }, [applyToDocumentRoot, rootSelector, theme])

  useLayoutEffect(() => {
    if (!portalSelector || typeof document === 'undefined') return

    applyPortalTheme(document, portalSelector, actualTheme)
    const observer = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(records => {
        records.forEach(record => {
          record.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) applyPortalTheme(node, portalSelector, actualTheme)
          })
        })
      })
      : null

    // Only insertions matter. Observing class/style mutations would observe our
    // own theme writes and can create a self-triggering update loop.
    if (document.body) observer?.observe(document.body, { childList: true, subtree: true })
    return () => observer?.disconnect()
  }, [actualTheme, portalSelector])

  useEffect(() => {
    if (theme !== 'system') return

    const syncSystemTheme = () => {
      const resolvedTheme = resolveSystemTheme()
      applyResolvedTheme(resolvedTheme, rootSelector, applyToDocumentRoot)
      setActualTheme(resolvedTheme)
    }

    let mediaQuery: MediaQueryList | undefined
    try {
      mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    } catch {
      // Some embedded/private contexts deny access to browser preferences.
    }
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
      if (forcedTheme !== undefined) return
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

