/**
 * Shared harness for skyline integration tests. Drives the full alphaSkia
 * pipeline.
 *
 * @internal
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
import { TestUiFacade } from '../TestUiFacade';
import { VisualTestHelper } from '../VisualTestHelper';

/**
 * @record
 * @internal
 */
export interface BarSegment {
    xStart: number;
    xEnd: number;
    height: number;
}

/**
 * @record
 * @internal
 */
export interface BarSkylineSnapshot {
    barIndex: number;
    renderer: string;
    rendererLineLocalX: number;
    rendererWidth: number;
    upSegments: BarSegment[];
    downSegments: BarSegment[];
    upMax: number;
    downMax: number;
}

/**
 * @record
 * @internal
 */
export interface StaffSkylineSnapshot {
    systemIndex: number;
    staffIndex: number;
    staffKey: string;
    upMax: number;
    downMax: number;
    bars: BarSkylineSnapshot[];
}

/**
 * @internal
 */
export class SkylineTestHarness {
    public static async loadScore(tex: string): Promise<Score> {
        const settings = new Settings();
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        return importer.readScore();
    }

    public static classifyRenderer(staffId: string): string {
        if (staffId.indexOf('score') >= 0) {
            return 'score';
        }
        if (staffId.indexOf('tab') >= 0) {
            return 'tab';
        }
        if (staffId.indexOf('slash') >= 0) {
            return 'slash';
        }
        if (staffId.indexOf('numbered') >= 0) {
            return 'numbered';
        }
        return 'other';
    }

    public static captureSnapshot(api: AlphaTabApiBase<unknown>): StaffSkylineSnapshot[] {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        const systems = inner.layout!.systems;

        const out: StaffSkylineSnapshot[] = [];
        for (const system of systems) {
            for (const group of system.staves) {
                for (const staff of group.staves) {
                    if (!staff.isVisible) {
                        continue;
                    }
                    const staffId = staff.staffId;
                    const bars: BarSkylineSnapshot[] = [];
                    for (const renderer of staff.barRenderers) {
                        const upSegs: BarSegment[] = [];
                        const downSegs: BarSegment[] = [];
                        renderer.barLocalSkyline.upSky.forEachSegment((xStart, xEnd, height) => {
                            if (height > 0) {
                                const seg: BarSegment = { xStart, xEnd, height };
                                upSegs.push(seg);
                            }
                        });
                        renderer.barLocalSkyline.downSky.forEachSegment((xStart, xEnd, height) => {
                            if (height > 0) {
                                const seg: BarSegment = { xStart, xEnd, height };
                                downSegs.push(seg);
                            }
                        });
                        const bar: BarSkylineSnapshot = {
                            barIndex: renderer.bar.index,
                            renderer: SkylineTestHarness.classifyRenderer(staffId),
                            rendererLineLocalX: renderer.x,
                            rendererWidth: renderer.width,
                            upSegments: upSegs,
                            downSegments: downSegs,
                            upMax: renderer.barLocalSkyline.upSky.maxHeight(),
                            downMax: renderer.barLocalSkyline.downSky.maxHeight()
                        };
                        bars.push(bar);
                    }
                    const staffSnap: StaffSkylineSnapshot = {
                        systemIndex: system.index,
                        staffIndex: staff.staffIndex,
                        staffKey: `${staff.staffTrackGroup.track.index}/${staffId}`,
                        upMax: staff.systemSkyline.upSky.maxHeight(),
                        downMax: staff.systemSkyline.downSky.maxHeight(),
                        bars
                    };
                    out.push(staffSnap);
                }
            }
        }
        return out;
    }

    /** Single render at one width via a fresh API. */
    public static async renderSkylineOnce(tex: string, width: number = 1300): Promise<StaffSkylineSnapshot[]> {
        await VisualTestHelper.prepareAlphaSkia();
        const score = await SkylineTestHarness.loadScore(tex);
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = width;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        let captured: StaffSkylineSnapshot[] = [];
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    captured = SkylineTestHarness.captureSnapshot(api);
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

    /** Find the score-staff snapshot for the given track index. */
    public static findScoreStaff(snapshots: StaffSkylineSnapshot[], trackIndex: number = 0): StaffSkylineSnapshot {
        const staff = snapshots.find(s => s.staffKey.startsWith(`${trackIndex}/`) && s.bars.some(b => b.renderer === 'score'));
        if (!staff) {
            throw new Error(`no score staff found for track ${trackIndex}`);
        }
        return staff;
    }

    /** Find the tab-staff snapshot for the given track index. */
    public static findTabStaff(snapshots: StaffSkylineSnapshot[], trackIndex: number = 0): StaffSkylineSnapshot {
        const staff = snapshots.find(s => s.staffKey.startsWith(`${trackIndex}/`) && s.bars.some(b => b.renderer === 'tab'));
        if (!staff) {
            throw new Error(`no tab staff found for track ${trackIndex}`);
        }
        return staff;
    }

    /** Find the slash-staff snapshot for the given track index. */
    public static findSlashStaff(snapshots: StaffSkylineSnapshot[], trackIndex: number = 0): StaffSkylineSnapshot {
        const staff = snapshots.find(s => s.staffKey.startsWith(`${trackIndex}/`) && s.bars.some(b => b.renderer === 'slash'));
        if (!staff) {
            throw new Error(`no slash staff found for track ${trackIndex}`);
        }
        return staff;
    }

    /** Find the numbered-staff snapshot for the given track index. */
    public static findNumberedStaff(snapshots: StaffSkylineSnapshot[], trackIndex: number = 0): StaffSkylineSnapshot {
        const staff = snapshots.find(s => s.staffKey.startsWith(`${trackIndex}/`) && s.bars.some(b => b.renderer === 'numbered'));
        if (!staff) {
            throw new Error(`no numbered staff found for track ${trackIndex}`);
        }
        return staff;
    }

    /**
     * Maximum height of any up-segment whose x-range overlaps [xStart, xEnd]
     * within the given bar snapshot. Returns 0 if no overlapping segment.
     */
    public static maxUpHeightInRange(bar: BarSkylineSnapshot, xStart: number, xEnd: number): number {
        let max = 0;
        for (const s of bar.upSegments) {
            if (s.xEnd > xStart && s.xStart < xEnd && s.height > max) {
                max = s.height;
            }
        }
        return max;
    }

    /**
     * Maximum height of any down-segment whose x-range overlaps [xStart, xEnd]
     * within the given bar snapshot. Returns 0 if no overlapping segment.
     */
    public static maxDownHeightInRange(bar: BarSkylineSnapshot, xStart: number, xEnd: number): number {
        let max = 0;
        for (const s of bar.downSegments) {
            if (s.xEnd > xStart && s.xStart < xEnd && s.height > max) {
                max = s.height;
            }
        }
        return max;
    }
}
