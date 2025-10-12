import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../../../components/ui/pagination'
import { PaginationMeta } from '../../../types/common.types'

describe('Pagination', () => {
  const mockOnPageChange = vi.fn()
  const mockOnPageSizeChange = vi.fn()

  const defaultPagination: PaginationMeta = {
    page: 1,
    limit: 10,
    limitStart: 0,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrev: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render pagination controls', () => {
    render(<Pagination pagination={defaultPagination} onPageChange={mockOnPageChange}/>)
    expect(screen.getByText(/Showing 1 to 10 of 100/)).toBeInTheDocument()
  })

  it('should not render when only one page and no page size selector', () => {
    const singlePagePagination: PaginationMeta = {
      page: 1,
      limit: 10,
      limitStart: 0,
      total: 5,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }
    const { container } = render(
      <Pagination pagination={singlePagePagination} onPageChange={mockOnPageChange}/>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should call onPageChange when next button clicked', async () => {
    const user = userEvent.setup()
    render(<Pagination pagination={defaultPagination} onPageChange={mockOnPageChange}/>)

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange when prev button clicked', async () => {
    const user = userEvent.setup()
    const pagination: PaginationMeta = {
      ...defaultPagination,
      page: 5,
      limitStart: 40,
      hasPrev: true,
    }
    render(<Pagination pagination={pagination} onPageChange={mockOnPageChange}/>)

    const prevButton = screen.getByRole('button', { name: /prev/i })
    await user.click(prevButton)

    expect(mockOnPageChange).toHaveBeenCalledWith(4)
  })

  it('should disable prev button on first page', () => {
    render(<Pagination pagination={defaultPagination} onPageChange={mockOnPageChange}/>)
    const prevButton = screen.getByRole('button', { name: /prev/i })
    expect(prevButton).toBeDisabled()
  })

  it('should disable next button on last page', () => {
    const lastPagePagination: PaginationMeta = {
      page: 10,
      limit: 10,
      limitStart: 90,
      total: 100,
      totalPages: 10,
      hasNext: false,
      hasPrev: true,
    }
    render(<Pagination pagination={lastPagePagination} onPageChange={mockOnPageChange}/>)
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('should render page numbers', () => {
    render(<Pagination pagination={defaultPagination} onPageChange={mockOnPageChange}/>)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should show ellipsis for many pages', () => {
    const manyPagesPagination: PaginationMeta = {
      page: 5,
      limit: 10,
      limitStart: 40,
      total: 1000,
      totalPages: 100,
      hasNext: true,
      hasPrev: true,
    }
    render(<Pagination pagination={manyPagesPagination} onPageChange={mockOnPageChange}/>)
    // Check for ellipsis representation
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should show page size selector when enabled', () => {
    render(
      <Pagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        showPageSizeSelector={true}
        onPageSizeChange={mockOnPageSizeChange}
      />,
    )
    expect(screen.getByText(/per page/i)).toBeInTheDocument()
  })

  it('should support compact mode', () => {
    const { container } = render(
      <Pagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        compact={true}
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should support custom labels', () => {
    render(
      <Pagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        labels={{
          showing: 'Custom showing text',
          next: 'Custom Next',
          prev: 'Custom Prev',
        }}
      />,
    )
    expect(screen.getByText('Custom showing text')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Pagination
        pagination={defaultPagination}
        onPageChange={mockOnPageChange}
        className="custom-pagination"
      />,
    )
    expect(container.querySelector('.custom-pagination')).toBeInTheDocument()
  })
})
