import { Environment } from '@coderline/alphatab/Environment';
import type { EventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import { Logger } from '@coderline/alphatab/Logger';
import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Duration } from '@coderline/alphatab/model/Duration';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { TuningDisplayMode } from '@coderline/alphatab/model/RenderStylesheet';
import { type Score, ScoreStyle, ScoreSubElement } from '@coderline/alphatab/model/Score';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { type Track, TrackSubElement } from '@coderline/alphatab/model/Track';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { Profiler } from '@coderline/alphatab/profiling/Profiler';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { type EffectBandInfo, EffectBandMode } from '@coderline/alphatab/rendering/BarRendererFactory';
import type { EffectBandXRange } from '@coderline/alphatab/rendering/EffectBand';
import type { ActiveEffectBand } from '@coderline/alphatab/rendering/EffectBandContainer';
import { EffectSystemPlacement } from '@coderline/alphatab/rendering/EffectSystemPlacement';
import { ChordDiagramContainerGlyph } from '@coderline/alphatab/rendering/glyphs/ChordDiagramContainerGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { TuningContainerGlyph } from '@coderline/alphatab/rendering/glyphs/TuningContainerGlyph';
import { TuningGlyph } from '@coderline/alphatab/rendering/glyphs/TuningGlyph';
import type { RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import { SlurRegistry } from '@coderline/alphatab/rendering/layout/SlurRegistry';
import type { BeamingBounds } from '@coderline/alphatab/rendering/LineBarRenderer';
import { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { SkylineScratch } from '@coderline/alphatab/rendering/skyline/SkylineScratch';
import { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import { HeaderKey, type HeaderProfile } from '@coderline/alphatab/rendering/staves/HeaderProfile';
import { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import type { BeamingRuleLookup } from '@coderline/alphatab/rendering/utils/BeamingRuleLookup';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { TextMeasureCache } from '@coderline/alphatab/rendering/utils/TextMeasureCache';
import type { Settings } from '@coderline/alphatab/Settings';
import { Lazy } from '@coderline/alphatab/util/Lazy';

/**
 * @internal
 * @record
 */
interface LazyPartial {
    args: RenderFinishedEventArgs;
    renderCallback: (canvas: ICanvas) => void;
}

/**
 * This is the base class for creating new layouting engines for the score renderer.
 * @internal
 */
export abstract class ScoreLayout {
    private _barRendererLookup: Map<string, Map<number, BarRendererBase>> = new Map();

    protected pagePadding: number[] | null = null;

    public profile: Set<string> = new Set<string>();

    public abstract get name(): string;

    public renderer: ScoreRenderer;
    public width: number = 0;
    public height: number = 0;

    public readonly skylineScratch: SkylineScratch = new SkylineScratch();
    /**
     * Scratch result of the beaming bounds computation of the bar renderers.
     */
    public readonly beamingBoundsScratch: BeamingBounds = { topY: 0, bottomY: 0 };
    /**
     * Scratch range of the effect band placement.
     */
    public readonly effectBandRangeScratch: EffectBandXRange = { xStart: 0, xEnd: 0 };

    /** Scratch for the geometry of the tie being laid out, see {@link TieGlyph.newControlPoints}. */
    public readonly tieControlPoints: number[] = TieGlyph.newControlPoints();
    /** Scratch for the geometry of the tie being painted, see {@link TieGlyph.paintTie}. */
    public readonly tiePaintControlPoints: number[] = TieGlyph.newControlPoints();

    public readonly effectPlacement: EffectSystemPlacement;

    private _showAttribution: boolean = true;

    /**
     * The index of the bar renderer within each staff of `system` that carries the attribution, or -1.
     * Whether the attribution is shown at all is decided at the start of every layout and resize pass.
     */
    public attributionRendererIndex(system: StaffSystem): number {
        return this._showAttribution ? this.getAttributionRendererIndex(system) : -1;
    }

    protected abstract getAttributionRendererIndex(system: StaffSystem): number;

    /**
     * Songs up to this many bars are rendered without attribution, unless more than `_attributionFreeTrackCount`
     * tracks are rendered.
     */
    private static readonly _attributionFreeBarCount: number = 10;
    private static readonly _attributionFreeTrackCount: number = 2;

    private _resolveShowAttribution(): boolean {
        return (
            this.renderer.score!.masterBars.length > ScoreLayout._attributionFreeBarCount ||
            this.renderer.tracks!.length > ScoreLayout._attributionFreeTrackCount
        );
    }

    public multiBarRestInfo: Map<number, number[]> | null = null;

    public get scaledWidth() {
        return Math.round(this.width / this.renderer.settings.display.scale);
    }

    protected headerGlyphs: Map<ScoreSubElement, TextGlyph> = new Map();
    protected footerGlyphs: Map<ScoreSubElement, TextGlyph> = new Map();
    protected chordDiagrams: ChordDiagramContainerGlyph | null = null;
    protected tuningGlyph: TuningContainerGlyph | null = null;

    public constructor(renderer: ScoreRenderer) {
        this.renderer = renderer;
        this.effectPlacement = new EffectSystemPlacement(this.skylineScratch);
    }

    public abstract get firstBarX(): number;
    public abstract get supportsResize(): boolean;

    /** All staff systems currently held by the layout. Implementations may
     *  return a single-element list when the layout is single-system. */
    public abstract get systems(): StaffSystem[];

    public slurRegistry = new SlurRegistry();
    /**
     * The beaming rule lookups by beaming rules id and rule duration.
     */
    public beamingRuleLookups = new Map<string, Map<Duration, BeamingRuleLookup>>();

    /**
     * The master bars which had to be compressed below their minimum width in the current layout pass,
     * mapped to the largest missing width across their staves.
     */
    private _compressedBars: Map<number, number> = new Map();
    private static readonly _maxReportedCompressedBars: number = 10;

    /**
     * Registers a bar which had to be compressed below its minimum width (overlapping content).
     * @param masterBarIndex The index of the master bar.
     * @param missingWidth The width missing to fit the content without overlaps.
     */
    public reportCompressedBar(masterBarIndex: number, missingWidth: number): void {
        const existing = this._compressedBars.get(masterBarIndex);
        if (existing === undefined || existing < missingWidth) {
            this._compressedBars.set(masterBarIndex, missingWidth);
        }
    }

    private _logCompressedBars(): void {
        const compressedBars = this._compressedBars;
        if (compressedBars.size === 0) {
            return;
        }

        // bars are reported in layout order (system by system, left to right)
        const barNumbers: number[] = [];
        let maxMissingWidth = 0;
        for (const [index, missingWidth] of compressedBars) {
            barNumbers.push(index + 1);
            if (missingWidth > maxMissingWidth) {
                maxMissingWidth = missingWidth;
            }
        }

        const maxReported = ScoreLayout._maxReportedCompressedBars;
        let bars = barNumbers.slice(0, Math.min(maxReported, barNumbers.length)).join(', ');
        if (barNumbers.length > maxReported) {
            bars += ` and ${barNumbers.length - maxReported} more`;
        }

        const subject = barNumbers.length === 1 ? `Bar ${bars} does` : `Bars ${bars} do`;
        const missingPixels = Math.ceil(maxMissingWidth * this.renderer.settings.display.scale);
        Logger.warning(
            this.name,
            `${subject} not fit into the available width and had to be compressed below the minimum size ` +
                `(up to ${missingPixels}px missing). Notation elements might overlap. ` +
                'Increase the available width or reduce the display scale.'
        );
        compressedBars.clear();
    }

    /**
     * The duration reference of the spacing formula for all bars of this layout
     * (see {@link BarLayoutingInfo.referenceMinDuration}).
     */
    public referenceMinDuration: number = BarLayoutingInfo.defaultMinDuration;

    /**
     * The header profiles of this layout by {@link HeaderKey.high} and {@link HeaderKey.low}.
     */
    public readonly headerProfiles: Map<number, Map<number, HeaderProfile>> = new Map<
        number,
        Map<number, HeaderProfile>
    >();

    /**
     * Text measurements of this layout's canvas, reset with every full layout.
     */
    public readonly textMeasures: TextMeasureCache = new TextMeasureCache();

    /**
     * The effects that can create glyphs, by `2 * RenderStaff.index` (top) and `2 * RenderStaff.index + 1`
     * (bottom): every staff system of a layout has the same staves.
     */
    public readonly activeEffects: Map<number, ActiveEffectBand[]> = new Map<number, ActiveEffectBand[]>();

    /**
     * Reused while building the header key of a bar renderer.
     */
    public readonly headerKey: HeaderKey = new HeaderKey();

    /**
     * Whether all bars are spaced against {@link referenceMinDuration}. Layouts that size every bar
     * on its own keep a reference per bar instead.
     */
    public get sharesMinDurationAcrossBars(): boolean {
        return true;
    }

    public resize(): void {
        this._showAttribution = this._resolveShowAttribution();
        this._lazyPartials.clear();
        this.slurRegistry.clear();
        this._compressedBars.clear();
        Profiler.begin('layout.doResize');
        this.doResize();
        Profiler.end('layout.doResize');
        this._logCompressedBars();
    }
    public abstract doResize(): void;

    public abstract doUpdateForBars(renderHints: RenderHints): boolean;

    public layoutAndRender(renderHints?: RenderHints): void {
        this._showAttribution = this._resolveShowAttribution();
        this.slurRegistry.clear();
        this._compressedBars.clear();

        const score: Score = this.renderer.score!;

        this.firstBarIndex = ModelUtils.computeFirstDisplayedBarIndex(score, this.renderer.settings);
        this.lastBarIndex = ModelUtils.computeLastDisplayedBarIndex(score, this.renderer.settings, this.firstBarIndex);
        this.multiBarRestInfo = ModelUtils.buildMultiBarRestInfo(
            this.renderer.tracks,
            this.firstBarIndex,
            this.lastBarIndex
        );

        // bars laid out against another reference would be spaced inconsistently
        const previousReferenceMinDuration = this.referenceMinDuration;
        this.referenceMinDuration = BarLayoutingInfo.referenceMinDuration(
            this.renderer.tracks!,
            this.firstBarIndex,
            this.lastBarIndex
        );

        const firstChangedMasterBar = renderHints?.firstChangedMasterBar;
        if (firstChangedMasterBar !== undefined) {
            if (previousReferenceMinDuration === this.referenceMinDuration && this.doUpdateForBars(renderHints!)) {
                this._logCompressedBars();
                return;
            }
            // the renderer kept the bounds of the previous render for a partial update
            this.renderer.boundsWriter.begin(false);
        }

        this._lazyPartials.clear();
        this.beamingRuleLookups.clear();
        this.headerProfiles.clear();
        this.textMeasures.clear();
        this.activeEffects.clear();
        this._staffEffectInfos = [];
        this._barRendererLookup.clear();

        this.profile = Environment.staveProfiles.get(this.renderer.settings.display.staveProfile)!;

        this.pagePadding = this.renderer.settings.display.padding.map(p => p / this.renderer.settings.display.scale);
        if (!this.pagePadding) {
            this.pagePadding = [0, 0, 0, 0];
        }
        if (this.pagePadding.length === 1) {
            this.pagePadding = [this.pagePadding[0], this.pagePadding[0], this.pagePadding[0], this.pagePadding[0]];
        } else if (this.pagePadding.length === 2) {
            this.pagePadding = [this.pagePadding[0], this.pagePadding[1], this.pagePadding[0], this.pagePadding[1]];
        }

        this._createScoreInfoGlyphs();
        Profiler.begin('layout.doLayoutAndRender');
        this.doLayoutAndRender(renderHints);
        Profiler.end('layout.doLayoutAndRender');
        this._logCompressedBars();
    }

    private _lazyPartials: Map<string, LazyPartial> = new Map<string, LazyPartial>();

    protected getExistingPartialArgs(id: string): RenderFinishedEventArgs | undefined {
        return this._lazyPartials.has(id) ? this._lazyPartials.get(id)!.args : undefined;
    }

    protected unregisterPartial(id: string): void {
        this._lazyPartials.delete(id);
    }

    protected registerPartial(args: RenderFinishedEventArgs, callback: (canvas: ICanvas) => void) {
        if (args.height === 0) {
            return;
        }

        const scale = this.renderer.settings.display.scale;
        args.x *= scale;
        args.y *= scale;
        args.width *= scale;
        args.height *= scale;
        args.totalWidth *= scale;
        args.totalHeight *= scale;

        if (!this.renderer.settings.core.enableLazyLoading) {
            // in case of no lazy loading -> first notify about layout, then directly render
            (this.renderer.partialLayoutFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(args);
            this._internalRenderLazyPartial(args, callback);
        } else {
            // in case of lazy loading -> first register lazy, then notify
            const partial: LazyPartial = {
                args,
                renderCallback: callback
            };
            this._lazyPartials.set(args.id, partial);
            (this.renderer.partialLayoutFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(args);
        }
    }

    private _internalRenderLazyPartial(args: RenderFinishedEventArgs, callback: (canvas: ICanvas) => void) {
        const canvas = this.renderer.canvas!;
        canvas.beginRender(args.width, args.height);
        callback(canvas);
        // the registered args outlive the event: storing the result on them would keep every painted partial alive
        const rendered = new RenderFinishedEventArgs();
        rendered.id = args.id;
        rendered.reuseViewport = args.reuseViewport;
        rendered.x = args.x;
        rendered.y = args.y;
        rendered.width = args.width;
        rendered.height = args.height;
        rendered.totalWidth = args.totalWidth;
        rendered.totalHeight = args.totalHeight;
        rendered.firstMasterBarIndex = args.firstMasterBarIndex;
        rendered.lastMasterBarIndex = args.lastMasterBarIndex;
        rendered.renderResult = canvas.endRender();
        (this.renderer.partialRenderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(rendered);
    }

    public renderLazyPartial(resultId: string) {
        if (this._lazyPartials.has(resultId)) {
            const lazyPartial = this._lazyPartials.get(resultId)!;
            this._internalRenderLazyPartial(lazyPartial.args, lazyPartial.renderCallback);
        }
    }

    protected abstract doLayoutAndRender(renderHints: RenderHints | undefined): void;

    protected static readonly headerElements: Lazy<Map<ScoreSubElement, NotationElement | undefined>> = new Lazy(
        () =>
            new Map<ScoreSubElement, NotationElement | undefined>([
                [ScoreSubElement.Title, NotationElement.ScoreTitle],
                [ScoreSubElement.SubTitle, NotationElement.ScoreSubTitle],
                [ScoreSubElement.Artist, NotationElement.ScoreArtist],
                [ScoreSubElement.Album, NotationElement.ScoreAlbum],
                [ScoreSubElement.Words, NotationElement.ScoreWords],
                [ScoreSubElement.Music, NotationElement.ScoreMusic],
                [ScoreSubElement.WordsAndMusic, NotationElement.ScoreWordsAndMusic],
                [ScoreSubElement.Transcriber, undefined]
            ])
    );
    protected static readonly footerElements: Lazy<Map<ScoreSubElement, NotationElement | undefined>> = new Lazy(
        () =>
            new Map<ScoreSubElement, NotationElement | undefined>([
                [ScoreSubElement.Copyright, NotationElement.ScoreCopyright],
                [ScoreSubElement.CopyrightSecondLine, undefined]
            ])
    );

    private _createHeaderFooterGlyph(
        settings: Settings,
        score: Score,
        element: ScoreSubElement,
        notationElement: NotationElement | undefined
    ): TextGlyph | undefined {
        // special case 1: Words and Music combination
        // special case 2: Copyright2 without Copyright 1 (Assuming order here)
        switch (element) {
            case ScoreSubElement.WordsAndMusic:
                if (score.words !== score.music) {
                    return undefined;
                }
                break;
            case ScoreSubElement.Words:
            case ScoreSubElement.Music:
                if (score.words === score.music) {
                    return undefined;
                }
                break;
            case ScoreSubElement.CopyrightSecondLine:
                if (!this.footerGlyphs.has(ScoreSubElement.Copyright)) {
                    return undefined;
                }
                break;
        }

        const res = settings.display.resources;
        const notation = settings.notation;

        const hasStyle = score.style && score.style!.headerAndFooter.has(element);
        const style = hasStyle
            ? score.style!.headerAndFooter.get(element)!
            : ScoreStyle.defaultHeaderAndFooter.get(element)!;

        let isVisible = style.isVisible !== undefined ? style.isVisible! : true;
        if (notationElement !== undefined) {
            isVisible = notation.isNotationElementVisible(notationElement);
        }

        if (!isVisible) {
            return undefined;
        }

        const text = style.buildText(score);
        if (!text) {
            return undefined;
        }

        return new TextGlyph(
            0,
            0,
            text,
            res.getFontForElement(element),
            style.textAlign,
            undefined,
            ElementStyleHelper.scoreColor(res, element, score)
        );
    }

    private _createScoreInfoGlyphs(): void {
        Logger.trace('ScoreLayout', 'Creating score info glyphs');
        const settings = this.renderer.settings;
        const score: Score = this.renderer.score!;
        this.headerGlyphs = new Map<ScoreSubElement, TextGlyph>();
        this.footerGlyphs = new Map<ScoreSubElement, TextGlyph>();
        const fakeBarRenderer = new BarRendererBase(this.renderer, this.renderer.tracks![0].staves[0].bars[0]);

        for (const [scoreElement, notationElement] of ScoreLayout.headerElements.value) {
            const glyph = this._createHeaderFooterGlyph(settings, score, scoreElement, notationElement);
            if (glyph) {
                glyph.renderer = fakeBarRenderer;
                glyph.doLayout();
                this.headerGlyphs.set(scoreElement, glyph);
            }
        }

        for (const [scoreElement, notationElement] of ScoreLayout.footerElements.value) {
            const glyph = this._createHeaderFooterGlyph(settings, score, scoreElement, notationElement);
            if (glyph) {
                glyph.renderer = fakeBarRenderer;
                glyph.doLayout();
                this.footerGlyphs.set(scoreElement, glyph);
            }
        }

        const notation = settings.notation;
        const res = settings.display.resources;
        if (notation.isNotationElementVisible(NotationElement.GuitarTuning)) {
            const stavesWithTuning: Staff[] = [];
            for (const track of this.renderer.tracks!) {
                for (const staff of track.staves) {
                    let showTuning =
                        !staff.isPercussion && staff.isStringed && staff.tuning.length > 0 && staff.showTablature;

                    if (
                        score.stylesheet.perTrackDisplayTuning &&
                        score.stylesheet.perTrackDisplayTuning!.has(track.index) &&
                        score.stylesheet.perTrackDisplayTuning!.get(track.index) === false
                    ) {
                        showTuning = false;
                    }

                    if (showTuning) {
                        stavesWithTuning.push(staff);
                        break;
                    }
                }
            }
            // tuning info
            if (
                stavesWithTuning.length > 0 &&
                score.stylesheet.globalDisplayTuning &&
                score.stylesheet.tuningDisplayMode === TuningDisplayMode.Score
            ) {
                this.tuningGlyph = new TuningContainerGlyph(0, 0);
                this.tuningGlyph.renderer = fakeBarRenderer;
                for (const staff of stavesWithTuning) {
                    if (staff.stringTuning.tunings.length > 0) {
                        const trackLabel = stavesWithTuning.length > 1 ? staff.track.name : '';
                        const item: TuningGlyph = new TuningGlyph(0, 0, staff.stringTuning, trackLabel);
                        item.colorOverride = ElementStyleHelper.trackColor(
                            TrackSubElement.StringTuning,
                            staff.track,
                            res.scoreInfoColor
                        );
                        item.renderer = fakeBarRenderer;
                        item.doLayout();
                        this.tuningGlyph.addGlyph(item);
                    }
                }
            } else {
                this.tuningGlyph = null;
            }
        }
        // chord diagram glyphs
        if (notation.isNotationElementVisible(NotationElement.ChordDiagrams)) {
            this.chordDiagrams = new ChordDiagramContainerGlyph(0, 0);
            this.chordDiagrams.renderer = fakeBarRenderer;
            const chordIds: Set<string> = new Set<string>();

            for (const track of this.renderer.tracks!) {
                const shouldShowDiagramsForTrack =
                    score.stylesheet.globalDisplayChordDiagramsOnTop &&
                    (score.stylesheet.perTrackChordDiagramsOnTop == null ||
                        !score.stylesheet.perTrackChordDiagramsOnTop.has(track.index) ||
                        score.stylesheet.perTrackChordDiagramsOnTop.get(track.index)!);

                if (!shouldShowDiagramsForTrack) {
                    continue;
                }

                for (const staff of track.staves) {
                    const sc = staff.chords;
                    if (sc) {
                        for (const [, chord] of sc) {
                            if (!chordIds.has(chord.uniqueId)) {
                                if (chord.showDiagram) {
                                    chordIds.add(chord.uniqueId);
                                    this.chordDiagrams!.addChord(chord);
                                }
                            }
                        }
                    }
                }
            }

            if (this.chordDiagrams.isEmpty) {
                this.chordDiagrams = null;
            }
        } else {
            this.chordDiagrams = null;
        }
    }

    public firstBarIndex: number = 0;

    public lastBarIndex: number = 0;

    /**
     * The top and bottom effect infos of the staves of the first staff system (two entries per staff),
     * shared by all staff systems of the layout.
     */
    private _staffEffectInfos: EffectBandInfo[][] = [];

    protected createEmptyStaffSystem(index: number): StaffSystem {
        const system: StaffSystem = new StaffSystem(this);
        system.index = index;
        const allFactories = Environment.defaultRenderers;

        const renderStaves: RenderStaff[] = [];
        // every staff system has the same staves
        const staffEffectInfos = this._staffEffectInfos;
        const reuseEffectInfos = staffEffectInfos.length > 0;
        for (let trackIndex: number = 0; trackIndex < this.renderer.tracks!.length; trackIndex++) {
            const track: Track = this.renderer.tracks![trackIndex];

            for (let staffIndex: number = 0; staffIndex < track.staves.length; staffIndex++) {
                const staff = track.staves[staffIndex];

                let sharedTopEffects: EffectBandInfo[] = [];
                let sharedBottomEffects: EffectBandInfo[] = [];

                let previousStaff: RenderStaff | undefined = undefined;

                for (const factory of allFactories) {
                    if (this.profile.has(factory.staffId) && factory.canCreate(track, staff)) {
                        const renderStaff = new RenderStaff(system, trackIndex, staff, factory);
                        if (reuseEffectInfos) {
                            renderStaff.topEffectInfos = staffEffectInfos[renderStaves.length * 2];
                            renderStaff.bottomEffectInfos = staffEffectInfos[renderStaves.length * 2 + 1];
                        } else {
                            renderStaff.createEffectInfos();
                            // insert shared effect bands at front
                            renderStaff.topEffectInfos.splice(0, 0, ...sharedTopEffects);
                            renderStaff.bottomEffectInfos.push(...sharedBottomEffects);
                        }
                        previousStaff = renderStaff;
                        // just remember staff, adding to system comes later when we have all effects collected
                        renderStaves.push(renderStaff);
                        sharedTopEffects = [];
                        sharedBottomEffects = [];
                    } else {
                        for (const e of factory.effectBands) {
                            switch (e.mode) {
                                case EffectBandMode.SharedTop:
                                    sharedTopEffects.push(e);
                                    break;
                                case EffectBandMode.SharedBottom:
                                    sharedBottomEffects.push(e);
                                    break;
                            }
                        }
                    }
                }

                // don't forget any left-over shared effects.
                if (previousStaff && !reuseEffectInfos) {
                    if (sharedTopEffects.length > 0) {
                        previousStaff.bottomEffectInfos.push(...sharedTopEffects);
                    }
                    if (sharedBottomEffects.length > 0) {
                        previousStaff.bottomEffectInfos.push(...sharedBottomEffects);
                    }
                }
            }
        }

        for (const staff of renderStaves) {
            system.addStaff(staff);
            if (!reuseEffectInfos) {
                staffEffectInfos.push(staff.topEffectInfos);
                staffEffectInfos.push(staff.bottomEffectInfos);
            }
        }

        return system;
    }

    public registerBarRenderer(key: string, renderer: BarRendererBase): void {
        if (!this._barRendererLookup.has(key)) {
            this._barRendererLookup.set(key, new Map<number, BarRendererBase>());
        }
        this._barRendererLookup.get(key)!.set(renderer.bar.id, renderer);
        if (renderer.additionalMultiRestBars) {
            for (const b of renderer.additionalMultiRestBars) {
                this._barRendererLookup.get(key)!.set(b.id, renderer);
            }
        }
    }

    public getRendererForBar(key: string, bar: Bar): BarRendererBase | null {
        const barRendererId: number = bar.id;
        if (this._barRendererLookup.has(key) && this._barRendererLookup.get(key)!.has(barRendererId)) {
            return this._barRendererLookup.get(key)!.get(barRendererId)!;
        }
        return null;
    }

    protected layoutAndRenderBottomScoreInfo(y: number): number {
        y = Math.round(y);
        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;

        let infoHeight = 0;

        const res: RenderingResources = this.renderer.settings.display.resources;
        const scoreInfoGlyphs: TextGlyph[] = [];

        let width = 0;

        for (const [scoreElement, _notationElement] of ScoreLayout.footerElements.value) {
            if (this.footerGlyphs.has(scoreElement)) {
                const glyph: TextGlyph = this.footerGlyphs.get(scoreElement)!;
                glyph.y = infoHeight;
                this.alignScoreInfoGlyph(glyph);
                infoHeight += glyph.height;
                scoreInfoGlyphs.push(glyph);
                width = Math.max(width, Math.round(glyph.x + glyph.width));
            }
        }

        infoHeight = Math.round(infoHeight);

        if (scoreInfoGlyphs.length > 0) {
            e.width = width;
            e.height = infoHeight;
            e.totalWidth = this.scaledWidth;
            e.totalHeight = y + e.height;
            this.registerPartial(e, (canvas: ICanvas) => {
                canvas.color = res.scoreInfoColor;
                canvas.textAlign = TextAlign.Left;
                canvas.textBaseline = TextBaseline.Top;
                for (const g of scoreInfoGlyphs) {
                    g.paint(0, 0, canvas);
                }
            });
        }

        return y + infoHeight;
    }

    protected alignScoreInfoGlyph(glyph: TextGlyph) {
        const isVertical = Environment.getLayoutEngineFactory(this.renderer.settings.display.layoutMode).vertical;
        if (isVertical) {
            switch (glyph.textAlign) {
                case TextAlign.Left:
                    glyph.x = this.pagePadding![0];
                    break;
                case TextAlign.Center:
                    glyph.x = this.scaledWidth / 2;
                    break;
                case TextAlign.Right:
                    glyph.x = this.scaledWidth - this.pagePadding![2];
                    break;
            }
        } else {
            glyph.x = this.firstBarX;
            glyph.textAlign = TextAlign.Left;
        }
    }
}
