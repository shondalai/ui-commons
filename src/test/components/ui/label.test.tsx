import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '../../../components/ui/label'

describe('Label', () => {
  it('should render label with text', () => {
    render(<Label>Username</Label>)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('should apply default styles', () => {
    render(<Label data-testid="label">Label text</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('text-sm', 'font-medium')
  })

  it('should support htmlFor attribute', () => {
    render(<Label htmlFor="input-id">Label</Label>)
    const label = screen.getByText('Label')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('should apply custom className', () => {
    render(<Label className="custom-label">Label</Label>)
    const label = screen.getByText('Label')
    expect(label).toHaveClass('custom-label')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(<Label ref={ref}>Label</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('should work with form inputs', () => {
    render(
      <div>
        <Label htmlFor="test-input">Email</Label>
        <input id="test-input" type="email"/>
      </div>,
    )
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'test-input')
  })
})

