import React from 'react'
import { Button } from './button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'
import { PaginationMeta } from '../../types/common.types'

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  compact?: boolean
  className?: string
  variant?: 'default' | 'minimal' | 'integrated'
  labels?: {
    showing?: string
    perPage?: string
    first?: string
    prev?: string
    next?: string
    last?: string
    pageOf?: string
  }
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  compact = false,
  className = '',
  variant = 'default',
  labels = {},
}) => {
  const { page, totalPages, hasNext, hasPrev, total, limit } = pagination

  const defaultLabels = {
    showing: `Showing ${Math.min((page - 1) * limit + 1, total)} to ${Math.min(page * limit, total)} of ${total} results`,
    perPage: 'Per page',
    first: 'First',
    prev: 'Prev',
    next: 'Next',
    last: 'Last',
    pageOf: `Page ${page} of ${totalPages}`,
  }

  const finalLabels = { ...defaultLabels, ...labels }

  // Generate page numbers to show with enhanced algorithm
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = compact ? 5 : 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      const showLeftEllipsis = page > 4
      const showRightEllipsis = page < totalPages - 3

      if (showLeftEllipsis) {
        pages.push('...')
      }

      const start = Math.max(2, Math.min(page - 1, totalPages - maxVisible + 2))
      const end = Math.min(totalPages - 1, Math.max(page + 1, maxVisible - 2))

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      if (showRightEllipsis) {
        pages.push('...')
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null
  }

  const pageNumbers = getPageNumbers()

  const baseClasses = {
    default: 'flex items-center justify-between space-y-4 sm:space-y-0',
    minimal: 'flex items-center justify-center',
    integrated: 'flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm',
  }

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      {variant !== 'minimal' && (
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
          <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
            {finalLabels.showing}
          </div>

          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">
                {finalLabels.perPage}:
              </span>
              <select
                value={limit}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm 
                         focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 dark:focus:ring-neutral-400 dark:focus:border-neutral-400
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-600"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center space-x-1">
          {!compact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="hidden sm:flex items-center px-3 py-2 border-neutral-300 dark:border-neutral-700 
                       hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronsLeft className="h-4 w-4"/>
              <span className="ml-1.5 font-medium">{finalLabels.first}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
            className="flex items-center px-3 py-2 border-neutral-300 dark:border-neutral-700 
                     hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4"/>
            {!compact && <span className="ml-1.5 font-medium">{finalLabels.prev}</span>}
          </Button>

          <div className="hidden sm:flex items-center space-x-1">
            {pageNumbers.map((pageNum, index) => (
              pageNum === '...' ? (
                <div key={`ellipsis-${index}`} className="px-3 py-2 flex items-center">
                  <MoreHorizontal className="h-4 w-4 text-neutral-400 dark:text-neutral-600"/>
                </div>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className={`min-w-[44px] h-9 font-medium transition-all duration-200 ${
                    pageNum === page
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 border-neutral-900 dark:border-neutral-100'
                      : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                  }`}
                >
                  {pageNum}
                </Button>
              )
            ))}
          </div>

          <div className="sm:hidden px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {page} / {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
            className="flex items-center px-3 py-2 border-neutral-300 dark:border-neutral-700 
                     hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {!compact && <span className="mr-1.5 font-medium">{finalLabels.next}</span>}
            <ChevronRight className="h-4 w-4"/>
          </Button>

          {!compact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="hidden sm:flex items-center px-3 py-2 border-neutral-300 dark:border-neutral-700 
                       hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="mr-1.5 font-medium">{finalLabels.last}</span>
              <ChevronsRight className="h-4 w-4"/>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export const CompactPagination: React.FC<Omit<PaginationProps, 'compact'>> = (props) => {
  return <Pagination {...props} compact={true} variant="minimal"/>
}

export const SimplePagination: React.FC<{
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
  labels?: {
    prev?: string
    next?: string
    pageOf?: string
  }
}> = ({ pagination, onPageChange, className = '', labels = {} }) => {
  const { page, totalPages, hasNext, hasPrev } = pagination

  const defaultLabels = {
    prev: 'Previous',
    next: 'Next',
    pageOf: `Page ${page} of ${totalPages}`,
  }

  const finalLabels = { ...defaultLabels, ...labels }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={`flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm ${className}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="flex items-center px-4 py-2 border-neutral-300 dark:border-neutral-700 
                 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4 mr-2"/>
        <span className="font-medium">{finalLabels.prev}</span>
      </Button>

      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {finalLabels.pageOf}
        </span>
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="flex items-center px-4 py-2 border-neutral-300 dark:border-neutral-700 
                 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <span className="font-medium">{finalLabels.next}</span>
        <ChevronRight className="h-4 w-4 ml-2"/>
      </Button>
    </div>
  )
}

