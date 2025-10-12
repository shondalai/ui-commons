import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../../../components/ui/badge'

describe('Badge', () => {
  it('should render badge with text', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should apply default variant styles', () => {
    const { container } = render(<Badge>Default</Badge>)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-primary')
  })

  it('should apply secondary variant styles', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-secondary')
  })

  it('should apply destructive variant styles', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>)
    const badge = container.firstChild
    expect(badge).toHaveClass('bg-destructive')
  })

  it('should apply outline variant styles', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>)
    const badge = container.firstChild
    expect(badge).toHaveClass('text-foreground')
  })

  it('should merge custom className', () => {
    const { container } = render(<Badge className="custom-badge">Custom</Badge>)
    const badge = container.firstChild
    expect(badge).toHaveClass('custom-badge')
  })

  it('should support onClick handler', () => {
    let clicked = false
    const handleClick = () => { clicked = true }
    render(<Badge onClick={handleClick}>Clickable</Badge>)
    screen.getByText('Clickable').click()
    expect(clicked).toBe(true)
  })

  it('should have rounded-full class', () => {
    const { container } = render(<Badge>Badge</Badge>)
    const badge = container.firstChild
    expect(badge).toHaveClass('rounded-full')
  })

  it('should support children elements', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>,
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })
})
