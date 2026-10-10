/**
 * @jest-environment jsdom
 */
import {describe, expect, it, beforeEach, jest} from "@jest/globals";
import MonumentBuilder from "../app/catalunya-gmap-monument";

jest.mock("../app/catalunya-gmap-manager", () => {
    return jest.fn().mockImplementation(() => ({
        initMap: jest.fn().mockResolvedValue('Mock Map'),
        addMarker: jest.fn(),
        addIcon: jest.fn(),
        addAllMarkersToCluster: jest.fn(),
        fitToMarkers: jest.fn(),
        getMarkerById: jest.fn(),
        selectMarker: jest.fn(),
        loadComarcaBoundaries: jest.fn(),
    }));
});

jest.mock('../app/catalunya-gmap-extra', () => ({
    stringToBoolean: jest.fn(),
    fetchMapData: jest.fn((url, nonce) => nonce ? fetch(url, { headers: { 'X-CM-Nonce': nonce } }) : fetch(url)),
    filterByComarca: jest.fn((markers, comarca) => markers.filter(m => m.comarca === comarca)),
    filterByMunicipi: jest.fn((markers, municipi) => markers.filter(m => m.municipi === municipi)),
    slugify: jest.fn(value => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')),
}));

process.env.SERVER_HOST = "http://localhost/";

// New JSON marker format
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

    it("reads MARKERS_JSON_URL from env", () => {
        process.env.MARKERS_JSON_URL = "js/catalunya-markers.json";
        const mb = new MonumentBuilder("testMapId");
        expect(mb.markersJsonUrl).toBe("js/catalunya-markers.json");
        delete process.env.MARKERS_JSON_URL;
    });

    it("reads mapDataNonce from catalunyaGmapConfig, empty by default", () => {
        expect(new MonumentBuilder("testMapId").mapDataNonce).toBe("");
        global.catalunyaGmapConfig = { mapDataNonce: "n0nce" };
        expect(new MonumentBuilder("testMapId").mapDataNonce).toBe("n0nce");
        delete global.catalunyaGmapConfig;
    });

    it("prefers catalunyaGmapConfig.markersJsonUrl over env", () => {
        process.env.MARKERS_JSON_URL = "js/from-env.json";
        global.catalunyaGmapConfig = { markersJsonUrl: "js/from-config.json" };
        const mb = new MonumentBuilder("testMapId");
        expect(mb.markersJsonUrl).toBe("js/from-config.json");
        delete global.catalunyaGmapConfig;
        delete process.env.MARKERS_JSON_URL;
    });

    it("defaults comarca to '' and edificiId to null when absent", () => {
        const mb = new MonumentBuilder("testMapId");
        expect(mb.comarca).toBe("");
        expect(mb.edificiId).toBeNull();
    });

    it("reads comarca and edificiId from catalunyaGmapConfig", () => {
        global.catalunyaGmapConfig = { comarca: "Terra Alta", edificiId: "22073" };
        const mb = new MonumentBuilder("testMapId");
        expect(mb.comarca).toBe("Terra Alta");
        expect(mb.edificiId).toBe(22073);
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
        // 3 distinct tipus in mockMarkers → 3 calls
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

    it("filters markers by comarca and fits the map to them when comarca is set", async () => {
        global.catalunyaGmapConfig = { comarca: "Tarragonès" };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);
        jest.spyOn(mb, '_addEdificiList');

        await mb.create();

        expect(mb._addEdificiList).toHaveBeenCalledTimes(1);
        expect(mb._addEdificiList).toHaveBeenCalledWith(3, [mockMarkers[1]], "muralles", "Muralles", "militar");
        expect(mb.mapManager.fitToMarkers).toHaveBeenCalled();
        delete global.catalunyaGmapConfig;
    });

    it("filters markers by municipi when set", async () => {
        global.catalunyaGmapConfig = { municipi: "Girona" };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);
        jest.spyOn(mb, '_addEdificiList');

        await mb.create();

        expect(mb._addEdificiList).toHaveBeenCalledTimes(1);
        expect(mb._addEdificiList).toHaveBeenCalledWith(10, [mockMarkers[2]], "catedral", "Catedrals", "religios");
        delete global.catalunyaGmapConfig;
    });

    it("applies comarca and municipi filters together", async () => {
        global.catalunyaGmapConfig = { comarca: "Tarragonès", municipi: "Girona" };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);
        jest.spyOn(mb, '_addEdificiList');

        await mb.create();

        expect(mb._addEdificiList).not.toHaveBeenCalled();
        delete global.catalunyaGmapConfig;
    });

    it("fits bounds even when comarca is not set (e.g. server-side pre-filtered markers)", async () => {
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);

        await mb.create();

        expect(mb.mapManager.fitToMarkers).toHaveBeenCalled();
    });

    it("selects the marker matching edificiId when found", async () => {
        global.catalunyaGmapConfig = { edificiId: 1 };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);
        const fakeMarker = { fake: true };
        mb.mapManager.getMarkerById.mockReturnValue(fakeMarker);

        await mb.create();

        expect(mb.mapManager.getMarkerById).toHaveBeenCalledWith(1);
        expect(mb.mapManager.selectMarker).toHaveBeenCalledWith(fakeMarker);
        delete global.catalunyaGmapConfig;
    });

    it("does not select a marker when edificiId matches nothing", async () => {
        global.catalunyaGmapConfig = { edificiId: 999 };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);
        mb.mapManager.getMarkerById.mockReturnValue(undefined);

        await mb.create();

        expect(mb.mapManager.selectMarker).not.toHaveBeenCalled();
        delete global.catalunyaGmapConfig;
    });

    it("does not load comarca boundaries when comarquesJsonUrl is not set", async () => {
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);

        await mb.create();

        expect(mb.mapManager.loadComarcaBoundaries).not.toHaveBeenCalled();
    });

    it("uses config.comarcaSlug directly when provided, without deriving/slugifying anything", async () => {
        global.catalunyaGmapConfig = { comarquesJsonUrl: "http://x/comarques.json", comarcaSlug: "girones" };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);

        await mb.create();

        expect(mb.mapManager.loadComarcaBoundaries).toHaveBeenCalledWith("http://x/comarques.json", "girones", "");
        delete global.catalunyaGmapConfig;
    });

    it("falls back to slugifying the active comarca derived from a single-comarca result", async () => {
        const { slugify } = require('../app/catalunya-gmap-extra');
        global.catalunyaGmapConfig = { comarca: "Gironès", comarquesJsonUrl: "http://x/comarques.json" };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);

        await mb.create();

        expect(mb.mapManager.loadComarcaBoundaries).toHaveBeenCalledWith("http://x/comarques.json", slugify("Gironès"), "");
        delete global.catalunyaGmapConfig;
    });

    it("falls back to an empty slug when the loaded markers span more than one comarca and there is no config.comarca", async () => {
        global.catalunyaGmapConfig = { comarquesJsonUrl: "http://x/comarques.json" };
        const mb = new MonumentBuilder("testMapId");
        jest.spyOn(mb, '_loadMarkers').mockResolvedValue(mockMarkers);

        await mb.create();

        expect(mb.mapManager.loadComarcaBoundaries).toHaveBeenCalledWith("http://x/comarques.json", "", "");
        delete global.catalunyaGmapConfig;
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

    it("sends mapDataNonce as X-CM-Nonce header when fetching markers", async () => {
        const mb = new MonumentBuilder("testMapId");
        mb.markersJsonUrl = "http://localhost/markers.json";
        mb.mapDataNonce = "n0nce";
        global.fetch = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue(mockMarkers) });

        await mb._loadMarkers();

        expect(global.fetch).toHaveBeenCalledWith("http://localhost/markers.json", { headers: { "X-CM-Nonce": "n0nce" } });
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
    it("extracts building data from new JSON format using lat/lng/img", () => {
        const mb = new MonumentBuilder("testMapId");
        const building = {
            id: 22073, title: "Castell Test", link: "http://example.com", img: "http://example.com/img.jpg",
            lat: 41.3, lng: 2.1, municipi: "Barcelona", comarca: "Barcelonès", provincia: "Barcelona"
        };

        const result = mb._extract(building, "castell", "Castells", 0, "militar");

        expect(result).toMatchObject({
            id: "castell0",
            edificiId: 22073,
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

    it("handles missing optional fields (img, comarca) gracefully", () => {
        const mb = new MonumentBuilder("testMapId");
        const building = { title: "Test", link: "http://example.com", lat: 41.0, lng: 1.0 };

        const result = mb._extract(building, "ermita", "Ermites", 2, "religios");

        expect(result.lat).toBe(41.0);
        expect(result.lng).toBe(1.0);
        expect(result.content).not.toContain('<img');
    });

    it("omits 'Veure contingut' when the building matches the active edificiId", () => {
        global.catalunyaGmapConfig = { edificiId: 22073 };
        const mb = new MonumentBuilder("testMapId");
        const building = {
            id: 22073, title: "Castell Test", link: "http://example.com",
            lat: 41.3, lng: 2.1
        };

        const result = mb._extract(building, "castell", "Castells", 0, "militar");

        expect(result.content).not.toContain("Veure contingut");
    });

    it("keeps 'Veure contingut' for buildings other than the active edificiId", () => {
        global.catalunyaGmapConfig = { edificiId: 22073 };
        const mb = new MonumentBuilder("testMapId");
        const building = {
            id: 999, title: "Another Castle", link: "http://example.com",
            lat: 41.3, lng: 2.1
        };

        const result = mb._extract(building, "castell", "Castells", 0, "militar");

        expect(result.content).toContain("Veure contingut");
    });

    it("passes the building's lat/lng through to the directions button", () => {
        const mb = new MonumentBuilder("testMapId");
        mb.userPosition = true;
        const building = {
            id: 22073, title: "Castell Test", link: "http://example.com",
            lat: 41.3, lng: 2.1
        };

        const result = mb._extract(building, "castell", "Castells", 0, "militar");

        expect(result.content).toContain("destination=41.3,2.1");
    });
});

// --- _createContent() ---
describe("MonumentBuilder - _createContent()", () => {
    it("renders the marker container and title", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("My Castle", "http://link.com", "", "Barcelona", "Barcelonès", "Barcelona", "militar", "castell", "Castells");
        expect(content).toContain("<div class='catmed-maps-marker'>");
        expect(content).toContain("My Castle");
    });

    it("renders the category badge with the type class", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Girona", "Gironès", "Girona", "religios", "catedral", "Catedrals");
        expect(content).toContain("catmed-maps-marker-badge religios");
        expect(content).toContain("Catedrals");
    });

    it("renders 'Veure contingut' CTA linking to the monument page", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://example.com/monument", "", "Lleida", "Segrià", "Lleida", "civil", "palau", "Palaus");
        expect(content).toContain("catmed-maps-marker-cta");
        expect(content).toContain("Veure contingut");
        expect(content).toContain("http://example.com/monument");
    });

    it("omits the 'Veure contingut' CTA when isCurrentPost is true", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://example.com/monument", "", "Lleida", "Segrià", "Lleida", "civil", "palau", "Palaus", true);
        expect(content).not.toContain("catmed-maps-marker-cta");
        expect(content).not.toContain("Veure contingut");
    });

    it("includes its own close button (Google's InfoWindow header is off)", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Barcelona", "Barcelonès", "Barcelona", "militar", "castell", "Castells");
        expect(content).toContain("<button type='button' class='catmed-maps-marker-close' aria-label='Tanca'>");
    });

    it("includes the address when all location fields are present", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Tarragona", "Tarragonès", "Tarragona", "militar", "castell", "Castells");
        expect(content).toContain("Tarragona, Tarragonès");
    });

    it("omits the address row when all location fields are empty", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", null, null, null, "militar", "castell", "Castells");
        expect(content).not.toContain("catmed-maps-marker-info-item-address");
    });

    it("deduplicates address when municipi and comarca are identical", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Badalona", "Badalona", "Barcelona", "militar", "castell", "Castells");
        expect(content).toContain("Badalona, Barcelona");
        expect(content).not.toContain("Badalona, Badalona");
    });

    it("omits comarca when it matches municipi", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Barcelona", "Barcelona", "Barcelona", "militar", "castell", "Castells");
        expect(content).not.toContain("Barcelona, Barcelona, Barcelona");
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

    it("includes the directions button when userPosition is enabled and lat/lng are provided", () => {
        const mb = new MonumentBuilder("testMapId");
        mb.userPosition = true;
        const content = mb._createContent("Test", "http://link.com", "", "Barcelona", "Barcelonès", "Barcelona", "militar", "castell", "Castells", false, 41.3, 2.1);
        expect(content).toContain("catmed-maps-marker-directions");
        expect(content).toContain("destination=41.3,2.1");
    });

    it("omits the directions button when userPosition is disabled", () => {
        const mb = new MonumentBuilder("testMapId");
        const content = mb._createContent("Test", "http://link.com", "", "Barcelona", "Barcelonès", "Barcelona", "militar", "castell", "Castells", false, 41.3, 2.1);
        expect(content).not.toContain("catmed-maps-marker-directions");
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
        expect(mb._add_ruta(41.3, 2.1)).not.toContain("Ruta");
    });

    it("returns empty string when userPosition is enabled but lat/lng are missing", () => {
        const mb = new MonumentBuilder("testMapId");
        mb.userPosition = true;
        expect(mb._add_ruta()).not.toContain("Ruta");
    });

    it("returns ruta HTML with a Google Maps directions link to the building's coordinates", () => {
        const mb = new MonumentBuilder("testMapId");
        mb.userPosition = true;
        const ruta = mb._add_ruta(41.3, 2.1);
        expect(ruta).toContain("Ruta");
        expect(ruta).toContain("https://www.google.com/maps/dir/?api=1&amp;destination=41.3,2.1");
    });
});

// --- popupActions hook ---
describe("MonumentBuilder - popupActions", () => {
    const building = { id: 7, title: "Castell", link: "/castell/", lat: 41.3, lng: 2.1, municipi: "Cardona" };

    afterEach(() => {
        delete global.catalunyaGmapConfig;
    });

    it("adds nothing without a hook", () => {
        const result = new MonumentBuilder("testMapId")._extract(building, "castell", "Castells", 0, "militar");
        expect(result.content).not.toContain("catmed-maps-marker-actions");
    });

    it("appends the host's HTML for the building", () => {
        global.catalunyaGmapConfig = { popupActions: (edifici) => "<button data-id='" + edifici.id + "'>Afegeix</button>" };
        const result = new MonumentBuilder("testMapId")._extract(building, "castell", "Castells", 0, "militar");
        expect(result.content).toContain("<div class='catmed-maps-marker-actions'><button data-id='7'>Afegeix</button></div>");
    });

    it("ignores a hook that throws or returns no string", () => {
        global.catalunyaGmapConfig = { popupActions: () => { throw new Error("broken"); } };
        expect(new MonumentBuilder("testMapId")._extract(building, "castell", "Castells", 0, "militar").content)
            .not.toContain("catmed-maps-marker-actions");
        global.catalunyaGmapConfig = { popupActions: () => null };
        expect(new MonumentBuilder("testMapId")._extract(building, "castell", "Castells", 0, "militar").content)
            .not.toContain("catmed-maps-marker-actions");
    });

    it("ignores a popupActions that is not a function", () => {
        global.catalunyaGmapConfig = { popupActions: "<b>nope</b>" };
        expect(new MonumentBuilder("testMapId").popupActions).toBeNull();
    });
});

