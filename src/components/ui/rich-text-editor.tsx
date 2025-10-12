import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { Button } from './button'
import { Bold, Indent, Italic, List, ListOrdered, Outdent, Quote, Type, Underline } from 'lucide-react'

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
}

export interface RichTextEditorRef {
  clearContent: () => void
  focus: () => void
  getTextContent: () => string
}

// Toolbar component
function ToolbarPlugin ({ disabled }: { disabled?: boolean }) {
  const [editor] = useLexicalComposerContext()

  const formatText = useCallback(
    (format: 'bold' | 'italic' | 'underline') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    },
    [editor],
  )

  const formatHeading = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h3'))
      }
    })
  }, [editor])

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }, [editor])

  const insertList = useCallback(
    (type: 'bullet' | 'number') => {
      if (type === 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      }
    },
    [editor],
  )

  const indentContent = useCallback(() => {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
  }, [editor])

  const outdentContent = useCallback(() => {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
  }, [editor])

  return (
    <div className="flex items-center space-x-1 p-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
      <Button type="button" variant="ghost" size="sm" onClick={() => formatText('bold')} disabled={disabled} className="h-7 w-7 p-0" title="Bold">
        <Bold className="h-3.5 w-3.5"/>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => formatText('italic')} disabled={disabled} className="h-7 w-7 p-0" title="Italic">
        <Italic className="h-3.5 w-3.5"/>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => formatText('underline')} disabled={disabled} className="h-7 w-7 p-0" title="Underline">
        <Underline className="h-3.5 w-3.5"/>
      </Button>
      <div className="w-px h-5 bg-gray-300 mx-1"/>
      <Button type="button" variant="ghost" size="sm" onClick={formatHeading} disabled={disabled} className="h-7 w-7 p-0" title="Heading">
        <Type className="h-3.5 w-3.5"/>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={formatQuote} disabled={disabled} className="h-7 w-7 p-0" title="Quote">
        <Quote className="h-3.5 w-3.5"/>
      </Button>
      <div className="w-px h-5 bg-gray-300 mx-1"/>
      <Button type="button" variant="ghost" size="sm" onClick={() => insertList('bullet')} disabled={disabled} className="h-7 w-7 p-0" title="Bullet List">
        <List className="h-3.5 w-3.5"/>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => insertList('number')} disabled={disabled} className="h-7 w-7 p-0" title="Numbered List">
        <ListOrdered className="h-3.5 w-3.5"/>
      </Button>
      <div className="w-px h-5 bg-gray-300 mx-1"/>
      <Button type="button" variant="ghost" size="sm" onClick={outdentContent} disabled={disabled} className="h-7 w-7 p-0" title="Decrease Indent">
        <Outdent className="h-3.5 w-3.5"/>
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={indentContent} disabled={disabled} className="h-7 w-7 p-0" title="Increase Indent">
        <Indent className="h-3.5 w-3.5"/>
      </Button>
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
    <div className="flex justify-between items-center p-2 border-t border-gray-200 bg-gray-50">
      <div className={`text-sm ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
        {characterCount}{maxCharacters ? ` / ${maxCharacters}` : ''}{!maxCharacters && ` ${labels?.characterCount || 'characters'}`}
        {isOverLimit && (
          <span className="ml-2 text-red-600">{labels?.characterLimitExceeded || 'Character limit exceeded'}</span>
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
}, ref) => {
  const [characterCount, setCharacterCount] = React.useState(0)
  const clearContentRef = useRef<() => void>()
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
  }), [])

  const initialConfig = {
    namespace: 'RichTextEditor',
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error)
    },
    theme: {
      paragraph: 'mb-2',
      quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2',
      heading: {
        h1: 'text-2xl font-bold mb-2',
        h2: 'text-xl font-bold mb-2',
        h3: 'text-lg font-bold mb-2',
      },
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal list-inside mb-2',
        ul: 'list-disc list-inside mb-2',
        listitem: 'mb-1',
      },
      link: 'text-blue-600 hover:text-blue-800 underline',
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
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        {showToolbar && <ToolbarPlugin disabled={disabled}/>}

        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                ref={editorRef}
                className={`outline-none px-4 py-3 min-h-[120px] max-h-[400px] overflow-y-auto resize-none ${
                  disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                } ${isCharacterLimitExceeded ? 'border-red-300' : ''}`}
                style={{ direction: 'ltr', textAlign: 'left' }}
                placeholder={
                  <div className="absolute top-3 left-4 text-gray-400 pointer-events-none select-none">
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

