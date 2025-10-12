import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode, REMOVE_LIST_COMMAND } from '@lexical/list'
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $getNearestNodeOfType } from '@lexical/utils'
import { Button } from './button'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Image as ImageIcon,
  Indent,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered,
  Outdent,
  Palette,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react'

export interface ToolbarConfig {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  textColor?: boolean
  highlight?: boolean
  alignLeft?: boolean
  alignCenter?: boolean
  alignRight?: boolean
  alignJustify?: boolean
  bulletList?: boolean
  numberedList?: boolean
  quote?: boolean
  outdent?: boolean
  indent?: boolean
  link?: boolean
  image?: boolean
}

interface RichTextEditorProps {
  value?: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxCharacters?: number
  showToolbar?: boolean
  showCharacterCount?: boolean
  labels?: {
    characterCount?: string
    characterLimitExceeded?: string
  }
  editingContent?: string | null
  onEditingComplete?: () => void
  autoLoadEditContent?: boolean
  enabledButtons?: ToolbarConfig
}

export interface RichTextEditorRef {
  clearContent: () => void
  focus: () => void
  getTextContent: () => string
  loadContent: (html: string) => void
}

// Predefined color palettes for text and highlight
const TEXT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Amber', value: '#D97706' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Purple', value: '#9333EA' },
]

const HIGHLIGHT_COLORS = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#FEF08A' },
  { name: 'Green', value: '#BBF7D0' },
  { name: 'Blue', value: '#BFDBFE' },
  { name: 'Purple', value: '#E9D5FF' },
  { name: 'Pink', value: '#FBCFE8' },
  { name: 'Gray', value: '#E5E7EB' },
]

// Color picker dropdown component
function ColorPicker ({
  colors,
  onSelect,
  type,
}: {
  colors: typeof TEXT_COLORS
  onSelect: (color: string) => void
  type: 'text' | 'highlight'
}) {
  return (
    <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[160px]">
      <div className="grid grid-cols-3 gap-1">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onSelect(color.value)}
            className="h-7 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            style={{
              backgroundColor: color.value || (type === 'text' ? '#000' : 'transparent'),
              color: color.value ? '#fff' : '#000',
            }}
            title={color.name}
          >
            {!color.value && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {type === 'text' ? 'A' : '◌'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Link insertion modal
function LinkModal ({
  onInsert,
  onClose,
  initialUrl = '',
  buttonRef,
}: {
  onInsert: (url: string, text?: string) => void
  onClose: () => void
  initialUrl?: string
  buttonRef?: React.RefObject<HTMLButtonElement>
}) {
  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Position modal based on button position
    if (modalRef.current && buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const modalHeight = modalRef.current.offsetHeight
      const viewportHeight = window.innerHeight

      // Check if there's enough space below, otherwise show above
      if (buttonRect.bottom + modalHeight + 8 > viewportHeight) {
        modalRef.current.style.top = `${buttonRect.top - modalHeight - 8}px`
      } else {
        modalRef.current.style.top = `${buttonRect.bottom + 8}px`
      }
      modalRef.current.style.left = `${buttonRect.left}px`
    }
  }, [buttonRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (url) {
      onInsert(url, text || undefined)
    }
    onClose()
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const modalContent = (
    <>
      {/* Backdrop to close modal when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="fixed z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[280px]"
      >
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Text (optional)</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="h-7 px-3 text-xs rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-7 px-3 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Insert
            </button>
          </div>
        </form>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}

// Image insertion modal
function ImageModal ({
  onInsert,
  onClose,
  buttonRef,
}: {
  onInsert: (url: string, alt?: string) => void
  onClose: () => void
  buttonRef?: React.RefObject<HTMLButtonElement>
}) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Position modal based on button position
    if (modalRef.current && buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const modalHeight = modalRef.current.offsetHeight
      const viewportHeight = window.innerHeight

      // Check if there's enough space below, otherwise show above
      if (buttonRect.bottom + modalHeight + 8 > viewportHeight) {
        modalRef.current.style.top = `${buttonRect.top - modalHeight - 8}px`
      } else {
        modalRef.current.style.top = `${buttonRect.bottom + 8}px`
      }
      modalRef.current.style.left = `${buttonRect.left}px`
    }
  }, [buttonRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (url) {
      onInsert(url, alt || undefined)
    }
    onClose()
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const modalContent = (
    <>
      {/* Backdrop to close modal when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="fixed z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[280px]"
      >
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Alt text (optional)</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Description"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="h-7 px-3 text-xs rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-7 px-3 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Insert
            </button>
          </div>
        </form>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}

// Enhanced Toolbar component with active states
function ToolbarPlugin ({ disabled, enabledButtons = {} }: { disabled?: boolean; enabledButtons?: ToolbarConfig }) {
  const [editor] = useLexicalComposerContext()
  const [activeStates, setActiveStates] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
  })
  const [blockType, setBlockType] = useState('paragraph')
  const [alignment, setAlignment] = useState<ElementFormatType>('left')
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const linkButtonRef = useRef<HTMLButtonElement>(null)
  const imageButtonRef = useRef<HTMLButtonElement>(null)

  // Default all buttons to enabled if not specified
  const buttons = {
    bold: enabledButtons.bold !== false,
    italic: enabledButtons.italic !== false,
    underline: enabledButtons.underline !== false,
    strikethrough: enabledButtons.strikethrough !== false,
    textColor: enabledButtons.textColor !== false,
    highlight: enabledButtons.highlight !== false,
    alignLeft: enabledButtons.alignLeft !== false,
    alignCenter: enabledButtons.alignCenter !== false,
    alignRight: enabledButtons.alignRight !== false,
    alignJustify: enabledButtons.alignJustify !== false,
    bulletList: enabledButtons.bulletList !== false,
    numberedList: enabledButtons.numberedList !== false,
    quote: enabledButtons.quote !== false,
    outdent: enabledButtons.outdent !== false,
    indent: enabledButtons.indent !== false,
    link: enabledButtons.link !== false,
    image: enabledButtons.image !== false,
  }

  // Helper to check if any button in a group is enabled
  const hasTextFormatting = buttons.bold || buttons.italic || buttons.underline || buttons.strikethrough
  const hasColors = buttons.textColor || buttons.highlight
  const hasAlignment = buttons.alignLeft || buttons.alignCenter || buttons.alignRight || buttons.alignJustify
  const hasLists = buttons.bulletList || buttons.numberedList || buttons.quote
  const hasIndent = buttons.outdent || buttons.indent
  const hasMedia = buttons.link || buttons.image

  // Track active formatting states
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          setActiveStates({
            isBold: selection.hasFormat('bold'),
            isItalic: selection.hasFormat('italic'),
            isUnderline: selection.hasFormat('underline'),
            isStrikethrough: selection.hasFormat('strikethrough'),
            isCode: selection.hasFormat('code'),
          })

          const anchorNode = selection.anchor.getNode()
          const element = anchorNode.getKey() === 'root'
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow()
          const elementKey = element.getKey()
          const elementDOM = editor.getElementByKey(elementKey)

          if (elementDOM !== null) {
            if ($isListNode(element)) {
              const parentList = $getNearestNodeOfType(anchorNode, ListNode)
              const type = parentList ? (parentList as ListNode).getListType() : (element as ListNode).getListType()
              setBlockType(type === 'number' ? 'ol' : 'ul')
            } else {
              const type = (element as any).__type || 'paragraph'
              setBlockType(type === 'quote' ? 'quote' : type === 'heading' ? 'h3' : 'paragraph')
            }
          }

          // Get alignment
          if ($isElementNode(element)) {
            const format = element.getFormatType() || 'left'
            setAlignment(format as ElementFormatType)
          }
        }
      })
    })
  }, [editor])

  const $isListNode = (node: any): boolean => {
    return node instanceof ListNode
  }

  const formatText = useCallback(
    (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    },
    [editor],
  )

  const formatParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }, [editor])

  const formatQuote = useCallback(() => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode())
        }
      })
    } else {
      formatParagraph()
    }
  }, [blockType, editor, formatParagraph])

  const insertList = useCallback(
    (type: 'ul' | 'ol') => {
      if (blockType !== type) {
        if (type === 'ul') {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        } else {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
      }
    },
    [blockType, editor],
  )

  const formatAlignment = useCallback((align: ElementFormatType) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align)
  }, [editor])

  const applyTextColor = useCallback((color: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setStyle(color ? `color: ${color}` : '')
          }
        })
      }
    })
    setShowColorPicker(null)
  }, [editor])

  const applyHighlight = useCallback((color: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            const currentStyle = node.getStyle()
            const colorMatch = currentStyle.match(/color:\s*([^;]+)/)
            const textColor = colorMatch ? colorMatch[1].trim() : ''

            let newStyle = ''
            if (color) {
              newStyle = `background-color: ${color};`
            }
            if (textColor) {
              newStyle += ` color: ${textColor};`
            }
            node.setStyle(newStyle.trim())
          }
        })
      }
    })
    setShowColorPicker(null)
  }, [editor])

  const insertLink = useCallback((url: string, text?: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (text) {
          // Insert new link with text
          const linkNode = $createTextNode(text)
          selection.insertNodes([linkNode])
        }
        // Apply link to selection
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
    })
  }, [editor])

  const insertImage = useCallback((url: string, alt?: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const imageHtml = `<img src="${url}" alt="${alt || ''}" style="max-width: 100%; height: auto;" />`
        const parser = new DOMParser()
        const doc = parser.parseFromString(imageHtml, 'text/html')
        const nodes = $generateNodesFromDOM(editor, doc)
        selection.insertNodes(nodes)
      }
    })
  }, [editor])

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-wrap">
      {/* Text Formatting */}
      {hasTextFormatting && (
        <>
          <div className="flex items-center gap-0.5">
            {buttons.bold && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${activeStates.isBold ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.italic && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${activeStates.isItalic ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.underline && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${activeStates.isUnderline ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.strikethrough && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('strikethrough')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${activeStates.isStrikethrough ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Strikethrough"
              >
                <Strikethrough className="h-3.5 w-3.5"/>
              </Button>
            )}
          </div>
          {(hasColors || hasAlignment || hasLists || hasIndent || hasMedia) && (
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"/>
          )}
        </>
      )}

      {/* Colors */}
      {hasColors && (
        <>
          <div className="flex items-center gap-0.5 relative">
            {buttons.textColor && (
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                  disabled={disabled}
                  className="h-7 w-7 p-0"
                  title="Text Color"
                >
                  <Palette className="h-3.5 w-3.5"/>
                </Button>
                {showColorPicker === 'text' && (
                  <ColorPicker colors={TEXT_COLORS} onSelect={applyTextColor} type="text"/>
                )}
              </div>
            )}
            {buttons.highlight && (
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')}
                  disabled={disabled}
                  className="h-7 w-7 p-0"
                  title="Highlight Color"
                >
                  <Highlighter className="h-3.5 w-3.5"/>
                </Button>
                {showColorPicker === 'highlight' && (
                  <ColorPicker colors={HIGHLIGHT_COLORS} onSelect={applyHighlight} type="highlight"/>
                )}
              </div>
            )}
          </div>
          {(hasAlignment || hasLists || hasIndent || hasMedia) && (
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"/>
          )}
        </>
      )}

      {/* Alignment */}
      {hasAlignment && (
        <>
          <div className="flex items-center gap-0.5">
            {buttons.alignLeft && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatAlignment('left')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${alignment === 'left' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Align Left"
              >
                <AlignLeft className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.alignCenter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatAlignment('center')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${alignment === 'center' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Align Center"
              >
                <AlignCenter className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.alignRight && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatAlignment('right')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${alignment === 'right' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Align Right"
              >
                <AlignRight className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.alignJustify && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatAlignment('justify')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${alignment === 'justify' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Justify"
              >
                <AlignJustify className="h-3.5 w-3.5"/>
              </Button>
            )}
          </div>
          {(hasLists || hasIndent || hasMedia) && (
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"/>
          )}
        </>
      )}

      {/* Lists & Quote */}
      {hasLists && (
        <>
          <div className="flex items-center gap-0.5">
            {buttons.bulletList && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertList('ul')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${blockType === 'ul' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Bullet List"
              >
                <ListIcon className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.numberedList && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertList('ol')}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${blockType === 'ol' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.quote && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={formatQuote}
                disabled={disabled}
                className={`h-7 w-7 p-0 ${blockType === 'quote' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                title="Quote"
              >
                <Quote className="h-3.5 w-3.5"/>
              </Button>
            )}
          </div>
          {(hasIndent || hasMedia) && (
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"/>
          )}
        </>
      )}

      {/* Indent */}
      {hasIndent && (
        <>
          <div className="flex items-center gap-0.5">
            {buttons.outdent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                disabled={disabled}
                className="h-7 w-7 p-0"
                title="Decrease Indent"
              >
                <Outdent className="h-3.5 w-3.5"/>
              </Button>
            )}
            {buttons.indent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
                disabled={disabled}
                className="h-7 w-7 p-0"
                title="Increase Indent"
              >
                <Indent className="h-3.5 w-3.5"/>
              </Button>
            )}
          </div>
          {hasMedia && (
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"/>
          )}
        </>
      )}

      {/* Link & Image */}
      {hasMedia && (
        <div className="flex items-center gap-0.5">
          {buttons.link && (
            <Button
              ref={linkButtonRef}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkModal(!showLinkModal)}
              disabled={disabled}
              className="h-7 w-7 p-0"
              title="Insert Link"
            >
              <LinkIcon className="h-3.5 w-3.5"/>
            </Button>
          )}
          {buttons.image && (
            <Button
              ref={imageButtonRef}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageModal(!showImageModal)}
              disabled={disabled}
              className="h-7 w-7 p-0"
              title="Insert Image"
            >
              <ImageIcon className="h-3.5 w-3.5"/>
            </Button>
          )}
        </div>
      )}

      {/* Modals rendered at root level */}
      {showLinkModal && buttons.link && (
        <LinkModal
          onInsert={insertLink}
          onClose={() => setShowLinkModal(false)}
          buttonRef={linkButtonRef}
        />
      )}
      {showImageModal && buttons.image && (
        <ImageModal
          onInsert={insertImage}
          onClose={() => setShowImageModal(false)}
          buttonRef={imageButtonRef}
        />
      )}
    </div>
  )
}

// Character count plugin
function CharacterCountPlugin ({
  maxCharacters,
  showCount = true,
  onCountChange,
  labels,
}: {
  maxCharacters?: number
  showCount?: boolean
  onCountChange?: (count: number) => void
  labels?: {
    characterCount?: string
    characterLimitExceeded?: string
  }
}) {
  const [editor] = useLexicalComposerContext()
  const [characterCount, setCharacterCount] = React.useState(0)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot()
        const text = root.getTextContent()
        const count = text.length
        setCharacterCount(count)
        onCountChange?.(count)
      })
    })
  }, [editor, onCountChange])

  if (!showCount) {
    return null
  }

  const isOverLimit = maxCharacters ? characterCount > maxCharacters : false

  return (
    <div className="flex justify-between items-center px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <div className={`text-xs ${isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {characterCount}{maxCharacters ? ` / ${maxCharacters}` : ''}{!maxCharacters && ` ${labels?.characterCount || 'characters'}`}
        {isOverLimit && (
          <span className="ml-2">{labels?.characterLimitExceeded || 'Limit exceeded'}</span>
        )}
      </div>
    </div>
  )
}

// HTML onChange plugin
function HTMLChangePlugin ({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null)
        onChange(htmlString)
      })
    })
  }, [editor, onChange])

  return null
}

// Initial HTML content plugin
function InitialValuePlugin ({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (html && !hasInitialized.current) {
      hasInitialized.current = true

      setTimeout(() => {
        editor.update(() => {
          try {
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')
            const nodes = $generateNodesFromDOM(editor, doc)
            const root = $getRoot()
            root.clear()

            for (const node of nodes) {
              try {
                if (!node.getParent()) {
                  root.append(node)
                }
              }
              catch (appendError) {
                console.warn('Failed to append node:', appendError)
                try {
                  const textContent = node.getTextContent()
                  if (textContent) {
                    const paragraph = $createParagraphNode()
                    paragraph.append($createTextNode(textContent))
                    root.append(paragraph)
                  }
                }
                catch (fallbackError) {
                  console.warn('Fallback also failed:', fallbackError)
                }
              }
            }

            if (root.getChildrenSize() === 0) {
              const paragraph = $createParagraphNode()
              const plainText = doc.body.textContent || html.replace(/<[^>]*>/g, '')
              paragraph.append($createTextNode(plainText))
              root.append(paragraph)
            }
          }
          catch (error) {
            console.error('Failed to parse HTML:', error)
            try {
              const root = $getRoot()
              root.clear()
              const paragraph = $createParagraphNode()
              const plainText = html.replace(/<[^>]*>/g, '')
              paragraph.append($createTextNode(plainText))
              root.append(paragraph)
            }
            catch (finalError) {
              console.error('All attempts failed:', finalError)
            }
          }
        })
      }, 100)
    }
  }, [editor, html])

  return null
}

// Clear content plugin
function ClearContentPlugin ({ onClearRef }: { onClearRef: (clearFn: () => void) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const clearContent = () => {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
      })
    }

    onClearRef(clearContent)
  }, [editor, onClearRef])

  return null
}

// Read-only plugin for disabled state
function ReadOnlyPlugin () {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.setEditable(false)
    return () => {
      editor.setEditable(true)
    }
  }, [editor])

  return null
}

// Load content plugin for editing workflow
function LoadContentPlugin ({
  loadContentRef,
  editingContent,
  autoLoad = true,
}: {
  loadContentRef: (loadFn: (html: string) => void) => void
  editingContent?: string | null
  autoLoad?: boolean
}) {
  const [editor] = useLexicalComposerContext()
  const loadedContentIdRef = useRef<string | null>(null)

  useEffect(() => {
    const loadContent = (html: string) => {
      editor.update(() => {
        try {
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          const nodes = $generateNodesFromDOM(editor, doc)
          const root = $getRoot()
          root.clear()

          for (const node of nodes) {
            try {
              if (!node.getParent()) {
                root.append(node)
              }
            }
            catch (appendError) {
              console.warn('Failed to append node:', appendError)
              try {
                const textContent = node.getTextContent()
                if (textContent) {
                  const paragraph = $createParagraphNode()
                  paragraph.append($createTextNode(textContent))
                  root.append(paragraph)
                }
              }
              catch (fallbackError) {
                console.warn('Fallback also failed:', fallbackError)
              }
            }
          }

          if (root.getChildrenSize() === 0) {
            const paragraph = $createParagraphNode()
            const plainText = doc.body.textContent || html.replace(/<[^>]*>/g, '')
            paragraph.append($createTextNode(plainText))
            root.append(paragraph)
          }
        }
        catch (error) {
          console.error('Failed to load HTML:', error)
        }
      })
    }

    loadContentRef(loadContent)
  }, [editor, loadContentRef])

  // Auto-load editing content when it changes
  useEffect(() => {
    if (autoLoad && editingContent && loadedContentIdRef.current !== editingContent) {
      loadedContentIdRef.current = editingContent
      editor.update(() => {
        try {
          const parser = new DOMParser()
          const doc = parser.parseFromString(editingContent, 'text/html')
          const nodes = $generateNodesFromDOM(editor, doc)
          const root = $getRoot()
          root.clear()

          for (const node of nodes) {
            try {
              if (!node.getParent()) {
                root.append(node)
              }
            }
            catch (appendError) {
              console.warn('Failed to append node:', appendError)
            }
          }

          if (root.getChildrenSize() === 0) {
            const paragraph = $createParagraphNode()
            const plainText = doc.body.textContent || editingContent.replace(/<[^>]*>/g, '')
            if (plainText) {
              paragraph.append($createTextNode(plainText))
              root.append(paragraph)
            }
          }
        }
        catch (error) {
          console.error('Failed to load editing content:', error)
        }
      })
    } else if (editingContent === null && loadedContentIdRef.current !== null) {
      // Clear when editing is cancelled
      loadedContentIdRef.current = null
      editor.update(() => {
        const root = $getRoot()
        root.clear()
      })
    }
  }, [editor, editingContent, autoLoad])

  return null
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  className = '',
  disabled = false,
  maxCharacters,
  showToolbar = true,
  showCharacterCount = true,
  labels,
  editingContent,
  autoLoadEditContent = true,
  enabledButtons,
}, ref) => {
  const [characterCount, setCharacterCount] = React.useState(0)
  const clearContentRef = useRef<() => void>()
  const loadContentRef = useRef<(html: string) => void>()
  const editorRef = useRef<any>()

  useImperativeHandle(ref, () => ({
    clearContent: () => {
      if (clearContentRef.current) {
        clearContentRef.current()
      }
    },
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus()
      }
    },
    getTextContent: () => {
      return ''
    },
    loadContent: (html: string) => {
      if (loadContentRef.current) {
        loadContentRef.current(html)
      }
    },
  }), [])

  const initialConfig = {
    namespace: 'RichTextEditor',
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error)
    },
    theme: {
      paragraph: 'mb-1.5 leading-relaxed',
      quote: 'border-l-2 border-gray-400 dark:border-gray-500 pl-3 italic text-gray-700 dark:text-gray-300 my-2',
      heading: {
        h1: 'text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100',
        h2: 'text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100',
        h3: 'text-lg font-semibold mb-1.5 text-gray-900 dark:text-gray-100',
      },
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal ml-5 mb-2 space-y-0.5',
        ul: 'list-disc ml-5 mb-2 space-y-0.5',
        listitem: 'leading-relaxed',
      },
      link: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline cursor-pointer',
      text: {
        bold: 'font-semibold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono',
      },
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      AutoLinkNode,
      LinkNode,
    ],
  }

  const isCharacterLimitExceeded = maxCharacters ? characterCount > maxCharacters : false

  const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        {showToolbar && <ToolbarPlugin disabled={disabled} enabledButtons={enabledButtons}/>}

        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                ref={editorRef}
                className={`outline-none px-3 py-2.5 min-h-[140px] max-h-[500px] overflow-y-auto ${
                  disabled ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed' : 'bg-white dark:bg-gray-950'
                } ${isCharacterLimitExceeded ? 'border-red-300 dark:border-red-700' : ''} text-gray-900 dark:text-gray-100 text-sm leading-relaxed`}
                style={{ direction: 'ltr', textAlign: 'left' }}
                placeholder={
                  <div className="absolute top-2.5 left-3 text-gray-400 dark:text-gray-500 pointer-events-none select-none text-sm">
                    {placeholder}
                  </div>
                }
                aria-placeholder={placeholder}
              />
            }
            ErrorBoundary={ErrorBoundary}
            placeholder={null}
          />
        </div>

        <HistoryPlugin/>
        <ListPlugin/>
        <LinkPlugin/>
        <TabIndentationPlugin/>
        <HTMLChangePlugin onChange={onChange}/>
        <InitialValuePlugin html={value}/>
        <ClearContentPlugin onClearRef={(clearFn) => { clearContentRef.current = clearFn }}/>
        <LoadContentPlugin
          loadContentRef={(loadFn) => { loadContentRef.current = loadFn }}
          editingContent={editingContent}
          autoLoad={autoLoadEditContent}
        />
        {disabled && <ReadOnlyPlugin/>}

        {showCharacterCount && (
          <CharacterCountPlugin
            maxCharacters={maxCharacters}
            onCountChange={setCharacterCount}
            labels={labels}
          />
        )}
      </LexicalComposer>
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
