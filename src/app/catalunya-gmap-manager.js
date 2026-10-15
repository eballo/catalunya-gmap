import {setOptions, importLibrary} from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {CATALUNYA_POSITION, STYLES, STYLES_DARK} from "./catalunya-gmap-styles";
import {stringToBoolean, fetchMapData} from "./catalunya-gmap-extra";

// Zoom used to show a single point (one marker, or a fit whose bounds have no
// area): fitBounds() would otherwise go all the way to maxZoom.
const SINGLE_POINT_ZOOM = 16;

// «Localitza'm»: never zoomed out of a closer view, and a fix a minute old is
// good enough to centre a map. Same values as catalunya-omap.
const LOCATE_ZOOM = 13;
const LOCATE_OPTIONS = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };
const LOCATE_MESSAGE_MS = 5000;

// Same breakpoint as the Catalunya Medieval theme's phone layout.
const PHONE_QUERY = '(max-width: 600px)';

// The map of a page about one building (selectMarker() was called). On a
// phone its CSS folds the category buttons behind the «Capes» button.
const ENTRY_MAP_CLASS = 'cm-gmap--entry';

// Any map whose host asked for foldLayers: the category buttons are folded
// behind «Capes», and the host's own legend toggles the four groups
// (setGroupVisible()). The second class is toggled by the «Capes» button.
const FOLDED_CLASS = 'cm-gmap--folded';
const LAYERS_OPEN_CLASS = 'cm-gmap--layers-open';
// Fired on document after a group is switched, so a legend outside the map
// can show which groups are on (catalunya-omap fires cm-omap:groups-changed).
export const GROUPS_CHANGED_EVENT = 'cm-gmap:groups-changed';

export default class MapManager {
    constructor(mapId) {

        const _cfg = (typeof catalunyaGmapConfig !== 'undefined') ? catalunyaGmapConfig : {};
        this.debug = stringToBoolean(_cfg.debug || process.env.DEBUG);

        // v2 functional API: setOptions() is a page-global call (must run before any
        // importLibrary()), replacing the old per-instance `new Loader({...})`. Libraries are
        // no longer preloaded via a constructor option — each is requested individually via
        // importLibrary() in initMap(), same as before.
        setOptions({
            key: _cfg.apiKey || process.env.GOOGLE_MAPS_API_KEY,
            v: "weekly",
        });

        // libraries that we are loading
        this.google = null;
        this.marker = null;
        this.core = null;

        // to keep track with initial values — can be pre-set via config
        this.ListTextEnabled = _cfg.listEnabled !== undefined ? Boolean(_cfg.listEnabled) : false;
        this.visibleBuildings = true;
        this.useMarkerCluster = stringToBoolean(_cfg.useMarkerCluster || process.env.USE_MARKER_CLUSTER);
        this.infowindow = null;

        this.arrayCategoriesText = [];  // List categories text that we use to display in the side
        this.icons = [];                // List of icons

        this.mapId = mapId;             // The mapId
        this.map = null;                // The created map
        this.markers = [];              // All the markers
        this.clusterer = null;          // custer elements
        this.iconsControl = null;       // Container of the show/hide icons (top right)

        this.serverHost = _cfg.serverHost || process.env.SERVER_HOST;
        this.secondaryDivId = _cfg.secondaryDivId || 'secondaryDiv';
        this.listId = _cfg.listId || 'map-list';
        // Opt-in, as in catalunya-omap: the host page decides, because its
        // Permissions-Policy has to allow geolocation there too or the
        // browser refuses without asking.
        this.locateButton = _cfg.locateButton === true;
        this.foldLayers = _cfg.foldLayers === true;
        // Opt-in: a visible way into the search that lives in the side list.
        this.searchButton = _cfg.searchButton === true;

        // Last fit/focus, replayed by resize() when it ran while the map was
        // hidden (zero size), where Google can only compute a wrong zoom.
        this._pendingFit = null;
        this._fitWhileHidden = false;
        this.comarcaBoundariesLayer = null;
        this._userLocationMarker = null;
        this._userLocationAccuracyCircle = null;
        this._searchRadiusCircle = null;
    }

    /**
     * Initialise the map with all the buildings and Icons
     * @returns {Promise<Map>}
     */
    async initMap() {
        try {

            const [google, marker, core] = await Promise.all([
                importLibrary("maps"),
                importLibrary("marker"),
                importLibrary("core"),
            ]);

            this.google = google
            this.marker = marker
            this.core = core

            const element = document.getElementById(this.mapId)
            this.map = new this.google.Map(element, {
                //mapId: "DEMO_MAP_ID", // needed for AdvancedMarkerElement
                center: CATALUNYA_POSITION,
                zoom: 8,
                maxZoom: 20,
                minZoom: 4,
                disableDefaultUI: false,
                scrollwheel: true,
                draggable: true,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: this.google.MapTypeControlStyle.DROPDOWN_MENU,
                    position: this.core.ControlPosition.TOP_LEFT
                },
                panControl: true,
                panControlOptions: {
                    position: this.core.ControlPosition.TOP_RIGHT
                },
                zoomControl: true,
                zoomControlOptions: {
                    position: this.core.ControlPosition.LEFT_TOP
                },
                scaleControl: true, // fixed to BOTTOM_RIGHT
                streetViewControl: true,
                streetViewControlOptions: {
                    position: this.core.ControlPosition.LEFT_TOP
                },
                fullscreenControl: true,
                fullscreenControlOptions: {
                    position: this.core.ControlPosition.TOP_LEFT
                },
                mapTypeId: this.google.MapTypeId.ROADMAP,
                styles: this._isDarkTheme() ? STYLES_DARK : STYLES
            });

            // A click on the map itself closes the open card, as in catalunya-omap.
            this.map.addListener('click', () => {
                if (this.infowindow) this.infowindow.close();
            });

            // Initialize map
            this._setLogoCatalunyaMedieval();
            // The search button opens and closes the same list, so with it the
            // unlabelled list icon would only be a second way to do the same.
            if (!this.searchButton) {
                this._setIconTextList();
            }
            this._setIconsControl();
            // «Capes» first: with foldLayers the show/hide-all button folds into
            // it and, once open, comes first in the panel.
            this._setLayersControl();
            this._setRemoveAllIcons();
            this._setLocateControlIfAsked();
            this._setSearchControlIfAsked();
            this._followHostTheme();

            return this.map;
        } catch (error) {
            console.error("Error loading the Google Maps script", error);
        }
    }

    addMarker(location) {
        // Create the marker
        const marker = this.createMarker(location);
        marker.edificiId = location.edificiId;

        // add marker to the markers array
        this.markers.push(marker);

        // if we have the content object set up
        this.addContentToMarker(location, marker);

        // Create right buttons on the map
        this._createMarkerButton(marker, location)
        return marker;
    }

    getMarkers() {
        return this.markers;
    }

    getMarkerById(id) {
        return this.markers.find(marker => marker.edificiId === id);
    }

    fitToMarkers(padding = 0.1) {
        if (this.markers.length === 0) return;
        this._pendingFit = () => this._fitTo(this.markers, padding);
        this._pendingFit();
    }

    // Re-centre on the markers of the categories currently switched on; with
    // none visible there is nothing to frame, so the view is left alone.
    fitToVisibleMarkers(padding = 0.1) {
        const visible = this.markers.filter(m => this.icons.some(i => i.category === m.category && i.visible));
        if (visible.length === 0) return;
        this._fitTo(visible, padding);
    }

    selectMarker(marker, zoom = SINGLE_POINT_ZOOM) {
        if (!marker) return;
        this._pinMarker(marker);
        const element = document.getElementById(this.mapId);
        if (element) element.classList.add(ENTRY_MAP_CLASS);
        // On a phone the card would cover most of a small map, so the
        // building is shown in its hover colour instead and the card opens
        // on tap. Without a hover icon there is nothing to highlight with, so
        // the card opens after all.
        const highlighted = this._isPhone() && this._highlightMarker(marker);
        // `zoom` is a floor, not a target: never zoom back out of a level the
        // view is already at (e.g. after the visitor zoomed in).
        const focus = () => {
            const current = this.map.getZoom() || 0;
            this.map.setCenter(this._positionOf(marker));
            this.map.setZoom(Math.max(zoom, current));
            if (!highlighted) this._openInfoWindow(marker);
            this._fitWhileHidden = this._isHidden();
        };
        this._pendingFit = focus;
        focus();
        // Re-assert the final view/card once any layout or animation has
        // settled (same retry pattern as resizeMap() in the theme's page.js).
        setTimeout(focus, 400);
    }

    _isPhone() {
        return typeof window.matchMedia === 'function' && window.matchMedia(PHONE_QUERY).matches;
    }

    // Keeps the marker in its hover icon; the mouseout handlers leave it alone.
    _highlightMarker(marker) {
        if (!marker.hoverIconUrl) return false;
        marker._highlighted = true;
        marker.setIcon(marker.hoverIconUrl);
        return true;
    }

    // The selected building is the one the page is about, so it leaves the
    // clusterer and sits straight on the map: inside it, it was hidden
    // whenever a neighbour was close enough to share a cluster.
    _pinMarker(marker) {
        if (marker._pinned) return;
        if (this.clusterer) {
            this.clusterer.removeMarker(marker);
        }
        marker._pinned = true;
        marker.setMap(this.map);
    }

    async loadComarcaBoundaries(url, activeComarcaSlug, nonce) {
        const response = await fetchMapData(url, nonce);
        const geojson = await response.json();
        // Matched by slug (plain ASCII, e.g. "alt-emporda"), not by name — the
        // GeoJSON's `nom` and marker/DB comarca names come from independent
        // sources with their own accent/apostrophe encoding quirks, which a
        // name match has to work around; slugs sidestep that entirely.
        const target = activeComarcaSlug ? activeComarcaSlug.trim().toLowerCase() : '';

        if (this.comarcaBoundariesLayer) {
            this.comarcaBoundariesLayer.setMap(null);
        }

        const matches = (feature) => target && (feature.getProperty('slug') || '').trim().toLowerCase() === target;

        // Its own Data layer rather than map.data, so a reload can drop it whole.
        this.comarcaBoundariesLayer = new this.google.Data({ map: this.map });
        this.comarcaBoundariesLayer.addGeoJson(geojson);
        // No active comarca: show every outline. Once one is active, show only
        // its boundary rather than highlighting it among all 43. Never
        // clickable, so the outlines don't swallow clicks meant for the map.
        this.comarcaBoundariesLayer.setStyle((feature) => {
            if (target && !matches(feature)) return { visible: false };
            return matches(feature)
                ? { strokeColor: '#a42016', strokeWeight: 2.5, strokeOpacity: 0.9, fillColor: '#a42016', fillOpacity: 0.06, clickable: false }
                : { strokeColor: '#8a7355', strokeWeight: 1, strokeOpacity: 0.35, fillOpacity: 0, clickable: false };
        });

        return this.comarcaBoundariesLayer;
    }

    addContentToMarker(location, marker) {
        if (location.content) {
            marker._content = location.content;
            marker.addListener('click', () => this._openInfoWindow(marker));
        }
    }

    addAllMarkersToCluster() {
        if (!this.clusterer) {
            this.clusterer = new MarkerClusterer({ map: this.map, markers: this.markers });
        } else {
            this.clusterer.clearMarkers();
            this.clusterer.addMarkers(this.markers);
        }
    }

    createMarker(location) {
        // With clustering on, the clusterer decides which markers are drawn.
        const marker = new this.marker.Marker({
            position: {
                lat: location.lat,
                lng: location.lng
            },
            map: this.useMarkerCluster ? null : this.map,
            title: location.title,
            icon: location.icon,
        });
        marker._latLng = { lat: Number(location.lat), lng: Number(location.lng) };
        marker.visible = location.visible;
        marker.category = location.category;
        marker.hoverIconUrl = location.icon2;

        if (location.icon2) {
            marker.addListener('mouseover', () => marker.setIcon(location.icon2));
            marker.addListener('mouseout', () => {
                if (location.icon && !marker._highlighted) marker.setIcon(location.icon);
            });
        }

        return marker;
    }

    addIcon(edifici) {
        this._createIcon(edifici);
        this.icons.push(edifici); //Add Icon to the icons list
    }

    resize() {
        this._fitIconsControl();
        if (this.markers.length === 0) {
            this.resetView();
        } else if (this._fitWhileHidden && this._pendingFit && !this._isHidden()) {
            // The last fit/focus ran while the map was hidden: redo it now
            // that the map has a size to compute the zoom against.
            this._fitWhileHidden = false;
            this._pendingFit();
        }
    }

    resetView() {
        this.map.setCenter(CATALUNYA_POSITION);
        this.map.setZoom(8);
    }

    /**
     * Adds (or moves) a distinctly-styled marker for the visitor's own GPS
     * position — separate from addMarker()/createMarker() because it isn't a
     * building and shouldn't join the clusterer or the #map-list sidebar.
     * Calling it again replaces the previous marker/circle instead of
     * stacking them, so repeated geolocation fixes don't leave stale dots.
     */
    setUserLocationMarker(lat, lng, { accuracy } = {}) {
        if (this._userLocationMarker) {
            this._userLocationMarker.setMap(null);
            this._userLocationMarker = null;
        }
        if (this._userLocationAccuracyCircle) {
            this._userLocationAccuracyCircle.setMap(null);
            this._userLocationAccuracyCircle = null;
        }

        const position = { lat, lng };
        if (accuracy) {
            this._userLocationAccuracyCircle = new this.google.Circle({
                map: this.map,
                center: position,
                radius: accuracy,
                strokeColor: '#4285f4',
                strokeWeight: 1,
                fillColor: '#4285f4',
                fillOpacity: 0.08,
                clickable: false
            });
        }

        this._userLocationMarker = new this.marker.Marker({
            map: this.map,
            position,
            title: 'Ets aquí',
            zIndex: 3000,
            icon: {
                path: this.core.SymbolPath.CIRCLE,
                scale: 8,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                fillColor: '#1a73e8',
                fillOpacity: 1
            }
        });
        this._userLocationMarker._latLng = position;
        this._userLocationMarker.addListener('click', () => this._openInfoWindow(this._userLocationMarker, 'Ets aquí'));

        return this._userLocationMarker;
    }

    /**
     * Adds (or moves) a circle showing the chosen search radius around the
     * visitor's position — distinct from setUserLocationMarker()'s own
     * accuracy circle (GPS precision, typically tens of metres) since this
     * one reflects a value the visitor picked (e.g. "5 km"), not a device
     * reading. Calling it again replaces the previous circle. Returns the
     * circle so the caller can fit the map to its bounds (getBounds()).
     * Google's circles have no dashed stroke, unlike catalunya-omap's.
     */
    setSearchRadiusCircle(lat, lng, radiusMeters) {
        if (this._searchRadiusCircle) {
            this._searchRadiusCircle.setMap(null);
            this._searchRadiusCircle = null;
        }

        this._searchRadiusCircle = new this.google.Circle({
            map: this.map,
            center: { lat, lng },
            radius: radiusMeters,
            strokeColor: '#a42016',
            strokeWeight: 1.5,
            strokeOpacity: 0.8,
            fillColor: '#a42016',
            fillOpacity: 0.04,
            clickable: false
        });

        return this._searchRadiusCircle;
    }

    /**
     * Inverse of addMarker()/addAllMarkersToCluster(): removes every current
     * marker from the map/clusterer and empties the #map-list sidebar, so a
     * new search (e.g. a different radius) doesn't accumulate markers/items
     * on top of the previous one.
     */
    clearMarkers() {
        if (this.clusterer) {
            this.clusterer.clearMarkers();
        }
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        this.arrayCategoriesText = [];
        if (this.infowindow) this.infowindow.close();

        const ul = document.getElementById(this.listId);
        if (ul) ul.innerHTML = '';
    }

    _exist(item) {
        return this.arrayCategoriesText.includes(item);
    }

    _positionOf(marker) {
        if (marker._latLng) return marker._latLng;
        const position = marker.getPosition();
        return { lat: position.lat(), lng: position.lng() };
    }

    // Leaflet's bounds.pad(padding): grow the box by `padding` of its own size
    // on every side. A box without area (one building) gets a fixed zoom.
    _fitTo(markers, padding) {
        const points = markers.map(m => this._positionOf(m));
        const lats = points.map(p => p.lat);
        const lngs = points.map(p => p.lng);
        const south = Math.min(...lats), north = Math.max(...lats);
        const west = Math.min(...lngs), east = Math.max(...lngs);

        if (south === north && west === east) {
            this.map.setCenter({ lat: south, lng: west });
            this.map.setZoom(SINGLE_POINT_ZOOM);
        } else {
            const padLat = (north - south) * padding;
            const padLng = (east - west) * padding;
            this.map.fitBounds({
                south: south - padLat,
                north: north + padLat,
                west: west - padLng,
                east: east + padLng
            });
        }
        this._fitWhileHidden = this._isHidden();
    }

    _isHidden() {
        const element = document.getElementById(this.mapId);
        return !element || element.offsetWidth === 0 || element.offsetHeight === 0;
    }

    // One card at a time; the card carries its own close button
    // (.catmed-maps-marker-close), so Google's header is switched off.
    _openInfoWindow(marker, content = marker._content) {
        if (!this.infowindow) {
            this.infowindow = new this.google.InfoWindow({ headerDisabled: true });
            this.infowindow.addListener('domready', () => {
                document.querySelectorAll('.catmed-maps-marker-close').forEach(button => {
                    button.onclick = () => this.infowindow.close();
                });
            });
        }
        this.infowindow.setContent(content);
        if (marker.getMap()) {
            this.infowindow.open({ anchor: marker, map: this.map, shouldFocus: false });
        } else {
            // Inside a cluster the marker has no map, and Google won't anchor
            // a card to it: open the card at the building's position instead.
            this.infowindow.setPosition(this._positionOf(marker));
            this.infowindow.open({ map: this.map, shouldFocus: false });
        }
    }

    _isDarkTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // Follow the host page's light/dark toggle (data-theme on <html>), the
    // same switch catalunya-omap's stylesheet listens to.
    _followHostTheme() {
        if (typeof MutationObserver === 'undefined') return;
        this._themeObserver = new MutationObserver(() => {
            this.map.setOptions({ styles: this._isDarkTheme() ? STYLES_DARK : STYLES });
        });
        this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    /**
     *  create Marker Button link text
     */
    _createMarkerButton(marker, opts) {

        //Creates a sidebar text link
        const ul = document.getElementById(this.listId);
        if (!ul) return;

        //Add Title Category if needed
        if (!this._exist(opts.category)) {
            //Add to the array
            this.arrayCategoriesText.push(opts.category);
            //Create the li header
            const liCategory = document.createElement("li");
            liCategory.innerHTML = opts.categoryName;
            liCategory.setAttribute("class", opts.category + " header");
            ul.appendChild(liCategory);
        }

        //Add a normal building
        const li = document.createElement("li");
        li.innerHTML = opts.title;
        li.setAttribute("class", opts.category);
        ul.appendChild(li);

        li.addEventListener("click", () => {
            this.map.setZoom(15);
            this.map.setCenter(this._positionOf(marker));
            this._openInfoWindow(marker);
        });

        li.addEventListener("mouseover", () => {
            marker.setZIndex(2000);
            if (opts.icon2) marker.setIcon(opts.icon2);
        });

        li.addEventListener("mouseout", () => {
            marker.setZIndex(1);
            if (opts.icon && !marker._highlighted) marker.setIcon(opts.icon);
        });

    }

    /**
     * One control for the show/hide icons (all + one per category): when they
     * don't fit the map height they wrap into extra columns towards the left
     * (CSS on .cm-gmap-icons) instead of being clipped.
     */
    _setIconsControl() {
        this.iconsControl = document.createElement('div');
        this.iconsControl.className = 'cm-gmap-icons';
        this.map.controls[this.core.ControlPosition.RIGHT_TOP].push(this.iconsControl);
        this._fitIconsControl();
    }

    // Google doesn't bound a control's height, so the wrap needs one: the map
    // height minus the list icon above it and Google's own camera/Street View
    // controls in the bottom-right corner below it.
    _fitIconsControl() {
        const element = document.getElementById(this.mapId);
        if (!this.iconsControl || !element || !element.clientHeight) return;
        this.iconsControl.style.maxHeight = Math.max(element.clientHeight - 170, 40) + 'px';
    }

    /**
     * Add Remove Icons Icon
     */
    _setRemoveAllIcons() {
        const controlUI = document.createElement('div');
        controlUI.className = 'cm-gmap-icon';
        controlUI.title = 'Click per mostrar o ocultar totes les edificacions';
        controlUI.innerHTML = '<img id="visibleBuildings" src="' + this.serverHost + 'images/controls/06.png" width="32" height="32" alt="Click per mostrar o ocultar totes les edificacions" >';
        this.iconsControl.appendChild(controlUI);

        controlUI.addEventListener('click', () => {
            this.visibleBuildings = !this.visibleBuildings;
            this._changeVisibility(this.visibleBuildings);
            this.fitToVisibleMarkers();
            this._announceGroups();
            const number = this.visibleBuildings ? "06" : "05";
            const image = document.getElementById("visibleBuildings");
            if (image) image.src = this.serverHost + 'images/controls/' + number + '.png';
        });
    }

    _createIcon(edifici) {
        const controlUI = document.createElement('div');
        controlUI.className = 'cm-gmap-icon';
        controlUI.title = 'Click per activar o desactivar ' + edifici.title;
        controlUI.innerHTML = '<img id="img-' + edifici.category + '" src="' + edifici.icon + '" alt="' + edifici.title + '" >';
        this.iconsControl.appendChild(controlUI);

        controlUI.addEventListener('click', () => {
            this._setCategoryVisible(edifici, !edifici.visible);
            this.fitToVisibleMarkers();
            this._announceGroups();
        });

        return controlUI;
    }

    // One category on or off: its markers, list entries and button.
    _setCategoryVisible(edifici, visible) {
        edifici.visible = visible;
        this._setVisible(edifici.category, visible);
    }

    // A group is one of the four kinds of building (militar, civil, religios,
    // altres). It is on while any of its categories is.
    isGroupVisible(type) {
        return this.icons.some(i => i.type === type && i.visible);
    }

    setGroupVisible(type, visible) {
        this.icons.filter(i => i.type === type).forEach(i => this._setCategoryVisible(i, visible));
        this.fitToVisibleMarkers();
        this._announceGroups();
    }

    _announceGroups() {
        const types = [...new Set(this.icons.map(i => i.type).filter(Boolean))];
        const groups = Object.fromEntries(types.map(t => [t, this.isGroupVisible(t)]));
        document.dispatchEvent(new CustomEvent(GROUPS_CHANGED_EVENT, { detail: { groups } }));
    }

    // The «Capes» button, next to the show/hide-all one: the category buttons
    // (one per kind of building) fold behind it. Always in the page, and
    // hidden by the CSS except on a map with foldLayers and on the map of one
    // building on a phone.
    _setLayersControl() {
        const element = document.getElementById(this.mapId);
        if (this.foldLayers && element) element.classList.add(FOLDED_CLASS);

        const controlUI = document.createElement('div');
        controlUI.className = 'cm-gmap-icon cm-gmap-layers';
        controlUI.title = 'Capes';
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', 'Capes');
        button.setAttribute('aria-expanded', 'false');
        button.innerHTML = this._layersIcon();
        controlUI.appendChild(button);
        this.iconsControl.appendChild(controlUI);

        button.addEventListener('click', () => {
            const open = element ? element.classList.toggle(LAYERS_OPEN_CLASS) : false;
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    _layersIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
        </svg>`;
    }

    // Centres the map on the visitor. It only asks for the position when the
    // button is pressed, never on load, and the position stays in the
    // browser: nothing is sent anywhere. A refusal or a failure is said next
    // to the button instead of being swallowed.
    _setLocateControlIfAsked() {
        if (!this.locateButton) return;
        const control = document.createElement('div');
        control.className = 'cm-gmap-locate';
        const button = document.createElement('button');
        button.type = 'button';
        button.title = "Localitza'm";
        button.setAttribute('aria-label', "Localitza'm");
        button.innerHTML = this._locateIcon();
        const message = document.createElement('span');
        message.className = 'cm-gmap-locate-message';
        message.setAttribute('role', 'status');
        message.hidden = true;
        control.appendChild(button);
        control.appendChild(message);
        this.map.controls[this.core.ControlPosition.LEFT_TOP].push(control);

        button.addEventListener('click', () => this._locate(button, message));
    }

    _locate(button, message) {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            this._showLocateMessage(message, 'El teu navegador no pot donar la ubicació.');
            return;
        }
        button.classList.add('cm-gmap-locate--busy');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                button.classList.remove('cm-gmap-locate--busy');
                message.hidden = true;
                this._showPosition(position.coords, position.coords.accuracy);
            },
            (err) => {
                button.classList.remove('cm-gmap-locate--busy');
                this._showLocateMessage(message, this._locateErrorMessage(err));
            },
            LOCATE_OPTIONS
        );
    }

    // The dot replaces the previous one when the button is pressed again.
    _showPosition(coords, accuracy) {
        this.setUserLocationMarker(coords.latitude, coords.longitude, { accuracy });
        const current = this.map.getZoom() || 0;
        this.map.setCenter({ lat: coords.latitude, lng: coords.longitude });
        this.map.setZoom(Math.max(LOCATE_ZOOM, current));
    }

    _showLocateMessage(message, text) {
        message.textContent = text;
        message.hidden = false;
        clearTimeout(this._locateMessageTimer);
        this._locateMessageTimer = setTimeout(() => { message.hidden = true; }, LOCATE_MESSAGE_MS);
    }

    _locateErrorMessage(err) {
        switch (err && err.code) {
            case 1: // PERMISSION_DENIED
                return "Has denegat l'accés a la ubicació. Pots canviar-ho als permisos del navegador.";
            case 3: // TIMEOUT
                return 'No hem pogut obtenir la ubicació a temps. Torna-ho a provar.';
            default:
                return 'No hem pogut obtenir la teva ubicació.';
        }
    }

    _locateIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/>
            <line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/>
            <line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/>
        </svg>`;
    }

    /**
     * change the visibility of the icons
     */
    _changeVisibility(visibility) {
        this.icons.forEach(edifici => {
            edifici.visible = visibility;
            this._setVisible(edifici.category, visibility);
        });
    }

    /**
     * Set the Logo for Catalunya Medieval in the BOTTOM_LEFT corner
     */
    _setLogoCatalunyaMedieval() {

        const logoControlDiv = document.createElement('div');

        //Set CSS styles for the div containing the control
        logoControlDiv.index = 10; // used for ordering
        logoControlDiv.style.padding = '0px';

        //Set CSS for the control border
        const logo = document.createElement('img');
        logo.src = this.serverHost + 'images/logo/logoCM-red-mini.png';
        logo.style.cursor = 'pointer';
        logoControlDiv.appendChild(logo);

        this.map.controls[this.core.ControlPosition.BOTTOM_LEFT].push(logoControlDiv);
    }

    /**
     * Set Icon for icons list
     */
    _setIconTextList() {
        const showTextList = document.createElement('div');
        showTextList.className = 'cm-gmap-icon';
        showTextList.title = 'Click per mostrar o ocultar el llistat';
        const initialIcon = this.ListTextEnabled ? "04" : "03";
        showTextList.innerHTML = '<img id="llistat" src="' + this.serverHost + 'images/controls/' + initialIcon + '.png" width="42" height="42" alt="Llistat" >';

        this.map.controls[this.core.ControlPosition.TOP_RIGHT].push(showTextList);

        showTextList.addEventListener('click', () => this._setListOpen(!this.ListTextEnabled));
    }

    // The side list with its search box, shown or hidden.
    _setListOpen(open) {
        this.ListTextEnabled = open;
        const number = open ? "04" : "03";
        const llistat = document.getElementById("llistat");
        if (llistat) llistat.src = this.serverHost + 'images/controls/' + number + '.png';
        const secondaryDiv = document.getElementById(this.secondaryDivId);
        if (secondaryDiv) secondaryDiv.style.display = open ? '' : 'none';
        // The magnifier says whether the list is open, whoever opened it.
        if (this._searchButtonEl) this._searchButtonEl.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (this.infowindow) this.infowindow.close();
        this.resize();
    }

    // A magnifier under the other buttons that opens the side list and puts
    // the cursor in its search box, and closes the list when pressed again:
    // the search was always there, but behind an unlabelled icon.
    _setSearchControlIfAsked() {
        if (!this.searchButton) return;
        const control = document.createElement('div');
        control.className = 'cm-gmap-search';
        const button = document.createElement('button');
        button.type = 'button';
        button.title = 'Cercar una edificació';
        button.setAttribute('aria-label', 'Cercar una edificació');
        button.setAttribute('aria-expanded', this.ListTextEnabled ? 'true' : 'false');
        button.innerHTML = this._searchIcon();
        this._searchButtonEl = button;
        control.appendChild(button);
        this.map.controls[this.core.ControlPosition.LEFT_TOP].push(control);

        button.addEventListener('click', () => this._toggleSearch());
    }

    _toggleSearch() {
        if (this.ListTextEnabled) {
            this._setListOpen(false);
            return;
        }
        this._setListOpen(true);
        const secondaryDiv = document.getElementById(this.secondaryDivId);
        const input = secondaryDiv && secondaryDiv.querySelector('input[type="search"]');
        if (input) input.focus();
    }

    _searchIcon() {
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>`;
    }

    _setVisible(category, visible) {
        this.markers.forEach(marker => {
            if (marker.category !== category) return;
            marker.visible = visible;
            if (marker._pinned || !this.clusterer) {
                marker.setMap(visible ? this.map : null);
            } else if (visible) {
                this.clusterer.addMarker(marker, true);
            } else {
                this.clusterer.removeMarker(marker, true);
            }
        });
        if (this.clusterer) this.clusterer.render();

        // The sidebar list and the category icon follow the markers.
        const list = document.getElementById(this.listId);
        if (list) {
            list.querySelectorAll('li.' + category).forEach(li => {
                li.style.display = visible ? '' : 'none';
            });
        }
        const icon = document.getElementById('img-' + category);
        if (icon) icon.style.opacity = visible ? '1' : '0.5';
    }
}
