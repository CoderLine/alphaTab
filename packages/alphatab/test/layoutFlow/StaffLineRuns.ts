/** @target web */
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';

/**
 * How staff lines are painted while the patch is installed: `production` is the unpatched staff-level
 * run painter, `none` skips staff lines (their full cost when compared with `production`).
 * @internal
 */
export type StaffLineMode = 'production' | 'none';

/**
 * Prototype patch around the staff-line run painter: counts runs and can switch staff lines off.
 * @internal
 */
export class StaffLineRuns {
    public static mode: StaffLineMode = 'production';

    /** Staff passes (one per painted staff range), runs and bars covered by runs. */
    public static staffPasses = 0;
    public static runs = 0;
    public static runBars = 0;

    private static _installed = false;

    public static resetStats() {
        StaffLineRuns.staffPasses = 0;
        StaffLineRuns.runs = 0;
        StaffLineRuns.runBars = 0;
    }

    public static install() {
        if (StaffLineRuns._installed) {
            return;
        }
        StaffLineRuns._installed = true;

        const lineProto = LineBarRenderer.prototype as any;
        const paintStaffLines = lineProto.paintStaffLines;
        lineProto.paintStaffLines = function (
            this: LineBarRenderer,
            cx: number,
            cy: number,
            canvas: ICanvas,
            renderers: BarRendererBase[],
            from: number,
            to: number
        ) {
            if (StaffLineRuns.mode === 'none') {
                return;
            }
            StaffLineRuns.staffPasses++;
            paintStaffLines.call(this, cx, cy, canvas, renderers, from, to);
        };

        for (const proto of [LineBarRenderer.prototype, TabBarRenderer.prototype] as any[]) {
            const paintRun = proto.paintStaffLineRun;
            proto.paintStaffLineRun = function (
                this: LineBarRenderer,
                cx: number,
                cy: number,
                canvas: ICanvas,
                renderers: BarRendererBase[],
                from: number,
                to: number
            ) {
                StaffLineRuns.runs++;
                StaffLineRuns.runBars += to - from;
                paintRun.call(this, cx, cy, canvas, renderers, from, to);
            };
        }
    }
}
