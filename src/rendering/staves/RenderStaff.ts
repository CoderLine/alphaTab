import type { Bar } from '@src/model/Bar';
import type { Staff } from '@src/model/Staff';
import type { ICanvas } from '@src/platform/ICanvas';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import type { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import type { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import type { StaffSystem } from '@src/rendering/staves/StaffSystem';
import type { StaffTrackGroup } from '@src/rendering/staves/StaffTrackGroup';
import { InternalSystemsLayoutMode } from '@src/rendering/layout/ScoreLayout';

/**
 * A Staff represents a single line within a StaffSystem.
 * It stores BarRenderer instances created from a given factory.
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
    public staveTop: number = 0;

    public topSpacing: number = 0;
    public bottomSpacing: number = 0;

    /**
     * This is the visual offset from top where the
     * Staff contents actually ends. Used for grouping
     * using a accolade
     */
    public staveBottom: number = 0;

    public get contentTop() {
        return this.y + this.staveTop + this.topSpacing + this.topOverflow;
    }

    public get contentBottom() {
        return this.y + this.topSpacing + this.topOverflow + this.staveBottom;
    }

    public constructor(trackIndex: number, staff: Staff, factory: BarRendererFactory) {
        this._factory = factory;
        this.trackIndex = trackIndex;
        this.modelStaff = staff;
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
        this.staveTop = offset;
    }

    public registerStaffBottom(offset: number): void {
        this.staveBottom = offset;
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
        if (bar) {
            this.system.layout.registerBarRenderer(this.staffId, renderer);
        }
    }

    public revertLastBar(): BarRendererBase {
        const lastBar: BarRendererBase = this.barRenderers[this.barRenderers.length - 1];
        this.barRenderers.splice(this.barRenderers.length - 1, 1);
        this.system.layout.unregisterBarRenderer(this.staffId, lastBar);
        for (const r of this.barRenderers) {
            r.applyLayoutingInfo();
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
                    renderer.y = this.topSpacing + topOverflow;

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
                    renderer.y = this.topSpacing + topOverflow;

                    const actualBarWidth = (renderer.barDisplayScale * width) / totalScale;
                    renderer.scaleToWidth(actualBarWidth);

                    x += renderer.width;
                }

                break;
            case InternalSystemsLayoutMode.FromModelWithWidths:
                for (const renderer of this.barRenderers) {
                    renderer.x = x;
                    renderer.y = this.topSpacing + topOverflow;
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

    public get topOverflow(): number {
        let m: number = 0;
        for (let i: number = 0, j: number = this.barRenderers.length; i < j; i++) {
            const r: BarRendererBase = this.barRenderers[i];
            if (r.topOverflow > m) {
                m = r.topOverflow;
            }
        }
        return m;
    }

    public get bottomOverflow(): number {
        let m: number = 0;
        for (let i: number = 0, j: number = this.barRenderers.length; i < j; i++) {
            const r: BarRendererBase = this.barRenderers[i];
            if (r.bottomOverflow > m) {
                m = r.bottomOverflow;
            }
        }
        return m;
    }

    /**
     * Performs an early calculation of the expected staff height for the size calculation in the
     * accolade (e.g. for braces). This typically happens after the first bar renderers were created
     * and we can do an early placement of the render staffs.
     */
    public calculateHeightForAccolade() {
        this.topSpacing = this._factory.getStaffPaddingTop(this);
        this.bottomSpacing = this._factory.getStaffPaddingBottom(this);

        this.height = this.barRenderers.length > 0 ? this.barRenderers[0].height : 0;

        if (this.height > 0) {
            this.height += this.topSpacing + this.topOverflow + this.bottomOverflow + this.bottomSpacing;
        }
    }

    public finalizeStaff(): void {
        this.topSpacing = this._factory.getStaffPaddingTop(this);
        this.bottomSpacing = this._factory.getStaffPaddingBottom(this);

        this.height = 0;

        // 1st pass: let all renderers finalize themselves, this might cause
        // changes in the overflows
        let needsSecondPass = false;
        let topOverflow: number = this.topOverflow;
        for (let i: number = 0; i < this.barRenderers.length; i++) {
            this.barRenderers[i].y = this.topSpacing + topOverflow;
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
                this.barRenderers[i].y = this.topSpacing + topOverflow;
            }

            // finalize again (to align ties)
            for (let i: number = 0; i < this.barRenderers.length; i++) {
                this.barRenderers[i].finalizeRenderer();
            }
        }

        if (this.height > 0) {
            this.height += this.topSpacing + topOverflow + this.bottomOverflow + this.bottomSpacing;
        }
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
