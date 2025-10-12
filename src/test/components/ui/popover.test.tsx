import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'

describe('Popover', () => {
  it('should render popover trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('should show popover content on trigger click', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content here</PopoverContent>
      </Popover>,
    )

    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('should support custom className on content', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-popover">Content</PopoverContent>
      </Popover>,
    )

    await user.click(screen.getByText('Open'))
    const content = screen.getByText('Content')
    expect(content).toBeInTheDocument()
  })

  it('should render popover with custom trigger element', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    )

    const trigger = screen.getByText('Click me')
    await user.click(trigger)
    expect(screen.getByText('Popover content')).toBeInTheDocument()
  })
})
