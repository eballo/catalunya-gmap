/**
 * Catalunya options for GoogleMaps
 *
 */
MarkerClusterer.IMAGE_PATH = 'https://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/gmap/m';
(function(window, google, gmap) {

gmap.EDIFICI_OPTIONS = {
	serverHost: 'https://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/',
	styleType: 7
}

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

}(window, google, window.Gmap || (window.Gmap = {}) ));
