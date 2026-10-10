![example workflow](https://github.com/eballo/catalunya-gmap/actions/workflows/build.yml/badge.svg) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=eballo_catalunya-gmap&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=eballo_catalunya-gmap)

# Interactive Map of Catalunya using GoogleMaps
Interactive map of Catalunya using GoogleMaps library.

<img src="https://github.com/eballo/catalunya-gmap/blob/main/screenshot/screenshot-v5.png" alt="screen-shot" align="center" />

## Demo

[Demo](./demo.md)

# Marker cluster Info
http://code.google.com/p/google-maps-utility-library-v3/wiki/Libraries

# Inspiration links
https://www.w3schools.com/howto/howto_js_filter_lists.asp
https://elfsight.com/google-maps-widget/#demo

# How to use this library

The library has the same options, data and public API as
[catalunya-omap](https://github.com/eballo/catalunya-omap) — only the map provider changes. A page
can switch between the two by swapping the bundle, the stylesheet and the config object's name.

1. Add the stylesheet inside the head tag

``` html
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Droid+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <link href="css/catalunya-gmap.css" rel="stylesheet" type="text/css">
```

2. The map, the sidebar list and the scripts in the body

``` html
    <div id="container">
        <div id="gMap"></div>
        <div id="secondaryDiv" style="display:none;">
            <input type="search" id="search-list" placeholder="Cercar monument…">
            <div id="list">
                <ul id="map-list"></ul>
            </div>
        </div>
    </div>

    <script src="js/jquery-3.2.1.min.js"></script>
    <script src="js/catalunya-gmap.min.js"></script>
```

3. Configure it with `window.catalunyaGmapConfig`, set before the bundle loads

| Option | What it does |
|--------|--------------|
| `apiKey` | Google Maps API key (falls back to `GOOGLE_MAPS_API_KEY` at build time) |
| `serverHost` | Base URL of the `images/` folder, ending in `/` |
| `markersJsonUrl` | URL of the buildings JSON (`catalunya-markers.json` format). An inline `<script type="application/json" id="cm-edificis-data">` wins over it |
| `mapDataNonce` | Sent as an `X-CM-Nonce` header on the JSON requests |
| `comarca`, `municipi` | Only show the buildings of that comarca / municipi (matched by name, accents ignored) |
| `comarquesJsonUrl` | GeoJSON of the comarca boundaries: every outline faintly, or only the active comarca's |
| `comarcaSlug` | The active comarca for the boundaries; derived from the loaded buildings when absent |
| `edificiId` | Select that building: pinned out of its cluster, centred, card open, no «Veure contingut» link |
| `userPosition` | Show the «Ruta» button (Google Maps directions to the building) on the cards |
| `popupActions` | See [Popup actions](#popup-actions) |
| `listId`, `secondaryDivId` | Ids of the sidebar list and its container (`map-list`, `secondaryDiv`) |
| `listEnabled` | Start with the sidebar list open |
| `useMarkerCluster` | Leave markers off the map until the clusterer takes them |

The map follows the host page's theme: `data-theme="dark"` on `<html>` switches the stylesheet's
palette and the map's own styles.

Once loaded, the map manager is `window.cmGmapManager`: `getMarkers()`, `getMarkerById(id)`,
`fitToMarkers()`, `fitToVisibleMarkers()`, `selectMarker(marker)`, `resize()`, `resetView()`,
`loadComarcaBoundaries(url, slug, nonce)`, `setUserLocationMarker(lat, lng, { accuracy })`,
`setSearchRadiusCircle(lat, lng, metres)`, `clearMarkers()`, `addMarker(location)` and
`addAllMarkersToCluster()`.

### Popup actions

The host page can add its own controls to every marker card with `popupActions`: a function that
receives the building (`id`, `title`, `link`, `lat`, `lng`, …) and returns HTML, appended at the end
of the card inside `<div class='catmed-maps-marker-actions'>`. The HTML is inserted as it is, so it
must be built by the host, not from user input. A hook that throws or returns anything but a string
is ignored.

``` javascript
    window.catalunyaGmapConfig = {
        // ...
        popupActions: function (edifici) {
            return '<button type="button" data-id="' + Number(edifici.id) + '">Afegeix</button>';
        },
    };
```

## Versions

[Change log](./changelog.md)

## Development

Since version 5.0 uses [webpack](https://webpack.js.org/).

### Installation

#### Configuration

add a .env file and setup your google api key and the other required env variables. Check the `.env.sample` for 
more information, and create the following files: 
.env (local)
.env.production (production)

```
GOOGLE_MAPS_API_KEY=xxxxxxx
SERVER_HOST='http://localhost:9090/'
DEBUG=true
USER_POSITION=false
PLUGIN_PATH=/path/to/your/plugin   # only needed for buildPlugin
```

NOTE: it is important that the server host ends with a '/' like in the sample.

Building the theme requires [node.js](http://nodejs.org/download/). We recommend you update to the latest version of npm: `npm install -g npm@latest`.

From the command line:

1. Navigate to the theme directory, then run `npm install`
3. Build `npm run buildLocal`
4. Start `npm run start`
5. (optional) buildWatch `npm run buildWatch` 

Open your browser [localhost:9090](http://localhost:9090/) (`npm run start -- --port 9090`: port 9000 is PhpStorm's Xdebug listener)

### Available node commands

* `test`        — run all the tests
* `testWatch`   — run all the tests while watching the changes of the files
* `buildLocal`  — compile (local) and optimize the files in your web directory
* `buildProd`   — compile (production) and optimize the files in your web directory
* `buildPlugin` — compile (production) and copy the output directly to the WordPress plugin directory (requires `PLUGIN_PATH`)
* `buildWatch`  — compile (local) and watch for changes to update the files
* `start`       — start the webpack dev server (use `-- --port 9090`)

