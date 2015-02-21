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
 		}

 	};

 	return Catmap;
 }());

 Catmap.create = function(element, opts){
 	return new Catmap(element, opts);
 };

 window.Catmap = Catmap;

}(window, google));