import TimelineControl, { toRoman, centuryRange, visibleAt, formatCount, ERAS, eraOf, erasInRange, inEras, eraCenturies } from '../app/catalunya-gmap-timeline';

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

describe('eras', () => {
    it('cover every century from I to XXI exactly once', () => {
        for (let century = 1; century <= 21; century++) {
            expect(ERAS.filter(era => century >= era.from && century <= era.to)).toHaveLength(1);
        }
    });

    it.each([[1, 'romana'], [4, 'romana'], [5, 'alta'], [10, 'alta'], [11, 'plena'], [13, 'plena'], [14, 'baixa'], [15, 'baixa'], [16, 'moderna'], [19, 'contemporania']])(
        'century %i is %s', (century, id) => {
            expect(eraOf(century).id).toBe(id);
        });

    it('knows no era outside the table', () => {
        expect(eraOf(0)).toBeNull();
        expect(eraOf(22)).toBeNull();
    });

    it('cuts the periods to the range of the data', () => {
        const eras = erasInRange({ min: 9, max: 12 });
        expect(eras.map(era => [era.id, era.from, era.to])).toEqual([['alta', 9, 10], ['plena', 11, 12]]);
    });
});

describe('period choice', () => {
    it('takes every century when no period is chosen', () => {
        expect(inEras(3, [])).toBe(true);
        expect(inEras(3)).toBe(true);
    });

    it('takes only the centuries of the chosen periods', () => {
        expect(inEras(12, ['plena'])).toBe(true);
        expect(inEras(10, ['plena'])).toBe(false);
        expect(inEras(10, ['alta', 'baixa'])).toBe(true);
        expect(inEras(99, ['alta'])).toBe(false);
    });

    it('lists the centuries of the choice', () => {
        expect(eraCenturies({ min: 9, max: 15 }, ['alta', 'baixa'])).toEqual([9, 10, 14, 15]);
        expect(eraCenturies({ min: 9, max: 11 }, [])).toEqual([9, 10, 11]);
    });

    it('does not carry the earlier periods along in visibleAt', () => {
        const markers = [{ id: 1, segleIni: 3 }, { id: 2, segleIni: 12 }, { id: 3, segleIni: 14 }];
        expect(visibleAt(markers, 20, ['plena']).map(m => m.id)).toEqual([2]);
        expect(visibleAt(markers, 20, ['romana', 'baixa']).map(m => m.id)).toEqual([1, 3]);
        expect(visibleAt(markers, 13).map(m => m.id)).toEqual([1, 2]);
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

    it('names the period in the status and marks it', () => {
        const { control } = build(makeMarkers());
        control.start();
        const status = { textContent: '' };
        const dated = { textContent: '' };
        const marked = [];
        const button = id => ({
            dataset: { era: id },
            setAttribute: (name) => name === 'aria-current' && marked.push(id),
            removeAttribute: () => {}
        });
        control.slider = {};
        control.el = {
            querySelector: selector => (selector.includes('status') ? status : dated),
            querySelectorAll: () => [button('alta'), button('plena')]
        };
        control.setCentury(11);
        expect(status.textContent).toBe('Segle XI · Plena edat mitjana · 2 edificis');
        expect(marked).toEqual(['plena']);
    });

    it('shows only the chosen period, without the earlier ones', () => {
        const { manager, control } = build(makeMarkers());
        control.start();
        manager.setMarkersOnMap.mockClear();
        control._onAction('era', { dataset: { era: 'plena' } });
        // Century XII is the last of the choice: the X building (alta) is not carried along.
        expect(control.century).toBe(12);
        expect(removedIds(manager).flat()).toEqual([1]);
        expect(addedIds(manager).flat().sort()).toEqual([2, 3]);
    });

    it('chooses several periods and skips the centuries in between', () => {
        const markers = [
            { id: 1, segleIni: 6, category: 'castell' },
            { id: 2, segleIni: 12, category: 'castell' },
            { id: 3, segleIni: 14, category: 'castell' }
        ];
        const { manager, control } = build(markers);
        control.start();
        control._onAction('era', { dataset: { era: 'alta' } });
        control._onAction('era', { dataset: { era: 'baixa' } });
        expect(control._included()).toEqual([6, 7, 8, 9, 10, 14]);
        expect(control.century).toBe(14);
        expect(control._eraIds().sort()).toEqual(['alta', 'baixa']);
        control._onAction('prev');
        expect(control.century).toBe(10);
        control._onAction('next');
        expect(control.century).toBe(14);
        // The XII building (plena) is not part of the choice.
        expect(control._wants(markers[1])).toBe(false);
        expect(manager.setMarkersOnMap).toHaveBeenCalled();
    });

    it('lands on the next included century when the slider stops in a gap', () => {
        const markers = [{ id: 1, segleIni: 6 }, { id: 2, segleIni: 14 }];
        const { control } = build(markers);
        control.start();
        control._onAction('era', { dataset: { era: 'alta' } });
        control._onAction('era', { dataset: { era: 'baixa' } });
        control.setCentury(12);
        expect(control.century).toBe(14);
    });

    it('drops a period when chosen again and goes back to everything with «Totes»', () => {
        const { control } = build(makeMarkers());
        control.start();
        control._onAction('era', { dataset: { era: 'plena' } });
        control._onAction('era', { dataset: { era: 'plena' } });
        expect(control.selected.size).toBe(0);
        control._onAction('era', { dataset: { era: 'alta' } });
        control._onAction('all');
        expect(control.selected.size).toBe(0);
        expect(control.century).toBe(12);
    });

    it('plays only through the chosen centuries', () => {
        const markers = [{ id: 1, segleIni: 6 }, { id: 2, segleIni: 14 }];
        const { control } = build(markers);
        control.start();
        control._onAction('era', { dataset: { era: 'alta' } });
        control._onAction('era', { dataset: { era: 'baixa' } });
        control.play();
        expect(control.century).toBe(6);
        jest.advanceTimersByTime(1400 * 4);
        expect(control.century).toBe(10);
        jest.advanceTimersByTime(1400);
        expect(control.century).toBe(14);
        jest.advanceTimersByTime(1400);
        expect(control.timer).toBeNull();
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
