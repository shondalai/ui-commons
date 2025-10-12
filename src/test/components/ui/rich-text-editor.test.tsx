import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RichTextEditor } from '../../../components/ui/rich-text-editor'

describe('RichTextEditor', () => {
  it('should render rich text editor', () => {
    render(<RichTextEditor onChange={() => {}}/>)
    const editor = screen.getByRole('textbox')
    expect(editor).toBeInTheDocument()
  })

  it('should display placeholder text', () => {
    render(<RichTextEditor onChange={() => {}} placeholder="Type something..."/>)
    expect(screen.getByText('Type something...')).toBeInTheDocument()
  })

  it('should allow typing in editor', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<RichTextEditor onChange={handleChange}/>)

    const editor = screen.getByRole('textbox')
    await user.click(editor)
    await user.keyboard('Hello World')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should show toolbar by default', () => {
    render(<RichTextEditor onChange={() => {}}/>)
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
  })

  it('should hide toolbar when showToolbar is false', () => {
    render(<RichTextEditor onChange={() => {}} showToolbar={false}/>)
    expect(screen.queryByRole('button', { name: /bold/i })).not.toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<RichTextEditor onChange={() => {}} disabled={true}/>)
    const editor = screen.getByRole('textbox')
    expect(editor).toHaveAttribute('contenteditable', 'false')
  })

  it('should show character count when enabled', () => {
    render(
      <RichTextEditor
        onChange={() => {}}
        showCharacterCount={true}
        maxCharacters={100}
      />,
    )
    expect(screen.getByText(/0 \/ 100/)).toBeInTheDocument()
  })

  it('should support custom className', () => {
    const { container } = render(
      <RichTextEditor onChange={() => {}} className="custom-editor"/>,
    )
    expect(container.querySelector('.custom-editor')).toBeInTheDocument()
  })

  it('should display formatting buttons in toolbar', () => {
    render(<RichTextEditor onChange={() => {}}/>)
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /underline/i })).toBeInTheDocument()
  })

  it('should support initial value', async () => {
    render(
      <RichTextEditor
        onChange={() => {}}
        value="<p>Initial content</p>"
      />,
    )
    // Wait for the initial value to be loaded (has 100ms timeout in component)
    await screen.findByText('Initial content', {}, { timeout: 200 })
    expect(screen.getByText('Initial content')).toBeInTheDocument()
  })
})
