import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '../../../components/ui/textarea'

describe('Textarea', () => {
  it('should render textarea element', () => {
    render(<Textarea placeholder="Enter text"/>)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should accept user input', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder="Type here"/>)
    const textarea = screen.getByPlaceholderText('Type here')

    await user.type(textarea, 'Hello World')
    expect(textarea).toHaveValue('Hello World')
  })

  it('should apply default styles', () => {
    render(<Textarea data-testid="textarea"/>)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('rounded-md', 'border')
  })

  it('should merge custom className', () => {
    render(<Textarea className="custom-textarea" data-testid="textarea"/>)
    expect(screen.getByTestId('textarea')).toHaveClass('custom-textarea')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="textarea"/>)
    expect(screen.getByTestId('textarea')).toBeDisabled()
  })

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref}/>)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('should handle onChange event', async () => {
    const user = userEvent.setup()
    let value = ''
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      value = e.target.value
    }

    render(<Textarea onChange={handleChange} placeholder="Type here"/>)
    await user.type(screen.getByPlaceholderText('Type here'), 'Test')
    expect(value).toBe('Test')
  })

  it('should support default value', () => {
    render(<Textarea defaultValue="Default text" data-testid="textarea"/>)
    expect(screen.getByTestId('textarea')).toHaveValue('Default text')
  })

  it('should support rows attribute', () => {
    render(<Textarea rows={5} data-testid="textarea"/>)
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5')
  })

  it('should support maxLength attribute', () => {
    render(<Textarea maxLength={100} data-testid="textarea"/>)
    expect(screen.getByTestId('textarea')).toHaveAttribute('maxLength', '100')
  })
})

