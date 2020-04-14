import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { SimileMark } from '@src/model/SimileMark';
import { Voice } from '@src/model/Voice';
import { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { LeftToRightLayoutingGlyphGroup } from '@src/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { BarBounds } from '@src/rendering/utils/BarBounds';
import { BarHelpers } from '@src/rendering/utils/BarHelpers';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { Bounds } from '@src/rendering/utils/Bounds';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import { RenderingResources } from '@src/RenderingResources';
import { Settings } from '@src/Settings';

/**
 * This is the base public class for creating blocks which can render bars.
 */
export class BarRendererBase {
    private _preBeatGlyphs: LeftToRightLayoutingGlyphGroup = new LeftToRightLayoutingGlyphGroup();
    private _voiceContainers: Map<number, VoiceContainerGlyph> = new Map();
    private _postBeatGlyphs: LeftToRightLayoutingGlyphGroup = new LeftToRightLayoutingGlyphGroup();

    public get nextRenderer(): BarRendererBase | null {
        if (!this.bar || !this.bar.nextBar) {
            return null;
        }
        return this.scoreRenderer.layout!.getRendererForBar(this.staff.staveId, this.bar.nextBar);
    }

    public get previousRenderer(): BarRendererBase | null {
        if (!this.bar || !this.bar.previousBar) {
            return null;
        }
        return this.scoreRenderer.layout!.getRendererForBar(this.staff.staveId, this.bar.previousBar);
    }

    public scoreRenderer: ScoreRenderer;
    public staff!: RenderStaff;
    public layoutingInfo!: BarLayoutingInfo;
    public bar!: Bar;

    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;
    public index: number = 0;
    public topOverflow: number = 0;
    public bottomOverflow: number = 0;
    public helpers!: BarHelpers;

    /**
     * Gets or sets whether this renderer is linked to the next one
     * by some glyphs like a vibrato effect
     */
    public isLinkedToPrevious: boolean = false;

    /**
     * Gets or sets whether this renderer can wrap to the next line
     * or it needs to stay connected to the previous one.
     * (e.g. when having double bar repeats we must not separate the 2 bars)
     */
    public canWrap: boolean = true;

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        this.scoreRenderer = renderer;
        this.bar = bar;
        if (bar) {
            this.helpers = new BarHelpers(bar);
        }
    }

    public registerOverflowTop(topOverflow: number): void {
        if (topOverflow > this.topOverflow) {
            this.topOverflow = topOverflow;
        }
    }

    public registerOverflowBottom(bottomOverflow: number): void {
        if (bottomOverflow > this.bottomOverflow) {
            this.bottomOverflow = bottomOverflow;
        }
    }

    public scaleToWidth(width: number): void {
        // preBeat and postBeat glyphs do not get resized
        let containerWidth: number = width - this._preBeatGlyphs.width - this._postBeatGlyphs.width;
        for (let kvp of this._voiceContainers) {
            kvp[1].scaleToWidth(containerWidth);
        }
        this._postBeatGlyphs.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width + containerWidth;
        this.width = width;
    }

    public get resources(): RenderingResources {
        return this.settings.display.resources;
    }

    public get settings(): Settings {
        return this.scoreRenderer.settings;
    }

    public get scale(): number {
        return this.settings.display.scale;
    }

    private _wasFirstOfLine: boolean = false;

    public get isFirstOfLine(): boolean {
        return this.index === 0;
    }

    public get isLast(): boolean {
        return !this.bar || this.bar.index === this.scoreRenderer.layout!.lastBarIndex;
    }

    public registerLayoutingInfo(): void {
        let info: BarLayoutingInfo = this.layoutingInfo;
        let preSize: number = this._preBeatGlyphs.width;
        if (info.preBeatSize < preSize) {
            info.preBeatSize = preSize;
        }
        for (let kvp of this._voiceContainers) {
            kvp[1].registerLayoutingInfo(info);
        }
        let postSize: number = this._postBeatGlyphs.width;
        if (info.postBeatSize < postSize) {
            info.postBeatSize = postSize;
        }
    }

    private _appliedLayoutingInfo: number = 0;

    public applyLayoutingInfo(): boolean {
        if (this._appliedLayoutingInfo >= this.layoutingInfo.version) {
            return false;
        }
        this._appliedLayoutingInfo = this.layoutingInfo.version;
        // if we need additional space in the preBeat group we simply
        // add a new spacer
        this._preBeatGlyphs.width = this.layoutingInfo.preBeatSize;
        // on beat glyphs we apply the glyph spacing
        let voiceEnd: number = this._preBeatGlyphs.x + this._preBeatGlyphs.width;
        for (let kvp of this._voiceContainers) {
            let c: VoiceContainerGlyph = kvp[1];
            c.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width;
            c.applyLayoutingInfo(this.layoutingInfo);
            let newEnd: number = c.x + c.width;
            if (voiceEnd < newEnd) {
                voiceEnd = newEnd;
            }
        }
        // on the post glyphs we add the spacing before all other glyphs
        this._postBeatGlyphs.x = Math.floor(voiceEnd);
        this._postBeatGlyphs.width = this.layoutingInfo.postBeatSize;
        this.width = Math.ceil(this._postBeatGlyphs.x + this._postBeatGlyphs.width);
        return true;
    }

    public isFinalized: boolean = false;

    public finalizeRenderer(): void {
        this.isFinalized = true;
    }

    /**
     * Gets the top padding for the main content of the renderer.
     * Can be used to specify where i.E. the score lines of the notation start.
     * @returns
     */
    public topPadding: number = 0;

    /**
     * Gets the bottom padding for the main content of the renderer.
     * Can be used to specify where i.E. the score lines of the notation end.
     */
    public bottomPadding: number = 0;

    public doLayout(): void {
        if(!this.bar) {
            return;
        }
        this._preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
        this._preBeatGlyphs.renderer = this;
        this._voiceContainers.clear();
        this._postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
        this._postBeatGlyphs.renderer = this;
        for (let i: number = 0; i < this.bar.voices.length; i++) {
            let voice: Voice = this.bar.voices[i];
            if (this.hasVoiceContainer(voice)) {
                let c: VoiceContainerGlyph = new VoiceContainerGlyph(0, 0, voice);
                c.renderer = this;
                this._voiceContainers.set(this.bar.voices[i].index, c);
            }
        }
        if (this.bar.simileMark === SimileMark.SecondOfDouble) {
            this.canWrap = false;
        }
        this.createPreBeatGlyphs();
        this.createBeatGlyphs();
        this.createPostBeatGlyphs();
        this.updateSizes();
    }

    protected hasVoiceContainer(voice: Voice): boolean {
        return !voice.isEmpty || voice.index === 0;
    }

    protected updateSizes(): void {
        this.staff.registerStaffTop(this.topPadding);
        this.staff.registerStaffBottom(this.height - this.bottomPadding);
        let voiceContainers: Map<number, VoiceContainerGlyph> = this._voiceContainers;
        let beatGlyphsStart: number = this.beatGlyphsStart;
        let postBeatStart: number = beatGlyphsStart;
        for (let kvp of voiceContainers) {
            let c: VoiceContainerGlyph = kvp[1];
            c.x = beatGlyphsStart;
            c.doLayout();
            let x: number = c.x + c.width;
            if (postBeatStart < x) {
                postBeatStart = x;
            }
        }
        this._postBeatGlyphs.x = Math.floor(postBeatStart);
        this.width = Math.ceil(this._postBeatGlyphs.x + this._postBeatGlyphs.width);
    }

    protected addPreBeatGlyph(g: Glyph): void {
        this._preBeatGlyphs.addGlyph(g);
    }

    protected addBeatGlyph(g: BeatContainerGlyph): void {
        g.renderer = this;
        g.preNotes.renderer = this;
        g.onNotes.renderer = this;
        g.onNotes.beamingHelper = this.helpers!.beamHelperLookup[g.beat.voice.index].get(g.beat.index)!;
        this.getOrCreateVoiceContainer(g.beat.voice).addGlyph(g);
    }

    protected getOrCreateVoiceContainer(voice: Voice): VoiceContainerGlyph {
        return this._voiceContainers.get(voice.index)!;
    }

    public getBeatContainer(beat: Beat): BeatContainerGlyph {
        return this.getOrCreateVoiceContainer(beat.voice).beatGlyphs[beat.index];
    }

    public getPreNotesGlyphForBeat(beat: Beat): BeatGlyphBase {
        return this.getBeatContainer(beat).preNotes;
    }

    public getOnNotesGlyphForBeat(beat: Beat): BeatGlyphBase {
        return this.getBeatContainer(beat).onNotes;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintBackground(cx, cy, canvas);
        canvas.color = this.resources.mainGlyphColor;
        this._preBeatGlyphs.paint(cx + this.x, cy + this.y, canvas);
        for (let kvp of this._voiceContainers) {
            let c: VoiceContainerGlyph = kvp[1];
            canvas.color = c.voice.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
            c.paint(cx + this.x, cy + this.y, canvas);
        }
        canvas.color = this.resources.mainGlyphColor;
        this._postBeatGlyphs.paint(cx + this.x, cy + this.y, canvas);
    }

    protected paintBackground(cx: number, cy: number, canvas: ICanvas): void {
        // no default brackgroundpainting
    }

    public buildBoundingsLookup(masterBarBounds: MasterBarBounds, cx: number, cy: number): void {
        let barBounds: BarBounds = new BarBounds();
        barBounds.bar = this.bar!;
        barBounds.visualBounds = (() => {
            let _tmp = new Bounds();
            _tmp.x = cx + this.x;
            _tmp.y = cy + this.y + this.topPadding;
            _tmp.w = this.width;
            _tmp.h = this.height - this.topPadding - this.bottomPadding;
            return _tmp;
        })();
        barBounds.realBounds = (() => {
            let _tmp = new Bounds();
            _tmp.x = cx + this.x;
            _tmp.y = cy + this.y;
            _tmp.w = this.width;
            _tmp.h = this.height;
            return _tmp;
        })();
        masterBarBounds.addBar(barBounds);
        for (let kvp of this._voiceContainers) {
            let c: VoiceContainerGlyph = kvp[1];
            let isEmptyBar: boolean = this.bar!.isEmpty && kvp[0] === 0;
            if (!c.voice.isEmpty || isEmptyBar) {
                for (let i: number = 0, j: number = c.beatGlyphs.length; i < j; i++) {
                    let bc: BeatContainerGlyph = c.beatGlyphs[i];
                    let beatBoundings: BeatBounds = new BeatBounds();
                    beatBoundings.beat = bc.beat;
                    beatBoundings.visualBounds = (() => {
                        let _tmp = new Bounds();
                        _tmp.x = cx + this.x + c.x + bc.x + bc.onNotes.x;
                        _tmp.y = barBounds.visualBounds.y;
                        _tmp.w = bc.onNotes.width;
                        _tmp.h = barBounds.visualBounds.h;
                        return _tmp;
                    })();
                    beatBoundings.realBounds = (() => {
                        let _tmp = new Bounds();
                        _tmp.x = cx + this.x + c.x + bc.x;
                        _tmp.y = barBounds.realBounds.y;
                        _tmp.w = bc.width;
                        _tmp.h = barBounds.realBounds.h;
                        return _tmp;
                    })();
                    if (isEmptyBar) {
                        beatBoundings.visualBounds.x = cx + this.x;
                        beatBoundings.realBounds.x = beatBoundings.visualBounds.x;
                    }
                    barBounds.addBeat(beatBoundings);
                }
            }
        }
    }

    protected addPostBeatGlyph(g: Glyph): void {
        this._postBeatGlyphs.addGlyph(g);
    }

    protected createPreBeatGlyphs(): void {
        this._wasFirstOfLine = this.isFirstOfLine;
    }

    protected createBeatGlyphs(): void {
        // filled in subclasses
    }

    protected createPostBeatGlyphs(): void {
        // filled in subclasses
    }

    public get beatGlyphsStart(): number {
        return this._preBeatGlyphs.x + this._preBeatGlyphs.width;
    }

    public get postBeatGlyphsStart(): number {
        return this._postBeatGlyphs.x;
    }

    public getNoteX(note: Note, onEnd: boolean = true): number {
        return 0;
    }

    public getBeatX(beat: Beat, requestedPosition: BeatXPosition = BeatXPosition.PreNotes): number {
        let container: BeatContainerGlyph = this.getBeatContainer(beat);
        if (container) {
            switch (requestedPosition) {
                case BeatXPosition.PreNotes:
                    return container.voiceContainer.x + container.x;
                case BeatXPosition.OnNotes:
                    return container.voiceContainer.x + container.x + container.onNotes.x;
                case BeatXPosition.MiddleNotes:
                    return container.voiceContainer.x + container.x + container.onTimeX;
                case BeatXPosition.PostNotes:
                    return container.voiceContainer.x + container.x + container.onNotes.x + container.onNotes.width;
                case BeatXPosition.EndBeat:
                    return container.voiceContainer.x + container.x + container.width;
            }
        }
        return 0;
    }

    public getNoteY(note: Note, aboveNote: boolean = false): number {
        return 0;
    }

    public reLayout(): void {
        // there are some glyphs which are shown only for renderers at the line start, so we simply recreate them
        // but we only need to recreate them for the renderers that were the first of the line or are now the first of the line
        if ((this._wasFirstOfLine && !this.isFirstOfLine) || (!this._wasFirstOfLine && this.isFirstOfLine)) {
            this._preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
            this._preBeatGlyphs.renderer = this;
            this.createPreBeatGlyphs();
        }
        this.updateSizes();
        this.registerLayoutingInfo();
    }

    protected paintSimileMark(cx: number, cy: number, canvas: ICanvas): void {
        switch (this.bar!.simileMark) {
            case SimileMark.Simple:
                canvas.fillMusicFontSymbol(
                    cx + this.x + (this.width - 20 * this.scale) / 2,
                    cy + this.y + this.height / 2,
                    1,
                    MusicFontSymbol.SimileMarkSimple,
                    false
                );
                break;
            case SimileMark.SecondOfDouble:
                canvas.fillMusicFontSymbol(
                    cx + this.x - (28 * this.scale) / 2,
                    cy + this.y + this.height / 2,
                    1,
                    MusicFontSymbol.SimileMarkDouble,
                    false
                );
                break;
        }
    }
}
