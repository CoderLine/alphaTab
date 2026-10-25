/** @target web */
import { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { VerticalLayoutBase } from '@coderline/alphatab/rendering/layout/VerticalLayoutBase';
import { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';

/**
 * Calls and inclusive time of one probed method during a measurement window.
 * @internal
 */
export class ProbeStats {
    public readonly name: string;
    public calls: number = 0;
    public totalMs: number = 0;
    /** Calls per receiver: how often the same object went through the method. */
    public readonly perReceiver = new Map<object, number>();

    public constructor(name: string) {
        this.name = name;
    }

    public get receivers(): number {
        return this.perReceiver.size;
    }

    public get maxPerReceiver(): number {
        let max = 0;
        for (const v of this.perReceiver.values()) {
            if (v > max) {
                max = v;
            }
        }
        return max;
    }

    /** Receivers that went through the method more than once. */
    public get repeatedReceivers(): number {
        let n = 0;
        for (const v of this.perReceiver.values()) {
            if (v > 1) {
                n++;
            }
        }
        return n;
    }
}

/**
 * Wraps the layout-flow methods on their prototypes to count how often every renderer, staff,
 * system and layouting info goes through each stage. Time is inclusive: nested probed methods
 * are contained in their callers.
 * @internal
 */
export class CallProbe {
    private static _installed = false;
    private static _active = false;
    private static readonly _stats = new Map<string, ProbeStats>();

    private static readonly _targets: [object, string, string][] = [
        [BarRendererBase.prototype, 'doLayout', 'BarRenderer.doLayout'],
        [BarRendererBase.prototype, 'applyLayoutingInfo', 'BarRenderer.applyLayoutingInfo'],
        [BarRendererBase.prototype, 'reLayout', 'BarRenderer.reLayout'],
        [BarRendererBase.prototype, 'recreatePreBeatGlyphs', 'BarRenderer.recreatePreBeatGlyphs'],
        [BarRendererBase.prototype, 'scaleToWidth', 'BarRenderer.scaleToWidth'],
        [BarRendererBase.prototype, 'afterReverted', 'BarRenderer.afterReverted'],
        [BarRendererBase.prototype, 'afterStaffBarReverted', 'BarRenderer.afterStaffBarReverted'],
        [BarLayoutingInfo.prototype, 'finish', 'BarLayoutingInfo.finish'],
        [BarLayoutingInfo.prototype, 'recomputeSpringConstants', 'BarLayoutingInfo.recomputeSpringConstants'],
        [BarLayoutingInfo.prototype, 'buildOnTimePositions', 'BarLayoutingInfo.buildOnTimePositions'],
        [RenderStaff.prototype, 'revertLastBar', 'RenderStaff.revertLastBar'],
        [RenderStaff.prototype, 'finalizeStaff', 'RenderStaff.finalizeStaff'],
        [StaffSystem.prototype, 'addBars', 'StaffSystem.addBars'],
        [StaffSystem.prototype, 'addMasterBarRenderers', 'StaffSystem.addMasterBarRenderers'],
        [StaffSystem.prototype, 'revertLastBar', 'StaffSystem.revertLastBar'],
        [StaffSystem.prototype, 'reconcileMinDurationIfDirty', 'StaffSystem.reconcileMinDurationIfDirty'],
        [StaffSystem.prototype, 'finalizeSystem', 'StaffSystem.finalizeSystem'],
        [StaffSystem.prototype, 'buildBoundingsLookup', 'StaffSystem.buildBoundingsLookup'],
        [VerticalLayoutBase.prototype, '_createStaffSystem', 'Layout._createStaffSystem'],
        [VerticalLayoutBase.prototype, '_fitSystem', 'Layout._fitSystem'],
        [VerticalLayoutBase.prototype, '_scaleToWidth', 'Layout._scaleToWidth'],
        [VerticalLayoutBase.prototype, '_paintSystem', 'Layout._paintSystem'],
        [VerticalLayoutBase.prototype, '_layoutAndRenderScore', 'Layout._layoutAndRenderScore'],
        [VerticalLayoutBase.prototype, '_resizeAndRenderScore', 'Layout._resizeAndRenderScore']
    ];

    public static install() {
        if (CallProbe._installed) {
            return;
        }
        CallProbe._installed = true;
        for (const [proto, method, label] of CallProbe._targets) {
            const p = proto as Record<string, unknown>;
            const orig = p[method] as ((...args: unknown[]) => unknown) | undefined;
            if (typeof orig !== 'function') {
                throw new Error(`CallProbe: ${label} not found`);
            }
            p[method] = function (this: object, ...args: unknown[]) {
                if (!CallProbe._active) {
                    return orig.apply(this, args);
                }
                const t = performance.now();
                try {
                    return orig.apply(this, args);
                } finally {
                    CallProbe._record(label, this, performance.now() - t);
                }
            };
        }
    }

    private static _record(label: string, receiver: object, ms: number) {
        let s = CallProbe._stats.get(label);
        if (!s) {
            s = new ProbeStats(label);
            CallProbe._stats.set(label, s);
        }
        s.calls++;
        s.totalMs += ms;
        s.perReceiver.set(receiver, (s.perReceiver.get(receiver) ?? 0) + 1);
    }

    /** Starts a fresh measurement window. */
    public static start() {
        CallProbe.install();
        CallProbe._stats.clear();
        CallProbe._active = true;
    }

    public static stop(): ProbeStats[] {
        CallProbe._active = false;
        const result = Array.from(CallProbe._stats.values());
        CallProbe._stats.clear();
        return result;
    }

    public static format(stats: ProbeStats[], runs: number = 1): string[] {
        const order = new Map(CallProbe._targets.map((t, i) => [t[2], i]));
        return stats
            .slice()
            .sort((a, b) => order.get(a.name)! - order.get(b.name)!)
            .map(
                s =>
                    `${s.name.padEnd(44)} calls=${String(s.calls / runs).padStart(7)} ` +
                    `receivers=${String(s.receivers / runs).padStart(6)} max/receiver=${String(s.maxPerReceiver).padStart(3)} ` +
                    `repeated=${String(s.repeatedReceivers / runs).padStart(6)} ` +
                    `time=${(s.totalMs / runs).toFixed(2).padStart(8)} ms`
            );
    }
}
