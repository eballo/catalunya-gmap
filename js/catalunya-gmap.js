(function(window, google) {

	//Position of Catalunya 
	var latitud = 41.440908754848165;
	var longitude = 1.81713925781257;
    var catalunya = new google.maps.LatLng(latitud, longitude);

	//maps options
	var options = {
		center: catalunya,
		zoom: 8,
		streetViewControl: false,
	      mapTypeControl: true,
	      mapTypeControlOptions: {
	        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
	        position: google.maps.ControlPosition.TOP_LEFT
	      },
	      zoomControl: true,
	      zoomControlOptions: {
	        style: google.maps.ZoomControlStyle.NORMAL
	      },
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var element =  document.getElementById('gMap');

	//create the map
	var map = new google.maps.Map(element, options);
	
}(window, google));