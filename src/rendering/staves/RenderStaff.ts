import { Bar } from '@src/model/Bar';
import { Staff } from '@src/model/Staff';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BarRendererFactory } from '@src/rendering/BarRendererFactory';
import { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import { StaveGroup } from '@src/rendering/staves/StaveGroup';
import { StaveTrackGroup } from '@src/rendering/staves/StaveTrackGroup';

/**
 * A Staff represents a single line within a StaveGroup.
 * It stores BarRenderer instances created from a given factory.
 */
export class RenderStaff {
    private _factory: BarRendererFactory;
    private _sharedLayoutData: Map<string, unknown> = new Map();

    public staveTrackGroup!: StaveTrackGroup;
    public staveGroup!: StaveGroup;
    public barRenderers: BarRendererBase[] = [];
    public x: number = 0;
    public y: number = 0;
    public height: number = 0;
    public index: number = 0;
    public staffIndex: number = 0;

    /**
     * This is the index of the track being rendered. This is not the index of the track within the model,
     * but the n-th track being rendered. It is the index of the {@link ScoreRenderer.tracks} array defining
     * which tracks should be rendered.
     * For single-track rendering this will always be zero.
     */
    public trackIndex: number = 0;
    public modelStaff: Staff;

    public get staveId(): string {
        return this._factory.staffId;
    }

    /**
     * This is the visual offset from top where the
     * Staff contents actually start. Used for grouping
     * using a accolade
     */
    public staveTop: number = 0;

    public topSpacing: number = 20;
    public bottomSpacing: number = 5;

    /**
     * This is the visual offset from top where the
     * Staff contents actually ends. Used for grouping
     * using a accolade
     */
    public staveBottom: number = 0;

    public isFirstInAccolade: boolean = false;
    public isLastInAccolade: boolean = false;

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

    public get isInAccolade(): boolean {
        return this._factory.isInAccolade;
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
        this.staveGroup.layout.registerBarRenderer(this.staveId, renderer);
    }

    public addBar(bar: Bar, layoutingInfo: BarLayoutingInfo): void {
        let renderer: BarRendererBase;
        if (!bar) {
            renderer = new BarRendererBase(this.staveGroup.layout.renderer, bar);
        } else {
            renderer = this._factory.create(this.staveGroup.layout.renderer, bar);
        }
        renderer.staff = this;
        renderer.index = this.barRenderers.length;
        renderer.layoutingInfo = layoutingInfo;
        renderer.doLayout();
        renderer.registerLayoutingInfo();
        this.barRenderers.push(renderer);
        if (bar) {
            this.staveGroup.layout.registerBarRenderer(this.staveId, renderer);
        }
    }

    public revertLastBar(): BarRendererBase {
        let lastBar: BarRendererBase = this.barRenderers[this.barRenderers.length - 1];
        this.barRenderers.splice(this.barRenderers.length - 1, 1);
        this.staveGroup.layout.unregisterBarRenderer(this.staveId, lastBar);
        return lastBar;
    }

    public scaleToWidth(width: number): void {
        this._sharedLayoutData = new Map<string, unknown>();
        // Note: here we could do some "intelligent" distribution of
        // the space over the bar renderers, for now we evenly apply the space to all bars
        let difference: number = width - this.staveGroup.width;
        let spacePerBar: number = difference / this.barRenderers.length;
        for (let i: number = 0, j: number = this.barRenderers.length; i < j; i++) {
            this.barRenderers[i].scaleToWidth(this.barRenderers[i].width + spacePerBar);
        }
    }

    public get topOverflow(): number {
        let m: number = 0;
        for (let i: number = 0, j: number = this.barRenderers.length; i < j; i++) {
            let r: BarRendererBase = this.barRenderers[i];
            if (r.topOverflow > m) {
                m = r.topOverflow;
            }
        }
        return m;
    }

    public get bottomOverflow(): number {
        let m: number = 0;
        for (let i: number = 0, j: number = this.barRenderers.length; i < j; i++) {
            let r: BarRendererBase = this.barRenderers[i];
            if (r.bottomOverflow > m) {
                m = r.bottomOverflow;
            }
        }
        return m;
    }

    public finalizeStaff(): void {
        let x: number = 0;
        this.height = 0;
        let topOverflow: number = this.topOverflow;
        let bottomOverflow: number = this.bottomOverflow;
        for (let i: number = 0; i < this.barRenderers.length; i++) {
            this.barRenderers[i].x = x;
            this.barRenderers[i].y = this.topSpacing + topOverflow;
            this.height = Math.max(this.height, this.barRenderers[i].height);
            this.barRenderers[i].finalizeRenderer();
            x += this.barRenderers[i].width;
        }
        if (this.height > 0) {
            this.height += this.topSpacing + topOverflow + bottomOverflow + this.bottomSpacing;
        }
    }

    public paint(cx: number, cy: number, canvas: ICanvas, startIndex: number, count: number): void {
        if (this.height === 0 || count === 0) {
            return;
        }
        for (
            let i: number = startIndex, j: number = Math.min(startIndex + count, this.barRenderers.length);
            i < j;
            i++
        ) {
            this.barRenderers[i].paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
