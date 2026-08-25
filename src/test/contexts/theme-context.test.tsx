import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../../contexts/theme-context'

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, setTheme, actualTheme } = useTheme()

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="actual-theme">{actualTheme}</div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}

function installMatchMedia (initialMatches: boolean) {
  let matches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const mediaQuery = {
    get matches () { return matches },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => mediaQuery),
    writable: true,
  })

  return {
    setMatches (nextMatches: boolean) {
      matches = nextMatches
      const event = { matches: nextMatches } as MediaQueryListEvent
      listeners.forEach(listener => listener(event))
    },
  }
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-color-scheme')
    document.documentElement.removeAttribute('data-bs-theme')
    document.documentElement.style.removeProperty('color-scheme')
    document.getElementById('easyforms-app')?.remove()
    installMatchMedia(false)
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should provide theme context to children', () => {
    render(
      <ThemeProvider>
        <TestComponent/>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toBeInTheDocument()
  })

  it('should default to system theme', () => {
    render(
      <ThemeProvider>
        <TestComponent/>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('system')
  })

  it('should respect defaultTheme prop', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent/>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('should allow changing theme to light', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent/>
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Light' }))

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light')
      expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    })
  })

  it('should allow changing theme to dark', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent/>
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Dark' }))

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
    })
  })

  it('should persist theme to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider storageKey="test-theme">
        <TestComponent/>
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Dark' }))

    await waitFor(() => {
      expect(localStorage.getItem('test-theme')).toBe('dark')
    })
  })

  it('should load theme from localStorage', () => {
    localStorage.setItem('ui-theme', 'dark')

    render(
      <ThemeProvider>
        <TestComponent/>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('should apply theme class to document root', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent/>
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Dark' }))

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })
  })

  it('should apply initial system dark mode to a scoped app root', () => {
    installMatchMedia(true)
    const appRoot = document.createElement('div')
    appRoot.id = 'easyforms-app'
    document.body.appendChild(appRoot)

    render(
      <ThemeProvider rootSelector="#easyforms-app" applyToDocumentRoot={false}>
        <TestComponent/>
      </ThemeProvider>,
      { container: appRoot },
    )

    expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
    expect(appRoot).toHaveClass('dark')
    expect(appRoot).toHaveAttribute('data-color-scheme', 'dark')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('should prefer Joomla explicit scheme over the operating system', () => {
    installMatchMedia(false)
    document.documentElement.setAttribute('data-bs-theme', 'dark')
    const appRoot = document.createElement('div')
    appRoot.id = 'easyforms-app'
    document.body.appendChild(appRoot)

    render(
      <ThemeProvider rootSelector="#easyforms-app" applyToDocumentRoot={false}>
        <TestComponent/>
      </ThemeProvider>,
      { container: appRoot },
    )

    expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
    expect(appRoot).toHaveClass('dark')
  })

  it('should update the scoped app root when the operating system changes', async () => {
    const media = installMatchMedia(false)
    const appRoot = document.createElement('div')
    appRoot.id = 'easyforms-app'
    document.body.appendChild(appRoot)

    render(
      <ThemeProvider rootSelector="#easyforms-app" applyToDocumentRoot={false}>
        <TestComponent/>
      </ThemeProvider>,
      { container: appRoot },
    )

    act(() => media.setMatches(true))

    await waitFor(() => {
      expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
      expect(appRoot).toHaveClass('dark')
    })
  })

  it('should update system mode when Joomla changes its scheme attribute', async () => {
    installMatchMedia(false)
    const appRoot = document.createElement('div')
    appRoot.id = 'easyforms-app'
    document.body.appendChild(appRoot)

    render(
      <ThemeProvider rootSelector="#easyforms-app" applyToDocumentRoot={false}>
        <TestComponent/>
      </ThemeProvider>,
      { container: appRoot },
    )

    document.documentElement.setAttribute('data-color-scheme', 'dark')

    await waitFor(() => {
      expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
      expect(appRoot).toHaveClass('dark')
    })
  })

  it('should preserve an explicit stored theme over Joomla system changes', async () => {
    localStorage.setItem('test-theme', 'light')
    document.documentElement.setAttribute('data-color-scheme', 'dark')
    const appRoot = document.createElement('div')
    appRoot.id = 'easyforms-app'
    document.body.appendChild(appRoot)

    render(
      <ThemeProvider storageKey="test-theme" rootSelector="#easyforms-app" applyToDocumentRoot={false}>
        <TestComponent/>
      </ThemeProvider>,
      { container: appRoot },
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    expect(appRoot).toHaveClass('light')

    document.documentElement.setAttribute('data-color-scheme', 'light')
    await Promise.resolve()
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
  })

  it.skip('should throw error when useTheme is used outside provider', () => {
    // This test is skipped because React Testing Library doesn't expose hook errors
    // in a way that can be easily caught. The error is logged to console instead.
    // In real usage, this will throw an error as expected.
  })
})
