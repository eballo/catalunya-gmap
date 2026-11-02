/**
 * @jest-environment jsdom
 */
import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import TimelineControl from '../app/catalunya-gmap-timeline';

describe('TimelineControl in the DOM', () => {
    const markers = [
        { id: 1, segleIni: 3, category: 'castell' },
        { id: 2, segleIni: 11, category: 'castell' },
        { id: 3, segleIni: 12, category: 'castell' }
    ];

    let pushed;
    let manager;
    let control;

    beforeEach(() => {
        jest.useFakeTimers();
        pushed = [];
        manager = {
            getMarkers: () => markers,
            core: { ControlPosition: { BOTTOM_LEFT: 'BL' }, Animation: { DROP: 'DROP' } },
            map: { controls: { BL: { push: element => pushed.push(element) } } },
            setTimelineFilter: jest.fn(),
            isCategoryVisible: () => true,
            setMarkersOnMap: jest.fn()
        };
        control = new TimelineControl(manager);
        control.start();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const el = () => pushed[0];

    it('puts the control on the map, at its first century', () => {
        expect(pushed).toHaveLength(1);
        expect(el().querySelector('.cm-gmap-timeline-status').textContent).toBe('Segle III · Època romana · 1 edificis');
        expect(el().querySelector('.cm-gmap-timeline-dated').textContent).toBe('3 de 3 edificis amb segle');
        expect(el().querySelector('.cm-gmap-timeline-slider').min).toBe('3');
    });

    it('draws «Totes» and one band per period of the range, and marks the current one', () => {
        const bands = [...el().querySelectorAll('.cm-gmap-timeline-era[data-act="era"]')];
        expect(bands.map(band => band.dataset.era)).toEqual(['romana', 'alta', 'plena']);
        expect(bands.find(band => band.getAttribute('aria-current') === 'true').dataset.era).toBe('romana');
        expect(el().querySelector('[data-act="all"]').getAttribute('aria-pressed')).toBe('true');
    });

    it('follows the slider', () => {
        const slider = el().querySelector('.cm-gmap-timeline-slider');
        slider.value = '12';
        slider.dispatchEvent(new Event('input'));
        expect(control.century).toBe(12);
        expect(el().querySelector('.cm-gmap-timeline-status').textContent).toContain('Plena edat mitjana');
    });

    it('steps and plays with its buttons', () => {
        el().querySelector('[data-act="next"]').click();
        expect(control.century).toBe(4);
        el().querySelector('[data-act="prev"]').click();
        expect(control.century).toBe(3);
        el().querySelector('[data-act="play"]').click();
        expect(control.timer).not.toBeNull();
        expect(el().querySelector('.cm-gmap-timeline-play').textContent).toBe('❚❚');
        el().querySelector('[data-act="speed"]').click();
        expect(el().querySelector('.cm-gmap-timeline-speed').textContent).toBe('2×');
        el().querySelector('[data-act="play"]').click();
        expect(control.timer).toBeNull();
    });

    it('chooses periods with the bands and goes back with «Totes»', () => {
        el().querySelector('[data-era="plena"]').click();
        expect(control.century).toBe(12);
        expect(el().querySelector('[data-era="plena"]').getAttribute('aria-pressed')).toBe('true');
        expect(el().querySelector('[data-act="all"]').getAttribute('aria-pressed')).toBe('false');
        expect(el().querySelector('.cm-gmap-timeline-status').textContent).toBe('Segle XII · Plena edat mitjana · 2 edificis');
        expect(el().querySelector('.cm-gmap-timeline-slider').min).toBe('11');

        el().querySelector('[data-era="romana"]').click();
        expect(el().querySelector('.cm-gmap-timeline-status').textContent).toContain('Època romana + Plena edat mitjana');

        el().querySelector('[data-act="all"]').click();
        expect(el().querySelector('[data-era="plena"]').getAttribute('aria-pressed')).toBe('false');
        expect(el().querySelector('[data-act="all"]').getAttribute('aria-pressed')).toBe('true');
        expect(el().querySelector('.cm-gmap-timeline-slider').min).toBe('3');
    });

    it('drops new markers with the Google animation, after a short random delay', () => {
        const marker = { setAnimation: jest.fn() };
        control._drop(marker);
        expect(marker.setAnimation).not.toHaveBeenCalled();
        jest.advanceTimersByTime(600);
        expect(marker.setAnimation).toHaveBeenCalledWith('DROP');
    });

    it('ignores an object that cannot be animated', () => {
        expect(() => control._drop({})).not.toThrow();
    });
});
