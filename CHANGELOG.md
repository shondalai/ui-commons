# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-10-30

### Added
- 🌲 **Tree-shaking support**: Complete modular build system with `preserveModules`
- 📚 Comprehensive tree-shaking documentation (`TREE_SHAKING.md`)
- 📦 Granular package exports for direct component imports
- ⚡ Significantly reduced bundle sizes for consuming projects

### Changed
- 🔧 Build configuration now uses modular output instead of bundled output
- 📝 Updated README with tree-shaking benefits and usage examples
- 🎯 Enhanced package.json exports for better module resolution
- 🚀 Optimized for modern bundlers (Vite, Webpack 5+, Rollup)

### Improved
- ⚡ Bundle size reduction of up to 50%+ when not using all components
- 🎨 Projects not using RichTextEditor save ~450 KB by excluding Lexical
- 📦 Better code splitting capabilities in consuming applications
- 🔍 Improved IDE autocomplete for direct imports

### Technical Details
- Build now creates individual `.js` files for each module
- Enabled `preserveModules: true` in Rollup configuration
- Added wildcard exports for all major module paths
- Marked CSS as side-effect for proper bundling
- External dependencies properly configured for tree-shaking

### Migration Notes
- ✅ **No breaking changes** - all existing imports continue to work
- ✅ Optional: Use direct imports for better tree-shaking: `import { Button } from '@shondalai/ui-commons/components/ui/button'`
- ✅ Lexical remains optional peer dependency
- ✅ See `TREE_SHAKING.md` for optimization strategies

## [1.0.3] - 2025-10-29

### Added
- Initial stable release with comprehensive UI components
- Dynamic layout system
- Context providers for theme, auth, and language
- Services for attachments, tags, and layouts
- Utility functions for dates, numbers, and text

### Features
- 25+ production-ready UI components
- Full TypeScript support
- Joomla 5 integration
- Tailwind CSS styling
- Radix UI primitives

## Previous Versions

See git history for changes prior to v1.0.3.

