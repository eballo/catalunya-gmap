/**
 * @jest-environment jsdom
 */

import { stringToBoolean, default as handleSearchTextList } from '../app/catalunya-gmap-extra';
import {describe, expect, test} from "@jest/globals";

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
});

describe('handleSearchTextList', () => {
    document.body.innerHTML =
        '<input id="searchBox" />' +
        '<ul id="map-list">' +
        '<li>Árbol</li>' +
        '<li>carro</li>' +
        '<li>fenómeno</li>' +
        '</ul>';

    const input = document.getElementById('searchBox');
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
            '<input id="searchBox2" />' +
            '<ul id="map-list">' +
            '<li></li>' +
            '</ul>';
        const input2 = document.getElementById('searchBox2');
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
