import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import {glob} from 'glob'
import {fileURLToPath} from 'node:url'
import {extname, relative} from 'path'

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            include: ['src/**/*'],
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**/*'],
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: () => 'index.js',
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                /^@radix-ui\/.*/,
                /^@lexical\/.*/,
                'lexical',
                'clsx',
                'tailwind-merge',
                'class-variance-authority',
                'cmdk',
                'lucide-react',
                'date-fns',
                /^@testing-library\/.*/,
                /^@vitest\/.*/,
                'vitest',
                'happy-dom',
                'jsdom',
                /^chai.*/,
                /^pretty-format.*/,
                /^aria-query.*/,
                /^dom-accessibility-api.*/,
            ],
            input: Object.fromEntries(
                glob.sync('src/**/*.{ts,tsx}', {
                    ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts', 'src/test/**/*']
                }).map(file => [
                    // This removes `src/` and the file extension from each file
                    relative(
                        'src',
                        file.slice(0, file.length - extname(file).length)
                    ),
                    // This expands to the absolute path of each entry file
                    fileURLToPath(new URL(file, import.meta.url))
                ])
            ),
            output: {
                assetFileNames: 'assets/[name][extname]',
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                preserveModules: true,
                preserveModulesRoot: 'src',
            },
        },
        sourcemap: true,
        minify: false, // Keep unminified for better tree-shaking
    },
})

