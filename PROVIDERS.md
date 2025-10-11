# Provider Guide - UI Commons

This guide explains how to use the three core providers (Language, Theme, and Auth) that have been migrated to ui-commons for use across all Joomla extensions.

## Overview

The ui-commons library provides three essential context providers for Joomla React applications:

1. **LanguageProvider** - Internationalization using Joomla's language system
2. **ThemeProvider** - Dark/light theme management
3. **AuthProvider** - User authentication state

## Setup

### Installation

```bash
npm install @shondalai/ui-commons
```

### Basic Setup

Wrap your application with all three providers:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  LanguageProvider, 
  ThemeProvider, 
  AuthProvider 
} from '@shondalai/ui-commons'
import '@shondalai/ui-commons/dist/ui-commons.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider defaultTheme="system" storageKey="yourext-theme">
        <AuthProvider userDataKey="user">
          <App />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
)
```

## 1. Language Provider

### Purpose

Provides seamless integration with Joomla's language system for internationalization (i18n).

### API

#### Provider Props

```tsx
interface LanguageProviderProps {
  children: React.ReactNode
}
```

#### Hook Return Value

```tsx
interface LanguageContextType {
  t: (key: string, defaultValue?: string, ...args: any[]) => string
  loaded: boolean
  currentLanguage: string
}
```

### Usage Examples

#### Basic Translation

```tsx
import { useLanguage } from '@shondalai/ui-commons'

function MyComponent() {
  const { t } = useLanguage()
  
  return (
    <div>
      <h1>{t('COM_CJFORUM_WELCOME', 'Welcome')}</h1>
      <p>{t('COM_CJFORUM_DESCRIPTION', 'Forum Description')}</p>
    </div>
  )
}
```

#### With sprintf-style Placeholders

```tsx
function UserGreeting({ username }: { username: string }) {
  const { t } = useLanguage()
  
  return (
    <h2>{t('COM_CJFORUM_WELCOME_USER', 'Welcome %s!', username)}</h2>
  )
}
```

#### With Multiple Placeholders

```tsx
function Stats({ topics, posts }: { topics: number; posts: number }) {
  const { t } = useLanguage()
  
  return (
    <p>
      {t(
        'COM_CJFORUM_STATS', 
        'You have %1$s topics and %2$s posts',
        topics,
        posts
      )}
    </p>
  )
}
```

#### With Named Placeholders (Mustache-style)

```tsx
function UserProfile({ user }: { user: User }) {
  const { t } = useLanguage()
  
  return (
    <p>
      {t(
        'COM_CJFORUM_USER_INFO',
        'Hello {{name}}, you have {{points}} points',
        { name: user.name, points: user.points }
      )}
    </p>
  )
}
```

#### Check Loading State

```tsx
function MyComponent() {
  const { t, loaded, currentLanguage } = useLanguage()
  
  if (!loaded) {
    return <div>Loading translations...</div>
  }
  
  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <h1>{t('COM_CJFORUM_TITLE', 'Forum')}</h1>
    </div>
  )
}
```

### How It Works

1. The provider automatically detects Joomla's language system on mount
2. Waits up to 5 seconds for `window.Joomla.Text` to be available
3. Falls back to the default value if translation key is not found
4. Supports both sprintf-style (`%s`, `%1$s`) and mustache-style (`{{key}}`) placeholders

## 2. Theme Provider

### Purpose

Manages application theme (light/dark/system) with localStorage persistence.

### API

#### Provider Props

```tsx
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
}
```

#### Hook Return Value

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  actualTheme: 'light' | 'dark'
}
```

### Usage Examples

#### Basic Theme Toggle

```tsx
import { useTheme } from '@shondalai/ui-commons'

function ThemeToggleButton() {
  const { theme, setTheme, actualTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {actualTheme} (Theme: {theme})
    </button>
  )
}
```

#### Using the ThemeToggle Component

```tsx
import { ThemeToggle } from '@shondalai/ui-commons'

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle variant="icon" showLabels={true} />
    </header>
  )
}
```

#### Theme Dropdown

```tsx
import { useTheme } from '@shondalai/ui-commons'

function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System Default</option>
    </select>
  )
}
```

#### Conditional Styling Based on Theme

```tsx
import { useTheme } from '@shondalai/ui-commons'

function ThemedCard() {
  const { actualTheme } = useTheme()
  
  return (
    <div className={actualTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      <h2>Card Title</h2>
      <p>Card content</p>
    </div>
  )
}
```

### How It Works

1. Reads initial theme from localStorage (using the provided `storageKey`)
2. Falls back to `defaultTheme` if no saved preference exists
3. Automatically applies the theme class to the document root element
4. Listens to system theme changes when theme is set to "system"
5. Persists user's choice to localStorage

### Storage Key Recommendations

Use a unique storage key for each extension:

- CjForum: `'cjforum-theme'`
- CjBlog: `'cjblog-theme'`
- CommunityAnswers: `'ca-theme'`

## 3. Auth Provider

### Purpose

Manages user authentication state with Joomla's user system.

### API

#### Provider Props

```tsx
interface AuthProviderProps {
  children: React.ReactNode
  userDataKey?: string  // Default: 'user'
}
```

#### Hook Return Value

```tsx
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}
```

#### User Type

```tsx
interface User {
  id: number
  name: string
  username: string
  email?: string
  avatar?: string
  guest?: boolean
  [key: string]: any  // Extension-specific fields
}
```

### Usage Examples

#### Basic Authentication Check

```tsx
import { useAuth } from '@shondalai/ui-commons'

function ProtectedContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <div>Please login to continue</div>
  }
  
  return (
    <div>
      <h2>Welcome, {user?.name}!</h2>
      <p>Email: {user?.email}</p>
    </div>
  )
}
```

#### Login Form

```tsx
import { useAuth } from '@shondalai/ui-commons'
import { useState } from 'react'

function LoginForm() {
  const { login, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login({ username, password })
      // User is now logged in, component will re-render
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        disabled={isLoading}
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={isLoading}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

#### Using the LoginModal Component

```tsx
import { LoginModal } from '@shondalai/ui-commons'
import { useState } from 'react'

function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  
  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Hello, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => setShowLogin(true)}>Login</button>
      )}
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
      />
    </header>
  )
}
```

#### Refresh User Data

```tsx
import { useAuth } from '@shondalai/ui-commons'
import { useEffect } from 'react'

function UserProfile() {
  const { user, refreshUser } = useAuth()
  
  // Refresh user data after profile update
  const handleProfileUpdate = async (data: any) => {
    await updateProfileAPI(data)
    await refreshUser()  // Reload user data
  }
  
  return (
    <div>
      <h2>{user?.name}</h2>
      {/* Profile form */}
    </div>
  )
}
```

#### Conditional Rendering for Guests

```tsx
import { useAuth } from '@shondalai/ui-commons'

function ForumActions() {
  const { user, isAuthenticated } = useAuth()
  
  // Check if user is a guest
  const isGuest = !isAuthenticated || user?.guest
  
  return (
    <div>
      {!isGuest && (
        <button>Create New Topic</button>
      )}
      {isGuest && (
        <p>Please login to create topics</p>
      )}
    </div>
  )
}
```

### How It Works

1. On mount, reads user data from Joomla's script options
2. Looks for user data in `window.Joomla.getOptions('com_yourext')[userDataKey]`
3. Provides login/logout methods that interact with Joomla's user system
4. Automatically handles CSRF tokens for security
5. Redirects to home page after successful logout

### Setting Up User Data in Joomla

In your Joomla component's view (PHP):

```php
// Get the current user
$user = Factory::getApplication()->getIdentity();

// Prepare user data for React
$userData = [
    'id' => $user->id,
    'name' => $user->name,
    'username' => $user->username,
    'email' => $user->email,
    'guest' => $user->guest,
    'avatar' => $this->getAvatarUrl($user->id),
    // Add extension-specific fields
];

// Pass to React via script options
$document->addScriptOptions('com_yourext', [
    'user' => $userData,
    'csrf.token' => Session::getFormToken(),
]);
```

Then in React:

```tsx
<AuthProvider userDataKey="user">
  <App />
</AuthProvider>
```

## Complete Example

Here's a complete example showing all three providers working together:

```tsx
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  LanguageProvider,
  ThemeProvider,
  AuthProvider,
  ThemeToggle,
  LoginModal,
} from '@shondalai/ui-commons'
import '@shondalai/ui-commons/dist/ui-commons.css'

function App() {
  const { t } = useLanguage()
  const { isAuthenticated, user, logout } = useAuth()
  const [showLogin, setShowLogin] = React.useState(false)

  return (
    <div className="app">
      <header>
        <h1>{t('COM_CJFORUM_TITLE', 'Forum')}</h1>
        <ThemeToggle variant="icon" />
        
        {isAuthenticated ? (
          <div>
            <span>{t('COM_CJFORUM_WELCOME_USER', 'Welcome %s', user?.name)}</span>
            <button onClick={logout}>
              {t('COM_CJFORUM_LOGOUT', 'Logout')}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)}>
            {t('COM_CJFORUM_LOGIN', 'Login')}
          </button>
        )}
      </header>

      <main>
        {/* Your app content */}
      </main>

      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
      />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider defaultTheme="system" storageKey="cjforum-theme">
        <AuthProvider userDataKey="user">
          <App />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
)
```

## TypeScript Support

All providers are fully typed. Import the types:

```tsx
import type {
  LanguageContextType,
  User,
} from '@shondalai/ui-commons'
```

## Best Practices

1. **Always wrap providers in the correct order**: Language → Theme → Auth
2. **Use unique storage keys** for different extensions to avoid conflicts
3. **Handle loading states** in your components (especially for auth)
4. **Provide default values** for all translation keys
5. **Use named placeholders** for better maintainability in complex translations
6. **Refresh user data** after profile updates or role changes

## Migration from CjForum

If you're migrating from CjForum's local providers:

### Before

```tsx
import { useLanguage } from '@shondalai/ui-commons'
import { useTheme } from '@/providers/theme-provider'
import { useAuth } from '@shondalai/ui-commons'
```

### After

```tsx
import { useLanguage, useTheme, useAuth } from '@shondalai/ui-commons'
```

**That's it!** The API is identical, so no code changes needed in your components.

## Troubleshooting

### Language translations not working

- Ensure `window.Joomla.Text` is loaded before React renders
- Check that language files are loaded in your Joomla component
- Use the `loaded` flag to wait for translations to be ready

### Theme not persisting

- Verify the `storageKey` is unique and not used by other extensions
- Check browser localStorage permissions
- Ensure you're not clearing localStorage elsewhere

### Auth user data not available

- Verify user data is passed via `Joomla.getOptions()`
- Check the `userDataKey` matches what you're setting in PHP
- Ensure the component option name matches (e.g., `com_cjforum`)

## Support

For issues or questions, refer to the main ui-commons documentation or file an issue on GitHub.

