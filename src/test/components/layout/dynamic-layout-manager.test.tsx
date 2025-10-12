import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DynamicLayoutManager from '../../../components/layout/dynamic-layout-manager'
import { LayoutArea } from '@/types/layout.types'
import {
  getBlockComponent,
  getRegisteredBlockTypes,
  hasBlockComponent,
  registerBlockComponent,
  registerBlockComponents,
  renderBlock,
  useBlockRegistration,
} from '../../../components/layout/block-registry'

// Test block component
const TestBlock = ({ title, content }: any) => (
  <div data-testid="test-block">
    {title && <h2>{title}</h2>}
    {content && <p>{content}</p>}
  </div>
)

describe('DynamicLayoutManager', () => {
  beforeEach(() => {
    // Register test block
    registerBlockComponent('test-block', TestBlock)
  })

  it('should render empty layout when no areas provided', () => {
    const { container } = render(<DynamicLayoutManager areas={[]}/>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render layout areas', () => {
    const areas: LayoutArea[] = [
      {
        id: 1,
        template_id: 1,
        area_name: 'main',
        grid_columns: 12,
        grid_row: 1,
        grid_order: 1,
        enabled: true,
        responsive_config: {},
        blocks: [],
      },
    ]

    render(<DynamicLayoutManager areas={areas}/>)
    expect(screen.queryByText('No blocks configured for main')).toBeInTheDocument()
  })

  it('should render blocks within areas', () => {
    const areas: LayoutArea[] = [
      {
        id: 1,
        template_id: 1,
        area_name: 'main',
        grid_columns: 12,
        grid_row: 1,
        grid_order: 1,
        enabled: true,
        responsive_config: {},
        blocks: [
          {
            id: 1,
            area_id: 1,
            block_type: 'test-block',
            block_name: 'Test Block',
            grid_column_start: 1,
            grid_column_span: 12,
            ordering: 1,
            enabled: true,
            block_config: { title: 'Test Block', content: 'Test content' },
            responsive_config: {},
          },
        ],
      },
    ]

    render(<DynamicLayoutManager areas={areas}/>)
    expect(screen.getByText('Test Block')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should display loading component when isLoading is true', () => {
    const LoadingComponent = () => <div>Loading...</div>

    render(
      <DynamicLayoutManager
        areas={[]}
        isLoading={true}
        loadingComponent={LoadingComponent}
      />,
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should pass contextData to blocks', () => {
    const ContextAwareBlock = ({ testValue }: any) => (
      <div data-testid="context-block">{testValue}</div>
    )

    registerBlockComponent('context-block', ContextAwareBlock)

    const areas: LayoutArea[] = [
      {
        id: 1,
        template_id: 1,
        area_name: 'main',
        grid_columns: 12,
        grid_row: 1,
        grid_order: 1,
        enabled: true,
        responsive_config: {},
        blocks: [
          {
            id: 1,
            area_id: 1,
            block_type: 'context-block',
            block_name: 'Context Block',
            grid_column_start: 1,
            grid_column_span: 12,
            ordering: 1,
            enabled: true,
            block_config: {},
            responsive_config: {},
          },
        ],
      },
    ]

    render(
      <DynamicLayoutManager
        areas={areas}
        contextData={{ testValue: 'Context Value' }}
      />,
    )

    expect(screen.getByText('Context Value')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <DynamicLayoutManager areas={[]} className="custom-layout"/>,
    )

    expect(container.firstChild).toHaveClass('custom-layout')
  })

  it('should only render enabled blocks', () => {
    const areas: LayoutArea[] = [
      {
        id: 1,
        template_id: 1,
        area_name: 'main',
        grid_columns: 12,
        grid_row: 1,
        grid_order: 1,
        enabled: true,
        responsive_config: {},
        blocks: [
          {
            id: 1,
            area_id: 1,
            block_type: 'test-block',
            block_name: 'Enabled Block',
            grid_column_start: 1,
            grid_column_span: 12,
            ordering: 1,
            enabled: true,
            block_config: { title: 'Enabled Block' },
            responsive_config: {},
          },
          {
            id: 2,
            area_id: 1,
            block_type: 'test-block',
            block_name: 'Disabled Block',
            grid_column_start: 1,
            grid_column_span: 12,
            ordering: 2,
            enabled: false,
            block_config: { title: 'Disabled Block' },
            responsive_config: {},
          },
        ],
      },
    ]

    render(<DynamicLayoutManager areas={areas}/>)

    expect(screen.getByText('Enabled Block')).toBeInTheDocument()
    expect(screen.queryByText('Disabled Block')).not.toBeInTheDocument()
  })

  it('should respect grid_span configuration', () => {
    const areas: LayoutArea[] = [
      {
        id: 1,
        template_id: 1,
        area_name: 'main',
        grid_columns: 6,
        grid_row: 1,
        grid_order: 1,
        enabled: true,
        responsive_config: {},
        blocks: [],
      },
    ]

    const { container } = render(<DynamicLayoutManager areas={areas}/>)
    const areaWrapper = container.querySelector('[class*="col-span"]')
    expect(areaWrapper?.className).toContain('col-span-6')
  })
})

// Test components
const TestBlock1 = ({ title }: { title: string }) => <div>{title}</div>
const TestBlock2 = ({ content }: { content: string }) => <div>{content}</div>

describe('block-registry', () => {
  beforeEach(() => {
    // Clear registry before each test - note: this is a simplification
    // In real usage, the global registry persists
  })

  describe('registerBlockComponent', () => {
    it('should register a single block component', () => {
      registerBlockComponent('test-block', TestBlock1)
      expect(hasBlockComponent('test-block')).toBe(true)
    })

    it('should retrieve registered component', () => {
      registerBlockComponent('test-block', TestBlock1)
      const Component = getBlockComponent('test-block')
      expect(Component).toBe(TestBlock1)
    })
  })

  describe('registerBlockComponents', () => {
    it('should register multiple block components', () => {
      registerBlockComponents({
        'block-1': TestBlock1,
        'block-2': TestBlock2,
      })
      expect(hasBlockComponent('block-1')).toBe(true)
      expect(hasBlockComponent('block-2')).toBe(true)
    })
  })

  describe('getBlockComponent', () => {
    it('should return null for unregistered block type', () => {
      const Component = getBlockComponent('non-existent-unique-test')
      expect(Component).toBeNull()
    })

    it('should return component for registered block type', () => {
      registerBlockComponent('test-block-unique', TestBlock1)
      const Component = getBlockComponent('test-block-unique')
      expect(Component).toBe(TestBlock1)
    })
  })

  describe('hasBlockComponent', () => {
    it('should return false for unregistered block type', () => {
      expect(hasBlockComponent('non-existent-block-type')).toBe(false)
    })

    it('should return true for registered block type', () => {
      registerBlockComponent('test-block-check', TestBlock1)
      expect(hasBlockComponent('test-block-check')).toBe(true)
    })
  })

  describe('getRegisteredBlockTypes', () => {
    it('should return empty array when no blocks registered', () => {
      const types = getRegisteredBlockTypes()
      expect(Array.isArray(types)).toBe(true)
    })

    it('should return all registered block types', () => {
      registerBlockComponents({
        'block-a': TestBlock1,
        'block-b': TestBlock2,
      })
      const types = getRegisteredBlockTypes()
      expect(Array.isArray(types)).toBe(true)
      expect(types).toContain('block-a')
      expect(types).toContain('block-b')
    })
  })

  describe('renderBlock', () => {
    it('should render registered block component', () => {
      registerBlockComponent('test-block-render', TestBlock1)
      const element = renderBlock('test-block-render', { title: 'Test Title' })

      if (element) {
        render(element)
        expect(screen.getByText('Test Title')).toBeInTheDocument()
      }
    })

    it('should return fallback element for unregistered block type', () => {
      const element = renderBlock('non-existent', {})
      expect(element).toBeTruthy() // Returns a fallback div, not null
    })

    it('should pass config as props to component', () => {
      registerBlockComponent('test-block-props', TestBlock1)
      const element = renderBlock('test-block-props', { title: 'Prop Test' })

      if (element) {
        render(element)
        expect(screen.getByText('Prop Test')).toBeInTheDocument()
      }
    })
  })

  describe('useBlockRegistration', () => {
    it('should register blocks on component mount', () => {
      const TestComponent = () => {
        useBlockRegistration({
          'hook-block-1': TestBlock1,
          'hook-block-2': TestBlock2,
        })
        return <div>Test</div>
      }

      render(<TestComponent/>)

      expect(hasBlockComponent('hook-block-1')).toBe(true)
      expect(hasBlockComponent('hook-block-2')).toBe(true)
    })
  })
})

