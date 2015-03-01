(function(window, google){

 var Catmap = (function(){
 	function Catmap(element, opts){
 		this.gMap = new google.maps.Map(element, opts);
 	}
 	Catmap.prototype ={

 		zoom: function(level){
 			if(level){
 				this.gMap.setZoom(level);
 			}else{
 				return this.gMap.getZoom();
 			}
 		},

 		_on: function(opts){
 			var self = this;
			google.maps.event.addListener(opts.obj, opts.event, function(e){
				opts.callback.call(self, e);
			});
 		},

 		addMarker: function(opts){
 			var marker;

 			opts.position = {
 				lat: opts.lat,
 				lng: opts.lng
 			}

 			marker = this._createMarker(opts);

 			if(opts.event){
 				this._on({
 					obj: marker,
 					event: opts.event.name,
 					callback: opts.event.callback
 				});
 			}

 			
 		},

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

}(window, google));