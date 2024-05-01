import {Loader} from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {STYLES} from "./catalunya-gmap-styles";
import {stringToBoolean} from "./catalunya-gmap-extra";


export default class MapManager {
    constructor(mapId) {

        this.debug = stringToBoolean(process.env.DEBUG);

        this.loader = new Loader({
            apiKey: process.env.GOOGLE_MAPS_API_KEY,
            version: "weekly",
            libraries: ["core", "maps", "marker"]
        });

        // libraries that we are loading
        this.google = null;
        this.marker = null;
        this.core = null;

        // to keep track with initial values
        this.ListTextEnabled = false;
        this.visibleBuildings = true;
        this.useMarkerCluster = process.env.USE_MARKER_CLUSTER;
        this.infowindow = null;

        this.arrayCategoriesText = [];  // List categories text that we use to display in the side
        this.icons = [];                // List of icons

        this.mapId = mapId;             // The mapId
        this.map = null;                // The created map
        this.markers = [];              // All the markers
        this.clusterer = null;          // custer elements

        this.serverHost = process.env.SERVER_HOST;
        this.userPosition = stringToBoolean(process.env.USER_POSITION);

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
                //mapId: "DEMO_MAP_ID", // needed for AdvancedMarkerElement
                center: {lat: 41.440908754848165, lng: 1.81713925781257},
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
            this._setIconTextList();
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

        // if we have the content object set up
        this.addContentToMarker(location, marker);

        // Create right buttons on the map
        this._createMarkerButton(marker, location)
    }

    getMarkers() {
        return this.markers;
    }

    addContentToMarker(location, marker) {
        if (location.content) {

            if (this.infowindow === null) {
                this.infowindow = new this.google.InfoWindow({
                    content: location.content,
                    position: marker.position
                });
            }

            const self = this
            marker.addListener('click', function () {
                self.infowindow.setContent(location.content);
                self.infowindow.setPosition(marker.position)
                self.infowindow.open({
                    anchor: marker,
                    shouldFocus: false
                });
            });

            /*
             * The google.maps.event.addListener() event waits for
             * the creation of the infowindow HTML structure 'domready'
             * and before the opening of the infowindow we defined the new event close for the custom style
             */
            google.maps.event.addListener(this.infowindow, 'domready', function () {
                let closeBtn = $('.catmed-google-maps-marker-close');
                closeBtn[0].addEventListener('click', function () {
                    self.infowindow.close();
                });

            });
        }
    }

    addAllMarkersToCluster(marker) {
        this.clusterer = new MarkerClusterer({ map: this.map, markers:this.markers});
    }

    // createAdvancedMarkerElement(location) {
    //     const icon = document.createElement("img");
    //     icon.src = location.icon
    //     let marker = new this.marker.AdvancedMarkerElement({
    //         position: {
    //             lat: location.lat,
    //             lng: location.lng
    //         },
    //         map: this.map,
    //         title: location.title,
    //         content: icon,
    //     });
    //     marker.visible = location.visible;
    //     marker.category = location.category;
    //     return marker;
    // }

    createMarker(location) {
        let marker = new this.marker.Marker({
            position: {
                lat: location.lat,
                lng: location.lng
            },
            map: this.map,
            title: location.title,
            icon: location.icon,
        });
        marker.visible = location.visible;
        marker.category = location.category;
        return marker;
    }

    addIcon(edifici) {
        this._createIcon(edifici);
        this.icons.push(edifici); //Add Icon to the icons list
    }

    resize(fitOption) {
        if (this.clusterer.markers.length > 0) {
            if (this.debug) {
                console.log("markerClusterer : it is not empty!", this.clusterer.markers.length);
                console.log("Recenter markers!");
            }

            if (this.userPosition) {
                this._addUserPosition();
            }

            this._refreshMap();

            // Render the clusterer to update the numbers
            this.clusterer.render()


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
        li.addEventListener("click", function () {
            self.map.setZoom(15);
            self.map.setCenter(marker.position);
            self.map.setTilt(1);
            google.maps.event.trigger(marker, "click");
        });

        li.addEventListener("mouseover", function () {
            marker.setZIndex(2000);
            marker.setIcon(opts.icon2);
        });

        li.addEventListener("mouseout", function () {
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
        controlText.innerHTML = '<img src="' + this.serverHost + 'assets/images/catalunya-gmap/gmap/06.png" width="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >';
        controlUI.appendChild(controlText);

        this.map.controls[this.core.ControlPosition.RIGHT_TOP].push(removeAllIconsControlDiv);

        controlUI.addEventListener('click', function () {
            let number = "05" // visible
            if (!self.visibleBuildings) {
                number = "06"
            }
            $("#visibleBuildings").html('<img src="' + self.serverHost + 'assets/images/catalunya-gmap/gmap/' + number + '.png" width="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >');

            self.visibleBuildings = !self.visibleBuildings
            self._changeVisibility(self.visibleBuildings);
        });
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
        controlUI.addEventListener( 'click', function () {
            edifici.visible = !edifici.visible;
            self._setVisible(edifici.category, edifici.visible);
        });

        return controlDiv;
    }

    /**
     * change the visibility of the icons
     */
    _changeVisibility(visibility) {
        const self = this;
        this.icons.forEach(function (edifici) {
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
        logo.src = this.serverHost + 'assets/images/catalunya-gmap/logo/logoCM-red-mini.png';
        logo.style.cursor = 'pointer';
        logoControlDiv.appendChild(logo);

        this.map.controls[this.core.ControlPosition.BOTTOM_LEFT].push(logoControlDiv);
    }

    /**
     * Set Icon for icons list
     */
    _setIconTextList() {
        const self = this;

        const showTextList = document.createElement('div');
        // Set CSS styles for the DIV containing the control
        // Setting padding to 5 px will offset the control
        // from the edge of the map.
        showTextList.style.padding = '2px';

        // Set CSS for the control border.
        const controlUI = document.createElement('div');
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click per mostrar o ocultar el llistat';
        controlUI.style.visibility = "visible";
        showTextList.appendChild(controlUI);

        // Set CSS for the control interior.
        const controlText = document.createElement('div');
        controlText.id = "llistat";
        controlText.innerHTML = '<img src="' + this.serverHost + 'assets/images/catalunya-gmap/gmap/03.png" width="42" height="42" alt="Mostrar llistat" >';
        controlUI.appendChild(controlText);

        this.map.controls[this.core.ControlPosition.TOP_RIGHT].push(showTextList);

        // Set up the click event listeners:
        controlUI.addEventListener( 'click', function () {
            //Toggle divs + resize map
            $('#primaryDiv').toggleClass('primaryDiv');
            self.resize(true);
            $("#secondaryDiv").toggle();

            let number = "04"
            if (!self.ListTextEnabled) {
                number = "03"
            }
            self.ListTextEnabled = !self.ListTextEnabled
            self.infowindow.close()

            $("#llistat").html('<img src="' + self.serverHost + 'assets/images/catalunya-gmap/gmap/' + number + '.png" with="42" height="42" alt="Ocultar llistat" >');

            self.resize(false)
        });
    }

    _setVisible(category, visible) {
        if (visible) {
            this._enableMarkersByCategory(category)
            this._enableText(category);
            $("#img-" + category).css("opacity", '1');
        } else {
            this._disableMarkersByCategory(category)
            this._disableText(category);
            $("#img-" + category).css("opacity", '0.5');
        }
        this.resize(false);
    }

    /**
     * Enable Text list
     */
    _enableText(category) {
        var category = "." + category;
        $(category).each(function () {
            $(this).show();
        });
    }

    /**
     * Disable Text list
     */
    _disableText(category) {
        var category = "." + category;
        $(category).each(function () {
            $(this).hide();
        });
    }

    _enableMarkersByCategory(category) {
        const self = this;
        self.markers.forEach(function (marker) {
            if (marker.category === category) {
                marker.visible = true;
                marker.map = self.map                    // Add marker to the map
                self.clusterer.addMarker(marker, true);  // Add marker to the clusterer
            }
        });
    }

    /**
     * Public function to removeBy given a callback function
     */
    _disableMarkersByCategory(category) {
        const self = this;
        self.markers.forEach(function (marker) {
            if (marker.category === category) {
                marker.visible = false;
                marker.map = null;                          // Remove the marker from the map
                self.clusterer.removeMarker(marker, true);  // Remove the marker from the clusterer
            }
        });
    }

    /**
     * refresh Map triggering resize function
     */
    _refreshMap() {
        google.maps.event.trigger(this.map, 'resize');
    }

    /**
     * find user
     */
    _addUserPosition() {
        // Try HTML5 geolocation.
        self = this;
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    let user_marker = new self.marker.Marker({
                        position: pos,
                        map: self.map,
                    });
                    user_marker.is_user = true;

                    self.markers.push(user_marker)

                }, function () {
                    console.log("The Geolocation service failed.")
                });
            } else {
                console.log("The Geolocation service failed.")
            }
        }catch(error){
            console.log("The Geolocation service failed.")
        }
    }
}
