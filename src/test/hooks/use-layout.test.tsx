import {act, renderHook, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {ReactNode} from 'react'
import {LayoutProvider} from '../../contexts/layout-context'
import {useLayout, useMultipleLayouts} from '../../hooks/use-layout'
import type {LayoutResponse} from '../../services/layout-service'

const {fetchLayout, fetchMultipleLayouts} = vi.hoisted(() => ({
  fetchLayout: vi.fn(),
  fetchMultipleLayouts: vi.fn(),
}))

vi.mock('../../services/layout-service', () => ({
  createLayoutService: (config: {apiBaseUrl: string}) => ({
    fetchLayout: (type: string, params?: object) => fetchLayout(config.apiBaseUrl, type, params),
    fetchMultipleLayouts: (types: string[]) => fetchMultipleLayouts(config.apiBaseUrl, types),
  }),
}))

const response = (name: string): LayoutResponse => ({
  success: true,
  data: {template: {areas: [], layout: {name}}},
})

let apiBaseUrl = '/first'
function Wrapper({children}: {children: ReactNode}) {
  // Host apps can pass an equivalent new config object each time they render.
  return <LayoutProvider config={{apiBaseUrl, componentName: 'test'}}>{children}</LayoutProvider>
}

beforeEach(() => {
  apiBaseUrl = '/first'
  fetchLayout.mockReset().mockResolvedValue(response('default'))
  fetchMultipleLayouts.mockReset().mockResolvedValue({dashboard: response('default')})
})

describe('layout request dependencies', () => {
  it('reloads for a new layout type even when the query parameters are unchanged', async () => {
    const {result, rerender} = renderHook(({type}) => useLayout(type, {id: 1}), {
      initialProps: {type: 'dashboard'}, wrapper: Wrapper,
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    rerender({type: 'topic'})
    await waitFor(() => expect(fetchLayout).toHaveBeenLastCalledWith('/first', 'topic', {id: 1}))
    rerender({type: 'topic'})
    expect(fetchLayout).toHaveBeenCalledTimes(2)
  })

  it('reloads when component configuration changes', async () => {
    const {result, rerender} = renderHook(() => useLayout('dashboard'), {wrapper: Wrapper})
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    apiBaseUrl = '/second'
    rerender()
    await waitFor(() => expect(fetchLayout).toHaveBeenLastCalledWith('/second', 'dashboard', {}))
  })

  it('loads changed parameters while an earlier request is pending and ignores the stale response', async () => {
    let resolveFirst!: (value: LayoutResponse) => void
    fetchLayout.mockReturnValueOnce(new Promise<LayoutResponse>(resolve => { resolveFirst = resolve }))
      .mockResolvedValueOnce(response('current'))
    const {result, rerender} = renderHook(({id}) => useLayout('topic', {id}), {
      initialProps: {id: 1}, wrapper: Wrapper,
    })
    rerender({id: 2})
    await waitFor(() => expect(result.current.layout).toEqual({name: 'current'}))
    await act(async () => { resolveFirst(response('stale')) })
    expect(result.current.layout).toEqual({name: 'current'})
    expect(result.current.isLoading).toBe(false)
  })

  it('does not replace a current layout with an error from an older request', async () => {
    let rejectFirst!: (reason: Error) => void
    fetchLayout.mockReturnValueOnce(new Promise<LayoutResponse>((_resolve, reject) => { rejectFirst = reject }))
      .mockResolvedValueOnce(response('current'))
    const {result, rerender} = renderHook(({id}) => useLayout('topic', {id}), {
      initialProps: {id: 1}, wrapper: Wrapper,
    })
    rerender({id: 2})
    await waitFor(() => expect(result.current.layout).toEqual({name: 'current'}))
    await act(async () => { rejectFirst(new Error('Old request failed')) })
    expect(result.current.error).toBeNull()
    expect(result.current.layout).toEqual({name: 'current'})
    expect(result.current.isLoading).toBe(false)
  })

  it('refreshes multiple layouts for configuration changes without refetching equal arrays', async () => {
    const {result, rerender} = renderHook(() => useMultipleLayouts(['dashboard']), {wrapper: Wrapper})
    await waitFor(() => expect(result.current.dashboard.isLoading).toBe(false))
    rerender()
    expect(fetchMultipleLayouts).toHaveBeenCalledTimes(1)
    apiBaseUrl = '/second'
    rerender()
    await waitFor(() => expect(fetchMultipleLayouts).toHaveBeenLastCalledWith('/second', ['dashboard']))
  })

  it('shows loading for a changed layout list and ignores responses for the previous list', async () => {
    let resolveFirst!: (value: Record<string, LayoutResponse>) => void
    let resolveSecond!: (value: Record<string, LayoutResponse>) => void
    fetchMultipleLayouts.mockReturnValueOnce(new Promise<Record<string, LayoutResponse>>(resolve => { resolveFirst = resolve }))
      .mockReturnValueOnce(new Promise<Record<string, LayoutResponse>>(resolve => { resolveSecond = resolve }))
    const {result, rerender} = renderHook(({types}) => useMultipleLayouts(types), {
      initialProps: {types: ['dashboard']}, wrapper: Wrapper,
    })
    rerender({types: ['category']})
    expect(result.current.category.isLoading).toBe(true)
    expect(result.current.dashboard).toBeUndefined()
    await act(async () => { resolveSecond({category: response('current')}) })
    expect(result.current.category.layout).toEqual({name: 'current'})
    expect(result.current.category.isLoading).toBe(false)
    await act(async () => { resolveFirst({dashboard: response('stale')}) })
    expect(result.current.category.layout).toEqual({name: 'current'})
    expect(result.current.dashboard).toBeUndefined()
  })
})
