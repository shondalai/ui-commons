import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../../../components/ui/input'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text"/>)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should accept user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here"/>)
    const input = screen.getByPlaceholderText('Type here')

    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('should apply default styles', () => {
    render(<Input data-testid="input"/>)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('rounded-md', 'border', 'border-input')
  })

  it('should merge custom className', () => {
    render(<Input className="custom-input" data-testid="input"/>)
    expect(screen.getByTestId('input')).toHaveClass('custom-input')
  })

  it('should support different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input"/>)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" data-testid="input"/>)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="input"/>)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input"/>)
    expect(screen.getByTestId('input')).toBeDisabled()
  })

  it('should apply disabled styles', () => {
    render(<Input disabled data-testid="input"/>)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref}/>)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should handle onChange event', async () => {
    const user = userEvent.setup()
    let value = ''
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      value = e.target.value
    }

    render(<Input onChange={handleChange} placeholder="Type here"/>)
    await user.type(screen.getByPlaceholderText('Type here'), 'Test')
    expect(value).toBe('Test')
  })

  it('should support default value', () => {
    render(<Input defaultValue="Default" data-testid="input"/>)
    expect(screen.getByTestId('input')).toHaveValue('Default')
  })

  it('should support controlled value', () => {
    const { rerender } = render(<Input value="Controlled" data-testid="input" onChange={() => {}}/>)
    expect(screen.getByTestId('input')).toHaveValue('Controlled')

    rerender(<Input value="Updated" data-testid="input" onChange={() => {}}/>)
    expect(screen.getByTestId('input')).toHaveValue('Updated')
  })

  it('should support required attribute', () => {
    render(<Input required data-testid="input"/>)
    expect(screen.getByTestId('input')).toBeRequired()
  })

  it('should support maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="input"/>)
    expect(screen.getByTestId('input')).toHaveAttribute('maxLength', '10')
  })
})
