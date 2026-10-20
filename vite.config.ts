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
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Test helpers and the suite itself are not product code.
        "src/**/*.test.ts",
        "src/pdf/test/**",
        // Browser UI is covered later by Playwright, not by this Node unit suite.
        "src/ui/**",
        "src/main.tsx",
      ],
    },
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
