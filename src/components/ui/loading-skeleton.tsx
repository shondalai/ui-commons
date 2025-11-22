import React from 'react'

interface LoadingSkeletonProps {
  variant?: 'default' | 'card' | 'hero' | 'stats' | 'list' | 'grid' | 'user' | 'actions' | 'page' | 'formBuilder'
  lines?: number
  className?: string
  showAvatar?: boolean
  showStats?: boolean
  showActions?: boolean
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'default',
  lines = 3,
  className = '',
  showAvatar = false,
  showStats = false,
  showActions = false,
}) => {
  const baseClasses = 'animate-pulse'
  const shimmerClasses = 'bg-slate-200/70 dark:bg-slate-700/70 rounded-md'
  const cardClasses = 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 rounded-lg shadow-sm'

  // Default variant - clean lines for text content
  if (variant === 'default') {
    return (
      <div className={`space-y-3 ${className} ${baseClasses}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className={`${shimmerClasses} h-4 w-full`}></div>
            <div className={`${shimmerClasses} h-4 w-3/4`}></div>
          </div>
        ))}
      </div>
    )
  }

  // Card variant - versatile card layout
  if (variant === 'card') {
    return (
      <div className={`${cardClasses} p-6 ${className}`}>
        <div className={baseClasses}>
          {showAvatar && (
            <div className="flex items-center space-x-4 mb-4">
              <div className={`${shimmerClasses} w-10 h-10 rounded-full`}></div>
              <div className="flex-1 space-y-2">
                <div className={`${shimmerClasses} h-4 w-32`}></div>
                <div className={`${shimmerClasses} h-3 w-24`}></div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className={`${shimmerClasses} h-3 w-full`}></div>
            ))}
          </div>

          {showStats && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center space-y-1">
                  <div className={`${shimmerClasses} h-5 w-8 mx-auto`}></div>
                  <div className={`${shimmerClasses} h-3 w-12 mx-auto`}></div>
                </div>
              ))}
            </div>
          )}

          {showActions && (
            <div className="flex justify-center space-x-3 mt-4">
              <div className={`${shimmerClasses} h-8 w-16`}></div>
              <div className={`${shimmerClasses} h-8 w-16`}></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Hero variant - for prominent header sections
  if (variant === 'hero') {
    return (
      <div className={`${className}`}>
        {/* Hero section */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg p-8 mb-6">
          <div className={`${baseClasses} flex items-center space-x-6`}>
            <div className="w-20 h-20 bg-white/60 dark:bg-slate-600/60 rounded-xl flex items-center justify-center">
              <div className="w-16 h-16 bg-white/80 dark:bg-slate-500/80 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-white/80 dark:bg-slate-500/80 rounded"></div>
              <div className="h-4 w-32 bg-white/60 dark:bg-slate-600/60 rounded"></div>
              <div className="flex items-center space-x-4">
                <div className="h-3 w-24 bg-white/60 dark:bg-slate-600/60 rounded"></div>
                <div className="h-3 w-20 bg-white/60 dark:bg-slate-600/60 rounded"></div>
              </div>
            </div>
            {showActions && (
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-white/60 dark:bg-slate-600/60 rounded"></div>
                <div className="h-8 w-16 bg-white/60 dark:bg-slate-600/60 rounded"></div>
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={`${cardClasses} p-4`}>
              <div className={`${baseClasses} space-y-3`}>
                {Array.from({ length: lines }).map((_, index) => (
                  <div key={index} className={`${shimmerClasses} h-3 w-full`}></div>
                ))}
              </div>
            </div>
          </div>

          {showStats && (
            <div className="space-y-4">
              <div className={`${cardClasses} p-4`}>
                <div className={`${baseClasses} space-y-4`}>
                  <div className={`${shimmerClasses} h-4 w-20`}></div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="text-center space-y-2">
                        <div className={`${shimmerClasses} h-6 w-8 mx-auto`}></div>
                        <div className={`${shimmerClasses} h-2 w-full`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Stats variant - clean statistics display
  if (variant === 'stats') {
    return (
      <div className={`${cardClasses} p-4 ${className}`}>
        <div className={`${baseClasses} space-y-4`}>
          <div className={`${shimmerClasses} h-4 w-24`}></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center space-y-2">
                <div className={`${shimmerClasses} h-6 w-10 mx-auto`}></div>
                <div className={`${shimmerClasses} h-3 w-16 mx-auto`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // List variant - for content lists
  if (variant === 'list') {
    return (
      <div className={`${cardClasses} divide-y divide-slate-100 dark:divide-slate-800 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="p-4">
            <div className={`${baseClasses} flex items-center space-x-4`}>
              {showAvatar && (
                <div className={`${shimmerClasses} w-8 h-8 rounded-full flex-shrink-0`}></div>
              )}
              <div className="flex-1 space-y-2">
                <div className={`${shimmerClasses} h-4 w-3/4`}></div>
                <div className={`${shimmerClasses} h-3 w-1/2`}></div>
              </div>
              <div className={`${shimmerClasses} h-3 w-12`}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Grid variant - for card grids
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className={`${cardClasses} p-4`}>
            <div className={baseClasses}>
              <div className={`${shimmerClasses} h-20 w-full mb-3`}></div>
              <div className={`${shimmerClasses} h-4 w-full mb-2`}></div>
              <div className={`${shimmerClasses} h-3 w-2/3`}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // User variant - for user-related information displays
  if (variant === 'user') {
    return (
      <div className={`${cardClasses} p-4 ${className}`}>
        <div className={`${baseClasses} space-y-4`}>
          {showAvatar && (
            <div className="flex items-center space-x-4 mb-4">
              <div className={`${shimmerClasses} w-12 h-12 rounded-full`}></div>
              <div className="flex-1 space-y-2">
                <div className={`${shimmerClasses} h-4 w-32`}></div>
                <div className={`${shimmerClasses} h-3 w-24`}></div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className={`${shimmerClasses} h-3 w-full`}></div>
            ))}
          </div>

          {showStats && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center space-y-1">
                  <div className={`${shimmerClasses} h-5 w-8 mx-auto`}></div>
                  <div className={`${shimmerClasses} h-3 w-12 mx-auto`}></div>
                </div>
              ))}
            </div>
          )}

          {showActions && (
            <div className="flex justify-center space-x-3 mt-4">
              <div className={`${shimmerClasses} h-8 w-16`}></div>
              <div className={`${shimmerClasses} h-8 w-16`}></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Quick Actions variant - for sidebar action blocks
  if (variant === 'actions') {
    return (
      <div className={`${cardClasses} p-4 ${className}`}>
        <div className={`${baseClasses} space-y-4`}>
          {showAvatar && (
            <div className="flex items-center space-x-4 mb-4">
              <div className={`${shimmerClasses} w-10 h-10 rounded-full`}></div>
              <div className="flex-1 space-y-2">
                <div className={`${shimmerClasses} h-4 w-32`}></div>
                <div className={`${shimmerClasses} h-3 w-24`}></div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className={`${shimmerClasses} h-3 w-full`}></div>
            ))}
          </div>

          {showActions && (
            <div className="flex flex-col space-y-2 mt-4">
              <div className={`${shimmerClasses} h-10 w-full`}></div>
              <div className={`${shimmerClasses} h-10 w-full`}></div>
              <div className={`${shimmerClasses} h-10 w-full`}></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Page variant - Premium full-page loading with Swiss spa aesthetic
  if (variant === 'page') {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        <div className="container mx-auto max-w-[1600px] py-6 px-4 md:px-6 space-y-6">
          {/* Header skeleton - Compact and refined */}
          <div className="space-y-2.5 animate-pulse">
            <div className="h-7 bg-gradient-to-r from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-md w-56 shimmer-effect" />
            <div className="h-3.5 bg-gradient-to-r from-slate-200/50 via-slate-200/30 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-700/30 dark:to-slate-700/50 rounded-md w-80 shimmer-effect" style={{ animationDelay: '0.1s' }} />
          </div>

          {/* Grid layout skeleton - Premium spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3.5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="h-44 bg-gradient-to-br from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-lg shimmer-effect border border-slate-200/30 dark:border-slate-700/30" />
                <div className="space-y-2 px-1">
                  <div className="h-3.5 bg-gradient-to-r from-slate-200/50 via-slate-200/30 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-700/30 dark:to-slate-700/50 rounded w-3/4 shimmer-effect" />
                  <div className="h-3 bg-gradient-to-r from-slate-200/40 via-slate-200/20 to-slate-200/40 dark:from-slate-700/40 dark:via-slate-700/20 dark:to-slate-700/40 rounded w-1/2 shimmer-effect" />
                </div>
              </div>
            ))}
          </div>

          {/* Additional content skeleton - Sleek and compact */}
          <div className="space-y-5 pt-3 animate-pulse" style={{ animationDelay: '0.3s' }}>
            <div className="h-56 bg-gradient-to-br from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-lg shimmer-effect border border-slate-200/30 dark:border-slate-700/30" />
          </div>
        </div>

        <style>{`
          @keyframes shimmer-slide {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
          .shimmer-effect {
            background-size: 1000px 100%;
            animation: shimmer-slide 2.5s infinite linear;
          }
        `}</style>
      </div>
    )
  }

  // Form Builder variant - 3-column layout for form builder
  if (variant === 'formBuilder') {
    return (
      <div className={`container mx-auto px-4 py-6 ${className}`}>
        <div className="grid grid-cols-12 gap-4 animate-pulse">
          {/* Left sidebar - Field Library */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="h-48 bg-gradient-to-br from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-lg shimmer-effect border border-slate-200/30 dark:border-slate-700/30" />
            <div className="h-64 bg-gradient-to-br from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-lg shimmer-effect border border-slate-200/30 dark:border-slate-700/30" />
          </div>

          {/* Center - Form Canvas */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            <div className="h-96 bg-gradient-to-br from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-lg shimmer-effect border border-slate-200/30 dark:border-slate-700/30" />
          </div>

          {/* Right sidebar - Field Properties */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="h-48 bg-gradient-to-br from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-lg shimmer-effect border border-slate-200/30 dark:border-slate-700/30" />
            <div className="h-64 bg-gradient-to-br from-slate-200/70 via-slate-200/50 to-slate-200/70 dark:from-slate-700/70 dark:via-slate-700/50 dark:to-slate-700/70 rounded-lg shimmer-effect border border-slate-200/30 dark:border-slate-700/30" />
          </div>
        </div>

        <style>{`
          @keyframes shimmer-slide {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
          .shimmer-effect {
            background-size: 1000px 100%;
            animation: shimmer-slide 2.5s infinite linear;
          }
        `}</style>
      </div>
    )
  }

  return null
}

export { LoadingSkeleton }
