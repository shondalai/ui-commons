import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorMessage } from '../../../components/ui/error-message'

describe('ErrorMessage', () => {
  it('should render error message text', () => {
    render(<ErrorMessage message="An error occurred"/>)
    expect(screen.getByText('An error occurred')).toBeInTheDocument()
  })

  it('should not render when message is empty', () => {
    const { container } = render(<ErrorMessage message=""/>)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when message is undefined', () => {
    const { container } = render(<ErrorMessage/>)
    expect(container.firstChild).toBeNull()
  })

  it('should apply error styling', () => {
    render(<ErrorMessage message="Error"/>)
    const error = screen.getByText('Error')
    expect(error).toHaveClass('text-destructive')
  })

  it('should support custom className', () => {
    render(<ErrorMessage message="Error" className="custom-error"/>)
    const error = screen.getByText('Error')
    expect(error).toHaveClass('custom-error')
  })

  it('should display as text-sm by default', () => {
    render(<ErrorMessage message="Small error"/>)
    const error = screen.getByText('Small error')
    expect(error).toHaveClass('text-sm')
  })
})

