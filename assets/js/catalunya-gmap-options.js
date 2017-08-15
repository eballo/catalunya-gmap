/**
 * Catalunya options for GoogleMaps
 *
 */
MarkerClusterer.IMAGE_PATH = 'http://gmap.catalunyamedieval.dev/assets/images/gmap/m';
(function(window, google, gmap) {

    gmap.CONFIG_OPTIONS = {
        serverHost: 'http://gmap.catalunyamedieval.dev/',
        styleType: 7,
        debug: true
    }

    //Position of Catalunya
    var latitud = 41.440908754848165;
    var longitude = 1.81713925781257;
    var catalunya = new google.maps.LatLng(latitud, longitude);
    var styles = [{
        "featureType": "landscape",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 65
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "poi",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 51
        }, {
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road.highway",
        "stylers": [{
            "saturation": -100
        }, {
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road.arterial",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 30
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "road.local",
        "stylers": [{
            "saturation": -100
        }, {
            "lightness": 40
        }, {
            "visibility": "on"
        }]
    }, {
        "featureType": "transit",
        "stylers": [{
            "saturation": -100
        }, {
            "visibility": "simplified"
        }]
    }, {
        "featureType": "administrative.province",
        "stylers": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [{
            "visibility": "on"
        }, {
            "lightness": -25
        }, {
            "saturation": -100
        }]
    }, {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
            "hue": "#ffff00"
        }, {
            "lightness": -25
        }, {
            "saturation": -97
        }]
    }];

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
        scaleControl: true, // fixed to BOTTOM_RIGHT
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        cluster: true,
        styles: styles
    };

}(window, google, window.Gmap || (window.Gmap = {})));
