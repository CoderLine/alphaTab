/** @target web */
import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { BoundsLookupWire } from '@coderline/alphatab/rendering/utils/BoundsLookupWire';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';

/**
 * Writes the bounds directly in the {@link BoundsLookupWire} format, without creating a {@link BoundsLookup}.
 * {@link encode} yields exactly what `BoundsLookupWire.encode` yields for the lookup the
 * {@link BoundsLookupObjectWriter} builds from the same calls.
 *
 * The staff system blocks stay stored between renders, so partial updates keep the systems before the
 * rebuilt range.
 * @target web
 * @internal
 */
export class BoundsLookupWireWriter implements IBoundsLookupWriter {
    private _hasLookup = false;
    private _isFinished = false;

    // the system blocks of the lookup: [0, _length) of _store
    private _store = new Float64Array(0);
    private _length = 0;

    // the current system: its header, its master bars (header without bar count, a chain of bars each)
    // and the records of its bars in _bars (a bar with its beats and notes, in wire format)
    private _systemX = 0;
    private _systemY = 0;
    private _systemW = 0;
    private _systemVisualH = 0;
    private _systemRealH = 0;
    private _masterBarHeaders: number[] = [];
    private _masterBarFirstBar: number[] = [];
    private _masterBarLastBar: number[] = [];
    private _masterBarCount = 0;
    private _masterBar = -1;
    private _bars = new Float64Array(0);
    private _barsLength = 0;
    private _barStart: number[] = [];
    private _barEnd: number[] = [];
    private _barNext: number[] = [];
    private _barCount = 0;

    // the current bar and beat
    private _bar = -1;
    private _beatStarts: number[] = [];
    private _beatCount = 0;
    private _beat = -1;

    private _order: number[] = [];
    private _sortBuffer = new Float64Array(0);

    public get isFinished(): boolean {
        return this._isFinished;
    }

    /**
     * The lookup in {@link BoundsLookupWire} format, or null before the first render.
     */
    public encode(): Float64Array | null {
        return this._hasLookup ? this._store.slice(0, this._length) : null;
    }

    public begin(partialUpdate: boolean): void {
        if (!partialUpdate || !this._hasLookup) {
            this._length = 0;
        }
        this._hasLookup = true;
        this._isFinished = false;
    }

    public clearFromMasterBar(masterBarIndex: number): void {
        const store = this._store;
        let i = 0;
        while (i < this._length) {
            if (store[i + 9] > 0 && store[i + 10] >= masterBarIndex) {
                this._length = i;
                return;
            }
            i += store[i];
        }
    }

    public finish(_scale: number): void {
        this._isFinished = true;
    }

    public beginStaffSystem(x: number, y: number, w: number, visualH: number, realH: number): void {
        this._systemX = x;
        this._systemY = y;
        this._systemW = w;
        this._systemVisualH = visualH;
        this._systemRealH = realH;
        this._masterBarCount = 0;
        this._masterBar = -1;
        this._barsLength = 0;
        this._barCount = 0;
    }

    public openMasterBar(index: number, hint: number): boolean {
        const headers = this._masterBarHeaders;
        const count = this._masterBarCount;
        if (hint >= 0 && hint < count && headers[hint * 14] === index) {
            this._masterBar = hint;
            return true;
        }
        for (let m = 0; m < count; m++) {
            if (headers[m * 14] === index) {
                this._masterBar = m;
                return true;
            }
        }
        return false;
    }

    public addMasterBar(
        index: number,
        isFirstOfLine: boolean,
        x: number,
        w: number,
        realY: number,
        realH: number,
        visualY: number,
        visualH: number,
        lineAlignedY: number,
        lineAlignedH: number
    ): void {
        const m = this._masterBarCount++;
        const headers = this._masterBarHeaders;
        let i = m * 14;
        headers[i++] = index;
        headers[i++] = isFirstOfLine ? 1 : 0;
        headers[i++] = x;
        headers[i++] = lineAlignedY;
        headers[i++] = w;
        headers[i++] = lineAlignedH;
        headers[i++] = x;
        headers[i++] = visualY;
        headers[i++] = w;
        headers[i++] = visualH;
        headers[i++] = x;
        headers[i++] = realY;
        headers[i++] = w;
        headers[i] = realH;
        this._masterBarFirstBar[m] = -1;
        this._masterBarLastBar[m] = -1;
        this._masterBar = m;
    }

    public addBar(bar: Bar, x: number, y: number, w: number, h: number): void {
        const b = this._barCount++;
        const m = this._masterBar;
        if (this._masterBarLastBar[m] === -1) {
            this._masterBarFirstBar[m] = b;
        } else {
            this._barNext[this._masterBarLastBar[m]] = b;
        }
        this._masterBarLastBar[m] = b;
        this._barNext[b] = -1;

        let i = this._barsLength;
        this._barStart[b] = i;
        const data = this._ensureBars(i + BoundsLookupWire.barSize);
        data[i++] = bar.staff.track.index;
        data[i++] = bar.staff.index;
        data[i++] = bar.index;
        data[i++] = x;
        data[i++] = y;
        data[i++] = w;
        data[i++] = h;
        data[i++] = x;
        data[i++] = y;
        data[i++] = w;
        data[i++] = h;
        data[i++] = 0;
        this._barsLength = i;
        this._bar = b;
        this._beatCount = 0;
    }

    public addBeat(beat: Beat, visualX: number, visualW: number, realX: number, realW: number, onNotesX: number): void {
        const barStart = this._barStart[this._bar];
        let i = this._barsLength;
        this._beatStarts[this._beatCount++] = i;
        this._beat = i;
        const data = this._ensureBars(i + BoundsLookupWire.beatSize);
        data[barStart + 11]++;
        const barY = data[barStart + 4];
        const barH = data[barStart + 6];
        const voice = beat.voice;
        data[i++] = voice.bar.staff.track.index;
        data[i++] = voice.bar.staff.index;
        data[i++] = voice.bar.index;
        data[i++] = voice.index;
        data[i++] = beat.index;
        data[i++] = onNotesX;
        data[i++] = visualX;
        data[i++] = barY;
        data[i++] = visualW;
        data[i++] = barH;
        data[i++] = realX;
        data[i++] = barY;
        data[i++] = realW;
        data[i++] = barH;
        data[i++] = -1;
        this._barsLength = i;
    }

    public addNote(note: Note, x: number, y: number, w: number, h: number): void {
        let i = this._barsLength;
        const data = this._ensureBars(i + BoundsLookupWire.noteSize);
        const noteCount = this._beat + 14;
        data[noteCount] = data[noteCount] === -1 ? 1 : data[noteCount] + 1;
        data[i++] = note.index;
        data[i++] = x;
        data[i++] = y;
        data[i++] = w;
        data[i++] = h;
        this._barsLength = i;
    }

    public endBar(): void {
        const b = this._bar;
        const end = this._barsLength;
        this._barEnd[b] = end;
        this._sortBeats(this._barStart[b] + BoundsLookupWire.barSize, end);
        this._bar = -1;
        this._beat = -1;
    }

    public endStaffSystem(): void {
        const masterBarCount = this._masterBarCount;
        let blockLength = BoundsLookupWire.systemSize + masterBarCount * BoundsLookupWire.masterBarSize;
        for (let b = 0; b < this._barCount; b++) {
            blockLength += this._barEnd[b] - this._barStart[b];
        }

        let i = this._length;
        const store = this._ensureStore(i + blockLength);
        store[i++] = blockLength;
        store[i++] = this._systemX;
        store[i++] = this._systemY;
        store[i++] = this._systemW;
        store[i++] = this._systemVisualH;
        store[i++] = this._systemX;
        store[i++] = this._systemY;
        store[i++] = this._systemW;
        store[i++] = this._systemRealH;
        store[i++] = masterBarCount;

        const headers = this._masterBarHeaders;
        const bars = this._bars;
        const order = this._order;
        for (let m = 0; m < masterBarCount; m++) {
            const h = m * 14;
            for (let k = 0; k < 14; k++) {
                store[i++] = headers[h + k];
            }
            const barCount = this._sortBars(m);
            store[i++] = barCount;
            for (let k = 0; k < barCount; k++) {
                const b = order[k];
                const end = this._barEnd[b];
                for (let k = this._barStart[b]; k < end; k++) {
                    store[i++] = bars[k];
                }
            }
        }
        this._length = i;
        this._masterBar = -1;
    }

    /**
     * Writes the bars of the master bar into {@link _order}, stably sorted by real y then x.
     * @returns the number of bars.
     */
    private _sortBars(m: number): number {
        const order = this._order;
        const bars = this._bars;
        const barStart = this._barStart;
        let count = 0;
        for (let b = this._masterBarFirstBar[m]; b !== -1; b = this._barNext[b]) {
            const y = bars[barStart[b] + 8];
            const x = bars[barStart[b] + 7];
            let j = count;
            while (j > 0) {
                const prev = barStart[order[j - 1]];
                const prevY = bars[prev + 8];
                if (prevY > y || (!(prevY < y) && bars[prev + 7] > x)) {
                    order[j] = order[j - 1];
                    j--;
                } else {
                    break;
                }
            }
            order[j] = b;
            count++;
        }
        return count;
    }

    /**
     * Stably sorts the beat records of the current bar, which span [start, end), by their real x.
     */
    private _sortBeats(start: number, end: number): void {
        const beatStarts = this._beatStarts;
        const beatCount = this._beatCount;
        const bars = this._bars;
        let sorted = true;
        for (let k = 1; k < beatCount; k++) {
            if (bars[beatStarts[k] + 10] < bars[beatStarts[k - 1] + 10]) {
                sorted = false;
                break;
            }
        }
        if (sorted) {
            return;
        }

        const order = this._order;
        for (let k = 0; k < beatCount; k++) {
            const x = bars[beatStarts[k] + 10];
            let j = k;
            while (j > 0 && bars[beatStarts[order[j - 1]] + 10] > x) {
                order[j] = order[j - 1];
                j--;
            }
            order[j] = k;
        }

        if (this._sortBuffer.length < end - start) {
            this._sortBuffer = new Float64Array(end - start);
        }
        const buffer = this._sortBuffer;
        for (let k = start; k < end; k++) {
            buffer[k - start] = bars[k];
        }
        let i = start;
        for (let k = 0; k < beatCount; k++) {
            const beat = order[k];
            const beatEnd = (beat + 1 < beatCount ? beatStarts[beat + 1] : end) - start;
            for (let j = beatStarts[beat] - start; j < beatEnd; j++) {
                bars[i++] = buffer[j];
            }
        }
    }

    private _ensureBars(length: number): Float64Array {
        if (this._bars.length < length) {
            const grown = new Float64Array(Math.max(length, this._bars.length * 2, 1024));
            grown.set(this._bars.subarray(0, this._barsLength));
            this._bars = grown;
        }
        return this._bars;
    }

    private _ensureStore(length: number): Float64Array {
        if (this._store.length < length) {
            const grown = new Float64Array(Math.max(length, Math.ceil(this._store.length * 1.5), 4096));
            grown.set(this._store.subarray(0, this._length));
            this._store = grown;
        }
        return this._store;
    }
}
