// Generic block registry that can be extended by applications
import React, { useEffect } from 'react'

// Global block component registry - can be extended for any page type
const globalBlockRegistry: Record<string, React.ComponentType<any>> = {}

/**
 * Register a new block component
 * @param blockType - Unique identifier for the block type
 * @param component - React component to render for this block type
 */
export const registerBlockComponent = (
  blockType: string,
  component: React.ComponentType<any>,
) => {
  globalBlockRegistry[blockType] = component
}

/**
 * Register multiple block components at once
 * @param blocks - Object mapping block types to components
 */
export const registerBlockComponents = (
  blocks: Record<string, React.ComponentType<any>>,
) => {
  Object.entries(blocks).forEach(([blockType, component]) => {
    globalBlockRegistry[blockType] = component
  })
}

/**
 * Hook to register blocks on component mount
 * Usage in your component root (e.g., App.tsx):
 *
 * import { useBlockRegistration } from '@shondalai/ui-commons'
 * import { myBlocks } from './components/blocks'
 *
 * function App() {
 *   useBlockRegistration(myBlocks)
 *   return <YourApp />
 * }
 *
 * @param blocks - Object mapping block types to components
 */
export const useBlockRegistration = (
  blocks: Record<string, React.ComponentType<any>>,
) => {
  useEffect(() => {
    registerBlockComponents(blocks)

    // Optional cleanup - useful if you want to deregister on unmount
    // return () => {
    //   Object.keys(blocks).forEach(blockType => {
    //     delete globalBlockRegistry[blockType]
    //   })
    // }
  }, [blocks])
}

/**
 * Get a block component by type
 * @param blockType - The block type identifier
 * @returns The component or null if not found
 */
export const getBlockComponent = (blockType: string): React.ComponentType<any> | null => {
  return globalBlockRegistry[blockType] || null
}

/**
 * Check if a block type is registered
 * @param blockType - The block type identifier
 * @returns True if the block type exists
 */
export const hasBlockComponent = (blockType: string): boolean => {
  return blockType in globalBlockRegistry
}

/**
 * Get all registered block types
 * @returns Array of registered block type identifiers
 */
export const getRegisteredBlockTypes = (): string[] => {
  return Object.keys(globalBlockRegistry)
}

/**
 * Direct block rendering function
 * @param blockType - The block type to render
 * @param config - Configuration and context data to pass to the component
 * @param key - React key for the element
 * @param className - Additional CSS classes
 * @returns React element or null if block type not found
 */
export const renderBlock = (
  blockType: string,
  config: Record<string, any> = {},
  key?: string,
  className?: string,
): React.ReactElement | null => {
  const Component = getBlockComponent(blockType)

  if (!Component) {
    console.warn(`renderBlock: Block type "${blockType}" not found in registry`)
    return (
      <div key={key} className={`p-4 border border-muted rounded-lg bg-muted/5 ${className || ''}`}>
        <p className="text-muted-foreground text-sm">
          Block type "{blockType}" not found
        </p>
      </div>
    )
  }

  // Spread all config/contextData as direct props to the component
  return React.createElement(Component, {
    key,
    className,
    ...config,  // Spread all context data as direct props
    config,     // Also keep config prop for blocks that expect it
  })
}

/**
 * Clear all registered blocks (useful for testing)
 */
export const clearBlockRegistry = () => {
  Object.keys(globalBlockRegistry).forEach(key => {
    delete globalBlockRegistry[key]
  })
}

// Export the registry for direct access if needed
export { globalBlockRegistry }
