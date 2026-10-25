/**
 * A call frame as reported by the V8 inspector (CPU and sampling heap profiles).
 * @target web
 * @internal
 */
export interface ProfileCallFrame {
    functionName: string;
    url: string;
    lineNumber: number;
}

/**
 * Maps a profiler stack to the layout pipeline stage it belongs to. The innermost matching frame
 * wins, so glyph work inside `doLayout` counts as measure even when `doLayout` runs inside `addBars`.
 * @target web
 * @internal
 */
export class StageClassifier {
    private static readonly _rendererFiles = new Set([
        'BarRendererBase.ts',
        'LineBarRenderer.ts',
        'ScoreBarRenderer.ts',
        'TabBarRenderer.ts',
        'NumberedBarRenderer.ts',
        'SlashBarRenderer.ts'
    ]);

    public static readonly stages = [
        'measure (renderer doLayout)',
        'reposition (reLayout)',
        'position (applyLayoutingInfo)',
        'assemble (add/revert bars, systems)',
        'scale (scaleToWidth)',
        'finalize (staves, ties, skylines, effects)',
        'bounds lookup',
        'paint',
        'other'
    ];

    public static fileOf(url: string): string {
        const i = url.lastIndexOf('/');
        const f = i >= 0 ? url.substring(i + 1) : url;
        const q = f.indexOf('?');
        return q >= 0 ? f.substring(0, q) : f;
    }

    /** The stage a single frame starts, or null if the frame is not a stage entry. */
    public static stageOf(frame: ProfileCallFrame): string | null {
        const file = StageClassifier.fileOf(frame.url);
        const fn = frame.functionName;
        const isRenderer = StageClassifier._rendererFiles.has(file);
        if (isRenderer && fn === 'doLayout') {
            return StageClassifier.stages[0];
        }
        if (isRenderer && (fn === 'reLayout' || fn === 'recreatePreBeatGlyphs')) {
            return StageClassifier.stages[1];
        }
        if (isRenderer && fn === 'applyLayoutingInfo') {
            return StageClassifier.stages[2];
        }
        if (
            (file === 'StaffSystem.ts' &&
                (fn === 'addBars' ||
                    fn === 'addMasterBarRenderers' ||
                    fn === 'revertLastBar' ||
                    fn === 'reconcileMinDurationIfDirty')) ||
            (file === 'ScoreLayout.ts' && fn === 'createEmptyStaffSystem') ||
            (file === 'VerticalLayoutBase.ts' && fn === '_createStaffSystem') ||
            (file === 'RenderStaff.ts' && (fn === 'addBar' || fn === 'addBarRenderer' || fn === 'revertLastBar'))
        ) {
            return StageClassifier.stages[3];
        }
        if ((isRenderer && fn === 'scaleToWidth') || (file === 'VerticalLayoutBase.ts' && fn === '_scaleToWidth')) {
            return StageClassifier.stages[4];
        }
        if (
            (file === 'StaffSystem.ts' && fn === 'finalizeSystem') ||
            (file === 'RenderStaff.ts' && fn === 'finalizeStaff')
        ) {
            return StageClassifier.stages[5];
        }
        if (file === 'StaffSystem.ts' && fn === 'buildBoundingsLookup') {
            return StageClassifier.stages[6];
        }
        if (
            (file === 'StaffSystem.ts' && fn === 'paint') ||
            (file === 'ScoreLayout.ts' && fn === 'renderLazyPartial')
        ) {
            return StageClassifier.stages[7];
        }
        return null;
    }

    /** A stable label for a frame: `function file:line`. */
    public static siteOf(frame: ProfileCallFrame): string {
        return `${frame.functionName || '(anonymous)'} ${StageClassifier.fileOf(frame.url)}:${frame.lineNumber + 1}`;
    }

    /** Builtins (Map, push, splice, ...) have no url; they are attributed to their nearest script caller. */
    public static isBuiltin(frame: ProfileCallFrame): boolean {
        return frame.url === '';
    }
}

/**
 * Accumulates numbers by key and prints the largest entries.
 * @target web
 * @internal
 */
export class Tally {
    public readonly values = new Map<string, number>();
    public total = 0;

    public add(key: string, v: number) {
        this.values.set(key, (this.values.get(key) ?? 0) + v);
        this.total += v;
    }

    public top(n: number): [string, number][] {
        return Array.from(this.values.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, n);
    }
}
