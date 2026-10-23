// Generic Layout Hook - works with any Joomla component
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
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

// Context values may be recreated by the host app. Rebuild the service only
// when configuration values change, not on every parent render.
const useLayoutService = () => {
  const { apiBaseUrl, csrfToken, componentName, apiClient, debug, taskParamName, actionParamName } = useLayoutConfig()
  return useMemo(() => createLayoutService({
    apiBaseUrl, csrfToken, componentName, apiClient, debug, taskParamName, actionParamName,
  }), [apiBaseUrl, csrfToken, componentName, apiClient, debug, taskParamName, actionParamName])
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
  const layoutService = useLayoutService()
  const [areas, setAreas] = useState<LayoutArea[]>([])
  const [layout, setLayout] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const requestId = useRef(0)
  const paramsKey = JSON.stringify(params)

  const fetchLayout = useCallback(async () => {
    const currentRequest = ++requestId.current
    setIsLoading(true)
    setError(null)

    try {
      const response: LayoutResponse = await layoutService.fetchLayout(layoutType, JSON.parse(paramsKey))
      if (currentRequest !== requestId.current) return

      if (response.success && response.data && response.data.template) {
        setAreas(response.data.template.areas || [])
        setLayout(response.data.template.layout)
      } else {
        setError(response.error || 'Failed to load layout')
        setAreas([])
      }
    }
    catch (err) {
      if (currentRequest !== requestId.current) return
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setAreas([])
    }
    finally {
      if (currentRequest === requestId.current) setIsLoading(false)
    }
  }, [layoutService, layoutType, paramsKey])

  useEffect(() => {
    void fetchLayout()
    return () => { requestId.current += 1 }
  }, [fetchLayout])

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
  const layoutService = useLayoutService()
  const [results, setResults] = useState<Record<string, UseLayoutResult>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const layoutTypesKey = JSON.stringify(layoutTypes)

  useEffect(() => {
    let cancelled = false
    setIsInitialized(false)
    const fetchLayouts = async () => {
      const responses = await layoutService.fetchMultipleLayouts(JSON.parse(layoutTypesKey))
      if (cancelled) return

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
            if (!cancelled && newResponse.success && newResponse.data?.template) {
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
    return () => { cancelled = true }
  }, [layoutService, layoutTypesKey])

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
