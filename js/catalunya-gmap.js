(function(window, catmap) {

	//load the configuration of the map
	var options = catmap.MAP_OPTIONS;

	//get the gMap element
	var element =  document.getElementById('gMap');

	//create the map
	var map = catmap.create(element, options);

	map.addMarker({
		id:1,
		lat: 42.307682, 
		lng: 3.011110,
		drabagle: false,
		visible: true,
		content: 'Castell 1',
		icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/militar/castell/castell7.png'
	});

	map.addMarker({
		id:2,
		lat: 42.000682, 
		lng: 3.071110,
		drabagle: false,
		visible: true,
		content: 'Castell 2',
		icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/militar/castell/castell7.png'
	});

	map.addMarker({
		id:3,
		lat: 42.020682, 
		lng: 3.000110,
		drabagle: false,
		visible: true,
		content: 'Torre 1',
		icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/militar/torre/torre7.png'
	});

	console.log(map.markers);
	
}(window, window.Catmap ));