(function(window, gmap){
	var Edifici = (function(){

		//Constructor function
		function Edifici(map, options){
			this.serverHost =  options.serverHost;
			this.styleType = options.styleType;
      this.map = map;
		}

		Edifici.prototype = {

		addMilitars: function(){
			this.addCastells();
			this.addEpocaCarlina();
			this.addMuralles();
			this.addTorres();
		},

		addCivils: function(){
			this.addCasaForta();
			this.addPalau();
			this.addPont();
			this.addTorreColomer();
		},

		addReligioses: function(){
			this.addBasilica();
			this.addCatedral();
			this.addErmita();
			this.addEsglesia();
			this.addEsglesiaFortificada();
			this.addMonestir();
		},

		/** Militars */
		addCastells: function(){
			var categoria = 'castell';
			var icon = this._getIcon('militar',categoria);
			this._addEdifici(1, aCastells, categoria, icon);
		},

		addEpocaCarlina: function(){
			var categoria = 'epoca-carlina';
			var icon = this._getIcon('militar',categoria);

			this._addEdifici(2, aEpocaCarlina, categoria, icon);
		},

		addMuralles: function(){
			var categoria = 'muralles';
			var icon = this._getIcon('militar',categoria);

			this._addEdifici(3, aMuralles, categoria, icon);
		},

		addTorres: function(){
			var categoria = 'torre';
			var icon = this._getIcon('militar', categoria);

			this._addEdifici(4, aTorres, categoria, icon);
		},

		/** Civils */
		addCasaForta: function(){
			var categoria = 'casa-forta';
			var icon = this._getIcon('civil', categoria);

			this._addEdifici(5, aCasaForta, categoria, icon);
		},

		addPalau: function(){
			var categoria = 'palau';
			var icon = this._getIcon('civil', categoria);

			this._addEdifici(6, aPalau, categoria, icon);
		},

		addPont: function(){
			var categoria = 'pont';
			var icon = this._getIcon('civil', categoria);

			this._addEdifici(7, aPont, categoria, icon);
		},

		addTorreColomer : function(){
			var categoria = 'torre-colomer';
			var icon = this._getIcon('civil', categoria);

			this._addEdifici(8, aTorreColomer, categoria, icon);
		},

		/** Religios */
		addBasilica : function(){
			var categoria = 'basilica';
			var icon = this._getIcon('religios', categoria)
			this._addEdifici(9, aBasilica, categoria, icon);
		},

		addCatedral : function(){
			var categoria = 'catedral';
			var icon = this._getIcon('religios', categoria)
			this._addEdifici(9, aCatedral, categoria, icon);
		},

		addErmita : function(){
			var categoria = 'ermita';
			var icon = this._getIcon('religios', categoria);
			this._addEdifici(10, aErmitaCapella, categoria, icon);
		},

		addEsglesia : function(){
			var categoria = 'esglesia';
			var icon = this._getIcon('religios', categoria);
			this._addEdifici(11, aEsglesia, categoria, icon);
		},

		addEsglesiaFortificada : function(){
			var categoria = 'esglesia-fortificada';
			var icon = this._getIcon('religios', categoria);

			this._addEdifici(11, aEsglesiaFortificada, categoria, icon);
		},

		addMonestir : function(){
			var categoria = 'monestir';
			var icon = this._getIcon('religios', categoria);

			this._addEdifici(12, aMonestir, categoria, icon);
		},

		_getIcon: function(tipus, categoria){
			return this.serverHost+'images/gmap/'+tipus+'/'+categoria+'/'+categoria+this.styleType+'.png';
		},

		_extract: function(edifici, categoria, x, icon){
			return {
			id: categoria+x,
			lat: Number(edifici.position.lat),
			lng: Number(edifici.position.lng),
			visible: true,
			content: this._createContent(edifici.title, edifici.link, edifici.thumbs, edifici.municipi, edifici.poblacio, edifici.provincia),
			icon: icon,
			categoria: categoria
			};
		},

		_createContent: function(title, link, thumbs, municipi, poblacio, provincia){
			var content = "";

			content += "<div class='infoWindowz' >";
			content += "<a href="+link+" >";
			content += "<div class='edifici_tile-header-titles'>";
          	content += "<h3>"+title+"</h3>";
          	content += "<div class='infowindow_text'>";
            content += "<h2> municipi: "+municipi+" </h2>";
            content += "<h2> poblacio: "+poblacio+" </h2>";
            content += "<h2> provincia: "+provincia+"</h2>";
            content += "</div>";
            content += "<img src="+thumbs+" >";
        	content += "</div>";
        	content += "</a>";
			content += "</div>";

			return content;

		},

		_addEdifici : function(id, arrayName, categoria, icon){

			for(var x =0; x < arrayName.length; x ++){

				opt = this._extract(arrayName[x], categoria , x, icon);
				this.map.addMarker(opt);
			}

			this.map.addIcon({
				id: id,
				visible: true,
				title: categoria,
				categoria: categoria,
				icon: icon
			});

		},

    getMap: function(){
      return this.map;
    },

		print : function(){
			console.log('print!');
		}

		};
		return Edifici;
	}());

	//Factory Method
	Edifici.create = function(mapName, opts){
		return new Edifici(mapName, opts);
	};

	window.Edifici = Edifici;

}(window, window.gmap ));
