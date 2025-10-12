import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '../../../components/ui/theme-toggle'
import { ThemeProvider } from '../../../contexts/theme-context'

describe('ThemeToggle', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }

  it('should render icon variant by default', () => {
    renderWithTheme(<ThemeToggle/>)
    // Icon variant renders buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render dropdown variant', () => {
    renderWithTheme(<ThemeToggle variant="dropdown"/>)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should allow theme selection via dropdown', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle variant="dropdown"/>)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'dark')

    expect(select).toHaveValue('dark')
  })

  it('should display custom labels', () => {
    renderWithTheme(
      <ThemeToggle
        variant="dropdown"
        labels={{
          light: 'Light Mode',
          dark: 'Dark Mode',
          system: 'System Default',
        }}
      />,
    )
    expect(screen.getByText('Light Mode')).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    expect(screen.getByText('System Default')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    renderWithTheme(<ThemeToggle className="custom-toggle" variant="dropdown"/>)
    const select = screen.getByRole('combobox')
    expect(select.parentElement).toHaveClass('custom-toggle')
  })

  it('should show all theme options in dropdown', () => {
    renderWithTheme(<ThemeToggle variant="dropdown"/>)
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })
})
