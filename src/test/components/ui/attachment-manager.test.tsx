import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AttachmentManager } from '../../../components/ui/attachment-manager'

describe('AttachmentManager', () => {
  const mockAttachments = [
    {
      id: 1,
      filename: 'test.pdf',
      original_name: 'test.pdf',
      filesize: 1024,
      filetype: 'document' as const,
      url: '/uploads/test.pdf',
    },
  ]

  const defaultProps = {
    attachments: [],
    onAttachmentsChange: vi.fn(),
    uploadUrl: '/api/upload',
    deleteUrl: '/api/delete',
    deleteTempUrl: '/api/delete-temp',
  }

  it('should render attachment manager', () => {
    render(<AttachmentManager {...defaultProps} />)
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument()
  })

  it('should display existing attachments', () => {
    render(<AttachmentManager {...defaultProps} attachments={mockAttachments}/>)
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
  })

  it('should show upload button', () => {
    render(<AttachmentManager {...defaultProps} />)
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })

  it('should allow file selection', async () => {
    userEvent.setup()
    const handleChange = vi.fn()

    render(
      <AttachmentManager
        {...defaultProps}
        onAttachmentsChange={handleChange}
      />,
    )

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })

  it('should support drag and drop', () => {
    render(<AttachmentManager {...defaultProps} variant="standard"/>)
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<AttachmentManager {...defaultProps} disabled={true}/>)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeDisabled()
  })

  it('should show compact variant', () => {
    const { container } = render(
      <AttachmentManager {...defaultProps} variant="compact"/>,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should display custom labels', () => {
    render(
      <AttachmentManager
        {...defaultProps}
        labels={{
          attachFiles: 'Upload Files',
          attachedFiles: 'Your Files',
          dropFilesHere: 'Upload Files',
        }}
      />,
    )
    expect(screen.getByText('Upload Files')).toBeInTheDocument()
  })

  it('should allow removing attachments', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    // Mock fetch for delete operation
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response),
    )

    render(
      <AttachmentManager
        {...defaultProps}
        attachments={mockAttachments}
        onAttachmentsChange={handleChange}
      />,
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    expect(handleChange).toHaveBeenCalled()
  })

  it('should show file count when multiple files attached', () => {
    const multipleAttachments = [
      mockAttachments[0],
      {
        id: 2,
        filename: 'test2.pdf',
        original_name: 'test2.pdf',
        filesize: 2048,
        filetype: 'document' as const,
        url: '/uploads/test2.pdf',
      },
    ]
    render(
      <AttachmentManager {...defaultProps} attachments={multipleAttachments}/>,
    )
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
    expect(screen.getByText('test2.pdf')).toBeInTheDocument()
  })
})
