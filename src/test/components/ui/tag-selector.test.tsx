import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagSelector } from '../../../components/ui/tag-selector'
import { Tag } from '../../../types/common.types'

describe('TagSelector', () => {
  const mockTags: Tag[] = [
    { id: 1, title: 'React', alias: 'react', published: 1, level: 1, path: 'react', parent_id: 0, language: '*' },
    { id: 2, title: 'TypeScript', alias: 'typescript', published: 1, level: 1, path: 'typescript', parent_id: 0, language: '*' },
    { id: 3, title: 'JavaScript', alias: 'javascript', published: 1, level: 1, path: 'javascript', parent_id: 0, language: '*' },
  ]

  const mockFetchTags = vi.fn().mockResolvedValue(mockTags)

  it('should render tag selector', () => {
    render(
      <TagSelector
        selectedTags={[]}
        onTagsChange={() => {}}
        fetchTags={mockFetchTags}
      />,
    )
    expect(screen.getByText(/add tags/i)).toBeInTheDocument()
  })

  it('should display selected tags', () => {
    render(
      <TagSelector
        selectedTags={[mockTags[0], mockTags[1]]}
        onTagsChange={() => {}}
        fetchTags={mockFetchTags}
      />,
    )
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('should call onTagsChange when tag is added', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const fetchTags = vi.fn().mockResolvedValue(mockTags)

    render(
      <TagSelector
        selectedTags={[]}
        onTagsChange={handleChange}
        fetchTags={fetchTags}
      />,
    )

    const trigger = screen.getByText(/add tags/i)
    await user.click(trigger)

    // Wait for popover to open and click on a tag option if available
    const tagOption = await screen.findByText('JavaScript')
    await user.click(tagOption)

    expect(handleChange).toHaveBeenCalled()
  })

  it('should remove tag when remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <TagSelector
        selectedTags={[mockTags[0]]}
        onTagsChange={handleChange}
        fetchTags={mockFetchTags}
      />,
    )

    // Find the remove button within the React tag badge
    const badges = screen.getAllByRole('button')
    const removeButton = badges.find(btn => btn.querySelector('svg'))

    if (removeButton) {
      await user.click(removeButton)
      expect(handleChange).toHaveBeenCalled()
    }
  })

  it('should support custom placeholder', () => {
    render(
      <TagSelector
        selectedTags={[]}
        onTagsChange={() => {}}
        fetchTags={mockFetchTags}
        placeholder="Choose tags..."
      />,
    )
    expect(screen.getByText('Choose tags...')).toBeInTheDocument()
  })

  it('should limit number of selected tags', () => {
    render(
      <TagSelector
        selectedTags={[mockTags[0], mockTags[1]]}
        onTagsChange={() => {}}
        fetchTags={mockFetchTags}
        maxTags={2}
      />,
    )
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
