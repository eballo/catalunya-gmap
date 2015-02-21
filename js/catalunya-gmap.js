(function(window, google, mapster) {

	//load the configuration of the map
	var options = mapster.MAP_OPTIONS;

	//get the gMap element
	var element =  document.getElementById('gMap');

	//create the map
	var map = new google.maps.Map(element, options);
	
}(window, google, window.Mapster || (window.Mapster = {}) ));