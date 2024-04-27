class Edifici {

    //Constructor function
    constructor(gmap, options) {
        this.serverHost = options.serverHost;
        this.styleType1 = options.styleType1;
        this.styleType2 = options.styleType2;
        this.gMap = gmap;
    }


    addMilitars() {
        this.addCastells();
        this.addEpocaCarlina();
        this.addMuralles();
        this.addTorres();
    }

    addCivils() {
        this.addCasaForta();
        this.addPalau();
        this.addPont();
        this.addTorreColomer();
    }

    addReligioses() {
        this.addBasilica();
        this.addCatedral();
        this.addErmita();
        this.addEsglesia();
        this.addEsglesiaFortificada();
        this.addMonestir();
    }

    addAltres() {
        this.addAltresLlocsInteres();
    }

    /** Militars */
    addCastells() {
        var type = 'militar';
        var category = 'castell';
        var categoryName = 'Castells'
        this._addEdifici(1, aCastells, category, categoryName, type);
    }

    addEpocaCarlina() {
        var type = 'militar';
        var category = 'epoca-carlina';
        var categoryName = 'Època Carlina';
        this._addEdifici(2, aEpocaCarlina, category, categoryName, type);
    }

    addMuralles() {
        var type = 'militar';
        var category = 'muralles';
        var categoryName = 'Muralles';
        this._addEdifici(3, aMuralles, category, categoryName, type);
    }

    addTorres() {
        var type = 'militar';
        var category = 'torre';
        var categoryName = 'Torres';
        this._addEdifici(4, aTorres, category, categoryName, type);
    }

    /** Civils */
    addCasaForta() {
        var type = 'civil';
        var category = 'casa-forta';
        var categoryName = 'Cases Fortes';
        this._addEdifici(5, aCasaForta, category, categoryName, type);
    }

    addPalau() {
        var type = 'civil';
        var category = 'palau';
        var categoryName = 'Palaus';
        this._addEdifici(6, aPalau, category, categoryName, type);
    }

    addPont() {
        var type = 'civil';
        var category = 'pont';
        var categoryName = 'Ponts';
        this._addEdifici(7, aPont, category, categoryName, type);
    }

    addTorreColomer() {
        var type = 'civil';
        var category = 'torre-colomer'
        var categoryName = 'Torres Colomer';
        this._addEdifici(8, aTorreColomer, category, categoryName, type);
    }

    /** Religios */
    addBasilica() {
        var type = 'religios';
        var category = 'basilica';
        var categoryName = 'Basíliques';
        this._addEdifici(9, aBasilica, category, categoryName, type);
    }

    addCatedral() {
        var type = 'religios';
        var category = 'catedral';
        var categoryName = 'Catedrals'
        this._addEdifici(10, aCatedral, category, categoryName, type);
    }

    addErmita() {
        var type = 'religios';
        var category = 'ermita';
        var categoryName = 'Ermites';
        this._addEdifici(11, aErmita, category, categoryName, type);
    }

    addEsglesia() {
        var type = 'religios';
        var category = 'esglesia';
        var categoryName = 'Esglésies';
        this._addEdifici(12, aEsglesia, category, categoryName, type);
    }

    addEsglesiaFortificada() {
        var type = 'religios';
        var category = 'esglesia-fortificada';
        var categoryName = 'Esglésies fortificades'
        this._addEdifici(13, aEsglesiaFortificada, category, categoryName, type);
    }

    addMonestir() {
        var type = 'religios';
        var category = 'monestir';
        var categoryName = "Monestirs";
        this._addEdifici(14, aMonestir, category, categoryName, type);
    }

    addAltresLlocsInteres() {
        var type = 'altres';
        var category = 'altres-llocs-dinteres';
        var categoryName = 'Altres llocs d\'Interés'
        this._addEdifici(15, aAltres, category, categoryName, type);
    }

    /**
     * Icona 1
     */
    _getIcon1(type, category) {
        return this.serverHost + '/assets/images/catalunya-gmap/gmap/' + type + '/' + category + '/' + category + this.styleType1 + '.png';
    }

    /**
     * Icona 2
     */
    _getIcon2(type, category) {
        return this.serverHost + '/assets/images/catalunya-gmap/gmap/' + type + '/' + category + '/' + category + this.styleType2 + '.png';
    }

    _extract(edifici, category, categoryName, x, type) {

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
    }

    _createContent(title, link, thumbs, municipi, poblacio, provincia, type) {
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

    }

    _addEdifici(id, arrayName, category, categoryName, type) {

        if (arrayName.length > 0) {
            for (var x = 0; x < arrayName.length; x++) {
                var opt = this._extract(arrayName[x], category, categoryName, x, type);
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
        }

    }

}

export default Edifici;
