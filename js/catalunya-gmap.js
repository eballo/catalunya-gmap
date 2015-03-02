(function(window, catmap) {

	//load the configuration of the map
	var options = catmap.MAP_OPTIONS;

	//get the gMap element
	var element =  document.getElementById('gMap');

	//create the map
	var map = catmap.create(element, options);

	//console.log(aCastells);
	
	for(var x =0; x < aCastells.length; x ++){
		
		map.addMarker({
			id: x,
			lat: Number(aCastells[x].position.lat), 
			lng: Number(aCastells[x].position.lng),
			visible: true,
			content: aCastells[x].title,
			icon: 'http://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/militar/castell/castell7.png'
		});
	}

	//console.log(map.markers);

	/*
	map.removeBy(function(marker){
		if(marker.id === 0){
			console.log(marker);
		}
		return marker.id ===0;
	});
	*/
	
}(window, window.Catmap ));