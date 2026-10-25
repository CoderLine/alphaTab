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
     * Pair-merge implementation: walks both segment lists in lockstep and
     * emits the result into the scratch buffers in O(s_this + s_other) time
     * before copying it back.
     * Each emitted segment's height is `max(thisH, otherH)` for that span;
     * adjacent equal-height pieces are coalesced inline so the result stays
     * in canonical form (no two consecutive segments with equal height).
     */
    public unionShifted(other: Skyline, dx: number): void {
        const oXs: number[] = other._xStarts;
        const oHs: number[] = other._heights;
        const oLast: number = other._count - 1; // sentinel index in other
        const xMin: number = this.xMin;
        const xMax: number = this.xMax;

        // Short-circuit: other entirely out of [xMin, xMax] after shifting.
        if (oXs[oLast] + dx <= xMin || oXs[0] + dx >= xMax) {
            return;
        }
        // Short-circuit: other has no positive-height segments at all.
        let hasContent: boolean = false;
        for (let k: number = 0; k < oLast; k = k + 1) {
            if (oHs[k] > 0) {
                hasContent = true;
                break;
            }
        }
        if (!hasContent) {
            return;
        }

        const tXs: number[] = this._xStarts;
        const tHs: number[] = this._heights;
        const tLast: number = this._count - 1; // sentinel index in this

        // Every emitted segment starts at xMin or at a breakpoint of one of the inputs.
        const capacity: number = this._count + other._count + 1;
        const scratch: SkylineScratch = this._scratch;
        const nXs: number[] = SkylineScratch.ensureCapacity(scratch.xStarts, 0, capacity);
        const nHs: number[] = SkylineScratch.ensureCapacity(scratch.heights, 0, capacity);
        scratch.xStarts = nXs;
        scratch.heights = nHs;
        let n: number = 0;

        let i: number = 0; // current segment index in this (active over [tXs[i], tXs[i+1]))
        let j: number = 0; // current segment index in other

        // Skip other's segments that end at or before xMin.
        while (j < oLast && oXs[j + 1] + dx <= xMin) {
            j = j + 1;
        }

        let x: number = xMin;
        while (x < xMax) {
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
            let nextX: number = xMax;
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
            if (nextX > xMax) {
                nextX = xMax;
            }
            // Safety: guarantee forward progress. Should not trigger for
            // valid sorted inputs, but avoid an infinite loop on degenerate
            // (zero-width) inputs.
            if (nextX <= x) {
                nextX = xMax;
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

        nXs[n] = xMax;
        nHs[n] = 0;
        n = n + 1;

        this._copyFromScratch(n);
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

        // Treat streams that are out-of-range or have no positive height as absent.
        let aActive: boolean = !(aXs[aLast] + dx1 <= xMin || aXs[0] + dx1 >= xMax);
        if (aActive) {
            let any: boolean = false;
            for (let k: number = 0; k < aLast; k = k + 1) {
                if (aHs[k] > 0) {
                    any = true;
                    break;
                }
            }
            aActive = any;
        }
        let bActive: boolean = !(bXs[bLast] + dx2 <= xMin || bXs[0] + dx2 >= xMax);
        if (bActive) {
            let any: boolean = false;
            for (let k: number = 0; k < bLast; k = k + 1) {
                if (bHs[k] > 0) {
                    any = true;
                    break;
                }
            }
            bActive = any;
        }
        let cActive: boolean = !(cXs[cLast] + dx3 <= xMin || cXs[0] + dx3 >= xMax);
        if (cActive) {
            let any: boolean = false;
            for (let k: number = 0; k < cLast; k = k + 1) {
                if (cHs[k] > 0) {
                    any = true;
                    break;
                }
            }
            cActive = any;
        }
        if (!aActive && !bActive && !cActive) {
            return;
        }

        const tXs: number[] = this._xStarts;
        const tHs: number[] = this._heights;
        const tLast: number = this._count - 1;

        // Every emitted segment starts at xMin or at a breakpoint of one of the inputs.
        const capacity: number = this._count + o1._count + o2._count + o3._count + 1;
        const scratch: SkylineScratch = this._scratch;
        const nXs: number[] = SkylineScratch.ensureCapacity(scratch.xStarts, 0, capacity);
        const nHs: number[] = SkylineScratch.ensureCapacity(scratch.heights, 0, capacity);
        scratch.xStarts = nXs;
        scratch.heights = nHs;
        let n: number = 0;

        let i: number = 0;
        let ja: number = 0;
        let jb: number = 0;
        let jc: number = 0;

        // Skip leading segments that end at or before xMin.
        if (aActive) {
            while (ja < aLast && aXs[ja + 1] + dx1 <= xMin) {
                ja = ja + 1;
            }
        }
        if (bActive) {
            while (jb < bLast && bXs[jb + 1] + dx2 <= xMin) {
                jb = jb + 1;
            }
        }
        if (cActive) {
            while (jc < cLast && cXs[jc + 1] + dx3 <= xMin) {
                jc = jc + 1;
            }
        }

        let x: number = xMin;
        while (x < xMax) {
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
            let nextX: number = xMax;
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
            if (nextX > xMax) {
                nextX = xMax;
            }
            if (nextX <= x) {
                nextX = xMax;
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

        nXs[n] = xMax;
        nHs[n] = 0;
        n = n + 1;

        this._copyFromScratch(n);
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

    private _copyFromScratch(count: number): void {
        const scratch: SkylineScratch = this._scratch;
        const sXs: number[] = scratch.xStarts;
        const sHs: number[] = scratch.heights;
        const xs: number[] = SkylineScratch.ensureCapacity(this._xStarts, 0, count);
        const hs: number[] = SkylineScratch.ensureCapacity(this._heights, 0, count);
        for (let k: number = 0; k < count; k = k + 1) {
            xs[k] = sXs[k];
            hs[k] = sHs[k];
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
