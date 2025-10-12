import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from '../../../components/ui/switch'

describe('Switch', () => {
  it('should render switch element', () => {
    render(<Switch/>)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
  })

  it('should be unchecked by default', () => {
    render(<Switch/>)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('should be checked when checked prop is true', () => {
    render(<Switch checked={true} onCheckedChange={() => {}}/>)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Switch onCheckedChange={handleChange}/>)

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Switch disabled/>)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Switch className="custom-switch"/>)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('custom-switch')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Switch ref={ref}/>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should support controlled mode', async () => {
    const user = userEvent.setup()
    let checked = false
    const handleChange = (value: boolean) => {
      checked = value
    }

    const { rerender } = render(
      <Switch checked={checked} onCheckedChange={handleChange}/>,
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')

    await user.click(switchElement)

    rerender(<Switch checked={true} onCheckedChange={handleChange}/>)
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked')
  })
})

