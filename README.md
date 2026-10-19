# Delineette Table Drawer

PDF table grid drawer.

IMPORTANT: this app is currently in development. The description in this section describes the functionalities that will be implemented after completing all tasks in the TODO section below.

Using this app, you can add missing table grids to your PDF documents interactively and locally. After that, table data extraction will work much more accurately using your favorite tool (e.g. pdfplumber, Camelot, Docling, AWS Textract, etc).

The app is purely a client-side app that you can run locally on your machine or deploy as a static frontend application.

The procedure to add a table grid is the following:

- Upload a PDF document
- Draw a bounding box around the table with missing grids
- Review the suggested grid and edit it if necessary
- Export a new PDF including the table grid

## Install locally

You need [Node.js](https://nodejs.org/) `^20.19.0` or `>=22.12.0`, and npm.

```bash
npm install
npm run dev
```

`npm install` also sets up the Git hooks. The dev server serves the app at [http://localhost:5173/](http://localhost:5173/). If that port is already in use, Vite picks the next free port and prints the URL in the terminal.

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

## TODO

V1 tasks:

- Add core table grid operations
- Add Text-assisted grid suggestion
- Add UI grid creation, editing, undo
- Add export entire project so that grid editing can be resumed
- Add export of PDF including new table grids
- Add page rotation and virtualization for long documents

V2 tasks (preliminary plan):

- Detection of similar tables (improves grid suggestion for multi-page tables)
- OCR for PDFs without text layer
