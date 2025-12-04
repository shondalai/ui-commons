import * as React from 'react'
import {cn} from '../../lib/utils'

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex w-full flex-col overflow-hidden rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
      className,
    )}
    {...props}
  />
))
Command.displayName = 'Command'

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-neutral-200 dark:border-neutral-700 px-3">
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = 'CommandInput'

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))
CommandList.displayName = 'CommandList'

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('py-6 text-center text-sm', className)}
    {...props}
  />
))
CommandEmpty.displayName = 'CommandEmpty'

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
  heading?: string
}
>(({ className, heading, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('overflow-hidden p-1 text-neutral-900 dark:text-neutral-100', className)}
    {...props}
  >
    {heading && (
      <div className="px-2 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {heading}
      </div>
    )}
    {props.children}
  </div>
))
CommandGroup.displayName = 'CommandGroup'

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
  onSelect?: () => void
}
>(({ className, onSelect, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700',
      className,
    )}
    onClick={onSelect}
    {...props}
  />
))
CommandItem.displayName = 'CommandItem'

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
}
