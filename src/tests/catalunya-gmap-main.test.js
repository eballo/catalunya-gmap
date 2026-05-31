/**
 * @jest-environment jsdom
 */

import {afterEach, beforeEach, describe, expect, it, jest, test} from "@jest/globals"; // Adjust the path as needed
import MapManager from '../app/catalunya-gmap-manager';

// Mocking the Google Maps JavaScript API
jest.mock('@googlemaps/js-api-loader', () => ({
    Loader: jest.fn().mockImplementation(() => ({
        importLibrary: jest.fn(library => {

                    return Promise.resolve({
                        Map: function() {
                            return {
                                setZoom: jest.fn(),
                                setCenter: jest.fn(),
                                setTilt: jest.fn(),
                                addListener: jest.fn(),
                                controls: Array.from({ length: 14 }, () => []),
                            };
                        },
                        Marker: function(opts) {  // Ensure the constructor is correctly mocked
                            return {
                                setPosition: jest.fn(),
                                setMap: jest.fn(),
                                addListener: jest.fn(),
                                ...opts
                            };
                        },
                        InfoWindow: function() {
                            return {
                                setContent: jest.fn(),
                                setPosition: jest.fn(),
                                open: jest.fn(),
                            };
                        },
                        ControlPosition: { TOP_LEFT: 0, TOP_RIGHT: 1, LEFT_TOP: 2, RIGHT_TOP: 3, BOTTOM_LEFT: 4 },
                        MapTypeId: { ROADMAP: 'roadmap' },
                        MapTypeControlStyle: { DROPDOWN_MENU: 'dropdown' },
                    });

        }),
    })),
}));

// Mocking MarkerClusterer separately if it's from another library
jest.mock("@googlemaps/markerclusterer", () => ({
    MarkerClusterer: jest.fn().mockImplementation((opts) => ({
        addMarker: jest.fn(),
        clearMarkers: jest.fn(),
        removeMarker: jest.fn(),
        render:jest.fn(),
        ...opts,
    }))
}));

// Mock stringToBoolean
jest.mock('../app/catalunya-gmap-extra', () => ({
    stringToBoolean: jest.fn()
}));



describe('MapManager', () => {
    let mapManager;
    let mockMap, mockMarker, mockInfoWindow, mockClusterer;

    beforeEach(() => {
        // Mocking HTML elements
        document.body.innerHTML =
            `
            <div id="mapId"></div>
            <ul id="map-list"></ul>`;

        mockMap = {
            setZoom: jest.fn(),
            setCenter: jest.fn(),
            setTilt: jest.fn(),
            controls: Array.from({ length: 14 }, () => []),
            addListener: jest.fn(),
        };
        mockMarker = jest.fn().mockImplementation(() => ({
            addListener: jest.fn(),
            setPosition: jest.fn(),
            setMap: jest.fn(),
        }));
        mockInfoWindow = {
            setContent: jest.fn(),
            setPosition: jest.fn(),
            open: jest.fn(),
            close: jest.fn(),
        };
        mockClusterer = {
            addMarker: jest.fn(),
            clearMarkers: jest.fn(),
            removeMarker: jest.fn(),
            render:jest.fn(),
        };

        // Mock global constructors
        global.google = {
            maps: {
                Map: jest.fn(() => mockMap),
                Marker: mockMarker,
                InfoWindow: jest.fn(() => mockInfoWindow),
                MarkerClusterer: jest.fn(() => mockClusterer),
                LatLng: jest.fn((lat, lng) => ({ lat, lng })),
                event: {
                    addListener: jest.fn(),
                    trigger: jest.fn(),
                },
                ControlPosition: {
                    TOP_LEFT: 0, TOP_RIGHT: 1, LEFT_TOP: 2, RIGHT_TOP: 3, BOTTOM_LEFT: 4
                },
                MapTypeId: { ROADMAP: 'roadmap' },
                MapTypeControlStyle: { DROPDOWN_MENU: 'dropdown' },
            }
        };

        global.navigator.geolocation = {
            getCurrentPosition: jest.fn()
        };

        global.$ = jest.fn().mockImplementation(() => {
            const el = {
                html: jest.fn(),
                css: jest.fn(),
                toggle: jest.fn(),
                toggleClass: jest.fn(),
                show: jest.fn(),
                hide: jest.fn(),
                each: jest.fn().mockImplementation(function (fn) { fn.call({}); return this; }),
                close: jest.fn(),
            };
            el[0] = { addEventListener: jest.fn() };
            el.length = 1;
            return el;
        });

        // Instance of MapManager
        mapManager = new MapManager('mapId');
        mapManager._createIcon = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original functionality to all mocks
    });

    test('initialization sets up properties correctly', () => {
        expect(mapManager.mapId).toBe('mapId');
        expect(mapManager.map).toBeDefined();
    });

    test('initMap creates a map instance', async () => {
        await mapManager.initMap();
        expect(mapManager.map).toBeDefined();
        expect(mapManager.google).toBeDefined();
        expect(mapManager.marker).toBeDefined();
        expect(mapManager.core).toBeDefined();
    });

    test('initialize and create a marker', async () => {
        await mapManager.initMap(); // Make sure initMap is awaited
        const location = { lat: 41.3851, lng: 2.1734, title: "Barcelona", icon: "icon-url" };
        const marker = mapManager.createMarker(location); // Now this should work
        expect(marker).toBeDefined();
    });

    test('addMarker should add a marker to the map and markers array', async () => {

        await mapManager.initMap(); // Make sure initMap is awaited
        mapManager._createMarkerButton = jest.fn()

        const location = { lat: 41.3851, lng: 2.1734, title: "Barcelona", icon: "icon-url" };
        mapManager.addMarker(location);

        expect(mapManager.markers.length).toBe(1);
    });

    test('getMarker should return the markers array', async () => {
        await mapManager.initMap(); // Make sure initMap is awaited
        const location = { lat: 41.3851, lng: 2.1734, title: "Barcelona", icon: "icon-url" };
        mapManager.addMarker(location);

        expect(mapManager.markers.length).toBe(1);
        let markers = mapManager.getMarkers()
        expect(markers.length).toBe(1)
    });

    test('addContentToMarker should bind content to a marker', async () => {
        await mapManager.initMap(); // Make sure initMap is awaited
        const location = { lat: 41.3851, lng: 2.1734, content: "Hello, World!" };
        const marker = mapManager.createMarker(location);
        mapManager.addContentToMarker(location, marker);

        expect(mapManager.infowindow).toBeDefined()
    });

    test('addAllMarkersToCluster should add all markers to a cluster', async () => {
        await mapManager.initMap(); // Make sure initMap is awaited

        mapManager.addAllMarkersToCluster();

        expect(mapManager.clusterer).toBeDefined()
    });

    test('addIcon should add an icon object to the icons array and call _createIcon', async () => {
        const edifici = {
            title: "Cathedral",
            icon: "cathedral.png",
            category: "historical"
        };

        await mapManager.initMap(); // Make sure initMap is awaited
        mapManager.addIcon(edifici);

        // Check if the icon has been added to the list
        expect(mapManager.icons.length).toBe(1);
        expect(mapManager.icons[0]).toBe(edifici);

        // Verify that _createIcon was called correctly
        expect(mapManager._createIcon).toHaveBeenCalledWith(edifici);
    });


    test('resize should recenter the map if no markers are present', async() => {
        await mapManager.initMap(); // Make sure initMap is awaited
        mapManager.markers = [] // no markers
        mapManager.addAllMarkersToCluster() // Initialize the cluster
        mapManager.map = mockMap;

        mapManager.resize();

        expect(mockMap.setCenter).toHaveBeenCalledWith({lat: 41.440908754848165, lng: 1.81713925781257});
        expect(mockMap.setZoom).toHaveBeenCalledWith(8);
    });

    test('resize should render for the given markers', async() => {
        await mapManager.initMap(); // Make sure initMap is awaited

        const location = { lat: 41.3851, lng: 2.1734, content: "Hello, World!" };
        mapManager.createMarker(location);
        mapManager.clusterer = mockClusterer;
        mapManager.userPosition = false;
        mapManager.clusterer.markers = "a value" // just to make the cluster.markers.length > 0
        mapManager._refreshMap = jest.fn()

        mapManager.resize();

        expect(mockClusterer.render).toHaveBeenCalled();
    });

    test('should return true when item exists in the array', () => {
        mapManager.arrayCategoriesText = ['Historical', 'Modern', 'Art']; // Sample data
        expect(mapManager._exist('Modern')).toBe(true);
    });

    test('should return false when item does not exist in the array', () => {
        mapManager.arrayCategoriesText = ['Historical', 'Modern', 'Art']; // Sample data
        expect(mapManager._exist('Ancient')).toBe(false);
    });

    test('should return false for an empty string if not present in the array', () => {
        mapManager.arrayCategoriesText = ['Historical', 'Modern', 'Art']; // Sample data
        expect(mapManager._exist('')).toBe(false);
    });

    test('should handle case sensitivity correctly', () => {
        mapManager.arrayCategoriesText = ['Historical', 'Modern', 'Art']; // Sample data
        expect(mapManager._exist('modern')).toBe(false); // Assuming case sensitivity
        mapManager.arrayCategoriesText.push('modern');
        expect(mapManager._exist('modern')).toBe(true);
    });

    test('should return false for undefined or null', () => {
        mapManager.arrayCategoriesText = ['Historical', 'Modern', 'Art']; // Sample data
        expect(mapManager._exist(undefined)).toBe(false);
        expect(mapManager._exist(null)).toBe(false);
    });

    test('should set visibility of all icons to false', () => {
        mapManager.icons = [
            { category: 'Historical', visible: true },
            { category: 'Modern', visible: true }
        ];
        // Mock _setVisible to isolate _changeVisibility behavior
        mapManager._setVisible = jest.fn();

        mapManager._changeVisibility(false);

        expect(mapManager.icons.every(icon => icon.visible === false)).toBe(true);
        expect(mapManager._setVisible).toHaveBeenCalledTimes(mapManager.icons.length);
    });

    test('should set visibility of all icons to true', () => {
        mapManager.icons = [
            { category: 'Historical', visible: true },
            { category: 'Modern', visible: true }
        ];
        // Mock _setVisible to isolate _changeVisibility behavior
        mapManager._setVisible = jest.fn();

        // First set all to false
        mapManager.icons.forEach(icon => icon.visible = false);
        mapManager._changeVisibility(true);
        expect(mapManager.icons.every(icon => icon.visible === true)).toBe(true);
        expect(mapManager._setVisible).toHaveBeenCalledTimes(mapManager.icons.length);
    });

    test('should call _setVisible with correct parameters', () => {
        mapManager.icons = [
            { category: 'Historical', visible: true },
            { category: 'Modern', visible: true }
        ];
        // Mock _setVisible to isolate _changeVisibility behavior
        mapManager._setVisible = jest.fn();

        mapManager._changeVisibility(false);
        expect(mapManager._setVisible).toHaveBeenCalledWith('Historical', false);
        expect(mapManager._setVisible).toHaveBeenCalledWith('Modern', false);
    });

    test('should enable markers by category', () => {
        mapManager.clusterer = mockClusterer;
        mapManager.markers = [
            { category: 'Historical', visible: false, map: null },
            { category: 'Modern', visible: false, map: null },
            { category: 'Historical', visible: false, map: null }
        ];

        mapManager._enableMarkersByCategory('Historical');
        const historicalMarkers = mapManager.markers.filter(marker => marker.category === 'Historical');

        // All historical markers should be visible and added back to the map
        historicalMarkers.forEach(marker => {
            expect(marker.visible).toBe(true);
            expect(mockClusterer.addMarker).toHaveBeenCalledWith(marker, true);
        });

        // Ensure only historical markers are not affected
        expect(mapManager.markers.find(marker => marker.category === 'Modern').visible).toBe(false);
        expect(mockClusterer.addMarker).toHaveBeenCalledTimes(2);
    });


    test('should disable markers by category', () => {
        mapManager.clusterer = mockClusterer;
        mapManager.markers = [
            { category: 'Historical', visible: true, map: null },
            { category: 'Modern', visible: true, map: null },
            { category: 'Historical', visible: true, map: null }
        ];

        mapManager._disableMarkersByCategory('Historical');
        const historicalMarkers = mapManager.markers.filter(marker => marker.category === 'Historical');

        // All historical markers should be visible and added back to the map
        historicalMarkers.forEach(marker => {
            expect(marker.visible).toBe(false);
            expect(mockClusterer.removeMarker).toHaveBeenCalledWith(marker, true);
        });

        // Ensure only historical markers are not affected
        expect(mapManager.markers.find(marker => marker.category === 'Modern').visible).toBe(true);
        expect(mockClusterer.removeMarker).toHaveBeenCalledTimes(2);
    });

    test('should append a new list item to "map-list"', () => {
        jest.spyOn(document, 'getElementById').mockReturnValue(document.getElementById('map-list'));

        const opts = { title: "Test Marker", category: "testCategory" };
        mapManager._createMarkerButton(mockMarker, opts);

        const ul = document.getElementById("map-list");
        expect(ul.children.length).toBe(2); // Check if a new list item is added
        expect(ul.innerHTML).toContain("Test Marker"); // Check content
    });

    // --- constructor with catalunyaGmapConfig ---
    test('constructor reads listEnabled and config from catalunyaGmapConfig', () => {
        global.catalunyaGmapConfig = { listEnabled: true, secondaryDivId: 'customDiv', listId: 'custom-list' };
        const mm = new MapManager('testId');
        expect(mm.ListTextEnabled).toBe(true);
        expect(mm.secondaryDivId).toBe('customDiv');
        delete global.catalunyaGmapConfig;
    });

    // --- initMap catch ---
    test('initMap logs error when loader fails', async () => {
        const { Loader } = require('@googlemaps/js-api-loader');
        Loader.mockImplementationOnce(() => ({
            importLibrary: jest.fn().mockRejectedValue(new Error('load error')),
        }));
        const failingManager = new MapManager('mapId');
        jest.spyOn(console, 'error').mockImplementation(() => {});
        await failingManager.initMap();
        expect(console.error).toHaveBeenCalledWith(
            'Error loading the Google Maps script', expect.any(Error)
        );
    });

    // --- resetView ---
    test('resetView resets center and zoom', async () => {
        await mapManager.initMap();
        mapManager.map = mockMap;
        mapManager.resetView();
        expect(mockMap.setCenter).toHaveBeenCalled();
        expect(mockMap.setZoom).toHaveBeenCalledWith(8);
    });

    // --- resize debug logging ---
    test('resize logs debug info when markers are present', async () => {
        await mapManager.initMap();
        mapManager.clusterer = { ...mockClusterer, markers: ['a'] };
        mapManager._refreshMap = jest.fn();
        mapManager.debug = true;
        jest.spyOn(console, 'log').mockImplementation(() => {});
        mapManager.resize();
        expect(console.log).toHaveBeenCalled();
    });

    test('resize logs debug info when markers are absent', async () => {
        await mapManager.initMap();
        mapManager.clusterer = { ...mockClusterer, markers: [] };
        mapManager.map = mockMap;
        mapManager.debug = true;
        jest.spyOn(console, 'log').mockImplementation(() => {});
        mapManager.resize();
        expect(console.log).toHaveBeenCalled();
    });

    // --- addContentToMarker event handlers ---
    test('addContentToMarker click handler opens infowindow with location content', async () => {
        await mapManager.initMap();
        const location = { lat: 41.0, lng: 2.0, content: 'Hello!' };
        const marker = mapManager.createMarker(location);
        mapManager.addContentToMarker(location, marker);
        const clickHandler = marker.addListener.mock.calls.find(c => c[0] === 'click')?.[1];
        clickHandler();
        expect(mapManager.infowindow.setContent).toHaveBeenCalledWith('Hello!');
        expect(mapManager.infowindow.open).toHaveBeenCalled();
    });

    test('addContentToMarker skips InfoWindow creation when infowindow already set', async () => {
        await mapManager.initMap();
        const location = { lat: 41.0, lng: 2.0, content: 'Already!' };
        const marker = mapManager.createMarker(location);
        mapManager.infowindow = mockInfoWindow;
        mapManager.addContentToMarker(location, marker);
        expect(mapManager.infowindow).toBe(mockInfoWindow);
    });

    test('addContentToMarker domready close button invokes infowindow.close', async () => {
        await mapManager.initMap();
        const location = { lat: 41.0, lng: 2.0, content: 'Hello!' };
        const marker = mapManager.createMarker(location);
        mapManager.infowindow = mockInfoWindow;
        mapManager.addContentToMarker(location, marker);
        const domreadyCall = global.google.maps.event.addListener.mock.calls.find(c => c[1] === 'domready');
        expect(domreadyCall).toBeDefined();
        domreadyCall[2]();
        const jqResult = global.$.mock.results[global.$.mock.results.length - 1].value;
        const closeClickHandler = jqResult[0].addEventListener.mock.calls[0][1];
        closeClickHandler();
        expect(mockInfoWindow.close).toHaveBeenCalled();
    });

    // --- _createMarkerButton event handlers ---
    test('_createMarkerButton click handler pans map to marker position', () => {
        mapManager.map = mockMap;
        const opts = { title: 'Castle', category: 'clickcat', categoryName: 'ClickCat', icon: 'a.png', icon2: 'b.png' };
        const fakeMarker = { position: { lat: 41.0, lng: 2.0 }, setZIndex: jest.fn(), setIcon: jest.fn() };
        mapManager._createMarkerButton(fakeMarker, opts);
        const ul = document.getElementById('map-list');
        ul.lastElementChild.click();
        expect(mockMap.setZoom).toHaveBeenCalledWith(15);
        expect(mockMap.setCenter).toHaveBeenCalledWith(fakeMarker.position);
    });

    test('_createMarkerButton skips category header when category already exists', () => {
        const opts = { title: 'Castle 1', category: 'repeatcat', categoryName: 'RepeatCat', icon: 'a.png', icon2: 'b.png' };
        const fakeMarker = { position: {}, setZIndex: jest.fn(), setIcon: jest.fn() };
        mapManager._createMarkerButton(fakeMarker, opts);
        const countAfterFirst = document.getElementById('map-list').children.length;
        mapManager._createMarkerButton(fakeMarker, { ...opts, title: 'Castle 2' });
        const countAfterSecond = document.getElementById('map-list').children.length;
        expect(countAfterSecond).toBe(countAfterFirst + 1);
    });

    test('_createMarkerButton mouseover and mouseout handlers change marker icon', () => {
        const opts = { title: 'Tower', category: 'hovercat', categoryName: 'HoverCat', icon: 'icon.png', icon2: 'icon2.png' };
        const fakeMarker = { position: {}, setZIndex: jest.fn(), setIcon: jest.fn() };
        mapManager._createMarkerButton(fakeMarker, opts);
        const ul = document.getElementById('map-list');
        const li = ul.lastElementChild;
        li.dispatchEvent(new MouseEvent('mouseover'));
        expect(fakeMarker.setZIndex).toHaveBeenCalledWith(2000);
        expect(fakeMarker.setIcon).toHaveBeenCalledWith('icon2.png');
        li.dispatchEvent(new MouseEvent('mouseout'));
        expect(fakeMarker.setZIndex).toHaveBeenCalledWith(1);
        expect(fakeMarker.setIcon).toHaveBeenCalledWith('icon.png');
    });

    // --- _setIconTextList initial icon when ListTextEnabled is true ---
    test('_setIconTextList uses icon 04 when ListTextEnabled starts true', async () => {
        mapManager.ListTextEnabled = true;
        await mapManager.initMap();
        const showTextList = mapManager.map.controls[1][0];
        const controlText = showTextList.querySelector('#llistat');
        expect(controlText.innerHTML).toContain('04.png');
    });

    // --- _setRemoveAllIcons click handler ---
    test('_setRemoveAllIcons click toggles visibleBuildings and calls _changeVisibility', async () => {
        await mapManager.initMap();
        mapManager._changeVisibility = jest.fn();
        const controlDiv = mapManager.map.controls[3][0];
        const controlUI = controlDiv.querySelector('div');
        // First click: visibleBuildings true → false (covers number = "05" branch)
        controlUI.click();
        expect(mapManager.visibleBuildings).toBe(false);
        expect(mapManager._changeVisibility).toHaveBeenCalledWith(false);
        // Second click: visibleBuildings false → true (covers number = "06" branch)
        controlUI.click();
        expect(mapManager.visibleBuildings).toBe(true);
        expect(mapManager._changeVisibility).toHaveBeenCalledWith(true);
    });

    // --- _createIcon actual implementation + click ---
    test('_createIcon creates control div and click toggles edifici visibility', async () => {
        await mapManager.initMap();
        const realCreateIcon = MapManager.prototype._createIcon.bind(mapManager);
        const edifici = { id: 1, title: 'Castells', category: 'castell', icon: 'a.png', visible: true };
        mapManager._setVisible = jest.fn();
        const initialLen = mapManager.map.controls[3].length;
        const controlDiv = realCreateIcon(edifici);
        expect(mapManager.map.controls[3].length).toBe(initialLen + 1);
        const controlUI = controlDiv.querySelector('div');
        // First click: visible true → false
        controlUI.click();
        expect(edifici.visible).toBe(false);
        expect(mapManager._setVisible).toHaveBeenCalledWith('castell', false);
        // Second click: visible false → true
        controlUI.click();
        expect(edifici.visible).toBe(true);
        expect(mapManager._setVisible).toHaveBeenCalledWith('castell', true);
    });

    // --- _setIconTextList click handler ---
    test('_setIconTextList click toggles list and handles infowindow close', async () => {
        await mapManager.initMap();
        mapManager.resize = jest.fn();
        const showTextList = mapManager.map.controls[1][0];
        const controlUI = showTextList.querySelector('div');
        // First click: no infowindow, ListTextEnabled false → true (covers "04" branch)
        controlUI.click();
        expect(mapManager.ListTextEnabled).toBe(true);
        expect(mapManager.resize).toHaveBeenCalled();
        // Second click: with infowindow, ListTextEnabled true → false (covers "03" branch and close)
        mapManager.infowindow = mockInfoWindow;
        controlUI.click();
        expect(mapManager.ListTextEnabled).toBe(false);
        expect(mockInfoWindow.close).toHaveBeenCalled();
    });

    // --- _setVisible ---
    test('_setVisible with visible=true enables markers and text', () => {
        mapManager.clusterer = mockClusterer;
        mapManager.markers = [{ category: 'castell', visible: false, map: null }];
        mapManager.resize = jest.fn();
        mapManager._setVisible('castell', true);
        expect(mapManager.markers[0].visible).toBe(true);
        expect(mapManager.resize).toHaveBeenCalled();
    });

    test('_setVisible with visible=false disables markers and text', () => {
        mapManager.clusterer = mockClusterer;
        mapManager.markers = [{ category: 'castell', visible: true, map: null }];
        mapManager.resize = jest.fn();
        mapManager._setVisible('castell', false);
        expect(mapManager.markers[0].visible).toBe(false);
        expect(mapManager.resize).toHaveBeenCalled();
    });

    // --- _refreshMap ---
    test('_refreshMap triggers Google Maps resize event', async () => {
        await mapManager.initMap();
        mapManager._refreshMap();
        expect(global.google.maps.event.trigger).toHaveBeenCalledWith(mapManager.map, 'resize');
    });

});




