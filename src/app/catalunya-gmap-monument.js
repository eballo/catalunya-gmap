import MapManager from "./catalunya-gmap-manager";

class MonumentBuilder {

    constructor(mapId) {
        this.mapManager = new MapManager(mapId);
        this.map = null;

        this.styleType1 = 7;
        this.styleType2 = 6;
        this.serverHost = process.env.SERVER_HOST;
    }

    async create() {
        this.map = await this.mapManager.initMap(); // fetchData() must return a promise
        this.addMilitars();
        this.addReligioses();
        this.addCivils();
        this.addAltresLlocsInteres();

        this.mapManager._resize();
        return this.mapManager;
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
        const type = 'militar';
        const category = 'castell';
        const categoryName = 'Castells';
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

    _getIcon(type, category, styleType) {
        return this.serverHost + 'assets/images/catalunya-gmap/gmap/' + type + '/' + category + '/' + category + styleType + '.png';
    }

    _capitalize(word) {
        const loweredCase = word.toLowerCase();
        return word[0].toUpperCase() + loweredCase.slice(1);
    }

    _createContent(title, link, thumbs, municipi, poblacio, provincia, type, category, categoryName) {

        let icon = this._getIcon(type, category, this.styleType1)
        let address = ""
        if (municipi || poblacio || provincia) {
            if (municipi) {
                address += municipi + ", ";
            }
            if (poblacio) {
                address += poblacio + ", ";
            }

            // Override in the case that we have Barcelona, Barcelona to only Barcelona
            if (municipi === poblacio) {
                address = municipi + ", ";
            }

            if (provincia) {
                address += provincia;
            }

            // Override in the case that we have Barcelona, Barcelona, Barcelona to only Barcelona
            if (municipi === poblacio && poblacio === provincia) {
                address = municipi;
            }
        }

        thumbs = "<img alt='The Museum of Modern Art' src='https://files.elfsightcdn.com/86d592a4-fc00-4d16-9b84-0566a28d5645/423cf9be-c155-4209-8f60-75ae45d9bcec/moma_renovation_and_expansion--1-.jpg'>"

        let content = "";
        content += "<div class='catmed-google-maps-marker'>"
        content += "    <div class='catmed-google-maps-marker-close' >"
        content += "        <svg width='8' height='8' viewBox='0 0 14 14'>"
        content += "            <path transform='translate(-18 -13)' d='M32 14.4L30.6 13 25 18.6 19.4 13 18 14.4l5.6 5.6-5.6 5.6 1.4 1.4 5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z'></path>"
        content += "        </svg>"
        content += "    </div>"
        content += "    <div class='catmed-google-maps-marker-header'>"
        content += "            <div class='catmed-google-maps-marker-image'>" + thumbs + "</div>"
        content += "    </div>"
        content += "    <div class='catmed-google-maps-marker-title-wrapper " + type + "'>"
        content += "            <a class='catmed-google-maps-marker-link-image' href='" + link + "' > "
        //content += "                <span class='catmed-google-maps-building-icon'><img class='catmed-google-maps-building-icon-img' src='" + icon+ "' alt='"+category + "-" + type + "'></span>"
        content += "                <span class='catmed-google-maps-marker-title'>" + title + "</span>"
        content += "            </a>"
        content += "        <div class='catmed-google-maps-marker-directions'>"
        content += "            <a class='catmed-google-maps-marker-directions-button' href='https://www.google.com/maps/dir/?api=1&amp;destination=40.7614327, -73.97762159999999' target='_blank' rel='nofollow'>"
        content += "                <span class='catmed-google-maps-marker-directions-label'>Ruta</span>"
        content += "                <span class='catmed-google-maps-marker-directions-icon'>"
        content += "                    <svg width='20px' height='20px' viewBox='0 0 510 510'>"
        content += "                        <g>"
        content += "                            <g id='directions'>"
        content += "                                 <path d='M502.35,237.149l-229.5-229.5l0,0c-10.199-10.2-25.5-10.2-35.7,0l-229.5,229.5c-10.2,10.2-10.2,25.501,0,35.7l229.5,229.5"
        content += "                                l0,0c10.2,10.2,25.501,10.2,35.7,0l229.5-229.5C512.55,262.65,512.55,247.35,502.35,237.149z M306,318.75V255H204v76.5h-51v-102"
        content += "                                    c0-15.3,10.2-25.5,25.5-25.5H306v-63.75l89.25,89.25L306,318.75z'></path>"
        content += "                            </g>"
        content += "                         </g>"
        content += "                     </svg>"
        content += "                 </span>"
        content += "              </a>"
        content += "          </div>"
        content += "    </div>"
        content += "    <div class='catmed-google-maps-marker-content'>"
        content += "        <div class='catmed-google-maps-marker-info'>"
        content += "            <div class='catmed-google-maps-marker-info-item-building-icon catmed-google-maps-marker-info-item'>"
        content += "                <span class='catmed-google-maps-marker-info-item-text'>" + categoryName + " - " + this._capitalize(type) + "</span>"
        content += "            </div>"
        content += "            <div class='catmed-google-maps-marker-info-item-address catmed-google-maps-marker-info-item'>"
        content += "                <div class='catmed-google-maps-marker-info-item-icon-wrapper'>"
        content += "                    <svg class='catmed-google-maps-marker-info-item-icon' width='12px' height='12px' viewBox='0 0 510 510'>"
        content += "                        <path d='M255,0C155.55,0,76.5,79.05,76.5,178.5C76.5,311.1,255,510,255,510s178.5-198.9,178.5-331.5C433.5,79.05,354.45,0,255,0zM255,242.25c-35.7,0-63.75-28.05-63.75-63.75s28.05-63.75,63.75-63.75s63.75,28.05,63.75,63.75S290.7,242.25,255,242.25z'></path>"
        content += "                    </svg>"
        content += "                </div>"
        content += "                <span class='catmed-google-maps-marker-info-item-text'>" + address + "</span>"
        content += "            </div>"
        content += "        </div>"
        content += "    </div>"
        content += "</div>"

        return content;

    }

    _extract(edifici, category, categoryName, x, type) {

        return {
            id: category + x,
            title: edifici.title,
            link: edifici.link,
            type: type, //(militar,civil, religios)
            lat: parseFloat(edifici.position.lat),
            lng: parseFloat(edifici.position.long),
            visible: true,
            content: this._createContent(edifici.title, edifici.link, edifici.thumbs, edifici.municipi, edifici.poblacio, edifici.provincia, type, category, categoryName),
            icon: this._getIcon(type, category, this.styleType1),
            icon2: this._getIcon(type, category, this.styleType2),
            category: category, // (building type Slug-Name)
            categoryName: categoryName
        };
    }

    _addEdifici(id, arrayName, category, categoryName, type) {

        if (arrayName.length > 0) {

            //Add Marker to the Map
            arrayName.forEach((building, index) => {
                const opt = this._extract(building, category, categoryName, index, type);
                this.mapManager.addMarker(opt);
            })

            //Add Icon related to the map to the map menu
            const icon = this._getIcon(type, category, this.styleType1);
            this.mapManager.addIcon({
                id: id,
                visible: true,
                title: categoryName,
                category: category,
                icon: icon
            });
        }

    }

}

export default MonumentBuilder;