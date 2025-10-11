import React, { useEffect, useRef, useState } from 'react'
import { Badge } from './badge'
import { Button } from './button'
import { cn } from '../../lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { ChevronDown, Hash, Plus, X } from 'lucide-react'
import { Tag } from '../../types/common.types'

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  fetchTags: (search: string) => Promise<Tag[]>
  createTag?: (title: string) => Promise<Tag | null>
  className?: string
  placeholder?: string
  maxTags?: number
  allowCreate?: boolean
  disabled?: boolean
  labels?: {
    selectTags?: string
    searchTags?: string
    loading?: string
    noTagsFound?: string
    create?: string
    tagsSelected?: string
  }
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags = [],
  onTagsChange,
  fetchTags,
  createTag,
  className,
  placeholder,
  maxTags = 10,
  allowCreate = false,
  disabled = false,
  labels = {},
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchTimeoutRef = useRef<number>()

  const defaultLabels = {
    selectTags: 'Add tags...',
    searchTags: 'Search tags...',
    loading: 'Loading...',
    noTagsFound: 'No tags found',
    create: 'Create',
    tagsSelected: 'of',
  }

  const finalLabels = { ...defaultLabels, ...labels }

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Fetch tags when search changes
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      fetchTags(debouncedSearch).then(tags => {
        setAvailableTags(tags)
        setIsLoading(false)
      }).catch(() => {
        setAvailableTags([])
        setIsLoading(false)
      })
    }
  }, [debouncedSearch, open, fetchTags])

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [debouncedSearch])

  // Filter tags to exclude already selected ones
  const filteredTags = availableTags.filter(tag =>
    !selectedTags.some(selected => selected.id === tag.id),
  )

  const showCreateOption = allowCreate &&
    searchQuery.trim() &&
    !filteredTags.some(tag => tag.title.toLowerCase() === searchQuery.toLowerCase()) &&
    selectedTags.length < maxTags

  const allOptions = [
    ...(showCreateOption ? [{ id: -1, title: `${finalLabels.create} "${searchQuery}"`, isCreate: true }] : []),
    ...filteredTags.map(tag => ({ ...tag, isCreate: false })),
  ]

  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag])
    }
    setSearchQuery('')
    setOpen(false)
    setSelectedIndex(-1)
  }

  const handleTagRemove = (tagId: number) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!searchQuery.trim() || !allowCreate || !createTag) {
      return
    }

    try {
      const newTag = await createTag(searchQuery.trim())
      if (newTag) {
        handleTagSelect(newTag)
      }
    }
    catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < allOptions.length - 1 ? prev + 1 : prev,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < allOptions.length) {
          const option = allOptions[selectedIndex]
          if (option.isCreate) {
            handleCreateTag()
          } else {
            handleTagSelect(option as Tag)
          }
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        setSearchQuery('')
        setSelectedIndex(-1)
        break
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchQuery('')
      setSelectedIndex(-1)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="h-7 pl-2.5 pr-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-750 transition-colors duration-200"
            >
              <Hash className="h-3 w-3 mr-1.5 text-neutral-500"/>
              <span className="text-sm font-medium">{tag.title}</span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTagRemove(tag.id)}
                  className="h-5 w-5 p-0 ml-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full"
                >
                  <X className="h-3 w-3"/>
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Selector */}
      {!disabled && selectedTags.length < maxTags && (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <Hash className="h-4 w-4"/>
                <span className="text-sm">
                  {placeholder || finalLabels.selectTags}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-400"/>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl shadow-xl" align="start">
            <Command>
              <CommandInput
                placeholder={finalLabels.searchTags}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 focus:ring-0 text-sm"
              />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"/>
                      {finalLabels.loading}
                    </div>
                  ) : (
                    finalLabels.noTagsFound
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {showCreateOption && (
                    <CommandItem
                      onSelect={handleCreateTag}
                      className={cn(
                        'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 py-2',
                        selectedIndex === 0 && 'bg-neutral-100 dark:bg-neutral-700',
                      )}
                    >
                      <Plus className="h-4 w-4 mr-2 text-neutral-500"/>
                      <span className="text-sm">
                        {finalLabels.create} "{searchQuery}"
                      </span>
                    </CommandItem>
                  )}

                  {filteredTags.map((tag, index) => {
                    const itemIndex = showCreateOption ? index + 1 : index
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => handleTagSelect(tag)}
                        className={cn(
                          'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 py-2',
                          selectedIndex === itemIndex && 'bg-neutral-100 dark:bg-neutral-700',
                        )}
                      >
                        <Hash className="h-4 w-4 mr-2 text-neutral-500"/>
                        <span className="text-sm font-medium">{tag.title}</span>
                        {tag.description && (
                          <span className="text-xs text-neutral-500 ml-2">
                            {tag.description}
                          </span>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {/* Tag limit indicator */}
      {selectedTags.length > 0 && (
        <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            {selectedTags.length} {finalLabels.tagsSelected} {maxTags} tags selected
          </span>
        </div>
      )}
    </div>
  )
}
