/**
 * Catalunya options for GoogleMaps
 *
 */
MarkerClusterer.IMAGE_PATH = 'http://www..catalunyamedieval.es/images/gmap/m';
(function(window, google, gmap) {

//Position of Catalunya
var latitud = 41.440908754848165;
var longitude = 1.81713925781257;
var catalunya = new google.maps.LatLng(latitud, longitude);

//maps options
gmap.MAP_OPTIONS = {
	center: catalunya,
	zoom: 7,
	maxZoom: 20,
	minZoom: 4,
	streetViewControl: false,
	disableDefaultUI: false,
	scrollwheel: true,
	draggable: true,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.TOP_LEFT
    },
    panControl: true,
    panControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
    },
    zoomControl: true,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.NORMAL,
        position: google.maps.ControlPosition.TOP_LEFT
    },
    scaleControl: true,  // fixed to BOTTOM_RIGHT
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    cluster: true
};

gmap.EDIFICI_OPTIONS = {
	serverHost: 'http://www.catalunyamedieval.es/',
	styleType: 7
}

}(window, google, window.Gmap || (window.Gmap = {}) ));
