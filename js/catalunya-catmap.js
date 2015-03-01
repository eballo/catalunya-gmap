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

 		_on: function(event, callback){
 			var self = this;
			google.maps.event.addListener(this.gMap, event, function(e){
				callback.call(self, e);
			});
 		},

 		addMarker: function(lat, lng){
 			this._createMarker(lat,lng);
 		},

 		_createMarker: function(lat, lng){
 			var opts = {
 				position:{
 					lat: lat,
 					lng: lng
 				},
				map: this.gMap
 			};
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