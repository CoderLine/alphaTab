import type { EventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import { Logger } from '@coderline/alphatab/Logger';
import { ScoreSubElement } from '@coderline/alphatab/model/Score';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { type ICanvas, TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import type { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import type { RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import { ScoreLayout } from '@coderline/alphatab/rendering/layout/ScoreLayout';
import { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import type { MasterBarsRenderers } from '@coderline/alphatab/rendering/staves/MasterBarsRenderers';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';

/**
 * How the fill loop chose the bars of a pooled system: the system holds the measured master bars
 * `[firstIndex, endIndex)` for every available width in `[minWidth, breakWidth)`.
 * @internal
 */
class SystemFill {
    public isValid: boolean = false;
    public firstIndex: number = 0;
    public endIndex: number = 0;
    public barsPerSystem: number = 0;
    /** The largest width a bar addition required to fit. */
    public minWidth: number = 0;
    /** The width the rejected next bar required, infinite when the end did not depend on the width. */
    public breakWidth: number = 0;

    public holdsBarsFor(maxWidth: number): boolean {
        return this.isValid && this.minWidth <= maxWidth && maxWidth < this.breakWidth;
    }
}

/**
 * Base layout for page and parchment style layouts where we have an endless
 * vertical page with fitted systems.
 * @internal
 */
export abstract class VerticalLayoutBase extends ScoreLayout {
    private _systems: StaffSystem[] = [];
    // the systems created since the last full layout by index, refilled by later resizes
    private _systemPool: StaffSystem[] = [];
    // how the bars of the pooled system at the same index were chosen
    private _systemFills: SystemFill[] = [];
    private _previousSystemCount: number = 0;
    // the measured master bars in order; systems are built from them
    private _allMasterBarRenderers: MasterBarsRenderers[] = [];

    public override get systems(): StaffSystem[] {
        return this._systems;
    }

    protected override getAttributionRendererIndex(system: StaffSystem): number {
        return system.index === 0 ? system.masterBarsRenderers.length - 1 : -1;
    }

    private _reuseViewPort: boolean = false;

    private _preSystemPartialIds: string[] = [];
    private _systemPartialIds: string[] = [];

    protected doLayoutAndRender(renderHints: RenderHints | undefined): void {
        let y: number = this.pagePadding![1];
        this.width = this.renderer.width;
        this._allMasterBarRenderers = [];
        this._preSystemPartialIds = [];
        this._systemPartialIds = [];

        this._reuseViewPort = renderHints?.reuseViewport ?? false;
        this._systems = [];
        this._systemPool = [];
        this._systemFills = [];

        //
        // 1. Score Info
        y = this._layoutAndRenderScoreInfo(y, -1);
        //
        // 2. Tunings
        y = this._layoutAndRenderTunings(y, -1);
        //
        // 3. Chord Diagrms
        y = this._layoutAndRenderChordDiagrams(y, -1);
        //
        // 4. One result per StaffSystem
        y = this._layoutAndRenderSystems(y, 0, -1);

        y = this.layoutAndRenderBottomScoreInfo(y);

        this.height = (y + this.pagePadding![3]) * this.renderer.settings.display.scale;
    }

    protected override registerPartial(args: RenderFinishedEventArgs, callback: (canvas: ICanvas) => void): void {
        args.reuseViewport = this._reuseViewPort;
        super.registerPartial(args, callback);
    }

    protected reregisterPartial(id: string) {
        const args = this.getExistingPartialArgs(id);
        if (!args) {
            return;
        }
        args.reuseViewport = this._reuseViewPort;
        (this.renderer.partialLayoutFinished as EventEmitterOfT<RenderFinishedEventArgs>).trigger(args);
    }

    public get supportsResize(): boolean {
        return true;
    }

    public get firstBarX(): number {
        let x = this.pagePadding![0];
        if (this._systems.length > 0) {
            x += this._systems[0].accoladeWidth;
        }
        return x;
    }

    public override doUpdateForBars(renderHints: RenderHints): boolean {
        this._reuseViewPort = renderHints.reuseViewport ?? false;
        const firstModifiedMasterBar = renderHints.firstChangedMasterBar!;

        // first update existing systems as needed
        const systemIndex = this._systems.findIndex(s => {
            const first = s.masterBarsRenderers[0].masterBar.index;
            const last = s.masterBarsRenderers[s.masterBarsRenderers.length - 1].masterBar.index;
            return first <= firstModifiedMasterBar && firstModifiedMasterBar <= last;
        });

        if (systemIndex === -1 || !this.renderer.settings.core.enableLazyLoading) {
            return false;
        }

        // Bars from the start of the re-layouted system onward will be re-registered during the
        // paint pass. Clear their old entries from the preserved bounds so registration
        // produces a clean, complete lookup after this render finishes.
        const firstRebuiltBarIndex = this._systems[systemIndex].masterBarsRenderers[0].masterBar.index;
        this.renderer.boundsWriter.clearFromMasterBar(firstRebuiltBarIndex);

        // for now we do a full relayout from the first modified masterbar
        // there is a lot of room for even more performant updates, but they come
        // at a risk that features break.
        // e.g. we could only shift systems where the content didn't change,
        // but we might still have ties/slurs which have to be updated.
        const removeSystems = this._systems.splice(systemIndex, this._systems.length - systemIndex);
        // the removed systems are not refilled: the renderers of their bars stay reachable through the
        // bar renderer lookup (and ties caching them) until the bars are measured again
        this._systemPool.splice(systemIndex, this._systemPool.length - systemIndex);
        this._systemFills.splice(systemIndex, this._systemFills.length - systemIndex);
        // the partials would keep the removed systems alive
        for (let i = systemIndex; i < this._systemPartialIds.length; i++) {
            this.unregisterPartial(this._systemPartialIds[i]);
        }
        this._systemPartialIds.splice(systemIndex, this._systemPartialIds.length - systemIndex);
        const system = removeSystems[0];
        let y = system.y;
        const firstUnit = this._allMasterBarRenderers.indexOf(system.masterBarsRenderers[0]);
        this._allMasterBarRenderers.splice(firstUnit, this._allMasterBarRenderers.length - firstUnit);

        // signal all partials which didn't change
        for (const preSystemPartial of this._preSystemPartialIds) {
            this.reregisterPartial(preSystemPartial);
        }
        for (let i = 0; i < systemIndex; i++) {
            this.reregisterPartial(this._systemPartialIds[i]);
        }

        // new partials for all other prats
        y = this._layoutAndRenderSystems(y, firstUnit, -1);

        y = this.layoutAndRenderBottomScoreInfo(y);

        this.height = (y + this.pagePadding![3]) * this.renderer.settings.display.scale;

        return true;
    }

    public doResize(): void {
        let y: number = this.pagePadding![1];
        this.width = this.renderer.width;
        const oldHeight: number = this.height;
        this._reuseViewPort = true;

        //
        // 1. Score Info
        y = this._layoutAndRenderScoreInfo(y, oldHeight);
        //
        // 2. Tunings
        y = this._layoutAndRenderTunings(y, oldHeight);
        //
        // 3. Chord Digrams
        y = this._layoutAndRenderChordDiagrams(y, oldHeight);
        //
        // 4. One result per StaffSystem
        y = this._resizeAndRenderScore(y, oldHeight);

        y = this.layoutAndRenderBottomScoreInfo(y);

        this.height = (y + this.pagePadding![3]) * this.renderer.settings.display.scale;
    }

    private _layoutAndRenderTunings(y: number, totalHeight: number = -1): number {
        if (!this.tuningGlyph) {
            return y;
        }

        const res: RenderingResources = this.renderer.settings.display.resources;
        this.tuningGlyph.x = this.pagePadding![0];
        this.tuningGlyph.width = this.scaledWidth - this.pagePadding![0] - this.pagePadding![2];
        this.tuningGlyph.doLayout();

        const tuningHeight = Math.round(this.tuningGlyph.height);

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;
        e.width = this.scaledWidth;
        e.height = tuningHeight;
        e.totalWidth = this.scaledWidth;
        e.totalHeight = totalHeight < 0 ? y + e.height : totalHeight;

        this.registerPartial(e, (canvas: ICanvas) => {
            canvas.color = res.scoreInfoColor;
            canvas.textAlign = TextAlign.Center;
            this.tuningGlyph!.paint(0, 0, canvas);
        });
        this._preSystemPartialIds.push(e.id);

        return y + tuningHeight;
    }

    private _layoutAndRenderChordDiagrams(y: number, totalHeight: number = -1): number {
        if (!this.chordDiagrams) {
            return y;
        }
        const res: RenderingResources = this.renderer.settings.display.resources;
        this.chordDiagrams.x = this.pagePadding![0];
        this.chordDiagrams.width = this.scaledWidth - this.pagePadding![0] - this.pagePadding![2];
        this.chordDiagrams.doLayout();

        const diagramHeight = Math.round(this.chordDiagrams.height);

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;
        e.width = this.scaledWidth;
        e.height = diagramHeight;
        e.totalWidth = this.scaledWidth;
        e.totalHeight = totalHeight < 0 ? y + diagramHeight : totalHeight;

        this.registerPartial(e, (canvas: ICanvas) => {
            canvas.color = res.scoreInfoColor;
            canvas.textAlign = TextAlign.Center;
            this.chordDiagrams!.paint(0, 0, canvas);
        });
        this._preSystemPartialIds.push(e.id);

        return y + diagramHeight;
    }

    private _layoutAndRenderScoreInfo(y: number, totalHeight: number = -1): number {
        Logger.debug(this.name, 'Layouting score info');

        const e = new RenderFinishedEventArgs();
        e.x = 0;
        e.y = y;

        let infoHeight = 0;

        const res: RenderingResources = this.renderer.settings.display.resources;

        const scoreInfoGlyphs: TextGlyph[] = [];

        for (const [scoreElement, _notationElement] of ScoreLayout.headerElements.value) {
            if (this.headerGlyphs.has(scoreElement)) {
                const glyph: TextGlyph = this.headerGlyphs.get(scoreElement)!;
                glyph.y = infoHeight;
                this.alignScoreInfoGlyph(glyph);

                let lineHeight = glyph.font.size;

                // words and music on same line if not aligned on same side
                if (scoreElement === ScoreSubElement.Words) {
                    if (this.headerGlyphs.has(ScoreSubElement.Music)) {
                        const musicGlyph = this.headerGlyphs.get(ScoreSubElement.Music)!;
                        if (musicGlyph.textAlign !== glyph.textAlign) {
                            lineHeight = 0;
                        }
                    }
                }

                infoHeight += lineHeight;

                scoreInfoGlyphs.push(glyph);
            }
        }

        if (scoreInfoGlyphs.length > 0) {
            infoHeight = Math.floor(infoHeight + 17);
            e.width = this.scaledWidth;
            e.height = infoHeight;
            e.totalWidth = this.scaledWidth;
            e.totalHeight = totalHeight < 0 ? y + e.height : totalHeight;
            this.registerPartial(e, (canvas: ICanvas) => {
                canvas.color = res.scoreInfoColor;
                canvas.textAlign = TextAlign.Center;
                for (const g of scoreInfoGlyphs) {
                    g.paint(0, 0, canvas);
                }
            });
            this._preSystemPartialIds.push(e.id);
        }

        return y + infoHeight;
    }

    private _resizeAndRenderScore(y: number, oldHeight: number): number {
        // if we have a fixed number of bars per row, we only need to refit them.
        const barsPerRowActive = this.getBarsPerSystem(0) > 0;
        this._systemPartialIds = [];
        if (barsPerRowActive) {
            for (let i: number = 0; i < this._systems.length; i++) {
                const system: StaffSystem = this._systems[i];
                system.width = system.computedWidth;
                this._fitSystem(system);
                y += this._paintSystem(system, oldHeight);
            }
        } else {
            // the bars are detached from their systems, except the ones of systems which may keep
            // them at the new width (detached when the system is filled again)
            const maxWidth = this._maxWidth;
            const pool = this._systemPool;
            const fills = this._systemFills;
            const all = this._allMasterBarRenderers;
            for (let i = 0; i < all.length; i++) {
                const renderers = all[i].renderers;
                for (let j = 0; j < renderers.length; j++) {
                    const r = renderers[j];
                    const staff = r.staff;
                    if (staff) {
                        const systemIndex = staff.system.index;
                        if (
                            systemIndex < pool.length &&
                            pool[systemIndex] === staff.system &&
                            fills[systemIndex].holdsBarsFor(maxWidth)
                        ) {
                            continue;
                        }
                    }
                    r.afterReverted();
                }
            }
            this._systems = [];
            y = this._layoutAndRenderSystems(y, 0, oldHeight);
        }
        return y;
    }

    /**
     * The measured master bar at the given position, measuring the next bar of the score as the
     * next bar of the given system when needed. `null` after the last bar.
     */
    private _masterBarsAt(index: number, system: StaffSystem): MasterBarsRenderers | null {
        const all = this._allMasterBarRenderers;
        if (index < all.length) {
            return all[index];
        }
        const barIndex = all.length === 0 ? this.firstBarIndex : all[all.length - 1].lastMasterBarIndex + 1;
        if (barIndex > this.lastBarIndex) {
            return null;
        }
        const multiBarRestInfo = this.multiBarRestInfo;
        const additionalMultiBarsRestBarIndices: number[] | null =
            multiBarRestInfo !== null && multiBarRestInfo.has(barIndex) ? multiBarRestInfo.get(barIndex)! : null;
        const renderers = system.measureBars(this.renderer.tracks!, barIndex, additionalMultiBarsRestBarIndices);
        all.push(renderers);
        return renderers;
    }

    /**
     * Fills, fits and paints systems with the measured master bars from the given position on.
     * A master bar is only added to a system after its width at that position was found to fit,
     * so no bar is ever removed again.
     * @param totalHeight The total height reported with the partials, -1 for the running height.
     */
    private _layoutAndRenderSystems(y: number, firstIndex: number, totalHeight: number): number {
        const tracks = this.renderer.tracks!;
        const maxWidth = this._maxWidth;
        const pool = this._systemPool;
        const fills = this._systemFills;
        let index = firstIndex;
        while (true) {
            const systemIndex = this._systems.length;
            const barsPerSystem = this.getBarsPerSystem(systemIndex);
            let system: StaffSystem;
            let fill: SystemFill;
            if (systemIndex < pool.length) {
                system = pool[systemIndex];
                fill = fills[systemIndex];
                if (
                    fill.holdsBarsFor(maxWidth) &&
                    fill.firstIndex === index &&
                    fill.barsPerSystem === barsPerSystem &&
                    system.reattachBars()
                ) {
                    // the fill loop would add the same bars again
                    system.prepareRefit();
                    system.x = this.pagePadding![0];
                    system.y = y;
                    index = fill.endIndex;
                    y += this._fitAndPaintSystem(system, y, totalHeight);
                    if (system.isLast) {
                        break;
                    }
                    continue;
                }
                this._detachBars(system);
                system.reset();
            } else {
                system = this.createEmptyStaffSystem(systemIndex);
                fill = new SystemFill();
                pool.push(system);
                fills.push(fill);
            }
            fill.isValid = false;
            system.x = this.pagePadding![0];
            system.y = y;
            const first = this._masterBarsAt(index, system);
            if (!first) {
                break;
            }
            fill.firstIndex = index;
            fill.barsPerSystem = barsPerSystem;
            fill.minWidth = 0;
            fill.breakWidth = Number.POSITIVE_INFINITY;
            let reverted = false;
            this._detachForeignBars(first, system);
            system.addMasterBarRenderers(tracks, first);
            index++;

            while (true) {
                const last = system.masterBarsRenderers[system.masterBarsRenderers.length - 1];
                if (this._needsLineBreak(last.lastMasterBarIndex)) {
                    system.isFull = true;
                    break;
                }
                const next = this._masterBarsAt(index, system);
                if (!next) {
                    break;
                }
                this._detachForeignBars(next, system);
                // a bar that cannot start a system (the second of a double simile) stays with its predecessor
                if (next.canWrap) {
                    const keepsFollowing = !this._canWrapBefore(next.lastMasterBarIndex + 1);
                    const count = keepsFollowing ? 2 : 1;
                    if (barsPerSystem > 0) {
                        if (system.masterBarsRenderers.length + count > barsPerSystem) {
                            system.isFull = true;
                            break;
                        }
                    } else {
                        let width = system.measureWidth(next);
                        if (keepsFollowing) {
                            const following = this._masterBarsAt(index + 1, system)!;
                            this._detachForeignBars(following, system);
                            width += system.measureWidth(following, 1);
                        }
                        const required = system.width + width;
                        if (required > maxWidth) {
                            system.isFull = true;
                            fill.breakWidth = required;
                            break;
                        }
                        if (required > fill.minWidth) {
                            fill.minWidth = required;
                        }
                    }
                }
                system.addMasterBarRenderers(tracks, next);
                index++;
                if (barsPerSystem <= 0 && next.canWrap) {
                    // a staff that became visible can widen the accolade beyond the available width
                    if (system.width > maxWidth) {
                        system.revertLastBar();
                        index--;
                        system.isFull = true;
                        reverted = true;
                        break;
                    }
                    if (system.width > fill.minWidth) {
                        fill.minWidth = system.width;
                    }
                }
            }
            fill.endIndex = index;
            fill.isValid = !reverted;

            // bars measured for this system but not added must not look like a part of it
            // (e.g. to ties ending in them)
            const all = this._allMasterBarRenderers;
            for (let i = index; i < all.length && i <= index + 1; i++) {
                const renderers = all[i].renderers;
                for (let j = 0; j < renderers.length; j++) {
                    const r = renderers[j];
                    if (r.staff && r.staff.system === system) {
                        r.afterReverted();
                    }
                }
            }

            system.isLast = system.lastBarIndex === this.lastBarIndex;
            y += this._fitAndPaintSystem(system, y, totalHeight);
            if (system.isLast) {
                break;
            }
        }
        this._trimSystemPool();
        return y;
    }

    private _fitAndPaintSystem(system: StaffSystem, y: number, totalHeight: number): number {
        this._systems.push(system);
        this._fitSystem(system);
        Logger.debug(this.name, `Rendering partial from bar ${system.firstBarIndex} to ${system.lastBarIndex}`, null);
        return this._paintSystem(system, totalHeight === -1 ? y : totalHeight);
    }

    /**
     * Detaches the bars a pooled system holds from it before the system is filled again.
     */
    private _detachBars(system: StaffSystem): void {
        const allStaves = system.allStaves;
        for (let i = 0; i < allStaves.length; i++) {
            const staff = allStaves[i];
            const renderers = staff.barRenderers;
            for (let j = 0; j < renderers.length; j++) {
                const r = renderers[j];
                if (r.staff === staff) {
                    r.afterReverted();
                }
            }
        }
    }

    /**
     * Detaches the bars from the system which held them in the previous pass before another system
     * measures or adds them.
     */
    private _detachForeignBars(bars: MasterBarsRenderers, system: StaffSystem): void {
        const renderers = bars.renderers;
        for (let i = 0; i < renderers.length; i++) {
            const r = renderers[i];
            if (r.staff && r.staff.system !== system) {
                r.afterReverted();
            }
        }
    }

    /**
     * Drops pooled systems a narrower width created and the current one does not use. The systems of
     * the previous pass stay pooled (up to half again the current count), so alternating between two
     * widths reuses them instead of recreating them.
     */
    private _trimSystemPool(): void {
        const used = this._systems.length;
        const keep = Math.max(used, Math.min(this._previousSystemCount, Math.ceil(used * 1.5)));
        const pool = this._systemPool;
        if (pool.length > keep) {
            pool.splice(keep, pool.length - keep);
            this._systemFills.splice(keep, this._systemFills.length - keep);
        }
        // the bars of an unused system were added to others, which changed their state
        const fills = this._systemFills;
        for (let i = used; i < fills.length; i++) {
            fills[i].isValid = false;
        }
        this._previousSystemCount = used;
    }

    private _paintSystem(system: StaffSystem, totalHeight: number): number {
        // paint into canvas
        const height: number = Math.floor(system.height);

        const args: RenderFinishedEventArgs = new RenderFinishedEventArgs();
        args.x = 0;
        args.y = system.y;
        args.totalWidth = this.scaledWidth;
        args.totalHeight = totalHeight;
        args.width = this.scaledWidth;
        args.height = height;
        args.firstMasterBarIndex = system.firstBarIndex;
        args.lastMasterBarIndex = system.lastBarIndex;

        system.buildBoundingsLookup(0, 0);
        this.registerPartial(args, canvas => {
            this.renderer.canvas!.color = this.renderer.settings.display.resources.mainGlyphColor;
            this.renderer.canvas!.textAlign = TextAlign.Left;
            // NOTE: we use this negation trick to make the system paint itself to 0/0 coordinates
            // since we use partial drawing
            system.paint(0, -(args.y / this.renderer.settings.display.scale), canvas);
        });
        this._systemPartialIds.push(args.id);

        // calculate coordinates for next system
        return height;
    }

    /**
     * Realignes the bars in this line according to the available space
     */
    private _fitSystem(system: StaffSystem): void {
        const display = this.renderer.settings.display;
        const overflowsAvailable = system.width > this._maxWidth;
        let shouldJustify = system.isFull || overflowsAvailable;

        // Last-system fill threshold (industry convention from Dorico / MuseScore): the last
        // system in a flow is justified to fill the row only when its natural fullness meets
        // the configured `lastSystemFillThreshold`. A threshold of 0 always justifies (matches
        // legacy `justifyLastSystem = true`); a threshold of 1 never justifies (matches legacy
        // `justifyLastSystem = false`); intermediate values yield Dorico-style "justify only
        // when reasonably full" behaviour.
        //
        // Overflow is handled before the threshold: if the natural width already exceeds the
        // available staff width, the system must compress to fit regardless of the threshold,
        // since otherwise content would overflow horizontally.
        if (system.isLast && !shouldJustify && this._maxWidth > 0) {
            const threshold = Math.max(0, Math.min(1, display.lastSystemFillThreshold));
            const fillRatio = system.width / this._maxWidth;
            if (fillRatio >= threshold) {
                shouldJustify = true;
            }
        }

        this._scaleToWidth(system, shouldJustify ? this._maxWidth : system.width);
        system.finalizeSystem();
    }

    /**
     * Whether the layout honours the model's {@link Bar.displayScale} when distributing staff width.
     * When `true` (Parchment, Page with `SystemsLayoutMode.UseModelLayout`), bars are weighted by
     * `displayScale`. When `false` (Page with `SystemsLayoutMode.Automatic`), `displayScale` is ignored
     * and bars are weighted by their natural content width produced by the built-in spacing engine.
     * Prefix/postfix overhead (clef, key sig, time sig, barlines) is treated as fixed in both modes.
     */
    protected abstract get shouldApplyBarScale(): boolean;

    private _scaleToWidth(system: StaffSystem, width: number): void {
        const staffWidth = width - system.accoladeWidth;
        const shouldApplyBarScale = this.shouldApplyBarScale;

        // Industry fixed-overhead model (Behind Bars, Dorico, Finale, Sibelius, MuseScore, Guitar Pro):
        // prefix/postfix glyphs (clef, key sig, time sig, barlines) are treated as fixed overhead and the
        // remaining staff width is distributed across bars by a per-bar weight.
        //
        //   distributable = staffWidth - totalFixedOverhead
        //   contentShare  = distributable / sum(weight)
        //   bar.width     = bar.maxFixedOverhead + weight * contentShare
        //
        // The weight depends on the layout mode:
        //   - shouldApplyBarScale=true  -> weight = bar.displayScale (model-driven, matches Guitar Pro)
        //                                  displayScale defaults to 1, so an unset value behaves identically
        //                                  to an explicit 1 (GP omits the property when not customized).
        //   - shouldApplyBarScale=false -> weight = natural content width (automatic, ignores displayScale)
        //
        // Per-bar maxFixedOverhead / maxContentWidth and the system-wide totals are maintained incrementally
        // in StaffSystem._applyLayoutAndUpdateWidth / revertLastBar so this pass can apply directly.
        const weightTotal = shouldApplyBarScale ? system.totalBarDisplayScale : system.totalContentWidth;
        const distributable = Math.max(0, staffWidth - system.totalFixedOverhead);
        const contentShare = weightTotal > 0 ? distributable / weightTotal : 0;

        system.resetAllStavesSharedLayoutData();
        system.resetAllStavesOverflows();

        const allStaves = system.allStaves;
        for (let j = 0; j < allStaves.length; j++) {
            const s = allStaves[j];
            let w = 0;
            for (let i = 0; i < s.barRenderers.length; i++) {
                const renderer = s.barRenderers[i];
                const mb = system.masterBarsRenderers[i];
                renderer.x = w;

                const weight = shouldApplyBarScale ? system.getBarDisplayScale(renderer) : mb.maxContentWidth;
                const actualBarWidth = mb.maxFixedOverhead + weight * contentShare;

                renderer.scaleToWidth(actualBarWidth);
                w += renderer.width;
            }
        }
        system.width = width;
    }

    protected abstract getBarsPerSystem(systemIndex: number): number;

    /**
     * Whether a system can start with the given bar: the second bar of a double simile stays with
     * the first one.
     */
    private _canWrapBefore(barIndex: number): boolean {
        if (barIndex > this.lastBarIndex) {
            return true;
        }
        for (const track of this.renderer.tracks!) {
            for (const staff of track.staves) {
                if (barIndex < staff.bars.length && staff.bars[barIndex].simileMark === SimileMark.SecondOfDouble) {
                    return false;
                }
            }
        }
        return true;
    }

    private _needsLineBreak(barIndex: number) {
        let anyTrackNeedsLineBreak = false;
        let allTracksNeedLineBreak = true;
        for (const track of this.renderer.tracks!) {
            if (track.lineBreaks && track.lineBreaks!.has(barIndex + 1)) {
                anyTrackNeedsLineBreak = true;
            } else {
                allTracksNeedLineBreak = false;
            }
        }
        return anyTrackNeedsLineBreak && allTracksNeedLineBreak;
    }

    private get _maxWidth(): number {
        return this.scaledWidth - this.pagePadding![0] - this.pagePadding![2];
    }
}
