import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { type Voice, VoiceSubElement } from '@coderline/alphatab/model/Voice';
import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { EffectBandContainer } from '@coderline/alphatab/rendering/EffectBandContainer';
import {
    BeatContainerGlyph,
    type BeatContainerGlyphBase
} from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { MultiVoiceContainerGlyph } from '@coderline/alphatab/rendering/glyphs/MultiVoiceContainerGlyph';
import { ContinuationTieGlyph, type ITieGlyph, type TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { InternalSystemsLayoutMode } from '@coderline/alphatab/rendering/layout/ScoreLayout';
import { MultiBarRestBeatContainerGlyph } from '@coderline/alphatab/rendering/MultiBarRestBeatContainerGlyph';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import { BarHelpers } from '@coderline/alphatab/rendering/utils/BarHelpers';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import type { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * Lists the different position modes for {@link BarRendererBase.getNoteY}
 * @internal
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
    BottomWithStem = 4,
    /**
     * The position where the upwards stem should be placed.
     */
    StemUp = 5,
    /**
     * The position where the downwards stem should be placed.
     */
    StemDown = 6
}

/**
 * Lists the different position modes for {@link BarRendererBase.getNoteX}
 * @internal
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
 * @internal
 */
export class BarRendererBase {
    private _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
    protected readonly voiceContainer = new MultiVoiceContainerGlyph();
    private readonly _postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();

    private _ties: ITieGlyph[] = [];

    private _multiSystemSlurs?: ContinuationTieGlyph[];

    public topEffects: EffectBandContainer;
    public bottomEffects: EffectBandContainer;

    public get nextRenderer(): BarRendererBase | null {
        if (!this.bar || !this.bar.nextBar) {
            return null;
        }
        return this.scoreRenderer.layout!.getRendererForBar(this.staff!.staffId, this.bar.nextBar);
    }

    public get previousRenderer(): BarRendererBase | null {
        if (!this.bar || !this.bar.previousBar) {
            return null;
        }
        return this.scoreRenderer.layout!.getRendererForBar(this.staff!.staffId, this.bar.previousBar);
    }

    public scoreRenderer: ScoreRenderer;
    public staff?: RenderStaff;
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
    private _contentTopOverflow: number = 0;
    private _contentBottomOverflow: number = 0;

    public beatEffectsMinY = Number.NaN;
    public beatEffectsMaxY = Number.NaN;

    public get topOverflow() {
        return this._contentTopOverflow + this.topEffects.height;
    }

    public get bottomOverflow() {
        return this._contentBottomOverflow + this.bottomEffects.height;
    }

    protected helpers!: BarHelpers;

    public get collisionHelper() {
        return this.helpers.collisionHelper;
    }

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
        return true;
    }

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        this.scoreRenderer = renderer;
        this.bar = bar;
        this.helpers = new BarHelpers(this);
        this.topEffects = new EffectBandContainer(this, true);
        this.bottomEffects = new EffectBandContainer(this, false);
    }

    public registerTie(tie: ITieGlyph) {
        this._ties.push(tie);
    }

    public get middleYPosition(): number {
        return 0;
    }

    public registerBeatEffectOverflows(beatEffectsMinY: number, beatEffectsMaxY: number) {
        const currentBeatEffectsMinY = this.beatEffectsMinY;
        if (Number.isNaN(currentBeatEffectsMinY) || beatEffectsMinY < currentBeatEffectsMinY) {
            this.beatEffectsMinY = beatEffectsMinY;
        }

        const currentBeatEffectsMaxY = this.beatEffectsMaxY;
        if (Number.isNaN(currentBeatEffectsMaxY) || beatEffectsMaxY > currentBeatEffectsMaxY) {
            this.beatEffectsMaxY = beatEffectsMaxY;
        }
    }

    public registerOverflowTop(topOverflow: number): boolean {
        topOverflow = Math.ceil(topOverflow);
        if (topOverflow > this._contentTopOverflow) {
            this._contentTopOverflow = topOverflow;
            return true;
        }
        return false;
    }

    public registerOverflowBottom(bottomOverflow: number): boolean {
        bottomOverflow = Math.ceil(bottomOverflow);
        if (bottomOverflow > this._contentBottomOverflow) {
            this._contentBottomOverflow = bottomOverflow;
            return true;
        }
        return false;
    }

    public scaleToWidth(width: number): void {
        // preBeat and postBeat glyphs do not get resized
        const containerWidth: number = width - this._preBeatGlyphs.width - this._postBeatGlyphs.width;
        this.voiceContainer.scaleToWidth(containerWidth);

        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                h.alignWithBeats();
            }
        }

        this._postBeatGlyphs.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width + containerWidth;
        this.width = width;

        this.topEffects.alignGlyphs();
        this.bottomEffects.alignGlyphs();
    }

    public get resources(): RenderingResources {
        return this.settings.display.resources;
    }

    public get smuflMetrics() {
        return this.resources.engravingSettings;
    }

    public get settings(): Settings {
        return this.scoreRenderer.settings;
    }

    /**
     * Gets the scale with which the bar should be displayed in case the model
     * scale should be respected.
     */
    public get barDisplayScale(): number {
        return this.staff!.system.staves.length > 1 ? this.bar.masterBar.displayScale : this.bar.displayScale;
    }

    /**
     * Gets the absolute width in which the bar should be displayed in case the model
     * scale should be respected.
     */
    public get barDisplayWidth(): number {
        return this.staff!.system.staves.length > 1 ? this.bar.masterBar.displayWidth : this.bar.displayWidth;
    }

    protected wasFirstOfStaff: boolean = false;

    public get isFirstOfStaff(): boolean {
        return this.index === 0;
    }

    public get isLastOfStaff(): boolean {
        return this.index === this.staff!.barRenderers.length - 1;
    }

    public get isLast(): boolean {
        return !this.bar || this.bar.index === this.scoreRenderer.layout!.lastBarIndex;
    }

    public _registerLayoutingInfo(): void {
        const info: BarLayoutingInfo = this.layoutingInfo;
        const preSize: number = this._preBeatGlyphs.width;
        if (info.preBeatSize < preSize) {
            info.preBeatSize = preSize;
        }
        const container = this.voiceContainer;
        container.registerLayoutingInfo(info);

        const postSize: number = this._postBeatGlyphs.width;
        if (info.postBeatSize < postSize) {
            info.postBeatSize = postSize;
        }
    }

    private _appliedLayoutingInfo: number = 0;

    public afterReverted() {
        this.staff = undefined;
        this.registerMultiSystemSlurs(undefined);
        this.isFinalized = false;
    }

    public afterStaffBarReverted() {
        this.topEffects.afterStaffBarReverted();
        this.bottomEffects.afterStaffBarReverted();
        this._registerStaffOverflow();
    }

    public applyLayoutingInfo(): boolean {
        if (this._appliedLayoutingInfo >= this.layoutingInfo.version) {
            return false;
        }

        this.topEffects.resetEffectBandSizingInfo();
        this.bottomEffects.resetEffectBandSizingInfo();

        this._appliedLayoutingInfo = this.layoutingInfo.version;
        // if we need additional space in the preBeat group we simply
        // add a new spacer
        this._preBeatGlyphs.width = this.layoutingInfo.preBeatSize;

        // on beat glyphs we apply the glyph spacing
        const container = this.voiceContainer;
        container.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width;
        container.applyLayoutingInfo(this.layoutingInfo);

        // on the post glyphs we add the spacing before all other glyphs
        this._postBeatGlyphs.x = Math.floor(container.x + container.width);
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

        this.topEffects.sizeAndAlignEffectBands();
        this.bottomEffects.sizeAndAlignEffectBands();
        this._registerStaffOverflow();

        return true;
    }

    public isFinalized: boolean = false;

    public registerMultiSystemSlurs(startedTies: Generator<TieGlyph> | undefined) {
        if (!startedTies) {
            this._multiSystemSlurs = undefined;
            return;
        }

        let ties: ContinuationTieGlyph[] | undefined = undefined;
        for (const g of startedTies) {
            const continuation = new ContinuationTieGlyph(g);
            continuation.renderer = this;
            continuation.tieDirection = g.tieDirection;

            if (!ties) {
                ties = [];
            }
            ties.push(continuation);
        }

        this._multiSystemSlurs = ties;
    }

    private _finalizeTies(ties: Iterable<ITieGlyph>, barTop: number, barBottom: number): boolean {
        let didChangeOverflows = false;
        for (const t of ties) {
            const tie = t as unknown as Glyph;
            tie.doLayout();

            if (t.checkForOverflow) {
                // NOTE: Ties are aligned on staff level, need to subtract the bar position
                const tieTop = tie.getBoundingBoxTop();
                const tieBottom = tie.getBoundingBoxBottom();

                const bottomOverflow = tieBottom - barBottom;
                if (bottomOverflow > 0) {
                    if (this.registerOverflowBottom(bottomOverflow)) {
                        didChangeOverflows = true;
                    }
                }
                const topOverflow = tieTop - barTop;
                if (topOverflow < 0) {
                    if (this.registerOverflowTop(topOverflow * -1)) {
                        didChangeOverflows = true;
                    }
                }
            }
        }
        return didChangeOverflows;
    }

    public finalizeRenderer(): boolean {
        this.isFinalized = true;

        let didChangeOverflows = false;
        // allow spacing to be used for tie overflows
        const barTop = this.y;
        const barBottom = this.y + this.height;

        if (this._finalizeTies(this._ties, barTop, barBottom)) {
            didChangeOverflows = true;
        }

        const multiSystemSlurs = this._multiSystemSlurs;
        if (multiSystemSlurs && this._finalizeTies(multiSystemSlurs, barTop, barBottom)) {
            didChangeOverflows = true;
        }

        const topHeightChanged = this.topEffects.finalizeEffects();
        const bottomHeightChanged = this.bottomEffects.finalizeEffects();
        if (topHeightChanged || bottomHeightChanged) {
            didChangeOverflows = true;
        }

        if (didChangeOverflows) {
            this.updateSizes();
            this._registerStaffOverflow();
        }

        return didChangeOverflows;
    }

    private _registerStaffOverflow() {
        this.staff!.registerOverflowTop(this.topOverflow);
        this.staff!.registerOverflowBottom(this.bottomOverflow);
    }

    public doLayout(): void {
        if (!this.bar) {
            return;
        }
        this.helpers.initialize();
        this._ties = [];
        this._preBeatGlyphs.renderer = this;
        this.voiceContainer.renderer = this;
        this._postBeatGlyphs.renderer = this;
        this.topEffects.doLayout();
        this.bottomEffects.doLayout();

        if (this.bar.simileMark === SimileMark.SecondOfDouble) {
            this.canWrap = false;
        }

        this.createPreBeatGlyphs();
        this.createBeatGlyphs();
        this.createPostBeatGlyphs();

        this._registerLayoutingInfo();

        // registering happened during creation
        this.topEffects.sizeAndAlignEffectBands(false);
        this.bottomEffects.sizeAndAlignEffectBands(false);

        this.updateSizes();

        // finish up all helpers
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                h.finish();
            }
        }

        this.computedWidth = this.width;

        this.calculateOverflows(0, this.height);
    }

    protected calculateOverflows(_rendererTop: number, rendererBottom: number) {
        const preBeatGlyphs = this._preBeatGlyphs.glyphs;
        if (preBeatGlyphs) {
            for (const g of preBeatGlyphs) {
                const topY = g.getBoundingBoxTop();
                if (topY < 0) {
                    this.registerOverflowTop(topY * -1);
                }

                const bottomY = g.getBoundingBoxBottom();
                if (bottomY > rendererBottom) {
                    this.registerOverflowBottom(bottomY - rendererBottom);
                }
            }
        }
        const postBeatGlyphs = this._postBeatGlyphs.glyphs;
        if (postBeatGlyphs) {
            for (const g of postBeatGlyphs) {
                const topY = g.getBoundingBoxTop();
                if (topY < 0) {
                    this.registerOverflowTop(topY * -1);
                }

                const bottomY = g.getBoundingBoxBottom();
                if (bottomY > rendererBottom) {
                    this.registerOverflowBottom(bottomY - rendererBottom);
                }
            }
        }

        const v = this.voiceContainer;
        const contentMinY = v.getBoundingBoxTop();
        if (contentMinY < 0) {
            this.registerOverflowTop(contentMinY * -1);
        }

        const contentMaxY = v.getBoundingBoxBottom();
        if (contentMaxY > rendererBottom) {
            this.registerOverflowBottom(contentMaxY - rendererBottom);
        }

        const beatEffectsMinY = this.beatEffectsMinY;
        if (!Number.isNaN(beatEffectsMinY) && beatEffectsMinY < 0) {
            this.registerOverflowTop(beatEffectsMinY * -1);
        }

        const beatEffectsMaxY = this.beatEffectsMaxY;
        if (!Number.isNaN(beatEffectsMaxY) && beatEffectsMaxY > rendererBottom) {
            this.registerOverflowBottom(beatEffectsMaxY - rendererBottom);
        }
    }

    protected updateSizes(): void {
        this.staff!.registerStaffTop(0);

        this.voiceContainer.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width;
        this._postBeatGlyphs.x = Math.floor(this.voiceContainer.x + this.voiceContainer.width);

        this.width = Math.ceil(this._postBeatGlyphs.x + this._postBeatGlyphs.width);

        const topHeightChanged = this.topEffects.updateEffectBandHeights();
        const bottomHeightChanged = this.bottomEffects.updateEffectBandHeights();
        if (topHeightChanged || bottomHeightChanged) {
            this._registerStaffOverflow();
        }

        this.height += this.layoutingInfo.height;
        this.height = Math.ceil(this.height);

        this.staff!.registerStaffBottom(this.height);
    }

    protected addPreBeatGlyph(g: Glyph): void {
        g.renderer = this;
        this._preBeatGlyphs.addGlyph(g);
    }

    protected addBeatGlyph(g: BeatContainerGlyphBase): void {
        g.renderer = this;
        this.voiceContainer.addGlyph(g);
    }

    public getBeatContainer(beat: Beat): BeatContainerGlyphBase | undefined {
        return this.voiceContainer.getBeatContainer(beat);
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);

        this.paintContent(cx, cy, canvas);

        const topEffectBandY = cy + this.y - this.staff!.topOverflow;
        this.topEffects.paint(cx + this.x, topEffectBandY, canvas);

        const bottomEffectBandY = cy + this.y + this.height + this.staff!.bottomOverflow - this.bottomEffects.height;
        this.bottomEffects.paint(cx + this.x, bottomEffectBandY, canvas);
    }

    protected paintContent(cx: number, cy: number, canvas: ICanvas): void {
        this.paintBackground(cx, cy, canvas);

        canvas.color = this.resources.mainGlyphColor;
        this._preBeatGlyphs.paint(cx + this.x, cy + this.y, canvas);
        this.voiceContainer.paint(cx + this.x, cy + this.y, canvas);
        canvas.color = this.resources.mainGlyphColor;
        this._postBeatGlyphs.paint(cx + this.x, cy + this.y, canvas);

        this._paintMultiSystemSlurs(cx, cy, canvas);
    }

    private _paintMultiSystemSlurs(cx: number, cy: number, canvas: ICanvas) {
        const multiSystemSlurs = this._multiSystemSlurs;
        if (!multiSystemSlurs) {
            return;
        }

        for (const slur of multiSystemSlurs) {
            slur.paint(cx, cy, canvas);
        }
    }

    protected paintBackground(cx: number, cy: number, canvas: ICanvas): void {
        this.layoutingInfo.paint(
            cx + this.x + this._preBeatGlyphs.x + this._preBeatGlyphs.width,
            cy + this.y + this.height,
            canvas
        );
        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
        // canvas.strokeRect(cx + this.x, cy + this.y - this.topOverflow, this.width, this.height + this.topOverflow + this.bottomOverflow);
    }

    public buildBoundingsLookup(masterBarBounds: MasterBarBounds, cx: number, cy: number): void {
        const barBounds: BarBounds = new BarBounds();
        barBounds.bar = this.bar;
        barBounds.visualBounds = new Bounds();
        barBounds.visualBounds.x = cx + this.x;
        barBounds.visualBounds.y = cy + this.y;
        barBounds.visualBounds.w = this.width;
        barBounds.visualBounds.h = this.height;

        barBounds.realBounds = new Bounds();
        barBounds.realBounds.x = cx + this.x;
        barBounds.realBounds.y = cy + this.y;
        barBounds.realBounds.w = this.width;
        barBounds.realBounds.h = this.height;

        masterBarBounds.addBar(barBounds);
        this.voiceContainer.buildBoundingsLookup(barBounds, cx + this.x, cy + this.y);
    }

    protected addPostBeatGlyph(g: Glyph): void {
        this._postBeatGlyphs.addGlyph(g);
    }

    protected createPreBeatGlyphs(): void {
        this.wasFirstOfStaff = this.isFirstOfStaff;
    }

    protected createBeatGlyphs(): void {
        if (this.additionalMultiRestBars) {
            const container = new MultiBarRestBeatContainerGlyph();
            this.addBeatGlyph(container);
        } else {
            for (const index of this.bar.filledVoices) {
                this.createVoiceGlyphs(this.bar.voices[index]);
            }
        }

        this.voiceContainer.doLayout();

        if (this.topEffects.isLinkedToPreviousRenderer || this.bottomEffects.isLinkedToPreviousRenderer) {
            this.isLinkedToPrevious = true;
        }
    }

    protected createVoiceGlyphs(voice: Voice): void {
        this.topEffects.createVoiceGlyphs(voice);
        this.bottomEffects.createVoiceGlyphs(voice);
    }

    protected createPostBeatGlyphs(): void {
        // filled in subclasses
    }

    public get beatGlyphsStart(): number {
        return this.voiceContainer.x;
    }

    public get postBeatGlyphsStart(): number {
        return this._postBeatGlyphs.x;
    }

    public getBeatX(
        beat: Beat,
        requestedPosition: BeatXPosition = BeatXPosition.PreNotes,
        useSharedSizes: boolean = false
    ): number {
        return this.beatGlyphsStart + this.voiceContainer.getBeatX(beat, requestedPosition, useSharedSizes);
    }

    public getRatioPositionX(ticks: number): number {
        const firstOnNoteX = this.bar.isEmpty
            ? this.beatGlyphsStart
            : this.getBeatX(this.bar.voices[0].beats[0], BeatXPosition.MiddleNotes);
        const x = firstOnNoteX;
        const w = this.postBeatGlyphsStart - firstOnNoteX;
        return x + w * ticks;
    }

    public getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        return this.beatGlyphsStart + this.voiceContainer.getNoteX(note, requestedPosition);
    }

    public getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return this.voiceContainer.y + +this.voiceContainer.getNoteY(note, requestedPosition);
    }

    public getRestY(beat: Beat, requestedPosition: NoteYPosition): number {
        return this.voiceContainer.y + +this.voiceContainer.getRestY(beat, requestedPosition);
    }

    public reLayout(): void {
        this.topEffects.reLayout();
        this.bottomEffects.reLayout();
        this.updateSizes();

        // there are some glyphs which are shown only for renderers at the line start, so we simply recreate them
        // but we only need to recreate them for the renderers that were the first of the line or are now the first of the line
        if ((this.wasFirstOfStaff && !this.isFirstOfStaff) || (!this.wasFirstOfStaff && this.isFirstOfStaff)) {
            this.recreatePreBeatGlyphs();
            this._postBeatGlyphs.doLayout();
        }

        this._registerLayoutingInfo();
        this.calculateOverflows(0, this.height);
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
                CanvasHelper.fillMusicFontSymbolSafe(
                    canvas,
                    cx + this.x + this.width / 2,
                    cy + this.y + this.height / 2,
                    1,
                    MusicFontSymbol.Repeat1Bar,
                    true
                );
                canvas.endGroup();
                break;
            case SimileMark.SecondOfDouble:
                canvas.beginGroup(BeatContainerGlyph.getGroupId(this.bar.voices[0].beats[0]));
                canvas.beginGroup(BeatContainerGlyph.getGroupId(this.bar.previousBar!.voices[0].beats[0]));

                CanvasHelper.fillMusicFontSymbolSafe(
                    canvas,
                    cx + this.x,
                    cy + this.y + this.height / 2,
                    1,
                    MusicFontSymbol.Repeat2Bars,
                    true
                );

                canvas.endGroup();
                canvas.endGroup();

                break;
        }
    }

    public completeBeamingHelper(_helper: BeamingHelper) {
        // nothing by default
    }

    public getBeatDirection(beat: Beat): BeamDirection {
        return this.helpers.getBeamingHelperForBeat(beat)?.direction ?? BeamDirection.Up;
    }
}
