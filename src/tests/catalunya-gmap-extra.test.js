/**
 * @jest-environment jsdom
 */

import { stringToBoolean, filterByComarca, filterByMunicipi, slugify, fetchMapData, default as handleSearchTextList } from '../app/catalunya-gmap-extra';
import {describe, expect, test, jest} from "@jest/globals";

describe('stringToBoolean', () => {
    test('converts "true" to true', () => {
        expect(stringToBoolean("true")).toBeTruthy();
    });

    test('converts "false" to false', () => {
        expect(stringToBoolean("false")).toBeFalsy();
    });

    test('converts any non-"false" string to true', () => {
        expect(stringToBoolean("hello")).toBeTruthy();
        expect(stringToBoolean("123")).toBeTruthy();
        expect(stringToBoolean("")).toBeFalsy(); // Empty string is a special case, converting to false
    });

    test('passes real booleans through unchanged', () => {
        // window.catalunyaGmapConfig fields set by PHP (e.g. `userPosition: true`)
        // arrive as real JS booleans, not strings — used to throw here.
        expect(stringToBoolean(true)).toBe(true);
        expect(stringToBoolean(false)).toBe(false);
    });

    test('treats undefined/null as false', () => {
        expect(stringToBoolean(undefined)).toBeFalsy();
        expect(stringToBoolean(null)).toBeFalsy();
    });
});

describe('handleSearchTextList', () => {
    document.body.innerHTML =
        '<input id="search-list" />' +
        '<ul id="map-list">' +
        '<li>Árbol</li>' +
        '<li>carro</li>' +
        '<li>fenómeno</li>' +
        '</ul>';

    const input = document.getElementById('search-list');
    const ul = document.getElementById('map-list');
    const li = ul.getElementsByTagName('li');

    test('filters list items based on search text', () => {
        input.value = 'ar';
        handleSearchTextList({ target: input });
        expect(li[0].style.display).toBe(''); // arbol contains ar
        expect(li[1].style.display).toBe(''); // carro contains ar
        expect(li[2].style.display).toBe('none'); // fenomeno doen't contain ar
    });

    test('shows items with empty innerHTML (else branch)', () => {
        document.body.innerHTML =
            '<input id="search-list2" />' +
            '<ul id="map-list">' +
            '<li></li>' +
            '</ul>';
        const input2 = document.getElementById('search-list2');
        input2.value = 'anything';
        handleSearchTextList({ target: input2 });
        const emptyLi = document.querySelector('#map-list li');
        expect(emptyLi.style.display).toBe('');
    });

    test('returns early when map-list is absent', () => {
        document.body.innerHTML = '<input id="no-list" />';
        const input3 = document.getElementById('no-list');
        input3.value = 'test';
        expect(() => handleSearchTextList({ target: input3 })).not.toThrow();
    });
});

describe('filterByComarca', () => {
    const markers = [
        { id: 1, title: 'A', comarca: 'Terra Alta' },
        { id: 2, title: 'B', comarca: 'Barcelonès' },
        { id: 3, title: 'C', comarca: 'Gironès' },
    ];

    test('returns only markers matching the comarca', () => {
        expect(filterByComarca(markers, 'Barcelonès')).toEqual([markers[1]]);
    });

    test('is case and accent insensitive', () => {
        expect(filterByComarca(markers, 'terra alta')).toEqual([markers[0]]);
        expect(filterByComarca(markers, 'GIRONES')).toEqual([markers[2]]);
    });

    test('returns all markers when comarca is empty', () => {
        expect(filterByComarca(markers, '')).toBe(markers);
    });

    test('returns empty array when no marker matches', () => {
        expect(filterByComarca(markers, 'Osona')).toEqual([]);
    });

    test('treats markers without a comarca field as non-matching', () => {
        expect(filterByComarca([{ id: 4, title: 'D' }], 'Osona')).toEqual([]);
    });
});

describe('filterByMunicipi', () => {
    const markers = [
        { id: 1, title: 'A', municipi: 'Arnes' },
        { id: 2, title: 'B', municipi: 'Batea' },
        { id: 3, title: 'C', municipi: 'Gandesa' },
    ];

    test('returns only markers matching the municipi', () => {
        expect(filterByMunicipi(markers, 'Batea')).toEqual([markers[1]]);
    });

    test('is case and accent insensitive', () => {
        expect(filterByMunicipi(markers, 'gandesa')).toEqual([markers[2]]);
    });

    test('returns all markers when municipi is empty', () => {
        expect(filterByMunicipi(markers, '')).toBe(markers);
    });

    test('returns empty array when no marker matches', () => {
        expect(filterByMunicipi(markers, 'Corbera')).toEqual([]);
    });
});

describe('removeAccents', () => {
    const removeAccents = require('../app/catalunya-gmap-extra').removeAccents; // Ensure this points correctly

    test('removes accents from provided string', () => {
        expect(removeAccents('féñ')).toBe('feñ');
        expect(removeAccents('áéíóú')).toBe('aeiou');
        expect(removeAccents('ÁÉÍÓÚ')).toBe('AEIOU');
        expect(removeAccents('çÇ')).toBe('cC');
        expect(removeAccents('hello')).toBe('hello'); // No change expected
    });
});

describe('slugify', () => {
    test('matches the real comarca slugs used across the project', () => {
        expect(slugify('Alt Empordà')).toBe('alt-emporda');
        expect(slugify('Barcelonès')).toBe('barcelones');
        expect(slugify('Alta Ribagorça')).toBe('alta-ribagorca');
        expect(slugify('Vallès Occidental')).toBe('valles-occidental');
        expect(slugify('Lluçanès')).toBe('llucanes');
    });

    test('drops apostrophes without inserting a hyphen', () => {
        expect(slugify("Pla d'Urgell")).toBe('pla-durgell');
        expect(slugify("Pla de l'Estany")).toBe('pla-de-lestany');
        expect(slugify("Ribera d'Ebre")).toBe('ribera-debre');
        expect(slugify("Vall d'Aran")).toBe('vall-daran');
    });

    test('is stable for already-plain names', () => {
        expect(slugify('Selva')).toBe('selva');
        expect(slugify('Terra Alta')).toBe('terra-alta');
    });

    test('returns an empty string for empty input', () => {
        expect(slugify('')).toBe('');
        expect(slugify(undefined)).toBe('');
    });
});

describe('fetchMapData', () => {
    test('fetches the bare url when there is no nonce', () => {
        global.fetch = jest.fn().mockResolvedValue({});
        fetchMapData('http://x/markers.json', '');
        expect(global.fetch).toHaveBeenCalledWith('http://x/markers.json');
    });

    test('sends the nonce as X-CM-Nonce header, never in the url', () => {
        global.fetch = jest.fn().mockResolvedValue({});
        fetchMapData('http://x/markers.json', 'abc123');
        expect(global.fetch).toHaveBeenCalledWith('http://x/markers.json', { headers: { 'X-CM-Nonce': 'abc123' } });
    });
});
