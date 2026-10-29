# Fieldpress — Blogspot Post Manager

A focused control room for managing a **Blogger (Blogspot)** publication. Connect with a Google API key and manage every post — drafts, scheduled, published, and trashed — from one calm surface.

Built with **React 19**, **Vite 7**, **Tailwind CSS 4**, and **TypeScript**, packaged as a single-file build via `vite-plugin-singlefile`.

## Features

- **Connect** to any Blogspot blog using a Blogger API v3 key (and an optional OAuth access token for write access).
- **Dashboard** overview of your publication.
- **Posts view** with search, status filter (All / Live / Draft / Scheduled), and label filter.
- **Editor** for creating and editing posts (title, content, labels), saving as draft or publishing.
- **Post detail** view with comments listing.
- **Publish / revert / delete** posts with confirmations.
- **Demo mode** — explore a seeded workspace offline with full editing, no credentials required.
- **Read-only mode** via API key; full write access (create, edit, publish, delete) with an OAuth token.
- **Persisted settings** in `localStorage` with auto-reconnect on load.

## Getting started

### Prerequisites

- Node.js 20+ (tested with 22)
- A Google Cloud project with the **Blogger API v3** enabled, plus an API key
- (Optional) An OAuth access token with the `https://www.googleapis.com/auth/blogger` scope for write operations

### Install & run

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

### Build

```bash
npm run build
npm run preview
```

The build produces a single self-contained HTML file in `dist/`.

## Configuration

On the connect screen, provide:

- **Blog URL or Blog ID** — e.g. `myblog.blogspot.com` or a numeric blog ID
- **Google API key** — Blogger API v3 enabled
- **Access token** (optional, advanced) — unlocks create/edit/publish/delete

Settings are stored locally in your browser (`fieldpress.settings.v1`).

## Project structure

```
src/
  App.tsx                 # root shell, view routing
  store.ts                # zustand store + actions
  types.ts                # domain types
  components/             # UI components (Sidebar, Topbar, Dashboard, PostsView, Editor, ...)
  lib/api.ts              # Blogger API v3 client
  lib/demo.ts             # seeded demo data
  lib/utils.ts            # helpers
```

## License

MIT — see [LICENSE](LICENSE).
```

That's fine. Now git operations.

Let me init git, set remote, fetch, checkout main. I need to be careful with path containing spaces/parens. Use Set-Location then git commands separated by ;? Actually each shell call is separate process? The working directory persists? The tool runs in a fresh shell each call probably. The env says working directory is project. But to be safe, use `git -C "path"` or Set-Location within command. I'll use git -C with quoted path. But path has parentheses; in PowerShell, git -C "path" should be okay.

Let me do init.<|end|><|start|>Assistant to=shell<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
git -C "C:\Users\papa_bear\Desktop\react-blogspot-post-manager (1)" init -b main 2>&1