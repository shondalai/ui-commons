# UI Commons - Layout System

Generic, reusable layout system for Joomla 5 components with modular block-based rendering.

## Features

- ✅ **Block Registry** - Register and manage block components
- ✅ **Layout Provider** - Component-specific configuration context
- ✅ **Generic Layout Hook** - Fetch layouts from any Joomla component API
- ✅ **Layout Service** - Handle API communication with Joomla backend
- ✅ **Dynamic Layout Manager** - Render layouts with 12-column grid system
- ✅ **TypeScript Support** - Full type safety
- ✅ **Responsive Design** - Mobile-first grid system
- ✅ **Conditional Rendering** - Show/hide blocks based on context
- ✅ **Sticky & Full-Width Blocks** - Special layout configurations

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Joomla Component (e.g., CjForum)      │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │          App.tsx                         │  │
│  │  • LayoutProvider (config)               │  │
│  │  • useBlockRegistration(blocks)          │  │
│  └──────────────────────────────────────────┘  │
│                      │                          │
│                      ▼                          │
│  ┌──────────────────────────────────────────┐  │
│  │          Page Component                  │  │
│  │  • useLayout('dashboard')                │  │
│  │  • DynamicLayoutManager                  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              @shondalai/ui-commons              │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Layout Context                          │  │
│  │  • LayoutProvider                        │  │
│  │  • useLayoutConfig()                     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Block Registry                          │  │
│  │  • registerBlockComponents()             │  │
│  │  • useBlockRegistration()                │  │
│  │  • renderBlock()                         │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Layout Service                          │  │
│  │  • fetchLayout()                         │  │
│  │  • createLayoutService()                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Layout Hook                             │  │
│  │  • useLayout()                           │  │
│  │  • useMultipleLayouts()                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Dynamic Layout Manager                  │  │
│  │  • Renders areas and blocks              │  │
│  │  • 12-column responsive grid             │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         Joomla Backend API                      │
│  GET /index.php?option=com_xxx&task=...         │
└─────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Package

```bash
npm install @shondalai/ui-commons
```

### 2. Setup in Your Component

**Step 1: Define Blocks** (`src/config/blocks.ts`)

```typescript
import { MyBlock1 } from '@/components/blocks/my-block-1'
import { MyBlock2 } from '@/components/blocks/my-block-2'

export const myComponentBlocks = {
  'my-block-1': MyBlock1,
  'my-block-2': MyBlock2,
}
```

**Step 2: Configure Layout** (`src/config/layout-config.ts`)

```typescript
export const getLayoutConfig = () => ({
  apiBaseUrl: '/index.php?option=com_mycomponent',
  csrfToken: window.Joomla?.getOptions?.('com_mycomponent')?.['csrf.token'],
  componentName: 'mycomponent',
  debug: process.env.NODE_ENV === 'development',
})
```

**Step 3: Update App** (`src/App.tsx`)

```typescript
import { LayoutProvider, useBlockRegistration } from '@shondalai/ui-commons'
import { myComponentBlocks } from './config/blocks'
import { getLayoutConfig } from './config/layout-config'

function AppContent() {
  useBlockRegistration(myComponentBlocks)
  return <Routes>{/* ... */}</Routes>
}

function App() {
  return (
    <LayoutProvider config={getLayoutConfig()}>
      <AppContent />
    </LayoutProvider>
  )
}
```

**Step 4: Use in Pages** (`src/pages/dashboard.tsx`)

```typescript
import { useLayout, DynamicLayoutManager } from '@shondalai/ui-commons'

function Dashboard() {
  const { areas, isLoading, error } = useLayout('dashboard')
  
  if (isLoading) return <LoadingComponent />
  if (error) return <ErrorComponent error={error} />
  
  return <DynamicLayoutManager areas={areas} />
}
```

## API Reference

### LayoutProvider

Provides layout configuration context.

```typescript
<LayoutProvider config={layoutConfig}>
  {children}
</LayoutProvider>
```

**Config Options:**

- `apiBaseUrl` - Base URL for layout API
- `csrfToken` - CSRF token for API requests
- `componentName` - Component identifier
- `debug` - Enable debug logging

### useBlockRegistration

Register blocks on component mount.

```typescript
useBlockRegistration(blocks)
```

### useLayout

Fetch layout from backend API.

```typescript
const { areas, layout, isLoading, error, refetch } = useLayout(layoutType, params?)
```

### DynamicLayoutManager

Render layout areas and blocks.

```typescript
<DynamicLayoutManager
  areas={areas}
  contextData={{}}
  componentProps={{}}
  isLoading={false}
  loadingComponent={LoadingComponent}
  className=""
/>
```

## Block Component Pattern

Blocks receive props directly from layout configuration:

```typescript
interface MyBlockProps {
  title?: string
  config?: Record<string, any>
  className?: string
  // ... any other props from contextData or componentProps
}

export const MyBlock: React.FC<MyBlockProps> = ({ 
  title, 
  config, 
  className 
}) => {
  return (
    <div className={className}>
      <h2>{title || config?.title}</h2>
      {/* Block content */}
    </div>
  )
}
```

## Backend API Format

Your Joomla controller should return:

```json
{
  "success": true,
  "data": {
    "areas": [
      {
        "id": 1,
        "area_name": "main",
        "grid_row": 1,
        "grid_order": 1,
        "grid_columns": 12,
        "responsive_config": {
          "sm": 12,
          "md": 8,
          "lg": 6
        },
        "blocks": [
          {
            "id": 1,
            "block_type": "my-block-1",
            "ordering": 1,
            "block_config": {
              "title": "My Block",
              "css_class": "custom-class",
              "full_width": "false",
              "sticky_header": "false"
            },
            "responsive_config": {
              "hidden_sm": false,
              "hidden_md": false
            }
          }
        ]
      }
    ]
  }
}
```

## Exported Components

```typescript
// Layout System - Block Registry
export {
  registerBlockComponent,
  registerBlockComponents,
  useBlockRegistration,
  getBlockComponent,
  hasBlockComponent,
  renderBlock,
  clearBlockRegistry,
}

// Layout System - Context
export { 
  LayoutProvider, 
  useLayoutConfig 
}

// Layout System - Hooks
export { 
  useLayout, 
  useMultipleLayouts 
}

// Layout System - Services
export { 
  LayoutService, 
  createLayoutService 
}

// Layout System - Components
export { 
  DynamicLayoutManager 
}

// Types
export type { 
  LayoutConfig, 
  LayoutArea, 
  LayoutBlock, 
  UseLayoutResult 
}
```

## License

MIT

