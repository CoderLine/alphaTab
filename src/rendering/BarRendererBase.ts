import type { Bar } from '@src/model/Bar';
import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { SimileMark } from '@src/model/SimileMark';
import { type Voice, VoiceSubElement } from '@src/model/Voice';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import type { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { LeftToRightLayoutingGlyphGroup } from '@src/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import type { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { BarBounds } from '@src/rendering/utils/BarBounds';
import { BarHelpers } from '@src/rendering/utils/BarHelpers';
import { Bounds } from '@src/rendering/utils/Bounds';
import type { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import type { RenderingResources } from '@src/RenderingResources';
import type { Settings } from '@src/Settings';
import type { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { InternalSystemsLayoutMode } from '@src/rendering/layout/ScoreLayout';
import type { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { MultiBarRestBeatContainerGlyph } from '@src/rendering/MultiBarRestBeatContainerGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

/**
 * Lists the different position modes for {@link BarRendererBase.getNoteY}
 */
export enum NoteYPosition {
    /**
     * Gets the note y-position on top of the note stem or tab number.
     */
    TopWithStem = 0,
    /**
     * Gets the note y-position on top of the note head or tab number.
     */
    Top = 1,
    /**
     * Gets the note y-position on the center of the note head or tab number.
     */
    Center = 2,
    /**
     * Gets the note y-position on the bottom of the note head or tab number.
     */
    Bottom = 3,
    /**
     * Gets the note y-position on the bottom of the note stem or tab number.
     */
    BottomWithStem = 4
}

/**
 * Lists the different position modes for {@link BarRendererBase.getNoteX}
 */
export enum NoteXPosition {
    /**
     * Gets the note x-position on left of the note head or tab number.
     */
    Left = 0,
    /**
     * Gets the note x-position on the center of the note head or tab number.
     */
    Center = 1,
    /**
     * Gets the note x-position on the right of the note head or tab number.
     */
    Right = 2
}

/**
 * This is the base public class for creating blocks which can render bars.
 */
export class BarRendererBase {
    protected static readonly RawLineSpacing: number = 8;
    public static readonly StemWidth: number = 0.12 /*bravura stemThickness */ * BarRendererBase.RawLineSpacing;
    public static readonly StaffLineThickness: number =
        0.13 /*bravura staffLineThickness */ * BarRendererBase.RawLineSpacing;
    public static readonly BeamThickness: number = 0.5 /*bravura beamThickness */ * BarRendererBase.RawLineSpacing;
    public static readonly BeamSpacing: number = 0.25 /*bravura beamSpacing */ * BarRendererBase.RawLineSpacing;

    private _preBeatGlyphs: LeftToRightLayoutingGlyphGroup = new LeftToRightLayoutingGlyphGroup();
    private _voiceContainers: Map<number, VoiceContainerGlyph> = new Map();
    private _postBeatGlyphs: LeftToRightLayoutingGlyphGroup = new LeftToRightLayoutingGlyphGroup();

    private _ties: Glyph[] = [];

    public get nextRenderer(): BarRendererBase | null {
        if (!this.bar || !this.bar.nextBar) {
            return null;
        }
        return this.scoreRenderer.layout!.getRendererForBar(this.staff.staffId, this.bar.nextBar);
    }

    public get previousRenderer(): BarRendererBase | null {
        if (!this.bar || !this.bar.previousBar) {
            return null;
        }
        return this.scoreRenderer.layout!.getRendererForBar(this.staff.staffId, this.bar.previousBar);
    }

    public scoreRenderer: ScoreRenderer;
    public staff!: RenderStaff;
    public layoutingInfo!: BarLayoutingInfo;
    public bar: Bar;
    public additionalMultiRestBars: Bar[] | null = null;

    public get lastBar(): Bar {
        if (this.additionalMultiRestBars) {
            return this.additionalMultiRestBars[this.additionalMultiRestBars.length - 1];
        }
        return this.bar;
    }

    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public computedWidth: number = 0;
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

    public get showMultiBarRest(): boolean {
        return false;
    }

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        this.scoreRenderer = renderer;
        this.bar = bar;
        if (bar) {
            this.helpers = new BarHelpers(this);
        }
    }

    public registerTies(ties: Glyph[]) {
        this._ties.push(...ties);
    }

    public get middleYPosition(): number {
        return 0;
    }

    public registerOverflowTop(topOverflow: number): boolean {
        if (topOverflow > this.topOverflow) {
            this.topOverflow = topOverflow;
            return true;
        }
        return false;
    }

    public registerOverflowBottom(bottomOverflow: number): boolean {
        if (bottomOverflow > this.bottomOverflow) {
            this.bottomOverflow = bottomOverflow;
            return true;
        }
        return false;
    }

    public scaleToWidth(width: number): void {
        // preBeat and postBeat glyphs do not get resized
        const containerWidth: number = width - this._preBeatGlyphs.width - this._postBeatGlyphs.width;
        for (const container of this._voiceContainers.values()) {
            container.scaleToWidth(containerWidth);
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

    /**
     * Gets the scale with which the bar should be displayed in case the model
     * scale should be respected.
     */
    public get barDisplayScale(): number {
        return this.staff.system.staves.length > 1 ? this.bar.masterBar.displayScale : this.bar.displayScale;
    }

    /**
     * Gets the absolute width in which the bar should be displayed in case the model
     * scale should be respected.
     */
    public get barDisplayWidth(): number {
        return this.staff.system.staves.length > 1 ? this.bar.masterBar.displayWidth : this.bar.displayWidth;
    }

    protected wasFirstOfLine: boolean = false;

    public get isFirstOfLine(): boolean {
        return this.index === 0;
    }

    public get isLast(): boolean {
        return !this.bar || this.bar.index === this.scoreRenderer.layout!.lastBarIndex;
    }

    public registerLayoutingInfo(): void {
        const info: BarLayoutingInfo = this.layoutingInfo;
        const preSize: number = this._preBeatGlyphs.width;
        if (info.preBeatSize < preSize) {
            info.preBeatSize = preSize;
        }
        let postBeatStart = 0;
        for (const container of this._voiceContainers.values()) {
            container.registerLayoutingInfo(info);
            const x: number = container.x + container.width;
            if (postBeatStart < x) {
                postBeatStart = x;
            }
        }
        const postSize: number = this._postBeatGlyphs.width;
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
        for (const c of this._voiceContainers.values()) {
            c.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width;
            c.applyLayoutingInfo(this.layoutingInfo);
            const newEnd: number = c.x + c.width;
            if (voiceEnd < newEnd) {
                voiceEnd = newEnd;
            }
        }
        // on the post glyphs we add the spacing before all other glyphs
        this._postBeatGlyphs.x = Math.floor(voiceEnd);
        this._postBeatGlyphs.width = this.layoutingInfo.postBeatSize;
        this.width = Math.ceil(this._postBeatGlyphs.x + this._postBeatGlyphs.width);
        this.computedWidth = this.width;

        // For cases like in the horizontal layout we need to set the fixed width early
        // to have correct partials splitting. the proper alignment to this scale will happen
        // later in the workflow.
        const fixedBarWidth = this.barDisplayWidth;
        if (
            fixedBarWidth > 0 &&
            this.scoreRenderer.layout!.systemsLayoutMode === InternalSystemsLayoutMode.FromModelWithWidths
        ) {
            this.width = fixedBarWidth;
            this.computedWidth = fixedBarWidth;
        }

        return true;
    }

    public isFinalized: boolean = false;

    public finalizeRenderer(): boolean {
        this.isFinalized = true;

        let didChangeOverflows = false;
        // allow spacing to be used for tie overflows
        const barTop = this.y - this.staff.topSpacing;
        const barBottom = this.y + this.height + this.staff.bottomSpacing;
        for (const tie of this._ties) {
            tie.doLayout();
            if (tie.height > 0) {
                const bottomOverflow = tie.y + tie.height - barBottom;
                if (bottomOverflow > 0) {
                    if (this.registerOverflowBottom(bottomOverflow)) {
                        didChangeOverflows = true;
                    }
                }
                const topOverflow = tie.y - barTop;
                if (topOverflow < 0) {
                    if (this.registerOverflowTop(topOverflow * -1)) {
                        didChangeOverflows = true;
                    }
                }
            }
        }

        return didChangeOverflows;
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
        if (!this.bar) {
            return;
        }
        this.helpers.initialize();
        this._ties = [];
        this._preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
        this._preBeatGlyphs.renderer = this;
        this._voiceContainers.clear();
        this._postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
        this._postBeatGlyphs.renderer = this;
        for (let i: number = 0; i < this.bar.voices.length; i++) {
            const voice: Voice = this.bar.voices[i];
            if (this.hasVoiceContainer(voice)) {
                const c: VoiceContainerGlyph = new VoiceContainerGlyph(0, 0, voice);
                c.renderer = this;
                this._voiceContainers.set(this.bar.voices[i].index, c);
            }
        }
        if (this.bar.simileMark === SimileMark.SecondOfDouble) {
            this.canWrap = false;
        }
        this.createPreBeatGlyphs();

        // multibar rest
        if (this.additionalMultiRestBars) {
            const container = new MultiBarRestBeatContainerGlyph(this.getVoiceContainer(this.bar.voices[0])!);
            this.addBeatGlyph(container);
        } else {
            this.createBeatGlyphs();
        }

        this.createPostBeatGlyphs();
        this.updateSizes();

        // finish up all helpers
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                h.finish();
            }
        }

        this.computedWidth = this.width;
    }

    protected hasVoiceContainer(voice: Voice): boolean {
        if (this.additionalMultiRestBars || voice.index === 0) {
            return true;
        }
        return !voice.isEmpty;
    }

    protected updateSizes(): void {
        this.staff.registerStaffTop(this.topPadding);
        this.staff.registerStaffBottom(this.height - this.bottomPadding);
        const voiceContainers: Map<number, VoiceContainerGlyph> = this._voiceContainers;
        const beatGlyphsStart: number = this.beatGlyphsStart;
        let postBeatStart: number = beatGlyphsStart;
        for (const c of voiceContainers.values()) {
            c.x = beatGlyphsStart;
            c.doLayout();
            const x: number = c.x + c.width;
            if (postBeatStart < x) {
                postBeatStart = x;
            }
        }
        this._postBeatGlyphs.x = Math.floor(postBeatStart);
        this.width = Math.ceil(this._postBeatGlyphs.x + this._postBeatGlyphs.width);
        this.height += this.layoutingInfo.height;
    }

    protected addPreBeatGlyph(g: Glyph): void {
        g.renderer = this;
        this._preBeatGlyphs.addGlyph(g);
    }

    protected addBeatGlyph(g: BeatContainerGlyph): void {
        g.renderer = this;
        g.preNotes.renderer = this;
        g.onNotes.renderer = this;
        g.onNotes.beamingHelper = this.helpers.beamHelperLookup[g.beat.voice.index].get(g.beat.index)!;
        this.getVoiceContainer(g.beat.voice)!.addGlyph(g);
    }

    protected getVoiceContainer(voice: Voice): VoiceContainerGlyph | undefined {
        return this._voiceContainers.has(voice.index) ? this._voiceContainers.get(voice.index) : undefined;
    }

    public getBeatContainer(beat: Beat): BeatContainerGlyph | undefined {
        return this.getVoiceContainer(beat.voice)?.beatGlyphs?.[beat.index];
    }

    public getPreNotesGlyphForBeat(beat: Beat): BeatGlyphBase | undefined {
        return this.getBeatContainer(beat)?.preNotes;
    }

    public getOnNotesGlyphForBeat(beat: Beat): BeatOnNoteGlyphBase | undefined {
        return this.getBeatContainer(beat)?.onNotes;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintBackground(cx, cy, canvas);

        canvas.color = this.resources.mainGlyphColor;
        this._preBeatGlyphs.paint(cx + this.x, cy + this.y, canvas);

        for (const c of this._voiceContainers.values()) {
            c.paint(cx + this.x, cy + this.y, canvas);
        }

        canvas.color = this.resources.mainGlyphColor;
        this._postBeatGlyphs.paint(cx + this.x, cy + this.y, canvas);
    }

    protected paintBackground(cx: number, cy: number, canvas: ICanvas): void {
        this.layoutingInfo.paint(
            cx + this.x + this._preBeatGlyphs.x + this._preBeatGlyphs.width,
            cy + this.y + this.height,
            canvas
        );
        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
    }

    public buildBoundingsLookup(masterBarBounds: MasterBarBounds, cx: number, cy: number): void {
        const barBounds: BarBounds = new BarBounds();
        barBounds.bar = this.bar;
        barBounds.visualBounds = new Bounds();
        barBounds.visualBounds.x = cx + this.x;
        barBounds.visualBounds.y = cy + this.y + this.topPadding;
        barBounds.visualBounds.w = this.width;
        barBounds.visualBounds.h = this.height - this.topPadding - this.bottomPadding;

        barBounds.realBounds = new Bounds();
        barBounds.realBounds.x = cx + this.x;
        barBounds.realBounds.y = cy + this.y;
        barBounds.realBounds.w = this.width;
        barBounds.realBounds.h = this.height;

        masterBarBounds.addBar(barBounds);
        for (const [index, c] of this._voiceContainers) {
            const isEmptyBar: boolean = this.bar.isEmpty && index === 0;
            if (!c.voice.isEmpty || isEmptyBar) {
                for (let i: number = 0, j: number = c.beatGlyphs.length; i < j; i++) {
                    const bc: BeatContainerGlyph = c.beatGlyphs[i];
                    bc.buildBoundingsLookup(barBounds, cx + this.x + c.x, cy + this.y + c.y, isEmptyBar);
                }
            }
        }
    }

    protected addPostBeatGlyph(g: Glyph): void {
        this._postBeatGlyphs.addGlyph(g);
    }

    protected createPreBeatGlyphs(): void {
        this.wasFirstOfLine = this.isFirstOfLine;
    }

    protected createBeatGlyphs(): void {
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                this.createVoiceGlyphs(voice);
            }
        }
    }

    protected createVoiceGlyphs(v: Voice): void {
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

    public getBeatX(beat: Beat, requestedPosition: BeatXPosition = BeatXPosition.PreNotes): number {
        const container = this.getBeatContainer(beat);
        if (container) {
            switch (requestedPosition) {
                case BeatXPosition.PreNotes:
                    return container.voiceContainer.x + container.x;
                case BeatXPosition.OnNotes:
                    return container.voiceContainer.x + container.x + container.onNotes.x;
                case BeatXPosition.MiddleNotes:
                    return container.voiceContainer.x + container.x + container.onTimeX;
                case BeatXPosition.Stem:
                    const offset = container.onNotes.beamingHelper
                        ? container.onNotes.beamingHelper.getBeatLineX(beat)
                        : container.onNotes.x + container.onNotes.width / 2;
                    return container.voiceContainer.x + offset;
                case BeatXPosition.PostNotes:
                    return container.voiceContainer.x + container.x + container.onNotes.x + container.onNotes.width;
                case BeatXPosition.EndBeat:
                    return container.voiceContainer.x + container.x + container.width;
            }
        }
        return 0;
    }

    public getRatioPositionX(ticks: number): number {
        const firstOnNoteX = this.bar.isEmpty
            ? this.beatGlyphsStart
            : this.getBeatX(this.bar.voices[0].beats[0], BeatXPosition.OnNotes);
        const x = firstOnNoteX;
        const w = this.postBeatGlyphsStart - firstOnNoteX;
        return x + w * ticks;
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        const container = this.getBeatContainer(note.beat);
        if (container) {
            return (
                container.voiceContainer.x +
                container.x +
                container.onNotes.x +
                container.onNotes.getNoteX(note, requestedPosition)
            );
        }
        return 0;
    }

    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        const beat = this.getOnNotesGlyphForBeat(note.beat);
        if (beat) {
            return beat.getNoteY(note, requestedPosition);
        }
        return Number.NaN;
    }

    public reLayout(): void {
        // there are some glyphs which are shown only for renderers at the line start, so we simply recreate them
        // but we only need to recreate them for the renderers that were the first of the line or are now the first of the line
        if ((this.wasFirstOfLine && !this.isFirstOfLine) || (!this.wasFirstOfLine && this.isFirstOfLine)) {
            this.recreatePreBeatGlyphs();
        }
        this.updateSizes();
        this.registerLayoutingInfo();
    }

    protected recreatePreBeatGlyphs() {
        this._preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
        this._preBeatGlyphs.renderer = this;
        this.createPreBeatGlyphs();
    }

    protected paintSimileMark(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.voice(canvas, VoiceSubElement.Glyphs, this.bar.voices[0], true);

        switch (this.bar.simileMark) {
            case SimileMark.Simple:
                canvas.beginGroup(BeatContainerGlyph.getGroupId(this.bar.voices[0].beats[0]));
                canvas.fillMusicFontSymbol(
                    cx + this.x + (this.width - 20) / 2,
                    cy + this.y + this.height / 2,
                    1,
                    MusicFontSymbol.Repeat1Bar,
                    false
                );
                canvas.endGroup();
                break;
            case SimileMark.SecondOfDouble:
                canvas.beginGroup(BeatContainerGlyph.getGroupId(this.bar.voices[0].beats[0]));
                canvas.beginGroup(BeatContainerGlyph.getGroupId(this.bar.previousBar!.voices[0].beats[0]));

                canvas.fillMusicFontSymbol(
                    cx + this.x - 28 / 2,
                    cy + this.y + this.height / 2,
                    1,
                    MusicFontSymbol.Repeat2Bars,
                    false
                );

                canvas.endGroup();
                canvas.endGroup();

                break;
        }
    }

    public completeBeamingHelper(helper: BeamingHelper) {
        // nothing by default
    }

    public getBeatDirection(beat: Beat): BeamDirection {
        return this.helpers.getBeamingHelperForBeat(beat).direction;
    }
}
