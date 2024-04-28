# Interactive Map of Catalunya using GoogleMaps - Demo
Interactive map of Catalunya using GoogleMaps library.

<img src="https://github.com/eballo/catalunya-gmap/blob/main/screenshot/screenshot-v5.png" alt="screen-shot" align="center" />

## Demo

[Demo](./demo.md)

# Marker cluster Info
http://code.google.com/p/google-maps-utility-library-v3/wiki/Libraries

# Inspiration links
https://www.w3schools.com/howto/howto_js_filter_lists.asp

# How to use this library

1. Add the following files to your html page

```
			<div id="container">

				<div id="primaryDiv" class="primaryDiv_big">
					<div id="mapContainer">
						<div id="gMap"></div>
					</div>
				</div>

				<div id="secondaryDiv">
					<div id="error">
						<h2>No hi ha cap edificaci&oacute; disponible per aquesta comcarca</h2></div>
					<input type="text" id="search-llista" onkeyup="searchLlista()" placeholder="cercar..">
					<div id="llista">
						<ul id="mapLlist"></ul>
					</div>
				</div>
        ...
        <footer>
            <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=YOUR_API_KEY"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/jquery-3.2.1.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/bootstrap.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-path.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/markerclusterer.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-list.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-icons.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-catgmap.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-extra.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-options.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-edifici.min.js"></script>
            <script type="text/javascript" src="assets/js/catalunya-gmap/catalunya-gmap-init.min.js"></script>
        </footer>
```
2. Edit the content of catalunya-gmap-init.js to add, remove the markers that you want to print.

example:
```
	//create the map
	map = gmap.create('gMap', gmap.MAP_OPTIONS, gmap.CONFIG_OPTIONS);

	map.addMarker({
		lat: 42.307682,
		lng: 3.011110,
		drabagle: false,
		visible: true,
		id:1,
		content: 'Castell de la Montanya'
	});
```

## Versions

[Change log](./changelog.md)

## Development

Since version 5.0 uses [webpack](https://webpack.js.org/).

### Installation

#### Configuration

add a .env file and setup your google api key
.env (local)
.env.production (production)

```
GOOGLE_MAPS_API_KEY=xxxxxxx
SERVER_HOST='http://localhost:9000/'
DEBUG=true
USE_MARKER_CLUSTER=true
```

Building the theme requires [node.js](http://nodejs.org/download/). We recommend you update to the latest version of npm: `npm install -g npm@latest`.

From the command line:

1. Navigate to the theme directory, then run `npm install`
3. Build `npm run buildLocal`
4. Start `npm run start`
5. (optional) buildWatch `npm run buildWatch` 

Open your browser [localhost:9000](http://localhost:9000/)

### Available node commands

* `buildLocal` — Compile (local) and optimize the files in your web directory
* `buildProd`  — Compile (production) and optimize the files in your web directory
* `buildWatch` — Compile (local) and optimize the files in your web directory and watch for changes to update the files
* `start`      — Starts  a web server

