(function(window, google, List){

 var Catmap = (function(){
 	function Catmap(element, opts){
 		this.gMap = new google.maps.Map(element, opts);
 		this.markers = List.create();
 	}
 	Catmap.prototype ={

 		// Public funtion to set up the zoom
 		zoom: function(level){
 			if(level){
 				this.gMap.setZoom(level);
 			}else{
 				return this.gMap.getZoom();
 			}
 		},

 		// Private function to create an event to the given object
 		_on: function(opts){
 			var self = this;
			google.maps.event.addListener(opts.obj, opts.event, function(e){
				opts.callback.call(self, e);
			});
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
 						var infowindow = new google.maps.InfoWindow({
 							content: opts.content
 						});

 						infowindow.open(this.gMap, marker);
 					}
 				});
 			}

 			
 		},

 		findMarkerByLat: function(lat){
 			var i=0;
 			for(; i< this.markers.length; i++){
 				var marker = this.markers[i];
 				if(marker.position.lat() === lat){
 					return marker;
 				}
 			}
 		},

 		// Private function thaat create the marker with the given options
 		_createMarker: function(opts){
 			opts.map = this.gMap;
 			return new google.maps.Marker(opts);
 		}

 	};

 	return Catmap;
 }());

 Catmap.create = function(element, opts){
 	return new Catmap(element, opts);
 };

 window.Catmap = Catmap;

}(window, google, List));