// Generic Layout Hook - works with any Joomla component
import { useEffect, useState } from 'react'
import { useLayoutConfig } from '@/contexts/layout-context'
import { createLayoutService, LayoutResponse } from '@/services/layout-service'
import { LayoutArea } from '@/types/layout.types'

export interface UseLayoutResult {
  areas: LayoutArea[]
  layout?: any
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Generic hook for fetching layout configurations from any Joomla component
 *
 * Usage:
 * ```tsx
 * import { useLayout } from '@shondalai/ui-commons'
 *
 * function MyPage() {
 *   const { areas, isLoading, error } = useLayout('dashboard')
 *
 *   if (isLoading) return <LoadingComponent />
 *   if (error) return <ErrorComponent error={error} />
 *
 *   return <DynamicLayoutManager areas={areas} />
 * }
 * ```
 *
 * @param layoutType - The layout type identifier (e.g., 'dashboard', 'category')
 * @param params - Additional query parameters for the API request
 * @returns Layout areas, loading state, and error
 */
export const useLayout = (
  layoutType: string,
  params: Record<string, any> = {},
): UseLayoutResult => {
  const config = useLayoutConfig()
  const [areas, setAreas] = useState<LayoutArea[]>([])
  const [layout, setLayout] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLayout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const layoutService = createLayoutService(config)
      const response: LayoutResponse = await layoutService.fetchLayout(layoutType, params)

      if (response.success && response.data && response.data.template) {
        setAreas(response.data.template.areas || [])
        setLayout(response.data.template.layout)
      } else {
        setError(response.error || 'Failed to load layout')
        setAreas([])
      }
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setAreas([])
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLayout()
  }, [layoutType, JSON.stringify(params)])

  return {
    areas,
    layout,
    isLoading,
    error,
    refetch: fetchLayout,
  }
}

/**
 * Hook for fetching multiple layouts at once
 *
 * @param layoutTypes - Array of layout type identifiers
 * @returns Map of layout results by type
 */
export const useMultipleLayouts = (
  layoutTypes: string[],
): Record<string, UseLayoutResult> => {
  const config = useLayoutConfig()
  const [results, setResults] = useState<Record<string, UseLayoutResult>>({})
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchLayouts = async () => {
      const layoutService = createLayoutService(config)
      const responses = await layoutService.fetchMultipleLayouts(layoutTypes)

      const newResults: Record<string, UseLayoutResult> = {}

      Object.entries(responses).forEach(([layoutType, response]) => {
        newResults[layoutType] = {
          areas: response.success && response.data && response.data.template ? response.data.template.areas : [],
          layout: response.success && response.data && response.data.template ? response.data.template.layout : null,
          isLoading: false,
          error: response.success ? null : (response.error || 'Failed to load layout'),
          refetch: async () => {
            // Implement refetch for individual layout
            const newResponse = await layoutService.fetchLayout(layoutType)
            if (newResponse.success && newResponse.data) {
              setResults(prev => ({
                ...prev,
                [layoutType]: {
                  ...prev[layoutType],
                  areas: newResponse.data!.template!.areas,
                  layout: newResponse.data!.template!.layout,
                  error: null,
                },
              }))
            }
          },
        }
      })

      setResults(newResults)
      setIsInitialized(true)
    }

    fetchLayouts()
  }, [layoutTypes.join(',')])

  // Return loading state for all layouts before initialized
  if (!isInitialized) {
    return layoutTypes.reduce((acc, layoutType) => {
      acc[layoutType] = {
        areas: [],
        layout: null,
        isLoading: true,
        error: null,
        refetch: async () => {},
      }
      return acc
    }, {} as Record<string, UseLayoutResult>)
  }

  return results
}

