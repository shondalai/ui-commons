import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert'

describe('Alert', () => {
  it('should render alert with default variant', () => {
    render(<Alert>Alert message</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-background')
  })

  it('should render destructive variant', () => {
    render(<Alert variant="destructive">Error message</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('border-destructive/50')
  })

  it('should apply custom className', () => {
    render(<Alert className="custom-alert">Alert</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-alert')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Alert ref={ref}>Alert</Alert>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('should render AlertTitle as h5 element', () => {
    render(<AlertTitle>Alert Title</AlertTitle>)
    const title = screen.getByText('Alert Title')
    expect(title.tagName).toBe('H5')
    expect(title).toHaveClass('font-medium')
  })

  it('should render AlertDescription', () => {
    render(<AlertDescription>Alert description text</AlertDescription>)
    expect(screen.getByText('Alert description text')).toBeInTheDocument()
  })

  it('should render complete alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>,
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should support children elements', () => {
    render(
      <Alert>
        <span>Icon</span>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>,
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
