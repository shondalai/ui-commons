import React, { createContext, useContext, useEffect, useState } from 'react'

export interface LanguageContextType {
  t: (key: string, defaultValue?: string, ...args: any[]) => string
  loaded: boolean
  currentLanguage: string
}

const LanguageContext = createContext<LanguageContextType>({
  t: (key: string, defaultValue?: string) => defaultValue || key,
  loaded: false,
  currentLanguage: 'en-GB',
})

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [loaded, setLoaded] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en-GB')

  useEffect(() => {
    // Initialize language system
    const initLanguage = () => {
      try {
        // Check if Joomla.Text is available
        if (window.Joomla && window.Joomla.Text) {
          setLoaded(true)

          // Get current language from Joomla if available
          const joomlaLang = document.documentElement.lang || 'en-GB'
          setCurrentLanguage(joomlaLang)
        } else {
          // Fallback: wait for Joomla to load
          const checkJoomla = setInterval(() => {
            if (window.Joomla && window.Joomla.Text) {
              clearInterval(checkJoomla)
              setLoaded(true)
              const joomlaLang = document.documentElement.lang || 'en-GB'
              setCurrentLanguage(joomlaLang)
            }
          }, 100)

          // Clear interval after 5 seconds if Joomla doesn't load
          setTimeout(() => {
            clearInterval(checkJoomla)
            if (!loaded) {
              setLoaded(true)
            }
          }, 5000)
        }
      }
      catch (error) {
        console.error('Error initializing language system:', error)
        setLoaded(true)
      }
    }

    initLanguage()
  }, [loaded])

  const t = (key: string, defaultValue?: string, ...args: any[]): string => {
    try {
      if (window.Joomla && window.Joomla.Text && window.Joomla.Text._) {
        let translation = window.Joomla.Text._(key, defaultValue)
        if (translation === key && defaultValue) {
          translation = defaultValue
        }

        // Handle placeholder replacements
        if (args.length > 0) {
          const firstArg = args[0]

          // If first argument is an object (and the only argument), handle mustache-style placeholders
          if (args.length === 1 && typeof firstArg === 'object' && !Array.isArray(firstArg) && firstArg !== null) {
            Object.keys(firstArg).forEach((key) => {
              const value = firstArg[key]
              // Replace {{key}} with the actual value
              translation = translation.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
            })
          }
          // Otherwise, handle sprintf-style placeholders with multiple arguments
          else {
            args.forEach((replacement, index) => {
              // Replace numbered placeholders like %1$s, %2$s
              translation = translation.replace(new RegExp(`%${index + 1}\\$[sd]`, 'g'), String(replacement))
              // Replace simple %s and %d placeholders in order
              translation = translation.replace(/%[sd]/, String(replacement))
            })
          }
        }

        return translation
      }
    }
    catch (error) {
      console.warn(`Translation error for key "${key}":`, error)
    }

    // Fallback with placeholder replacement
    let fallback = defaultValue || key
    if (args.length > 0) {
      const firstArg = args[0]

      // Handle object-based replacements for mustache-style placeholders
      if (args.length === 1 && typeof firstArg === 'object' && !Array.isArray(firstArg) && firstArg !== null) {
        Object.keys(firstArg).forEach((key) => {
          const value = firstArg[key]
          fallback = fallback.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
        })
      }
      // Handle sprintf-style placeholders with multiple arguments
      else {
        args.forEach((replacement, index) => {
          fallback = fallback.replace(new RegExp(`%${index + 1}\\$[sd]`, 'g'), String(replacement))
          fallback = fallback.replace(/%[sd]/, String(replacement))
        })
      }
    }
    return fallback
  }

  const contextValue = {
    t,
    loaded,
    currentLanguage,
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

