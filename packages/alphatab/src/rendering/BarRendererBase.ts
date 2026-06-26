import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { type Voice, VoiceSubElement } from '@coderline/alphatab/model/Voice';
import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { EffectBandContainer } from '@coderline/alphatab/rendering/EffectBandContainer';
import {
    BeatContainerGlyph,
    type BeatContainerGlyphBase,
    type BeatEffectOverflow
} from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { MultiVoiceContainerGlyph } from '@coderline/alphatab/rendering/glyphs/MultiVoiceContainerGlyph';
import { ContinuationTieGlyph, type ITieGlyph, type TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { MultiBarRestBeatContainerGlyph } from '@coderline/alphatab/rendering/MultiBarRestBeatContainerGlyph';
import { OverlayRodPolicy } from '@coderline/alphatab/rendering/OverlayRodPolicy';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { BarLocalSkyline, StaffSide } from '@coderline/alphatab/rendering/skyline/BarLocalSkyline';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import { BarHelpers } from '@coderline/alphatab/rendering/utils/BarHelpers';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import type { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
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

    /** Set by {@link RenderStaff._finalizeRendererTies} when a tie write grew this renderer's overflow. */
    private _tiesDirty: boolean = false;

    /** Ties whose start beat lives on this renderer. */
    public get ties(): ITieGlyph[] {
        return this._ties;
    }

    public markTiesDirty(): void {
        this._tiesDirty = true;
    }

    public get tiesDirty(): boolean {
        return this._tiesDirty;
    }

    public clearTiesDirty(): void {
        this._tiesDirty = false;
    }

    /** Multi-system slur continuations attached to this renderer. Only populated on renderer 0 of a staff. */
    public get multiSystemSlurs(): ContinuationTieGlyph[] | undefined {
        return this._multiSystemSlurs;
    }

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
    /** Renderer y is staff-relative and shared by every renderer in the staff: `staff.topPadding + staff.topOverflow`. */
    public get y(): number {
        const s = this.staff;
        return s ? s.topPadding + s.topOverflow : 0;
    }
    public width: number = 0;
    public computedWidth: number = 0;
    public height: number = 0;
    public index: number = 0;
    private _contentTopOverflow: number = 0;
    private _contentBottomOverflow: number = 0;

    public beatEffectsMinY = Number.NaN;
    public beatEffectsMaxY = Number.NaN;

    private _barLocalSkyline: BarLocalSkyline | null = null;
    private _preBeatLocalSkyline: BarLocalSkyline | null = null;
    private _postBeatLocalSkyline: BarLocalSkyline | null = null;

    /** Per-bar local skyline of non-effect-band glyphs (renderer-local x). */
    public get barLocalSkyline(): BarLocalSkyline {
        if (!this._barLocalSkyline) {
            this._barLocalSkyline = new BarLocalSkyline(
                0,
                Number.MAX_SAFE_INTEGER,
                this.scoreRenderer.layout!.skylinePool
            );
        }
        return this._barLocalSkyline;
    }

    /** Pre-beat glyphs' skyline contribution. Separate from {@link barLocalSkyline} so the latter's per-cycle reset doesn't wipe it. */
    public get preBeatLocalSkyline(): BarLocalSkyline {
        if (!this._preBeatLocalSkyline) {
            this._preBeatLocalSkyline = new BarLocalSkyline(
                0,
                Number.MAX_SAFE_INTEGER,
                this.scoreRenderer.layout!.skylinePool
            );
        }
        return this._preBeatLocalSkyline;
    }

    /** Post-beat glyphs' skyline in post-beat-group-local x; shifted by {@link postBeatGroupOffset} when unioned. */
    public get postBeatLocalSkyline(): BarLocalSkyline {
        if (!this._postBeatLocalSkyline) {
            this._postBeatLocalSkyline = new BarLocalSkyline(
                0,
                Number.MAX_SAFE_INTEGER,
                this.scoreRenderer.layout!.skylinePool
            );
        }
        return this._postBeatLocalSkyline;
    }

    public get postBeatGroupOffset(): number {
        return this._postBeatGlyphs.x;
    }

    /** Per-cycle reset of skylines and ties. Called from {@link doLayout}; not from {@link reLayout}. */
    public resetCycleState(): void {
        this._barLocalSkyline?.reset();
        this._preBeatLocalSkyline?.reset();
        this._postBeatLocalSkyline?.reset();
        this._ties = [];
        this.beatEffectsMinY = Number.NaN;
        this.beatEffectsMaxY = Number.NaN;
    }

    /** Emit a glyph's current bbox into {@link barLocalSkyline}. */
    public insertSkylineFromBbox(glyph: Glyph): void {
        const xL = glyph.getBoundingBoxLeft();
        const xR = glyph.getBoundingBoxRight();
        if (xR <= xL) {
            return;
        }
        const topY = glyph.getBoundingBoxTop();
        if (topY < 0) {
            this.insertSkylineTop(xL, xR, -topY);
        }
        const bottomY = glyph.getBoundingBoxBottom();
        if (bottomY > this.height) {
            this.insertSkylineBottom(xL, xR, bottomY - this.height);
        }
    }

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

    public registerBeatEffectOverflowsForBeat(beat: Beat, minY: number, maxY: number): void {
        this.registerBeatEffectOverflows(minY, maxY);
        const container = this.getBeatContainer(beat);
        if (container) {
            const entry: BeatEffectOverflow = { minY, maxY };
            container.pendingEffectOverflows.push(entry);
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

    /** Post-{@link scaleToWidth} only: also inserts into the bar-local skyline. */
    public registerOverflowRangeTop(xStart: number, xEnd: number, topHeight: number): boolean {
        const changed = this.registerOverflowTop(topHeight);
        if (topHeight > 0 && xEnd > xStart) {
            this.barLocalSkyline.insertPlaced(StaffSide.Top, xStart, xEnd, topHeight, 0);
        }
        return changed;
    }

    public registerOverflowRangeBottom(xStart: number, xEnd: number, bottomHeight: number): boolean {
        const changed = this.registerOverflowBottom(bottomHeight);
        if (bottomHeight > 0 && xEnd > xStart) {
            this.barLocalSkyline.insertPlaced(StaffSide.Bottom, xStart, xEnd, bottomHeight, 0);
        }
        return changed;
    }

    /** Emit a top-skyline segment into {@link barLocalSkyline}. */
    public insertSkylineTop(xStart: number, xEnd: number, topHeight: number): void {
        if (topHeight > 0 && xEnd > xStart) {
            this.barLocalSkyline.insertPlaced(StaffSide.Top, xStart, xEnd, topHeight, 0);
        }
    }

    /** Emit a bottom-skyline segment into {@link barLocalSkyline}. */
    public insertSkylineBottom(xStart: number, xEnd: number, bottomHeight: number): void {
        if (bottomHeight > 0 && xEnd > xStart) {
            this.barLocalSkyline.insertPlaced(StaffSide.Bottom, xStart, xEnd, bottomHeight, 0);
        }
    }

    /**
     * The fixed-overhead width of this renderer: glyphs that do not stretch when
     * the bar is scaled (clef, key signature, time signature, barlines, courtesy
     * accidentals, etc). Treated as a fixed allocation by the system-level layout
     * before distributing remaining width across bars by {@link Bar.displayScale}.
     */
    public get fixedOverhead(): number {
        return this._preBeatGlyphs.width + this._postBeatGlyphs.width;
    }

    public scaleToWidth(width: number): void {
        // preBeat and postBeat glyphs do not get resized
        const containerWidth: number = width - this._preBeatGlyphs.width - this._postBeatGlyphs.width;

        // Re-emit scale-dependent segments. pre/postBeatLocalSkyline are
        // owned by calculateOverflows and untouched here.
        this.barLocalSkyline.reset();

        // Spring-X about to be re-laid-out, so cached BeamingHelperDrawInfo is stale.
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                h.invalidateDrawingInfos();
            }
        }

        this.voiceContainer.scaleToWidth(containerWidth);

        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                this.emitHelperSkyline(h);
            }
        }

        this._postBeatGlyphs.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width + containerWidth;
        this.width = width;

        // `EffectInfo.onAlignGlyphs` overrides must be max-of-idempotent;
        // shared `_sharedLayoutData` is reset per system in
        // `StaffSystem.resetAllStavesSharedLayoutData`.
        this.topEffects.alignGlyphs();
        this.bottomEffects.alignGlyphs();

        const preBeatGlyphs = this._preBeatGlyphs.glyphs;
        if (preBeatGlyphs) {
            for (const g of preBeatGlyphs) {
                g.populateSkyline();
            }
        }
        this.topEffects.populateSkyline();
        this.bottomEffects.populateSkyline();

        this.emitSubclassBarLocalSkyline();

        // Geometry is now settled; cross-renderer chain walks during
        // finalizeStaff can rely on this flag. Reset by {@link afterReverted}.
        this.isFinalized = true;
    }

    protected emitHelperSkyline(_h: BeamingHelper): void {}

    public emitBeatSkyline(_beatContainer: BeatContainerGlyphBase): void {}

    protected emitSubclassBarLocalSkyline(): void {}

    public get resources(): RenderingResources {
        return this.settings.display.resources;
    }

    public get smuflMetrics() {
        return this.resources.engravingSettings;
    }

    public get settings(): Settings {
        return this.scoreRenderer.settings;
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

    /**
     * Gates the voice-container walk in {@link _registerLayoutingInfo}.
     * Broker outputs from the walk are bar-local invariant; only the
     * pre/post-beat `max` writes need to run each resize cycle (the broker
     * zeroes `preBeatSize` at the head of every resize).
     */
    private _voiceWalkDone: boolean = false;

    public _registerLayoutingInfo(): void {
        const info: BarLayoutingInfo = this.layoutingInfo;
        const preSize: number = this._preBeatGlyphs.width;
        if (info.preBeatSize < preSize) {
            info.preBeatSize = preSize;
        }
        if (!this._voiceWalkDone) {
            const container = this.voiceContainer;
            container.registerLayoutingInfo(info);

            this.topEffects.registerLayoutingInfo(info);
            this.bottomEffects.registerLayoutingInfo(info);
            this._voiceWalkDone = true;
        }

        const postSize: number = this._postBeatGlyphs.width;
        if (info.postBeatSize < postSize) {
            info.postBeatSize = postSize;
        }
    }

    public _registerOverlayRods(): void {
        const info: BarLayoutingInfo = this.layoutingInfo;
        this._collectOverlayRods(this.topEffects, info);
        this._collectOverlayRods(this.bottomEffects, info);
    }

    private _collectOverlayRods(container: EffectBandContainer, info: BarLayoutingInfo): void {
        for (const band of container.bands) {
            const policy = band.info.overlayRodPolicy;
            if (policy === OverlayRodPolicy.None) {
                continue;
            }
            const bandKey = String(band.info.notationElement);
            for (const voiceGlyphs of band.glyphsByVoice) {
                for (const glyph of voiceGlyphs) {
                    if (!glyph.beat || glyph.width <= 0) {
                        continue;
                    }
                    const w = glyph.width;
                    const t = glyph.beat.absoluteDisplayStart;
                    switch (policy) {
                        case OverlayRodPolicy.Left:
                            info.addOverlayRod(bandKey, t, 0, w);
                            break;
                        case OverlayRodPolicy.Right:
                            info.addOverlayRod(bandKey, t, w, 0);
                            break;
                        default: {
                            const half = w * 0.5;
                            info.addOverlayRod(bandKey, t, half, half);
                            break;
                        }
                    }
                }
            }
        }
    }


    public afterReverted() {
        this.staff = undefined;
        this.registerMultiSystemSlurs(undefined);
        this.isFinalized = false;
        // `_layoutInvariantCached` and `_voiceWalkDone` deliberately survive:
        // they cache bar-local invariant state and `afterReverted` fires every
        // resize cycle — invalidating here would defeat the optimisation.
    }

    public afterStaffBarReverted() {
        // Band internals (placedMagnitude/y/publishedSpans) are recomputed
        // by the next finalizeStaff cycle before paint reads them.
        this.topEffects.height = 0;
        this.bottomEffects.height = 0;
        this._registerStaffOverflow();
    }

    /**
     * Pull the current {@link BarLayoutingInfo} broker state into this
     * renderer's positions. Value-idempotent on a stable broker; callers
     * must gate themselves to skip unchanged bars.
     */
    public applyLayoutingInfo(): void {
        // if we need additional space in the preBeat group we simply
        // add a new spacer
        this._preBeatGlyphs.width = this.layoutingInfo.preBeatSize;

        // on beat glyphs we apply the glyph spacing
        const container = this.voiceContainer;
        container.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width;
        container.applyLayoutingInfo(this.layoutingInfo);

        // `_postBeatGlyphs.x` is written once at end of {@link scaleToWidth};
        // compute locally here without touching the field.
        this._postBeatGlyphs.width = this.layoutingInfo.postBeatSize;
        const postBeatX = Math.floor(container.x + container.width);
        this.width = Math.ceil(postBeatX + this._postBeatGlyphs.width);
        this.computedWidth = this.width;

        this._registerStaffOverflow();
    }

    public isFinalized: boolean = false;

    /**
     * Set once {@link doLayout} has populated the bar-local invariant state
     * (`_preBeatGlyphs.width`, `_postBeatGlyphs.width`, broker per-beat sizes,
     * local pre/post-beat skylines). Lets {@link reLayout} skip the bar-local
     * re-walk on width-only changes.
     */
    private _layoutInvariantCached: boolean = false;

    public invalidateLayoutCache(): void {
        this._layoutInvariantCached = false;
    }

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

    /** Republish each effect band's cross-renderer chain spans. */
    public finalizeEffectBandSpans(): void {
        this.topEffects.finalizeChainSpans();
        this.bottomEffects.finalizeChainSpans();
    }

    public finalizeOwnedTies(): void {
        this._emitTies(this._ties);
        if (this._multiSystemSlurs) {
            this._emitTies(this._multiSystemSlurs);
        }
    }

    private _emitTies(ties: Iterable<ITieGlyph>): void {
        const staffRenderers = this.staff!.barRenderers;
        const startIndex = this.index;
        for (const t of ties) {
            const tie = t as unknown as Glyph;
            tie.doLayout();

            if (!t.checkForOverflow) {
                continue;
            }

            const tieTop = t.getBoundingBoxTop();
            const tieBottom = t.getBoundingBoxBottom();
            const tieTopOverflow = tieTop < 0 ? -tieTop : 0;

            const tieLeftStaff = t.getBoundingBoxLeft();
            const tieRightStaff = t.getBoundingBoxRight();

            for (let i = startIndex; i < staffRenderers.length; i++) {
                const target = staffRenderers[i];
                if (target.x >= tieRightStaff) {
                    break;
                }
                const targetXStart = target.x;
                const targetXEnd = target.x + target.width;
                const xStartStaff = Math.max(targetXStart, tieLeftStaff);
                const xEndStaff = Math.min(targetXEnd, tieRightStaff);
                if (xEndStaff <= xStartStaff) {
                    continue;
                }
                const xStart = xStartStaff - targetXStart;
                const xEnd = xEndStaff - targetXStart;
                const tieBottomOverflow = tieBottom - target.height;

                if (target === this) {
                    if (tieTopOverflow > 0) {
                        if (target.registerOverflowRangeTop(xStart, xEnd, tieTopOverflow)) {
                            target.markTiesDirty();
                        }
                    }
                    if (tieBottomOverflow > 0) {
                        if (target.registerOverflowRangeBottom(xStart, xEnd, tieBottomOverflow)) {
                            target.markTiesDirty();
                        }
                    }
                } else {
                    if (tieTopOverflow > 0) {
                        target.barLocalSkyline.insertPlaced(StaffSide.Top, xStart, xEnd, tieTopOverflow, 0);
                    }
                    if (tieBottomOverflow > 0) {
                        target.barLocalSkyline.insertPlaced(StaffSide.Bottom, xStart, xEnd, tieBottomOverflow, 0);
                    }
                }
            }
        }
    }

    private _registerStaffOverflow() {
        this.staff!.registerOverflowTop(this.topOverflow);
        this.staff!.registerOverflowBottom(this.bottomOverflow);
    }

    /** Public wrapper for `_registerStaffOverflow`. */
    public registerStaffOverflows(): void {
        this._registerStaffOverflow();
    }

    /**
     * Public wrapper for `updateSizes`. Cannot widen `updateSizes` directly
     * because `LineBarRenderer.updateSizes` is `protected override` and the
     * transpiler does not consistently widen visibility across overrides.
     */
    public refreshSizes(): void {
        this.updateSizes();
    }

    public doLayout(): void {
        if (!this.bar) {
            return;
        }
        this.helpers.initialize();
        this._preBeatGlyphs.renderer = this;
        this.voiceContainer.renderer = this;
        this._postBeatGlyphs.renderer = this;
        this.topEffects.doLayout();
        this.bottomEffects.doLayout();
        this.resetCycleState();

        this.createPreBeatGlyphs();
        this.createBeatGlyphs();
        this.createPostBeatGlyphs();

        this._registerLayoutingInfo();
        this._registerOverlayRods();

        this.updateSizes();

        // finish up all helpers
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                h.finish();
            }
        }

        this.computedWidth = this.width;

        this.calculateOverflows(0, this.height);

        this._layoutInvariantCached = true;
    }

    protected calculateOverflows(_rendererTop: number, rendererBottom: number) {
        // Re-emit pre/post-beat skylines from scratch each pass. Pre-beat
        // group x = 0 so its local x equals bar-local x; post-beat x is
        // not final until scaleToWidth, so the staff-skyline union shifts
        // it later.
        this.preBeatLocalSkyline.reset();
        this.postBeatLocalSkyline.reset();

        const preBeatGlyphs = this._preBeatGlyphs.glyphs;
        if (preBeatGlyphs) {
            this._emitGroupOverflows(preBeatGlyphs, this.preBeatLocalSkyline, rendererBottom);
        }
        const postBeatGlyphs = this._postBeatGlyphs.glyphs;
        if (postBeatGlyphs) {
            this._emitGroupOverflows(postBeatGlyphs, this.postBeatLocalSkyline, rendererBottom);
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

    /** Emit per-glyph overflow into the given group skyline. Shared by pre- and post-beat groups. */
    private _emitGroupOverflows(glyphs: Glyph[], skyline: BarLocalSkyline, rendererBottom: number): void {
        for (const g of glyphs) {
            const topY = g.getBoundingBoxTop();
            const bottomY = g.getBoundingBoxBottom();
            const topOver = topY < 0;
            const bottomOver = bottomY > rendererBottom;
            if (!topOver && !bottomOver) {
                continue;
            }
            const xL = g.getBoundingBoxLeft();
            const xR = g.getBoundingBoxRight();
            const hasExtent = xR > xL;
            if (topOver) {
                this.registerOverflowTop(topY * -1);
                if (hasExtent) {
                    skyline.insertPlaced(StaffSide.Top, xL, xR, topY * -1, 0);
                }
            }
            if (bottomOver) {
                this.registerOverflowBottom(bottomY - rendererBottom);
                if (hasExtent) {
                    skyline.insertPlaced(StaffSide.Bottom, xL, xR, bottomY - rendererBottom, 0);
                }
            }
        }
    }

    protected updateSizes(): void {
        this.staff!.registerStaffTop(0);

        this.voiceContainer.x = this._preBeatGlyphs.x + this._preBeatGlyphs.width;
        this._postBeatGlyphs.x = Math.floor(this.voiceContainer.x + this.voiceContainer.width);

        this.width = Math.ceil(this._postBeatGlyphs.x + this._postBeatGlyphs.width);

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

    public getRatioPositionX(ratio: number): number {
        const firstOnNoteX = this.bar.isEmpty
            ? this.beatGlyphsStart
            : this.getBeatX(this.bar.voices[0].beats[0], BeatXPosition.MiddleNotes);
        const x = firstOnNoteX;
        const w = this.postBeatGlyphsStart - firstOnNoteX;
        return x + w * ratio;
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
        this.topEffects.height = 0;
        this.bottomEffects.height = 0;
        this.updateSizes();

        // there are some glyphs which are shown only for renderers at the line start, so we simply recreate them
        // but we only need to recreate them for the renderers that were the first of the line or are now the first of the line
        if ((this.wasFirstOfStaff && !this.isFirstOfStaff) || (!this.wasFirstOfStaff && this.isFirstOfStaff)) {
            this.recreatePreBeatGlyphs();
        }

        // Must always re-register: the broker zeroes `preBeatSize` at the head of every resize cycle.
        this._registerLayoutingInfo();
        this._registerOverlayRods();
        if (!this._layoutInvariantCached) {
            this.calculateOverflows(0, this.height);
            this._layoutInvariantCached = true;
        }
    }

    protected recreatePreBeatGlyphs() {
        // Pre-beat composition is changing — invalidate cached bar-local state.
        this._layoutInvariantCached = false;
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
}
