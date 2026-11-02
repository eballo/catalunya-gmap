// «Segle a segle»: a century slider under the map. A building appears at its
// first century (segleIni) and stays for the rest of the timeline. Buildings
// with no century are not painted; the counter says how many are dated.

const ROMAN = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const STEP_MS = 1400;
const SPEEDS = [1, 2, 4];
const SPROUT_SPREAD_MS = 500;

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

/** Markers whose first century is reached at `century`; undated ones never. */
export function visibleAt(markers, century) {
    return markers.filter(m => Number.isInteger(m.segleIni) && m.segleIni <= century);
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
        this.onMap = new Set(this.markers);
        this.timer = null;
        this.speedIndex = 0;
        this.reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    start() {
        if (!this.range) return false;
        this.dated = this.markers.filter(m => Number.isInteger(m.segleIni)).length;
        this.manager.setTimelineFilter(marker => Number.isInteger(marker.segleIni) && marker.segleIni <= this.century);
        this._buildControl();
        this.setCentury(this.range.min);
        return true;
    }

    setCentury(century) {
        this.century = Math.min(Math.max(century, this.range.min), this.range.max);
        this._apply();
        this._render();
    }

    // Incremental: only the markers whose state changed are added or removed.
    _apply() {
        const toAdd = [];
        const toRemove = [];
        this.markers.forEach(marker => {
            const wanted = Number.isInteger(marker.segleIni) && marker.segleIni <= this.century
                && this.manager.isCategoryVisible(marker.category);
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
            <div class="cm-gmap-timeline-dated"></div>`;
        div.addEventListener('click', event => {
            const button = event.target.closest('button[data-act]');
            if (button) this._onAction(button.dataset.act);
        });
        this.slider = div.querySelector('.cm-gmap-timeline-slider');
        this.slider.addEventListener('input', () => {
            this.pause();
            this.setCentury(Number(this.slider.value));
        });
        this.el = div;
        this.manager.map.controls[this.manager.core.ControlPosition.BOTTOM_LEFT].push(div);
    }

    _onAction(action) {
        if (action === 'prev') { this.pause(); this.setCentury(this.century - 1); }
        if (action === 'next') { this.pause(); this.setCentury(this.century + 1); }
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
        if (this.century >= this.range.max) this.setCentury(this.range.min);
        this.timer = window.setInterval(() => {
            if (this.century >= this.range.max) { this.pause(); return; }
            this.setCentury(this.century + 1);
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
        const count = visibleAt(this.markers, this.century).length;
        this.slider.value = this.century;
        this.el.querySelector('.cm-gmap-timeline-status').textContent =
            `Segle ${toRoman(this.century)} · ${formatCount(count)} edificis`;
        this.el.querySelector('.cm-gmap-timeline-dated').textContent =
            `${formatCount(this.dated)} de ${formatCount(this.markers.length)} edificis amb segle`;
    }
}
