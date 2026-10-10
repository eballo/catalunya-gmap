/**
 * @jest-environment jsdom
 */
import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import MapManager from "../app/catalunya-gmap-manager";
import { STYLES, STYLES_DARK } from "../app/catalunya-gmap-styles";

jest.mock('@googlemaps/js-api-loader', () => ({
    setOptions: jest.fn(),
    importLibrary: jest.fn(),
}));

jest.mock('@googlemaps/markerclusterer', () => ({
    MarkerClusterer: jest.fn(),
}));

process.env.SERVER_HOST = 'http://localhost/';
process.env.DEBUG = 'false';

// ---------------------------------------------------------------------------
// Google Maps doubles: just enough of each class for what MapManager calls.

function makeOverlay(opts) {
    return {
        opts,
        map: opts.map || null,
        setMap: jest.fn(function (map) { this.map = map; }),
        getMap: jest.fn(function () { return this.map; }),
        getBounds: jest.fn().mockReturnValue('circle-bounds'),
    };
}

function makeMarker(opts) {
    const handlers = {};
    return {
        opts,
        map: opts.map || null,
        setMap: jest.fn(function (map) { this.map = map; }),
        getMap: jest.fn(function () { return this.map; }),
        setIcon: jest.fn(),
        setZIndex: jest.fn(),
        getPosition: jest.fn(() => ({ lat: () => opts.position.lat, lng: () => opts.position.lng })),
        addListener: jest.fn((evt, fn) => { handlers[evt] = fn; }),
        fire: (evt) => handlers[evt] && handlers[evt](),
    };
}

// map.controls[position]: Google puts each pushed control into the page.
function makeControls() {
    return Array.from({ length: 14 }, () => {
        const list = [];
        Object.defineProperty(list, 'push', {
            value: (element) => {
                document.body.appendChild(element);
                return Array.prototype.push.call(list, element);
            },
        });
        return list;
    });
}

var mockMap, mockInfoWindow, mockData, mockClusterer, libs, mapHandlers, infoWindowHandlers;

beforeEach(() => {
    jest.clearAllMocks();
    delete global.catalunyaGmapConfig;
    document.documentElement.removeAttribute('data-theme');

    mapHandlers = {};
    infoWindowHandlers = {};
    mockMap = {
        controls: makeControls(),
        addListener: jest.fn((evt, fn) => { mapHandlers[evt] = fn; }),
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        getZoom: jest.fn().mockReturnValue(8),
        fitBounds: jest.fn(),
        setOptions: jest.fn(),
    };
    mockInfoWindow = {
        setContent: jest.fn(),
        setPosition: jest.fn(),
        open: jest.fn(),
        close: jest.fn(),
        addListener: jest.fn((evt, fn) => { infoWindowHandlers[evt] = fn; }),
    };
    mockData = {
        addGeoJson: jest.fn(),
        setStyle: jest.fn(function (fn) { this.style = fn; }),
        setMap: jest.fn(),
    };
    mockClusterer = {
        addMarker: jest.fn(),
        addMarkers: jest.fn(),
        removeMarker: jest.fn(),
        clearMarkers: jest.fn(),
        render: jest.fn(),
    };
    libs = {
        maps: {
            Map: jest.fn(() => mockMap),
            InfoWindow: jest.fn(() => mockInfoWindow),
            Circle: jest.fn(makeOverlay),
            Data: jest.fn(() => mockData),
            MapTypeId: { ROADMAP: 'roadmap' },
            MapTypeControlStyle: { DROPDOWN_MENU: 'dropdown' },
        },
        marker: { Marker: jest.fn(makeMarker) },
        core: {
            ControlPosition: { TOP_LEFT: 0, TOP_RIGHT: 1, LEFT_TOP: 2, RIGHT_TOP: 3, BOTTOM_LEFT: 4 },
            SymbolPath: { CIRCLE: 'circle' },
        },
    };
    importLibrary.mockImplementation(name => Promise.resolve(libs[name]));
    MarkerClusterer.mockImplementation(() => mockClusterer);
});

afterEach(() => {
    jest.useRealTimers();
});

function buildManager(html) {
    document.body.innerHTML = html || '<div id="gMap"></div><div id="secondaryDiv"></div><ul id="map-list"></ul>';
    return new MapManager('gMap');
}

async function initManager(html) {
    const mm = buildManager(html);
    await mm.initMap();
    return mm;
}

function location(overrides) {
    return Object.assign({
        lat: 41.5, lng: 2.0, title: 'Castell', icon: 'icon.png', icon2: 'icon2.png',
        category: 'castell', categoryName: 'Castells', visible: true, content: '<div>card</div>',
    }, overrides || {});
}

function setSize(element, width, height) {
    Object.defineProperty(element, 'offsetWidth', { configurable: true, value: width });
    Object.defineProperty(element, 'offsetHeight', { configurable: true, value: height });
    Object.defineProperty(element, 'clientHeight', { configurable: true, value: height });
}

// ---------------------------------------------------------------------------

describe('MapManager - constructor', () => {
    it('sets default properties', () => {
        const mm = buildManager();
        expect(mm.serverHost).toBe('http://localhost/');
        expect(mm.secondaryDivId).toBe('secondaryDiv');
        expect(mm.listId).toBe('map-list');
        expect(mm.ListTextEnabled).toBe(false);
        expect(mm.useMarkerCluster).toBe(false);
        expect(mm.markers).toEqual([]);
    });

    it('reads config from catalunyaGmapConfig when present', () => {
        global.catalunyaGmapConfig = {
            serverHost: 'https://cdn/', secondaryDivId: 'side', listId: 'items',
            listEnabled: true, useMarkerCluster: true, apiKey: 'KEY',
        };
        const mm = buildManager();
        expect(mm.serverHost).toBe('https://cdn/');
        expect(mm.secondaryDivId).toBe('side');
        expect(mm.listId).toBe('items');
        expect(mm.ListTextEnabled).toBe(true);
        expect(mm.useMarkerCluster).toBe(true);
        expect(setOptions).toHaveBeenCalledWith({ key: 'KEY', v: 'weekly' });
    });
});

describe('MapManager - initMap()', () => {
    it('creates the map with the light styles and returns it', async () => {
        const mm = buildManager();
        const map = await mm.initMap();
        expect(map).toBe(mockMap);
        expect(libs.maps.Map.mock.calls[0][1].styles).toBe(STYLES);
    });

    it('starts with the dark styles when the host page is dark', async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        await initManager();
        expect(libs.maps.Map.mock.calls[0][1].styles).toBe(STYLES_DARK);
    });

    it('follows the host page when it switches theme', async () => {
        await initManager();
        document.documentElement.setAttribute('data-theme', 'dark');
        await Promise.resolve();
        expect(mockMap.setOptions).toHaveBeenLastCalledWith({ styles: STYLES_DARK });
        document.documentElement.setAttribute('data-theme', 'light');
        await Promise.resolve();
        expect(mockMap.setOptions).toHaveBeenLastCalledWith({ styles: STYLES });
    });

    it('closes the open card when the map itself is clicked', async () => {
        const mm = await initManager();
        mapHandlers.click();
        mm.addMarker(location());
        mm._openInfoWindow(mm.markers[0]);
        mapHandlers.click();
        expect(mockInfoWindow.close).toHaveBeenCalledTimes(1);
    });

    it('logs and returns undefined when Google Maps fails to load', async () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        importLibrary.mockImplementation(() => Promise.reject(new Error('offline')));
        const mm = buildManager();
        await expect(mm.initMap()).resolves.toBeUndefined();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});

describe('MapManager - createMarker()', () => {
    it('leaves the marker off the map when clustering is on', async () => {
        global.catalunyaGmapConfig = { useMarkerCluster: true };
        const mm = await initManager();
        const marker = mm.createMarker(location());
        expect(marker.opts.map).toBeNull();
    });

    it('puts the marker on the map when clustering is off', async () => {
        const mm = await initManager();
        const marker = mm.createMarker(location());
        expect(marker.opts.map).toBe(mockMap);
        expect(marker.category).toBe('castell');
    });

    it('swaps to icon2 on mouseover and back to icon on mouseout when icon2 is set', async () => {
        const mm = await initManager();
        const marker = mm.createMarker(location());
        marker.fire('mouseover');
        expect(marker.setIcon).toHaveBeenLastCalledWith('icon2.png');
        marker.fire('mouseout');
        expect(marker.setIcon).toHaveBeenLastCalledWith('icon.png');
    });

    it('does not restore an icon on mouseout when there is none', async () => {
        const mm = await initManager();
        const marker = mm.createMarker(location({ icon: undefined }));
        marker.fire('mouseout');
        expect(marker.setIcon).not.toHaveBeenCalled();
    });

    it('does not register hover handlers when icon2 is absent', async () => {
        const mm = await initManager();
        const marker = mm.createMarker(location({ icon2: undefined }));
        expect(marker.addListener).not.toHaveBeenCalled();
    });
});

describe('MapManager - addMarker() / getMarkers() / getMarkerById()', () => {
    it('stores the marker with its edificiId and returns it', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location({ edificiId: 42 }));
        expect(mm.getMarkers()).toEqual([marker]);
        expect(marker.edificiId).toBe(42);
    });

    it('finds the marker whose edificiId matches', async () => {
        const mm = await initManager();
        mm.addMarker(location({ edificiId: 1 }));
        const second = mm.addMarker(location({ edificiId: 2 }));
        expect(mm.getMarkerById(2)).toBe(second);
        expect(mm.getMarkerById(3)).toBeUndefined();
    });
});

describe('MapManager - cards', () => {
    it('opens the marker card on click, anchored to the marker', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        marker.fire('click');
        expect(libs.maps.InfoWindow).toHaveBeenCalledWith({ headerDisabled: true });
        expect(mockInfoWindow.setContent).toHaveBeenCalledWith('<div>card</div>');
        expect(mockInfoWindow.open).toHaveBeenCalledWith({ anchor: marker, map: mockMap, shouldFocus: false });
    });

    it('does not listen for clicks when there is no content', async () => {
        const mm = await initManager();
        const marker = mm.createMarker(location({ icon2: undefined }));
        mm.addContentToMarker(location({ content: '' }), marker);
        expect(marker.addListener).not.toHaveBeenCalled();
    });

    it('creates a single InfoWindow for every card', async () => {
        const mm = await initManager();
        mm.addMarker(location()).fire('click');
        mm.addMarker(location()).fire('click');
        expect(libs.maps.InfoWindow).toHaveBeenCalledTimes(1);
    });

    it("wires the card's close button once the card is in the page", async () => {
        const mm = await initManager();
        mm.addMarker(location()).fire('click');
        document.body.insertAdjacentHTML('beforeend', "<button class='catmed-maps-marker-close'></button>");
        infoWindowHandlers.domready();
        document.querySelector('.catmed-maps-marker-close').onclick();
        expect(mockInfoWindow.close).toHaveBeenCalled();
    });

    it("opens the card at the building's position when the marker is inside a cluster", async () => {
        global.catalunyaGmapConfig = { useMarkerCluster: true };
        const mm = await initManager();
        const marker = mm.addMarker(location({ lat: 41.1, lng: 1.9 }));
        mm._openInfoWindow(marker);
        expect(mockInfoWindow.setPosition).toHaveBeenCalledWith({ lat: 41.1, lng: 1.9 });
        expect(mockInfoWindow.open).toHaveBeenCalledWith({ map: mockMap, shouldFocus: false });
    });
});

describe('MapManager - fitToMarkers()', () => {
    it('does nothing when there are no markers', async () => {
        const mm = await initManager();
        mm.fitToMarkers();
        expect(mockMap.fitBounds).not.toHaveBeenCalled();
        expect(mm._pendingFit).toBeNull();
    });

    it('fits the map to the markers, padded by 10% of the box on every side', async () => {
        const mm = await initManager();
        mm.addMarker(location({ lat: 41, lng: 1 }));
        mm.addMarker(location({ lat: 42, lng: 3 }));
        mm.fitToMarkers();
        const bounds = mockMap.fitBounds.mock.calls[0][0];
        expect(bounds.south).toBeCloseTo(40.9);
        expect(bounds.north).toBeCloseTo(42.1);
        expect(bounds.west).toBeCloseTo(0.8);
        expect(bounds.east).toBeCloseTo(3.2);
    });

    it('centres on a single building at a fixed zoom instead of fitting a box without area', async () => {
        const mm = await initManager();
        mm.addMarker(location({ lat: 41.5, lng: 2 }));
        mm.fitToMarkers();
        expect(mockMap.fitBounds).not.toHaveBeenCalled();
        expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 41.5, lng: 2 });
        expect(mockMap.setZoom).toHaveBeenCalledWith(16);
    });

    it('remembers that it fitted a hidden map', async () => {
        const mm = await initManager();
        mm.addMarker(location());
        mm.fitToMarkers();
        expect(mm._fitWhileHidden).toBe(true);
        setSize(document.getElementById('gMap'), 800, 600);
        mm.fitToMarkers();
        expect(mm._fitWhileHidden).toBe(false);
    });
});

describe('MapManager - fitToVisibleMarkers()', () => {
    it('fits the map to the markers of the categories switched on', async () => {
        const mm = await initManager();
        mm.addMarker(location({ lat: 41, lng: 1 }));
        mm.addMarker(location({ lat: 42, lng: 2, category: 'torre' }));
        mm.icons = [{ category: 'castell', visible: true }, { category: 'torre', visible: false }];
        mm.fitToVisibleMarkers();
        expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 41, lng: 1 });
    });

    it('leaves the view alone when every category is switched off', async () => {
        const mm = await initManager();
        mm.addMarker(location());
        mm.icons = [{ category: 'castell', visible: false }];
        mm.fitToVisibleMarkers();
        expect(mockMap.setCenter).not.toHaveBeenCalled();
        expect(mockMap.fitBounds).not.toHaveBeenCalled();
    });
});

describe('MapManager - selectMarker()', () => {
    it('does nothing when the marker is falsy', async () => {
        const mm = await initManager();
        mm.selectMarker(undefined);
        expect(mockMap.setCenter).not.toHaveBeenCalled();
    });

    it('takes the marker out of the clusterer, pins it on the map and opens its card', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location({ lat: 41.2, lng: 1.7 }));
        mm.addAllMarkersToCluster();
        mm.selectMarker(marker);
        expect(mockClusterer.removeMarker).toHaveBeenCalledWith(marker);
        expect(marker.setMap).toHaveBeenLastCalledWith(mockMap);
        expect(marker._pinned).toBe(true);
        expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 41.2, lng: 1.7 });
        expect(mockMap.setZoom).toHaveBeenCalledWith(16);
        expect(mockInfoWindow.open).toHaveBeenCalled();
    });

    it('pins the marker only once', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        mm.addAllMarkersToCluster();
        mm.selectMarker(marker);
        mm.selectMarker(marker);
        expect(mockClusterer.removeMarker).toHaveBeenCalledTimes(1);
    });

    it('never zooms back out of a level the view is already at', async () => {
        const mm = await initManager();
        mockMap.getZoom.mockReturnValue(18);
        mm.selectMarker(mm.addMarker(location()));
        expect(mockMap.setZoom).toHaveBeenCalledWith(18);
    });

    it('uses the given zoom while the map has no zoom yet', async () => {
        const mm = await initManager();
        mockMap.getZoom.mockReturnValue(undefined);
        mm.selectMarker(mm.addMarker(location()), 14);
        expect(mockMap.setZoom).toHaveBeenCalledWith(14);
    });

    it('re-asserts the view and card shortly after, once layout and animations have settled', async () => {
        const mm = await initManager();
        jest.useFakeTimers();
        mm.selectMarker(mm.addMarker(location()));
        expect(mockMap.setCenter).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(400);
        expect(mockMap.setCenter).toHaveBeenCalledTimes(2);
        expect(mockInfoWindow.open).toHaveBeenCalledTimes(2);
    });

    it('keeps a pinned marker on the map, not in the clusterer, when its category is toggled', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        mm.addAllMarkersToCluster();
        mm.selectMarker(marker);
        mm._setVisible('castell', false);
        expect(marker.setMap).toHaveBeenLastCalledWith(null);
        mm._setVisible('castell', true);
        expect(marker.setMap).toHaveBeenLastCalledWith(mockMap);
        expect(mockClusterer.addMarker).not.toHaveBeenCalled();
    });
});

describe('MapManager - resize()', () => {
    it('recentres on Catalunya when there are no markers', async () => {
        const mm = await initManager();
        mm.resize();
        expect(mockMap.setZoom).toHaveBeenCalledWith(8);
    });

    it('replays the last fit when it ran on a hidden map that is now visible', async () => {
        const mm = await initManager();
        mm.addMarker(location({ lat: 41, lng: 1 }));
        mm.addMarker(location({ lat: 42, lng: 2 }));
        mm.fitToMarkers();
        setSize(document.getElementById('gMap'), 800, 600);
        mm.resize();
        expect(mockMap.fitBounds).toHaveBeenCalledTimes(2);
        mm.resize();
        expect(mockMap.fitBounds).toHaveBeenCalledTimes(2);
    });

    it('does not replay the fit while the map is still hidden', async () => {
        const mm = await initManager();
        mm.addMarker(location({ lat: 41, lng: 1 }));
        mm.addMarker(location({ lat: 42, lng: 2 }));
        mm.fitToMarkers();
        mm.resize();
        expect(mockMap.fitBounds).toHaveBeenCalledTimes(1);
    });

    it('does nothing extra when there is no pending fit', async () => {
        const mm = await initManager();
        mm.addMarker(location());
        mm._fitWhileHidden = true;
        mm.resize();
        expect(mockMap.setCenter).not.toHaveBeenCalled();
    });

    it('bounds the height of the show/hide icons to the map', async () => {
        const mm = await initManager();
        setSize(document.getElementById('gMap'), 800, 600);
        mm.resize();
        expect(mm.iconsControl.style.maxHeight).toBe('430px');
    });
});

describe('MapManager - resetView()', () => {
    it('recentres to Catalunya', async () => {
        const mm = await initManager();
        mm.resetView();
        expect(mockMap.setCenter).toHaveBeenCalled();
        expect(mockMap.setZoom).toHaveBeenCalledWith(8);
    });
});

describe('MapManager - loadComarcaBoundaries()', () => {
    const geojson = { type: 'FeatureCollection', features: [] };
    const feature = slug => ({ getProperty: key => (key === 'slug' ? slug : undefined) });

    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(geojson) });
    });

    it('fetches the url and adds the GeoJSON to its own Data layer on the map', async () => {
        const mm = await initManager();
        const layer = await mm.loadComarcaBoundaries('limits.json', '');
        expect(global.fetch).toHaveBeenCalledWith('limits.json');
        expect(libs.maps.Data).toHaveBeenCalledWith({ map: mockMap });
        expect(mockData.addGeoJson).toHaveBeenCalledWith(geojson);
        expect(layer).toBe(mockData);
    });

    it('sends the nonce as X-CM-Nonce header when given', async () => {
        const mm = await initManager();
        await mm.loadComarcaBoundaries('limits.json', '', 'n0nce');
        expect(global.fetch).toHaveBeenCalledWith('limits.json', { headers: { 'X-CM-Nonce': 'n0nce' } });
    });

    it('shows every comarca, faintly, when there is no active one', async () => {
        const mm = await initManager();
        await mm.loadComarcaBoundaries('limits.json', '');
        expect(mockData.style(feature('osona'))).toMatchObject({ strokeColor: '#8a7355', fillOpacity: 0, clickable: false });
    });

    it('shows only the active comarca, matched by slug regardless of case', async () => {
        const mm = await initManager();
        await mm.loadComarcaBoundaries('limits.json', ' Osona ');
        expect(mockData.style(feature('osona'))).toMatchObject({ strokeColor: '#a42016', clickable: false });
        expect(mockData.style(feature('bages'))).toEqual({ visible: false });
        expect(mockData.style(feature(undefined))).toEqual({ visible: false });
    });

    it('removes the previous boundary layer when called again', async () => {
        const mm = await initManager();
        await mm.loadComarcaBoundaries('limits.json', '');
        await mm.loadComarcaBoundaries('limits.json', 'osona');
        expect(mockData.setMap).toHaveBeenCalledWith(null);
    });
});

describe('MapManager - setUserLocationMarker()', () => {
    it('adds a blue dot at the given position that opens "Ets aquí"', async () => {
        const mm = await initManager();
        const marker = mm.setUserLocationMarker(41.4, 2.1);
        expect(marker.opts).toMatchObject({ map: mockMap, position: { lat: 41.4, lng: 2.1 }, title: 'Ets aquí' });
        expect(marker.opts.icon).toMatchObject({ path: 'circle', fillColor: '#1a73e8' });
        marker.fire('click');
        expect(mockInfoWindow.setContent).toHaveBeenCalledWith('Ets aquí');
    });

    it('does not draw an accuracy circle when accuracy is not given', async () => {
        const mm = await initManager();
        mm.setUserLocationMarker(41.4, 2.1);
        expect(libs.maps.Circle).not.toHaveBeenCalled();
    });

    it('draws an accuracy circle when accuracy is given', async () => {
        const mm = await initManager();
        mm.setUserLocationMarker(41.4, 2.1, { accuracy: 30 });
        expect(libs.maps.Circle).toHaveBeenCalledWith(expect.objectContaining({ center: { lat: 41.4, lng: 2.1 }, radius: 30 }));
    });

    it('replaces the previous marker and accuracy circle instead of stacking them', async () => {
        const mm = await initManager();
        const first = mm.setUserLocationMarker(41.4, 2.1, { accuracy: 30 });
        const circle = mm._userLocationAccuracyCircle;
        mm.setUserLocationMarker(41.5, 2.2);
        expect(first.setMap).toHaveBeenCalledWith(null);
        expect(circle.setMap).toHaveBeenCalledWith(null);
        expect(mm._userLocationAccuracyCircle).toBeNull();
    });
});

describe('MapManager - setSearchRadiusCircle()', () => {
    it('draws a circle at the given position with the given radius and returns it', async () => {
        const mm = await initManager();
        const circle = mm.setSearchRadiusCircle(41.4, 2.1, 5000);
        expect(circle.opts).toMatchObject({ map: mockMap, center: { lat: 41.4, lng: 2.1 }, radius: 5000, strokeColor: '#a42016' });
        expect(circle.getBounds()).toBe('circle-bounds');
    });

    it('replaces the previous circle instead of stacking them', async () => {
        const mm = await initManager();
        const first = mm.setSearchRadiusCircle(41.4, 2.1, 5000);
        mm.setSearchRadiusCircle(41.4, 2.1, 10000);
        expect(first.setMap).toHaveBeenCalledWith(null);
    });
});

describe('MapManager - clearMarkers()', () => {
    it('empties the clusterer, the map, the sidebar and the category tracking', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        mm.addAllMarkersToCluster();
        mm._openInfoWindow(marker);
        mm.clearMarkers();
        expect(mockClusterer.clearMarkers).toHaveBeenCalled();
        expect(marker.setMap).toHaveBeenLastCalledWith(null);
        expect(mm.markers).toEqual([]);
        expect(mm.arrayCategoriesText).toEqual([]);
        expect(document.getElementById('map-list').innerHTML).toBe('');
        expect(mockInfoWindow.close).toHaveBeenCalled();
    });

    it('does not throw without a clusterer or a #map-list', async () => {
        const mm = await initManager('<div id="gMap"></div>');
        mm.addMarker(location());
        expect(() => mm.clearMarkers()).not.toThrow();
    });
});

describe('MapManager - addAllMarkersToCluster()', () => {
    it('creates the clusterer with every marker', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        mm.addAllMarkersToCluster();
        expect(MarkerClusterer).toHaveBeenCalledWith({ map: mockMap, markers: [marker] });
    });

    it('refills the existing clusterer instead of creating another', async () => {
        const mm = await initManager();
        mm.addAllMarkersToCluster();
        const marker = mm.addMarker(location());
        mm.addAllMarkersToCluster();
        expect(MarkerClusterer).toHaveBeenCalledTimes(1);
        expect(mockClusterer.clearMarkers).toHaveBeenCalled();
        expect(mockClusterer.addMarkers).toHaveBeenCalledWith([marker]);
    });
});

describe('MapManager - _createMarkerButton()', () => {
    it('appends the category header once, then one item per building', async () => {
        const mm = await initManager();
        mm.addMarker(location({ title: 'A' }));
        mm.addMarker(location({ title: 'B' }));
        const items = document.querySelectorAll('#map-list li');
        expect([...items].map(li => li.className)).toEqual(['castell header', 'castell', 'castell']);
        expect(items[0].innerHTML).toBe('Castells');
    });

    it('does nothing when the list is not in the page', async () => {
        const mm = await initManager('<div id="gMap"></div>');
        expect(() => mm.addMarker(location())).not.toThrow();
    });

    it('zooms to the building and opens its card on click', async () => {
        const mm = await initManager();
        mm.addMarker(location({ lat: 41.3, lng: 2.3 }));
        document.querySelectorAll('#map-list li')[1].click();
        expect(mockMap.setZoom).toHaveBeenCalledWith(15);
        expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 41.3, lng: 2.3 });
        expect(mockInfoWindow.open).toHaveBeenCalled();
    });

    it('highlights the marker on mouseover and restores it on mouseout', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        const li = document.querySelectorAll('#map-list li')[1];
        li.dispatchEvent(new Event('mouseover'));
        expect(marker.setZIndex).toHaveBeenLastCalledWith(2000);
        expect(marker.setIcon).toHaveBeenLastCalledWith('icon2.png');
        li.dispatchEvent(new Event('mouseout'));
        expect(marker.setZIndex).toHaveBeenLastCalledWith(1);
        expect(marker.setIcon).toHaveBeenLastCalledWith('icon.png');
    });

    it('only raises the marker when it has no icons to swap', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location({ icon: undefined, icon2: undefined }));
        const li = document.querySelectorAll('#map-list li')[1];
        li.dispatchEvent(new Event('mouseover'));
        li.dispatchEvent(new Event('mouseout'));
        expect(marker.setIcon).not.toHaveBeenCalled();
    });
});

describe('MapManager - map controls', () => {
    it('puts the logo bottom left', async () => {
        await initManager();
        expect(mockMap.controls[4][0].firstChild.src).toBe('http://localhost/images/logo/logoCM-red-mini.png');
    });

    it('groups the show/hide icons in one control, top right', async () => {
        const mm = await initManager();
        mm.addIcon({ category: 'castell', title: 'Castells', icon: 'c.png', visible: true });
        expect(mockMap.controls[3]).toEqual([mm.iconsControl]);
        expect(mm.iconsControl.children).toHaveLength(2);
    });

    it('hides and shows every category from the "all" icon, then re-centres', async () => {
        const mm = await initManager();
        mm.addMarker(location());
        mm.addIcon({ category: 'castell', title: 'Castells', icon: 'c.png', visible: true });
        const all = mm.iconsControl.children[0];
        all.click();
        expect(mm.visibleBuildings).toBe(false);
        expect(mm.icons[0].visible).toBe(false);
        expect(document.getElementById('visibleBuildings').src).toBe('http://localhost/images/controls/05.png');
        all.click();
        expect(document.getElementById('visibleBuildings').src).toBe('http://localhost/images/controls/06.png');
        expect(mockMap.setCenter).toHaveBeenCalled();
    });

    it('toggles one category from its icon, then re-centres', async () => {
        const mm = await initManager();
        mm.addMarker(location());
        mm.addIcon({ category: 'castell', title: 'Castells', icon: 'c.png', visible: true });
        mm.iconsControl.children[1].click();
        expect(mm.icons[0].visible).toBe(false);
        expect(document.getElementById('img-castell').style.opacity).toBe('0.5');
        mm.iconsControl.children[1].click();
        expect(document.getElementById('img-castell').style.opacity).toBe('1');
        expect(mockMap.setCenter).toHaveBeenCalledTimes(1);
    });

    it('starts the list icon open when the list is enabled', async () => {
        global.catalunyaGmapConfig = { listEnabled: true };
        await initManager();
        expect(document.getElementById('llistat').src).toBe('http://localhost/images/controls/04.png');
    });

    it('toggles the sidebar from the list icon, closing any open card', async () => {
        const mm = await initManager();
        mm._openInfoWindow(mm.addMarker(location()));
        const resize = jest.spyOn(mm, 'resize');
        mockMap.controls[1][0].click();
        expect(document.getElementById('secondaryDiv').style.display).toBe('');
        expect(document.getElementById('llistat').src).toBe('http://localhost/images/controls/04.png');
        expect(mockInfoWindow.close).toHaveBeenCalled();
        expect(resize).toHaveBeenCalled();
        mockMap.controls[1][0].click();
        expect(document.getElementById('secondaryDiv').style.display).toBe('none');
    });

    it('toggles the list icon without a sidebar or an open card', async () => {
        const mm = await initManager('<div id="gMap"></div>');
        expect(() => mockMap.controls[1][0].click()).not.toThrow();
        expect(mm.ListTextEnabled).toBe(true);
    });

    it('survives the image elements having been removed', async () => {
        const mm = await initManager();
        mm.addIcon({ category: 'castell', title: 'Castells', icon: 'c.png', visible: true });
        document.getElementById('visibleBuildings').remove();
        document.getElementById('img-castell').remove();
        document.getElementById('llistat').remove();
        expect(() => {
            mm.iconsControl.children[0].click();
            mockMap.controls[1][0].click();
        }).not.toThrow();
    });
});

describe('MapManager - _setVisible()', () => {
    it('adds and removes clustered markers and redraws the clusterer once', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        mm.addMarker(location({ category: 'torre' }));
        mm.addAllMarkersToCluster();
        mm._setVisible('castell', false);
        expect(mockClusterer.removeMarker).toHaveBeenCalledWith(marker, true);
        expect(mockClusterer.removeMarker).toHaveBeenCalledTimes(1);
        mm._setVisible('castell', true);
        expect(mockClusterer.addMarker).toHaveBeenCalledWith(marker, true);
        expect(mockClusterer.render).toHaveBeenCalledTimes(2);
    });

    it('puts markers on and off the map directly without a clusterer', async () => {
        const mm = await initManager();
        const marker = mm.addMarker(location());
        mm._setVisible('castell', false);
        expect(marker.setMap).toHaveBeenLastCalledWith(null);
        mm._setVisible('castell', true);
        expect(marker.setMap).toHaveBeenLastCalledWith(mockMap);
    });

    it('does not need the sidebar list to be in the page', async () => {
        const mm = await initManager('<div id="gMap"></div>');
        mm.addMarker(location());
        expect(() => mm._setVisible('castell', false)).not.toThrow();
    });

    it('hides and shows the category in the sidebar list', async () => {
        const mm = await initManager();
        mm.addMarker(location());
        mm._setVisible('castell', false);
        expect([...document.querySelectorAll('#map-list li')].every(li => li.style.display === 'none')).toBe(true);
        mm._setVisible('castell', true);
        expect([...document.querySelectorAll('#map-list li')].every(li => li.style.display === '')).toBe(true);
    });
});

describe('MapManager - helpers', () => {
    it("reads a marker's position from Google when it has no stored one", async () => {
        const mm = await initManager();
        const marker = makeMarker({ position: { lat: 40, lng: 1 } });
        expect(mm._positionOf(marker)).toEqual({ lat: 40, lng: 1 });
    });

    it('treats a missing or zero-size map element as hidden', async () => {
        const mm = await initManager();
        expect(mm._isHidden()).toBe(true);
        setSize(document.getElementById('gMap'), 800, 600);
        expect(mm._isHidden()).toBe(false);
        document.body.innerHTML = '';
        expect(mm._isHidden()).toBe(true);
    });

    it('does not follow the host theme where MutationObserver is unavailable', async () => {
        const observer = global.MutationObserver;
        delete global.MutationObserver;
        const mm = await initManager();
        expect(mm._themeObserver).toBeUndefined();
        global.MutationObserver = observer;
    });

    it('leaves the icons height alone while the map has no size', async () => {
        const mm = await initManager();
        mm._fitIconsControl();
        expect(mm.iconsControl.style.maxHeight).toBe('');
    });
});
