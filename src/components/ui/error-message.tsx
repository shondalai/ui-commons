import React from 'react'
import { cn } from '../../lib/utils'

interface ErrorMessageProps {
  message?: string
  className?: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = '',
}) => {
  if (!message) {
    return null
  }

  return (
    <div className={cn('text-sm text-destructive', className)}>
      {message}
    </div>
  )
}

export { ErrorMessage }
