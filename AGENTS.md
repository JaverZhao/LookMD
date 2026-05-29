# LookMD — Agent Guide

## Quick start

```powershell
pnpm install
pnpm tauri dev     # dev mode (Vite + hot-reload + Tauri window)
pnpm build         # frontend only (tsc -b && vite build)
pnpm tauri build   # production bundle (MSI + NSIS)
```

## Environment gotchas

- **cargo must be in PATH** — Rust tools install to `%USERPROFILE%\.cargo\bin`. `pnpm tauri dev/build` spawns cargo internally; if missing, add to User PATH and restart terminal.
- pnpm is the only package manager. Do not use npm or yarn.

## Architecture

| Layer | Tech | Entry |
|-------|------|-------|
| Desktop shell | Tauri 2 | `src-tauri/src/lib.rs` |
| Frontend | React 19 + TypeScript + Vite 8 | `src/main.tsx` → `src/app/App.tsx` |
| Styling | TailwindCSS **v4** (`@import "tailwindcss"` in CSS, no `tailwind.config.ts`) | `src/styles/globals.css` |
| Markdown | markdown-it + markdown-it-anchor | `src/lib/markdown.ts` |
| Code highlight | Shiki v4 (async, lazy-initialized) | `src/lib/highlight.ts` |
| Sanitization | DOMPurify (runs before every render) | `src/lib/sanitize.ts` |
| File I/O | Tauri dialog + fs plugins | `src/lib/file.ts` |

## Key wiring

- **`src/styles/globals.css`**: defines CSS custom properties for theme (`--color-bg-primary`, `--color-text-primary`, etc.). Tailwind classes reference these variables directly (not Tailwind's `dark:` variants). The root `dark` class toggles the variable values.
- **Markdown CSS**: all in `src/styles/markdown.css` under `.md-content` scope.
- **`slugify`** for heading IDs lives in `src/lib/markdown.ts` and is shared with `markdown-it-anchor` and `useToc` — both must use the identical function.
- **`useTheme`** reads/writes `localStorage` key `md-reader-theme`. Mode is `'light' | 'dark' | 'system'`.
- **`useRecentFiles`** reads/writes `localStorage` key `md-reader-recent-files`. Max 20 entries.
- **Drag-and-drop**: uses Tauri native `getCurrentWindow().onDragDropEvent()`, **NOT** HTML5 drag-drop API (file paths are not available via `dataTransfer`).

## Important constraints

- MVP is **read-only**. No markdown editing, no cloud sync, no accounts.
- All file reads are user-triggered (dialog pick or drag-drop). No auto-scanning.
- Permissions are minimized: only `dialog:open` and `fs:read-text-file`.
- Tauri capabilities config: `src-tauri/capabilities/default.json`.

## Build output

```
src-tauri/target/release/bundle/
├─ msi/LookMD_x.x.x_x64_en-US.msi
└─ nsis/LookMD_x.x.x_x64-setup.exe
```

## Commands to remember

| Command | What it does |
|---------|-------------|
| `pnpm build` | TypeScript check + Vite build (frontend only) |
| `pnpm tauri build` | Full production build (frontend + Rust) |
| `pnpm tauri dev` | Dev server + Tauri window |

## Missing from repo

- No tests exist yet
- No CI/CD configured
- No lint script beyond `eslint .`
