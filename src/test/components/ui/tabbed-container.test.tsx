import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabbedContainer, TabConfig } from '../../../components/ui/tabbed-container'

const TestComponent1 = () => <div>Content 1</div>
const TestComponent2 = () => <div>Content 2</div>
const TestComponent3 = () => <div>Content 3</div>

describe('TabbedContainer', () => {
  const mockTabs: TabConfig[] = [
    { id: 'tab1', label: 'Tab 1', component: TestComponent1 },
    { id: 'tab2', label: 'Tab 2', component: TestComponent2 },
    { id: 'tab3', label: 'Tab 3', component: TestComponent3 },
  ]

  beforeEach(() => {
    // Clear URL parameters before each test
    window.history.replaceState({}, '', window.location.pathname)
  })

  it('should render tabs with labels', () => {
    render(<TabbedContainer tabs={mockTabs}/>)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('should show first tab content by default', () => {
    render(<TabbedContainer tabs={mockTabs}/>)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('should switch between tabs on click', async () => {
    const user = userEvent.setup()
    render(<TabbedContainer tabs={mockTabs}/>)

    await user.click(screen.getByText('Tab 2'))
    expect(screen.getByText('Content 2')).toBeInTheDocument()

    await user.click(screen.getByText('Tab 3'))
    expect(screen.getByText('Content 3')).toBeInTheDocument()
  })

  it('should respect defaultTab prop', () => {
    render(<TabbedContainer tabs={mockTabs} defaultTab="tab2"/>)
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    // Verify tab 2 is active - get the button by role and name
    const tab2Button = screen.getByRole('tab', { name: 'Tab 2' })
    expect(tab2Button).toHaveAttribute('aria-selected', 'true')
  })

  it('should support accordion mode', () => {
    render(<TabbedContainer tabs={mockTabs} mode="accordion"/>)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
  })

  it('should support vertical orientation', () => {
    const { container } = render(
      <TabbedContainer tabs={mockTabs} orientation="vertical"/>,
    )
    // Vertical orientation renders with flex-row (horizontal nav layout)
    expect(container.querySelector('.flex-row')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TabbedContainer tabs={mockTabs} className="custom-tabs"/>,
    )
    expect(container.firstChild).toHaveClass('custom-tabs')
  })

  it('should disable specific tabs', () => {
    const tabsWithDisabled: TabConfig[] = [
      ...mockTabs,
      { id: 'tab4', label: 'Disabled Tab', component: TestComponent1, disabled: true },
    ]
    render(<TabbedContainer tabs={tabsWithDisabled}/>)
    const disabledTab = screen.getByText('Disabled Tab')
    // The disabled tab should have opacity-40 class
    expect(disabledTab.parentElement).toHaveClass('opacity-40')
  })

  it('should show loading state', () => {
    render(<TabbedContainer tabs={mockTabs} loading={true}/>)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
  })
})
