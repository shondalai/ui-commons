import React, { createContext, useCallback, useContext, useState } from 'react'
import { Award, CheckCircle, Info, X, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const toast: Toast = { id, type, message, duration }

      setToasts(prev => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast],
  )

  const showSuccess = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast],
  )

  const showError = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast],
  )

  const showInfo = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast],
  )

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4"/>
      case 'error':
        return <XCircle className="w-4 h-4"/>
      case 'warning':
        return <Award className="w-4 h-4"/>
      case 'info':
      default:
        return <Info className="w-4 h-4"/>
    }
  }

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800',
          icon: 'text-emerald-600 dark:text-emerald-400',
          text: 'text-emerald-900 dark:text-emerald-100',
          closeBtn: 'text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-200',
        }
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100',
          closeBtn: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200',
        }
      case 'warning':
        return {
          container: 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800',
          icon: 'text-amber-600 dark:text-amber-400',
          text: 'text-amber-900 dark:text-amber-100',
          closeBtn: 'text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200',
        }
      case 'info':
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100',
          closeBtn: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200',
        }
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}

      {/* Toast Container - Premium minimalist design */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type)

          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-center gap-3 min-w-[320px] max-w-md',
                'px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm',
                'animate-in slide-in-from-top-2 fade-in duration-300',
                styles.container,
              )}
            >
              <div className={cn('flex-shrink-0', styles.icon)}>
                {getToastIcon(toast.type)}
              </div>

              <p className={cn('flex-1 text-sm font-medium leading-relaxed', styles.text)}>
                {toast.message}
              </p>

              <button
                onClick={() => removeToast(toast.id)}
                className={cn(
                  'flex-shrink-0 p-1 rounded-md transition-colors duration-200',
                  'hover:bg-white/50 dark:hover:bg-black/20',
                  styles.closeBtn,
                )}
                aria-label="Close notification"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

