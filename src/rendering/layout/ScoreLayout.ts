import { Environment } from '@src/Environment';
import type { Bar } from '@src/model/Bar';
import { Font, FontStyle, FontWeight } from '@src/model/Font';
import { type Score, ScoreStyle, ScoreSubElement } from '@src/model/Score';
import type { Staff } from '@src/model/Staff';
import { type Track, TrackSubElement } from '@src/model/Track';
import { type ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import type { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { ChordDiagramContainerGlyph } from '@src/rendering/glyphs/ChordDiagramContainerGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { StaffSystem } from '@src/rendering/staves/StaffSystem';
import type { RenderingResources } from '@src/RenderingResources';
import { Logger } from '@src/Logger';
import type { EventEmitterOfT } from '@src/EventEmitter';
import { NotationElement } from '@src/NotationSettings';
import { TuningContainerGlyph } from '@src/rendering/glyphs/TuningContainerGlyph';
import { ModelUtils } from '@src/model/ModelUtils';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { TuningGlyph } from '@src/rendering/glyphs/TuningGlyph';
import type { Settings } from '@src/Settings';
import { Lazy } from '@src/util/Lazy';

class LazyPartial {
    public args: RenderFinishedEventArgs;
    public renderCallback: (canvas: ICanvas) => void;
    public constructor(args: RenderFinishedEventArgs, renderCallback: (canvas: ICanvas) => void) {
        this.args = args;
        this.renderCallback = renderCallback;
    }
}

/**
 * Lists the different modes in which the staves and systems are arranged.
 */
export enum InternalSystemsLayoutMode {
    /**
     * Use the automatic alignment system provided by alphaTab (default)
     */
    Automatic = 0,

    /**
     * Use the relative scaling information stored in the score model.
     */
    FromModelWithScale = 1,

    /**
     * Use the absolute size information stored in the score model.
     */
    FromModelWithWidths = 2
}

/**
 * This is the base class for creating new layouting engines for the score renderer.
 */
export abstract class ScoreLayout {
    private _barRendererLookup: Map<string, Map<number, BarRendererBase>> = new Map();

    protected pagePadding: number[] | null = null;

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

    public systemsLayoutMode: InternalSystemsLayoutMode = InternalSystemsLayoutMode.Automatic;

    public constructor(renderer: ScoreRenderer) {
        this.renderer = renderer;
    }

    public abstract get firstBarX(): number;
    public abstract get supportsResize(): boolean;

    public resize(): void {
        this._lazyPartials.clear();
        this.doResize();
    }
    public abstract doResize(): void;

    public layoutAndRender(): void {
        this._lazyPartials.clear();

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

        this.createScoreInfoGlyphs();
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
            this.internalRenderLazyPartial(args, callback);
        } else {
            // in case of lazy loading -> first register lazy, then notify
            this._lazyPartials.set(args.id, new LazyPartial(args, callback));
            (this.renderer.partialLayoutFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(args);
        }
    }

    private internalRenderLazyPartial(args: RenderFinishedEventArgs, callback: (canvas: ICanvas) => void) {
        const canvas = this.renderer.canvas!;
        canvas.beginRender(args.width, args.height);
        callback(canvas);
        args.renderResult = canvas.endRender();
        (this.renderer.partialRenderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(args);
    }

    public renderLazyPartial(resultId: string) {
        if (this._lazyPartials.has(resultId)) {
            const lazyPartial = this._lazyPartials.get(resultId)!;
            this.internalRenderLazyPartial(lazyPartial.args, lazyPartial.renderCallback);
        }
    }

    protected abstract doLayoutAndRender(): void;

    protected static HeaderElements: Lazy<Map<ScoreSubElement, NotationElement | undefined>> = new Lazy(
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
    protected static FooterElements: Lazy<Map<ScoreSubElement, NotationElement | undefined>> = new Lazy(
        () =>
            new Map<ScoreSubElement, NotationElement | undefined>([
                [ScoreSubElement.Copyright, NotationElement.ScoreCopyright],
                [ScoreSubElement.CopyrightSecondLine, undefined]
            ])
    );

    private createHeaderFooterGlyph(
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
                if (!this.headerGlyphs.has(ScoreSubElement.Copyright)) {
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

    private createScoreInfoGlyphs(): void {
        Logger.debug('ScoreLayout', 'Creating score info glyphs');
        const settings = this.renderer.settings;
        const score: Score = this.renderer.score!;
        this.headerGlyphs = new Map<ScoreSubElement, TextGlyph>();
        this.footerGlyphs = new Map<ScoreSubElement, TextGlyph>();
        const fakeBarRenderer = new BarRendererBase(this.renderer, this.renderer.tracks![0].staves[0].bars[0]);

        for (const [scoreElement, notationElement] of ScoreLayout.HeaderElements.value) {
            const glyph = this.createHeaderFooterGlyph(settings, score, scoreElement, notationElement);
            if (glyph) {
                glyph.renderer = fakeBarRenderer;
                glyph.doLayout();
                this.headerGlyphs.set(scoreElement, glyph);
            }
        }

        for (const [scoreElement, notationElement] of ScoreLayout.FooterElements.value) {
            const glyph = this.createHeaderFooterGlyph(settings, score, scoreElement, notationElement);
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

            if(this.chordDiagrams.isEmpty) {
                this.chordDiagrams = null;
            }

        } else {
            this.chordDiagrams = null;
        }
    }

    public firstBarIndex: number = 0;

    public lastBarIndex: number = 0;

    protected createEmptyStaffSystem(): StaffSystem {
        const system: StaffSystem = new StaffSystem(this);
        for (let trackIndex: number = 0; trackIndex < this.renderer.tracks!.length; trackIndex++) {
            const track: Track = this.renderer.tracks![trackIndex];
            for (let staffIndex: number = 0; staffIndex < track.staves.length; staffIndex++) {
                const staff: Staff = track.staves[staffIndex];
                const profile: BarRendererFactory[] = Environment.staveProfiles.get(
                    this.renderer.settings.display.staveProfile
                )!;
                for (const factory of profile) {
                    if (factory.canCreate(track, staff)) {
                        system.addStaff(track, new RenderStaff(trackIndex, staff, factory));
                    }
                }
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

    public unregisterBarRenderer(key: string, renderer: BarRendererBase): void {
        if (this._barRendererLookup.has(key)) {
            const lookup: Map<number, BarRendererBase> = this._barRendererLookup.get(key)!;
            lookup.delete(renderer.bar.id);
            if (renderer.additionalMultiRestBars) {
                for (const b of renderer.additionalMultiRestBars) {
                    lookup.delete(b.id);
                }
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

        for (const [scoreElement, _notationElement] of ScoreLayout.FooterElements.value) {
            if (this.footerGlyphs.has(scoreElement)) {
                const glyph: TextGlyph = this.footerGlyphs.get(scoreElement)!;
                glyph.y = infoHeight;
                this.alignScoreInfoGlyph(glyph);
                infoHeight += glyph.font.size * 1.2;
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
