/**
 * Integration tests for skyline lifecycle through resize / restructure flows.
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { TestUiFacade } from '../TestUiFacade';
import { VisualTestHelper } from '../VisualTestHelper';

/**
 * @record
 * @internal
 */
interface StaffSkylineResizeSnapshot {
    systemIndex: number;
    staffIndex: number;
    /**
     * Stable identifier composed of `staffId` (factory id, e.g. "score" / "tab")
     * and the track index. `staffIndex` alone is NOT stable because the
     * score-staff and tab-staff of the same track share it.
     */
    staffKey: string;
    upMax: number;
    downMax: number;
    barUpMaxes: number[];
    barDownMaxes: number[];
    barWidths: number[];
    barLineLocalX: number[];
}

/**
 * @record
 * @internal
 */
interface SkylineResizeSnapshots {
    initial: StaffSkylineResizeSnapshot[];
    resized: StaffSkylineResizeSnapshot[];
}

/**
 * @record
 * @internal
 */
interface UpDownArrays {
    up: number[];
    down: number[];
}

/**
 * @internal
 */
class SkylineResizeFlowHelper {
    public static async loadScore(tex: string): Promise<Score> {
        const settings = new Settings();
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        return importer.readScore();
    }

    public static captureSnapshot(api: AlphaTabApiBase<unknown>): StaffSkylineResizeSnapshot[] {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        const systems = inner.layout!.systems;

        const out: StaffSkylineResizeSnapshot[] = [];
        for (const system of systems) {
            for (const group of system.staves) {
                for (const staff of group.staves) {
                    if (!staff.isVisible) {
                        continue;
                    }
                    const snap: StaffSkylineResizeSnapshot = {
                        systemIndex: system.index,
                        staffIndex: staff.staffIndex,
                        staffKey: `${staff.staffTrackGroup.track.index}/${staff.staffId}`,
                        upMax: staff.systemSkyline.upSky.maxHeight(),
                        downMax: staff.systemSkyline.downSky.maxHeight(),
                        barUpMaxes: staff.barRenderers.map(r => r.barLocalSkyline.upSky.maxHeight()),
                        barDownMaxes: staff.barRenderers.map(r => r.barLocalSkyline.downSky.maxHeight()),
                        barWidths: staff.barRenderers.map(r => r.width),
                        barLineLocalX: staff.barRenderers.map(r => r.x)
                    };
                    out.push(snap);
                }
            }
        }
        return out;
    }

    /** Single render at one width via a fresh API. */
    public static async renderOnce(tex: string, width: number): Promise<StaffSkylineResizeSnapshot[]> {
        await VisualTestHelper.prepareAlphaSkia();
        const score = await SkylineResizeFlowHelper.loadScore(tex);
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = width;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        let captured: StaffSkylineResizeSnapshot[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    captured = SkylineResizeFlowHelper.captureSnapshot(api);
                    resolve();
                });
                api.error.on(e => {
                    reject(
                        new AlphaTabError(
                            AlphaTabErrorType.General,
                            `Failed to render skyline harness score (${e.message} ${e.stack})`,
                            e
                        )
                    );
                });
                const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
                api.renderScore(renderScore, [0]);
                setTimeout(() => reject(new Error('skyline render harness timed out')), 5000);
            });
        } finally {
            api.destroy();
        }
        return captured;
    }

    /**
     * Single resize on a shared API: render at `initialWidth`, then once
     * complete, resize to `targetWidth` and capture the resulting snapshot.
     */
    public static async renderWithResize(
        tex: string,
        initialWidth: number,
        targetWidth: number
    ): Promise<SkylineResizeSnapshots> {
        await VisualTestHelper.prepareAlphaSkia();
        const score = await SkylineResizeFlowHelper.loadScore(tex);
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = initialWidth;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        let initialSnap: StaffSkylineResizeSnapshot[] = [];
        let resizedSnap: StaffSkylineResizeSnapshot[] = [];
        let isInitialPhase = true;

        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    if (isInitialPhase) {
                        initialSnap = SkylineResizeFlowHelper.captureSnapshot(api);
                        isInitialPhase = false;
                        setTimeout(() => {
                            uiFacade.rootContainer.width = targetWidth;
                            api.triggerResize();
                        }, 0);
                    } else {
                        resizedSnap = SkylineResizeFlowHelper.captureSnapshot(api);
                        resolve();
                    }
                });
                api.error.on(e => {
                    reject(
                        new AlphaTabError(
                            AlphaTabErrorType.General,
                            `Failed to render skyline harness score (${e.message} ${e.stack})`,
                            e
                        )
                    );
                });
                const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
                api.renderScore(renderScore, [0]);
                setTimeout(() => reject(new Error('skyline resize harness timed out')), 10000);
            });
        } finally {
            api.destroy();
        }

        const result: SkylineResizeSnapshots = { initial: initialSnap, resized: resizedSnap };
        return result;
    }

    /**
     * Concatenate per-bar up/down maxes per logical staff in left-to-right
     * (system, then renderer-index) order. Keyed by `staffKey` so the score-
     * staff and tab-staff of the same track are correctly separated.
     */
    public static envelopesByStaff(snapshot: StaffSkylineResizeSnapshot[]): Map<string, UpDownArrays> {
        const byStaff = new Map<string, UpDownArrays>();
        const ordered = snapshot.slice();
        ordered.sort((a, b) => {
            if (a.staffKey !== b.staffKey) {
                return a.staffKey.localeCompare(b.staffKey);
            }
            return a.systemIndex - b.systemIndex;
        });
        for (const s of ordered) {
            if (!byStaff.has(s.staffKey)) {
                const empty: UpDownArrays = { up: [], down: [] };
                byStaff.set(s.staffKey, empty);
            }
            const e = byStaff.get(s.staffKey)!;
            for (const v of s.barUpMaxes) {
                e.up.push(v);
            }
            for (const v of s.barDownMaxes) {
                e.down.push(v);
            }
        }
        return byStaff;
    }

    public static totalBarsInSnapshot(snapshot: StaffSkylineResizeSnapshot[]): number {
        let total = 0;
        for (const s of snapshot) {
            total += s.barWidths.length;
        }
        return total;
    }

    public static sumMagnitudes(snapshot: StaffSkylineResizeSnapshot[]): number {
        let total = 0;
        for (const st of snapshot) {
            for (const v of st.barUpMaxes) {
                total += v;
            }
            for (const v of st.barDownMaxes) {
                total += v;
            }
        }
        return total;
    }

    public static maxOrZero(values: number[]): number {
        let max = 0;
        for (const v of values) {
            if (v > max) {
                max = v;
            }
        }
        return max;
    }

    public static distinctSystemCount(snapshot: StaffSkylineResizeSnapshot[]): number {
        const seen = new Set<number>();
        for (const s of snapshot) {
            seen.add(s.systemIndex);
        }
        return seen.size;
    }

    public static anyBarHasContent(staff: StaffSkylineResizeSnapshot): boolean {
        for (const v of staff.barUpMaxes) {
            if (v > 0) {
                return true;
            }
        }
        for (const v of staff.barDownMaxes) {
            if (v > 0) {
                return true;
            }
        }
        return false;
    }

    public static anyStaffHasContent(snapshot: StaffSkylineResizeSnapshot[]): boolean {
        for (const s of snapshot) {
            if (s.upMax > 0 || s.downMax > 0) {
                return true;
            }
        }
        return false;
    }
}

describe('SkylineResizeFlow', () => {
    const resizeTex = `
        \\track "Guitar"
        :4 17.1 19.1 22.1 24.1 |
        12.1{v f} 14.1{v f}.4 :8 15.1 17.1 |
        :4 0.6 0.6 0.6 0.6 |
        :4 12.1 14.1 17.1 0.6 |
        :4 22.1 24.1 17.1 19.1 |
        :4 12.1 12.6 17.1 0.6
    `;

    it('initial render at a wide width populates the staff skyline', async () => {
        const snap = await SkylineResizeFlowHelper.renderOnce(resizeTex, 1300);
        expect(snap.length).toBeGreaterThan(0);
        expect(SkylineResizeFlowHelper.anyStaffHasContent(snap)).toBe(true);
        for (const staff of snap) {
            for (let i = 0; i < staff.barUpMaxes.length; i++) {
                expect(staff.barUpMaxes[i] + staff.barDownMaxes[i]).toBeGreaterThan(0);
            }
        }
    });

    it('initial render at a narrow width populates skylines across multiple systems', async () => {
        const snap = await SkylineResizeFlowHelper.renderOnce(resizeTex, 600);
        expect(snap.length).toBeGreaterThan(0);
        expect(SkylineResizeFlowHelper.distinctSystemCount(snap)).toBeGreaterThanOrEqual(2);
        for (const staff of snap) {
            if (SkylineResizeFlowHelper.anyBarHasContent(staff)) {
                expect(staff.upMax + staff.downMax).toBeGreaterThan(0);
            }
        }
    });

    it('same bar count is produced regardless of width (fresh API per render)', async () => {
        const wide = await SkylineResizeFlowHelper.renderOnce(resizeTex, 1300);
        const narrow = await SkylineResizeFlowHelper.renderOnce(resizeTex, 600);
        expect(SkylineResizeFlowHelper.totalBarsInSnapshot(wide)).toBe(
            SkylineResizeFlowHelper.totalBarsInSnapshot(narrow)
        );
    });

    it('per-staff envelope totals are stable across widths (fresh APIs)', async () => {
        const wide = await SkylineResizeFlowHelper.renderOnce(resizeTex, 1300);
        const narrow = await SkylineResizeFlowHelper.renderOnce(resizeTex, 600);
        const a = SkylineResizeFlowHelper.envelopesByStaff(wide);
        const b = SkylineResizeFlowHelper.envelopesByStaff(narrow);
        expect(a.size).toBe(b.size);
        for (const [staffKey, ea] of a) {
            const eb = b.get(staffKey)!;
            expect(SkylineResizeFlowHelper.maxOrZero(ea.up)).toBeCloseTo(
                SkylineResizeFlowHelper.maxOrZero(eb.up),
                3
            );
            expect(SkylineResizeFlowHelper.maxOrZero(ea.down)).toBeCloseTo(
                SkylineResizeFlowHelper.maxOrZero(eb.down),
                3
            );
        }
    });

    it('single resize wide→narrow re-distributes bars across systems', async () => {
        const snapshots = await SkylineResizeFlowHelper.renderWithResize(resizeTex, 1300, 600);
        const initial = snapshots.initial;
        const resized = snapshots.resized;

        expect(initial.length).toBeGreaterThan(0);
        expect(resized.length).toBeGreaterThan(0);

        const initialSystems = SkylineResizeFlowHelper.distinctSystemCount(initial);
        const resizedSystems = SkylineResizeFlowHelper.distinctSystemCount(resized);
        expect(resizedSystems).toBeGreaterThanOrEqual(initialSystems);

        for (const staff of resized) {
            if (SkylineResizeFlowHelper.anyBarHasContent(staff)) {
                expect(staff.upMax + staff.downMax).toBeGreaterThan(0);
            }
        }
    });

    it('single resize narrow→wide preserves bar-local envelopes', async () => {
        const snapshots = await SkylineResizeFlowHelper.renderWithResize(resizeTex, 600, 900);
        const sumInitial = SkylineResizeFlowHelper.sumMagnitudes(snapshots.initial);
        const sumResized = SkylineResizeFlowHelper.sumMagnitudes(snapshots.resized);
        expect(sumResized).toBeCloseTo(sumInitial, 5);
    });

    it('bars in each staff are contiguous (no gaps or overlaps) after resize', async () => {
        const snapshots = await SkylineResizeFlowHelper.renderWithResize(resizeTex, 1300, 800);
        const resized = snapshots.resized;
        const tolerance = 1.5;
        for (const staff of resized) {
            if (staff.barLineLocalX.length === 0) {
                continue;
            }
            let expectedX = staff.barLineLocalX[0];
            for (let i = 0; i < staff.barLineLocalX.length; i++) {
                expect(Math.abs(staff.barLineLocalX[i] - expectedX)).toBeLessThanOrEqual(tolerance);
                expectedX += staff.barWidths[i];
            }
        }
    });

    it('staff skyline maxHeight is at least the max over its constituent bar-local maxHeights', async () => {
        const snap = await SkylineResizeFlowHelper.renderOnce(resizeTex, 600);
        for (const staff of snap) {
            const localUpMax = SkylineResizeFlowHelper.maxOrZero(staff.barUpMaxes);
            const localDownMax = SkylineResizeFlowHelper.maxOrZero(staff.barDownMaxes);
            expect(staff.upMax).toBeGreaterThanOrEqual(localUpMax - 1e-5);
            expect(staff.downMax).toBeGreaterThanOrEqual(localDownMax - 1e-5);
        }
    });

    it('resize back to a width that fits the score in one system populates _systems', async () => {
        const snapshots = await SkylineResizeFlowHelper.renderWithResize(resizeTex, 1300, 600);
        expect(snapshots.initial.length).toBeGreaterThan(0);
        expect(snapshots.resized.length).toBeGreaterThan(0);

        const backToWide = await SkylineResizeFlowHelper.renderWithResize(resizeTex, 600, 1300);
        expect(backToWide.resized.length).toBeGreaterThan(0);
        expect(SkylineResizeFlowHelper.distinctSystemCount(backToWide.resized)).toBe(1);
    });
});
