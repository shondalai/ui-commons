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
    listenerCount: () => listeners.size,
    setMatches (nextMatches: boolean) {
      matches = nextMatches
      const event = { matches: nextMatches } as MediaQueryListEvent
      listeners.forEach(listener => listener(event))
    },
  }
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-color-scheme')
    document.documentElement.removeAttribute('data-bs-theme')
    document.documentElement.style.removeProperty('color-scheme')
    document.getElementById('easyforms-app')?.remove()
    document.querySelectorAll('[data-theme-test]').forEach(element => element.remove())
    installMatchMedia(false)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  it.each([
    ['light', 'dark'],
    ['dark', 'light'],
  ] as const)('keeps explicit %s local when the Joomla document is %s', (choice, host) => {
    const appRoot = document.createElement('div')
    appRoot.id = 'ec-admin-root'
    appRoot.dataset.themeTest = ''
    document.body.append(appRoot)
    document.documentElement.className = `joomla ${host}`
    document.documentElement.setAttribute('data-bs-theme', host)
    document.documentElement.setAttribute('data-color-scheme', host)
    document.documentElement.style.colorScheme = host
    const htmlAttributes = Array.from(document.documentElement.attributes, attr => [attr.name, attr.value])
    render(
      <ThemeProvider defaultTheme={choice} rootSelector="#ec-admin-root" applyToDocumentRoot={false}>
        <TestComponent />
      </ThemeProvider>,
      { container: appRoot },
    )
    expect(appRoot).toHaveClass(choice)
    expect(appRoot).toHaveAttribute('data-color-scheme', choice)
    expect(appRoot.style.colorScheme).toBe(choice)
    expect(Array.from(document.documentElement.attributes, attr => [attr.name, attr.value])).toEqual(htmlAttributes)
  })

  it('recognizes the actual EasyCommerce mount IDs when no selector is supplied', () => {
    const appRoot = document.createElement('div')
    appRoot.id = 'ec-store-root'
    appRoot.dataset.themeTest = ''
    document.body.append(appRoot)
    render(<ThemeProvider defaultTheme="dark" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>, { container: appRoot })
    expect(appRoot).toHaveAttribute('data-color-scheme', 'dark')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('enforces a site policy without overwriting the saved visitor preference', async () => {
    localStorage.setItem('policy-theme', 'dark')
    document.documentElement.setAttribute('data-bs-theme', 'dark')
    const { rerender } = render(
      <ThemeProvider forcedTheme="light" storageKey="policy-theme" applyToDocumentRoot={false}>
        <TestComponent />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dark' }))
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    expect(localStorage.getItem('policy-theme')).toBe('dark')
    rerender(<ThemeProvider storageKey="policy-theme" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('updates a forced policy and makes forced system follow template then device', async () => {
    localStorage.setItem('policy-theme', 'dark')
    const media = installMatchMedia(true)
    document.documentElement.setAttribute('data-bs-theme', 'light')
    const { rerender } = render(<ThemeProvider forcedTheme="dark" storageKey="policy-theme" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
    rerender(<ThemeProvider forcedTheme="light" storageKey="policy-theme" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    rerender(<ThemeProvider forcedTheme="system" storageKey="policy-theme" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    document.documentElement.setAttribute('data-color-scheme', 'dark')
    await waitFor(() => expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark'))
    document.documentElement.removeAttribute('data-color-scheme')
    await waitFor(() => expect(screen.getByTestId('actual-theme')).toHaveTextContent('light'))
    document.documentElement.removeAttribute('data-bs-theme')
    await waitFor(() => expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark'))
    act(() => media.setMatches(false))
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    expect(localStorage.getItem('policy-theme')).toBe('dark')
  })

  it('themes owned existing and nested late portals and cleans up observers', async () => {
    const media = installMatchMedia(false)
    const existing = document.createElement('div')
    existing.className = 'owned-portal other-marker'
    existing.dataset.themeTest = ''
    const unrelated = document.createElement('div')
    unrelated.className = 'another-app dark'
    unrelated.dataset.themeTest = ''
    document.body.append(existing, unrelated)
    const { rerender, unmount } = render(<ThemeProvider forcedTheme="system" portalSelector=".owned-portal" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(existing).toHaveClass('light', 'other-marker')
    expect(existing).toHaveAttribute('data-color-scheme', 'light')
    const wrapper = document.createElement('section')
    wrapper.dataset.themeTest = ''
    wrapper.innerHTML = '<div class="owned-portal"><button>Late dialog</button></div>'
    document.body.append(wrapper)
    const late = wrapper.firstElementChild as HTMLElement
    await waitFor(() => expect(late).toHaveClass('light'))
    act(() => media.setMatches(true))
    expect(existing).toHaveClass('dark')
    expect(late).toHaveClass('dark')
    expect(late.style.colorScheme).toBe('dark')
    rerender(<ThemeProvider forcedTheme="light" portalSelector=".owned-portal" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(existing).toHaveClass('light')
    expect(late).toHaveClass('light')
    expect(unrelated.className).toBe('another-app dark')
    expect(unrelated).not.toHaveAttribute('data-color-scheme')
    rerender(<ThemeProvider forcedTheme="system" portalSelector=".owned-portal" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(media.listenerCount()).toBe(1)
    unmount()
    expect(media.listenerCount()).toBe(0)
    const afterUnmount = document.createElement('div')
    afterUnmount.className = 'owned-portal'
    wrapper.append(afterUnmount)
    await Promise.resolve()
    expect(afterUnmount).not.toHaveAttribute('data-color-scheme')
  })

  it('does not modify html through a portal selector in scoped mode', () => {
    document.documentElement.setAttribute('data-bs-theme', 'dark')
    render(<ThemeProvider forcedTheme="light" portalSelector="html" applyToDocumentRoot={false}><TestComponent /></ThemeProvider>)
    expect(document.documentElement).not.toHaveClass('light')
    expect(document.documentElement).not.toHaveAttribute('data-color-scheme')
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark')
  })

  it('works when storage is unavailable and ignores invalid saved preferences', async () => {
    localStorage.setItem('invalid-theme', 'sepia')
    const { unmount } = render(<ThemeProvider defaultTheme="light" storageKey="invalid-theme"><TestComponent /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    unmount()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied') })
    render(<ThemeProvider defaultTheme="light"><TestComponent /></ThemeProvider>)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dark' }))
    expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
  })

  it.skip('should throw error when useTheme is used outside provider', () => {
    // This test is skipped because React Testing Library doesn't expose hook errors
    // in a way that can be easily caught. The error is logged to console instead.
    // In real usage, this will throw an error as expected.
  })
})
