import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollArea } from '../../../components/ui/scroll-area'

describe('ScrollArea', () => {
  it('should render scroll area with content', () => {
    render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    )
    expect(screen.getByText('Scrollable content')).toBeInTheDocument()
  })

  it('should apply default styles', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>,
    )
    const scrollArea = container.querySelector('[data-radix-scroll-area-viewport]')
    expect(scrollArea).toBeInTheDocument()
  })

  it('should support custom className', () => {
    const { container } = render(
      <ScrollArea className="custom-scroll">
        <div>Content</div>
      </ScrollArea>,
    )
    expect(container.firstChild).toHaveClass('custom-scroll')
  })

  it('should render with specific height', () => {
    const { container } = render(
      <ScrollArea className="h-72">
        <div>Long content</div>
      </ScrollArea>,
    )
    expect(container.firstChild).toHaveClass('h-72')
  })

  it('should handle long content', () => {
    render(
      <ScrollArea className="h-20">
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i}>Line {i + 1}</div>
          ))}
        </div>
      </ScrollArea>,
    )
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 50')).toBeInTheDocument()
  })
})

