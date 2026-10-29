import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Profiler } from '@coderline/alphatab/profiling/Profiler';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import {
    type BarRendererFactory,
    type EffectBandInfo,
    EffectBandMode
} from '@coderline/alphatab/rendering/BarRendererFactory';
import { ActiveEffectBand } from '@coderline/alphatab/rendering/EffectBandContainer';
import { SlurRegistry } from '@coderline/alphatab/rendering/layout/SlurRegistry';
import { BarLocalSkyline } from '@coderline/alphatab/rendering/skyline/BarLocalSkyline';
import { StaffSystemSkyline } from '@coderline/alphatab/rendering/skyline/StaffSystemSkyline';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import {
    type IStaffDisplayContext,
    StaffDisplayResolver
} from '@coderline/alphatab/rendering/staves/StaffDisplayResolver';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import type { StaffTrackGroup } from '@coderline/alphatab/rendering/staves/StaffTrackGroup';

/**
 * A Staff represents a single line within a StaffSystem.
 * It stores BarRenderer instances created from a given factory.
 * @internal
 */
export class RenderStaff implements IStaffDisplayContext {
    private _factory: BarRendererFactory;
    private _sharedLayoutData: Map<string, unknown> = new Map();

    public staffTrackGroup!: StaffTrackGroup;
    public system!: StaffSystem;
    public barRenderers: BarRendererBase[] = [];
    public x: number = 0;
    public y: number = 0;
    public height: number = 0;
    public index: number = 0;
    public staffIndex: number = 0;

    public isVisible = false;
    private _emptyBarCount = 0;

    public get isFirstInSystem() {
        return this.system.firstVisibleStaff === this;
    }

    public topEffectInfos: EffectBandInfo[] = [];
    public bottomEffectInfos: EffectBandInfo[] = [];
    private _activeTopEffects: ActiveEffectBand[] | null = null;
    private _activeBottomEffects: ActiveEffectBand[] | null = null;

    /** The effects of {@link topEffectInfos} that can create glyphs on this staff. */
    public get activeTopEffects(): ActiveEffectBand[] {
        let active = this._activeTopEffects;
        if (active === null) {
            active = this._activeEffects(this.topEffectInfos, this.index * 2);
            this._activeTopEffects = active;
        }
        return active;
    }

    /** The effects of {@link bottomEffectInfos} that can create glyphs on this staff. */
    public get activeBottomEffects(): ActiveEffectBand[] {
        let active = this._activeBottomEffects;
        if (active === null) {
            active = this._activeEffects(this.bottomEffectInfos, this.index * 2 + 1);
            this._activeBottomEffects = active;
        }
        return active;
    }

    private _activeEffects(infos: EffectBandInfo[], key: number): ActiveEffectBand[] {
        const shared = this.system.layout.activeEffects;
        const existing = shared.get(key);
        if (existing !== undefined) {
            return existing;
        }
        const notation = this.system.layout.renderer.settings.notation;
        const active: ActiveEffectBand[] = [];
        for (let i = 0; i < infos.length; i++) {
            const effect = infos[i].effect;
            if (
                notation.isNotationElementVisible(effect.notationElement) &&
                (!effect.hideOnMultiTrack || this.trackIndex === 0)
            ) {
                // fallback order: the declaration index in the staff's infos
                active.push(new ActiveEffectBand(effect, infos[i].order ?? i));
            }
        }
        shared.set(key, active);
        return active;
    }

    /**
     * This is the index of the track being rendered. This is not the index of the track within the model,
     * but the n-th track being rendered. It is the index of the {@link ScoreRenderer.tracks} array defining
     * which tracks should be rendered.
     * For single-track rendering this will always be zero.
     */
    public trackIndex: number = 0;
    public modelStaff: Staff;

    public get staffId(): string {
        return this._factory.staffId;
    }

    private _slurRegistryKey: string | null = null;

    /** The key of this staff in the {@link SlurRegistry}. */
    public get slurRegistryKey(): string {
        let key = this._slurRegistryKey;
        if (key === null) {
            // built outside: `System.*` in generated C# would resolve to this class's `system` member
            key = SlurRegistry.staffKey(this);
            this._slurRegistryKey = key;
        }
        return key;
    }

    public get cascadePriority(): number {
        return this._factory.cascadePriority;
    }

    private _isCascadePrimary: boolean = false;
    private _isCascadePrimaryComputed: boolean = false;
    public get isCascadePrimary(): boolean {
        if (!this._isCascadePrimaryComputed) {
            this._isCascadePrimary = StaffDisplayResolver.computeCascadePrimary(this);
            this._isCascadePrimaryComputed = true;
        }
        return this._isCascadePrimary;
    }

    public get systemIndex(): number {
        return this.system.index;
    }

    public get cascadeSiblings(): Iterable<IStaffDisplayContext> {
        return this.staffTrackGroup.staves;
    }

    /**
     * This is the visual offset from top where the
     * Staff contents actually start. Used for grouping
     * using a accolade
     */
    public staffTop: number = 0;

    public topPadding: number = 0;
    public bottomPadding: number = 0;

    /**
     * This is the visual offset from top where the
     * Staff contents actually ends. Used for grouping
     * using a accolade
     */
    public staffBottom: number = 0;

    public get contentTop() {
        return this.y + this.staffTop + this.topPadding + this.topOverflow;
    }

    public get contentBottom() {
        return this.y + this.topPadding + this.topOverflow + this.staffBottom;
    }

    public constructor(system: StaffSystem, trackIndex: number, staff: Staff, factory: BarRendererFactory) {
        this._factory = factory;
        this.trackIndex = trackIndex;
        this.modelStaff = staff;
        this.system = system;
        for (const b of factory.effectBands) {
            if (b.shouldCreate && !b.shouldCreate!(staff)) {
                continue;
            }

            switch (b.mode) {
                case EffectBandMode.OwnedTop:
                case EffectBandMode.SharedTop:
                    this.topEffectInfos.push(b);
                    break;

                case EffectBandMode.OwnedBottom:
                case EffectBandMode.SharedBottom:
                    this.bottomEffectInfos.push(b);
                    break;
            }
        }

        this._updateVisibility();
    }

    /**
     * Prepares the staff to be filled with bars again; the effect band setup is kept.
     */
    public reset(): void {
        this._sharedLayoutData.clear();
        this.barRenderers.splice(0, this.barRenderers.length);
        this.x = 0;
        this.y = 0;
        this.height = 0;
        this.staffTop = 0;
        this.staffBottom = 0;
        this.topPadding = 0;
        this.bottomPadding = 0;
        this.topOverflow = 0;
        this.bottomOverflow = 0;
        this._emptyBarCount = 0;
        if (this._systemSkyline) {
            this._systemSkyline.reset();
        }
        this._updateVisibility();
    }

    public getSharedLayoutData<T>(key: string, def: T): T {
        if (this._sharedLayoutData.has(key)) {
            return this._sharedLayoutData.get(key) as T;
        }
        return def;
    }

    public setSharedLayoutData<T>(key: string, def: T): void {
        this._sharedLayoutData.set(key, def);
    }

    public registerStaffTop(offset: number): void {
        if (offset > this.staffTop) {
            this.staffTop = offset;
        }
    }

    public registerStaffBottom(offset: number): void {
        if (offset > this.staffBottom) {
            this.staffBottom = offset;
        }
    }

    public addBarRenderer(renderer: BarRendererBase): void {
        renderer.staff = this;
        renderer.index = this.barRenderers.length;
        renderer.reLayout();
        this.barRenderers.push(renderer);
        this.system.layout.registerBarRenderer(this.staffId, renderer);
        if (renderer.bar.isEmpty || renderer.bar.isRestOnly) {
            this._emptyBarCount++;
        }
        this._updateVisibility();
    }

    private _updateVisibility() {
        const stylesheet = this.modelStaff.track.score.stylesheet;
        const canHideEmptyStaves =
            stylesheet.hideEmptyStaves && (stylesheet.hideEmptyStavesInFirstSystem || this.system.index > 0);
        if (canHideEmptyStaves) {
            this.isVisible = this._emptyBarCount < this.barRenderers.length;
        } else {
            this.isVisible = true;
        }
    }

    /**
     * Creates and lays out the renderer of the bar as if it were the next bar of this staff,
     * without adding it.
     */
    public createBarRenderer(
        bar: Bar,
        layoutingInfo: BarLayoutingInfo,
        additionalMultiBarsRestBars: Bar[] | null
    ): BarRendererBase {
        const renderer = this._factory.create(this.system.layout.renderer, bar);

        renderer.topEffects.infos = this.activeTopEffects;
        renderer.bottomEffects.infos = this.activeBottomEffects;

        renderer.additionalMultiRestBars = additionalMultiBarsRestBars;
        renderer.staff = this;
        renderer.index = this.barRenderers.length;
        renderer.layoutingInfo = layoutingInfo;
        renderer.doLayout();
        this.system.layout.registerBarRenderer(this.staffId, renderer);
        return renderer;
    }

    public addBar(bar: Bar, layoutingInfo: BarLayoutingInfo, additionalMultiBarsRestBars: Bar[] | null): void {
        const renderer = this._factory.create(this.system.layout.renderer, bar);

        renderer.topEffects.infos = this.activeTopEffects;
        renderer.bottomEffects.infos = this.activeBottomEffects;

        renderer.additionalMultiRestBars = additionalMultiBarsRestBars;
        renderer.staff = this;
        renderer.index = this.barRenderers.length;
        renderer.layoutingInfo = layoutingInfo;
        renderer.doLayout();

        this.barRenderers.push(renderer);
        this.system.layout.registerBarRenderer(this.staffId, renderer);
        if (bar.isEmpty || bar.isRestOnly) {
            this._emptyBarCount++;
        }
        this._updateVisibility();
    }

    public revertLastBar(): BarRendererBase {
        this.resetSharedLayoutData();

        const lastBar: BarRendererBase = this.barRenderers[this.barRenderers.length - 1];
        this.barRenderers.splice(this.barRenderers.length - 1, 1);
        this.topOverflow = 0;
        this.bottomOverflow = 0;
        for (const r of this.barRenderers) {
            r.afterStaffBarReverted();
        }

        if (lastBar.bar.isEmpty || lastBar.bar.isRestOnly) {
            this._emptyBarCount--;
        }
        this._updateVisibility();

        return lastBar;
    }

    public resetSharedLayoutData() {
        this._sharedLayoutData.clear();
    }

    public resetOverflows() {
        this.topOverflow = 0;
        this.bottomOverflow = 0;
    }

    public topOverflow = 0;
    public registerOverflowTop(overflow: number) {
        if (overflow > this.topOverflow) {
            this.topOverflow = overflow;
        }
    }

    public bottomOverflow = 0;
    public registerOverflowBottom(overflow: number) {
        if (overflow > this.bottomOverflow) {
            this.bottomOverflow = overflow;
        }
    }

    private _systemSkyline: StaffSystemSkyline | null = null;

    /**
     * Full placement surface of the finalized staff: content (notes/beams/ties) + the structural bar
     * header (clef/key/time via each renderer's pre/post-beat skylines) + the placed effect bands.
     */
    public get systemSkyline(): StaffSystemSkyline {
        if (!this._systemSkyline) {
            const scratch = this.system.layout.renderer.layout!.skylineScratch;
            this._systemSkyline = new StaffSystemSkyline(
                this.staffIndex,
                this.system.index,
                0,
                Number.MAX_SAFE_INTEGER,
                scratch
            );
        }
        return this._systemSkyline;
    }

    private _placesAgainstContentOnly: boolean | null = null;

    /**
     * True if any effect band on this staff ignores the structural header (needs
     * {@link import('@coderline/alphatab/rendering/EffectSystemPlacement').EffectSystemPlacement.contentSkyline}).
     */
    public get placesAgainstContentOnly(): boolean {
        if (this._placesAgainstContentOnly === null) {
            let found = false;
            for (const i of this.topEffectInfos) {
                if (i.effect.ignoresStructuralHeader) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                for (const i of this.bottomEffectInfos) {
                    if (i.effect.ignoresStructuralHeader) {
                        found = true;
                        break;
                    }
                }
            }
            this._placesAgainstContentOnly = found;
        }
        // explicit comparison: the cached value is nullable (bool? on C#)
        return this._placesAgainstContentOnly === true;
    }

    private static _unionBarLocalIntoStaffSkyline(
        renderer: BarRendererBase,
        sky: StaffSystemSkyline,
        content: StaffSystemSkyline | null
    ): void {
        const bar = renderer.barLocalSkylineOrNull;
        const pre = renderer.preBeatLocalSkylineOrNull;
        const post = renderer.postBeatLocalSkylineOrNull;
        if (!bar && !pre && !post) {
            return;
        }
        const baseX = renderer.x;
        const empty = BarLocalSkyline.empty;
        const barSky = bar ?? empty;
        const preSky = pre ?? empty;
        const postSky = post ?? empty;
        // Post-beat segments live in post-beat-group-local coords; shift by the
        // group's final x (settled by scaleToWidth) before unioning.
        const postBaseX = baseX + renderer.postBeatGroupOffset;

        // Full surface = content (bar) + structural header (pre/post).
        sky.upSky.unionShifted3(barSky.upSky, baseX, preSky.upSky, baseX, postSky.upSky, postBaseX);
        sky.downSky.unionShifted3(barSky.downSky, baseX, preSky.downSky, baseX, postSky.downSky, postBaseX);

        // Content-only surface = bar content, header excluded by construction.
        if (bar && content !== null) {
            content.upSky.unionShifted(bar.upSky, baseX);
            content.downSky.unionShifted(bar.downSky, baseX);
        }
    }

    /**
     * Performs an early calculation of the expected staff height for the size calculation in the
     * accolade (e.g. for braces). This typically happens after the first bar renderers were created
     * and we can do an early placement of the render staffs.
     */
    public calculateHeightForAccolade() {
        this._applyStaffPaddings();

        this.height = this.barRenderers.length > 0 ? this.barRenderers[0].height : 0;

        if (this.height > 0) {
            this.height += Math.ceil(this.topPadding + this.topOverflow + this.bottomOverflow + this.bottomPadding);
        }
    }

    private _applyStaffPaddings() {
        const isFirst = this.index === 0;
        const isLast = this.index === this.system.staves.length - 1;
        const settings = this.system.layout.renderer.settings.display;
        this.topPadding = isFirst ? settings.firstNotationStaffPaddingTop : settings.notationStaffPaddingTop;
        this.bottomPadding = isLast ? settings.lastNotationStaffPaddingBottom : settings.notationStaffPaddingBottom;
    }

    public finalizeStaff(): void {
        Profiler.begin('layout.finalizeStaff');
        this._applyStaffPaddings();

        this.height = 0;

        const placement = this.system.layout.effectPlacement;
        const sky = placement.systemSkyline;
        sky.reset();
        const content = this.placesAgainstContentOnly ? placement.contentSkyline : null;
        if (content !== null) {
            content.reset();
        }

        // Only renderer 0 ever yields continuations; hoist out of the per-renderer loop.
        if (this.barRenderers.length > 0) {
            this.barRenderers[0].registerMultiSystemSlurs(
                this.system.layout!.slurRegistry.getAllContinuations(this.barRenderers[0])
            );
        }

        for (const renderer of this.barRenderers) {
            renderer.finalizeOwnedTies();
            renderer.finalizeEffectBandSpans();

            if (renderer.height > this.height) {
                this.height = renderer.height;
            }
            RenderStaff._unionBarLocalIntoStaffSkyline(renderer, sky, content);
        }

        placement.placeAndApply(this);
        this.systemSkyline.copyFrom(sky);

        if (this.height > 0) {
            this.height += this.topPadding + this.topOverflow + this.bottomOverflow + this.bottomPadding;
        }

        this.height = Math.ceil(this.height);

        this._updateVisibility();
        Profiler.end('layout.finalizeStaff');
    }

    public paint(cx: number, cy: number, canvas: ICanvas, startIndex: number, count: number): void {
        if (this.height === 0 || count === 0) {
            return;
        }

        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.system.width - this.x, this.height);

        const end = Math.min(startIndex + count, this.barRenderers.length);
        if (startIndex >= end) {
            return;
        }

        const x = cx + this.x;
        const y = cy + this.y;
        this.barRenderers[startIndex].paintStaffLines(x, y, canvas, this.barRenderers, startIndex, end);
        for (let i: number = startIndex; i < end; i++) {
            this.barRenderers[i].paint(x, y, canvas);
        }
    }
}
