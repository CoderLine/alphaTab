import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { type Voice, VoiceSubElement } from '@coderline/alphatab/model/Voice';
import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { EffectBandContainer } from '@coderline/alphatab/rendering/EffectBandContainer';
import type { AttributionGlyph } from '@coderline/alphatab/rendering/glyphs/AttributionGlyph';
import {
    BeatContainerGlyph,
    type BeatContainerGlyphBase,
    type BeatEffectOverflow
} from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { type HeaderKey, HeaderProfile } from '@coderline/alphatab/rendering/staves/HeaderProfile';
import { MultiVoiceContainerGlyph } from '@coderline/alphatab/rendering/glyphs/MultiVoiceContainerGlyph';
import { ContinuationTieGlyph, type ITieGlyph, type TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import { MultiBarRestBeatContainerGlyph } from '@coderline/alphatab/rendering/MultiBarRestBeatContainerGlyph';
import { OverlayRodPolicy } from '@coderline/alphatab/rendering/OverlayRodPolicy';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { BarLocalSkyline, StaffSide } from '@coderline/alphatab/rendering/skyline/BarLocalSkyline';
import { SkylineShape } from '@coderline/alphatab/rendering/skyline/SkylineShape';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { BarHelpers } from '@coderline/alphatab/rendering/utils/BarHelpers';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
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
    private static readonly _compressionTolerance: number = 1;
    // the layout works on _headerProfile; the header glyphs are only created once they are needed
    // for painting and kept as long as the header of the bar does not change
    private _preBeatGlyphs = new LeftToRightLayoutingGlyphGroup();
    private _headerProfile: HeaderProfile | null = null;
    private _headerInFirstSystem: boolean = false;
    protected readonly voiceContainer = new MultiVoiceContainerGlyph();
    private readonly _postBeatGlyphs = new LeftToRightLayoutingGlyphGroup();

    private _ties: ITieGlyph[] | null = null;

    private _multiSystemSlurs?: ContinuationTieGlyph[];

    /** Ties whose start beat lives on this renderer. */
    public get ties(): ITieGlyph[] {
        let ties = this._ties;
        if (!ties) {
            ties = [];
            this._ties = ties;
        }
        return ties;
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

    // Content overflows are max-only within a pass. These snapshots let every later pass start
    // from the measured content ({@link doLayout}) and the positioned content
    // ({@link applyLayoutingInfo}) instead of from the maximum of all previous positions.
    private _hasMeasuredOverflow: boolean = false;
    private _measuredTopOverflow: number = 0;
    private _measuredBottomOverflow: number = 0;
    private _hasPositionedOverflow: boolean = false;
    private _positionedTopOverflow: number = 0;
    private _positionedBottomOverflow: number = 0;

    public beatEffectsMinY = Number.NaN;
    public beatEffectsMaxY = Number.NaN;

    /**
     * Set by {@link RenderStaff.finalizeStaff} on the renderer that paints the attribution, otherwise `null`.
     */
    public attribution: AttributionGlyph | null = null;

    /**
     * The height above renderer y=0 that marks resting on this staff must clear at minimum.
     */
    public get staffTopClearance(): number {
        return 0;
    }

    private _barLocalSkyline: BarLocalSkyline | null = null;
    private _preBeatLocalSkyline: BarLocalSkyline | null = null;
    private _postBeatLocalSkyline: BarLocalSkyline | null = null;

    /**
     * Per-bar local skyline of the bar's musical content (notes, stems, beams,
     * flags, ties, beat effects). Renderer-local x. This is the "content"
     * surface: it deliberately excludes the structural bar header (clef, key
     * signature, time signature, barlines, repeat counts), which lives in
     * {@link preBeatLocalSkyline}/{@link postBeatLocalSkyline}. Effect bands that
     * conceptually sit within the header's own reserved band rather than above
     * the whole engraving (e.g. bar numbers) are placed against this surface
     * only — see {@link EffectInfo.ignoresStructuralHeader}.
     */
    public get barLocalSkyline(): BarLocalSkyline {
        if (!this._barLocalSkyline) {
            this._barLocalSkyline = new BarLocalSkyline(
                0,
                Number.MAX_SAFE_INTEGER,
                this.scoreRenderer.layout!.skylineScratch
            );
        }
        return this._barLocalSkyline;
    }

    /**
     * Pre-beat (structural header) glyphs' skyline contribution: clef, key
     * signature, time signature. Kept separate from {@link barLocalSkyline} so
     * (a) the latter's per-cycle reset doesn't wipe it, and (b) the header can
     * be excluded from the collision surface for bands that ignore it.
     */
    public get preBeatLocalSkyline(): BarLocalSkyline {
        if (!this._preBeatLocalSkyline) {
            this._preBeatLocalSkyline = new BarLocalSkyline(
                0,
                Number.MAX_SAFE_INTEGER,
                this.scoreRenderer.layout!.skylineScratch
            );
        }
        return this._preBeatLocalSkyline;
    }

    /** Post-beat (barlines, repeat counts) skyline in post-beat-group-local x; shifted by {@link postBeatGroupOffset} when unioned. */
    public get postBeatLocalSkyline(): BarLocalSkyline {
        if (!this._postBeatLocalSkyline) {
            this._postBeatLocalSkyline = new BarLocalSkyline(
                0,
                Number.MAX_SAFE_INTEGER,
                this.scoreRenderer.layout!.skylineScratch
            );
        }
        return this._postBeatLocalSkyline;
    }

    /** {@link barLocalSkyline}, or `null` if it was never created because nothing was inserted. */
    public get barLocalSkylineOrNull(): BarLocalSkyline | null {
        return this._barLocalSkyline;
    }

    /** {@link preBeatLocalSkyline}, or `null` if it was never created because nothing was inserted. */
    public get preBeatLocalSkylineOrNull(): BarLocalSkyline | null {
        return this._preBeatLocalSkyline;
    }

    /** {@link postBeatLocalSkyline}, or `null` if it was never created because nothing was inserted. */
    public get postBeatLocalSkylineOrNull(): BarLocalSkyline | null {
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
        this._ties = null;
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

    /** The overflow of the bar content above the staff, without the effect bands. */
    public get contentTopOverflow() {
        return this._contentTopOverflow;
    }

    /** The overflow of the bar content below the staff, without the effect bands. */
    public get contentBottomOverflow() {
        return this._contentBottomOverflow;
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

    /**
     * Whether this renderer paints the rhythm (stems, flags, beams, tuplets) of its beats.
     * When false, no beaming helpers or stem collision slots exist for the bar.
     */
    public get drawsRhythm(): boolean {
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
        this.ties.push(tie);
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

    /**
     * Reports this bar to the layout if the available width is below the minimum width
     * its content needs without overlaps.
     */
    private _reportCompression(containerWidth: number): void {
        const info = this.layoutingInfo;
        if (!info.hasSprings) {
            return;
        }
        // small tolerance for rounding differences in the system width distribution
        const missingWidth = info.minVoiceWidth - containerWidth;
        if (missingWidth > BarRendererBase._compressionTolerance) {
            this.scoreRenderer.layout!.reportCompressedBar(this.bar.masterBar.index, missingWidth);
        }
    }

    public scaleToWidth(width: number): void {
        if (this._hasPositionedOverflow) {
            this._contentTopOverflow = this._positionedTopOverflow;
            this._contentBottomOverflow = this._positionedBottomOverflow;
        } else {
            this._positionedTopOverflow = this._contentTopOverflow;
            this._positionedBottomOverflow = this._contentBottomOverflow;
            this._hasPositionedOverflow = true;
        }
        // effect band heights are the result of the placement in finalizeStaff
        this.topEffects.height = 0;
        this.bottomEffects.height = 0;

        // preBeat and postBeat glyphs do not get resized
        const containerWidth: number = width - this._preBeatGlyphs.width - this._postBeatGlyphs.width;

        // Re-emit scale-dependent segments. pre/postBeatLocalSkyline are
        // owned by calculateOverflows and untouched here.
        this._barLocalSkyline?.reset();

        // Spring-X about to be re-laid-out, so cached BeamingHelperDrawInfo is stale.
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                h.invalidateDrawingInfos();
            }
        }

        this.voiceContainer.scaleToWidth(containerWidth);
        this._reportCompression(containerWidth);

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

        this.topEffects.populateSkyline();
        this.bottomEffects.populateSkyline();

        this.emitSubclassBarLocalSkyline();

        this._registerStaffOverflow();

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
     * header rods and post-beat `max` writes need to run each resize cycle
     * (the broker resets its header rods at the head of every resize).
     */
    private _voiceWalkDone: boolean = false;

    public _registerLayoutingInfo(): void {
        const info: BarLayoutingInfo = this.layoutingInfo;
        // header glyphs (clef, key signature, time signature...) register their
        // columns to be aligned across all staves.
        this._headerProfile!.registerHeaderRods(info);
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

    private _registerOverlayRods(): void {
        const info: BarLayoutingInfo = this.layoutingInfo;
        // all staves of a master bar share the layouting info; bands of different staves never share a row.
        // A row is one side of one staff of the system, a band key one notation element in a row.
        const staff = this.staff!;
        const rowCount = staff.system.allStaves.length * 2;
        this._collectOverlayRods(this.topEffects, info, staff.index * 2, rowCount);
        this._collectOverlayRods(this.bottomEffects, info, staff.index * 2 + 1, rowCount);
    }

    private _collectOverlayRods(
        container: EffectBandContainer,
        info: BarLayoutingInfo,
        row: number,
        rowCount: number
    ): void {
        const bands = container.bands;
        for (let i = 0; i < bands.length; i++) {
            const band = bands[i];
            const policy = band.info.overlayRodPolicy;
            if (policy === undefined) {
                continue;
            }
            const bandKey = band.info.notationElement * rowCount + row;
            const glyphs = band.glyphs;
            for (let j = 0; j < glyphs.length; j++) {
                const glyph = glyphs[j];
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

    public afterReverted() {
        this.staff = undefined;
        this.registerMultiSystemSlurs(null);
        this.isFinalized = false;
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
        if (this._hasMeasuredOverflow) {
            this._contentTopOverflow = this._measuredTopOverflow;
            this._contentBottomOverflow = this._measuredBottomOverflow;
        } else {
            this._measuredTopOverflow = this._contentTopOverflow;
            this._measuredBottomOverflow = this._contentBottomOverflow;
            this._hasMeasuredOverflow = true;
        }
        this._hasPositionedOverflow = false;

        // align the header glyphs with the shared columns of all staves
        this._preBeatGlyphs.width = this.layoutingInfo.preBeatSize;
        // header glyphs moved: re-emit their skyline spans (overflow magnitudes are x-independent)
        this._emitPreBeatOverflows(this.height);

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

    public registerMultiSystemSlurs(startedTies: TieGlyph[] | null) {
        if (startedTies === null) {
            this._multiSystemSlurs = undefined;
            return;
        }

        let ties: ContinuationTieGlyph[] | undefined = undefined;
        for (const g of startedTies) {
            const continuation = new ContinuationTieGlyph(g);
            continuation.renderer = this;
            continuation.tieDirection = g.tieDirection;

            if (!ties) {
                ties = [continuation];
            } else {
                ties.push(continuation);
            }
        }

        this._multiSystemSlurs = ties;
    }

    /** Republish each effect band's cross-renderer chain spans. */
    public finalizeEffectBandSpans(): void {
        this.topEffects.finalizeChainSpans();
        this.bottomEffects.finalizeChainSpans();
    }

    public finalizeOwnedTies(): void {
        if (this._ties) {
            this._emitTies(this._ties);
        }
        if (this._multiSystemSlurs) {
            this._emitTies(this._multiSystemSlurs);
        }
    }

    private _emitTies(ties: Iterable<ITieGlyph>): void {
        for (const t of ties) {
            const tie = t as unknown as Glyph;
            tie.doLayout();

            if (!t.checkForOverflow) {
                continue;
            }

            const tieTop = t.getBoundingBoxTop();
            const tieBottom = t.getBoundingBoxBottom();
            const tieTopOverflow = tieTop < 0 ? -tieTop : 0;

            if (t.hasSkylineShape) {
                this._emitTieShape(t, tieTopOverflow, tieBottom - this.height);
                continue;
            }

            const tieLeftStaff = t.getBoundingBoxLeft();
            const tieRightStaff = t.getBoundingBoxRight();
            this._insertTieSkyline(this.index + 1, tieLeftStaff, tieTop, tieRightStaff, tieBottom);

            const xStart = Math.max(this.x, tieLeftStaff) - this.x;
            const xEnd = Math.min(this.x + this.width, tieRightStaff) - this.x;
            if (xEnd <= xStart) {
                continue;
            }
            const tieBottomOverflow = tieBottom - this.height;
            if (tieTopOverflow > 0) {
                this.registerOverflowRangeTop(xStart, xEnd, tieTopOverflow);
            }
            if (tieBottomOverflow > 0) {
                this.registerOverflowRangeBottom(xStart, xEnd, tieBottomOverflow);
            }
        }
    }

    private _tieShape: SkylineShape | null = null;

    /**
     * The overflow of the tie is registered as a whole on this renderer, the skyline gets the drawn shape
     * in every renderer of the staff it reaches into.
     */
    private _emitTieShape(t: ITieGlyph, topOverflow: number, bottomOverflow: number): void {
        if (topOverflow > 0) {
            this.registerOverflowTop(topOverflow);
        }
        if (bottomOverflow > 0) {
            this.registerOverflowBottom(bottomOverflow);
        }

        let shape = this._tieShape;
        if (shape === null) {
            shape = new SkylineShape();
            this._tieShape = shape;
        } else {
            shape.clear();
        }
        t.collectSkylineShape(shape);
        for (let k = 0; k < shape.count; k++) {
            this._insertTieSkyline(this.index, shape.xStart(k), shape.top(k), shape.xEnd(k), shape.bottom(k));
        }
    }

    /**
     * Inserts the parts of a tie box outside the staff into the skylines of the renderers it reaches,
     * starting at the renderer `fromIndex` of the staff.
     */
    private _insertTieSkyline(fromIndex: number, left: number, top: number, right: number, bottom: number): void {
        const staffRenderers = this.staff!.barRenderers;
        for (let i = fromIndex; i < staffRenderers.length; i++) {
            const target = staffRenderers[i];
            if (target.x >= right) {
                break;
            }
            const xStart = Math.max(target.x, left) - target.x;
            const xEnd = Math.min(target.x + target.width, right) - target.x;
            if (xEnd <= xStart) {
                continue;
            }
            if (top < 0) {
                target.barLocalSkyline.insertPlaced(StaffSide.Top, xStart, xEnd, -top, 0);
            }
            if (bottom > target.height) {
                target.barLocalSkyline.insertPlaced(StaffSide.Bottom, xStart, xEnd, bottom - target.height, 0);
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
        this._contentTopOverflow = 0;
        this._contentBottomOverflow = 0;
        this._hasMeasuredOverflow = false;
        this._hasPositionedOverflow = false;

        this._updateHeaderProfile();
        this.createBeatGlyphs();
        this.createPostBeatGlyphs();

        this._registerLayoutingInfo();
        this._registerOverlayRods();

        this.updateSizes();

        this.computedWidth = this.width;

        this.calculateOverflows(0, this.height);
    }

    protected calculateOverflows(_rendererTop: number, rendererBottom: number) {
        // The pre-beat (header) skyline and overflow depend on the position of the bar and are
        // emitted by applyLayoutingInfo. Post-beat x is not final until scaleToWidth, so the
        // staff-skyline union shifts it later. Both are kept separate from barLocalSkyline (the
        // content surface) so a band can be placed against content-only.
        this._postBeatLocalSkyline?.reset();
        const postBeatGlyphs = this._postBeatGlyphs.glyphs;
        if (postBeatGlyphs) {
            this._emitPostBeatOverflows(postBeatGlyphs, rendererBottom);
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

    private _emitPreBeatOverflows(rendererBottom: number): void {
        this._preBeatLocalSkyline?.reset();
        const profile = this._headerProfile;
        if (!profile) {
            return;
        }
        const info = this.layoutingInfo;
        for (const g of profile.glyphs) {
            const topOver = g.top < 0;
            const bottomOver = g.bottom > rendererBottom;
            if (!topOver && !bottomOver) {
                continue;
            }
            const x = profile.glyphX(g, info);
            if (topOver) {
                this.registerOverflowTop(g.top * -1);
            }
            if (bottomOver) {
                this.registerOverflowBottom(g.bottom - rendererBottom);
            }
            const boxes = g.skylineBoxes;
            if (boxes === null) {
                this._insertPreBeatSkyline(x + g.left, x + g.right, g.top, g.bottom, rendererBottom);
            } else {
                for (let k = 0; k < boxes.length; k += 4) {
                    this._insertPreBeatSkyline(
                        x + boxes[k],
                        x + boxes[k + 1],
                        boxes[k + 2],
                        boxes[k + 3],
                        rendererBottom
                    );
                }
            }
        }
    }

    private _insertPreBeatSkyline(xL: number, xR: number, top: number, bottom: number, rendererBottom: number): void {
        if (!(xR > xL)) {
            return;
        }
        if (top < 0) {
            this.preBeatLocalSkyline.insertPlaced(StaffSide.Top, xL, xR, top * -1, 0);
        }
        if (bottom > rendererBottom) {
            this.preBeatLocalSkyline.insertPlaced(StaffSide.Bottom, xL, xR, bottom - rendererBottom, 0);
        }
    }

    /**
     * Adds the inputs the bar header (start barline, clef, key signature, time signature ...) is
     * created from for the current position: bars with equal keys have the same header geometry.
     * Keys hold inputs rather than the decisions derived from them so that they cannot diverge from
     * {@link createPreBeatGlyphs}. Headers with an invalid key are not shared.
     */
    protected buildHeaderKey(key: HeaderKey): void {
        key.invalidate();
    }

    private _updateHeaderProfile(): void {
        const layout = this.scoreRenderer.layout!;
        const key = layout.headerKey;
        key.reset();
        this.buildHeaderKey(key);
        const profiles = layout.headerProfiles;
        let byLow: Map<number, HeaderProfile> | null = null;
        let profile: HeaderProfile | null = null;
        if (key.isValid && profiles.has(key.high)) {
            byLow = profiles.get(key.high)!;
            if (byLow.has(key.low)) {
                profile = byLow.get(key.low)!;
            }
        }
        const group = this._preBeatGlyphs;
        if (profile) {
            this.wasFirstOfStaff = this.isFirstOfStaff;
            if (profile !== this._headerProfile) {
                group.glyphs = null;
            }
        } else {
            const high = key.high;
            const low = key.low;
            const isValid = key.isValid;
            group.width = 0;
            group.glyphs = null;
            this.createPreBeatGlyphs();
            profile = HeaderProfile.measure(group);
            if (isValid) {
                if (!byLow) {
                    byLow = new Map<number, HeaderProfile>();
                    profiles.set(high, byLow);
                }
                byLow.set(low, profile);
            }
        }
        group.width = profile.naturalWidth;
        this._headerProfile = profile;
        this._headerInFirstSystem = this.staff!.system.index === 0;
    }

    private _paintHeader(cx: number, cy: number, canvas: ICanvas): void {
        const group = this._preBeatGlyphs;
        if (!group.glyphs) {
            const width = group.width;
            group.width = 0;
            this.createPreBeatGlyphs();
            group.width = width;
        }
        group.applyHeaderRod(this.layoutingInfo);
        group.paint(cx, cy, canvas);
    }

    /** Emit per-glyph overflow into {@link postBeatLocalSkyline}. */
    private _emitPostBeatOverflows(glyphs: Glyph[], rendererBottom: number): void {
        for (const g of glyphs) {
            const topY = g.getBoundingBoxTop();
            const bottomY = g.getBoundingBoxBottom();
            const topOver = topY < 0;
            const bottomOver = bottomY > rendererBottom;
            if (!topOver && !bottomOver) {
                continue;
            }
            if (topOver) {
                this.registerOverflowTop(topY * -1);
            }
            if (bottomOver) {
                this.registerOverflowBottom(bottomY - rendererBottom);
            }
            BarRendererBase._insertGlyphSkyline(g, 0, this.postBeatLocalSkyline, rendererBottom);
        }
    }

    /**
     * Inserts the extent of the glyph outside the staff into the skyline: per child for glyph groups
     * (e.g. the accidentals of a key signature), so the group does not claim its full height over its full width.
     */
    private static _insertGlyphSkyline(
        g: Glyph,
        offsetX: number,
        skyline: BarLocalSkyline,
        rendererBottom: number
    ): void {
        if (g instanceof GlyphGroup && g.glyphs && g.glyphs.length > 0) {
            for (const c of g.glyphs) {
                BarRendererBase._insertGlyphSkyline(c, offsetX + g.x, skyline, rendererBottom);
            }
            return;
        }
        const xL = offsetX + g.getBoundingBoxLeft();
        const xR = offsetX + g.getBoundingBoxRight();
        if (!(xR > xL)) {
            return;
        }
        const topY = g.getBoundingBoxTop();
        if (topY < 0) {
            skyline.insertPlaced(StaffSide.Top, xL, xR, topY * -1, 0);
        }
        const bottomY = g.getBoundingBoxBottom();
        if (bottomY > rendererBottom) {
            skyline.insertPlaced(StaffSide.Bottom, xL, xR, bottomY - rendererBottom, 0);
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

    /**
     * Paints the staff lines of `renderers[from..to)`, the bars of this renderer's staff painted next.
     * Called on the first of them, before any of them paints its content.
     */
    public paintStaffLines(
        _cx: number,
        _cy: number,
        _canvas: ICanvas,
        _renderers: BarRendererBase[],
        _from: number,
        _to: number
    ): void {
        // no staff lines
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

    /**
     * Paints the effects of this bar which reach left of its start, onto a canvas holding only the bars before it.
     */
    public paintLeftOverhang(cx: number, cy: number, canvas: ICanvas): void {
        const topEffectBandY = cy + this.y - this.staff!.topOverflow;
        this.topEffects.paintLeftOverhang(cx + this.x, topEffectBandY, canvas);

        const bottomEffectBandY = cy + this.y + this.height + this.staff!.bottomOverflow - this.bottomEffects.height;
        this.bottomEffects.paintLeftOverhang(cx + this.x, bottomEffectBandY, canvas);
    }

    protected paintContent(cx: number, cy: number, canvas: ICanvas): void {
        this.paintBackground(cx, cy, canvas);

        canvas.color = this.resources.mainGlyphColor;
        this._paintHeader(cx + this.x, cy + this.y, canvas);
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
            const previousColor = ElementStyleHelper.applyVoice(canvas, VoiceSubElement.Glyphs, slur.voice, true);
            try {
                slur.paint(cx, cy, canvas);
            } finally {
                ElementStyleHelper.restore(canvas, previousColor);
            }
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

    public buildBoundingsLookup(writer: IBoundsLookupWriter, cx: number, cy: number): void {
        const scale = this.settings.display.scale;
        const x = cx + this.x;
        const y = cy + this.y;
        writer.addBar(this.bar, x * scale, y * scale, this.width * scale, this.height * scale);
        this.voiceContainer.buildBoundingsLookup(writer, x, y);
        writer.endBar();
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
            this.topEffects.createVoiceGlyphs(this.bar.voices[0], true);
            this.bottomEffects.createVoiceGlyphs(this.bar.voices[0], true);
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
        this.topEffects.createVoiceGlyphs(voice, false);
        this.bottomEffects.createVoiceGlyphs(voice, false);
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

        this._refreshHeaderForPosition();

        // Must always re-register: the broker resets its header rods at the head of every resize cycle.
        // Overlay rods and content overflows are bar-local: they only feed the broker's `finish` and
        // the measured overflow snapshot, both taken after doLayout.
        this._registerLayoutingInfo();
    }

    // the header depends on the position: first in the staff and, for first-system-only
    // elements, the first system
    private _refreshHeaderForPosition(): void {
        if (
            this.wasFirstOfStaff !== this.isFirstOfStaff ||
            this._headerInFirstSystem !== (this.staff!.system.index === 0)
        ) {
            this.recreatePreBeatGlyphs();
        }
    }

    /**
     * Registers the header columns of the bar for its current {@link staff} and {@link index}
     * without laying it out again.
     */
    public registerHeaderForPosition(): void {
        this._refreshHeaderForPosition();
        this._headerProfile!.registerHeaderRods(this.layoutingInfo);
    }

    protected recreatePreBeatGlyphs() {
        this._updateHeaderProfile();
    }

    protected paintSimileMark(cx: number, cy: number, canvas: ICanvas): void {
        const previousColor = ElementStyleHelper.applyVoice(canvas, VoiceSubElement.Glyphs, this.bar.voices[0], true);
        try {
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
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }

    public completeBeamingHelper(_helper: BeamingHelper) {
        // nothing by default
    }
}
