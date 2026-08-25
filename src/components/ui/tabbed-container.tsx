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
          'flex flex-col lg:gap-6',
          isVerticalRight ? 'lg:flex-row-reverse' : 'lg:flex-row',
          'bg-card text-card-foreground rounded-lg border border-border',
          className,
        )}>
          {/* Tab Navigation - horizontal scroll on mobile, vertical sidebar on md+ */}
          <div className={cn(
            'flex-shrink-0',
            'lg:w-48 xl:w-56',
            'border-border',
            'border-b lg:border-b-0',
            isVerticalRight ? 'lg:border-l' : 'lg:border-r',
            'bg-muted',
            tabsClassName,
          )}>
            <nav className="flex lg:flex-col p-2 lg:space-y-1 gap-1 lg:gap-0 overflow-x-auto lg:overflow-x-visible" role="tablist">
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
                      'group relative flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium rounded-lg whitespace-nowrap lg:whitespace-normal',
                      'transition-all duration-200 ease-out',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
                      !isActive && [
                        'text-muted-foreground',
                        'hover:text-foreground',
                        'hover:bg-background/70',
                      ],
                      isActive && [
                        'text-primary',
                        'bg-background',
                        'shadow-sm',
                      ],
                      tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                    )}
                  >
                    <div className={cn(
                      'hidden lg:block absolute top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full transition-all duration-200',
                      isVerticalRight ? 'right-0' : 'left-0',
                      isActive ? 'bg-primary' : 'bg-transparent',
                    )}/>
                    {Icon && (
                      <Icon className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}/>
                    )}
                    <span className="truncate text-left">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className={cn('flex-1 min-w-0 p-4 lg:p-6', contentClassName)}>
            {loading ? (
              <div className="space-y-3">
                <LoadingSkeleton className="h-4 w-3/4"/>
                <LoadingSkeleton className="h-4 w-1/2"/>
                <LoadingSkeleton className="h-32 w-full"/>
              </div>
            ) : activeTab?.component ? (
              React.createElement(activeTab.component, activeTab.props || {})
            ) : (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <div className="text-center text-sm">No content available</div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={cn(
        'bg-card text-card-foreground rounded-lg border border-border',
        className,
      )}>
        <div className={cn(
          'border-b border-border',
          'bg-muted px-2 py-2',
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
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
                    !isActive && [
                      'text-muted-foreground',
                      'hover:text-foreground',
                      'hover:bg-background/70',
                    ],
                    isActive && [
                      'text-primary',
                      'bg-background',
                      'shadow-sm',
                    ],
                    tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                  )}
                >
                  <div className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full transition-all duration-200',
                    isActive ? 'bg-primary' : 'bg-transparent',
                  )}/>
                  {Icon && (
                    <Icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground',
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
            <div className="flex items-center justify-center py-16 text-muted-foreground">
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
                'bg-card text-card-foreground rounded-lg border border-border',
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
                  'hover:bg-muted/70',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
                  tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                )}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}/>
                  )}
                  <span className={cn(
                    'font-medium text-sm',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {tab.label}
                  </span>
                </div>

                <ChevronRight className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform duration-200',
                  isActive && 'rotate-90',
                )}/>
              </button>

              {isActive && (
                <div className={cn(
                  'border-t border-border px-4 py-4',
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
                    <div className="text-center py-8 text-muted-foreground text-sm">
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
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-sm">No tabs configured</div>
      </div>
    )
  }

  return mode === 'accordion' ? renderAccordionMode() : renderTabsMode()
}

export default TabbedContainer
