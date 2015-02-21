(function(window, catmap) {

	//load the configuration of the map
	var options = catmap.MAP_OPTIONS;

	//get the gMap element
	var element =  document.getElementById('gMap');

	//create the map
	var map = catmap.create(element, options);

	map._on('click', function(e){
		alert('click');
		console.log(e);
		console.log(this);
	});
	
}(window, window.Catmap ));