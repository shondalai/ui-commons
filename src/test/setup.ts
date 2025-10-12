import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock pointer capture for Radix UI components
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn()
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn()
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock scrollIntoView for jsdom
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

// Mock window.Joomla object
global.window = global.window || {}
;(global.window as any).Joomla = {
  getOptions: vi.fn((key?: string) => {
    const options = {
      'csrf.token': 'test-token-123',
      'user': {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        guest: false,
      },
      'com_cjforum': {
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
        },
      },
    }
    return key ? options[key as keyof typeof options] : options
  }),
  Text: {
    _: vi.fn((key: string) => key),
  },
}

// Mock fetch globally
global.fetch = vi.fn()
