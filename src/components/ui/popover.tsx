import * as React from 'react'
import { cn } from '../../lib/utils'

const Popover = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

const PopoverRoot: React.FC<{
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}> = ({
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <Popover.Provider value={{ open, setOpen }}>
      {children}
    </Popover.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { open, setOpen } = React.useContext(Popover)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(!open)
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = 'PopoverTrigger'

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}
>(({ className, align = 'center', sideOffset = 4, children, ...props }, _ref) => {
  const { open, setOpen } = React.useContext(Popover)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [open, setOpen])

  if (!open) {
    return null
  }

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute w-72 rounded-md border bg-white dark:bg-neutral-800 p-4 text-neutral-900 dark:text-neutral-100 shadow-lg outline-none',
        'animate-in fade-in-0 zoom-in-95',
        alignmentClasses[align],
        className,
      )}
      style={{ marginTop: sideOffset, zIndex: 9999 }}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = 'PopoverContent'

export { PopoverRoot as Popover, PopoverTrigger, PopoverContent }

