(function(window){
	var List = (function(){

		//Constructor function
		function List(params){
			this.items = [];
		}
		List.prototype = {

			add: function(item){
				this.items.push(item);

			},

			remove: function(item){
				var indexOf = this.items.indexOf(item);
 				if(indexOf !== -1){
 					this.items.splice(indexOf,1);
 					item.setMap(null);
 				}
			},

			find: function(item){

			}

		};
		return List;
	}());

	//Factory Method
	List.create = function(params){
		return new List(params);
	};

	window.List = List;

}(window));