# Delineette

PDF table grid drawer.

## Install locally

You need [Node.js](https://nodejs.org/) `^20.19.0` or `>=22.12.0`, and npm.

```bash
npm install
npm run dev
```

`npm install` also sets up the Git hooks. The dev server prints a local URL; open it in a browser.

## Build

Production output goes to `dist/`:

```bash
npm run build
npm run preview   # optional: serve dist/ locally
```

`npm run build` runs TypeScript project references, then Vite. PDF.js cmaps and standard fonts are copied into `dist/pdfjs/` as part of the build.

### Deploying under a subpath

By default the app assumes it is served from the site root (`base: '/'`). If the app will live under a subpath (for example `https://example.org/my-app/`), set Vite’s `base` to that path **with a trailing slash** when you build:

```bash
npm run build -- --base=/my-app/
```

Or set `base: '/my-app/'` in `vite.config.ts`. Asset URLs (including PDF.js font/cmap fetches) use `import.meta.env.BASE_URL`, so they stay aligned with where the app is hosted.
