import TimelineControl, { toRoman, centuryRange, visibleAt, formatCount } from '../app/catalunya-gmap-timeline';

describe('toRoman', () => {
    it.each([[1, 'I'], [4, 'IV'], [9, 'IX'], [11, 'XI'], [14, 'XIV'], [19, 'XIX'], [20, 'XX']])('%i -> %s', (n, roman) => {
        expect(toRoman(n)).toBe(roman);
    });
});

describe('centuryRange', () => {
    it('returns the first and last century', () => {
        expect(centuryRange([{ segleIni: 12 }, { segleIni: 9 }, {}, { segleIni: 15 }])).toEqual({ min: 9, max: 15 });
    });

    it('returns null when nothing is dated', () => {
        expect(centuryRange([{}, { segleIni: undefined }])).toBeNull();
        expect(centuryRange([])).toBeNull();
    });
});

describe('visibleAt', () => {
    const markers = [{ id: 1, segleIni: 10 }, { id: 2, segleIni: 12 }, { id: 3 }, { id: 4, segleIni: 12 }];

    it('shows a building from its first century on and keeps it', () => {
        expect(visibleAt(markers, 10).map(m => m.id)).toEqual([1]);
        expect(visibleAt(markers, 12).map(m => m.id)).toEqual([1, 2, 4]);
        expect(visibleAt(markers, 20).map(m => m.id)).toEqual([1, 2, 4]);
    });

    it('never shows undated buildings', () => {
        expect(visibleAt(markers, 99).map(m => m.id)).not.toContain(3);
    });
});

describe('formatCount', () => {
    it('groups thousands the Catalan way', () => {
        expect(formatCount(1491)).toMatch(/^1\D?491$/);
    });
});

describe('TimelineControl', () => {
    const makeMarkers = () => [
        { id: 1, segleIni: 10, category: 'castell' },
        { id: 2, segleIni: 11, category: 'castell' },
        { id: 3, segleIni: 12, category: 'ermita' },
        { id: 4, category: 'castell' }
    ];

    const makeManager = (markers, hiddenCategories = []) => ({
        getMarkers: () => markers,
        setTimelineFilter: jest.fn(),
        isCategoryVisible: jest.fn(category => !hiddenCategories.includes(category)),
        setMarkersOnMap: jest.fn()
    });

    const build = (markers, hidden) => {
        const manager = makeManager(markers, hidden);
        const control = new TimelineControl(manager);
        return { manager, control };
    };

    const addedIds = manager => manager.setMarkersOnMap.mock.calls.map(([added]) => added.map(m => m.id));
    const removedIds = manager => manager.setMarkersOnMap.mock.calls.map(([, removed]) => removed.map(m => m.id));

    beforeEach(() => {
        jest.useFakeTimers();
        global.window = global;
        jest.spyOn(TimelineControl.prototype, '_buildControl').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
        delete global.window;
    });

    it('does not start when no building is dated', () => {
        const { manager, control } = build([{ id: 1 }, { id: 2 }]);
        expect(control.start()).toBe(false);
        expect(manager.setTimelineFilter).not.toHaveBeenCalled();
    });

    it('starts at the first century and paints only what is already there', () => {
        const { manager, control } = build(makeMarkers());
        expect(control.start()).toBe(true);
        expect(control.century).toBe(10);
        expect(control.dated).toBe(3);
        expect(addedIds(manager).flat()).toEqual([]);
        // Everything starts on the map; the undated and later ones go off it.
        expect(removedIds(manager)[0].sort()).toEqual([2, 3, 4]);
    });

    it('installs a filter the manager can use for the category toggles', () => {
        const { manager, control } = build(makeMarkers());
        control.start();
        const filter = manager.setTimelineFilter.mock.calls[0][0];
        expect(filter({ segleIni: 10 })).toBe(true);
        expect(filter({ segleIni: 11 })).toBe(false);
        expect(filter({})).toBe(false);
    });

    it('adds the new buildings at each step and keeps the old ones', () => {
        const { manager, control } = build(makeMarkers());
        control.start();
        manager.setMarkersOnMap.mockClear();
        control.setCentury(11);
        expect(addedIds(manager)).toEqual([[2]]);
        expect(removedIds(manager)).toEqual([[]]);
    });

    it('takes buildings off when going back', () => {
        const { manager, control } = build(makeMarkers());
        control.start();
        control.setCentury(12);
        manager.setMarkersOnMap.mockClear();
        control.setCentury(10);
        expect(removedIds(manager)[0].sort()).toEqual([2, 3]);
    });

    it('keeps the century inside the range', () => {
        const { control } = build(makeMarkers());
        control.start();
        control.setCentury(99);
        expect(control.century).toBe(12);
        control.setCentury(-3);
        expect(control.century).toBe(10);
    });

    it('does not add a building whose category is switched off', () => {
        const { manager, control } = build(makeMarkers(), ['ermita']);
        control.start();
        manager.setMarkersOnMap.mockClear();
        control.setCentury(12);
        expect(addedIds(manager)).toEqual([[2]]);
    });

    it('plays one century at a time and stops at the end', () => {
        const { control } = build(makeMarkers());
        control.start();
        control.play();
        jest.advanceTimersByTime(1400);
        expect(control.century).toBe(11);
        jest.advanceTimersByTime(1400 * 3);
        expect(control.century).toBe(12);
        expect(control.timer).toBeNull();
    });

    it('starts again from the beginning when played at the end', () => {
        const { control } = build(makeMarkers());
        control.start();
        control.setCentury(12);
        control.play();
        expect(control.century).toBe(10);
        control.pause();
    });

    it('pauses and changes the speed', () => {
        const { control } = build(makeMarkers());
        control.start();
        // The DOM is stubbed out in this suite: a bare element is enough for the labels.
        control.slider = {};
        control.el = { querySelector: () => ({ setAttribute: () => {} }) };
        control.play();
        control._onAction('speed');
        expect(control.speedIndex).toBe(1);
        jest.advanceTimersByTime(700);
        expect(control.century).toBe(11);
        control._onAction('play');
        expect(control.timer).toBeNull();
        jest.advanceTimersByTime(5000);
        expect(control.century).toBe(11);
    });

    it('steps with the buttons and pauses the playback', () => {
        const { control } = build(makeMarkers());
        control.start();
        control.play();
        control._onAction('next');
        expect(control.timer).toBeNull();
        expect(control.century).toBe(11);
        control._onAction('prev');
        expect(control.century).toBe(10);
    });

    it('does not play with reduced motion', () => {
        const { control } = build(makeMarkers());
        control.start();
        control.reducedMotion = true;
        control.play();
        expect(control.timer).toBeNull();
    });
});
