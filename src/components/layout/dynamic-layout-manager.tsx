import React from 'react'
import { cn } from '@/lib/utils'
import { transformCompleteConfig } from '@/utils/config-transformer'
import { renderBlock } from '@/components/layout/block-registry'
import { LayoutArea, LayoutBlock } from '@/types/layout.types.ts'

interface DynamicLayoutManagerProps {
  areas: LayoutArea[]
  contextData?: Record<string, any> // Global context data passed to all blocks
  components?: Record<string, React.ComponentType<any>> // Optional legacy component registry
  componentProps?: Record<string, any> // Optional legacy component props
  isLoading?: boolean
  loadingComponent?: React.ComponentType
  className?: string
  fullWidth?: boolean // Whether to use full width (no max-width constraint)
}

// Static grid classes mapping for Tailwind CSS
const getGridSpanClass = (span: number): string => {
  const gridClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  }
  return gridClasses[Math.min(span, 12)] || 'col-span-12'
}

/**
 * Dynamic Layout Manager - Renders layouts based on database configuration
 * Supports 12-column responsive grid system with Swiss spa aesthetic
 * Now consolidated with block registry system for efficiency
 */
const DynamicLayoutManager: React.FC<DynamicLayoutManagerProps> = ({
  areas,
  contextData = {},
  components,
  componentProps,
  isLoading = false,
  loadingComponent: LoadingComponent,
  className,
  fullWidth = false,
}) => {
  if (isLoading && LoadingComponent) {
    return <LoadingComponent/>
  }

  if (!areas || areas.length === 0) {
    return (
      <div className={cn('min-h-screen bg-background', className)}>
        <div className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8 py-8',
          !fullWidth && 'max-w-7xl'
        )}>
          <div className="text-center text-muted-foreground">
            <p>No layout configuration found. Please configure your page layout.</p>
          </div>
        </div>
      </div>
    )
  }

  // Group areas by row for proper grid layout
  const areasByRow = areas.reduce((acc, area) => {
    const row = area.grid_row
    if (!acc[row]) {
      acc[row] = []
    }
    acc[row].push(area)
    return acc
  }, {} as Record<number, LayoutArea[]>)

  // Separate sticky/full-width blocks from regular blocks
  const stickyBlocks: LayoutBlock[] = []
  const regularRows: Record<number, LayoutArea[]> = {}

  Object.keys(areasByRow).forEach(rowKey => {
    const rowAreas = areasByRow[Number(rowKey)]
    if (!rowAreas || !Array.isArray(rowAreas)) {
      return
    }

    const hasFullWidthOrSticky = rowAreas.some(area =>
      area.blocks?.some(block => {
        const config = block.block_config || {}
        return config.sticky_header === 'true' || config.full_width === 'true'
      }),
    )

    if (hasFullWidthOrSticky && rowAreas.length === 1 && rowAreas[0].blocks?.length === 1) {
      // Extract sticky/full-width block to render outside container
      stickyBlocks.push(rowAreas[0].blocks[0])
    } else {
      regularRows[Number(rowKey)] = rowAreas
    }
  })

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Render sticky/full-width blocks outside container */}
      {stickyBlocks.map(block => (
        <BlockRenderer
          key={block.id}
          block={block}
          contextData={contextData}
          components={components}
          componentProps={componentProps}
          isInGrid={false}
        />
      ))}

      {/* Render regular blocks in container */}
      <div className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6',
        !fullWidth && 'max-w-7xl'
      )}>
        {Object.keys(regularRows).sort((a, b) => Number(a) - Number(b)).map(rowKey => {
          const rowAreas = regularRows[Number(rowKey)]
          return (
            <div key={rowKey} className="w-full">
              <div className="grid grid-cols-12 gap-4 lg:gap-6">
                {rowAreas.sort((a, b) => a.grid_order - b.grid_order).map(area => (
                  <AreaRenderer
                    key={area.id}
                    area={area}
                    contextData={contextData}
                    components={components}
                    componentProps={componentProps}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface AreaRendererProps {
  area: LayoutArea
  contextData: Record<string, any>
  components?: Record<string, React.ComponentType<any>>
  componentProps?: Record<string, any>
}

const AreaRenderer: React.FC<AreaRendererProps> = React.memo(({
  area,
  contextData,
  components,
  componentProps,
}) => {
  // Apply responsive configuration if available
  const getResponsiveClasses = () => {
    let classes = getGridSpanClass(area.grid_columns)

    if (area.responsive_config) {
      const responsive = area.responsive_config
      if (responsive.sm) {
        classes += ` sm:${getGridSpanClass(responsive.sm)}`
      }
      if (responsive.md) {
        classes += ` md:${getGridSpanClass(responsive.md)}`
      }
      if (responsive.lg) {
        classes += ` lg:${getGridSpanClass(responsive.lg)}`
      }
      if (responsive.xl) {
        classes += ` xl:${getGridSpanClass(responsive.xl)}`
      }
    }

    return classes
  }

  if (!area.blocks || area.blocks.length === 0) {
    return (
      <div className={cn('space-y-4', getResponsiveClasses())}>
        <div className="text-center text-muted-foreground text-sm py-8">
          <p>No blocks configured for {area.area_name}</p>
        </div>
      </div>
    )
  }

  // Check if blocks have DIFFERENT grid spans configured - if so, use grid layout
  // Only create a nested grid if blocks actually need different column spans
  const blockSpans = area.blocks.map(block => block.grid_column_span || 12)
  const hasVariableGridSpans = blockSpans.length > 1 && new Set(blockSpans).size > 1
  const hasNonFullWidthBlocks = area.blocks.some(block =>
    block.grid_column_span && block.grid_column_span < 12
  )

  // If blocks have different grid configurations, create an internal grid
  // The area respects its own grid_columns while containing an internal grid for the blocks
  if (hasVariableGridSpans || hasNonFullWidthBlocks) {
    return (
      <div className={cn(getResponsiveClasses())}>
        <div className="grid grid-cols-12 gap-4">
          {area.blocks.sort((a, b) => a.ordering - b.ordering).map(block => (
            <BlockRenderer
              key={block.id}
              block={block}
              contextData={contextData}
              components={components}
              componentProps={componentProps}
              isInGrid={true}
            />
          ))}
        </div>
      </div>
    )
  }

  // Otherwise, stack blocks vertically (legacy behavior) - no nested grid needed
  return (
    <div className={cn('space-y-4', getResponsiveClasses())}>
      {area.blocks.sort((a, b) => a.ordering - b.ordering).map(block => (
        <BlockRenderer
          key={block.id}
          block={block}
          contextData={contextData}
          components={components}
          componentProps={componentProps}
          isInGrid={false}
        />
      ))}
    </div>
  )
})

interface BlockRendererProps {
  block: LayoutBlock
  contextData: Record<string, any>
  components?: Record<string, React.ComponentType<any>>
  componentProps?: Record<string, any>
  isInGrid?: boolean
}

const BlockRenderer: React.FC<BlockRendererProps> = React.memo(({
  block,
  contextData,
  components,
  componentProps,
  isInGrid = true, // Default to true for backward compatibility
}) => {
  // Skip disabled blocks
  if (!block.enabled) {
    return null
  }

  // Check if this is a sticky or full-width block
  const config = block.block_config || {}

  // Apply consistent configuration transformation for both systems
  const blockConfig = transformCompleteConfig(config || {})

  // Check conditional rendering
  if (blockConfig.conditional) {
    const blockProps = componentProps?.[block.block_type] || {}
    const conditionValue = blockProps[blockConfig.conditional]

    if (!conditionValue) {
      return null
    }
  }

  // Generic shouldRender check - allows page-specific conditional logic
  const blockProps = componentProps?.[block.block_type] || {}
  if (blockProps.shouldRender !== undefined && blockProps.shouldRender === false) {
    console.log(`Block ${block.block_type} skipped - shouldRender = false`)
    return null
  }

  const isStickyOrFullWidth = blockConfig.stickyHeader === true || blockConfig.fullWidth === true

  // Apply block-level grid configuration and styling
  const getBlockClasses = () => {
    let classes = ''

    // Only apply grid column span classes if the block is in a grid container
    if (isInGrid && block.grid_column_span) {
      classes += getGridSpanClass(block.grid_column_span)
    } else if (!isInGrid) {
      // When not in a grid, use full width
      classes += 'w-full'
    } else if (isInGrid && !block.grid_column_span) {
      // In a grid but no span specified, default to full width
      classes += 'col-span-12'
    }

    // Apply CSS class from block config
    if (blockConfig.cssClass) {
      classes += ` ${blockConfig.cssClass}`
    }

    // Apply responsive configuration for the block
    if (block.responsive_config) {
      const responsive = block.responsive_config
      if (responsive.hidden_sm) {
        classes += ' sm:hidden'
      }
      if (responsive.hidden_md) {
        classes += ' md:hidden'
      }
      if (responsive.hidden_lg) {
        classes += ' lg:hidden'
      }
      if (responsive.hidden_xl) {
        classes += ' xl:hidden'
      }

      // Apply responsive grid spans using static class mapping
      if (responsive.mobile_span) {
        classes += ` ${getGridSpanClass(responsive.mobile_span)}`
      }
      if (responsive.tablet_span) {
        classes += ` md:${getGridSpanClass(responsive.tablet_span)}`
      }
      if (responsive.desktop_span) {
        classes += ` lg:${getGridSpanClass(responsive.desktop_span)}`
      }
    }

    return classes
  }

  // Apply block styling (background, padding, margin)
  const getBlockStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {}

    if (blockConfig.backgroundColor) {
      styles.backgroundColor = blockConfig.backgroundColor
    }

    if (blockConfig.padding) {
      styles.padding = blockConfig.padding
    }

    if (blockConfig.margin) {
      styles.margin = blockConfig.margin
    }

    return styles
  }

  // Parse custom attributes
  const getCustomAttributes = () => {
    const attributes: Record<string, any> = {}

    if (blockConfig.customAttributes) {
      try {
        const customAttrs = typeof blockConfig.customAttributes === 'string'
          ? JSON.parse(blockConfig.customAttributes)
          : blockConfig.customAttributes

        if (typeof customAttrs === 'object' && customAttrs !== null) {
          Object.assign(attributes, customAttrs)
        }
      }
      catch (error) {
        console.warn(`Invalid custom attributes for block ${block.id}:`, error)
      }
    }

    return attributes
  }

  // Get component-specific props from componentProps
  const blockComponentProps = componentProps?.[block.block_type] || {}

  const mergedData = {
    ...blockConfig,  // Use transformed config instead of raw
    ...contextData,
    ...blockComponentProps,     // Add component-specific props (this includes categories data)
  }

  const blockRegistryComponent = renderBlock(
    block.block_type,
    mergedData,
    `block_${block.id}`,
    getBlockClasses(),
  )

  if (blockRegistryComponent) {
    // For sticky/full-width blocks, don't wrap in a div - return component directly
    if (isStickyOrFullWidth) {
      return blockRegistryComponent
    }

    // For regular blocks, wrap with styling AND grid classes
    return (
      <div
        className={cn(getBlockClasses())}
        style={getBlockStyles()}
        {...getCustomAttributes()}
      >
        {blockRegistryComponent}
      </div>
    )
  }

  // Fallback to legacy component system if block registry doesn't have the component
  const Component = components?.[block.block_type]

  if (!Component) {
    return (
      <div className="p-4 border-2 border-dashed border-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Block type "{block.block_type}" not found</p>
          <p className="text-xs mt-1">Expected component: {block.block_name}</p>
        </div>
      </div>
    )
  }

  const props = {
    ...componentProps?.[block.block_type],
    config: {
      ...componentProps?.[block.block_type]?.config,
      ...blockConfig,  // Use the same transformed config
      ...contextData,
    },
    blockId: block.id,
    blockName: block.block_name,
    responsive: block.responsive_config,
  }

  // For sticky/full-width blocks, don't wrap in a div
  if (isStickyOrFullWidth) {
    return <Component {...props} />
  }

  return (
    <div
      className={cn(getBlockClasses())}
      style={getBlockStyles()}
      {...getCustomAttributes()}
    >
      <Component {...props} />
    </div>
  )
})

export default React.memo(DynamicLayoutManager)
