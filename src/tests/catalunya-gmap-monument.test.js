import {describe, expect, it, jest} from "@jest/globals";
import MonumentBuilder from "../app/catalunya-gmap-monument";
import MockData from './mockBuildingData';

jest.mock("../app/catalunya-gmap-manager", () => {
    return jest.fn().mockImplementation(() => {
        return {
            initMap: jest.fn().mockResolvedValue('Mock Map'),
            addMarker: jest.fn(),
            addIcon: jest.fn(),
            addAllMarkersToCluster: jest.fn()
        };
    });
});

// Setting up environment variable
process.env.SERVER_HOST = "http://localhost/";

// Global variables
global.aCastells = MockData.aCastells;
global.aEpocaCarlina = MockData.aEpocaCarlina;
global.aMuralles = MockData.aMuralles;
global.aTorres = MockData.aTorres;
global.aCasaForta = MockData.aCasaForta;
global.aPalau = MockData.aPalau;
global.aPont = MockData.aPont;
global.aTorreColomer = MockData.aTorreColomer;
global.aBasilica = MockData.aBasilica;
global.aCatedral = MockData.aCatedral;
global.aErmita = MockData.aErmita;
global.aEsglesia = MockData.aEsglesia;
global.aEsglesiaFortificada = MockData.aEsglesiaFortificada;
global.aMonestir = MockData.aMonestir;
global.aAltres = MockData.aAltres;

// --- Basic Tests
describe("MonumentBuilder - Basic Tests", () => {

    describe("MonumentBuilder Constructor", () => {
        it("should initialize with default properties", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            expect(mapBuilder.mapManager).toBeDefined();
            expect(mapBuilder.map).toBeNull();
            expect(mapBuilder.styleType1).toBe(7);
            expect(mapBuilder.styleType2).toBe(6);
            expect(mapBuilder.serverHost).toBe("http://localhost/");
        });
    });

    describe("create", () => {
        it("should initialize the map and call other methods", async () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            jest.spyOn(mapBuilder, 'addMilitars');
            jest.spyOn(mapBuilder, 'addReligioses');
            jest.spyOn(mapBuilder, 'addCivils');
            jest.spyOn(mapBuilder, 'addAltresLlocsInteres');

            const mapManager = await mapBuilder.create();
            expect(mapBuilder.map).toEqual('Mock Map');
            expect(mapBuilder.addMilitars).toHaveBeenCalled();
            expect(mapBuilder.addReligioses).toHaveBeenCalled();
            expect(mapBuilder.addCivils).toHaveBeenCalled();
            expect(mapBuilder.addAltresLlocsInteres).toHaveBeenCalled();
            expect(mapBuilder.mapManager.addAllMarkersToCluster).toHaveBeenCalled();
            expect(mapManager).toEqual(mapBuilder.mapManager);
        });
    });

    describe("addMilitars", () => {
        it("should call methods to add military buildings", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            jest.spyOn(mapBuilder, 'addCastells');
            jest.spyOn(mapBuilder, 'addEpocaCarlina');
            jest.spyOn(mapBuilder, 'addMuralles');
            jest.spyOn(mapBuilder, 'addTorres');

            mapBuilder.addMilitars();

            expect(mapBuilder.addCastells).toHaveBeenCalled();
            expect(mapBuilder.addEpocaCarlina).toHaveBeenCalled();
            expect(mapBuilder.addMuralles).toHaveBeenCalled();
            expect(mapBuilder.addTorres).toHaveBeenCalled();
        });
    });

    describe("addCivils", () => {
        it("should call methods to add civil buildings", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            jest.spyOn(mapBuilder, 'addCasaForta');
            jest.spyOn(mapBuilder, 'addPalau');
            jest.spyOn(mapBuilder, 'addPont');
            jest.spyOn(mapBuilder, 'addTorreColomer');

            mapBuilder.addCivils();

            expect(mapBuilder.addCasaForta).toHaveBeenCalled();
            expect(mapBuilder.addPalau).toHaveBeenCalled();
            expect(mapBuilder.addPont).toHaveBeenCalled();
            expect(mapBuilder.addTorreColomer).toHaveBeenCalled();
        });
    });


    describe("addReligioses", () => {
        it("should call methods to add religious buildings", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            jest.spyOn(mapBuilder, 'addBasilica');
            jest.spyOn(mapBuilder, 'addCatedral');
            jest.spyOn(mapBuilder, 'addErmita');
            jest.spyOn(mapBuilder, 'addEsglesia');
            jest.spyOn(mapBuilder, 'addEsglesiaFortificada');
            jest.spyOn(mapBuilder, 'addMonestir');

            mapBuilder.addReligioses();

            expect(mapBuilder.addBasilica).toHaveBeenCalled();
            expect(mapBuilder.addCatedral).toHaveBeenCalled();
            expect(mapBuilder.addErmita).toHaveBeenCalled();
            expect(mapBuilder.addEsglesia).toHaveBeenCalled();
            expect(mapBuilder.addEsglesiaFortificada).toHaveBeenCalled();
            expect(mapBuilder.addMonestir).toHaveBeenCalled();
        });
    });

    describe("addAltres", () => {
        it("should call the method to add other places of interest", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            jest.spyOn(mapBuilder, 'addAltresLlocsInteres');

            mapBuilder.addAltres();

            expect(mapBuilder.addAltresLlocsInteres).toHaveBeenCalled();
        });
    });
});

// --- Military
describe("Military Buildings", () => {
    describe("addCastells", () => {
        it("should add markers for each castell to the map", () => {
            // Instantiate the MonumentBuilder with a mock map ID
            const mapBuilder = new MonumentBuilder("testMapId");

            // Mock the global array containing castell data
            global.aCastells = [
                {
                    title: "Castell de Montjuïc",
                    link: "http://example.com/montjuic",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.364, long: 2.156}
                }
            ];

            // Spy on the addMarker method of the mapManager instance
            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            // Call the method under test
            mapBuilder.addCastells();

            // Assert that the addMarker method was called correctly
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "castell0",
                title: "Castell de Montjuïc",
                link: "http://example.com/montjuic",
                type: "militar",
                lat: 41.364,
                lng: 2.156,
                visible: true,
                content: expect.any(String), // Will be validated in a different test
                icon: "http://localhost/assets/images/catalunya-gmap/gmap/militar/castell/castell7.png",
                icon2: "http://localhost/assets/images/catalunya-gmap/gmap/militar/castell/castell6.png",
                category: "castell",
                categoryName: "Castells"
            });
        });
    });

    describe("addEpocaCarlina", () => {
        it("should add markers for each 'Época Carlina' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aEpocaCarlina = [
                {
                    title: "Fort de Carlina",
                    link: "http://example.com/fort",
                    thumbs: "image_url",
                    municipi: "Girona",
                    poblacio: "Girona",
                    provincia: "Girona",
                    position: {lat: 42.267, long: 2.960}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addEpocaCarlina();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "epoca-carlina0",
                title: "Fort de Carlina",
                link: "http://example.com/fort",
                type: "militar",
                lat: 42.267,
                lng: 2.960,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("epoca-carlina7.png"),
                icon2: expect.stringContaining("epoca-carlina6.png"),
                category: "epoca-carlina",
                categoryName: "Època Carlina"
            });
        });
    });

    describe("addMuralles", () => {
        it("should add markers for each 'Muralles' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aMuralles = [
                {
                    title: "Muralla de Tarragona",
                    link: "http://example.com/muralla",
                    thumbs: "image_url",
                    municipi: "Tarragona",
                    poblacio: "Tarragona",
                    provincia: "Tarragona",
                    position: {lat: 41.118, long: 1.260}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addMuralles();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "muralles0",
                title: "Muralla de Tarragona",
                link: "http://example.com/muralla",
                type: "militar",
                lat: 41.118,
                lng: 1.260,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("muralles7.png"),
                icon2: expect.stringContaining("muralles6.png"),
                category: "muralles",
                categoryName: "Muralles"
            });
        });
    });


    describe("addTorres", () => {
        it("should add markers for each 'Torres' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aTorres = [
                {
                    title: "Torre de Collserola",
                    link: "http://example.com/torre",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.418, long: 2.195}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addTorres();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "torre0",
                title: "Torre de Collserola",
                link: "http://example.com/torre",
                type: "militar",
                lat: 41.418,
                lng: 2.195,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("torre7.png"),
                icon2: expect.stringContaining("torre6.png"),
                category: "torre",
                categoryName: "Torres"
            });
        });
    });
})

// --- Civils
describe("Civil Buildings", () => {
    describe("addCasaForta", () => {
        it("should add markers for each 'Casa Forta' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aCasaForta = [
                {
                    title: "Casa Forta Pi",
                    link: "http://example.com/casa",
                    thumbs: "image_url",
                    municipi: "Lleida",
                    poblacio: "Lleida",
                    provincia: "Lleida",
                    position: {lat: 41.617, long: 0.627}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addCasaForta();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "casa-forta0",
                title: "Casa Forta Pi",
                link: "http://example.com/casa",
                type: "civil",
                lat: 41.617,
                lng: 0.627,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("casa-forta7.png"),
                icon2: expect.stringContaining("casa-forta6.png"),
                category: "casa-forta",
                categoryName: "Cases Fortes"
            });
        });
    });

    describe("addPalau", () => {
        it("should add markers for each 'Palau' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aPalau = [
                {
                    title: "Palau de la Generalitat",
                    link: "http://example.com/palau",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.382, long: 2.177}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addPalau();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "palau0",
                title: "Palau de la Generalitat",
                link: "http://example.com/palau",
                type: "civil",
                lat: 41.382,
                lng: 2.177,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("palau7.png"),
                icon2: expect.stringContaining("palau6.png"),
                category: "palau",
                categoryName: "Palaus"
            });
        });
    });

    describe("addPont", () => {
        it("should add markers for each 'Pont' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aPont = [
                {
                    title: "Pont del Diable",
                    link: "http://example.com/pont",
                    thumbs: "image_url",
                    municipi: "Tarragona",
                    poblacio: "Tarragona",
                    provincia: "Tarragona",
                    position: {lat: 41.131, long: 1.244}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addPont();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "pont0",
                title: "Pont del Diable",
                link: "http://example.com/pont",
                type: "civil",
                lat: 41.131,
                lng: 1.244,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("pont7.png"),
                icon2: expect.stringContaining("pont6.png"),
                category: "pont",
                categoryName: "Ponts"
            });
        });
    });

    describe("addTorreColomer", () => {
        it("should add markers for each 'Torre Colomer' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aTorreColomer = [
                {
                    title: "Torre de Colomer",
                    link: "http://example.com/torrecolomer",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.401, long: 2.172}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addTorreColomer();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "torre-colomer0",
                title: "Torre de Colomer",
                link: "http://example.com/torrecolomer",
                type: "civil",
                lat: 41.401,
                lng: 2.172,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("torre-colomer7.png"),
                icon2: expect.stringContaining("torre-colomer6.png"),
                category: "torre-colomer",
                categoryName: "Torres Colomer"
            });
        });
    });
});

// --- Religious
describe("Religious Buildings", () => {
    describe("addBasilica", () => {
        it("should add markers for each 'Basilica' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aBasilica = [
                {
                    title: "Basilica de la Sagrada Familia",
                    link: "http://example.com/basilica",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.403, long: 2.174}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addBasilica();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "basilica0",
                title: "Basilica de la Sagrada Familia",
                link: "http://example.com/basilica",
                type: "religios",
                lat: 41.403,
                lng: 2.174,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("basilica7.png"),
                icon2: expect.stringContaining("basilica6.png"),
                category: "basilica",
                categoryName: "Basíliques"
            });
        });
    });

    describe("addCatedral", () => {
        it("should add markers for each 'Catedral' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aCatedral = [
                {
                    title: "Catedral de Girona",
                    link: "http://example.com/catedral",
                    thumbs: "image_url",
                    municipi: "Girona",
                    poblacio: "Girona",
                    provincia: "Girona",
                    position: {lat: 41.987, long: 2.825}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addCatedral();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "catedral0",
                title: "Catedral de Girona",
                link: "http://example.com/catedral",
                type: "religios",
                lat: 41.987,
                lng: 2.825,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("catedral7.png"),
                icon2: expect.stringContaining("catedral6.png"),
                category: "catedral",
                categoryName: "Catedrals"
            });
        });
    });

    describe("addErmita", () => {
        it("should add markers for each 'Ermita' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aErmita = [
                {
                    title: "Ermita de Sant Ramon",
                    link: "http://example.com/ermita",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.376, long: 2.168}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addErmita();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "ermita0",
                title: "Ermita de Sant Ramon",
                link: "http://example.com/ermita",
                type: "religios",
                lat: 41.376,
                lng: 2.168,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("ermita7.png"),
                icon2: expect.stringContaining("ermita6.png"),
                category: "ermita",
                categoryName: "Ermites"
            });
        });
    });

    describe("addEsglesia", () => {
        it("should add markers for each 'Esglesia' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aEsglesia = [
                {
                    title: "Esglesia de Santa Maria",
                    link: "http://example.com/esglesia",
                    thumbs: "image_url",
                    municipi: "Tarragona",
                    poblacio: "Tarragona",
                    provincia: "Tarragona",
                    position: {lat: 41.106, long: 1.253}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addEsglesia();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "esglesia0",
                title: "Esglesia de Santa Maria",
                link: "http://example.com/esglesia",
                type: "religios",
                lat: 41.106,
                lng: 1.253,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("esglesia7.png"),
                icon2: expect.stringContaining("esglesia6.png"),
                category: "esglesia",
                categoryName: "Esglésies"
            });
        });
    });

    describe("addEsglesiaFortificada", () => {
        it("should add markers for each 'Esglesia Fortificada' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aEsglesiaFortificada = [
                {
                    title: "Esglesia Fortificada de Ulldemolins",
                    link: "http://example.com/esglesiafortificada",
                    thumbs: "image_url",
                    municipi: "Tarragona",
                    poblacio: "Tarragona",
                    provincia: "Tarragona",
                    position: {lat: 41.259, long: 0.896}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addEsglesiaFortificada();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "esglesia-fortificada0",
                title: "Esglesia Fortificada de Ulldemolins",
                link: "http://example.com/esglesiafortificada",
                type: "religios",
                lat: 41.259,
                lng: 0.896,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("esglesia-fortificada7.png"),
                icon2: expect.stringContaining("esglesia-fortificada6.png"),
                category: "esglesia-fortificada",
                categoryName: "Esglésies fortificades"
            });
        });
    });

    describe("addMonestir", () => {
        it("should add markers for each 'Monestir' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aMonestir = [
                {
                    title: "Monestir de Montserrat",
                    link: "http://example.com/monestir",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.593, long: 1.835}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addMonestir();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "monestir0",
                title: "Monestir de Montserrat",
                link: "http://example.com/monestir",
                type: "religios",
                lat: 41.593,
                lng: 1.835,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("monestir7.png"),
                icon2: expect.stringContaining("monestir6.png"),
                category: "monestir",
                categoryName: "Monestirs"
            });
        });
    });

});

// --- Other Buildings
describe("Other Buildings", () => {
    describe("addAltresLlocsInteres", () => {
        it("should add markers for each 'Altres Llocs d'Interes' location to the map with correct icon URLs", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            global.aAltres = [
                {
                    title: "Museu Nacional d'Art de Catalunya",
                    link: "http://example.com/museu",
                    thumbs: "image_url",
                    municipi: "Barcelona",
                    poblacio: "Barcelona",
                    provincia: "Barcelona",
                    position: {lat: 41.368, long: 2.159}
                }
            ];

            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder.addAltresLlocsInteres();

            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledTimes(1);
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "altres-llocs-dinteres0",
                title: "Museu Nacional d'Art de Catalunya",
                link: "http://example.com/museu",
                type: "altres",
                lat: 41.368,
                lng: 2.159,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("altres-llocs-dinteres7.png"),
                icon2: expect.stringContaining("altres-llocs-dinteres6.png"),
                category: "altres-llocs-dinteres",
                categoryName: "Altres llocs d'Interés"
            });
        });
    });

});

// --- Private Methods / Helpers
describe("Private Methods - Helper functions", () => {

    describe("_getIcon", () => {
        it("should construct the icon URL correctly", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            const url = mapBuilder._getIcon("militar", "castell", 1);
            expect(url).toBe("http://localhost/assets/images/catalunya-gmap/gmap/militar/castell/castell1.png");
        });
    });

    describe("_capitalize", () => {
        it("should capitalize the first letter of a word and make all other letters lowercase", () => {
            const mapBuilder = new MonumentBuilder("testMapId");

            const result = mapBuilder._capitalize("hello");
            expect(result).toBe("Hello");

            const result2 = mapBuilder._capitalize("HELLO");
            expect(result2).toBe("Hello");

            const result3 = mapBuilder._capitalize("hELLO");
            expect(result3).toBe("Hello");
        });
    });

    describe("_extract", () => {
        it("should extract building data into a formatted object", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            const building = {
                title: "Example Building",
                link: "http://example.com",
                thumbs: "image_url",
                municipi: "City",
                poblacio: "Town",
                provincia: "Province",
                position: {lat: 34.05, long: -118.25}
            };

            const result = mapBuilder._extract(building, "example-category", "Example Category", 1, "civil");

            expect(result).toEqual({
                id: "example-category1",
                title: "Example Building",
                link: "http://example.com",
                type: "civil",
                lat: 34.05,
                lng: -118.25,
                visible: true,
                content: expect.any(String),
                icon: expect.stringContaining("example-category7.png"),
                icon2: expect.stringContaining("example-category6.png"),
                category: "example-category",
                categoryName: "Example Category"
            });
        });
    });

    describe("_createContent", () => {
        it("should create HTML content correctly", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            const content = mapBuilder._createContent("Title", "Link", "Image", "Municipi", "Poblacio", "Provincia", "militar", "castell", "Castells");
            expect(content).toContain("<div class='catmed-google-maps-marker'>");
            expect(content).toContain("Title");
            expect(content).toContain("Municipi, Poblacio, Provincia");
        });
    });

    describe("_addEdifici", () => {
        it("should process each building in the provided array and add it as a marker", () => {
            const mapBuilder = new MonumentBuilder("testMapId");
            const buildings = [
                {
                    title: "Building One",
                    link: "http://example.com/one",
                    thumbs: "image_url1",
                    municipi: "City1",
                    poblacio: "Town1",
                    provincia: "Province1",
                    position: {lat: 35.05, long: -119.25}
                }
            ];

            jest.spyOn(mapBuilder, '_extract').mockImplementation(() => ({
                id: "example1",
                title: "Building One",
                link: "http://example.com/one",
                type: "civil",
                lat: 35.05,
                lng: -119.25,
                visible: true,
                content: "some content",
                icon: "some_icon_url",
                icon2: "some_icon2_url",
                category: "category",
                categoryName: "Category Name"
            }));
            jest.spyOn(mapBuilder.mapManager, 'addMarker');

            mapBuilder._addEdifici(1, buildings, "category", "Category Name", "civil");

            expect(mapBuilder._extract).toHaveBeenCalled();
            expect(mapBuilder.mapManager.addMarker).toHaveBeenCalledWith({
                id: "example1",
                title: "Building One",
                link: "http://example.com/one",
                type: "civil",
                lat: 35.05,
                lng: -119.25,
                visible: true,
                content: "some content",
                icon: "some_icon_url",
                icon2: "some_icon2_url",
                category: "category",
                categoryName: "Category Name"
            });
        });
    });

});




