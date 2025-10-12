import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LayoutProvider, useLayoutConfig } from '../../contexts/layout-context'

const TestComponent = () => {
  const { apiBaseUrl, componentName, isConfigured } = useLayoutConfig()

  return (
    <div>
      <div data-testid="api-url">{apiBaseUrl}</div>
      <div data-testid="component">{componentName}</div>
      <div data-testid="configured">{isConfigured ? 'Yes' : 'No'}</div>
    </div>
  )
}

describe('LayoutContext', () => {
  it('should provide layout configuration to children', () => {
    const config = {
      apiBaseUrl: '/index.php?option=com_test',
      componentName: 'test',
    }

    render(
      <LayoutProvider config={config}>
        <TestComponent/>
      </LayoutProvider>,
    )

    expect(screen.getByTestId('api-url')).toHaveTextContent('/index.php?option=com_test')
    expect(screen.getByTestId('component')).toHaveTextContent('test')
    expect(screen.getByTestId('configured')).toHaveTextContent('Yes')
  })

  it('should throw error when useLayoutConfig is used outside provider', () => {
    const originalError = console.error
    console.error = vi.fn()

    expect(() => {
      render(<TestComponent/>)
    }).toThrow()

    console.error = originalError
  })

  it('should support optional csrfToken', () => {
    const TestWithToken = () => {
      const { csrfToken } = useLayoutConfig()
      return <div data-testid="token">{csrfToken || 'none'}</div>
    }

    const config = {
      apiBaseUrl: '/api',
      componentName: 'test',
      csrfToken: 'test-token-456',
    }

    render(
      <LayoutProvider config={config}>
        <TestWithToken/>
      </LayoutProvider>,
    )

    expect(screen.getByTestId('token')).toHaveTextContent('test-token-456')
  })

  it('should support debug mode', () => {
    const TestWithDebug = () => {
      const { debug } = useLayoutConfig()
      return <div data-testid="debug">{debug ? 'Yes' : 'No'}</div>
    }

    const config = {
      apiBaseUrl: '/api',
      componentName: 'test',
      debug: true,
    }

    render(
      <LayoutProvider config={config}>
        <TestWithDebug/>
      </LayoutProvider>,
    )

    expect(screen.getByTestId('debug')).toHaveTextContent('Yes')
  })
})
