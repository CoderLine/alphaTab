import { Environment } from '@src/Environment';
import { Bar } from '@src/model/Bar';
import { Font, FontStyle, FontWeight } from '@src/model/Font';
import { Score } from '@src/model/Score';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { ChordDiagramContainerGlyph } from '@src/rendering/glyphs/ChordDiagramContainerGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { StaffSystem } from '@src/rendering/staves/StaffSystem';
import { RenderingResources } from '@src/RenderingResources';
import { Logger } from '@src/Logger';
import { EventEmitterOfT } from '@src/EventEmitter';
import { NotationSettings, NotationElement } from '@src/NotationSettings';
import { TuningContainerGlyph } from '@src/rendering/glyphs/TuningContainerGlyph';

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
    Automatic,

    /**
     * Use the relative scaling information stored in the score model.
     */
    FromModelWithScale,

    /**
     * Use the absolute size information stored in the score model.
     */
    FromModelWithWidths
}

/**
 * This is the base class for creating new layouting engines for the score renderer.
 */
export abstract class ScoreLayout {
    private _barRendererLookup: Map<string, Map<number, BarRendererBase>> = new Map();

    public abstract get name(): string;

    public renderer: ScoreRenderer;
    public width: number = 0;
    public height: number = 0;

    public get scaledWidth() {
        return this.width / this.renderer.settings.display.scale;
    }

    protected scoreInfoGlyphs: Map<NotationElement, TextGlyph> = new Map();
    protected chordDiagrams: ChordDiagramContainerGlyph | null = null;
    protected tuningGlyph: TuningContainerGlyph | null = null;

    public systemsLayoutMode: InternalSystemsLayoutMode = InternalSystemsLayoutMode.Automatic;

    protected constructor(renderer: ScoreRenderer) {
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

        let score: Score = this.renderer.score!;
        let startIndex: number = this.renderer.settings.display.startBar;
        startIndex--; // map to array index

        startIndex = Math.min(score.masterBars.length - 1, Math.max(0, startIndex));
        this.firstBarIndex = startIndex;
        let endBarIndex: number = this.renderer.settings.display.barCount;
        if (endBarIndex < 0) {
            endBarIndex = score.masterBars.length;
        }
        endBarIndex = startIndex + endBarIndex - 1; // map count to array index

        endBarIndex = Math.min(score.masterBars.length - 1, Math.max(0, endBarIndex));
        this.lastBarIndex = endBarIndex;
        this.createScoreInfoGlyphs();
        this.doLayoutAndRender();
    }

    private _lazyPartials: Map<string, LazyPartial> = new Map<string, LazyPartial>();

    protected registerPartial(args: RenderFinishedEventArgs, callback: (canvas: ICanvas) => void) {
        if (args.height == 0) {
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

    private createScoreInfoGlyphs(): void {
        Logger.debug('ScoreLayout', 'Creating score info glyphs');
        let notation: NotationSettings = this.renderer.settings.notation;
        let score: Score = this.renderer.score!;
        let res: RenderingResources = this.renderer.settings.display.resources;
        this.scoreInfoGlyphs = new Map<NotationElement, TextGlyph>();
        if (score.title && notation.isNotationElementVisible(NotationElement.ScoreTitle)) {
            this.scoreInfoGlyphs.set(
                NotationElement.ScoreTitle,
                new TextGlyph(0, 0, score.title, res.titleFont, TextAlign.Center)
            );
        }
        if (score.subTitle && notation.isNotationElementVisible(NotationElement.ScoreSubTitle)) {
            this.scoreInfoGlyphs.set(
                NotationElement.ScoreSubTitle,
                new TextGlyph(0, 0, score.subTitle, res.subTitleFont, TextAlign.Center)
            );
        }
        if (score.artist && notation.isNotationElementVisible(NotationElement.ScoreArtist)) {
            this.scoreInfoGlyphs.set(
                NotationElement.ScoreArtist,
                new TextGlyph(0, 0, score.artist, res.subTitleFont, TextAlign.Center)
            );
        }
        if (score.album && notation.isNotationElementVisible(NotationElement.ScoreAlbum)) {
            this.scoreInfoGlyphs.set(
                NotationElement.ScoreAlbum,
                new TextGlyph(0, 0, score.album, res.subTitleFont, TextAlign.Center)
            );
        }
        if (
            score.music &&
            score.music === score.words &&
            notation.isNotationElementVisible(NotationElement.ScoreWordsAndMusic)
        ) {
            this.scoreInfoGlyphs.set(
                NotationElement.ScoreWordsAndMusic,
                new TextGlyph(0, 0, 'Music and Words by ' + score.words, res.wordsFont, TextAlign.Center)
            );
        } else {
            if (score.music && notation.isNotationElementVisible(NotationElement.ScoreMusic)) {
                this.scoreInfoGlyphs.set(
                    NotationElement.ScoreMusic,
                    new TextGlyph(0, 0, 'Music by ' + score.music, res.wordsFont, TextAlign.Right)
                );
            }
            if (score.words && notation.isNotationElementVisible(NotationElement.ScoreWords)) {
                this.scoreInfoGlyphs.set(
                    NotationElement.ScoreWords,
                    new TextGlyph(0, 0, 'Words by ' + score.words, res.wordsFont, TextAlign.Left)
                );
            }
        }

        const fakeBarRenderer = new BarRendererBase(this.renderer, this.renderer.tracks![0].staves[0].bars[0]);

        for (const [_e, glyph] of this.scoreInfoGlyphs) {
            glyph.renderer = fakeBarRenderer;
            glyph.doLayout();
        }

        if (notation.isNotationElementVisible(NotationElement.GuitarTuning)) {
            let tunings: Staff[] = [];
            for (let track of this.renderer.tracks!) {
                for (let staff of track.staves) {
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
                        tunings.push(staff);
                        break;
                    }
                }
            }
            // tuning info
            if (tunings.length > 0 && score.stylesheet.globalDisplayTuning) {
                this.tuningGlyph = new TuningContainerGlyph(0, 0);
                this.tuningGlyph.renderer = fakeBarRenderer;
                for (const t of tunings) {
                    this.tuningGlyph.addTuning(t.stringTuning, tunings.length > 1 ? t.track.name : '');
                }
            }
        }
        // chord diagram glyphs
        if (notation.isNotationElementVisible(NotationElement.ChordDiagrams)) {
            this.chordDiagrams = new ChordDiagramContainerGlyph(0, 0);
            this.chordDiagrams.renderer = fakeBarRenderer;
            let chordIds: Set<string> = new Set<string>();

            for (let track of this.renderer.tracks!) {
                const shouldShowDiagramsForTrack =
                    score.stylesheet.globalDisplayChordDiagramsOnTop &&
                    (score.stylesheet.perTrackChordDiagramsOnTop == null ||
                        !score.stylesheet.perTrackChordDiagramsOnTop.has(track.index) ||
                        score.stylesheet.perTrackChordDiagramsOnTop.get(track.index)!);

                if (!shouldShowDiagramsForTrack) {
                    continue;
                }

                for (let staff of track.staves) {
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
        }
    }

    public firstBarIndex: number = 0;

    public lastBarIndex: number = 0;

    protected createEmptyStaffSystem(): StaffSystem {
        let system: StaffSystem = new StaffSystem(this);
        for (let trackIndex: number = 0; trackIndex < this.renderer.tracks!.length; trackIndex++) {
            let track: Track = this.renderer.tracks![trackIndex];
            for (let staffIndex: number = 0; staffIndex < track.staves.length; staffIndex++) {
                let staff: Staff = track.staves[staffIndex];
                let profile: BarRendererFactory[] = Environment.staveProfiles.get(
                    this.renderer.settings.display.staveProfile
                )!;
                for (let factory of profile) {
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
    }

    public unregisterBarRenderer(key: string, renderer: BarRendererBase): void {
        if (this._barRendererLookup.has(key)) {
            let lookup: Map<number, BarRendererBase> = this._barRendererLookup.get(key)!;
            lookup.delete(renderer.bar.id);
        }
    }

    public getRendererForBar(key: string, bar: Bar): BarRendererBase | null {
        let barRendererId: number = bar.id;
        if (this._barRendererLookup.has(key) && this._barRendererLookup.get(key)!.has(barRendererId)) {
            return this._barRendererLookup.get(key)!.get(barRendererId)!;
        }
        return null;
    }

    public layoutAndRenderAnnotation(y: number): number {
        // attention, you are not allowed to remove change this notice within any version of this library without permission!
        let msg: string = 'rendered by alphaTab';
        let resources: RenderingResources = this.renderer.settings.display.resources;
        let size: number = 12;
        let height: number = Math.floor(size);

        const e = new RenderFinishedEventArgs();
        const font = Font.withFamilyList(resources.copyrightFont.families, size, FontStyle.Plain, FontWeight.Bold);

        this.renderer.canvas!.font = font;

        const centered = Environment.getLayoutEngineFactory(this.renderer.settings.display.layoutMode).vertical;
        e.width = this.renderer.canvas!.measureText(msg).width / this.renderer.settings.display.scale;
        e.height = height;
        e.x = centered ? (this.scaledWidth - e.width) / 2 : this.firstBarX;
        e.y = y;

        e.totalWidth = this.scaledWidth;
        e.totalHeight = y + height;
        e.firstMasterBarIndex = -1;
        e.lastMasterBarIndex = -1;

        this.registerPartial(e, canvas => {
            canvas.color = resources.mainGlyphColor;
            canvas.font = font;
            canvas.textAlign = TextAlign.Left;
            canvas.textBaseline = TextBaseline.Top;
            canvas.fillText(msg, 0, 0);
        });

        return y + height;
    }
}
