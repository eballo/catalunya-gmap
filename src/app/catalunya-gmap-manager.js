import {Loader} from "@googlemaps/js-api-loader";
import {STYLES} from "./config/catalunya-gmap-options-gmap";

export default class MapManager {
    constructor(mapId) {

        this.debug = true;
        this.debug = true;
        this.fullScreen = false;
        this.visibleBuildings = true;
        this.useMarkerCluster = true;

        this.infowindow = null;

        this.loader =  new Loader({
            apiKey: process.env.GOOGLE_MAPS_API_KEY,
            version: "weekly",
            libraries: ["core", "maps", "marker"]
        });

        this.google = null;
        this.marker = null;
        this.core = null;

        this.arrayCategoriesText = [];
        this.icons = [];         // List of icons

        this.mapId = mapId;     // The mapId
        this.map = null;        // The created map
        this.markers = [];      // All the markers
        this.clusterer = null;

        this.serverHost = "http://localhost:9000"; //TODO: make it configurable!

    }

    /**
     * Initialise the map with all the buildings and Icons
     * @returns {Promise<Map>}
     */
    async initMap() {
        try {

            const [google, marker, core] = await Promise.all([
                this.loader.importLibrary("maps"),
                this.loader.importLibrary("marker"),
                this.loader.importLibrary("core"),
            ]);

            this.google = google
            this.marker = marker
            this.core = core

            const element = document.getElementById(this.mapId)
            this.map = new this.google.Map(element, {
                center: { lat: 41.440908754848165, lng: 1.81713925781257 },
                zoom: 8,
                maxZoom: 20,
                minZoom: 4,
                disableDefaultUI: false,
                scrollwheel: true,
                draggable: true,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: this.google.MapTypeControlStyle.DROPDOWN_MENU,
                    position: this.core.ControlPosition.TOP_LEFT
                },
                panControl: true,
                panControlOptions: {
                    position: this.core.ControlPosition.TOP_RIGHT
                },
                zoomControl: true,
                zoomControlOptions: {
                    position: this.core.ControlPosition.LEFT_TOP
                },
                scaleControl: true, // fixed to BOTTOM_RIGHT
                streetViewControl: true,
                streetViewControlOptions: {
                    position: this.core.ControlPosition.LEFT_TOP
                },
                fullscreenControl: true,
                fullscreenControlOptions: {
                    position: this.core.ControlPosition.TOP_LEFT
                },
                mapTypeId: this.google.MapTypeId.ROADMAP,
                cluster: true,
                styles: STYLES
            });

            // Initialize map
            this._setLogoCatalunyaMedieval();
            this._setIconFullScreen();
            this._setRemoveAllIcons();

            return this.map;
        } catch (error) {
            console.error("Error loading the Google Maps script", error);
        }
    }

    addMarker(location) {
        // Create the marker
        const marker = this.createMarker(location);

        // add marker to the markers array
        this.markers.push(marker);

        // Add marker to the marker cluster
        this.addMarkerToCluster(marker);

        // if we have the content object set up
        this.addContentToMarker(location, marker);

        // Create right buttons on the map
        this._createMarkerButton(marker, location)
    }

    addContentToMarker(location, marker) {
        if (location.content) {

            if(this.infowindow === null) {
                this.infowindow = new this.google.InfoWindow({
                    content: location.content,
                    position: marker.getPosition()
                });
            }

            const self = this
            marker.addListener('click', function() {
                self.infowindow.setContent(location.content);
                self.infowindow.setPosition(marker.getPosition())
                self.infowindow.open({
                    anchor: marker,
                    shouldFocus:false
                });
            });

            /*
             * The google.maps.event.addListener() event waits for
             * the creation of the infowindow HTML structure 'domready'
             * and before the opening of the infowindow we defined the new event close for the custom style
             */
            google.maps.event.addListener(this.infowindow, 'domready', function() {
                let closeBtn = $('.catmed-google-maps-marker-close');
                google.maps.event.addDomListener(closeBtn[0], 'click', function() {
                    self.infowindow.close();
                });

            });
        }
    }

    addMarkerToCluster(marker) {
        if (this.useMarkerCluster) {
            if (this.clusterer == null) {
                this.clusterer = new MarkerClusterer(this.map, [], {
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                    minimumClusterSize: 15
                });
            }
            this.clusterer.addMarker(marker);
        }
    }

    createMarker(location) {
        return new this.marker.Marker({
            position: {
                lat: location.lat,
                lng: location.lng
            },
            map: this.map,
            title: location.title,
            icon: location.icon,
            visible: location.visible,
            category: location.category, // (building type Slug-Name)
        });
    }

    _exist(item) {
        let toReturn = false;
        const indexOf = this.arrayCategoriesText.indexOf(item);
        if (indexOf !== -1) {
            toReturn = true;
        }
        return toReturn;
    }

    /**
     *  create Marker Button link text
     */
    _createMarkerButton(marker, opts) {

        //Creates a sidebar text link
        const ul = document.getElementById("mapLlist");

        //Add Title Category if needed
        if (!this._exist(opts.category)) {
            //Add to the array
            this.arrayCategoriesText.push(opts.category);
            //Create the li header
            const liCategory = document.createElement("li");
            liCategory.innerHTML = opts.categoryName;
            liCategory.setAttribute("class", opts.category + " header");
            ul.appendChild(liCategory);
        }
        //Add a normal building
        const li = document.createElement("li");
        li.innerHTML = opts.title;
        li.setAttribute("class", opts.category);
        ul.appendChild(li);

        const self = this;
        //Trigger a click event to marker when the button is clicked.
        google.maps.event.addDomListener(li, "click", function() {
            self.map.setZoom(15);
            self.map.setCenter(marker.getPosition());
            self.map.setTilt(1);
            google.maps.event.trigger(marker, "click");
        });

        google.maps.event.addDomListener(li, "mouseover", function() {
            marker.setZIndex(2000);
            marker.setIcon(opts.icon2);
        });

        google.maps.event.addDomListener(li, "mouseout", function() {
            marker.setZIndex(1);
            marker.setIcon(opts.icon);
        });

    }

    /**
     * Add Remove Icons Icon
     */
    _setRemoveAllIcons() {
        const self = this;

        const removeAllIconsControlDiv = document.createElement('div');
        removeAllIconsControlDiv.style.padding = '2px';

        // Set CSS for the control border.
        const controlUI = document.createElement('div');
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click per mostrar o ocultar totes les edificacions';
        removeAllIconsControlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        const controlText = document.createElement('div');
        controlText.id = "visibleBuildings";
        controlText.innerHTML = '<img src="' + this.serverHost + '/images/catalunya-gmap/gmap/06.png" width="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >';
        controlUI.appendChild(controlText);

        this.map.controls[this.core.ControlPosition.RIGHT_TOP].push(removeAllIconsControlDiv);

        // Setup the click event listeners: simply set the map to Chicago.
        google.maps.event.addDomListener(controlUI, 'click', function() {
            let number = "05" // visible
            if (!self.visibleBuildings) {
                number = "06"
            }
            $("#visibleBuildings").html('<img src="' + self.serverHost + '/images/catalunya-gmap/gmap/' + number +'.png" width="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >');

            self.visibleBuildings = !self.visibleBuildings
            self._changeVisibility(self.visibleBuildings);
            self.clusterer.resetViewport_();
            self.clusterer.redraw_();
        });
    }

    addIcon(edifici) {
        this._createIcon(edifici);
        this.icons.push(edifici); //Add Icon to the icons list
    }

    _createIcon(edifici) {

        const controlDiv = document.createElement('div');
        controlDiv.style.padding = '2px';

        // Set CSS for the control border.
        const controlUI = document.createElement('div');
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click per activar o desactivar ' + edifici.title;
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        const controlText = document.createElement('div');
        controlText.innerHTML = '<img id="img-' + edifici.category + '" src="' + edifici.icon + '" alt="' + edifici.title + '" >';
        controlUI.appendChild(controlText);

        this.map.controls[this.core.ControlPosition.RIGHT_TOP].push(controlDiv);

        const self = this;
        // Set up the click event listeners
        google.maps.event.addDomListener(controlUI, 'click', function() {
            edifici.visible = !edifici.visible;
            self._setVisible(edifici.category, edifici.visible);
            self.clusterer.resetViewport_();
            self.clusterer.redraw_();
        });

        return controlDiv;
    }

    /**
     * change the visibility of the icons
     */
    _changeVisibility(visibility) {
        const self = this;
        this.icons.forEach(function(edifici) {
            edifici.visible = visibility;
            self._setVisible(edifici.category, visibility);
        });
    }

    /**
     * Set the Logo for Catalunya Medieval in the BOTTOM_LEFT corner
     */
    _setLogoCatalunyaMedieval() {

        const logoControlDiv = document.createElement('div');

        //Set CSS styles for the div containing the control
        logoControlDiv.index = 10; // used for ordering
        logoControlDiv.style.padding = '0px';

        //Set CSS for the control border
        const logo = document.createElement('img');
        logo.src = this.serverHost + '/images/catalunya-gmap/logo/logoCM-red-mini.png';
        logo.style.cursor = 'pointer';
        logoControlDiv.appendChild(logo);

        this.map.controls[this.core.ControlPosition.BOTTOM_LEFT].push(logoControlDiv);
    }

    /**
     * Set Icon for icons list
     */
    _setIconFullScreen() {
        const self = this;

        const fullScreenControlDiv = document.createElement('div');
        // Set CSS styles for the DIV containing the control
        // Setting padding to 5 px will offset the control
        // from the edge of the map.
        fullScreenControlDiv.style.padding = '2px';

        // Set CSS for the control border.
        const controlUI = document.createElement('div');
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click per mostrar o ocultar el llistat';
        controlUI.style.visibility = "visible";
        fullScreenControlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        const controlText = document.createElement('div');
        controlText.id = "llistat";
        controlText.innerHTML = '<img src="' + this.serverHost + '/images/catalunya-gmap/gmap/03.png" width="42" height="42" alt="Mostrar llistat" >';
        controlUI.appendChild(controlText);

        this.map.controls[this.core.ControlPosition.TOP_RIGHT].push(fullScreenControlDiv);

        // Set up the click event listeners:
        google.maps.event.addDomListener(controlUI, 'click', function() {
            //Toggle divs + resize map
            $('#primaryDiv').toggleClass('primaryDiv');
            self._resize(true);
            $("#secondaryDiv").toggle();

            let number = "04"
            if (!self.fullScreen) {
                number = "03"
            }
            self.fullScreen = !self.fullScreen

            $("#llistat").html('<img src="' + self.serverHost + '/images/catalunya-gmap/gmap/' + number + '.png" with="42" height="42" alt="Ocultar llistat" >');
        });

    }
    _setVisible(category, visible) {
        if (visible) {
            this.enableMarkersByCategory(category)
            this._enableText(category);
            $("#img-" + category).css("opacity", '1');
        } else {
            this.disableMarkersByCategory(category)
            this._disableText(category);
            $("#img-" + category).css("opacity", '0.5');
        }
        this._resize(false);
    }

    /**
     * Enable Text list
     */
    _enableText(category) {
        var category = "." + category;
        $(category).each(function() {
            $(this).show();
        });
    }

    /**
     * Disable Text list
     */
    _disableText(category) {
        var category = "." + category;
        $(category).each(function() {
            $(this).hide();
        });
    }

    // Public function to removeBy given a callback function
    enableMarkersByCategory(category) {
        const self = this;
        self.markers.forEach(function(marker) {
            if(marker.category === category) {
                marker.setVisible(true);
                self.clusterer.addMarker(marker, true);
            }
        });
    }

    /**
     * Public function to removeBy given a callback function
     */
    disableMarkersByCategory(category) {
        const self = this;
        self.markers.forEach(function(marker) {
            if(marker.category === category) {
                marker.setVisible(false);
                self.clusterer.removeMarker(marker, true);
            }
        });

    }

    _resize(fitOption) {
        if (this.clusterer.getMarkers().length > 0) {
            if (this.debug) {
                console.log("markerClusterer : it is not empty!", this.clusterer.getMarkers().length);
                console.log("Recenter markers!");
            }

            //TODO: check this
            // if (this.findUser) {
            //     this._findUser();
            // }

            this._refreshMap();

            if (fitOption) {
                this.clusterer.fitMapToMarkers();
                this.clusterer.repaint();
            }

        } else {
            if (this.debug) {
                console.log("Marker Clusterer : it is empty!");
                console.log("Recenter the map to Catalunya Area");
            }

            //TODO: take it from options
            const latitud = 41.440908754848165;
            const longitude = 1.81713925781257;
            const catalunya = new google.maps.LatLng(latitud, longitude);
            this.map.setZoom(8);
        }

    }

    // Private function to create an event to the given object
    _on(opts) {
        const self = this;
        google.maps.event.addListener(opts.obj, opts.event, function(e) {
            return opts.callback.call(self, e);
        });
    }

    /**
     * refresh Map triggering resize function
     */
    _refreshMap() {
        google.maps.event.trigger(this.map, 'resize');
    }

    _getMarkers() {
        return this.markers;
    }
}