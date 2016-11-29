(function(window, google, List){

 var Catmap = (function(){
 	function Catmap(element, opts){
 		this.gMap = new google.maps.Map(element, opts);
 		this.markers = List.create();
 		this.icons = List.create();
 		this.markerClusterer = new MarkerClusterer(this.gMap, []);
 		this.infowindow = new google.maps.InfoWindow();
 	}
 	Catmap.prototype ={

 		// Private function to create an event to the given object
 		_on: function(opts){
 			var self = this;

			google.maps.event.addListener(opts.obj, opts.event, function(e){
				return opts.callback.call(self, e);
			});
 		},

 		// Private function thaat create the marker with the given options
 		_createMarker: function(opts){
 			opts.map = this.gMap;
 			return new google.maps.Marker(opts);
 		},

 		_createIcon: function(edifici){

 			var controlDiv = document.createElement('div');

 			// Set CSS styles for the DIV containing the control
	      	// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '2px';

			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.title = 'Click per activar o desactivar '+ edifici.title;
			controlDiv.appendChild(controlUI);

			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.innerHTML = '<img src="'+edifici.icon+'" alt="'+edifici.title+'" >';
			controlUI.appendChild(controlText);

			this.gMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

            var self = this;
            // Setup the click event listeners
	      	google.maps.event.addDomListener(controlUI, 'click', function() {
		    	if(edifici.visible){
		    		edifici.visible = false;
		      	}else{
		    		edifici.visible = true;
		      	}
	      	  	self._setVisible(edifici.categoria,edifici.visible);
                console.log(self.markerClusterer);
	      	  	self.markerClusterer.resetViewport_();
    			self.markerClusterer.redraw_();
	      	});
	      	

			return controlDiv;

 		},

 		_setVisible: function(categoria, visible){
 			
 			if(visible){
				this.enableBy(function(marker){
					return marker.categoria === categoria;
				})
			}else{
				this.disableBy(function(marker){
					return marker.categoria === categoria;
				})
			}
 		},

 		addIcon: function(edifici){

 			var icon;
 			icon = this._createIcon(edifici);
 			this.icons.add(icon);

 		},

 		removeIcon: function(edifici){

 		},

 		// Public function to add a marker in the map with the given options
 		addMarker: function(opts){
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

 			// if we have the event object set up
 			if(opts.event){
 				this._on({
 					obj: marker,
 					event: opts.event.name,
 					callback: opts.event.callback
 				});
 			}

			// if we have the content object set up
 			if(opts.content){
 				this._on({
 					obj: marker,
 					event: 'click',
 					callback: function(){
 						this.infowindow.setContent(opts.content);
 						this.infowindow.open(this.gMap, marker);
 					}
 				});
 			}

 		},

		// Public function to findBy given a callback function
 		findBy: function(callback){
 			return this.markers.find(callback);
 		},

        // Public function to removeBy given a callback function
 		removeBy: function(callback){
 			var self = this;
 			self.markers.find(callback, function(markers){
 				markers.forEach(function(marker){
 					if(self.markerClusterer){
 						self.markerClusterer.removeMarker(marker);	
 					}else{
 						marker.setMap(null);	
 					}
 				});
 			});
 		},

 		// Public function to removeBy given a callback function
 		enableBy: function(callback){
 			var self = this;
 			self.markers.find(callback, function(markers){
 				markers.forEach(function(marker){
 					marker.setVisible(true);
 					self.markerClusterer.addMarker(marker,true);
 				});
 			});
 		},

 		 // Public function to removeBy given a callback function
 		disableBy: function(callback){
 			var self = this;
 			self.markers.find(callback, function(markers){
 				markers.forEach(function(marker){	
 					marker.setVisible(false);	
 					self.markerClusterer.removeMarker(marker,true);
 				});
 			});
 		},

 		// Public funtion to set up the zoom
 		zoom: function(level){
 			if(level){
 				this.gMap.setZoom(level);
 			}else{
 				return this.gMap.getZoom();
 			}
 		}

 	};

 	return Catmap;
 }());

 Catmap.create = function(element, opts){
 	return new Catmap(element, opts);
 };

 window.Catmap = Catmap;

}(window, google, List));