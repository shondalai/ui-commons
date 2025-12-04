import React from 'react'
import {Button} from './button'
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal} from 'lucide-react'
import {PaginationMeta} from '../../types/common.types'

interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  compact?: boolean
  className?: string
  variant?: 'default' | 'minimal' | 'integrated'
  useIcons?: boolean // If true, use icons instead of text labels for First/Last/Prev/Next
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
  useIcons = false,
  labels = {},
}) => {
  const { page, totalPages, hasNext, hasPrev, total, limit } = pagination

  const defaultLabels = {
    showing: `Showing ${Math.min((page - 1) * limit + 1, total)} to ${Math.min(page * limit, total)} of ${total}`,
    perPage: 'Per page',
    first: 'First',
    prev: 'Previous',
    next: 'Next',
    last: 'Last',
    pageOf: `Page ${page} of ${totalPages}`,
  }

  const finalLabels = { ...defaultLabels, ...labels }

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = compact ? 3 : 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      let rangeStart = Math.max(2, page - 1)
      let rangeEnd = Math.min(totalPages - 1, page + 1)

      if (page <= 3) {
        rangeStart = 2
        rangeEnd = Math.min(4, totalPages - 1)
      } else if (page >= totalPages - 2) {
        rangeStart = Math.max(totalPages - 3, 2)
        rangeEnd = totalPages - 1
      }

      if (rangeStart > 2) pages.push('...')
      for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)
      if (rangeEnd < totalPages - 1) pages.push('...')

      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null
  }

  const pageNumbers = getPageNumbers()

  // VARIANT: MINIMAL - Just buttons, no labels
  if (variant === 'minimal') {
    return (
      <nav className={`flex items-center justify-center gap-1 ${className}`} aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className={useIcons ? "h-9 w-9 p-0" : "h-9 px-3"}
          aria-label="First page"
        >
          {useIcons ? (
            <ChevronsLeft className="h-4 w-4" />
          ) : (
            <span className="text-sm font-medium">{finalLabels.first}</span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="h-9 w-9 p-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((pageNum, index) =>
          pageNum === '...' ? (
            <div key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-neutral-400" />
            </div>
          ) : (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum as number)}
              className={`h-9 min-w-[44px] px-3 ${
                pageNum === page
                  ? '!bg-neutral-900 dark:!bg-neutral-100 !text-white dark:!text-neutral-900 !border-neutral-900 dark:!border-neutral-100 hover:!bg-neutral-800 dark:hover:!bg-neutral-200'
                  : ''
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === page ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="h-9 w-9 p-0"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className={useIcons ? "h-9 w-9 p-0" : "h-9 px-3"}
          aria-label="Last page"
        >
          {useIcons ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <span className="text-sm font-medium">{finalLabels.last}</span>
          )}
        </Button>
      </nav>
    )
  }

  // VARIANT: INTEGRATED - Compact card style
  if (variant === 'integrated') {
    return (
      <div className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {finalLabels.showing}
          </div>

          <div className="flex items-center gap-2">
            {showPageSizeSelector && onPageSizeChange && (
              <>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{finalLabels.perPage}</span>
                <select
                  value={limit}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="h-9 px-3 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                >
                  {pageSizeOptions.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </>
            )}

            {totalPages > 1 && (
              <div className="flex items-center gap-1 ml-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={!hasPrev} className="h-9 px-3">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={!hasNext} className="h-9 px-3">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // VARIANT: DEFAULT - Full featured, two rows
  return (
    <div className={`w-full ${className}`}>
      {/* Row 1: Result count and page size selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Left: Result count */}
        {total > 0 && (
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {finalLabels.showing}
          </div>
        )}

        {/* Right: Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
              {finalLabels.perPage}
            </span>
            <select
              value={limit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 px-3 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700
                       bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600
                       hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer"
            >
              {pageSizeOptions.map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Row 2: Pagination controls (centered) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {/* First */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!hasPrev}
            className={`h-9 max-sm:sr-only ${useIcons ? 'w-9 px-3' : 'px-3'}`}
            aria-label="First page"
          >
            {useIcons ? (
              <ChevronsLeft className="h-4 w-4" />
            ) : (
              <span className="text-sm font-medium">{finalLabels.first}</span>
            )}
          </Button>

          {/* Previous */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
            className="h-9 px-3"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            {!useIcons && <span className="ml-1.5 text-sm font-medium max-sm:sr-only">{finalLabels.prev}</span>}
          </Button>

          {/* Page numbers - Desktop only */}
          <div className="max-md:sr-only md:flex items-center gap-1">
            {pageNumbers.map((pageNum, index) =>
              pageNum === '...' ? (
                <div key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-neutral-400 dark:text-neutral-600" />
                </div>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className={`h-9 min-w-[44px] px-3 ${
                    pageNum === page
                      ? '!bg-neutral-900 dark:!bg-neutral-100 !text-white dark:!text-neutral-900 !border-neutral-900 dark:!border-neutral-100 hover:!bg-neutral-800 dark:hover:!bg-neutral-200'
                      : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === page ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>

          {/* Mobile indicator */}
          <div className="md:sr-only flex items-center justify-center h-9 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {page} / {totalPages}
            </span>
          </div>

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
            className="h-9 px-3"
            aria-label="Next page"
          >
            {!useIcons && <span className="mr-1.5 text-sm font-medium max-sm:sr-only">{finalLabels.next}</span>}
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNext}
            className={`h-9 max-sm:sr-only ${useIcons ? 'w-9 px-3' : 'px-3'}`}
            aria-label="Last page"
          >
            {useIcons ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <span className="text-sm font-medium">{finalLabels.last}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export const CompactPagination: React.FC<Omit<PaginationProps, 'compact'>> = (props) => {
  return <Pagination {...props} compact={true} />
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
    <nav className={`flex items-center justify-between gap-4 ${className}`} aria-label="Pagination">
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="h-9 px-4 inline-flex items-center gap-2
                 border-neutral-300 dark:border-neutral-700
                 hover:bg-neutral-100 dark:hover:bg-neutral-800
                 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label={finalLabels.prev}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">{finalLabels.prev}</span>
      </Button>

      <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {finalLabels.pageOf}
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="h-9 px-4 inline-flex items-center gap-2
                 border-neutral-300 dark:border-neutral-700
                 hover:bg-neutral-100 dark:hover:bg-neutral-800
                 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label={finalLabels.next}
      >
        <span className="text-sm font-medium">{finalLabels.next}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}



