/**
 * @jest-environment jsdom
 */
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import MonumentBuilder from "../app/catalunya-gmap-monument";

jest.mock("../app/catalunya-gmap-manager", () => {
    return jest.fn().mockImplementation(() => ({
        initMap: jest.fn().mockResolvedValue('Mock Map'),
        addMarker: jest.fn(),
        addIcon: jest.fn(),
        addAllMarkersToCluster: jest.fn()
    }));
});

jest.mock('../app/catalunya-gmap-extra', () => ({
    stringToBoolean: jest.fn()
}));

process.env.SERVER_HOST = "http://localhost/";

const mockMarkers = [
    { id: 1, title: "Castell de Montjuïc",   link: "http://example.com/montjuic",  img: "http://example.com/castell.jpg",  lat: 41.364, lng: 2.156, tipus: "castell",  municipi: "Barcelona", comarca: "Barcelonès", provincia: "Barcelona" },
    { id: 2, title: "Muralla de Tarragona",   link: "http://example.com/muralla",   img: "",                                lat: 41.118, lng: 1.260, tipus: "muralles", municipi: "Tarragona", comarca: "Tarragonès", provincia: "Tarragona" },
    { id: 3, title: "Catedral de Girona",     link: "http://example.com/catedral",  img: "http://example.com/catedral.jpg", lat: 41.987, lng: 2.825, tipus: "catedral", municipi: "Girona",    comarca: "Gironès",    provincia: "Girona"    },
];

// --- Constructor ---
describe("MonumentBuilder - Constructor", () => {
    it("initializes with default properties", () => {
        const mb = new MonumentBuilder("testMapId");
        expect(mb.mapManager).toBeDefined();
        expect(mb.map).toBeNull();
        expect(mb.styleType1).toBe(7);
        expect(mb.styleType2).toBe(6);
        expect(mb.serverHost).toBe("http://localhost/");
        expect(mb.markersJsonUrl).toBe("");
    });

    it("reads markersJsonUrl from catalunyaGmapConfig", () => {
        global.catalunyaGmapConfig = { markersJsonUrl: "js/from-config.json" };
        const mb = new MonumentBuilder("testMapId");
        expect(mb.markersJsonUrl).toBe("js/from-config.json");
        delete global.catalunyaGmapConfig;
    });
});

// --- create() ---
describe("MonumentBuilder - create()", () => {
    it("initializes the map, groups markers by tipus and adds each type", async () => {
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);
        jest.spyOn(mb, '_addEdificiList');

        const result = await mb.create();

        expect(mb.map).toEqual('Mock Map');
        expect(mb._addEdificiList).toHaveBeenCalledTimes(3);
        expect(mb.mapManager.addAllMarkersToCluster).toHaveBeenCalled();
        expect(result).toEqual(mb.mapManager);
    });

    it("calls _addEdificiList with correct args for known category", async () => {
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue([mockMarkers[0]]);
        jest.spyOn(mb, '_addEdificiList');

        await mb.create();

        expect(mb._addEdificiList).toHaveBeenCalledWith(
            1,
            [mockMarkers[0]],
            "castell",
            "Castells",
            "militar"
        );
    });

    it("does not call _addEdificiList when markers list is empty", async () => {
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue([]);
        jest.spyOn(mb, '_addEdificiList');

        await mb.create();

        expect(mb._addEdificiList).not.toHaveBeenCalled();
    });

    it("groups markers with missing tipus under empty key (not matched by any BUILDING_TYPES entry)", async () => {
        const mb = new MonumentBuilder("testMapId");
        const markerWithoutTipus = { id: 99, title: "Unknown", lat: 41.0, lng: 1.0 };
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue([markerWithoutTipus]);
        jest.spyOn(mb, '_addEdificiList');

        await mb.create();

        expect(mb._addEdificiList).not.toHaveBeenCalled();
    });
});

// --- _loadMarkers() ---
describe("MonumentBuilder - _loadMarkers()", () => {
    it("returns markers from cm-edificis-data DOM element when present", async () => {
        const mb = new MonumentBuilder("testMapId");
        document.body.innerHTML = `<script id="cm-edificis-data" type="application/json">[{"id":1,"title":"Test","tipus":"castell","lat":41.1,"lng":2.1}]</script>`;

        const markers = await mb._loadMarkers();

        expect(markers).toHaveLength(1);
        expect(markers[0].title).toBe("Test");
        document.body.innerHTML = '';
    });

    it("fetches from markersJsonUrl when set and no DOM element", async () => {
        const mb = new MonumentBuilder("testMapId");
        mb.markersJsonUrl = "http://localhost/markers.json";
        global.fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue(mockMarkers) });

        const markers = await mb._loadMarkers();

        expect(global.fetch).toHaveBeenCalledWith("http://localhost/markers.json");
        expect(markers).toEqual(mockMarkers);
    });

    it("returns empty array when neither DOM element nor markersJsonUrl is available", async () => {
        const mb = new MonumentBuilder("testMapId");
        mb.markersJsonUrl = "";

        const markers = await mb._loadMarkers();

        expect(markers).toEqual([]);
    });

    it("returns empty array and logs error when cm-edificis-data contains invalid JSON", async () => {
        const mb = new MonumentBuilder("testMapId");
        document.body.innerHTML = `<script id="cm-edificis-data" type="application/json">NOT_VALID_JSON</script>`;
        jest.spyOn(console, 'error').mockImplementation(() => {});

        const markers = await mb._loadMarkers();

        expect(markers).toEqual([]);
        expect(console.error).toHaveBeenCalled();
        document.body.innerHTML = '';
    });
});

// --- _addEdificiList() ---
describe("MonumentBuilder - _addEdificiList()", () => {
    it("adds a marker for each building in the list", () => {
        const mb = new MonumentBuilder("testMapId");
        const buildings = [mockMarkers[0], mockMarkers[1]];

        mb._addEdificiList(1, buildings, "castell", "Castells", "militar");

        expect(mb.mapManager.addMarker).toHaveBeenCalledTimes(2);
    });

    it("adds the category icon control", () => {
        const mb = new MonumentBuilder("testMapId");

        mb._addEdificiList(3, [mockMarkers[2]], "catedral", "Catedrals", "religios");

        expect(mb.mapManager.addIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 3,
                visible: true,
                title: "Catedrals",
                category: "catedral",
            })
        );
    });
});

// --- _extract() ---
describe("MonumentBuilder - _extract()", () => {
    it("extracts building data from JSON format using lat/lng/img", () => {
        const mb = new MonumentBuilder("testMapId");
        const building = {
            title: "Castell Test", link: "http://example.com", img: "http://example.com/img.jpg",
            lat: 41.3, lng: 2.1, municipi: "Barcelona", comarca: "Barcelonès", provincia: "Barcelona"
        };

        const result = mb._extract(building, "castell", "Castells", 0, "militar");

        expect(result).toMatchObject({
            id: "castell0",
            title: "Castell Test",
            link: "http://example.com",
            lat: 41.3,
            lng: 2.1,
            visible: true,
            type: "militar",
            category: "castell",
            categoryName: "Castells",
            icon: expect.stringContaining("castell7.png"),
            icon2: expect.stringContaining("castell6.png"),
            content: expect.any(String),
        });
    });

    it("handles missing optional fields (img) gracefully", () => {
        const mb = new MonumentBuilder("testMapId");
        const building = { title: "Test", link: "http://example.com", lat: 41.0, lng: 1.0 };

        const result = mb._extract(building, "ermita", "Ermites", 2, "religios");

        expect(result.lat).toBe(41.0);
        expect(result.lng).toBe(1.0);
        expect(result.content).not.toContain('<img');
    });
});

// --- _createContent() ---
describe("MonumentBuilder - _createContent()", () => {
    it("renders the marker container and title", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("My Castle", "http://link.com", "", "Barcelona", "Barcelonès", "Barcelona", "militar", "castell", "Castells");
        expect(content).toContain("<div class='catmed-google-maps-marker'>");
        expect(content).toContain("My Castle");
    });

    it("includes the address when all location fields are present", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Tarragona", "Tarragonès", "Tarragona", "militar", "castell", "Castells");
        expect(content).toContain("Tarragona, Tarragonès");
    });

    it("deduplicates address when municipi and comarca are identical", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Badalona", "Badalona", "Barcelona", "militar", "castell", "Castells");
        expect(content).toContain("Badalona, Barcelona");
        expect(content).not.toContain("Badalona, Badalona");
    });

    it("handles null municipi", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", null, "Barcelonès", "Barcelona", "militar", "castell", "Castells");
        expect(content).toContain("Barcelonès, Barcelona");
    });

    it("handles null comarca", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Viladecans", null, "Barcelona", "militar", "castell", "Castells");
        expect(content).toContain("Viladecans, Barcelona");
    });

    it("handles null provincia", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Pals", "Baix Empordà", null, "civil", "pont", "Ponts");
        expect(content).toContain("Pals, Baix Empordà");
    });
});

// --- _getIcon() ---
describe("MonumentBuilder - _getIcon()", () => {
    it("constructs the icon URL correctly", () => {
        const mb = new MonumentBuilder("testMapId");
        expect(mb._getIcon("militar", "castell", 7)).toBe("http://localhost/images/militar/castell/castell7.png");
        expect(mb._getIcon("religios", "catedral", 6)).toBe("http://localhost/images/religios/catedral/catedral6.png");
    });
});

// --- _capitalize() ---
describe("MonumentBuilder - _capitalize()", () => {
    it("capitalizes first letter and lowercases the rest", () => {
        const mb = new MonumentBuilder("testMapId");
        expect(mb._capitalize("hello")).toBe("Hello");
        expect(mb._capitalize("HELLO")).toBe("Hello");
        expect(mb._capitalize("hELLO")).toBe("Hello");
    });
});

// --- _add_ruta() ---
describe("MonumentBuilder - _add_ruta()", () => {
    it("returns empty string when userPosition is disabled", () => {
        const mb = new MonumentBuilder("testMapId");
        expect(mb._add_ruta()).not.toContain("Ruta");
    });

    it("returns ruta HTML when userPosition is enabled", () => {
        const mb = new MonumentBuilder("testMapId");
        mb.userPosition = true;
        expect(mb._add_ruta()).toContain("Ruta");
    });
});
