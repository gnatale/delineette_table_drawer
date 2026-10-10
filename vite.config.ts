import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const pdfJsDistPath = path.dirname(
  fileURLToPath(import.meta.resolve('pdfjs-dist/package.json')),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.join(pdfJsDistPath, 'cmaps/*')),
          dest: 'pdfjs/cmaps',
        },
        {
          src: normalizePath(path.join(pdfJsDistPath, 'standard_fonts/*')),
          dest: 'pdfjs/standard_fonts',
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})
