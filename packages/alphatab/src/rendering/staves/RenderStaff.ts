import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import {
    type BarRendererFactory,
    type EffectBandInfo,
    EffectBandMode
} from '@coderline/alphatab/rendering/BarRendererFactory';
import { InternalSystemsLayoutMode } from '@coderline/alphatab/rendering/layout/ScoreLayout';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { StaffSystem } from '@coderline/alphatab/rendering/staves/StaffSystem';
import type { StaffTrackGroup } from '@coderline/alphatab/rendering/staves/StaffTrackGroup';

/**
 * A Staff represents a single line within a StaffSystem.
 * It stores BarRenderer instances created from a given factory.
 * @internal
 */
export class RenderStaff {
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

    public isFirstInSystem: boolean = false;

    public topEffectInfos: EffectBandInfo[] = [];
    public bottomEffectInfos: EffectBandInfo[] = [];

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

    public constructor(trackIndex: number, staff: Staff, factory: BarRendererFactory) {
        this._factory = factory;
        this.trackIndex = trackIndex;
        this.modelStaff = staff;
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

    public get isInsideBracket(): boolean {
        return this._factory.isInsideBracket;
    }

    public get isRelevantForBoundsLookup(): boolean {
        return this._factory.isRelevantForBoundsLookup;
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
    }

    public addBar(bar: Bar, layoutingInfo: BarLayoutingInfo, additionalMultiBarsRestBars: Bar[] | null): void {
        const renderer = this._factory.create(this.system.layout.renderer, bar);

        renderer.topEffects.infos = this.topEffectInfos;
        renderer.bottomEffects.infos = this.bottomEffectInfos;

        renderer.additionalMultiRestBars = additionalMultiBarsRestBars;
        renderer.staff = this;
        renderer.index = this.barRenderers.length;
        renderer.layoutingInfo = layoutingInfo;
        renderer.doLayout();
        renderer.registerLayoutingInfo();

        // For cases like in the horizontal layout we need to set the fixed width early
        // to have correct partials splitting
        const barDisplayWidth = renderer.barDisplayWidth;
        if (
            barDisplayWidth > 0 &&
            this.system.layout.systemsLayoutMode === InternalSystemsLayoutMode.FromModelWithWidths
        ) {
            renderer.width = barDisplayWidth;
        }

        this.barRenderers.push(renderer);
        this.system.layout.registerBarRenderer(this.staffId, renderer);
    }

    public revertLastBar(): BarRendererBase {
        this._sharedLayoutData = new Map<string, unknown>();
        const lastBar: BarRendererBase = this.barRenderers[this.barRenderers.length - 1];
        this.barRenderers.splice(this.barRenderers.length - 1, 1);
        this.system.layout.unregisterBarRenderer(this.staffId, lastBar);
        this.topOverflow = 0;
        this.bottomOverflow = 0;
        for (const r of this.barRenderers) {
            r.afterStaffBarReverted();
        }
        return lastBar;
    }

    public scaleToWidth(width: number): void {
        this._sharedLayoutData = new Map<string, unknown>();
        const topOverflow: number = this.topOverflow;
        let x = 0;

        switch (this.system.layout.systemsLayoutMode) {
            case InternalSystemsLayoutMode.Automatic:
                // Note: here we could do some "intelligent" distribution of
                // the space over the bar renderers, for now we evenly apply the space to all bars
                const difference: number = width - this.system.computedWidth;
                const spacePerBar: number = difference / this.barRenderers.length;
                for (const renderer of this.barRenderers) {
                    renderer.x = x;
                    renderer.y = this.topPadding + topOverflow;

                    const actualBarWidth = renderer.computedWidth + spacePerBar;
                    renderer.scaleToWidth(actualBarWidth);
                    x += renderer.width;
                }
                break;
            case InternalSystemsLayoutMode.FromModelWithScale:
                // each bar holds a percentual size where the sum of all scales make the width.
                // hence we can calculate the width accordingly by calculating how big each column needs to be percentual.

                width -= this.system.accoladeWidth;
                const totalScale = this.system.totalBarDisplayScale;

                for (const renderer of this.barRenderers) {
                    renderer.x = x;
                    renderer.y = this.topPadding + topOverflow;

                    const actualBarWidth = (renderer.barDisplayScale * width) / totalScale;
                    renderer.scaleToWidth(actualBarWidth);

                    x += renderer.width;
                }

                break;
            case InternalSystemsLayoutMode.FromModelWithWidths:
                for (const renderer of this.barRenderers) {
                    renderer.x = x;
                    renderer.y = this.topPadding + topOverflow;
                    const displayWidth = renderer.barDisplayWidth;
                    if (displayWidth > 0) {
                        renderer.scaleToWidth(displayWidth);
                    } else {
                        renderer.scaleToWidth(renderer.computedWidth);
                    }

                    x += renderer.width;
                }
                break;
        }
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
        this._applyStaffPaddings();

        this.height = 0;

        // 1st pass: let all renderers finalize themselves, this might cause
        // changes in the overflows
        let needsSecondPass = false;
        let topOverflow: number = this.topOverflow;
        for (let i: number = 0; i < this.barRenderers.length; i++) {
            this.barRenderers[i].y = this.topPadding + topOverflow;
            this.height = Math.max(this.height, this.barRenderers[i].height);
            if (this.barRenderers[i].finalizeRenderer()) {
                needsSecondPass = true;
            }
        }

        // 2nd pass: move renderers to correct position respecting the new overflows
        if (needsSecondPass) {
            topOverflow = this.topOverflow;
            // shift all the renderers to the new position to match required spacing
            for (let i: number = 0; i < this.barRenderers.length; i++) {
                this.barRenderers[i].y = this.topPadding + topOverflow;
            }

            // finalize again (to align ties)
            for (let i: number = 0; i < this.barRenderers.length; i++) {
                this.barRenderers[i].finalizeRenderer();
            }
        }

        if (this.height > 0) {
            this.height += this.topPadding + topOverflow + this.bottomOverflow + this.bottomPadding;
        }

        this.height = Math.ceil(this.height);
    }

    public paint(cx: number, cy: number, canvas: ICanvas, startIndex: number, count: number): void {
        if (this.height === 0 || count === 0) {
            return;
        }

        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.system.width - this.x, this.height);

        for (
            let i: number = startIndex, j: number = Math.min(startIndex + count, this.barRenderers.length);
            i < j;
            i++
        ) {
            this.barRenderers[i].paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
