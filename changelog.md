# Changelog

All notable changes to this project will be documented in this file.

## [6.0.0] - Unreleased

### Added
- `buildPlugin` npm script: builds production bundle and copies output to the WordPress plugin directory
- `PLUGIN_PATH` env variable to configure the plugin output directory (see `.env.sample`)
- `window.cmGmapManager` global to expose the map manager instance for external integration
- Configurable `MapManager` options: `secondaryDivId`, `listId`, `listEnabled`
- `resetView()` method on `MapManager` to reset the map centre and zoom to the default Catalunya position
- Legend CSS component with colour variants per category (`militar`, `civil`, `religios`, `altres`)

### Fixed
- Null guard on `#search-llista` input before attaching event listeners
- Null guard on `infowindow` before calling `.close()`
- Llistat button initial icon now correctly reflects the `listEnabled` config value

### Changed
- Image paths simplified: removed the redundant `catalunya-gmap/gmap/` prefix from all asset URLs
- CSS cleaned up: removed commented-out rules and improved section organisation

### Removed
- Legacy image files under `web/images/catalunya-gmap/gmap/` (replaced by restructured paths)

> **BREAKING:** if you serve assets from a custom `SERVER_HOST`, update your image directory structure to match the new paths (e.g. `images/controls/`, `images/logo/`, `images/<type>/<category>/`).

---

## [5.0.0]

### Added
- Jest tests for the `MonumentBuilder` class
- `@googlemaps/markerclusterer` dependency (`^2.5.3`)
- GitHub Actions CI pipeline

### Changed
- Migrated build system to [webpack](https://webpack.js.org/)
- Replaced legacy Google Maps script tag with `@googlemaps/js-api-loader`
- Switched configuration to `dotenv` with separate `.env` (local) and `.env.production` files
- Improved `InfoBox` component
- Reformatted and cleaned up source code

### Fixed
- InfoWindow remaining open when the list panel is toggled

---

## [4.1.0]

### Added
- Find-user geolocation (enable/disable via config)

### Changed
- Updated screenshot

### Fixed
- Search input now removes accents before matching

---

## [4.0.0]

### Added
- New map background style
- Redesigned InfoWindow
- Catalunya logo overlay
- Zoom-to-centre control
- Text search / filter functionality

### Fixed
- Llistat button hidden correctly when map is in full-screen mode
- Empty building arrays no longer add a marker
- Double-click no longer incorrectly disables all icons

---

## [3.0.0]

### Added
- Remove/Add buttons per building type
- Unique InfoWindow (only one open at a time)
- Full-screen mode

### Changed
- Marker icon changes when the building type is hidden

---

## [2.0.0]

### Added
- Marker clustering

---

## [1.0.0]

### Added
- Initial interactive map using the catmap library
