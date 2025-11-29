import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'warning' | 'info' | 'primary' | 'danger'
  isLoading?: boolean
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  isLoading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onOpenChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onOpenChange])

  if (!isOpen) {
    return null
  }

  const variantStyles = {
    destructive: 'text-destructive',
    warning: 'text-warning',
    info: 'text-primary',
    danger: 'text-destructive',
    primary: 'text-foreground',
  }

  const buttonStyles = {
    destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    warning: 'bg-warning hover:bg-warning/90 text-white',
    info: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>

      {/* Dialog */}
      <div
        className="relative bg-white dark:bg-gray-900 rounded-xl shadow-premium-xl max-w-md w-full animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4"/>
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`mb-4 ${variantStyles[variant]}`}>
            <AlertTriangle className="w-10 h-10" strokeWidth={1.5}/>
          </div>

          {/* Title */}
          <h3 id="dialog-title" className="text-xl font-semibold text-foreground mb-2">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p id="dialog-description" className="text-sm text-muted-foreground leading-relaxed mb-6">
              {description}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[variant]}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
