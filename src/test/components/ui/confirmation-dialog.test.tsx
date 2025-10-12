import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog'

describe('ConfirmationDialog', () => {
  it('should render when open is true', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        onOpenChange={() => {}}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={() => {}}
      />,
    )
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('should not render when open is false', () => {
    render(
      <ConfirmationDialog
        isOpen={false}
        onOpenChange={() => {}}
        title="Confirm"
        onConfirm={() => {}}
      />,
    )
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()

    render(
      <ConfirmationDialog
        isOpen={true}
        onOpenChange={() => {}}
        title="Delete Item"
        onConfirm={handleConfirm}
      />,
    )

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    expect(handleConfirm).toHaveBeenCalled()
  })

  it('should call onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const handleOpenChange = vi.fn()

    render(
      <ConfirmationDialog
        isOpen={true}
        onOpenChange={handleOpenChange}
        title="Confirm"
        onConfirm={() => {}}
      />,
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('should display custom button labels', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        onOpenChange={() => {}}
        title="Confirm"
        onConfirm={() => {}}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep it"
      />,
    )
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
    expect(screen.getByText('No, keep it')).toBeInTheDocument()
  })

  it('should show destructive variant on confirm button', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        onOpenChange={() => {}}
        title="Delete"
        onConfirm={() => {}}
        variant="destructive"
      />,
    )
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toHaveClass('bg-destructive')
  })
})

