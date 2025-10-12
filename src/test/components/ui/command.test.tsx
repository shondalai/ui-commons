import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '../../../components/ui/command'

describe('Command', () => {
  it('should render command container', () => {
    const { container } = render(<Command>Command content</Command>)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('flex', 'flex-col')
  })

  it('should render command input', () => {
    render(<CommandInput placeholder="Type a command..."/>)
    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument()
  })

  it('should render command list', () => {
    render(
      <Command>
        <CommandList>
          <div>List content</div>
        </CommandList>
      </Command>,
    )
    expect(screen.getByText('List content')).toBeInTheDocument()
  })

  it('should render command empty state', () => {
    render(<CommandEmpty>No results found</CommandEmpty>)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('should render command group', () => {
    render(
      <CommandGroup heading="Suggestions">
        <CommandItem>Item 1</CommandItem>
        <CommandItem>Item 2</CommandItem>
      </CommandGroup>,
    )
    expect(screen.getByText('Suggestions')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('should render complete command palette', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..."/>
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem>Save</CommandItem>
            <CommandItem>Copy</CommandItem>
            <CommandItem>Delete</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('should support custom className on command', () => {
    const { container } = render(<Command className="custom-command">Content</Command>)
    expect(container.firstChild).toHaveClass('custom-command')
  })
})

