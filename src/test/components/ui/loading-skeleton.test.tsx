import React from 'react'
import { render } from '@testing-library/react'
import { LoadingSkeleton } from '../../../components/ui/loading-skeleton'

describe('LoadingSkeleton', () => {
  describe('Default variant', () => {
    it('should render default variant with default props', () => {
      const { container } = render(<LoadingSkeleton/>)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(container.querySelector('.space-y-3')).toBeInTheDocument()
    })

    it('should render with specified number of lines', () => {
      const { container } = render(<LoadingSkeleton variant="default" lines={5}/>)
      const lineGroups = container.querySelectorAll('.space-y-2')
      expect(lineGroups).toHaveLength(5)
    })

    it('should apply custom className', () => {
      const { container } = render(<LoadingSkeleton className="custom-class"/>)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should render shimmer elements', () => {
      const { container } = render(<LoadingSkeleton lines={2}/>)
      const shimmerElements = container.querySelectorAll('.bg-slate-200\\/70')
      expect(shimmerElements.length).toBeGreaterThan(0)
    })
  })

  describe('Card variant', () => {
    it('should render card variant', () => {
      const { container } = render(<LoadingSkeleton variant="card"/>)
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
      expect(container.querySelector('.border')).toBeInTheDocument()
    })

    it('should show avatar when showAvatar is true', () => {
      const { container } = render(<LoadingSkeleton variant="card" showAvatar={true}/>)
      const avatar = container.querySelector('.rounded-full')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('w-10', 'h-10')
    })

    it('should not show avatar when showAvatar is false', () => {
      const { container } = render(<LoadingSkeleton variant="card" showAvatar={false}/>)
      const avatar = container.querySelector('.rounded-full')
      expect(avatar).not.toBeInTheDocument()
    })

    it('should show stats when showStats is true', () => {
      const { container } = render(<LoadingSkeleton variant="card" showStats={true}/>)
      const statsGrid = container.querySelector('.grid-cols-3')
      expect(statsGrid).toBeInTheDocument()
    })

    it('should show actions when showActions is true', () => {
      const { container } = render(<LoadingSkeleton variant="card" showActions={true}/>)
      const actionsContainer = container.querySelector('.justify-center.space-x-3')
      expect(actionsContainer).toBeInTheDocument()
    })

    it('should render correct number of content lines', () => {
      const { container } = render(<LoadingSkeleton variant="card" lines={4}/>)
      const contentLines = container.querySelectorAll('.space-y-3 > .bg-slate-200\\/70')
      expect(contentLines).toHaveLength(4)
    })
  })

  describe('Hero variant', () => {
    it('should render hero variant with gradient background', () => {
      const { container } = render(<LoadingSkeleton variant="hero"/>)
      const gradient = container.querySelector('.bg-gradient-to-r')
      expect(gradient).toBeInTheDocument()
    })

    it('should render hero avatar/icon', () => {
      const { container } = render(<LoadingSkeleton variant="hero"/>)
      const heroAvatar = container.querySelector('.w-20.h-20')
      expect(heroAvatar).toBeInTheDocument()
    })

    it('should render grid layout', () => {
      const { container } = render(<LoadingSkeleton variant="hero"/>)
      const grid = container.querySelector('.grid-cols-1.lg\\:grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('should show actions in hero section when showActions is true', () => {
      const { container } = render(<LoadingSkeleton variant="hero" showActions={true}/>)
      const heroSection = container.querySelector('.bg-gradient-to-r')
      const actions = heroSection?.querySelector('.flex.space-x-2')
      expect(actions).toBeInTheDocument()
    })

    it('should show stats sidebar when showStats is true', () => {
      const { container } = render(<LoadingSkeleton variant="hero" showStats={true}/>)
      const statElements = container.querySelectorAll('.grid-cols-2.gap-3')
      expect(statElements.length).toBeGreaterThan(0)
    })
  })

  describe('Stats variant', () => {
    it('should render stats variant', () => {
      const { container } = render(<LoadingSkeleton variant="stats"/>)
      const statsGrid = container.querySelector('.grid-cols-2.md\\:grid-cols-4')
      expect(statsGrid).toBeInTheDocument()
    })

    it('should render 4 stat items by default', () => {
      const { container } = render(<LoadingSkeleton variant="stats"/>)
      const statsGrid = container.querySelector('.grid-cols-2.md\\:grid-cols-4')
      const statItems = statsGrid?.querySelectorAll('.text-center.space-y-2')
      expect(statItems).toHaveLength(4)
    })

    it('should have card styling', () => {
      const { container } = render(<LoadingSkeleton variant="stats"/>)
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
      expect(container.querySelector('.border')).toBeInTheDocument()
    })
  })

  describe('List variant', () => {
    it('should render list variant', () => {
      const { container } = render(<LoadingSkeleton variant="list"/>)
      const divider = container.querySelector('.divide-y')
      expect(divider).toBeInTheDocument()
    })

    it('should render correct number of list items', () => {
      const { container } = render(<LoadingSkeleton variant="list" lines={5}/>)
      const listItems = container.querySelectorAll('.p-4')
      expect(listItems).toHaveLength(5)
    })

    it('should show avatar in list items when showAvatar is true', () => {
      const { container } = render(<LoadingSkeleton variant="list" lines={3} showAvatar={true}/>)
      const avatars = container.querySelectorAll('.rounded-full')
      expect(avatars).toHaveLength(3)
    })

    it('should not show avatar when showAvatar is false', () => {
      const { container } = render(<LoadingSkeleton variant="list" lines={3} showAvatar={false}/>)
      const avatars = container.querySelectorAll('.rounded-full')
      expect(avatars).toHaveLength(0)
    })
  })

  describe('Grid variant', () => {
    it('should render grid variant', () => {
      const { container } = render(<LoadingSkeleton variant="grid"/>)
      const grid = container.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4')
      expect(grid).toBeInTheDocument()
    })

    it('should render correct number of grid items', () => {
      const { container } = render(<LoadingSkeleton variant="grid" lines={6}/>)
      const gridItems = container.querySelectorAll('.grid > div')
      expect(gridItems).toHaveLength(6)
    })

    it('should have card styling for each grid item', () => {
      const { container } = render(<LoadingSkeleton variant="grid" lines={2}/>)
      const gridItems = container.querySelectorAll('.rounded-lg.border')
      expect(gridItems.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('User variant', () => {
    it('should render user variant', () => {
      const { container } = render(<LoadingSkeleton variant="user"/>)
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
    })

    it('should show user avatar when showAvatar is true', () => {
      const { container } = render(<LoadingSkeleton variant="user" showAvatar={true}/>)
      const avatar = container.querySelector('.w-12.h-12.rounded-full')
      expect(avatar).toBeInTheDocument()
    })

    it('should show user stats when showStats is true', () => {
      const { container } = render(<LoadingSkeleton variant="user" showStats={true}/>)
      const statsGrid = container.querySelector('.grid-cols-3.gap-4')
      expect(statsGrid).toBeInTheDocument()
      const statItems = statsGrid?.querySelectorAll('.text-center.space-y-1')
      expect(statItems).toHaveLength(3)
    })

    it('should show user actions when showActions is true', () => {
      const { container } = render(<LoadingSkeleton variant="user" showActions={true}/>)
      const actions = container.querySelector('.justify-center.space-x-3')
      expect(actions).toBeInTheDocument()
    })

    it('should render correct number of content lines', () => {
      const { container } = render(<LoadingSkeleton variant="user" lines={4}/>)
      const contentArea = container.querySelector('.space-y-3')
      const contentLines = contentArea?.querySelectorAll('.bg-slate-200\\/70')
      expect(contentLines).toHaveLength(4)
    })
  })

  describe('Actions variant', () => {
    it('should render actions variant', () => {
      const { container } = render(<LoadingSkeleton variant="actions"/>)
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
    })

    it('should show avatar when showAvatar is true', () => {
      const { container } = render(<LoadingSkeleton variant="actions" showAvatar={true}/>)
      const avatar = container.querySelector('.w-10.h-10.rounded-full')
      expect(avatar).toBeInTheDocument()
    })

    it('should show action buttons when showActions is true', () => {
      const { container } = render(<LoadingSkeleton variant="actions" showActions={true}/>)
      const actionsContainer = container.querySelector('.flex-col.space-y-2')
      expect(actionsContainer).toBeInTheDocument()
      const actionButtons = actionsContainer?.querySelectorAll('.h-10.w-full')
      expect(actionButtons).toHaveLength(3)
    })

    it('should render correct number of content lines', () => {
      const { container } = render(<LoadingSkeleton variant="actions" lines={5}/>)
      const contentArea = container.querySelector('.space-y-3')
      const contentLines = contentArea?.querySelectorAll('.bg-slate-200\\/70')
      expect(contentLines).toHaveLength(5)
    })
  })

  describe('Animation and styling', () => {
    it('should have pulse animation class', () => {
      const { container } = render(<LoadingSkeleton variant="card"/>)
      const pulseElement = container.querySelector('.animate-pulse')
      expect(pulseElement).toBeInTheDocument()
    })

    it('should have shimmer classes', () => {
      const { container } = render(<LoadingSkeleton/>)
      const shimmerElement = container.querySelector('.bg-slate-200\\/70')
      expect(shimmerElement).toBeInTheDocument()
      expect(shimmerElement).toHaveClass('rounded-md')
    })

    it('should support dark mode classes', () => {
      const { container } = render(<LoadingSkeleton variant="card"/>)
      const darkModeElements = container.querySelectorAll('.dark\\:bg-slate-900, .dark\\:bg-slate-700\\/70')
      expect(darkModeElements.length).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle lines = 0', () => {
      const { container } = render(<LoadingSkeleton lines={0}/>)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should handle large number of lines', () => {
      const { container } = render(<LoadingSkeleton variant="list" lines={100}/>)
      const listItems = container.querySelectorAll('.p-4')
      expect(listItems).toHaveLength(100)
    })

    it('should return null for unknown variant', () => {
      // @ts-expect-error - Testing invalid variant
      const { container } = render(<LoadingSkeleton variant="unknown"/>)
      expect(container.firstChild).toBeNull()
    })

    it('should combine all optional props', () => {
      const { container } = render(
        <LoadingSkeleton
          variant="card"
          lines={5}
          showAvatar={true}
          showStats={true}
          showActions={true}
          className="custom-skeleton"
        />,
      )

      expect(container.querySelector('.custom-skeleton')).toBeInTheDocument()
      expect(container.querySelector('.rounded-full')).toBeInTheDocument() // avatar
      expect(container.querySelector('.grid-cols-3')).toBeInTheDocument() // stats
      expect(container.querySelector('.justify-center.space-x-3')).toBeInTheDocument() // actions
    })
  })

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = render(<LoadingSkeleton variant="card"/>)
      // Skeleton should be properly structured even though it's a loading state
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should maintain semantic HTML structure', () => {
      const { container } = render(<LoadingSkeleton variant="list" lines={3}/>)
      const listContainer = container.firstChild
      expect(listContainer?.nodeName).toBe('DIV')
    })
  })

  describe('Responsive design', () => {
    it('should have responsive grid classes in grid variant', () => {
      const { container } = render(<LoadingSkeleton variant="grid"/>)
      const grid = container.firstChild
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4')
    })

    it('should have responsive grid classes in hero variant', () => {
      const { container } = render(<LoadingSkeleton variant="hero"/>)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-3')
    })

    it('should have responsive grid classes in stats variant', () => {
      const { container } = render(<LoadingSkeleton variant="stats"/>)
      const statsGrid = container.querySelector('.grid')
      expect(statsGrid).toHaveClass('grid-cols-2', 'md:grid-cols-4')
    })
  })

  describe('Visual regression helpers', () => {
    it('should render consistently for snapshot testing - default', () => {
      const { container } = render(<LoadingSkeleton/>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render consistently for snapshot testing - card with all options', () => {
      const { container } = render(
        <LoadingSkeleton
          variant="card"
          lines={3}
          showAvatar={true}
          showStats={true}
          showActions={true}
        />,
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render consistently for snapshot testing - hero', () => {
      const { container } = render(
        <LoadingSkeleton variant="hero" lines={5} showStats={true} showActions={true}/>,
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render consistently for snapshot testing - list', () => {
      const { container } = render(
        <LoadingSkeleton variant="list" lines={4} showAvatar={true}/>,
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})

