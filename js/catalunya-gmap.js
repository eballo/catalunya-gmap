(function(window, gmap) {

	//create the map
	var map = gmap.create('gMap', gmap.MAP_OPTIONS);

	//console.log(aCastells);
	

	for(var x =0; x < aCastells.length; x ++){
		
		map.addMarker({
			id: 'esglesia'+x,
			lat: Number(aCastells[x].position.lat), 
			lng: Number(aCastells[x].position.lng),
			visible: true,
			content: aCastells[x].title,
			icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/militar/castell/castell7.png',
			categoria: 'castell'
		});
	}


	for(var x =0; x < aEsglesia.length; x ++){
		
		map.addMarker({
			id: 'esglesia'+x,
			lat: Number(aEsglesia[x].position.lat), 
			lng: Number(aEsglesia[x].position.lng),
			visible: true,
			content: aEsglesia[x].title,
			icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/religios/esglesia/esglesia7.png',
			categoria: 'esglesia'
		});
	}


		map.addIcon({
			id: 1,
			visible: true,
			title: 'castells',
			categoria: 'castell',
			icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/militar/castell/castell7.png'
		});

		map.addIcon({
			id: 2,
			visible: true,
			title: 'esglesia',
			categoria: 'esglesia',
			icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/religios/esglesia/esglesia7.png'
		});

	console.log(map.markers);

	/*
	map.removeBy(function(marker){
		if(marker.id === 0){
			console.log(marker);
		}
		return marker.id ===0;
	});
	*/
	
}(window, window.Gmap ));