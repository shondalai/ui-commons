import React, { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: number
  name: string
  username: string
  email?: string
  avatar?: string
  guest?: boolean

  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
  userDataKey?: string // The Joomla option key to fetch user data from
  componentNamespace?: string // Optional: specify the component namespace (e.g., 'com_cjforum')
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  userDataKey = 'user',
  componentNamespace,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state from Joomla
    const initAuth = async () => {
      try {
        // Check if user data is available from Joomla
        let userData = null

        // Strategy 1: If componentNamespace is provided, try to get options for that specific component
        if (componentNamespace) {
          const componentOptions = (window as any).Joomla?.getOptions?.(componentNamespace)
          if (componentOptions?.[userDataKey]) {
            userData = componentOptions[userDataKey]
          }
        }

        // Strategy 2: If no userData yet, try to get from all options and search for component keys
        if (!userData) {
          const joomlaOptions = (window as any).Joomla?.getOptions?.() || {}

          // Check if there's a specific component option
          for (const key of Object.keys(joomlaOptions)) {
            if (key.startsWith('com_') && joomlaOptions[key]?.[userDataKey]) {
              userData = joomlaOptions[key][userDataKey]
              break
            }
          }
        }

        // Strategy 3: Fallback to direct user key from global options
        if (!userData) {
          const joomlaOptions = (window as any).Joomla?.getOptions?.() || {}
          if (joomlaOptions[userDataKey]) {
            userData = joomlaOptions[userDataKey]
          }
        }

        // Strategy 4: Try getting user directly from top-level options
        if (!userData) {
          userData = (window as any).Joomla?.getOptions?.(userDataKey)
        }

        if (userData) {
          setUser(userData as User)
        }
      }
      catch (error) {
        console.error('AuthProvider: Error initializing auth:', error)
      }
      finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [userDataKey, componentNamespace])

  const refreshUser = async () => {
    try {
      const response = await fetch('/index.php?option=com_ajax&format=json&task=user.current', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setUser(result.data)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
    catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    }
  }

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await fetch('/index.php?option=com_users&task=user.login&format=json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await refreshUser()
        } else {
          throw new Error(result.message || 'Login failed')
        }
      } else {
        throw new Error('Login request failed')
      }
    }
    catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Get Joomla token for CSRF protection
      const token = (window as any).Joomla?.getOptions?.('csrf.token') || ''

      const formData = new FormData()
      formData.append('option', 'com_users')
      formData.append('task', 'user.logout')
      formData.append('format', 'json')
      if (token) {
        formData.append(token, '1')
      }

      const response = await fetch('/index.php', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUser(null)
          // Redirect to home page after successful logout
          window.location.href = '/'
        } else {
          throw new Error(result.message || 'Logout failed')
        }
      } else {
        throw new Error('Logout request failed')
      }
    }
    catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, clear local state and reload
      setUser(null)
      window.location.href = '/'
    }
  }

  const isAuthenticated = user !== null && !user.guest

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
