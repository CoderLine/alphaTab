/**
 * Test-only placement inspector. Renders a tex score via the full pipeline
 * (alphaSkia + AlphaTabApiBase) and emits a human-readable textual report
 * of every effect band's skyline placement decision.
 *
 * @internal
 */
import { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import type { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import { Settings } from '@coderline/alphatab/Settings';
import { TestUiFacade } from '../TestUiFacade';
import { VisualTestHelper } from '../VisualTestHelper';
import type { EffectBandXRange } from '@coderline/alphatab/rendering/EffectBand';

/**
 * @internal
 */
export class PlacementInspectorHelper {
    private static readonly _xRangeScratch: EffectBandXRange = { xStart: 0, xEnd: 0 };

    public static async loadScore(tex: string): Promise<Score> {
        const settings = new Settings();
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        return importer.readScore();
    }

    public static loadScoreFromBytes(bytes: Uint8Array): Score {
        return ScoreLoader.loadScoreFromBytes(bytes);
    }

    public static sizingName(s: EffectBarGlyphSizing): string {
        switch (s) {
            case EffectBarGlyphSizing.SinglePreBeat:
                return 'SinglePreBeat';
            case EffectBarGlyphSizing.SingleOnBeat:
                return 'SingleOnBeat';
            case EffectBarGlyphSizing.SingleOnBeatToEnd:
                return 'SingleOnBeatToEnd';
            case EffectBarGlyphSizing.GroupedOnBeat:
                return 'GroupedOnBeat';
            case EffectBarGlyphSizing.GroupedOnBeatToEnd:
                return 'GroupedOnBeatToEnd';
            case EffectBarGlyphSizing.FullBar:
                return 'FullBar';
            default:
                return 'Unknown';
        }
    }

    /**
     * Mirrors the tier logic in
     * {@link import('@coderline/alphatab/rendering/EffectSystemPlacement').EffectSystemPlacement}
     * so the report shows the same classification the placement pass used.
     */
    public static tier(band: EffectBand): number {
        const sm = band.info.sizingMode;
        const single =
            sm === EffectBarGlyphSizing.SinglePreBeat ||
            sm === EffectBarGlyphSizing.SingleOnBeat ||
            sm === EffectBarGlyphSizing.SingleOnBeatToEnd;
        return single && band.firstBeat === band.lastBeat ? 1 : 2;
    }

    public static n(value: number, fractionDigits: number = 2): string {
        if (Number.isNaN(value) || value === Number.POSITIVE_INFINITY || value === -Number.POSITIVE_INFINITY) {
            return value.toString();
        }
        const factor = Math.pow(10, fractionDigits);
        const rounded = Math.round(value * factor) / factor;
        return rounded.toString();
    }

    public static dumpSegments(label: string, sky: Skyline, indent: string): string {
        const parts: string[] = [];
        sky.forEachSegment((xStart, xEnd, height) => {
            if (height > 0) {
                parts.push(`(${PlacementInspectorHelper.n(xStart)},${PlacementInspectorHelper.n(xEnd)},${PlacementInspectorHelper.n(height)})`);
            }
        });
        const max = sky.maxHeight();
        return `${indent}${label}: [${parts.join('')}]  max=${PlacementInspectorHelper.n(max)}`;
    }

    public static effectName(band: EffectBand): string {
        const id = band.info.effectId;
        const numeric = Number.parseInt(id, 10);
        if (!Number.isNaN(numeric)) {
            const enumName = NotationElement[numeric];
            if (enumName) {
                return enumName;
            }
        }
        return id;
    }

    public static dumpBand(band: EffectBand, index: number, indent: string): string {
        const lines: string[] = [];
        const hasRange = band.computeLocalXRange(PlacementInspectorHelper._xRangeScratch);
        const xLocal = hasRange
            ? `(${PlacementInspectorHelper.n(PlacementInspectorHelper._xRangeScratch.xStart)},${PlacementInspectorHelper.n(PlacementInspectorHelper._xRangeScratch.xEnd)})`
            : '<null>';
        const outerEdge = band.placedMagnitude + band.height;
        const firstBeatIdx = band.firstBeat ? band.firstBeat.index : -1;
        const lastBeatIdx = band.lastBeat ? band.lastBeat.index : -1;
        lines.push(
            `${indent}[${index}] effect=${PlacementInspectorHelper.effectName(band)}  sizing=${PlacementInspectorHelper.sizingName(band.info.sizingMode)}  tier=${PlacementInspectorHelper.tier(band)}` +
                `  isEmpty=${band.isEmpty}`
        );
        lines.push(
            `${indent}    firstBeat=${firstBeatIdx} lastBeat=${lastBeatIdx}  xLocal=${xLocal}  band.height=${PlacementInspectorHelper.n(band.height)}`
        );
        lines.push(
            `${indent}    placedMagnitude=${PlacementInspectorHelper.n(band.placedMagnitude)}  outerEdge=${PlacementInspectorHelper.n(outerEdge)}  band.y=${PlacementInspectorHelper.n(band.y)}`
        );
        return lines.join('\n');
    }

    public static dumpRenderer(renderer: BarRendererBase, indent: string): string {
        const lines: string[] = [];
        const contentTop = renderer.topOverflow - renderer.topEffects.height;
        const contentBottom = renderer.bottomOverflow - renderer.bottomEffects.height;
        lines.push(
            `${indent}Renderer[${renderer.index}]  x=${PlacementInspectorHelper.n(renderer.x)}  width=${PlacementInspectorHelper.n(renderer.width)}` +
                `  topOverflow=${PlacementInspectorHelper.n(renderer.topOverflow)} (content=${PlacementInspectorHelper.n(contentTop)}, effects=${PlacementInspectorHelper.n(renderer.topEffects.height)})` +
                `  bottomOverflow=${PlacementInspectorHelper.n(renderer.bottomOverflow)} (content=${PlacementInspectorHelper.n(contentBottom)}, effects=${PlacementInspectorHelper.n(renderer.bottomEffects.height)})`
        );
        lines.push(PlacementInspectorHelper.dumpSegments('barLocal.up', renderer.barLocalSkyline.upSky, `${indent}    `));
        lines.push(PlacementInspectorHelper.dumpSegments('barLocal.down', renderer.barLocalSkyline.downSky, `${indent}    `));

        const topBands = renderer.topEffects.bands;
        lines.push(`${indent}    topBands[${topBands.length}]:`);
        for (let i = 0; i < topBands.length; i++) {
            lines.push(PlacementInspectorHelper.dumpBand(topBands[i], i, `${indent}      `));
        }
        const bottomBands = renderer.bottomEffects.bands;
        lines.push(`${indent}    bottomBands[${bottomBands.length}]:`);
        for (let i = 0; i < bottomBands.length; i++) {
            lines.push(PlacementInspectorHelper.dumpBand(bottomBands[i], i, `${indent}      `));
        }
        return lines.join('\n');
    }

    public static dumpStaff(staff: RenderStaff, system: StaffSystem): string {
        const lines: string[] = [];
        lines.push(
            `Staff  systemIndex=${system.index}  staffIndex=${staff.staffIndex}` +
                `  track=${staff.staffTrackGroup.track.index}  id=${staff.staffId}` +
                `  topOverflow=${PlacementInspectorHelper.n(staff.topOverflow)}  bottomOverflow=${PlacementInspectorHelper.n(staff.bottomOverflow)}` +
                `  topPadding=${PlacementInspectorHelper.n(staff.topPadding)}  bottomPadding=${PlacementInspectorHelper.n(staff.bottomPadding)}`
        );
        lines.push(PlacementInspectorHelper.dumpSegments('  systemSkyline.upSky', staff.systemSkyline.upSky, ''));
        lines.push(PlacementInspectorHelper.dumpSegments('  systemSkyline.downSky', staff.systemSkyline.downSky, ''));
        for (const renderer of staff.barRenderers) {
            lines.push(PlacementInspectorHelper.dumpRenderer(renderer, '  '));
        }
        return lines.join('\n');
    }

    public static captureReport(api: AlphaTabApiBase<unknown>, tex: string, width: number): string {
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const inner = wrapper.instance as unknown as ScoreRenderer;
        const systems = inner.layout!.systems;

        const lines: string[] = [];
        const escaped = tex.replace(/\n/g, '\\n');
        lines.push(`inspectPlacement  tex="${escaped}"  width=${width}`);
        lines.push('-'.repeat(80));

        for (const system of systems) {
            for (const group of system.staves) {
                for (const staff of group.staves) {
                    if (!staff.isVisible) {
                        continue;
                    }
                    lines.push(PlacementInspectorHelper.dumpStaff(staff, system));
                    lines.push('');
                }
            }
        }
        return lines.join('\n');
    }

    /**
     * Render `tex` once at the given width and return a textual placement
     * report. Designed for `console.log` output inside throwaway repro tests.
     */
    public static async inspectPlacement(tex: string, width: number = 1000): Promise<string> {
        const score = await PlacementInspectorHelper.loadScore(tex);
        return await PlacementInspectorHelper.inspectScore(score, width, tex);
    }

    /**
     * Render a pre-loaded {@link Score} at the given width and return a textual
     * placement report. Use when the repro lives in a file format other than
     * alphaTex (MusicXML, GP, …); load via {@link ScoreLoader.loadScoreFromBytes}.
     *
     * The `matchVisualTest` flag (default `true`) mirrors the settings the
     * MusicXML / non-tex visual test suites apply, so the layout numbers in the
     * report match what the reference PNG would render at the given width:
     *   - `justifyLastSystem = true` when the score has > 4 master bars;
     *   - `layoutMode = Parchment` when any track has an explicit systems layout;
     *   - all tracks rendered.
     */
    public static async inspectScoreFromBytes(
        bytes: Uint8Array,
        width: number = 1000,
        label: string = '<file>',
        matchVisualTest: boolean = true
    ): Promise<string> {
        const score = PlacementInspectorHelper.loadScoreFromBytes(bytes);
        return await PlacementInspectorHelper.inspectScore(score, width, label, matchVisualTest);
    }

    public static async inspectScore(
        score: Score,
        width: number,
        label: string,
        matchVisualTest: boolean = false
    ): Promise<string> {
        await VisualTestHelper.prepareAlphaSkia();
        const settings = new Settings();
        VisualTestHelper.prepareSettingsForTest(settings);

        let tracks: number[] | undefined;
        if (matchVisualTest) {
            settings.display.justifyLastSystem = score.masterBars.length > 4;
            if (score.tracks.some(t => t.systemsLayout.length > 0)) {
                settings.display.layoutMode = LayoutMode.Parchment;
            }
            tracks = score.tracks.map(t => t.index);
        } else {
            tracks = [0];
        }

        const uiFacade = new TestUiFacade();
        uiFacade.rootContainer.width = width;
        const api = new AlphaTabApiBase<unknown>(uiFacade, settings);

        let report = '';
        try {
            await new Promise<void>((resolve, reject) => {
                api.renderer.postRenderFinished.on(() => {
                    report = PlacementInspectorHelper.captureReport(api, label, width);
                    resolve();
                });
                api.error.on(e => {
                    reject(
                        new AlphaTabError(
                            AlphaTabErrorType.General,
                            `inspectPlacement failed (${e.message} ${e.stack})`,
                            e
                        )
                    );
                });
                const renderScore = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), settings);
                api.renderScore(renderScore, tracks);
                setTimeout(() => reject(new Error('inspectPlacement render harness timed out')), 5000);
            });
        } finally {
            api.destroy();
        }
        return report;
    }
}
