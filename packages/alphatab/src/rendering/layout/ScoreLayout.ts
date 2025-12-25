import { Environment } from '@coderline/alphatab/Environment';
import type { EventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import { Logger } from '@coderline/alphatab/Logger';
import type { Bar } from '@coderline/alphatab/model/Bar';
import { Font, FontStyle, FontWeight } from '@coderline/alphatab/model/Font';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { type Score, ScoreStyle, ScoreSubElement } from '@coderline/alphatab/model/Score';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { type Track, TrackSubElement } from '@coderline/alphatab/model/Track';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { type EffectBandInfo, EffectBandMode } from '@coderline/alphatab/rendering/BarRendererFactory';
import { ChordDiagramContainerGlyph } from '@coderline/alphatab/rendering/glyphs/ChordDiagramContainerGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { TuningContainerGlyph } from '@coderline/alphatab/rendering/glyphs/TuningContainerGlyph';
import { TuningGlyph } from '@coderline/alphatab/rendering/glyphs/TuningGlyph';
import { SlurRegistry } from '@coderline/alphatab/rendering/layout/SlurRegistry';
import { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import type { Settings } from '@coderline/alphatab/Settings';
import { Lazy } from '@coderline/alphatab/util/Lazy';

/**
 * @internal
 */
class LazyPartial {
    public args: RenderFinishedEventArgs;
    public renderCallback: (canvas: ICanvas) => void;
    public constructor(args: RenderFinishedEventArgs, renderCallback: (canvas: ICanvas) => void) {
        this.args = args;
        this.renderCallback = renderCallback;
    }
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
    }

    public abstract get firstBarX(): number;
    public abstract get supportsResize(): boolean;

    public slurRegistry = new SlurRegistry();

    public resize(): void {
        this._lazyPartials.clear();
        this.slurRegistry.clear();
        this.doResize();
    }
    public abstract doResize(): void;

    public layoutAndRender(): void {
        this._lazyPartials.clear();
        this.slurRegistry.clear();
        this._barRendererLookup.clear();

        this.profile = Environment.staveProfiles.get(this.renderer.settings.display.staveProfile)!;

        const score: Score = this.renderer.score!;

        this.firstBarIndex = ModelUtils.computeFirstDisplayedBarIndex(score, this.renderer.settings);
        this.lastBarIndex = ModelUtils.computeLastDisplayedBarIndex(score, this.renderer.settings, this.firstBarIndex);
        this.multiBarRestInfo = ModelUtils.buildMultiBarRestInfo(
            this.renderer.tracks,
            this.firstBarIndex,
            this.lastBarIndex
        );

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
        this.doLayoutAndRender();
    }

    private _lazyPartials: Map<string, LazyPartial> = new Map<string, LazyPartial>();

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
            this._lazyPartials.set(args.id, new LazyPartial(args, callback));
            (this.renderer.partialLayoutFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(args);
        }
    }

    private _internalRenderLazyPartial(args: RenderFinishedEventArgs, callback: (canvas: ICanvas) => void) {
        const canvas = this.renderer.canvas!;
        canvas.beginRender(args.width, args.height);
        callback(canvas);
        args.renderResult = canvas.endRender();
        (this.renderer.partialRenderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(args);
    }

    public renderLazyPartial(resultId: string) {
        if (this._lazyPartials.has(resultId)) {
            const lazyPartial = this._lazyPartials.get(resultId)!;
            this._internalRenderLazyPartial(lazyPartial.args, lazyPartial.renderCallback);
        }
    }

    protected abstract doLayoutAndRender(): void;

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
        Logger.debug('ScoreLayout', 'Creating score info glyphs');
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
            if (stavesWithTuning.length > 0 && score.stylesheet.globalDisplayTuning) {
                this.tuningGlyph = new TuningContainerGlyph(0, 0);
                this.tuningGlyph.renderer = fakeBarRenderer;
                for (const staff of stavesWithTuning) {
                    if (staff.stringTuning.tunings.length > 0) {
                        const trackLabel = stavesWithTuning.length > 1 ? staff.track.name : '';
                        const item: TuningGlyph = new TuningGlyph(0, 0, staff.stringTuning, trackLabel);
                        item.colorOverride = ElementStyleHelper.trackColor(
                            res,
                            TrackSubElement.StringTuning,
                            staff.track
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

    protected createEmptyStaffSystem(index: number): StaffSystem {
        const system: StaffSystem = new StaffSystem(this);
        system.index = index;
        const allFactories = Environment.defaultRenderers;

        const renderStaves: RenderStaff[] = [];
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
                        // insert shared effect bands at front
                        renderStaff.topEffectInfos.splice(0, 0, ...sharedTopEffects);
                        renderStaff.bottomEffectInfos.push(...sharedBottomEffects);
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
                if (previousStaff) {
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

    public layoutAndRenderAnnotation(y: number): number {
        // attention, you are not allowed to remove change this notice within any version of this library without permission!
        const msg: string = 'rendered by alphaTab';
        const resources: RenderingResources = this.renderer.settings.display.resources;
        const size: number = 12;
        const font = Font.withFamilyList(resources.copyrightFont.families, size, FontStyle.Plain, FontWeight.Bold);

        const fakeBarRenderer = new BarRendererBase(this.renderer, this.renderer.tracks![0].staves[0].bars[0]);
        const glyph = new TextGlyph(0, 0, msg, font, TextAlign.Center, undefined, resources.mainGlyphColor);
        glyph.renderer = fakeBarRenderer;
        glyph.doLayout();
        this.alignScoreInfoGlyph(glyph);

        const e = new RenderFinishedEventArgs();

        e.width = glyph.x + glyph.width;
        e.x = 0;
        e.height = size;
        e.y = y;

        e.totalWidth = this.scaledWidth;
        e.totalHeight = y + size;
        e.firstMasterBarIndex = -1;
        e.lastMasterBarIndex = -1;

        this.registerPartial(e, canvas => {
            canvas.color = resources.mainGlyphColor;
            canvas.font = font;
            canvas.textAlign = TextAlign.Left;
            canvas.textBaseline = TextBaseline.Top;
            glyph.paint(0, 0, canvas);
        });

        return y + size;
    }
}
