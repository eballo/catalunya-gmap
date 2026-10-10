# CLAUDE.md — Catalunya GMap

## Release process

Version bumping is **automated by CI/CD**: on every push to `main` (i.e. after a PR merges), the `release` job in `.github/workflows/build.yml` runs once the `sonarcloud` and `build` jobs pass, and:

- Collects every PR merged since the last `v*` tag (direct pushes with `[skip ci]` are left out). If there are none — an earlier run already released them — it stops there.
- Determines the bump level from the source branch names of those PRs, highest wins (`fix/*` → patch, `major/*` → major, anything else, `dependabot/*` included → minor).
- Bumps `package.json` and `package-lock.json` via `npm version <level> --no-git-tag-version`.
- Adds a new entry to the top of `changelog.md` listing those PRs' titles (`Title (#N)`).
- Appends a new line to `demo.md` and updates the version string in `web/index.html`'s `<title>`/`<h1>`, both computed purely from the new version number:
  - slug: `6.0.0` → `gmap6` (minor=0, patch=0), `6.1.0` → `gmap61` (patch=0), `6.1.1` → `gmap611` (patch≠0)
  - label: `vX.Y` if patch=0, else `vX.Y.Z`
- Commits the changes, creates an annotated tag `vX.Y.Z`, pushes to `main`, and publishes a GitHub Release with those notes.

Release runs are serialised (`concurrency: release-main`, shared with the manual `release.yml`, no cancel-in-progress), so merging several PRs in a row is safe: they queue instead of racing to push `main`. GitHub keeps only one pending run per group and may cancel an intermediate one; nothing is lost, because the next run picks up every PR since the last tag. If `main` moves while a run is releasing, it rebases over `[skip ci]` commits and stands down for anything else (that PR's queued run releases both). Rules: `catalunya-medieval-skills/docs/releases.md`.

Do **not** bump the version, edit `changelog.md`/`demo.md`/`web/index.html`, or create tags/releases by hand — the CI job does this automatically after merge. If the auto-generated changelog entry needs more detail than the PR title provides, edit it in a follow-up commit after the release job runs.

Once the CI release job has run (new version tagged and released), finish the release manually:

### 1. Take a screenshot
- Start the dev server on port 9090 (port 9000 is used by PhpStorm): `npm run start -- --port 9090 &`
- Capture the live map using Playwright (inject `window.catalunyaGmapConfig = { markersJsonUrl: 'js/catalunya-markers.json', serverHost: 'http://localhost:9090/', apiKey: '...' }` as an init script so the map renders).
- Save the screenshot as `screenshot/screenshot-vX.Y.png` (e.g. `screenshot-v6.0.png`).
- **Stop the server** after the screenshot: `kill $(lsof -ti :9090)` — leaving it running blocks the port for future sessions.

### 2. Deploy
Actualitza `SFTP_REMOTE_PATH` a `.env.production` amb el nou path (e.g. `/home/user/www/gmap70`), fes el build i puja:
```bash
npm run buildProd
npm run deploy
```

---

## Development notes

- The webpack dev server default port (9000) conflicts with PhpStorm's Xdebug listener. Use port 9090 instead.
- **Kept in sync with `catalunya-omap`** (decided 10/10/2026, even though the theme's Epic 27 plans to drop Google Maps): same config options, same data, same public `MapManager` API (`window.cmGmapManager`), same popup card markup (`catmed-maps-marker-*`). A feature that lands in omap is ported here; only the provider-specific parts differ (InfoWindow with its own close button, `google.maps.Data` for the comarca boundaries, `Circle`, map styles `STYLES`/`STYLES_DARK` for the dark palette). The full option table is in the README.
- `markersJsonUrl`, `serverHost` and `apiKey` must be provided by the host page via `window.catalunyaGmapConfig`; `serverHost` and `apiKey` fall back to `.env`. The demo page sets `markersJsonUrl` and `comarquesJsonUrl` itself (`web/js/*.json`, copies of omap's).
- `mapDataNonce` (optional, same config object) is sent as an `X-CM-Nonce` request header on the markers and comarques JSON fetches, so the host can keep its nonce out of the URL.
- The API key in `.env` is restricted by HTTP referrer, so on `localhost` Google answers `RefererNotAllowedMapError` and draws no map. To check the page anyway, let Playwright drop the `key` parameter from the `maps.googleapis.com/maps/api/js` request (`page.route`): Google then serves the map in development mode, watermarked and without the custom styles.
- `GOOGLE_MAPS_API_KEY` is required in `.env` for local development.
- `buildPlugin` compiles JS + minifies CSS and copies both to `catalunya-medieval-plugins` automatically.
- Playwright is available via `npx playwright`; the chromium binary is cached at `~/.npm/_npx/`.
