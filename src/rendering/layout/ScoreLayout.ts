import { StaveProfile } from '@src/DisplaySettings';
import { Environment } from '@src/Environment';
import { Bar } from '@src/model/Bar';
import { Chord } from '@src/model/Chord';
import { Font, FontStyle } from '@src/model/Font';
import { Score } from '@src/model/Score';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { ChordDiagramContainerGlyph } from '@src/rendering/glyphs/ChordDiagramContainerGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { RenderFinishedEventArgs } from '@src/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { StaveGroup } from '@src/rendering/staves/StaveGroup';
import { RenderingResources } from '@src/RenderingResources';
import { Logger } from '@src/Logger';
import { EventEmitterOfT } from '@src/EventEmitter';
import { NotationSettings, NotationElement } from '@src/NotationSettings';
import { TuningContainerGlyph } from '../glyphs/TuningContainerGlyph';

/**
 * This is the base public class for creating new layouting engines for the score renderer.
 */
export abstract class ScoreLayout {
    private _barRendererLookup: Map<string, Map<number, BarRendererBase>> = new Map();

    public abstract get name(): string;

    public renderer: ScoreRenderer;
    public width: number = 0;
    public height: number = 0;

    protected scoreInfoGlyphs: Map<NotationElement, TextGlyph> = new Map();
    protected chordDiagrams: ChordDiagramContainerGlyph | null = null;
    protected tuningGlyph: TuningContainerGlyph | null = null;

    protected constructor(renderer: ScoreRenderer) {
        this.renderer = renderer;
    }

    public abstract get supportsResize(): boolean;

    public abstract resize(): void;

    public layoutAndRender(): void {
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

        const fakeBarRenderer = new BarRendererBase(
            this.renderer,
            this.renderer.tracks![0].staves[0].bars[0]
        );

        if (notation.isNotationElementVisible(NotationElement.GuitarTuning)) {
            let tunings: Staff[] = [];
            for (let track of this.renderer.tracks!) {
                for (let staff of track.staves) {
                    if (!staff.isPercussion && staff.isStringed && staff.tuning.length > 0 && staff.showTablature) {
                        tunings.push(staff);
                        break;
                    }
                }
            }
            // tuning info
            if (tunings.length > 0) {
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
            let chords: Map<string, Chord> = new Map<string, Chord>();
            for (let track of this.renderer.tracks!) {
                for (let staff of track.staves) {
                    for (const [chordId, chord] of staff.chords) {
                        if (!chords.has(chordId)) {
                            if (chord.showDiagram) {
                                chords.set(chordId, chord);
                                this.chordDiagrams!.addChord(chord);
                            }
                        }
                    }
                }
            }
        }
    }

    public get scale(): number {
        return this.renderer.settings.display.scale;
    }

    public firstBarIndex: number = 0;

    public lastBarIndex: number = 0;

    protected createEmptyStaveGroup(): StaveGroup {
        let group: StaveGroup = new StaveGroup();
        group.layout = this;
        for (let trackIndex: number = 0; trackIndex < this.renderer.tracks!.length; trackIndex++) {
            let track: Track = this.renderer.tracks![trackIndex];
            let hasScore: boolean = false;
            for (let staff of track.staves) {
                if (staff.showStandardNotation) {
                    hasScore = true;
                    break;
                }
            }
            for (let staffIndex: number = 0; staffIndex < track.staves.length; staffIndex++) {
                let staff: Staff = track.staves[staffIndex];
                // use optimal profile for track
                let staveProfile: StaveProfile;
                if (staff.isPercussion) {
                    staveProfile = StaveProfile.Score;
                } else if (this.renderer.settings.display.staveProfile !== StaveProfile.Default) {
                    staveProfile = this.renderer.settings.display.staveProfile;
                } else if (staff.showTablature && staff.showStandardNotation) {
                    staveProfile = StaveProfile.ScoreTab;
                } else if (staff.showTablature) {
                    staveProfile = hasScore ? StaveProfile.TabMixed : StaveProfile.Tab;
                } else if (staff.showStandardNotation) {
                    staveProfile = StaveProfile.Score;
                } else {
                    continue;
                }
                let profile: BarRendererFactory[] = Environment.staveProfiles.get(staveProfile)!;
                for (let factory of profile) {
                    if (factory.canCreate(track, staff)) {
                        group.addStaff(track, new RenderStaff(trackIndex, staff, factory));
                    }
                }
            }
        }
        return group;
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

    public renderAnnotation(): void {
        // attention, you are not allowed to remove change this notice within any version of this library without permission!
        let msg: string = 'rendered by alphaTab';
        let canvas: ICanvas = this.renderer.canvas!;
        let resources: RenderingResources = this.renderer.settings.display.resources;
        let size: number = 12 * this.renderer.settings.display.scale;
        let height: number = size * 2;
        this.height += height;
        let x: number = this.width / 2;
        canvas.beginRender(this.width, height);
        canvas.color = resources.mainGlyphColor;
        canvas.font = new Font(resources.copyrightFont.family, size, FontStyle.Bold);
        canvas.textAlign = TextAlign.Center;
        canvas.fillText(msg, x, size);
        let result: unknown = canvas.endRender();

        let e = new RenderFinishedEventArgs();
        e.width = this.width;
        e.height = height;
        e.renderResult = result;
        e.totalWidth = this.width;
        e.totalHeight = this.height;
        e.firstMasterBarIndex = -1;
        e.lastMasterBarIndex = -1;
        (this.renderer.partialRenderFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(e);
    }
}
