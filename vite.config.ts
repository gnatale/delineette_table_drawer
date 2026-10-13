import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { normalizePath } from "vite";
import { defineConfig } from "vitest/config";
import { viteStaticCopy } from "vite-plugin-static-copy";

const pdfJsDistPath = path.dirname(
  fileURLToPath(import.meta.resolve("pdfjs-dist/package.json")),
);

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.join(pdfJsDistPath, "cmaps/*")),
          dest: "pdfjs/cmaps",
        },
        {
          src: normalizePath(path.join(pdfJsDistPath, "standard_fonts/*")),
          dest: "pdfjs/standard_fonts",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["pdfjs-dist"],
  },
});
