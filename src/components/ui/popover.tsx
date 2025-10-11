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
>(({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => {
  const { open } = React.useContext(Popover)

  if (!open) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'z-50 w-72 rounded-md border bg-white dark:bg-neutral-800 p-4 text-neutral-900 dark:text-neutral-100 shadow-md outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      style={{ marginTop: sideOffset }}
      {...props}
    >
      {children}
    </div>
  )
})
PopoverContent.displayName = 'PopoverContent'

export { PopoverRoot as Popover, PopoverTrigger, PopoverContent }

