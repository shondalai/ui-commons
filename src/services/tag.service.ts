import { Tag, TagsResponse } from '../types/common.types'

/**
 * Tag Service - Handles tag-related operations
 * This is a generic service that can be used across different Joomla extensions
 */
export class TagService {
  /**
   * Get available tags
   * @param baseUrl - The base URL for the API endpoint (e.g., '/index.php?option=com_yourext')
   * @param params - Query parameters for filtering tags
   */
  static async getTags (
    baseUrl: string,
    params: {
      published?: number
      search?: string
      limit?: number
      start?: number
      [key: string]: any
    } = {},
  ): Promise<TagsResponse> {
    const queryString = new URLSearchParams()

    // Build query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value))
      }
    })

    const token = (window as any).Joomla?.getOptions?.('csrf.token') || ''
    if (token) {
      queryString.append(token, '1')
    }

    const url = `${baseUrl}&task=tag.get&format=json${
      queryString.toString() ? '&' + queryString.toString() : ''
    }`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        return {
          data: Array.isArray(result.data) ? result.data : [],
          total: result.total || result.data.length || 0,
          success: true,
        }
      }

      return {
        data: [],
        total: 0,
        success: false,
      }
    }
    catch (error) {
      console.error('Error fetching tags:', error)
      throw error
    }
  }

  /**
   * Create a new tag
   * @param baseUrl - The base URL for the API endpoint
   * @param data - Tag data to create
   */
  static async createTag (
    baseUrl: string,
    data: {
      title: string
      description?: string
      parent_id?: number
      [key: string]: any
    },
  ): Promise<{ success: boolean; data?: Tag; message?: string }> {
    const token = (window as any).Joomla?.getOptions?.('csrf.token') || ''
    const queryParams = new URLSearchParams()

    if (token) {
      queryParams.append(token, '1')
    }

    const url = `${baseUrl}&task=tag.create&format=json${
      queryParams.toString() ? '&' + queryParams.toString() : ''
    }`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create tag: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message || 'Tag created successfully',
        }
      }

      return {
        success: false,
        message: result.message || 'Failed to create tag',
      }
    }
    catch (error) {
      console.error('Error creating tag:', error)
      throw error
    }
  }

  /**
   * Search tags by title
   * @param baseUrl - The base URL for the API endpoint
   * @param query - Search query
   * @param limit - Maximum number of results
   */
  static async searchTags (
    baseUrl: string,
    query: string,
    limit: number = 10,
  ): Promise<Tag[]> {
    const response = await this.getTags(baseUrl, {
      published: 1,
      search: query,
      limit,
    })
    return response.data
  }

  /**
   * Helper method to build a tag fetcher function for components
   * This is useful for components like TagSelector that need a fetchTags callback
   *
   * @param baseUrl - The base URL for the API endpoint
   * @returns A function that can be passed to TagSelector or similar components
   *
   * @example
   * const fetchTags = TagService.createFetcher('/index.php?option=com_cjforum')
   * <TagSelector fetchTags={fetchTags} ... />
   */
  static createFetcher (baseUrl: string): (search: string) => Promise<Tag[]> {
    return async (search: string) => {
      const response = await this.getTags(baseUrl, {
        published: 1,
        search: search || undefined,
        limit: 50,
      })
      return response.data
    }
  }

  /**
   * Helper method to build a tag creator function for components
   * This is useful for components like TagSelector that need a createTag callback
   *
   * @param baseUrl - The base URL for the API endpoint
   * @returns A function that can be passed to TagSelector or similar components
   *
   * @example
   * const createTag = TagService.createCreator('/index.php?option=com_cjforum')
   * <TagSelector createTag={createTag} ... />
   */
  static createCreator (baseUrl: string): (title: string) => Promise<Tag | null> {
    return async (title: string) => {
      try {
        const result = await this.createTag(baseUrl, { title })
        return result.success && result.data ? result.data : null
      }
      catch (error) {
        console.error('Error in tag creator:', error)
        return null
      }
    }
  }
}
