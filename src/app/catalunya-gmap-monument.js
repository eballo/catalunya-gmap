import MapManager from "./catalunya-gmap-manager";
import {stringToBoolean} from "./catalunya-gmap-extra";

// One entry per building type — replaces the 15 hardcoded addXxx() methods.
const BUILDING_TYPES = [
    { category: 'castell',               categoryName: 'Castells',               type: 'militar'  },
    { category: 'epoca-carlina',         categoryName: "Època Carlina",          type: 'militar'  },
    { category: 'muralles',              categoryName: 'Muralles',               type: 'militar'  },
    { category: 'torre',                 categoryName: 'Torres',                 type: 'militar'  },
    { category: 'casa-forta',            categoryName: 'Cases Fortes',           type: 'civil'    },
    { category: 'palau',                 categoryName: 'Palaus',                 type: 'civil'    },
    { category: 'pont',                  categoryName: 'Ponts',                  type: 'civil'    },
    { category: 'torre-colomer',         categoryName: 'Torres Colomer',         type: 'civil'    },
    { category: 'basilica',              categoryName: 'Basíliques',             type: 'religios' },
    { category: 'catedral',              categoryName: 'Catedrals',              type: 'religios' },
    { category: 'ermita',                categoryName: 'Ermites',                type: 'religios' },
    { category: 'esglesia',              categoryName: 'Esglésies',              type: 'religios' },
    { category: 'esglesia-fortificada',  categoryName: 'Esglésies fortificades', type: 'religios' },
    { category: 'monestir',              categoryName: 'Monestirs',              type: 'religios' },
    { category: 'altres-llocs-dinteres', categoryName: "Altres llocs d'Interés", type: 'altres'  },
];

class MonumentBuilder {

    constructor(mapId) {
        this.mapManager = new MapManager(mapId);
        this.map = null;

        this.styleType1 = 7;
        this.styleType2 = 6;
        const _cfg = (typeof catalunyaGmapConfig !== 'undefined') ? catalunyaGmapConfig : {};
        this.serverHost     = _cfg.serverHost     || process.env.SERVER_HOST;
        this.markersJsonUrl = _cfg.markersJsonUrl || '';
        this.userPosition   = stringToBoolean(_cfg.userPosition || process.env.USER_POSITION);
    }

    async create() {
        this.map = await this.mapManager.initMap();

        const markers = await this._loadMarkers();

        const byType = markers.reduce((acc, m) => {
            const key = m.tipus || '';
            (acc[key] = acc[key] || []).push(m);
            return acc;
        }, {});

        BUILDING_TYPES.forEach((def, idx) => {
            const list = byType[def.category] || [];
            if (list.length > 0) {
                this._addEdificiList(idx + 1, list, def.category, def.categoryName, def.type);
            }
        });

        this.mapManager.addAllMarkersToCluster();
        return this.mapManager;
    }

    async _loadMarkers() {
        const inlineEl = document.getElementById('cm-edificis-data');
        if (inlineEl) {
            try { return JSON.parse(inlineEl.textContent); } catch (e) {
                console.error('cm-edificis-data JSON invalid', e);
            }
        }

        if (this.markersJsonUrl) {
            const r = await fetch(this.markersJsonUrl);
            return r.json();
        }

        return [];
    }

    _addEdificiList(id, list, category, categoryName, type) {
        list.forEach((building, index) => {
            const opt = this._extract(building, category, categoryName, index, type);
            this.mapManager.addMarker(opt);
        });

        const icon = this._getIcon(type, category, this.styleType1);
        this.mapManager.addIcon({ id, visible: true, title: categoryName, category, icon });
    }

    _getIcon(type, category, styleType) {
        return this.serverHost + 'images/' + type + '/' + category + '/' + category + styleType + '.png';
    }

    _capitalize(word) {
        const loweredCase = word.toLowerCase();
        return word[0].toUpperCase() + loweredCase.slice(1);
    }

    _createContent(title, link, thumbs, municipi, comarca, provincia, type, category, categoryName) {
        const parts = [];
        if (municipi) parts.push(municipi);
        if (comarca && comarca !== municipi) parts.push(comarca);
        if (provincia) parts.push(provincia);
        const address = parts.join(', ');

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
        content += "                <span class='catmed-google-maps-marker-title'>" + title + "</span>"
        content += "            </a>"
        content += this._add_ruta();
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

    _add_ruta() {
        let ruta = ""
        if (this.userPosition) {
            ruta = "        <div class='catmed-google-maps-marker-directions'>"
            ruta += "            <a class='catmed-google-maps-marker-directions-button' href='https://www.google.com/maps/dir/?api=1&amp;destination=40.7614327, -73.97762159999999' target='_blank' rel='nofollow'>"
            ruta += "                <span class='catmed-google-maps-marker-directions-label'>Ruta</span>"
            ruta += "                <span class='catmed-google-maps-marker-directions-icon'>"
            ruta += "                    <svg width='20px' height='20px' viewBox='0 0 510 510'>"
            ruta += "                        <g>"
            ruta += "                            <g id='directions'>"
            ruta += "                                 <path d='M502.35,237.149l-229.5-229.5l0,0c-10.199-10.2-25.5-10.2-35.7,0l-229.5,229.5c-10.2,10.2-10.2,25.501,0,35.7l229.5,229.5"
            ruta += "                                l0,0c10.2,10.2,25.501,10.2,35.7,0l229.5-229.5C512.55,262.65,512.55,247.35,502.35,237.149z M306,318.75V255H204v76.5h-51v-102"
            ruta += "                                    c0-15.3,10.2-25.5,25.5-25.5H306v-63.75l89.25,89.25L306,318.75z'></path>"
            ruta += "                            </g>"
            ruta += "                         </g>"
            ruta += "                     </svg>"
            ruta += "                 </span>"
            ruta += "              </a>"
            ruta += "          </div>"
        }
        return ruta;
    }

    _extract(edifici, category, categoryName, x, type) {
        const thumbsHtml = edifici.img ? '<img src="' + edifici.img + '" alt="' + edifici.title + '">' : '';
        const municipi  = edifici.municipi  || '';
        const comarca   = edifici.comarca   || '';
        const provincia = edifici.provincia || '';

        return {
            id: category + x,
            title: edifici.title,
            link: edifici.link,
            type,
            lat:  edifici.lat,
            lng:  edifici.lng,
            visible: true,
            content: this._createContent(edifici.title, edifici.link, thumbsHtml, municipi, comarca, provincia, type, category, categoryName),
            icon:  this._getIcon(type, category, this.styleType1),
            icon2: this._getIcon(type, category, this.styleType2),
            category,
            categoryName
        };
    }

}

export default MonumentBuilder;
