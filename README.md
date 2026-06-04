# Johannes Dommnich — Portfolio

A static portfolio site. No framework, no build step. Just HTML, CSS, and one JS file,
served by a tiny zero-dependency Node server for deployment.

## Files

- `index.html` — the shell (loads fonts, styles, data, app).
- `styles.css` — all styling.
- `data.js` — **edit this to change content.** Projects, experience, education, profile.
- `app.js` — renders the page from `data.js`. You rarely need to touch this.
- `images/` — project screenshots and the profile photo.
- `server.js` — minimal static file server bound to `$PORT` (used in production).

## Run locally

```bash
npm start          # serves on http://localhost:3000
# or, without Node:
python3 -m http.server 4321   # serves on http://localhost:4321
```

## Deploy (Railway)

This repo deploys to Railway as-is via Nixpacks:

- Build: Nixpacks detects Node from `package.json`.
- Start: `node server.js` (set in `railway.json`), which binds to Railway's `$PORT`.

Connect the repo to a Railway project once; every push to `main` then auto-deploys.

## Editing content

Everything lives in `data.js`:

- **Add a project** — copy an existing object in `PROJECTS`, drop the screenshot into `images/`,
  point `image` at it, set `useCase` (a `USE_CASES` key) and `buildTool` (a `TECH` key with
  `build: true`). `status` is `"Live"` or `"Private"`. `links.live` / `links.github` render the
  buttons. `featured: true` floats a project to the top of its group.
- **Card copy** — `tagline` is the punchy line, `short` is the modal lead, `long` is the full
  write-up shown on the card and in the modal. `role` and `outcome` are optional modal fields.
- **Taxonomy** — `USE_CASES` drives the "Use case" grouping and order; `TECH` + `BUILD_TOOLS`
  drive the "Technology" grouping. Each carries a colour used for dots and section headers.
