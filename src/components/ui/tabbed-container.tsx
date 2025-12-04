import React, {useState} from 'react'
import {ChevronRight} from 'lucide-react'
import {cn} from '../../lib/utils'
import {LoadingSkeleton} from './loading-skeleton'

export interface TabConfig {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  lazy?: boolean
  component?: React.ComponentType<any>
  props?: Record<string, any>
}

export interface TabbedContainerProps {
  tabs: TabConfig[]
  defaultTab?: string
  urlParam?: string
  mode?: 'tabs' | 'accordion'
  orientation?: 'horizontal' | 'vertical' | 'vertical-left' | 'vertical-right'
  variant?: 'default' | 'minimal' | 'pills'
  className?: string
  tabsClassName?: string
  contentClassName?: string
  onTabChange?: (tabId: string) => void
  loading?: boolean
  allowMultipleOpen?: boolean
  collapsible?: boolean
}

export const TabbedContainer: React.FC<TabbedContainerProps> = ({
  tabs,
  defaultTab,
  urlParam = 'tab',
  mode = 'tabs',
  orientation = 'horizontal',
  className = '',
  tabsClassName = '',
  contentClassName = '',
  onTabChange,
  loading = false,
  allowMultipleOpen = false,
  collapsible = true,
}) => {
  const [activeTabs, setActiveTabs] = useState<Set<string>>(() => {
    // Initialize with defaultTab or first tab
    let initialTab: string | undefined

    if (typeof window === 'undefined') {
      initialTab = defaultTab || tabs[0]?.id
    } else {
      const urlParams = new URLSearchParams(window.location.search)
      const urlTabId = urlParams.get(urlParam)

      if (urlTabId && tabs.some(tab => tab.id === urlTabId)) {
        initialTab = urlTabId
      } else {
        initialTab = defaultTab || tabs[0]?.id
      }
    }

    return new Set(initialTab ? [initialTab] : [])
  })

  const handleTabClick = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) {
      return
    }

    setActiveTabs(prev => {
      const newActiveTabs = new Set(prev)

      if (mode === 'tabs') {
        newActiveTabs.clear()
        newActiveTabs.add(tabId)
      } else {
        if (newActiveTabs.has(tabId)) {
          if (collapsible) {
            newActiveTabs.delete(tabId)
          }
        } else {
          if (!allowMultipleOpen) {
            newActiveTabs.clear()
          }
          newActiveTabs.add(tabId)
        }
      }

      return newActiveTabs
    })

    if (typeof window !== 'undefined' && urlParam) {
      const url = new URL(window.location.href)
      url.searchParams.set(urlParam, tabId)
      window.history.replaceState({}, '', url.toString())
    }

    onTabChange?.(tabId)
  }

  const isVertical = orientation === 'vertical' || orientation === 'vertical-left' || orientation === 'vertical-right'
  const isVerticalRight = orientation === 'vertical-right'

  const renderTabsMode = () => {
    const activeTabId = Array.from(activeTabs)[0]
    const activeTab = tabs.find(tab => tab.id === activeTabId)

    if (isVertical) {
      return (
        <div className={cn(
          'flex gap-6',
          isVerticalRight ? 'flex-row-reverse' : 'flex-row',
          'bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700',
          className,
        )}>
          {/* Vertical Tab Navigation */}
          <div className={cn(
            'flex-shrink-0 w-48 lg:w-56',
            'border-gray-200 dark:border-slate-700',
            isVerticalRight ? 'border-l' : 'border-r',
            'bg-gray-50 dark:bg-slate-800',
            tabsClassName,
          )}>
            <nav className="flex flex-col p-2 space-y-1" role="tablist">
              {tabs.map((tab) => {
                const isActive = activeTabs.has(tab.id)
                const Icon = tab.icon

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    disabled={tab.disabled}
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      'group relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg',
                      'transition-all duration-200 ease-out',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                      !isActive && [
                        'text-gray-600 dark:text-gray-400',
                        'hover:text-gray-900 dark:hover:text-gray-100',
                        'hover:bg-white dark:hover:bg-slate-700',
                      ],
                      isActive && [
                        'text-blue-600 dark:text-blue-400',
                        'bg-white dark:bg-slate-700',
                        'shadow-sm',
                      ],
                      tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                    )}
                  >
                    <div className={cn(
                      'absolute top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full transition-all duration-200',
                      isVerticalRight ? 'right-0' : 'left-0',
                      isActive ? 'bg-blue-500 dark:bg-blue-400' : 'bg-transparent',
                    )}/>
                    {Icon && (
                      <Icon className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400',
                      )}/>
                    )}
                    <span className="truncate text-left">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className={cn('flex-1 min-w-0 p-6', contentClassName)}>
            {loading ? (
              <div className="space-y-3">
                <LoadingSkeleton className="h-4 w-3/4"/>
                <LoadingSkeleton className="h-4 w-1/2"/>
                <LoadingSkeleton className="h-32 w-full"/>
              </div>
            ) : activeTab?.component ? (
              React.createElement(activeTab.component, activeTab.props || {})
            ) : (
              <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <div className="text-center text-sm">No content available</div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={cn(
        'bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700',
        className,
      )}>
        <div className={cn(
          'border-b border-gray-200 dark:border-slate-700',
          'bg-gray-50 dark:bg-slate-800 px-2 py-2',
          tabsClassName,
        )}>
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTabs.has(tab.id)
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  disabled={tab.disabled}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap',
                    'transition-all duration-200 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    !isActive && [
                      'text-gray-600 dark:text-gray-400',
                      'hover:text-gray-900 dark:hover:text-gray-100',
                      'hover:bg-white dark:hover:bg-slate-700',
                    ],
                    isActive && [
                      'text-blue-600 dark:text-blue-400',
                      'bg-white dark:bg-slate-700',
                      'shadow-sm',
                    ],
                    tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                  )}
                >
                  <div className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full transition-all duration-200',
                    isActive ? 'bg-blue-500 dark:bg-blue-400' : 'bg-transparent',
                  )}/>
                  {Icon && (
                    <Icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400',
                    )}/>
                  )}
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className={cn('p-4', contentClassName)}>
          {loading ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-4 w-3/4"/>
              <LoadingSkeleton className="h-4 w-1/2"/>
              <LoadingSkeleton className="h-32 w-full"/>
            </div>
          ) : activeTab?.component ? (
            React.createElement(activeTab.component, activeTab.props || {})
          ) : (
            <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <div className="text-center text-sm">No content available</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAccordionMode = () => {
    return (
      <div className={cn('space-y-2', className)}>
        {tabs.map((tab) => {
          const isActive = activeTabs.has(tab.id)
          const Icon = tab.icon

          return (
            <div
              key={tab.id}
              className={cn(
                'bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700',
                'overflow-hidden transition-all duration-200',
                isActive && 'shadow-sm',
              )}
            >
              <button
                onClick={() => handleTabClick(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 text-left',
                  'transition-colors duration-200',
                  'hover:bg-gray-50 dark:hover:bg-slate-800',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                  tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400',
                    )}/>
                  )}
                  <span className={cn(
                    'font-medium text-sm',
                    isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300',
                  )}>
                    {tab.label}
                  </span>
                </div>

                <ChevronRight className={cn(
                  'w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200',
                  isActive && 'rotate-90',
                )}/>
              </button>

              {isActive && (
                <div className={cn(
                  'border-t border-gray-200 dark:border-slate-700 px-4 py-4',
                  contentClassName,
                )}>
                  {loading ? (
                    <div className="space-y-3">
                      <LoadingSkeleton className="h-3 w-3/4"/>
                      <LoadingSkeleton className="h-3 w-1/2"/>
                      <LoadingSkeleton className="h-24 w-full"/>
                    </div>
                  ) : tab.component ? (
                    React.createElement(tab.component, tab.props || {})
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      No content available
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (tabs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="text-sm">No tabs configured</div>
      </div>
    )
  }

  return mode === 'accordion' ? renderAccordionMode() : renderTabsMode()
}

export default TabbedContainer
