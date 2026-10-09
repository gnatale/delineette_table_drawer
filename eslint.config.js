import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

/* The core module owns the most basic functionalities and data structures. 
/* It must not depend on how the PDF files are rendered or manipulated.
/* It must not depend on the UI layer.
*/
const coreImportRestriction = {
  paths: [
    {
      name: 'react',
      message: 'core must not import React.',
    },
    {
      name: 'react-dom',
      message: 'core must not import React.',
    },
    {
      name: 'pdfjs-dist',
      message: 'core must not import pdf.js.',
    },
    {
      name: 'pdf-lib',
      message: 'core must not import pdf-lib.',
    },
  ],
  patterns: [
    {
      group: ['react/*', 'react-dom/*'],
      message: 'core must not import React.',
    },
    {
      group: ['pdfjs-dist/*'],
      message: 'core must not import pdf.js.',
    },
    {
      group: ['pdf-lib/*'],
      message: 'core must not import pdf-lib.',
    },
  ],
}

export default defineConfig(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', coreImportRestriction],
    },
  },
)
