// Import CSS styles
import './index.css'

// UI Components
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'
export { Badge, badgeVariants } from './components/ui/badge'
export { Button } from './components/ui/button'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card'
export { Checkbox } from './components/ui/checkbox'
export { LoadingSkeleton } from './components/ui/loading-skeleton'
export { TabbedContainer } from './components/ui/tabbed-container'
export type { TabConfig, TabbedContainerProps } from './components/ui/tabbed-container'
export { Alert, AlertTitle, AlertDescription } from './components/ui/alert'
export { Input } from './components/ui/input'
export { Label } from './components/ui/label'
export { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover'
export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from './components/ui/command'
export { ConfirmationDialog } from './components/ui/confirmation-dialog'
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './components/ui/dialog'
export { ErrorMessage } from './components/ui/error-message'
export { ScrollArea, ScrollBar } from './components/ui/scroll-area'
export {
  Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton,
} from './components/ui/select'
export { Separator } from './components/ui/separator'
export { Switch } from './components/ui/switch'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
export { Textarea } from './components/ui/textarea'
export { Progress } from './components/ui/progress'

// New UI Components
export { Pagination, CompactPagination, SimplePagination } from './components/ui/pagination'
export { ThemeToggle } from './components/ui/theme-toggle'
export { LoginModal } from './components/ui/login-modal'
export { AttachmentManager } from './components/ui/attachment-manager'
export { TagSelector } from './components/ui/tag-selector'
export { RichTextEditor } from './components/ui/rich-text-editor'
export type { RichTextEditorRef } from './components/ui/rich-text-editor'

// Layout System - Block Registry
export {
  registerBlockComponent,
  registerBlockComponents,
  useBlockRegistration,
  getBlockComponent,
  hasBlockComponent,
  getRegisteredBlockTypes,
  renderBlock,
  clearBlockRegistry,
  globalBlockRegistry,
} from './components/layout/block-registry'

// Layout System - Components
export { default as DynamicLayoutManager } from './components/layout/dynamic-layout-manager'
export { TabbedContainerBlock } from './components/layout/tabbed-container-block'

// Layout System - Context & Configuration
export { LayoutProvider, useLayoutConfig, useIsLayoutConfigured } from './contexts/layout-context'
export type { LayoutConfig } from './contexts/layout-context'

// New Contexts/Providers
export { LanguageProvider, useLanguage } from './contexts/language-context'
export type { LanguageContextType } from './contexts/language-context'
export { ThemeProvider, useTheme } from './contexts/theme-context'
export { AuthProvider, useAuth } from './contexts/auth-context'
export type { User } from './contexts/auth-context'
export { ToastProvider, useToast } from './contexts/toast-context'

// Layout System - Hooks
export { useLayout, useMultipleLayouts } from './hooks/use-layout'
export type { UseLayoutResult } from './hooks/use-layout'

// Layout System - Services
export { LayoutService, createLayoutService } from './services/layout-service'
export type { LayoutResponse } from './services/layout-service'

// New Services
export { AttachmentService } from './services/attachment.service'
export { TagService } from './services/tag.service'

// Layout System - Types
export type { LayoutBlock, LayoutArea, LayoutTemplate } from './types/layout.types'

// New Types
export type {
  PaginationMeta,
  PaginatedResponse,
  Attachment,
  AttachmentUploadResponse,
  Tag,
  TagsResponse,
} from './types/common.types'

// Utilities
export { cn, generateAvatarUrl } from './lib/utils'
export { humanReadableDate } from './utils/date-utils'
export { formatShortNumber, formatNumber } from './utils/number-utils'
export { stripHtml, getTextExcerpt, sanitizeHtmlContent } from './utils/text-utils'
export { extractTextIntro, extractFormattedIntro } from './utils/html-utils'
