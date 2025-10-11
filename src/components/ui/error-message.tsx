import React from 'react'
import { cn } from '../../lib/utils'

interface ErrorMessageProps {
  message: string
  title?: string
  className?: string
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Error',
  className = '',
  onRetry,
}) => {
  return (
    <div className={cn('bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6', className)}>
      <div className="flex items-center mb-2">
        <svg
          className="w-5 h-5 text-red-500 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-red-800 dark:text-red-300 font-medium">{title}</h3>
      </div>
      <p className="text-red-700 dark:text-red-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export { ErrorMessage }

