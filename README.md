# UI Commons - Joomla 5 React Component Library

A comprehensive, reusable UI component library extracted from CjForum for use across multiple Joomla 5 extensions with React SPA integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)
[![Joomla](https://img.shields.io/badge/Joomla-5.0+-1a3867.svg)](https://www.joomla.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
    - [Context Providers](#context-providers)
    - [Dynamic Layout System](#dynamic-layout-system)
    - [UI Components](#ui-components)
    - [Services](#services)
    - [Utilities](#utilities)
- [Documentation](#documentation)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**UI Commons** is a production-ready library that extracts and consolidates common components, features, and utilities from the CjForum Joomla 5 component. It provides a robust foundation for building modern React-based SPAs within Joomla
extensions.

### Why UI Commons?

- ✅ **DRY Principle**: Avoid code duplication across multiple Joomla extensions
- ✅ **Consistent UX**: Maintain a unified user experience across all your components
- ✅ **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Joomla Integration**: Seamless integration with Joomla 5's APIs and systems
- ✅ **Modern Stack**: Built with React 18, TypeScript, Tailwind CSS, and Radix UI
- ✅ **Production Ready**: Battle-tested in CjForum production environment

## ✨ Features

### 🎨 UI Components (25+ Components)

- **Layout Components**: Card, TabbedContainer, Separator, ScrollArea
- **Form Components**: Input, Textarea, Select, Switch, Label, RichTextEditor
- **Interactive Components**: Button, Badge, Alert, ConfirmationDialog, Popover
- **Data Display**: Avatar, Pagination (3 variants), LoadingSkeleton, ErrorMessage
- **Advanced Components**: AttachmentManager, TagSelector, ThemeToggle, LoginModal
- **Command Components**: Command palette with search and filtering

### 🏗️ Dynamic Layout System

- **Block Registry**: Register and manage reusable block components
- **Layout Manager**: Render dynamic layouts with 12-column responsive grid
- **Layout Provider**: Component-specific configuration context
- **Layout Service**: API integration for fetching layouts from Joomla backend
- **Conditional Rendering**: Show/hide blocks based on context
- **Sticky & Full-Width Support**: Special layout configurations

### 🌐 Context Providers

- **LanguageProvider**: i18n integration with Joomla's language system
- **ThemeProvider**: Dark/light/system theme management
- **AuthProvider**: User authentication state management
- **LayoutProvider**: Dynamic layout configuration

### 🛠️ Services

- **LayoutService**: Fetch and manage dynamic layouts
- **AttachmentService**: File upload and attachment management
- **TagService**: Tag retrieval and management

### 🧰 Utilities

- **Date Utils**: Human-readable date formatting (`2 hours ago`)
- **Number Utils**: Format numbers with K/M notation (1.5K, 2.3M)
- **Text Utils**: HTML stripping, excerpt generation, sanitization
- **HTML Utils**: Extract formatted intros from HTML content
- **Class Utils**: `cn()` for Tailwind class merging, avatar URL generation

### 🎯 TypeScript Support

- Full type definitions for all components and APIs
- Joomla global object type declarations included
- Autocomplete and IntelliSense support

## 📦 Installation

```bash
npm install @shondalai/ui-commons
```

### Peer Dependencies

The library requires React 18+ as a peer dependency:

```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

**Optional dependencies** (only if using RichTextEditor):

```bash
npm install lexical@^0.35.0 @lexical/react@^0.35.0 @lexical/html@^0.35.0 \
  @lexical/link@^0.35.0 @lexical/list@^0.35.0 @lexical/rich-text@^0.35.0 \
  @lexical/selection@^0.35.0 @lexical/utils@^0.35.0
```

## 🚀 Quick Start

### Basic Setup

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  LanguageProvider, 
  ThemeProvider, 
  AuthProvider 
} from '@shondalai/ui-commons'
import '@shondalai/ui-commons/dist/ui-commons.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider defaultTheme="system" storageKey="myext-theme">
        <AuthProvider userDataKey="user">
          <App />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
)
```

### Using Components

```tsx
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  useLanguage,
  useTheme,
  useAuth
} from '@shondalai/ui-commons'

function MyComponent() {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('COM_MYEXT_WELCOME', 'Welcome')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <p>{t('COM_MYEXT_HELLO', 'Hello %s!', user?.name)}</p>
        ) : (
          <Button onClick={() => {/* login logic */}}>
            {t('COM_MYEXT_LOGIN', 'Login')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

## 🧩 Core Concepts

### Context Providers

#### LanguageProvider

Provides seamless integration with Joomla's language system.

```tsx
import { useLanguage } from '@shondalai/ui-commons'

function MyComponent() {
  const { t, loaded, currentLanguage } = useLanguage()
  
  return (
    <div>
      {/* Basic translation */}
      <h1>{t('COM_MYEXT_TITLE', 'Default Title')}</h1>
      
      {/* With sprintf-style placeholders */}
      <p>{t('COM_MYEXT_WELCOME', 'Welcome %s!', username)}</p>
      
      {/* With named placeholders */}
      <p>{t('COM_MYEXT_GREETING', 'Hello {{name}}!', { name: username })}</p>
      
      {/* Current language */}
      <span>Language: {currentLanguage}</span>
    </div>
  )
}
```

#### ThemeProvider

Manages dark/light/system theme preferences.

```tsx
import { useTheme, ThemeToggle } from '@shondalai/ui-commons'

function MyComponent() {
  const { theme, setTheme, actualTheme } = useTheme()
  
  return (
    <div>
      <ThemeToggle /> {/* Pre-built toggle component */}
      
      {/* Manual theme control */}
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      
      <p>Current theme: {actualTheme}</p>
    </div>
  )
}
```

#### AuthProvider

Manages user authentication state.

```tsx
import { useAuth } from '@shondalai/ui-commons'

function MyComponent() {
  const { user, isAuthenticated, isGuest, login, logout } = useAuth()
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}!</p>
          <p>Email: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login(userData)}>Login</button>
      )}
    </div>
  )
}
```

### Dynamic Layout System

The layout system enables you to create dynamic, database-driven page layouts with a 12-column responsive grid.

#### Step 1: Define Block Components

```tsx
// src/blocks/welcome-block.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@shondalai/ui-commons'

export const WelcomeBlock = ({ config }: { config: any }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title || 'Welcome'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{config.message || 'Welcome to our forum!'}</p>
      </CardContent>
    </Card>
  )
}
```

#### Step 2: Register Blocks

```tsx
// src/config/blocks.ts
import { WelcomeBlock } from '@/blocks/welcome-block'
import { StatsBlock } from '@/blocks/stats-block'
import { RecentTopicsBlock } from '@/blocks/recent-topics-block'

export const forumBlocks = {
  'welcome': WelcomeBlock,
  'stats': StatsBlock,
  'recent-topics': RecentTopicsBlock,
}
```

#### Step 3: Configure Layout Provider

```tsx
// src/App.tsx
import { LayoutProvider, useBlockRegistration } from '@shondalai/ui-commons'
import { forumBlocks } from './config/blocks'

function App() {
  useBlockRegistration(forumBlocks)
  
  return (
    <LayoutProvider config={{
      componentName: 'cjforum',
      apiBaseUrl: '/index.php?option=com_cjforum',
      layoutTaskPrefix: 'layout',
    }}>
      <YourRoutes />
    </LayoutProvider>
  )
}
```

#### Step 4: Use Dynamic Layouts

```tsx
// src/pages/Dashboard.tsx
import { useLayout, DynamicLayoutManager } from '@shondalai/ui-commons'

function Dashboard() {
  const { layout, loading, error, refetch } = useLayout('dashboard')
  
  if (loading) return <div>Loading layout...</div>
  if (error) return <div>Error: {error}</div>
  if (!layout) return <div>No layout found</div>
  
  return <DynamicLayoutManager layout={layout} />
}
```

**See [LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md) for comprehensive layout system documentation.**

### UI Components

#### Form Components

```tsx
import { 
  Input, 
  Textarea, 
  Select, 
  SelectTrigger, 
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Label,
  Button
} from '@shondalai/ui-commons'

function MyForm() {
  return (
    <form>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Enter title..." />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="featured" />
        <Label htmlFor="featured">Featured</Label>
      </div>
      
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

#### RichTextEditor

```tsx
import { RichTextEditor } from '@shondalai/ui-commons'
import { useRef } from 'react'

function Editor() {
  const editorRef = useRef<RichTextEditorRef>(null)
  
  const handleSubmit = () => {
    const html = editorRef.current?.getHtml()
    console.log('Content:', html)
  }
  
  return (
    <div>
      <RichTextEditor
        ref={editorRef}
        initialValue="<p>Initial content</p>"
        placeholder="Write something amazing..."
        onChange={(html) => console.log('Changed:', html)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  )
}
```

#### Pagination

```tsx
import { Pagination, CompactPagination, SimplePagination } from '@shondalai/ui-commons'

function DataList() {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
    limitStart: 0
  })
  
  return (
    <div>
      {/* Full-featured pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={(page) => setPagination({...pagination, page})}
        showPageSizeSelector
        pageSizeOptions={[10, 20, 50, 100]}
        onPageSizeChange={(limit) => setPagination({...pagination, limit})}
      />
      
      {/* Compact version */}
      <CompactPagination
        pagination={pagination}
        onPageChange={(page) => setPagination({...pagination, page})}
      />
      
      {/* Simple version */}
      <SimplePagination
        pagination={pagination}
        onPageChange={(page) => setPagination({...pagination, page})}
      />
    </div>
  )
}
```

#### AttachmentManager

```tsx
import { AttachmentManager } from '@shondalai/ui-commons'

function TopicForm() {
  const [attachments, setAttachments] = useState([])
  
  return (
    <AttachmentManager
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      uploadUrl="/index.php?option=com_cjforum&task=attachment.upload"
      maxFiles={5}
      maxFileSize={5 * 1024 * 1024} // 5MB
      allowedTypes={['image/*', '.pdf', '.doc', '.docx']}
    />
  )
}
```

#### TagSelector

```tsx
import { TagSelector } from '@shondalai/ui-commons'

function TopicForm() {
  const [selectedTags, setSelectedTags] = useState([])
  
  return (
    <TagSelector
      selectedTags={selectedTags}
      onTagsChange={setSelectedTags}
      fetchUrl="/index.php?option=com_cjforum"
      maxTags={5}
      placeholder="Add tags..."
    />
  )
}
```

### Services

#### LayoutService

```tsx
import { LayoutService } from '@shondalai/ui-commons'

// Fetch a layout
const layout = await LayoutService.fetchLayout(
  '/index.php?option=com_cjforum',
  'dashboard',
  'layout'
)

// Create a service instance
const layoutService = createLayoutService({
  componentName: 'cjforum',
  apiBaseUrl: '/index.php?option=com_cjforum',
  layoutTaskPrefix: 'layout',
})

const layout = await layoutService.fetchLayout('dashboard')
```

#### AttachmentService

```tsx
import { AttachmentService } from '@shondalai/ui-commons'

// Upload temporary file
const result = await AttachmentService.uploadTemporary(
  file,
  '/index.php?option=com_cjforum&task=attachment.upload',
  'topic'
)

// Delete attachment
await AttachmentService.deleteAttachment(
  attachmentId,
  '/index.php?option=com_cjforum&task=attachment.delete'
)

// Get file type from filename
const fileType = AttachmentService.getFileType('document.pdf') // 'document'
```

#### TagService

```tsx
import { TagService } from '@shondalai/ui-commons'

// Get tags with filters
const response = await TagService.getTags(
  '/index.php?option=com_cjforum',
  {
    published: 1,
    search: 'java',
    limit: 20,
    start: 0
  }
)

console.log(response.tags) // Array of tags
console.log(response.pagination) // Pagination metadata
```

### Utilities

#### Date Utilities

```tsx
import { humanReadableDate } from '@shondalai/ui-commons'

const date = humanReadableDate('2025-10-11T10:30:00') // "2 hours ago"
```

#### Number Utilities

```tsx
import { formatShortNumber, formatNumber } from '@shondalai/ui-commons'

formatShortNumber(1500) // "1.5K"
formatShortNumber(2300000) // "2.3M"
formatNumber(1234567) // "1,234,567"
```

#### Text Utilities

```tsx
import { stripHtml, getTextExcerpt, sanitizeHtmlContent } from '@shondalai/ui-commons'

// Strip HTML tags
const text = stripHtml('<p>Hello <b>World</b></p>') // "Hello World"

// Get excerpt
const excerpt = getTextExcerpt('<p>Long HTML content...</p>', 100) // "Long HTML content..."

// Sanitize HTML
const safe = sanitizeHtmlContent(userInput)
```

#### HTML Utilities

```tsx
import { extractTextIntro, extractFormattedIntro } from '@shondalai/ui-commons'

// Extract plain text intro
const intro = extractTextIntro(htmlContent, 200)

// Extract formatted intro (preserves some formatting)
const formatted = extractFormattedIntro(htmlContent, 200)
```

#### Class Utilities

```tsx
import { cn, generateAvatarUrl } from '@shondalai/ui-commons'

// Merge Tailwind classes
const className = cn(
  'px-4 py-2',
  isActive && 'bg-blue-500',
  'hover:bg-blue-600'
)

// Generate avatar URL
const avatarUrl = generateAvatarUrl({
  id: 123,
  name: 'John Doe',
  avatar: null // Will generate from name
})
```

## 📚 Documentation

- **[LAYOUT_SYSTEM.md](./LAYOUT_SYSTEM.md)** - Comprehensive layout system guide
- **[PROVIDERS.md](./PROVIDERS.md)** - Detailed provider usage and examples

## 🔧 TypeScript Support

UI Commons is built with TypeScript and provides comprehensive type definitions.

### Joomla Type Declarations

The library includes type declarations for Joomla's global objects. No need to create `global.d.ts` in your projects:

```tsx
// TypeScript automatically recognizes these
const token = window.Joomla?.getOptions('csrf.token')
const translation = window.Joomla?.Text._('COM_MYEXT_KEY', 'Default')
window.Joomla?.submitbutton('task.save')
```

### Exported Types

```tsx
// Import types as needed
import type { 
  LayoutTemplate,
  LayoutArea,
  LayoutBlock,
  PaginationMeta,
  PaginatedResponse,
  Attachment,
  Tag,
  User,
  LayoutConfig
} from '@shondalai/ui-commons'
```

## 🏗️ Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Generate coverage report
```

### Linting

```bash
npm run lint
```

## 🎨 Styling

UI Commons uses **Tailwind CSS** for styling. The library includes pre-built CSS that you must import:

```tsx
import '@shondalai/ui-commons/dist/ui-commons.css'
```

### Customization

If you want to customize the theme, you can extend Tailwind configuration in your project and override CSS variables.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Maverick** - [Shondalai](https://github.com/shondalai)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI primitives from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Rich text editing with [Lexical](https://lexical.dev/)
- Icons from [Lucide React](https://lucide.dev/)
- Developed for [Joomla 5](https://www.joomla.org/)

## 🔗 Links

- **GitHub**: https://github.com/shondalai/ui-commons
- **Issues**: https://github.com/shondalai/ui-commons/issues
- **CjForum**: https://www.corejoomla.com/joomla-extensions/cjforum.html

---

**Built with ❤️ for the Joomla community**

