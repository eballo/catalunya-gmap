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
        '<ul id="mapLlist">' +
        '<li>Árbol</li>' +
        '<li>carro</li>' +
        '<li>fenómeno</li>' +
        '</ul>';

    const input = document.getElementById('searchBox');
    const ul = document.getElementById('mapLlist');
    const li = ul.getElementsByTagName('li');

    test('filters list items based on search text', () => {
        input.value = 'ar';
        handleSearchTextList({ target: input });
        expect(li[0].style.display).toBe(''); // arbol contains ar
        expect(li[1].style.display).toBe(''); // carro contains ar
        expect(li[2].style.display).toBe('none'); // fenomeno doen't contain ar
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
