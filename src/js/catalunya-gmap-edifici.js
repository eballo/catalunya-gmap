(function(window, gmap) {
    var Edifici = (function() {

        //Constructor function
        function Edifici(map, options) {
            this.serverHost = options.serverHost;
            this.styleType1 = options.styleType1;
            this.styleType2 = options.styleType2;
            this.gMap = map;
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
                var category = 'castell';
                this._addEdifici(1, aCastells, category, type);
            },

            addEpocaCarlina: function() {
                var type = 'militar';
                var category = 'epoca-carlina';
                this._addEdifici(2, aEpocaCarlina, category, type);
            },

            addMuralles: function() {
                var type = 'militar';
                var category = 'muralles';
                this._addEdifici(3, aMuralles, category, type);
            },

            addTorres: function() {
                var type = 'militar';
                var category = 'torre';
                this._addEdifici(4, aTorres, category, type);
            },

            /** Civils */
            addCasaForta: function() {
                var type = 'civil';
                var category = 'casa-forta';
                this._addEdifici(5, aCasaForta, category, type);
            },

            addPalau: function() {
                var type = 'civil';
                var category = 'palau';
                this._addEdifici(6, aPalau, category, type);
            },

            addPont: function() {
                var type = 'civil';
                var category = 'pont';
                this._addEdifici(7, aPont, category, type);
            },

            addTorreColomer: function() {
                var type = 'civil';
                var category = 'torre-colomer';
                this._addEdifici(8, aTorreColomer, category, type);
            },

            /** Religios */
            addBasilica: function() {
                var type = 'religios';
                var category = 'basilica';
                this._addEdifici(9, aBasilica, category, type);
            },

            addCatedral: function() {
                var type = 'religios';
                var category = 'catedral';
                this._addEdifici(10, aCatedral, category, type);
            },

            addErmita: function() {
                var type = 'religios';
                var category = 'ermita';
                this._addEdifici(11, aErmita, category, type);
            },

            addEsglesia: function() {
                var type = 'religios';
                var category = 'esglesia';
                this._addEdifici(12, aEsglesia, category, type);
            },

            addEsglesiaFortificada: function() {
                var type = 'religios';
                var category = 'esglesia-fortificada';
                this._addEdifici(13, aEsglesiaFortificada, category, type);
            },

            addMonestir: function() {
                var type = 'religios';
                var category = 'monestir';
                this._addEdifici(14, aMonestir, category, type);
            },

            addAltresLlocsInteres: function() {
                var type = 'altres';
                var category = 'altres-llocs-dinteres';
                this._addEdifici(15, aAltres, category, type);
            },
            /**
             * Icona 1
             */
            _getIcon1: function(type, category) {
                return this.serverHost + '/assets/images/gmap/' + type + '/' + category + '/' + category + this.styleType1 + '.png';
            },
            /**
             * Icona 2
             */
            _getIcon2: function(type, category) {
                return this.serverHost + '/assets/images/gmap/' + type + '/' + category + '/' + category + this.styleType2 + '.png';
            },

            _extract: function(edifici, category, x, type) {

                return {
                    id: category + x,
                    title: edifici.title,
                    link: edifici.link,
                    type: type, //(militar,civil,religios)
                    lat: Number(edifici.position.lat),
                    lng: Number(edifici.position.long),
                    visible: true,
                    content: this._createContent(edifici.title, edifici.link, edifici.thumbs, edifici.municipi, edifici.poblacio, edifici.provincia, type),
                    icon: this._getIcon1(type, category),
                    icon2: this._getIcon2(type, category),
                    category: category //(tipus edificacio)
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

            _addEdifici: function(id, arrayName, category, type) {

                for (var x = 0; x < arrayName.length; x++) {

                    opt = this._extract(arrayName[x], category, x, type);
                    this.gMap.addMarker(opt);
                }
                var icon = this._getIcon1(type, category);
                this.gMap.addIcon({
                    id: id,
                    visible: true,
                    title: category,
                    category: category,
                    icon: icon
                });

            },

            getMap: function() {
                return this.gMap;
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
