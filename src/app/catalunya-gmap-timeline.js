// «Segle a segle»: a century slider under the map. A building appears at its
// first century (segleIni) and stays for the rest of the timeline. Buildings
// with no century are not painted; the counter says how many are dated.

const ROMAN = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const STEP_MS = 1400;
const SPEEDS = [1, 2, 4];
const SPROUT_SPREAD_MS = 500;

// Historical periods along the timeline. Every century belongs to one period
// only, so the border centuries (V, XV) are placed with the later period of
// the old one: V in the Alta edat mitjana, XV in the Baixa.
export const ERAS = [
    { id: 'romana', name: 'Època romana', short: 'Romana', from: 1, to: 4 },
    { id: 'alta', name: 'Alta edat mitjana', short: 'Alta', from: 5, to: 10 },
    { id: 'plena', name: 'Plena edat mitjana', short: 'Plena', from: 11, to: 13 },
    { id: 'baixa', name: 'Baixa edat mitjana', short: 'Baixa', from: 14, to: 15 },
    { id: 'moderna', name: 'Època moderna', short: 'Moderna', from: 16, to: 18 },
    { id: 'contemporania', name: 'Època contemporània', short: 'Actual', from: 19, to: 21 }
];

export function eraOf(century) {
    return ERAS.find(era => century >= era.from && century <= era.to) || null;
}

/** The periods that overlap the data's range, each cut to it. */
export function erasInRange(range) {
    return ERAS
        .filter(era => era.to >= range.min && era.from <= range.max)
        .map(era => ({ ...era, from: Math.max(era.from, range.min), to: Math.min(era.to, range.max) }));
}

export function toRoman(number) {
    let rest = number;
    let out = '';
    ROMAN.forEach(([value, symbol]) => {
        while (rest >= value) {
            out += symbol;
            rest -= value;
        }
    });
    return out;
}

/** First and last century present in the data, or null when nothing is dated. */
export function centuryRange(markers) {
    const centuries = markers.map(m => m.segleIni).filter(Number.isInteger);
    if (centuries.length === 0) return null;
    return { min: Math.min(...centuries), max: Math.max(...centuries) };
}

/** True when the century belongs to one of the chosen periods; no period chosen means all of them. */
export function inEras(century, eraIds) {
    if (!eraIds || eraIds.length === 0) return true;
    const era = eraOf(century);
    return era !== null && eraIds.includes(era.id);
}

/** Centuries of the range that belong to the chosen periods, in order. */
export function eraCenturies(range, eraIds) {
    const centuries = [];
    for (let century = range.min; century <= range.max; century++) {
        if (inEras(century, eraIds)) centuries.push(century);
    }
    return centuries;
}

/**
 * Markers whose first century is reached at `century` and that fall in the
 * chosen periods (all of them when none is chosen); undated ones never.
 * Buildings of an earlier period that is not chosen are not carried along.
 */
export function visibleAt(markers, century, eraIds = []) {
    return markers.filter(m => Number.isInteger(m.segleIni) && m.segleIni <= century && inEras(m.segleIni, eraIds));
}

export function formatCount(number) {
    return new Intl.NumberFormat('ca').format(number);
}

export default class TimelineControl {

    constructor(mapManager) {
        this.manager = mapManager;
        this.markers = mapManager.getMarkers();
        this.range = centuryRange(this.markers);
        this.century = null;
        // Periods the visitor chose (ids); empty means the whole timeline.
        this.selected = new Set();
        this.onMap = new Set(this.markers);
        this.timer = null;
        this.speedIndex = 0;
        this.reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    start() {
        if (!this.range) return false;
        this.dated = this.markers.filter(m => Number.isInteger(m.segleIni)).length;
        this.manager.setTimelineFilter(marker => this._wants(marker));
        this._buildControl();
        this.setCentury(this.range.min);
        return true;
    }

    _eraIds() {
        return [...this.selected];
    }

    _wants(marker) {
        return Number.isInteger(marker.segleIni) && marker.segleIni <= this.century && inEras(marker.segleIni, this._eraIds());
    }

    /** Centuries the slider can stop at: those of the chosen periods. */
    _included() {
        const centuries = eraCenturies(this.range, this._eraIds());
        return centuries.length ? centuries : eraCenturies(this.range, []);
    }

    // Lands on the first included century from `century` on, or the last one.
    setCentury(century) {
        const included = this._included();
        this.century = included.find(c => c >= century) ?? included[included.length - 1];
        this._apply();
        this._render();
    }

    _neighbour(delta) {
        const included = this._included();
        const next = delta > 0 ? included.find(c => c > this.century) : [...included].reverse().find(c => c < this.century);
        return next ?? this.century;
    }

    /** Chooses or drops a period and shows every building of the choice at once. */
    _toggleEra(id) {
        if (this.selected.has(id)) this.selected.delete(id);
        else this.selected.add(id);
        this._showChoice();
    }

    _showChoice() {
        this.pause();
        const included = this._included();
        this.century = null;
        this.setCentury(included[included.length - 1]);
    }

    // Incremental: only the markers whose state changed are added or removed.
    _apply() {
        const toAdd = [];
        const toRemove = [];
        this.markers.forEach(marker => {
            const wanted = this._wants(marker) && this.manager.isCategoryVisible(marker.category);
            const shown = this.onMap.has(marker);
            if (wanted && !shown) toAdd.push(marker);
            if (!wanted && shown) toRemove.push(marker);
        });
        toAdd.forEach(m => this.onMap.add(m));
        toRemove.forEach(m => this.onMap.delete(m));
        this.manager.setMarkersOnMap(toAdd, toRemove);
        if (!this.reducedMotion) toAdd.forEach(marker => this._drop(marker));
    }

    // Google's own drop animation (its markers have no DOM element to style),
    // restarted on the next tick so the batch add above does not swallow it.
    _drop(marker) {
        if (typeof marker.setAnimation !== 'function') return;
        const drop = this.manager.core.Animation.DROP;
        window.setTimeout(() => marker.setAnimation(drop), Math.round(Math.random() * SPROUT_SPREAD_MS));
    }

    _buildControl() {
        const div = document.createElement('div');
        div.className = 'cm-gmap-timeline';
        div.setAttribute('role', 'group');
        div.setAttribute('aria-label', 'Línia del temps: segle a segle');
        div.innerHTML = `
            <div class="cm-gmap-timeline-status" aria-live="polite"></div>
            <div class="cm-gmap-timeline-row">
                <button type="button" class="cm-gmap-timeline-btn" data-act="prev" aria-label="Segle anterior">‹</button>
                <button type="button" class="cm-gmap-timeline-btn cm-gmap-timeline-play" data-act="play" aria-label="Reprodueix">▶</button>
                <button type="button" class="cm-gmap-timeline-btn" data-act="next" aria-label="Segle següent">›</button>
                <input type="range" class="cm-gmap-timeline-slider" min="${this.range.min}" max="${this.range.max}" step="1" value="${this.range.min}" aria-label="Segle">
                <button type="button" class="cm-gmap-timeline-btn cm-gmap-timeline-speed" data-act="speed" aria-label="Velocitat">1×</button>
            </div>
            ${this._erasMarkup()}
            <div class="cm-gmap-timeline-dated"></div>`;
        div.addEventListener('click', event => {
            const button = event.target.closest('button[data-act]');
            if (button) this._onAction(button.dataset.act, button);
        });
        this.slider = div.querySelector('.cm-gmap-timeline-slider');
        this.slider.addEventListener('input', () => {
            this.pause();
            this.setCentury(Number(this.slider.value));
        });
        this.el = div;
        this.manager.map.controls[this.manager.core.ControlPosition.BOTTOM_LEFT].push(div);
    }

    _erasMarkup() {
        const all = `<button type="button" class="cm-gmap-timeline-era cm-gmap-timeline-era--all" data-act="all" title="Tots els períodes" aria-label="Tots els períodes" aria-pressed="true">Totes</button>`;
        const buttons = erasInRange(this.range).map(era => `<button type="button" class="cm-gmap-timeline-era cm-gmap-timeline-era--${era.id}" data-act="era" data-era="${era.id}" style="flex-grow:${era.to - era.from + 1}" title="${era.name}" aria-label="${era.name}: del segle ${toRoman(era.from)} al ${toRoman(era.to)}" aria-pressed="false">${era.short}</button>`);
        return `<div class="cm-gmap-timeline-eras" role="group" aria-label="Períodes (en pots triar diversos)">${all}${buttons.join('')}</div>`;
    }

    _onAction(action, button) {
        if (action === 'era') this._toggleEra(button.dataset.era);
        if (action === 'all') { this.selected.clear(); this._showChoice(); }
        if (action === 'prev') { this.pause(); this.setCentury(this._neighbour(-1)); }
        if (action === 'next') { this.pause(); this.setCentury(this._neighbour(1)); }
        if (action === 'play') this.timer ? this.pause() : this.play();
        if (action === 'speed') {
            this.speedIndex = (this.speedIndex + 1) % SPEEDS.length;
            this.el.querySelector('.cm-gmap-timeline-speed').textContent = SPEEDS[this.speedIndex] + '×';
            if (this.timer) this.play();
        }
    }

    play() {
        if (this.reducedMotion) return;
        window.clearInterval(this.timer);
        const included = this._included();
        if (this.century >= included[included.length - 1]) this.setCentury(included[0]);
        this.timer = window.setInterval(() => {
            const next = this._neighbour(1);
            if (next === this.century) { this.pause(); return; }
            this.setCentury(next);
        }, STEP_MS / SPEEDS[this.speedIndex]);
        this._renderPlay();
    }

    pause() {
        window.clearInterval(this.timer);
        this.timer = null;
        this._renderPlay();
    }

    _renderPlay() {
        const button = this.el && this.el.querySelector('.cm-gmap-timeline-play');
        if (!button) return;
        button.textContent = this.timer ? '❚❚' : '▶';
        button.setAttribute('aria-label', this.timer ? 'Pausa' : 'Reprodueix');
    }

    _render() {
        if (!this.el) return;
        const count = visibleAt(this.markers, this.century, this._eraIds()).length;
        const included = this._included();
        this.slider.min = included[0];
        this.slider.max = included[included.length - 1];
        this.slider.value = this.century;
        const era = eraOf(this.century);
        const chosen = ERAS.filter(e => this.selected.has(e.id)).map(e => e.name);
        const label = chosen.length ? chosen.join(' + ') : (era ? era.name : '');
        this.el.querySelector('.cm-gmap-timeline-status').textContent =
            `Segle ${toRoman(this.century)} · ${label ? label + ' · ' : ''}${formatCount(count)} edificis`;
        this._renderEras(era);
        this.el.querySelector('.cm-gmap-timeline-dated').textContent =
            `${formatCount(this.dated)} de ${formatCount(this.markers.length)} edificis amb segle`;
    }

    _renderEras(current) {
        if (!this.el || typeof this.el.querySelectorAll !== 'function') return;
        this.el.querySelectorAll('.cm-gmap-timeline-era').forEach(button => {
            const isAll = button.dataset.act === 'all';
            button.setAttribute('aria-pressed', String(isAll ? this.selected.size === 0 : this.selected.has(button.dataset.era)));
            if (current && button.dataset.era === current.id) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
    }
}
