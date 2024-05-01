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
    MarkerClusterer: jest.fn().mockImplementation(() => ({
        addMarker: jest.fn(),
        clearMarkers: jest.fn(),
        removeMarker: jest.fn(),
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

});




