(function(window, google, List, Icons) {

    var Gmap = (function() {
        function Gmap(element, opts, config) {

            this.debug = config.debug;
            this.serverHost = config.serverHost;
            this.gMap = new google.maps.Map(element, opts);
            this.markers = List.create();
            this.icons = Icons.create();
            var mcOptions = {
                minimumClusterSize: 15
            };
            this.markerClusterer = new MarkerClusterer(this.gMap, [], mcOptions);
            this.infowindow = new google.maps.InfoWindow();
            this.fullScreen = true;
            this.useMarkerCluster = config.useMarkerCluster;

            this.arrayCategoriesText = List.create();

            //  Create a new viewpoint bound
            this.bounds = new google.maps.LatLngBounds();

            // Initialize map
            this._setLogoCatalunyaMedieval();
            this._setIconFullScreen();
            this._setRemoveAllIcons();

        }
        Gmap.prototype = {
            /**
             * Add Remove Icons Icon
             */
            _setRemoveAllIcons: function(map) {
                var self = this;

                var removeAllIconsControlDiv = document.createElement('div');
                removeAllIconsControlDiv.style.padding = '2px';

                // Set CSS for the control border.
                var controlUI = document.createElement('div');
                controlUI.style.cursor = 'pointer';
                controlUI.style.textAlign = 'center';
                controlUI.title = 'Click per mostrar o ocultar totes les edificacions';
                removeAllIconsControlDiv.appendChild(controlUI);

                // Set CSS for the control interior.
                var controlText = document.createElement('div');
                controlText.id = "visibleBuildings";
                controlText.innerHTML = '<img src="' + this.serverHost + '/assets/images/gmap/06.png" with="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >';
                controlUI.appendChild(controlText);

                this.gMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(removeAllIconsControlDiv);

                // Setup the click event listeners: simply set the map to Chicago.
                google.maps.event.addDomListener(controlUI, 'click', function() {
                    if (visibleBuildings) {
                        visibleBuildings = false;
                        $("#visibleBuildings").html('<img src="' + self.serverHost + '/assets/images/gmap/05.png" with="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >');
                    } else {
                        visibleBuildings = true;
                        $("#visibleBuildings").html('<img src="' + self.serverHost + '/assets/images/gmap/06.png" with="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >');
                    }
                    self._cangeVisibility(visibleBuildings);
                });
            },
            /**
             * change the visibility of the icons
             */
            _cangeVisibility: function(visibility) {
                var arrayIcons = this.icons.getItems();
                var self = this;
                arrayIcons.forEach(function(category) {
                    self._setVisible(category, visibility);
                });
            },

            /**
             * Set the Logo for Catalunya Medieval in the BOTTOM_LEFT corner
             */
            _setLogoCatalunyaMedieval: function() {

                var logoControlDiv = document.createElement('div');

                //Set CSS styles for the div containing the control
                logoControlDiv.index = 10; // used for ordering
                logoControlDiv.style.padding = '0px';

                //Set CSS for the control border
                var logo = document.createElement('img');
                logo.src = this.serverHost + '/assets/images/logo/logoCM-red-mini.png';
                logo.style.cursor = 'pointer';
                logoControlDiv.appendChild(logo);

                this.gMap.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(logoControlDiv);
            },

            // Set Icon for Llistat
            _setIconFullScreen: function(map) {
                var self = this;

                var fullScreenControlDiv = document.createElement('div');
                // Set CSS styles for the DIV containing the control
                // Setting padding to 5 px will offset the control
                // from the edge of the map.
                fullScreenControlDiv.style.padding = '2px';

                // Set CSS for the control border.
                var controlUI = document.createElement('div');
                controlUI.style.cursor = 'pointer';
                controlUI.style.textAlign = 'center';
                controlUI.title = 'Click per mostrar o ocultar el llistat';
                controlUI.style.visibility = "visible";
                fullScreenControlDiv.appendChild(controlUI);

                // Set CSS for the control interior.
                var controlText = document.createElement('div');
                controlText.id = "llistat";
                controlText.innerHTML = '<img src="' + this.serverHost + '/assets/images/gmap/03.png" with="42" height="42" alt="Mostrar llistat" >';
                controlUI.appendChild(controlText);

                this.gMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(fullScreenControlDiv);

                // Setup the click event listeners:
                google.maps.event.addDomListener(controlUI, 'click', function() {
                    //Toggle divs + resize map
                    $('#primaryDiv').toggleClass('primaryDiv');
                    self._resize();
                    $("#secondaryDiv").toggle();

                    if (self.fullScreen) {
                        self.fullScreen = false;
                        $("#llistat").html('<img src="' + self.serverHost + '/assets/images/gmap/04.png" with="42" height="42" alt="Ocultar llistat" >');
                    } else {
                        self.fullScreen = true;
                        $("#llistat").html('<img src="' + self.serverHost + '/assets/images/gmap/03.png" with="42" height="42" alt="Mostrar llistat" >');
                    }

                });

            },

            _resize: function(marker) {

                if (this.markerClusterer.getMarkers().length > 0) {
                    if (this.debug) {
                        console.log("markerClusterer : it is not empty!");
                        console.log("Recenter markers!");
                    }
                    this._refreshMap();
                    this.markerClusterer.fitMapToMarkers();
                    this.markerClusterer.repaint();

                } else {
                    if (this.debug) {
                        console.log("markerClusterer : it is empty!");
                        console.log("Recenter the map to Catalunya Area");
                    }

                    var latitud = 41.440908754848165;
                    var longitude = 1.81713925781257;
                    var catalunya = new google.maps.LatLng(latitud, longitude);
                    this.gMap.setZoom(8);
                    this.gMap.setCenter(catalunya);
                }
                this._refreshMap();

            },

            /**
             * refresh Map triggering resize function
             */
            _refreshMap: function() {
                if (this.debug) {
                    console.log("refreshing map!");
                }
                google.maps.event.trigger(this.gMap, 'resize');
            },

            // Private function to create an event to the given object
            _on: function(opts) {
                var self = this;
                google.maps.event.addListener(opts.obj, opts.event, function(e) {
                    return opts.callback.call(self, e);
                });
            },

            // Private function thaat create the marker with the given options
            _createMarker: function(opts) {
                opts.map = this.gMap;
                return new google.maps.Marker(opts);
            },

            _createIcon: function(edifici) {

                var controlDiv = document.createElement('div');
                controlDiv.style.padding = '2px';

                // Set CSS for the control border.
                var controlUI = document.createElement('div');
                controlUI.style.cursor = 'pointer';
                controlUI.style.textAlign = 'center';
                controlUI.title = 'Click per activar o desactivar ' + edifici.title;
                controlDiv.appendChild(controlUI);

                // Set CSS for the control interior.
                var controlText = document.createElement('div');
                controlText.innerHTML = '<img id="img-' + edifici.category + '" src="' + edifici.icon + '" alt="' + edifici.title + '" >';
                controlUI.appendChild(controlText);

                this.gMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

                var self = this;
                // Setup the click event listeners
                google.maps.event.addDomListener(controlUI, 'click', function() {
                    if (edifici.visible) {
                        edifici.visible = false;
                    } else {
                        edifici.visible = true;
                    }

                    self._setVisible(edifici.category, edifici.visible);
                    self.markerClusterer.resetViewport_();
                    self.markerClusterer.redraw_();
                });

                return controlDiv;
            },

            _setVisible: function(category, visible) {

                if (visible) {
                    this.enableBy(function(marker) {
                        return marker.category === category;
                    })
                    this._enableText(category);
                    $("#img-" + category).css("opacity", '1');
                } else {
                    this.disableBy(function(marker) {
                        return marker.category === category;
                    })
                    this._disableText(category);
                    $("#img-" + category).css("opacity", '0.5');
                }
            },

            addIcon: function(edifici) {

                this._createIcon(edifici);
                //Add tot the list
                this.icons.add(edifici.category);

            },

            removeIcon: function(edifici) {

            },

            // Public function to add a marker in the map with the given options
            addMarker: function(opts) {
                var marker;

                opts.position = {
                    lat: opts.lat,
                    lng: opts.lng
                }

                // create a google maps marker with the given options
                marker = this._createMarker(opts);

                this.bounds.extend(marker.getPosition());

                // Add marker to the marker cluster
                if (this.useMarkerCluster) {
                    this.markerClusterer.addMarker(marker);
                }
                // Add the created marker to the markers array
                this.markers.add(marker);


                // if we have the event object set up
                if (opts.event) {
                    this._on({
                        obj: marker,
                        event: opts.event.name,
                        callback: opts.event.callback
                    });
                }

                // if we have the content object set up
                if (opts.content) {
                    this._on({
                        obj: marker,
                        event: 'click',
                        callback: function() {
                            this.infowindow.setContent(opts.content);
                            this.infowindow.setPosition(marker.getPosition());
                            this.infowindow.open(this.gMap, marker);
                        }
                    });

                }

                //create marker button
                this._createMarkerButton(marker, opts);

                /*
                 * The google.maps.event.addListener() event waits for
                 * the creation of the infowindow HTML structure 'domready'
                 * and before the opening of the infowindow defined styles
                 * are applied.
                 */
                google.maps.event.addListener(this.infowindow, 'domready', function() {

                    // Reference to the DIV which receives the contents of the infowindow using jQuery
                    var iwOuter = $('.gm-style-iw');

                    /* The DIV we want to change is above the .gm-style-iw DIV.
                     * So, we use jQuery and create a iwBackground variable,
                     * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
                     */
                    var iwBackground = iwOuter.prev();

                    // Remove the background shadow DIV
                    iwBackground.css({
                        'background-color': '#fff6eb'
                    });

                    // Remove the white background DIV
                    iwBackground.children(':nth-child(4)').css({
                        'background-color': '#fff6eb'
                    });

                    //We go to the div just before the one we changed before
                    iwBackground.children(':nth-child(3)').children(':nth-child(1)').children(':nth-child(1)').css({
                        'background-color': '#fff6eb'
                    });
                    iwBackground.children(':nth-child(3)').children(':nth-child(2)').children(':nth-child(1)').css({
                        'background-color': '#fff6eb'
                    });

                });

            },

            /**
             *  create Marker Button link text
             */
            _createMarkerButton: function(marker, opts) {

                //Creates a sidebar text link
                var ul = document.getElementById("mapLlist");

                //Add Title Category if needed
                if (!this.arrayCategoriesText.exist(opts.category)) {
                    //Add to the array
                    this.arrayCategoriesText.add(opts.category);
                    //Create the li header
                    var liCategory = document.createElement("li");
                    var category = opts.categoryName;
                    liCategory.innerHTML = category;
                    liCategory.setAttribute("class", opts.category + " header");
                    ul.appendChild(liCategory);
                }
                //Add a normal building
                var li = document.createElement("li");
                var title = opts.title;
                li.innerHTML = title;
                li.setAttribute("class", opts.category);
                ul.appendChild(li);

                var self = this;
                //Trigger a click event to marker when the button is clicked.
                google.maps.event.addDomListener(li, "click", function() {
                    self.gMap.setZoom(15);
                    self.gMap.setCenter(marker.getPosition());
                    self.gMap.setTilt(1);
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

            },

            // Public function to findBy given a callback function
            findBy: function(callback) {
                return this.markers.find(callback);
            },

            // Public function to removeBy given a callback function
            removeBy: function(callback) {
                var self = this;
                self.markers.find(callback, function(markers) {
                    markers.forEach(function(marker) {
                        if (self.markerClusterer) {
                            self.markerClusterer.removeMarker(marker);
                        } else {
                            marker.setMap(null);
                        }
                    });
                });
            },
            /**
             * Enable Text list
             */
            _enableText: function(category) {
                var category = "." + category;
                $(category).each(function() {
                    $(this).show();
                });
            },
            /**
             * Disable Text list
             */
            _disableText: function(category) {
                var category = "." + category;
                $(category).each(function() {
                    $(this).hide();
                });
            },
            // Public function to removeBy given a callback function
            enableBy: function(callback) {
                var self = this;
                self.markers.find(callback, function(markers) {
                    markers.forEach(function(marker) {
                        marker.setVisible(true);
                        self.markerClusterer.addMarker(marker, true);
                    });
                });
                this._resize();
            },

            // Public function to removeBy given a callback function
            disableBy: function(callback) {
                var self = this;
                self.markers.find(callback, function(markers) {
                    markers.forEach(function(marker) {
                        marker.setVisible(false);
                        self.markerClusterer.removeMarker(marker, true);
                    });
                });
                this._resize();
            },

            _getMarkers: function() {
                return this.markers;
            },

            // Public funtion to set up the zoom
            zoom: function(level) {
                if (level) {
                    this.gMap.setZoom(level);
                } else {
                    return this.gMap.getZoom();
                }
            }

        };

        return Gmap;
    }());

    Gmap.create = function(element, opts, config) {
        var element = document.getElementById(element);
        return new Gmap(element, opts, config);
    };

    window.Gmap = Gmap;

}(window, google, List, Icons));
