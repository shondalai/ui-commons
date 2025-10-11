/**
 * Configuration transformer utilities for converting database config to component-friendly format
 */

export interface RawBlockConfig {
  [key: string]: any
}

export interface TransformedBlockConfig {
  [key: string]: any
}

/**
 * Transform raw database configuration to component-friendly format
 * Handles string boolean conversion and property mapping
 */
export const transformBlockConfig = (rawConfig: RawBlockConfig): TransformedBlockConfig => {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return {}
  }

  const transformed: TransformedBlockConfig = {}

  // Process each config property
  Object.entries(rawConfig).forEach(([key, value]) => {
    // Skip grid-related properties that are handled at the layout level
    if (key.startsWith('grid_') || key === 'enabled') {
      return
    }

    // Convert string booleans to actual booleans
    if (value === 'true') {
      transformed[key] = true
    } else if (value === 'false') {
      transformed[key] = false
    } else if (value === 'null' || value === null) {
      transformed[key] = null
    } else if (value === 'undefined') {
      transformed[key] = undefined
    } else if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      // Convert numeric strings to numbers (but not empty strings)
      transformed[key] = Number(value)
    } else {
      // Keep the value as-is
      transformed[key] = value
    }
  })

  return transformed
}

/**
 * Transform snake_case keys to camelCase for component compatibility
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Transform configuration object keys from snake_case to camelCase
 */
export const transformKeysToCamelCase = (config: Record<string, any>): Record<string, any> => {
  const transformed: Record<string, any> = {}

  Object.entries(config).forEach(([key, value]) => {
    const camelKey = toCamelCase(key)
    transformed[camelKey] = value

    // Also keep the original snake_case key for backward compatibility
    if (camelKey !== key) {
      transformed[key] = value
    }
  })

  return transformed
}

/**
 * Complete configuration transformer that handles both boolean conversion and key transformation
 */
export const transformCompleteConfig = (rawConfig: RawBlockConfig): TransformedBlockConfig => {
  const booleanTransformed = transformBlockConfig(rawConfig)
  return transformKeysToCamelCase(booleanTransformed)
}
