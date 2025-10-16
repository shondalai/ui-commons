// Generic Layout Service for fetching layout configurations from Joomla backend
import { LayoutConfig } from '@/contexts/layout-context'

export interface LayoutResponse {
  success: boolean
  data?: {
      template?: {
          areas: any[]
          layout?: any
      }
  }
  error?: string
  message?: string
}

/**
 * Generic Layout Service - works with any Joomla component
 */
export class LayoutService {
  private config: LayoutConfig

  constructor (config: LayoutConfig) {
    this.config = config
  }

  /**
   * Fetch layout configuration from backend API
   * @param layoutType - The layout type identifier (e.g., 'dashboard', 'category', 'topic')
   * @param params - Additional query parameters
   * @returns Layout response with areas
   */
  async fetchLayout (
    layoutType: string,
    params: Record<string, any> = {},
  ): Promise<LayoutResponse> {
    try {
      const taskParamName = this.config.taskParamName || 'task'
      const actionParamName = this.config.actionParamName || 'task'

      const queryParams = new URLSearchParams({
        layout: layoutType,
        format: 'json',
        ...params,
      })

      // Support both standard 'task' parameter and custom routing (e.g., 'api.proxy' with 'action')
      if (taskParamName !== actionParamName) {
        // Custom routing: use taskParamName for the route and actionParamName for the actual action
        queryParams.append(taskParamName, 'api.proxy')
        queryParams.append(actionParamName, 'layouts.getLayout')
      } else {
        // Standard routing: use taskParamName for the task
        queryParams.append(taskParamName, 'layouts.getLayout')
      }

      // Add CSRF token if available
      if (this.config.csrfToken) {
        queryParams.append(this.config.csrfToken, '1')
      }

      const separator = this.config.apiBaseUrl.includes('?') ? '&' : '?';
      const url = `${this.config.apiBaseUrl}${separator}${queryParams.toString()}`;

      if (this.config.debug) {
        console.log(`[LayoutService] Fetching layout: ${layoutType}`, url)
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (this.config.debug) {
        console.log(`[LayoutService] Layout response:`, data)
      }

      // Handle Joomla API response format
      if (data.success === false) {
        return {
          success: false,
          error: data.message || 'Failed to fetch layout',
        }
      }

      return {
        success: true,
        data: {
            template: {
                areas: data.data?.template?.areas || data.template.areas || [],
                layout: data.data?.template?.layout || data.template.layout,
            }
        },
      }
    }
    catch (error) {
      console.error('[LayoutService] Error fetching layout:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Fetch multiple layouts at once
   * @param layoutTypes - Array of layout type identifiers
   * @returns Map of layout type to response
   */
  async fetchMultipleLayouts (
    layoutTypes: string[],
  ): Promise<Record<string, LayoutResponse>> {
    const results = await Promise.all(
      layoutTypes.map(async (layoutType) => ({
        layoutType,
        response: await this.fetchLayout(layoutType),
      })),
    )

    return results.reduce((acc, { layoutType, response }) => {
      acc[layoutType] = response
      return acc
    }, {} as Record<string, LayoutResponse>)
  }

  /**
   * Save layout configuration (admin functionality)
   * @param layoutType - The layout type identifier
   * @param areas - Layout areas configuration
   * @returns Success response
   */
  async saveLayout (
    layoutType: string,
    areas: any[],
  ): Promise<LayoutResponse> {
    try {
      const taskParamName = this.config.taskParamName || 'task'
      const actionParamName = this.config.actionParamName || 'task'

      const formData = new FormData()

      // Support both standard 'task' parameter and custom routing (e.g., 'api.proxy' with 'action')
      if (taskParamName !== actionParamName) {
        // Custom routing: use taskParamName for the route and actionParamName for the actual action
        formData.append(taskParamName, 'api.proxy')
        formData.append(actionParamName, 'layouts.saveLayout')
      } else {
        // Standard routing: use taskParamName for the task
        formData.append(taskParamName, 'layouts.saveLayout')
      }

      formData.append('layout', layoutType)
      formData.append('areas', JSON.stringify(areas))
      formData.append('format', 'json')

      if (this.config.csrfToken) {
        formData.append(this.config.csrfToken, '1')
      }

      const response = await fetch(this.config.apiBaseUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        error: data.message,
      }
    }
    catch (error) {
      console.error('[LayoutService] Error saving layout:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}

/**
 * Create a layout service instance
 * @param config - Layout configuration
 * @returns LayoutService instance
 */
export const createLayoutService = (config: LayoutConfig): LayoutService => {
  return new LayoutService(config)
}
