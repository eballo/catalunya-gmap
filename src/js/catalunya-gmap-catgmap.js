(function(window, google, List) {

    var Gmap = (function() {
        function Gmap(element, opts, config) {

            this.debug = config.debug;
            this.serverHost = config.serverHost;
            this.gMap = new google.maps.Map(element, opts);
            this.markers = List.create();
            this.icons = List.create();
            this.markerClusterer = new MarkerClusterer(this.gMap, []);
            this.infowindow = new google.maps.InfoWindow();

            //  Create a new viewpoint bound
            this.bounds = new google.maps.LatLngBounds();
            this._setLogoCatalunyaMedieval();
        }
        Gmap.prototype = {

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

            _resize: function() {

                if (this.markerClusterer.getMarkers().length > 0) {
                    if (this.debug) {
                        console.log("markerClusterer : it is not empty!");
                        console.log("Recenter markers!");
                    }
                    this.markerClusterer.fitMapToMarkers();
                    this.markerClusterer.repaint();
                } else {
                    if (this.debug) {
                        console.log("markerClusterer : it is empty!");
                        console.log("Recenter the map to Catalunya Area");
                    }
                    //google.maps.event.trigger(this.gMap, "resize");
                    //var center = this.gMap.getCenter();
                    var latitud = 41.440908754848165;
                    var longitude = 1.81713925781257;
                    var catalunya = new google.maps.LatLng(latitud, longitude);
                    this.gMap.setZoom(8);
                    this.gMap.setCenter(catalunya);
                }
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

                // Set CSS styles for the DIV containing the control
                // Setting padding to 5 px will offset the control
                // from the edge of the map.
                controlDiv.style.padding = '2px';

                // Set CSS for the control border.
                var controlUI = document.createElement('div');
                controlUI.style.cursor = 'pointer';
                controlUI.style.textAlign = 'center';
                controlUI.title = 'Click per activar o desactivar ' + edifici.title;
                controlDiv.appendChild(controlUI);

                // Set CSS for the control interior.
                var controlText = document.createElement('div');
                controlText.innerHTML = '<img src="' + edifici.icon + '" alt="' + edifici.title + '" >';
                controlUI.appendChild(controlText);

                this.gMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

                var self = this;
                // Setup the click event listeners
                google.maps.event.addDomListener(controlUI, 'click', function() {
                    if (edifici.visible) {
                        edifici.visible = false;
                        controlText.style.opacity = '0.5';
                    } else {
                        edifici.visible = true;
                        controlText.style.opacity = '1';
                    }
                    self._setVisible(edifici.categoria, edifici.visible);
                    //console.log(self.markerClusterer);
                    self.markerClusterer.resetViewport_();
                    self.markerClusterer.redraw_();
                });


                return controlDiv;

            },

            _setVisible: function(categoria, visible) {

                if (visible) {
                    this.enableBy(function(marker) {
                        return marker.categoria === categoria;
                    })
                } else {
                    this.disableBy(function(marker) {
                        return marker.categoria === categoria;
                    })
                }
            },

            addIcon: function(edifici) {

                var icon;
                icon = this._createIcon(edifici);
                this.icons.add(icon);

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

                // create the marker with the given options
                marker = this._createMarker(opts);

                // Add marker to the marker cluster
                this.markerClusterer.addMarker(marker);
                //this.markerClusterer.setIgnoreHidden(true);

                // Add the created marker to the markers array
                this.markers.add(marker);

                // Add to Bounds
                this.bounds.extend(marker.getPosition());

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
                            this.infowindow.open(this.gMap, marker);
                        }
                    });

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

                }

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

}(window, google, List));
