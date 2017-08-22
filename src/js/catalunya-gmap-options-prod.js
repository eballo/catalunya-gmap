/**
 * Catalunya options for GoogleMaps
 *
 */
MarkerClusterer.IMAGE_PATH = 'https://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/images/catalunya-gmap/gmap/m';
(function(window, google, gmap) {

    gmap.CONFIG_OPTIONS = {
        serverHost: 'https://www.catalunyamedieval.es/wp-content/themes/catalunyamedieval/',
        styleType1: 7,
        styleType2: 8,
        debug: false,
        useMarkerCluster: true
    }

    //Position of Catalunya
    var latitud = 41.440908754848165;
    var longitude = 1.81713925781257;
    var catalunya = new google.maps.LatLng(latitud, longitude);

    //maps options
    gmap.MAP_OPTIONS = {
        center: catalunya,
        zoom: 8,
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
            position: google.maps.ControlPosition.LEFT_TOP
        },
        scaleControl: true, // fixed to BOTTOM_RIGHT
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        cluster: true,
        styles: styles
    };

}(window, google, window.Gmap || (window.Gmap = {})));
