(function(window, gmap) {
    var Edifici = (function() {

        //Constructor function
        function Edifici(map, options) {
            this.serverHost = options.serverHost;
            this.styleType = options.styleType;
            this.map = map;
        }

        Edifici.prototype = {

            addMilitars: function() {
                this.addCastells();
                this.addEpocaCarlina();
                this.addMuralles();
                this.addTorres();
            },

            addCivils: function() {
                this.addCasaForta();
                this.addPalau();
                this.addPont();
                this.addTorreColomer();
            },

            addReligioses: function() {
                this.addBasilica();
                this.addCatedral();
                this.addErmita();
                this.addEsglesia();
                this.addEsglesiaFortificada();
                this.addMonestir();
            },

            addAltres: function() {
                this.addAltresLlocsInteres();
            },

            /** Militars */
            addCastells: function() {
                var type = 'militar';
                var categoria = 'castell';
                var icon = this._getIcon(type, categoria);
                this._addEdifici(1, aCastells, categoria, icon, type);
            },

            addEpocaCarlina: function() {
                var type = 'militar';
                var categoria = 'epoca-carlina';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(2, aEpocaCarlina, categoria, icon, type);
            },

            addMuralles: function() {
                var type = 'militar';
                var categoria = 'muralles';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(3, aMuralles, categoria, icon, type);
            },

            addTorres: function() {
                var type = 'militar';
                var categoria = 'torre';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(4, aTorres, categoria, icon, type);
            },

            /** Civils */
            addCasaForta: function() {
                var type = 'civil';
                var categoria = 'casa-forta';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(5, aCasaForta, categoria, icon, type);
            },

            addPalau: function() {
                var type = 'civil';
                var categoria = 'palau';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(6, aPalau, categoria, icon, type);
            },

            addPont: function() {
                var type = 'civil';
                var categoria = 'pont';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(7, aPont, categoria, icon, type);
            },

            addTorreColomer: function() {
                var type = 'civil';
                var categoria = 'torre-colomer';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(8, aTorreColomer, categoria, icon, type);
            },

            /** Religios */
            addBasilica: function() {
                var type = 'religios';
                var categoria = 'basilica';
                var icon = this._getIcon(type, categoria)
                this._addEdifici(9, aBasilica, categoria, icon, type);
            },

            addCatedral: function() {
                var type = 'religios';
                var categoria = 'catedral';
                var icon = this._getIcon(type, categoria)
                this._addEdifici(10, aCatedral, categoria, icon, type);
            },

            addErmita: function() {
                var type = 'religios';
                var categoria = 'ermita';
                var icon = this._getIcon(type, categoria);
                this._addEdifici(11, aErmita, categoria, icon, type);
            },

            addEsglesia: function() {
                var type = 'religios';
                var categoria = 'esglesia';
                var icon = this._getIcon(type, categoria);
                this._addEdifici(12, aEsglesia, categoria, icon, type);
            },

            addEsglesiaFortificada: function() {
                var type = 'religios';
                var categoria = 'esglesia-fortificada';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(13, aEsglesiaFortificada, categoria, icon, type);
            },

            addMonestir: function() {
                var type = 'religios';
                var categoria = 'monestir';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(14, aMonestir, categoria, icon, type);
            },

            addAltresLlocsInteres: function() {
                var type = 'altres';
                var categoria = 'altres-llocs-dinteres';
                var icon = this._getIcon(type, categoria);

                this._addEdifici(15, aAltres, categoria, icon, type);
            },

            _getIcon: function(tipus, categoria) {
                return this.serverHost + 'images/gmap/' + tipus + '/' + categoria + '/' + categoria + this.styleType + '.png';
            },

            _extract: function(edifici, categoria, x, icon, type) {
                return {
                    id: categoria + x,
                    lat: Number(edifici.position.lat),
                    lng: Number(edifici.position.long),
                    visible: true,
                    content: this._createContent(edifici.title, edifici.link, edifici.thumbs, edifici.municipi, edifici.poblacio, edifici.provincia, type),
                    icon: icon,
                    categoria: categoria
                };
            },

            _createContent: function(title, link, thumbs, municipi, poblacio, provincia, type) {
                var content = "";

                content += "<div class='infoWindowz' >";
                content += "<a href=" + link + " >";
                content += thumbs;
                content += "<div class='edifici_tile-header-titles'>";
                content += "<h3 class=" + type + ">" + title + "</h3>";
                if (municipi || poblacio || provincia) {
                    content += "<div class='infowindow_text'>";
                    if (municipi) {
                        content += municipi + ", ";
                    }
                    if (poblacio) {
                        content += poblacio + ", ";
                    }
                    if (provincia) {
                        content += provincia;
                    }
                    content += "</div>";
                }
                content += "</div>";
                content += "</a>";
                content += "</div>";

                return content;

            },

            _addEdifici: function(id, arrayName, categoria, icon, type) {

                for (var x = 0; x < arrayName.length; x++) {

                    opt = this._extract(arrayName[x], categoria, x, icon, type);
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

            getMap: function() {
                return this.map;
            },

            print: function() {
                console.log('print!');
            }

        };
        return Edifici;
    }());

    //Factory Method
    Edifici.create = function(mapName, opts) {
        return new Edifici(mapName, opts);
    };

    window.Edifici = Edifici;

}(window, window.gmap));
