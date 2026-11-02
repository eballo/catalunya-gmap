import { toRoman, centuryRange, visibleAt, formatCount } from '../app/catalunya-gmap-timeline';

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
