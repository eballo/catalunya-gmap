export const STYLES = [{
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

export const CATALUNYA_POSITION = {
    lat: 41.44090875484817,
    lng: 1.81713925781257,
}

// Dark counterpart of STYLES, applied while the host page has
// data-theme="dark" on <html> (the WordPress theme's own toggle). Same idea as
// catalunya-omap dimming its tiles: a calm, desaturated dark ground, not an
// inverted map, so the coloured marker icons keep standing out.
export const STYLES_DARK = [{
    "elementType": "geometry",
    "stylers": [{"color": "#231c17"}]
}, {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#b8ab99"}]
}, {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#1b1613"}]
}, {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#4a3d33"}]
}, {
    "featureType": "administrative.province",
    "stylers": [{"visibility": "off"}]
}, {
    "featureType": "landscape",
    "stylers": [{"color": "#231c17"}]
}, {
    "featureType": "poi",
    "stylers": [{"visibility": "simplified"}, {"color": "#2a221c"}]
}, {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{"visibility": "off"}]
}, {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#3a3028"}]
}, {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#4a3d33"}]
}, {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
}, {
    "featureType": "transit",
    "stylers": [{"visibility": "simplified"}, {"color": "#2f2720"}]
}, {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#141b22"}]
}, {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#7d8a96"}]
}];
