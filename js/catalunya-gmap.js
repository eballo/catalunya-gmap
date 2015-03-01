(function(window, catmap) {

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
		event: { 
			name: 'click',
			callback: function(){
				alert('Im clicked');
			}
		}
	});

/*
	map._on('click', function(e){
		alert('click');
		console.log(e);
		console.log(this);
	});
*/
	
}(window, window.Catmap ));