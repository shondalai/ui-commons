// Layout Context Provider for component-specific configuration
import React, { createContext, ReactNode, useContext } from 'react'

export interface LayoutConfig {
  /**
   * Base URL for the component's API
   * e.g., '/index.php?option=com_cjforum'
   */
  apiBaseUrl: string

  /**
   * CSRF token for API requests
   */
  csrfToken?: string

  /**
   * Component name (e.g., 'cjforum', 'cjblog')
   */
  componentName: string

  /**
   * Optional custom API client instance
   */
  apiClient?: any

  /**
   * Enable debug logging
   */
  debug?: boolean
}

interface LayoutContextValue extends LayoutConfig {
  isConfigured: boolean
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

interface LayoutProviderProps {
  children: ReactNode
  config: LayoutConfig
}

/**
 * Layout Provider - Provides component-specific configuration for layout system
 *
 * Usage:
 * ```tsx
 * import { LayoutProvider } from '@shondalai/ui-commons'
 *
 * function App() {
 *   const config = {
 *     apiBaseUrl: window.Joomla?.getOptions?.('com_cjforum')?.apiUrl || '/index.php?option=com_cjforum',
 *     csrfToken: window.Joomla?.getOptions?.('com_cjforum')?.['csrf.token'],
 *     componentName: 'cjforum'
 *   }
 *
 *   return (
 *     <LayoutProvider config={config}>
 *       <YourApp />
 *     </LayoutProvider>
 *   )
 * }
 * ```
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children, config }) => {
  const value: LayoutContextValue = {
    ...config,
    isConfigured: true,
  }

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

/**
 * Hook to access layout configuration
 */
export const useLayoutConfig = (): LayoutContextValue => {
  const context = useContext(LayoutContext)

  if (!context) {
    throw new Error(
      'useLayoutConfig must be used within a LayoutProvider. ' +
      'Please wrap your app with <LayoutProvider config={{...}}>',
    )
  }

  return context
}

/**
 * Hook to check if layout is configured
 */
export const useIsLayoutConfigured = (): boolean => {
  const context = useContext(LayoutContext)
  return context?.isConfigured || false
}

