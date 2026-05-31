# CLAUDE.md — Catalunya GMap

## Release checklist

Each time a new release is prepared, perform **all** of the following steps in order:

### 1. Determine the new version number
- **Major** (`X.0.0`): breaking changes (renamed config keys, removed public API, changed data contract).
- **Minor** (`X.Y.0`): new backwards-compatible features.
- **Patch** (`X.Y.Z`): bug fixes only.

### 2. Update version in package files
- `package.json` → `"version"` field.
- `package-lock.json` → top-level `"version"` field **and** the inner `packages[""].version` field (two occurrences, use replace_all).

### 3. Update `changelog.md`
Add a new entry at the top (below the `# Changelog` heading) using this format:

```
## [X.Y.Z] - YYYY-MM-DD
### Added
- ...
### Changed
- ...
### Fixed
- ...
### Removed
- ...
```

Only include sections that have entries. Use today's date.

### 4. Update `demo.md`
Add a new entry at the bottom of the list following the existing pattern:
`- [Demo vX.Y.Z](http://demo.catalunyamedieval.es/gmapXYZ)`

The deploy script uses the same logic:
- `6.0.0` → `gmap6`   (minor=0, patch=0)
- `6.1.0` → `gmap61`  (patch=0)
- `6.1.1` → `gmap611` (patch≠0)

### 5. Update version string in `web/index.html`
The `<title>` and `<h1>` tags contain the version (e.g. `Demo v6.0`). Update them to match the new version.

### 6. Take a screenshot
- Start the dev server on port 9090 (port 9000 is used by PhpStorm): `npm run start -- --port 9090 &`
- Capture the live map using Playwright (inject `window.catalunyaGmapConfig = { markersJsonUrl: 'js/catalunya-markers.json', serverHost: 'http://localhost:9090/', apiKey: '...' }` as an init script so the map renders).
- Save the screenshot as `screenshot/screenshot-vX.Y.png` (e.g. `screenshot-v6.0.png`).
- **Stop the server** after the screenshot: `kill $(lsof -ti :9090)` — leaving it running blocks the port for future sessions.

### 7. Deploy
Actualitza `SFTP_REMOTE_PATH` a `.env.production` amb el nou path (e.g. `/home/user/www/gmap70`), fes el build i puja:
```bash
npm run buildProd
npm run deploy
```

---

## Development notes

- The webpack dev server default port (9000) conflicts with PhpStorm's Xdebug listener. Use port 9090 instead.
- `markersJsonUrl`, `serverHost` and `apiKey` must be provided by the host page via `window.catalunyaGmapConfig`; they default to `''`.
- `GOOGLE_MAPS_API_KEY` is required in `.env` for local development.
- `buildPlugin` compiles JS + minifies CSS and copies both to `catalunya-medieval-plugins` automatically.
- Playwright is available via `npx playwright`; the chromium binary is cached at `~/.npm/_npx/`.
