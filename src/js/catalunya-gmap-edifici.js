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
                var categoryName = 'Castells'
                this._addEdifici(1, aCastells, category, categoryName, type);
            },

            addEpocaCarlina: function() {
                var type = 'militar';
                var category = 'epoca-carlina';
                var categoryName = 'Època Carlina';
                this._addEdifici(2, aEpocaCarlina, category, categoryName, type);
            },

            addMuralles: function() {
                var type = 'militar';
                var category = 'muralles';
                var categoryName = 'Muralles';
                this._addEdifici(3, aMuralles, category, categoryName, type);
            },

            addTorres: function() {
                var type = 'militar';
                var category = 'torre';
                var categoryName = 'Torres';
                this._addEdifici(4, aTorres, category, categoryName, type);
            },

            /** Civils */
            addCasaForta: function() {
                var type = 'civil';
                var category = 'casa-forta';
                var categoryName = 'Cases Fortes';
                this._addEdifici(5, aCasaForta, category, categoryName, type);
            },

            addPalau: function() {
                var type = 'civil';
                var category = 'palau';
                var categoryName = 'Palaus';
                this._addEdifici(6, aPalau, category, categoryName, type);
            },

            addPont: function() {
                var type = 'civil';
                var category = 'pont';
                var categoryName = 'Ponts';
                this._addEdifici(7, aPont, category, categoryName, type);
            },

            addTorreColomer: function() {
                var type = 'civil';
                var category = 'torre-colomer'
                var categoryName = 'Torres Colomer';
                this._addEdifici(8, aTorreColomer, category, categoryName, type);
            },

            /** Religios */
            addBasilica: function() {
                var type = 'religios';
                var category = 'basilica';
                var categoryName = 'Basíliques';
                this._addEdifici(9, aBasilica, category, categoryName, type);
            },

            addCatedral: function() {
                var type = 'religios';
                var category = 'catedral';
                var categoryName = 'Catedrals'
                this._addEdifici(10, aCatedral, category, categoryName, type);
            },

            addErmita: function() {
                var type = 'religios';
                var category = 'ermita';
                var categoryName = 'Ermites';
                this._addEdifici(11, aErmita, category, categoryName, type);
            },

            addEsglesia: function() {
                var type = 'religios';
                var category = 'esglesia';
                var categoryName = 'Esglésies';
                this._addEdifici(12, aEsglesia, category, categoryName, type);
            },

            addEsglesiaFortificada: function() {
                var type = 'religios';
                var category = 'esglesia-fortificada';
                var categoryName = 'Esglésies fortificades'
                this._addEdifici(13, aEsglesiaFortificada, category, categoryName, type);
            },

            addMonestir: function() {
                var type = 'religios';
                var category = 'monestir';
                var categoryName = "Monestirs";
                this._addEdifici(14, aMonestir, category, categoryName, type);
            },

            addAltresLlocsInteres: function() {
                var type = 'altres';
                var category = 'altres-llocs-dinteres';
                var categoryName = 'Altres llocs d\'Interés'
                this._addEdifici(15, aAltres, category, categoryName, type);
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

            _extract: function(edifici, category, categoryName, x, type) {

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
                    category: category, //(tipus edificacio Slug-Name)
                    categoryName: categoryName
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

            _addEdifici: function(id, arrayName, category, categoryName, type) {

                for (var x = 0; x < arrayName.length; x++) {

                    opt = this._extract(arrayName[x], category, categoryName, x, type);
                    this.gMap.addMarker(opt);
                }
                var icon = this._getIcon1(type, category);
                this.gMap.addIcon({
                    id: id,
                    visible: true,
                    title: categoryName,
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
