/** @target web */
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * How staff lines are painted while the patch is installed:
 * `perBar` is the production behaviour, `none` skips staff lines (upper bound of their cost),
 * `runs` paints them once per run of bars with equal staff-line colour (emulation of backlog #25).
 * @internal
 */
export type StaffLineMode = 'perBar' | 'none' | 'runs';

const keyDefault = -2;
const keyInherit = -1;

/**
 * Prototype patch that emulates painting staff lines once per run of bars at the staff level.
 * Probe only: it reads private gap-cache fields of {@link TabBarRenderer}.
 * @internal
 */
export class StaffLineRuns {
    public static mode: StaffLineMode = 'perBar';

    /** Runs painted and bars covered by them (runs mode). */
    public static runs = 0;
    public static runBars = 0;
    /** Bars whose staff lines were painted per bar (perBar mode). */
    public static perBarCalls = 0;
    /** Bars that break a run because their style lacks a staff-line entry (canvas colour inherited). */
    public static inheritBars = 0;

    private static _installed = false;
    private static _suppress = false;
    private static readonly _gx: number[] = [];
    private static readonly _gw: number[] = [];

    public static resetStats() {
        StaffLineRuns.runs = 0;
        StaffLineRuns.runBars = 0;
        StaffLineRuns.perBarCalls = 0;
        StaffLineRuns.inheritBars = 0;
    }

    public static install() {
        if (StaffLineRuns._installed) {
            return;
        }
        StaffLineRuns._installed = true;

        const lineProto = LineBarRenderer.prototype as any;
        const linePaint = lineProto.paintStaffLines;
        lineProto.paintStaffLines = function (this: LineBarRenderer, cx: number, cy: number, canvas: ICanvas) {
            if (StaffLineRuns._suppress || StaffLineRuns.mode === 'none') {
                return;
            }
            StaffLineRuns.perBarCalls++;
            linePaint.call(this, cx, cy, canvas);
        };

        const tabProto = TabBarRenderer.prototype as any;
        const tabPaint = tabProto.paintStaffLines;
        tabProto.paintStaffLines = function (this: TabBarRenderer, cx: number, cy: number, canvas: ICanvas) {
            if (StaffLineRuns._suppress || StaffLineRuns.mode === 'none') {
                return;
            }
            StaffLineRuns.perBarCalls++;
            tabPaint.call(this, cx, cy, canvas);
        };

        const staffProto = RenderStaff.prototype as any;
        const staffPaint = staffProto.paint;
        staffProto.paint = function (
            this: RenderStaff,
            cx: number,
            cy: number,
            canvas: ICanvas,
            startIndex: number,
            count: number
        ) {
            if (StaffLineRuns.mode !== 'runs' || this.height === 0 || count === 0) {
                staffPaint.call(this, cx, cy, canvas, startIndex, count);
                return;
            }
            StaffLineRuns.paintRuns(this, cx + this.x, cy + this.y, canvas, startIndex, count);
            StaffLineRuns._suppress = true;
            try {
                staffPaint.call(this, cx, cy, canvas, startIndex, count);
            } finally {
                StaffLineRuns._suppress = false;
            }
        };
    }

    private static _colorKey(r: LineBarRenderer): number {
        const style = r.bar.style;
        if (!style) {
            return keyDefault;
        }
        const sub = r.staffLineBarSubElement;
        if (!style.colors.has(sub)) {
            return keyInherit;
        }
        const c = style.colors.get(sub);
        return c ? c.raw : keyDefault;
    }

    public static paintRuns(
        staff: RenderStaff,
        cx: number,
        cy: number,
        canvas: ICanvas,
        startIndex: number,
        count: number
    ) {
        const rs = staff.barRenderers;
        const end = Math.min(startIndex + count, rs.length);
        let i = startIndex;
        while (i < end) {
            const first = rs[i];
            if (!(first instanceof LineBarRenderer) || first.drawnLineCount === 0) {
                i++;
                continue;
            }
            const key = StaffLineRuns._colorKey(first);
            let j = i + 1;
            if (key === keyInherit) {
                StaffLineRuns.inheritBars++;
            } else {
                while (j < end && StaffLineRuns._colorKey(rs[j] as LineBarRenderer) === key) {
                    j++;
                }
            }
            StaffLineRuns._paintRun(rs, i, j, cx, cy, canvas);
            i = j;
        }
    }

    private static _paintRun(rs: BarRendererBase[], from: number, to: number, cx: number, cy: number, canvas: ICanvas) {
        StaffLineRuns.runs++;
        StaffLineRuns.runBars += to - from;
        const first = rs[from] as LineBarRenderer;
        const last = rs[to - 1];
        const previousColor = ElementStyleHelper.applyBar(canvas, first.staffLineBarSubElement, first.bar, true);
        try {
            const t = first.smuflMetrics.staffLineThickness;
            const startX = cx + first.x;
            const endX = cx + last.x + last.width;
            const isTab = first instanceof TabBarRenderer;
            const lines = first.drawnLineCount;
            const gxs = StaffLineRuns._gx;
            const gws = StaffLineRuns._gw;
            for (let line = 0; line < lines; line++) {
                const y = cy + first.y + first.getLineY(line) - t / 2;
                if (!isTab) {
                    canvas.fillRect(startX, y, endX - startX, t);
                    continue;
                }

                let n = 0;
                let sorted = true;
                for (let k = from; k < to; k++) {
                    const r = rs[k] as any;
                    if (r.additionalMultiRestBars) {
                        continue;
                    }
                    if (r._gapBucketEnd === null) {
                        r._buildGapCache();
                    }
                    if (r._gapCount === 0) {
                        continue;
                    }
                    const bucketEnd: Uint32Array = r._gapBucketEnd;
                    const rel: Float32Array = r._gapRelXAndWidth;
                    const refs: any[] = r._gapBeatRefs;
                    const gFrom = line === 0 ? 0 : bucketEnd[line - 1];
                    const gTo = bucketEnd[line];
                    const base = cx + r.x + r.beatGlyphsStart;
                    for (let g = gFrom; g < gTo; g++) {
                        const gx = base + refs[g].x + refs[g].onNotes.x + rel[g * 2];
                        if (n > 0 && gx < gxs[n - 1]) {
                            sorted = false;
                        }
                        gxs[n] = gx;
                        gws[n] = rel[g * 2 + 1];
                        n++;
                    }
                }
                if (!sorted) {
                    for (let a = 1; a < n; a++) {
                        const x = gxs[a];
                        const w = gws[a];
                        let b = a - 1;
                        while (b >= 0 && gxs[b] > x) {
                            gxs[b + 1] = gxs[b];
                            gws[b + 1] = gws[b];
                            b--;
                        }
                        gxs[b + 1] = x;
                        gws[b + 1] = w;
                    }
                }
                let lineX = startX;
                for (let g = 0; g < n; g++) {
                    const gx = gxs[g];
                    if (gx > lineX) {
                        canvas.fillRect(lineX, y, gx - lineX, t);
                    }
                    const ge = gx + gws[g];
                    if (ge > lineX) {
                        lineX = ge;
                    }
                }
                if (endX > lineX) {
                    canvas.fillRect(lineX, y, endX - lineX, t);
                }
            }
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }
}
