# Interactive Map of Catalunya using GoogleMaps - Demo
Interactive vectorial map of Catalunya using GoogleMaps library.

<img src="https://github.com/eballo/catalunya-gmap/blob/develop/screenshot/screenshot-v2.png" alt="screen-shot" align="center" />

## Demo

- [Demo v1.0](http://demo.catalunyamedieval.es/gmap1)
- [Demo v2.0](http://demo.catalunyamedieval.es/gmap2)

# Marker cluster Info
http://code.google.com/p/google-maps-utility-library-v3/wiki/Libraries

# How to use this library

1. Add the following files to your html page

```
		<div id="mapContainer">
			<div id="gMap"></div>
		</div>
		<script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=false"></script>
		<script type="text/javascript" src="js/catalunya-list.js" ></script>
		<script type="text/javascript" src="js/catalunya-catmap.js" ></script>
		<script type="text/javascript" src="js/catalunya-options-gmap.js" ></script>
		<script type="text/javascript" src="js/catalunya-gmap.js" ></script>
```
2. Edit the content of catalunya-gmap.js to add, remove the markers that you want to print.

example:
```
	//load the configuration of the map
	var options = catmap.MAP_OPTIONS;

	//get the gMap element
	var element =  document.getElementById('gMap');

	//create the map
	var map = catmap.create(element, options);

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
