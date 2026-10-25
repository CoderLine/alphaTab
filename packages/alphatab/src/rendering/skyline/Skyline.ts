import { SkylineScratch } from '@coderline/alphatab/rendering/skyline/SkylineScratch';

/**
 * Piecewise-constant step-function skyline used as a placement oracle.
 * Heights are non-negative magnitudes measured outward from a reference edge.
 * @internal
 */
export class Skyline {
    public readonly xMin: number;
    public readonly xMax: number;

    private readonly _scratch: SkylineScratch;

    /**
     * Segment `k` covers `[_xStarts[k], _xStarts[k + 1])` with height
     * `_heights[k]`; entry `_count - 1` is a sentinel at `xMax` with height 0.
     * Entries at and beyond `_count` are unused capacity.
     */
    private _xStarts: number[];
    private _heights: number[];
    private _count: number = 0;

    public constructor(xMin: number, xMax: number, scratch: SkylineScratch) {
        this.xMin = xMin;
        this.xMax = xMax;
        this._scratch = scratch;
        this._xStarts = new Array<number>(SkylineScratch.initialCapacity);
        this._heights = new Array<number>(SkylineScratch.initialCapacity);
        this._initBaseline();
    }

    public get segmentCount(): number {
        return this._count - 1;
    }

    public forEachSegment(cb: (xStart: number, xEnd: number, height: number) => void): void {
        for (let k: number = 0; k < this._count - 1; k = k + 1) {
            cb(this._xStarts[k], this._xStarts[k + 1], this._heights[k]);
        }
    }

    /**
     * Index-based segment accessors. `segmentCount` returns the number of
     * non-sentinel segments; valid indices are `[0, segmentCount)`. These
     * exist so hot consumers can iterate without allocating a closure (as
     * `forEachSegment` does), which matters in transpile targets (C#/Kotlin)
     * where closures are not free. The sentinel segment at the tail is not
     * exposed.
     */
    public segmentXStart(i: number): number {
        return this._xStarts[i];
    }

    public segmentXEnd(i: number): number {
        return this._xStarts[i + 1];
    }

    public segmentHeight(i: number): number {
        return this._heights[i];
    }

    public placeAbove(xStart: number, xEnd: number, _intrinsicHeight: number, pad: number): number {
        return this._maxHeightInRange(xStart, xEnd) + pad;
    }

    public placeBelow(xStart: number, xEnd: number, _intrinsicHeight: number, pad: number): number {
        return this._maxHeightInRange(xStart, xEnd) + pad;
    }

    public insert(xStart: number, xEnd: number, outerEdgeHeight: number, _pad: number): void {
        this._raiseRange(xStart, xEnd, outerEdgeHeight);
    }

    public union(other: Skyline): void {
        for (let k: number = 0; k < other._count - 1; k = k + 1) {
            const segStart: number = other._xStarts[k];
            const segEnd: number = other._xStarts[k + 1];
            const h: number = other._heights[k];
            if (h > 0) {
                this._raiseRange(segStart, segEnd, h);
            }
        }
    }

    /**
     * Unions every segment of `other` into `this`, shifted by `dx` on the
     * x-axis (i.e. each other-segment `[xs, xe)` contributes height `h` to
     * the range `[xs + dx, xe + dx)`). Clamps to `[xMin, xMax]`.
     *
     * Pair-merge implementation: walks both segment lists in lockstep over the
     * range where `other` has positive heights and emits the result into the
     * scratch buffers in O(window + segments of `this` after it) time before
     * splicing it back. Each emitted segment's height is `max(thisH, otherH)`
     * for that span; adjacent equal-height pieces are coalesced so the result
     * stays in canonical form (no two consecutive segments with equal height).
     */
    public unionShifted(other: Skyline, dx: number): void {
        const oXs: number[] = other._xStarts;
        const oHs: number[] = other._heights;
        const oLast: number = other._count - 1; // sentinel index in other
        const xMin: number = this.xMin;
        const xMax: number = this.xMax;

        // The window covered by positive-height segments of other.
        let first: number = 0;
        while (first < oLast && oHs[first] <= 0) {
            first = first + 1;
        }
        if (first === oLast) {
            return;
        }
        let last: number = oLast - 1;
        while (oHs[last] <= 0) {
            last = last - 1;
        }
        let lo: number = oXs[first] + dx;
        let hi: number = oXs[last + 1] + dx;
        if (lo < xMin) {
            lo = xMin;
        }
        if (hi > xMax) {
            hi = xMax;
        }
        if (lo >= hi) {
            return;
        }

        const tXs: number[] = this._xStarts;
        const tHs: number[] = this._heights;
        const tLast: number = this._count - 1; // sentinel index in this

        // Every emitted segment starts at lo, hi or at a breakpoint of one of the inputs.
        const capacity: number = this._count + other._count + 3;
        const scratch: SkylineScratch = this._scratch;
        const nXs: number[] = SkylineScratch.ensureCapacity(scratch.xStarts, 0, capacity);
        const nHs: number[] = SkylineScratch.ensureCapacity(scratch.heights, 0, capacity);
        scratch.xStarts = nXs;
        scratch.heights = nHs;
        let n: number = 0;

        const firstKept: number = this._segmentIndexAt(lo);
        let i: number = firstKept; // current segment index in this (active over [tXs[i], tXs[i+1]))
        let j: number = first; // current segment index in other

        // Skip other's segments that end at or before lo.
        while (j < oLast && oXs[j + 1] + dx <= lo) {
            j = j + 1;
        }

        let x: number = lo;
        while (x < hi) {
            const thisH: number = i < tLast ? tHs[i] : 0;
            let otherH: number = 0;
            if (j < oLast) {
                const oStart: number = oXs[j] + dx;
                if (x >= oStart) {
                    otherH = oHs[j];
                }
            }
            const h: number = thisH > otherH ? thisH : otherH;

            // Find next breakpoint.
            let nextX: number = hi;
            if (i < tLast) {
                const tNext: number = tXs[i + 1];
                if (tNext < nextX) {
                    nextX = tNext;
                }
            }
            if (j < oLast) {
                const oStart: number = oXs[j] + dx;
                if (x < oStart) {
                    if (oStart < nextX) {
                        nextX = oStart;
                    }
                } else {
                    const oExit: number = oXs[j + 1] + dx;
                    if (oExit < nextX) {
                        nextX = oExit;
                    }
                }
            }
            // Safety: guarantee forward progress. Should not trigger for
            // valid sorted inputs; on degenerate (zero-width) inputs the
            // current height extends to xMax.
            if (nextX <= x) {
                nextX = xMax;
                hi = xMax;
            }

            // Emit, coalescing adjacent equal-height pieces.
            if (n === 0 || nHs[n - 1] !== h) {
                nXs[n] = x;
                nHs[n] = h;
                n = n + 1;
            }

            x = nextX;

            // Advance i while its right edge is at or before x.
            while (i < tLast && tXs[i + 1] <= x) {
                i = i + 1;
            }
            // Advance j similarly (shifted).
            while (j < oLast && oXs[j + 1] + dx <= x) {
                j = j + 1;
            }
        }

        this._spliceFromScratch(firstKept, lo, hi, i, n);
    }

    /**
     * Three-input variant of {@link unionShifted} fused into a single 4-way
     * pair-merge pass: one result list and one segment rebuild instead of
     * three.
     */
    public unionShifted3(o1: Skyline, dx1: number, o2: Skyline, dx2: number, o3: Skyline, dx3: number): void {
        const aXs: number[] = o1._xStarts;
        const aHs: number[] = o1._heights;
        const bXs: number[] = o2._xStarts;
        const bHs: number[] = o2._heights;
        const cXs: number[] = o3._xStarts;
        const cHs: number[] = o3._heights;
        const aLast: number = o1._count - 1;
        const bLast: number = o2._count - 1;
        const cLast: number = o3._count - 1;
        const xMin: number = this.xMin;
        const xMax: number = this.xMax;

        // The window covered by positive-height segments of the inputs; streams
        // without positive heights inside [xMin, xMax) are treated as absent.
        let lo: number = xMax;
        let hi: number = xMin;

        let ja: number = 0;
        while (ja < aLast && aHs[ja] <= 0) {
            ja = ja + 1;
        }
        let aActive: boolean = false;
        if (ja < aLast) {
            let last: number = aLast - 1;
            while (aHs[last] <= 0) {
                last = last - 1;
            }
            const start: number = aXs[ja] + dx1 > xMin ? aXs[ja] + dx1 : xMin;
            const end: number = aXs[last + 1] + dx1 < xMax ? aXs[last + 1] + dx1 : xMax;
            if (start < end) {
                aActive = true;
                if (start < lo) {
                    lo = start;
                }
                if (end > hi) {
                    hi = end;
                }
            }
        }

        let jb: number = 0;
        while (jb < bLast && bHs[jb] <= 0) {
            jb = jb + 1;
        }
        let bActive: boolean = false;
        if (jb < bLast) {
            let last: number = bLast - 1;
            while (bHs[last] <= 0) {
                last = last - 1;
            }
            const start: number = bXs[jb] + dx2 > xMin ? bXs[jb] + dx2 : xMin;
            const end: number = bXs[last + 1] + dx2 < xMax ? bXs[last + 1] + dx2 : xMax;
            if (start < end) {
                bActive = true;
                if (start < lo) {
                    lo = start;
                }
                if (end > hi) {
                    hi = end;
                }
            }
        }

        let jc: number = 0;
        while (jc < cLast && cHs[jc] <= 0) {
            jc = jc + 1;
        }
        let cActive: boolean = false;
        if (jc < cLast) {
            let last: number = cLast - 1;
            while (cHs[last] <= 0) {
                last = last - 1;
            }
            const start: number = cXs[jc] + dx3 > xMin ? cXs[jc] + dx3 : xMin;
            const end: number = cXs[last + 1] + dx3 < xMax ? cXs[last + 1] + dx3 : xMax;
            if (start < end) {
                cActive = true;
                if (start < lo) {
                    lo = start;
                }
                if (end > hi) {
                    hi = end;
                }
            }
        }

        if (!aActive && !bActive && !cActive) {
            return;
        }

        const tXs: number[] = this._xStarts;
        const tHs: number[] = this._heights;
        const tLast: number = this._count - 1;

        // Every emitted segment starts at lo, hi or at a breakpoint of one of the inputs.
        const capacity: number = this._count + o1._count + o2._count + o3._count + 3;
        const scratch: SkylineScratch = this._scratch;
        const nXs: number[] = SkylineScratch.ensureCapacity(scratch.xStarts, 0, capacity);
        const nHs: number[] = SkylineScratch.ensureCapacity(scratch.heights, 0, capacity);
        scratch.xStarts = nXs;
        scratch.heights = nHs;
        let n: number = 0;

        const firstKept: number = this._segmentIndexAt(lo);
        let i: number = firstKept;

        // Skip leading segments that end at or before lo.
        if (aActive) {
            while (ja < aLast && aXs[ja + 1] + dx1 <= lo) {
                ja = ja + 1;
            }
        }
        if (bActive) {
            while (jb < bLast && bXs[jb + 1] + dx2 <= lo) {
                jb = jb + 1;
            }
        }
        if (cActive) {
            while (jc < cLast && cXs[jc + 1] + dx3 <= lo) {
                jc = jc + 1;
            }
        }

        let x: number = lo;
        while (x < hi) {
            const thisH: number = i < tLast ? tHs[i] : 0;
            let h: number = thisH;

            if (aActive && ja < aLast) {
                const oStart: number = aXs[ja] + dx1;
                if (x >= oStart) {
                    const ah: number = aHs[ja];
                    if (ah > h) {
                        h = ah;
                    }
                }
            }
            if (bActive && jb < bLast) {
                const oStart: number = bXs[jb] + dx2;
                if (x >= oStart) {
                    const bh: number = bHs[jb];
                    if (bh > h) {
                        h = bh;
                    }
                }
            }
            if (cActive && jc < cLast) {
                const oStart: number = cXs[jc] + dx3;
                if (x >= oStart) {
                    const ch: number = cHs[jc];
                    if (ch > h) {
                        h = ch;
                    }
                }
            }

            // Find next breakpoint across all 4 streams.
            let nextX: number = hi;
            if (i < tLast) {
                const tNext: number = tXs[i + 1];
                if (tNext < nextX) {
                    nextX = tNext;
                }
            }
            if (aActive && ja < aLast) {
                const oStart: number = aXs[ja] + dx1;
                if (x < oStart) {
                    if (oStart < nextX) {
                        nextX = oStart;
                    }
                } else {
                    const oExit: number = aXs[ja + 1] + dx1;
                    if (oExit < nextX) {
                        nextX = oExit;
                    }
                }
            }
            if (bActive && jb < bLast) {
                const oStart: number = bXs[jb] + dx2;
                if (x < oStart) {
                    if (oStart < nextX) {
                        nextX = oStart;
                    }
                } else {
                    const oExit: number = bXs[jb + 1] + dx2;
                    if (oExit < nextX) {
                        nextX = oExit;
                    }
                }
            }
            if (cActive && jc < cLast) {
                const oStart: number = cXs[jc] + dx3;
                if (x < oStart) {
                    if (oStart < nextX) {
                        nextX = oStart;
                    }
                } else {
                    const oExit: number = cXs[jc + 1] + dx3;
                    if (oExit < nextX) {
                        nextX = oExit;
                    }
                }
            }
            if (nextX <= x) {
                nextX = xMax;
                hi = xMax;
            }

            // Emit, coalescing equal-height neighbours.
            if (n === 0 || nHs[n - 1] !== h) {
                nXs[n] = x;
                nHs[n] = h;
                n = n + 1;
            }

            x = nextX;

            while (i < tLast && tXs[i + 1] <= x) {
                i = i + 1;
            }
            if (aActive) {
                while (ja < aLast && aXs[ja + 1] + dx1 <= x) {
                    ja = ja + 1;
                }
            }
            if (bActive) {
                while (jb < bLast && bXs[jb + 1] + dx2 <= x) {
                    jb = jb + 1;
                }
            }
            if (cActive) {
                while (jc < cLast && cXs[jc + 1] + dx3 <= x) {
                    jc = jc + 1;
                }
            }
        }

        this._spliceFromScratch(firstKept, lo, hi, i, n);
    }

    /**
     * Replaces the segments of `this` with the same segments as `other`.
     * Both skylines must cover the same range.
     */
    public copyFrom(other: Skyline): void {
        const count: number = other._count;
        const xs: number[] = SkylineScratch.ensureCapacity(this._xStarts, 0, count);
        const hs: number[] = SkylineScratch.ensureCapacity(this._heights, 0, count);
        const oXs: number[] = other._xStarts;
        const oHs: number[] = other._heights;
        for (let k: number = 0; k < count; k = k + 1) {
            xs[k] = oXs[k];
            hs[k] = oHs[k];
        }
        this._xStarts = xs;
        this._heights = hs;
        this._count = count;
    }

    public maxHeightInRange(xStart: number, xEnd: number): number {
        return this._maxHeightInRange(xStart, xEnd);
    }

    public maxHeight(): number {
        let best: number = 0;
        for (let k: number = 0; k < this._count - 1; k = k + 1) {
            const h: number = this._heights[k];
            if (h > best) {
                best = h;
            }
        }
        return best;
    }

    public reset(): void {
        this._initBaseline();
    }

    private _initBaseline(): void {
        this._xStarts[0] = this.xMin;
        this._heights[0] = 0;
        this._xStarts[1] = this.xMax;
        this._heights[1] = 0;
        this._count = 2;
    }

    /** The index of the non-sentinel segment containing `x` (`xMin <= x < xMax`). */
    private _segmentIndexAt(x: number): number {
        const xs: number[] = this._xStarts;
        let lo: number = 0;
        let hi: number = this._count - 2;
        while (lo < hi) {
            const mid: number = Math.floor((lo + hi + 1) / 2);
            if (xs[mid] <= x) {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        return lo;
    }

    /**
     * Replaces the segments over `[lo, hi)` with the `windowCount` merged pieces in the scratch
     * buffers (the first one starting at `lo`) and keeps the segments outside the window.
     * @param firstIndex The index of the segment containing `lo`.
     * @param lastIndex The index of the segment containing `hi` (the sentinel when `hi` is `xMax`).
     */
    private _spliceFromScratch(
        firstIndex: number,
        lo: number,
        hi: number,
        lastIndex: number,
        windowCount: number
    ): void {
        const scratch: SkylineScratch = this._scratch;
        const nXs: number[] = scratch.xStarts;
        const nHs: number[] = scratch.heights;
        const tXs: number[] = this._xStarts;
        const tHs: number[] = this._heights;
        const tLast: number = this._count - 1;
        let n: number = windowCount;

        // the segments from hi on, coalesced with the last merged piece
        let k: number = lastIndex;
        if (k < tLast && tXs[k] < hi) {
            if (nHs[n - 1] !== tHs[k]) {
                nXs[n] = hi;
                nHs[n] = tHs[k];
                n = n + 1;
            }
            k = k + 1;
        }
        for (; k < tLast; k = k + 1) {
            if (nHs[n - 1] !== tHs[k]) {
                nXs[n] = tXs[k];
                nHs[n] = tHs[k];
                n = n + 1;
            }
        }
        nXs[n] = this.xMax;
        nHs[n] = 0;
        n = n + 1;

        // the segments starting before lo stay, coalesced with the first merged piece
        const kept: number = tXs[firstIndex] < lo ? firstIndex + 1 : firstIndex;
        const from: number = kept > 0 && nHs[0] === tHs[kept - 1] ? 1 : 0;
        const count: number = kept + n - from;
        const xs: number[] = SkylineScratch.ensureCapacity(tXs, kept, count);
        const hs: number[] = SkylineScratch.ensureCapacity(tHs, kept, count);
        for (let s: number = from; s < n; s = s + 1) {
            xs[kept + s - from] = nXs[s];
            hs[kept + s - from] = nHs[s];
        }
        this._xStarts = xs;
        this._heights = hs;
        this._count = count;
    }

    private _maxHeightInRange(xStart: number, xEnd: number): number {
        const lo: number = xStart > this.xMin ? xStart : this.xMin;
        const hi: number = xEnd < this.xMax ? xEnd : this.xMax;
        if (lo >= hi) {
            return 0;
        }
        const xs: number[] = this._xStarts;
        const hs: number[] = this._heights;
        const last: number = this._count - 1;
        // Binary search for the last non-sentinel segment with xStart <= lo,
        // which is the first segment ending beyond lo.
        let first: number = 0;
        let upper: number = last - 1;
        while (first < upper) {
            const mid: number = Math.floor((first + upper + 1) / 2);
            if (xs[mid] <= lo) {
                first = mid;
            } else {
                upper = mid - 1;
            }
        }
        let best: number = 0;
        for (let k: number = first; k < last; k = k + 1) {
            if (xs[k] >= hi) {
                break;
            }
            const h: number = hs[k];
            if (h > best) {
                best = h;
            }
        }
        return best;
    }

    private _raiseRange(xStart: number, xEnd: number, newHeight: number): void {
        const lo: number = xStart > this.xMin ? xStart : this.xMin;
        const hi: number = xEnd < this.xMax ? xEnd : this.xMax;
        if (lo >= hi || newHeight <= 0) {
            return;
        }
        // Split at `lo`, capturing the index of the first segment in the
        // raised range. Splitting at `hi` then may shift `hi` indices but
        // never the `lo` index, so it is safe to keep `loIdx` afterwards.
        const loIdx: number = this._splitAt(lo);
        const hiIdx: number = this._splitAt(hi);
        const xs: number[] = this._xStarts;
        const hs: number[] = this._heights;
        const count: number = this._count;
        // Raise heights over the half-open index range [loIdx, hiIdx).
        for (let i: number = loIdx; i < hiIdx; i = i + 1) {
            if (hs[i] < newHeight) {
                hs[i] = newHeight;
            }
        }
        // Merge equal-height neighbours inside the touched window only: new
        // adjacencies can only appear at the boundary with the left neighbour
        // (loIdx-1 / loIdx), inside the raised range, or at the boundary with
        // the right neighbour (hiIdx-1 / hiIdx). Segments outside this window
        // were already in canonical form. The sentinel is never merged away.
        const mergeLo: number = loIdx > 0 ? loIdx - 1 : 0;
        let mergeHi: number = hiIdx + 1;
        if (mergeHi > count - 2) {
            mergeHi = count - 2;
        }
        let kept: number = mergeLo;
        for (let k: number = mergeLo + 1; k <= mergeHi; k = k + 1) {
            if (hs[k] !== hs[kept]) {
                kept = kept + 1;
                xs[kept] = xs[k];
                hs[kept] = hs[k];
            }
        }
        const removed: number = mergeHi - kept;
        if (removed > 0) {
            for (let k: number = mergeHi + 1; k < count; k = k + 1) {
                xs[k - removed] = xs[k];
                hs[k - removed] = hs[k];
            }
            this._count = count - removed;
        }
    }

    /**
     * Splits the skyline at `x` so that some segment afterwards has
     * `xStart === x`. Returns the index of that segment. If `x <= xMin`
     * the baseline (index 0) is returned. If `x >= xMax` the sentinel
     * index (`_count - 1`) is returned.
     */
    private _splitAt(x: number): number {
        if (x <= this.xMin) {
            return 0;
        }
        const count: number = this._count;
        if (x >= this.xMax) {
            return count - 1;
        }
        // Binary search for the largest index k with xStarts[k] <= x.
        // Segments are sorted strictly increasing by xStart.
        let lo: number = 0;
        let hi: number = count - 1;
        while (lo < hi) {
            const mid: number = Math.floor((lo + hi + 1) / 2);
            if (this._xStarts[mid] <= x) {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        // Now xStarts[lo] <= x < xStarts[lo+1].
        if (this._xStarts[lo] === x) {
            return lo;
        }
        const xs: number[] = SkylineScratch.ensureCapacity(this._xStarts, count, count + 1);
        const hs: number[] = SkylineScratch.ensureCapacity(this._heights, count, count + 1);
        this._xStarts = xs;
        this._heights = hs;
        for (let k: number = count; k > lo + 1; k = k - 1) {
            xs[k] = xs[k - 1];
            hs[k] = hs[k - 1];
        }
        xs[lo + 1] = x;
        hs[lo + 1] = hs[lo];
        this._count = count + 1;
        return lo + 1;
    }
}
