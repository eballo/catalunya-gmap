/**
 * @jest-environment jsdom
 */
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockManager = { getMarkers: jest.fn(), resize: jest.fn() };
const mockCreate = jest.fn();

jest.mock('../app/catalunya-gmap-monument', () => jest.fn().mockImplementation(() => ({
    mapManager: mockManager,
    create: mockCreate,
})));

jest.mock('../app/catalunya-gmap-extra', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// main.js uses the page's jQuery: a small stand-in records what it was asked.
const jq = { calls: [] };
function $(target) {
    const el = {
        hide: jest.fn(() => jq.calls.push(['hide', target])),
        show: jest.fn(() => jq.calls.push(['show', target])),
        resize: jest.fn((fn) => { jq.resize = fn; }),
        bind: jest.fn((events, fn) => { jq.fullscreen = fn; }),
    };
    return el;
}
global.$ = $;

import MonumentBuilder from '../app/catalunya-gmap-monument';
import handleSearchTextList from '../app/catalunya-gmap-extra';
import initMapApplication from '../app/catalunya-gmap-main';

beforeEach(() => {
    jest.clearAllMocks();
    jq.calls = [];
    delete window.cmGmapManager;
    mockCreate.mockResolvedValue(mockManager);
    mockManager.getMarkers.mockReturnValue([]);
});

describe('initMapApplication()', () => {
    test('builds the map on #gMap and exposes the manager as window.cmGmapManager', async () => {
        await initMapApplication();
        expect(MonumentBuilder).toHaveBeenCalledWith('gMap');
        expect(window.cmGmapManager).toBe(mockManager);
    });

    test('hides the "no buildings" message once there are markers', async () => {
        mockManager.getMarkers.mockReturnValue([{}]);
        await initMapApplication();
        expect(jq.calls).toContainEqual(['hide', '#error']);
    });

    test('keeps the message when there are no markers', async () => {
        await initMapApplication();
        expect(jq.calls).not.toContainEqual(['hide', '#error']);
    });

    test('resizes the map with the window', async () => {
        await initMapApplication();
        jq.resize();
        expect(mockManager.resize).toHaveBeenCalled();
    });

    test('hides the list icon in fullscreen and shows it again after', async () => {
        await initMapApplication();
        document.webkitIsFullScreen = true;
        jq.fullscreen();
        expect(jq.calls).toContainEqual(['hide', '#llistat']);
        document.webkitIsFullScreen = false;
        jq.fullscreen();
        expect(jq.calls).toContainEqual(['show', '#llistat']);
    });

    test('logs instead of throwing when the map cannot be built', async () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockCreate.mockRejectedValue(new Error('no key'));
        await expect(initMapApplication()).resolves.toBeUndefined();
        expect(spy).toHaveBeenCalledWith('Failed to load the Google Maps API', expect.any(Error));
        spy.mockRestore();
    });
});

describe('search box', () => {
    test("filters the list from both the demo's #search-list and the theme's #search-llista", async () => {
        document.body.innerHTML = '<input id="search-list"><input id="search-llista">';
        document.dispatchEvent(new Event('DOMContentLoaded'));
        await new Promise(resolve => setTimeout(resolve, 0));
        document.getElementById('search-list').dispatchEvent(new Event('input'));
        document.getElementById('search-llista').dispatchEvent(new Event('blur'));
        expect(handleSearchTextList).toHaveBeenCalledTimes(2);
    });
});
