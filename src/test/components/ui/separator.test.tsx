import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Separator } from '../../../components/ui/separator'

describe('Separator', () => {
  it('should render horizontal separator by default', () => {
    const { container } = render(<Separator/>)
    const separator = container.querySelector('[data-orientation="horizontal"]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('h-[1px]', 'w-full')
  })

  it('should render vertical separator', () => {
    const { container } = render(<Separator orientation="vertical"/>)
    const separator = container.querySelector('[data-orientation="vertical"]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('h-full', 'w-[1px]')
  })

  it('should apply custom className', () => {
    const { container } = render(<Separator className="custom-separator"/>)
    const separator = container.querySelector('[data-orientation]')
    expect(separator).toHaveClass('custom-separator')
  })

  it('should be decorative by default', () => {
    const { container } = render(<Separator/>)
    const separator = container.querySelector('[data-orientation="horizontal"]')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('should support non-decorative mode', () => {
    const { container } = render(<Separator decorative={false}/>)
    const separator = container.querySelector('[data-orientation]')
    expect(separator).toBeInTheDocument()
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Separator ref={ref}/>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
