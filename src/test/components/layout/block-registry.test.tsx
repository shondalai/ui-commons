import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  getBlockComponent,
  getRegisteredBlockTypes,
  hasBlockComponent,
  registerBlockComponent,
  registerBlockComponents,
  renderBlock,
  useBlockRegistration,
} from '../../../components/layout/block-registry'

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
    it('should return array of registered block types', () => {
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
      const element = renderBlock('non-existent-block', {})
      expect(element).toBeTruthy() // Returns a fallback, not null
    })

    it('should pass config as props to component', () => {
      registerBlockComponent('test-block-props', TestBlock1)
      const element = renderBlock('test-block-props', { title: 'Custom Title' })

      if (element) {
        render(element)
        expect(screen.getByText('Custom Title')).toBeInTheDocument()
      }
    })
  })

  describe('useBlockRegistration', () => {
    it('should register blocks on component mount', () => {
      const TestComponent = () => {
        useBlockRegistration({
          'test-block-hook-1': TestBlock1,
          'test-block-hook-2': TestBlock2,
        })
        return <div>Test</div>
      }

      render(<TestComponent/>)

      expect(hasBlockComponent('test-block-hook-1')).toBe(true)
      expect(hasBlockComponent('test-block-hook-2')).toBe(true)
    })
  })
})

