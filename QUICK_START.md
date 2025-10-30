# Quick Start: Using ui-commons v1.0.4 with Tree-Shaking

## For Projects That DON'T Use RichTextEditor

### 1. Install (No Lexical Needed!)
```bash
npm install @shondalai/ui-commons
# That's it! Lexical is optional
```

### 2. Import CSS Once
```typescript
// main.tsx or App.tsx
import '@shondalai/ui-commons/style.css';
```

### 3. Import Components
```typescript
import { 
  Button, 
  Card, 
  Input, 
  Select,
  ThemeProvider 
} from '@shondalai/ui-commons';

function MyApp() {
  return (
    <ThemeProvider>
      <Card>
        <Input placeholder="Email" />
        <Button>Submit</Button>
      </Card>
    </ThemeProvider>
  );
}
```

### 4. Build & Verify
```bash
npm run build
# Check: Lexical should NOT be in your bundle!
# Expected size from ui-commons: ~50-80 KB
```

---

## For Projects That DO Use RichTextEditor

### 1. Install with Lexical
```bash
npm install @shondalai/ui-commons
npm install lexical @lexical/react @lexical/html @lexical/link @lexical/list @lexical/rich-text @lexical/selection @lexical/utils
```

### 2. Import CSS
```typescript
import '@shondalai/ui-commons/style.css';
```

### 3. Use Lazy Loading (Recommended)
```typescript
import { lazy, Suspense } from 'react';
import { Button, Card } from '@shondalai/ui-commons';

// Lazy load only RichTextEditor
const RichTextEditor = lazy(() => 
  import('@shondalai/ui-commons/components/ui/rich-text-editor').then(m => ({
    default: m.RichTextEditor
  }))
);

function EditorPage() {
  return (
    <Card>
      <Suspense fallback={<div>Loading editor...</div>}>
        <RichTextEditor 
          initialValue="" 
          onChange={(html) => console.log(html)} 
        />
      </Suspense>
      <Button>Save</Button>
    </Card>
  );
}
```

**Result**: 
- Initial bundle: ~80 KB (no Lexical)
- Editor page adds: ~450 KB (loaded on demand)

### 4. Or Import Directly (If Always Needed)
```typescript
import { RichTextEditor } from '@shondalai/ui-commons';

// Editor will be in main bundle (~450 KB)
```

---

## Migration from v1.0.3

### ✅ No Code Changes Needed!
```typescript
// Your existing code works as-is
import { Button, Card } from '@shondalai/ui-commons';
```

### ✨ Optional Optimizations

**1. Remove unused Lexical if not needed:**
```bash
npm uninstall lexical @lexical/react @lexical/html @lexical/link @lexical/list @lexical/rich-text @lexical/selection @lexical/utils
```

**2. Use direct imports for better builds:**
```typescript
// Before (works, but larger)
import { Button } from '@shondalai/ui-commons';

// After (optimal)
import { Button } from '@shondalai/ui-commons/components/ui/button';
```

**3. Lazy load heavy components:**
```typescript
const AttachmentManager = lazy(() => 
  import('@shondalai/ui-commons/components/ui/attachment-manager')
);
```

---

## Common Imports Cheat Sheet

### Basic UI
```typescript
import { 
  Button, 
  Input, 
  Card, 
  Alert, 
  Badge 
} from '@shondalai/ui-commons';
```

### Forms
```typescript
import { 
  Input, 
  Textarea, 
  Select, 
  Checkbox, 
  Switch, 
  Label 
} from '@shondalai/ui-commons';
```

### Dialogs & Modals
```typescript
import { 
  Dialog, 
  ConfirmationDialog, 
  Popover 
} from '@shondalai/ui-commons';
```

### Contexts
```typescript
import { 
  ThemeProvider, 
  AuthProvider, 
  LanguageProvider,
  useTheme,
  useAuth 
} from '@shondalai/ui-commons';
```

### Services
```typescript
import { 
  AttachmentService, 
  TagService, 
  LayoutService 
} from '@shondalai/ui-commons';
```

### Utilities
```typescript
import { 
  cn,                      // Tailwind class merger
  humanReadableDate,       // "2 hours ago"
  formatShortNumber,       // "1.5K", "2.3M"
  stripHtml,               // Remove HTML tags
  sanitizeHtmlContent      // Sanitize HTML
} from '@shondalai/ui-commons';
```

---

## Troubleshooting

### "Module not found: @shondalai/ui-commons/components/..."
✅ **Solution**: Update to v1.0.4+
```bash
npm install @shondalai/ui-commons@latest
```

### Bundle still includes Lexical but I don't use RichTextEditor
✅ **Check**: Make sure you're not importing it
```bash
# Search your codebase
grep -r "RichTextEditor" src/
```

✅ **Verify**: Uninstall Lexical (if not needed)
```bash
npm uninstall lexical @lexical/react @lexical/html @lexical/link @lexical/list @lexical/rich-text @lexical/selection @lexical/utils
```

### Types not working for direct imports
✅ **Solution**: Update TypeScript config
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

---

## Bundle Size Examples

### Scenario 1: Basic Dashboard
**Imports**: Button, Card, Input, Select, Alert
**Bundle Size**: ~50 KB from ui-commons

### Scenario 2: Full App (No Editor)
**Imports**: All components except RichTextEditor
**Bundle Size**: ~200-250 KB from ui-commons

### Scenario 3: With Editor (Lazy Loaded)
**Imports**: All components + lazy RichTextEditor
**Initial**: ~250 KB
**Editor Page**: +450 KB

### Scenario 4: With Editor (Direct Import)
**Imports**: All components including RichTextEditor
**Bundle Size**: ~700 KB from ui-commons

---

## Next Steps

1. ✅ Install the package
2. ✅ Import CSS in your main file
3. ✅ Start using components
4. 📊 Analyze your bundle: `npx vite-bundle-visualizer`
5. 🎯 Optimize with lazy loading if needed

## Need Help?

- 📖 [Full Tree-Shaking Guide](TREE_SHAKING.md)
- 📝 [Usage Examples](USAGE_EXAMPLES.js)
- 📋 [Changelog](CHANGELOG.md)
- 🐛 [Report Issues](https://github.com/shondalai/ui-commons/issues)

---

**Happy coding! Your bundles will thank you. 🎉**

