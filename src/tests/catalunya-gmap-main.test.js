/**
 * @jest-environment jsdom
 */

import {beforeEach, describe, expect, it, jest, test} from "@jest/globals"; // Adjust the path as needed
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

// Mocking HTML elements
document.body.innerHTML = `
  <div id="mapId"></div>
`;

describe('MapManager', () => {
    let mapManager;
    let mockMap, mockMarker, mockInfoWindow, mockClusterer;

    beforeEach(() => {
        mockMap = {
            setZoom: jest.fn(),
            setCenter: jest.fn(),
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
                },
                ControlPosition: {
                    TOP_LEFT: 0, TOP_RIGHT: 1, LEFT_TOP: 2, RIGHT_TOP: 3, BOTTOM_LEFT: 4
                },
                MapTypeId: { ROADMAP: 'roadmap' },
                MapTypeControlStyle: { DROPDOWN_MENU: 'dropdown' },
            }
        };

        // Instance of MapManager
        mapManager = new MapManager('mapId');
        mapManager._createMarkerButton = jest.fn();
        mapManager._createIcon = jest.fn();
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

});




