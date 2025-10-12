import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'

describe('Tabs', () => {
  const renderTabs = () => {
    return render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>,
    )
  }

  it('should render tabs with default value', () => {
    renderTabs()
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('should switch between tabs on click', async () => {
    const user = userEvent.setup()
    renderTabs()

    expect(screen.getByText('Content 1')).toBeInTheDocument()

    await user.click(screen.getByText('Tab 2'))
    expect(screen.getByText('Content 2')).toBeInTheDocument()

    await user.click(screen.getByText('Tab 3'))
    expect(screen.getByText('Content 3')).toBeInTheDocument()
  })

  it('should apply custom className to TabsList', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>,
    )
    const list = screen.getByText('Tab 1').parentElement
    expect(list).toHaveClass('custom-list')
  })

  it('should support disabled tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>,
    )
    const disabledTab = screen.getByText('Tab 2')
    expect(disabledTab).toHaveAttribute('data-disabled')
  })

  it('should render content only for active tab', async () => {
    const user = userEvent.setup()
    renderTabs()

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    // Radix UI Tabs keeps all content in DOM but uses data-state to hide inactive tabs
    const content1 = screen.getByText('Content 1')
    expect(content1).toHaveAttribute('data-state', 'active')

    await user.click(screen.getByText('Tab 2'))
    const content2 = screen.getByText('Content 2')
    expect(content2).toBeInTheDocument()
    expect(content2).toHaveAttribute('data-state', 'active')
  })
})
