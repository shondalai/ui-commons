import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'

describe('Select', () => {
  const renderSelect = () => {
    return render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>,
    )
  }

  it('should render select trigger with placeholder', () => {
    renderSelect()
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('should open select on trigger click', async () => {
    const user = userEvent.setup()
    renderSelect()

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('should select an option', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <Select onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Option 1'))

    expect(handleChange).toHaveBeenCalledWith('option1')
  })

  it('should apply custom className to trigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue/>
        </SelectTrigger>
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveClass('custom-trigger')
  })

  it('should support disabled state', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled"/>
        </SelectTrigger>
      </Select>,
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})

