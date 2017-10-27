# Interactive Map of Catalunya using GoogleMaps - Demo
Interactive vectorial map of Catalunya using GoogleMaps library.

<img src="https://github.com/eballo/catalunya-gmap/blob/develop/screenshot/screenshot-v4.png" alt="screen-shot" align="center" />

## Demo

- [Demo v1.0](http://demo.catalunyamedieval.es/gmap1)
- [Demo v2.0](http://demo.catalunyamedieval.es/gmap2)
- [Demo v3.0](http://demo.catalunyamedieval.es/gmap3)
- [Demo v4.0](http://demo.catalunyamedieval.es/gmap4)

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

V1.0
- Create a Map using catmap libs

V2.0
- Markers clustering

V3.0
- Add Remove/Add button by type of building + unique infoWindow
- Change icon when removed
- Full screen option

V4.0
- New Style of the map (background)
- New infoWindow - new design
- Add Logo
- Zoom Center
- Add Search functionality
- Remove llistat button when full screen
- Don't add a building if the array is empty
- BUG: problem disable all icons double click

V4.1
- Update screen-shot
- FindUser (enable/disable)
