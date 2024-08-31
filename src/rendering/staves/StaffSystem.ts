import { Bar } from '@src/model/Bar';
import { Font } from '@src/model/Font';
import { Track } from '@src/model/Track';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import { MasterBarsRenderers } from '@src/rendering/staves/MasterBarsRenderers';
import { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { StaffTrackGroup } from '@src/rendering/staves/StaffTrackGroup';
import { Bounds } from '@src/rendering/utils/Bounds';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import { StaffSystemBounds } from '@src/rendering/utils/StaffSystemBounds';
import { RenderingResources } from '@src/RenderingResources';
import { NotationElement } from '@src/NotationSettings';

/**
 * A StaffSystem consists of a list of different staves and groups
 * them using an accolade.
 */
export class StaffSystem {
    private _allStaves: RenderStaff[] = [];
    private _firstStaffInAccolade: RenderStaff | null = null;
    private _lastStaffInAccolade: RenderStaff | null = null;
    private _accoladeSpacingCalculated: boolean = false;

    private static readonly AccoladeBarSize: number = 3;

    public x: number = 0;
    public y: number = 0;
    public index: number = 0;

    /**
     * The width of the whole accolade inclusive text and bar.
     */
    public accoladeWidth: number = 0;

    /**
     * Indicates whether this line is full or not. If the line is full the
     * bars can be aligned to the maximum width. If the line is not full
     * the bars will not get stretched.
     */
    public isFull: boolean = false;

    /**
     * The width that the content bars actually need
     */
    public width: number = 0;
    public computedWidth: number = 0;
    public totalBarDisplayScale: number = 0;

    public isLast: boolean = false;
    public masterBarsRenderers: MasterBarsRenderers[] = [];
    public staves: StaffTrackGroup[] = [];
    public layout!: ScoreLayout;

    public topPadding: number;
    public bottomPadding: number;

    public constructor(layout: ScoreLayout) {
        this.layout = layout;
        this.topPadding = layout.renderer.settings.display.systemPaddingTop;
        this.bottomPadding = layout.renderer.settings.display.systemPaddingBottom;
    }

    public get firstBarIndex(): number {
        return this.masterBarsRenderers[0].masterBar.index;
    }

    public get lastBarIndex(): number {
        return this.masterBarsRenderers[this.masterBarsRenderers.length - 1].masterBar.index;
    }

    public addMasterBarRenderers(tracks: Track[], renderers: MasterBarsRenderers): MasterBarsRenderers | null {
        if (tracks.length === 0) {
            return null;
        }
        this.masterBarsRenderers.push(renderers);
        this.calculateAccoladeSpacing(tracks);
        renderers.layoutingInfo.preBeatSize = 0;
        let src: number = 0;
        for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
            let g: StaffTrackGroup = this.staves[i];
            for (let k: number = 0, l: number = g.staves.length; k < l; k++) {
                let s: RenderStaff = g.staves[k];
                let renderer: BarRendererBase = renderers.renderers[src++];
                s.addBarRenderer(renderer);
            }
        }
        // Width += renderers.Width;
        this.updateWidthFromLastBar();
        return renderers;
    }

    public addBars(tracks: Track[], barIndex: number): MasterBarsRenderers | null {
        if (tracks.length === 0) {
            return null;
        }
        let result: MasterBarsRenderers = new MasterBarsRenderers();
        result.layoutingInfo = new BarLayoutingInfo();
        result.masterBar = tracks[0].score.masterBars[barIndex];
        this.masterBarsRenderers.push(result);
        this.calculateAccoladeSpacing(tracks);
        // add renderers
        let barLayoutingInfo: BarLayoutingInfo = result.layoutingInfo;
        for (let g of this.staves) {
            for (let s of g.staves) {
                let bar: Bar = g.track.staves[s.modelStaff.index].bars[barIndex];
                s.addBar(bar, barLayoutingInfo);
                let renderer: BarRendererBase = s.barRenderers[s.barRenderers.length - 1];
                result.renderers.push(renderer);
                if (renderer.isLinkedToPrevious) {
                    result.isLinkedToPrevious = true;
                }
                if (!renderer.canWrap) {
                    result.canWrap = false;
                }
            }
        }
        barLayoutingInfo.finish();
        // ensure same widths of new renderer
        result.width = this.updateWidthFromLastBar();

        return result;
    }

    public revertLastBar(): MasterBarsRenderers | null {
        if (this.masterBarsRenderers.length > 1) {
            let toRemove: MasterBarsRenderers = this.masterBarsRenderers[this.masterBarsRenderers.length - 1];
            this.masterBarsRenderers.splice(this.masterBarsRenderers.length - 1, 1);
            let width: number = 0;
            let barDisplayScale: number = 0;
            for (let i: number = 0, j: number = this._allStaves.length; i < j; i++) {
                let s: RenderStaff = this._allStaves[i];
                let lastBar: BarRendererBase = s.revertLastBar();
                const computedWidth = lastBar.computedWidth;
                if (computedWidth > width) {
                    width = computedWidth;
                }
                const newBarDisplayScale = lastBar.barDisplayScale;
                if (newBarDisplayScale > barDisplayScale) {
                    barDisplayScale = newBarDisplayScale;
                }
            }
            this.width -= width;
            this.computedWidth -= width;
            this.totalBarDisplayScale -= barDisplayScale;
            return toRemove;
        }
        return null;
    }

    private updateWidthFromLastBar(): number {
        let realWidth: number = 0;
        let barDisplayScale: number = 0;
        for (let i: number = 0, j: number = this._allStaves.length; i < j; i++) {
            let s: RenderStaff = this._allStaves[i];

            const last = s.barRenderers[s.barRenderers.length - 1];
            last.applyLayoutingInfo();
            if (last.computedWidth > realWidth) {
                realWidth = last.computedWidth;
            }

            const newBarDisplayScale = last.barDisplayScale;
            if (newBarDisplayScale > barDisplayScale) {
                barDisplayScale = newBarDisplayScale;
            }
        }
        this.width += realWidth;
        this.computedWidth += realWidth;
        this.totalBarDisplayScale += barDisplayScale;

        return realWidth;
    }

    private calculateAccoladeSpacing(tracks: Track[]): void {
        const settings = this.layout.renderer.settings;
        if (!this._accoladeSpacingCalculated) {
            this._accoladeSpacingCalculated = true;
            if (
                this.index === 0 &&
                this.layout.renderer.settings.notation.isNotationElementVisible(NotationElement.TrackNames)
            ) {
                let canvas: ICanvas = this.layout.renderer.canvas!;
                let res: Font = settings.display.resources.effectFont;
                canvas.font = res;
                for (let t of tracks) {
                    this.accoladeWidth = Math.ceil(Math.max(this.accoladeWidth, canvas.measureText(t.shortName).width));
                }
                this.accoladeWidth *= this.layout.scale;
                this.accoladeWidth += settings.display.systemLabelPaddingLeft * this.layout.scale;
                this.accoladeWidth += settings.display.systemLabelPaddingRight * this.layout.scale;
            } else {
                this.accoladeWidth = 0;
            }

            this.accoladeWidth += StaffSystem.AccoladeBarSize * this.layout.scale;
            this.accoladeWidth += settings.display.accoladeBarPaddingRight * this.layout.scale;

            this.width += this.accoladeWidth;
            this.computedWidth += this.accoladeWidth;
        }
    }

    private getStaffTrackGroup(track: Track): StaffTrackGroup | null {
        for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
            let g: StaffTrackGroup = this.staves[i];
            if (g.track === track) {
                return g;
            }
        }
        return null;
    }

    public addStaff(track: Track, staff: RenderStaff): void {
        let group: StaffTrackGroup | null = this.getStaffTrackGroup(track);
        if (!group) {
            group = new StaffTrackGroup(this, track);
            this.staves.push(group);
        }
        staff.staffTrackGroup = group;
        staff.system = this;
        staff.index = this._allStaves.length;
        this._allStaves.push(staff);
        group.addStaff(staff);
        if (staff.isInAccolade) {
            if (!this._firstStaffInAccolade) {
                this._firstStaffInAccolade = staff;
                staff.isFirstInAccolade = true;
            }
            if (!group.firstStaffInAccolade) {
                group.firstStaffInAccolade = staff;
            }
            if (!this._lastStaffInAccolade) {
                this._lastStaffInAccolade = staff;
                staff.isLastInAccolade = true;
            }
            if (this._lastStaffInAccolade) {
                this._lastStaffInAccolade.isLastInAccolade = false;
            }
            this._lastStaffInAccolade = staff;
            this._lastStaffInAccolade.isLastInAccolade = true;
            group.lastStaffInAccolade = staff;
        }
    }

    public get height(): number {
        return this._allStaves.length === 0 ? 0 : (
            this._allStaves[this._allStaves.length - 1].y +
            this._allStaves[this._allStaves.length - 1].height +
            this.topPadding +
            this.bottomPadding
        );
    }

    public scaleToWidth(width: number): void {
        for (let i: number = 0, j: number = this._allStaves.length; i < j; i++) {
            this._allStaves[i].scaleToWidth(width);
        }
        this.width = width;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // const c = canvas.color;
        // canvas.color = Color.random(255);
        // canvas.strokeRect(cx + this.x, cy + this.y, this.width, this.height);
        // canvas.color = c;

        cy += this.topPadding;

        this.paintPartial(cx + this.x, cy + this.y, canvas, 0, this.masterBarsRenderers.length);
    }

    public paintPartial(cx: number, cy: number, canvas: ICanvas, startIndex: number, count: number): void {
        for (let i: number = 0, j: number = this._allStaves.length; i < j; i++) {
            this._allStaves[i].paint(cx, cy, canvas, startIndex, count);
        }
        let res: RenderingResources = this.layout.renderer.settings.display.resources;
        if (this.staves.length > 0 && startIndex === 0) {
            //
            // Draw start grouping
            //
            canvas.color = res.barSeparatorColor;
            if (this._firstStaffInAccolade && this._lastStaffInAccolade) {
                //
                // draw grouping line for all staves
                //
                let firstStart: number =
                    cy +
                    this._firstStaffInAccolade.y +
                    this._firstStaffInAccolade.staveTop +
                    this._firstStaffInAccolade.topSpacing +
                    this._firstStaffInAccolade.topOverflow;
                let lastEnd: number =
                    cy +
                    this._lastStaffInAccolade.y +
                    this._lastStaffInAccolade.topSpacing +
                    this._lastStaffInAccolade.topOverflow +
                    this._lastStaffInAccolade.staveBottom;
                let acooladeX: number = cx + this._firstStaffInAccolade.x;
                canvas.beginPath();
                canvas.moveTo(acooladeX, firstStart);
                canvas.lineTo(acooladeX, lastEnd);
                canvas.stroke();
            }
            //
            // Draw accolade for each track group
            //
            canvas.font = res.effectFont;
            const settings = this.layout.renderer.settings;
            for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
                let g: StaffTrackGroup = this.staves[i];
                if (g.firstStaffInAccolade && g.lastStaffInAccolade) {
                    let firstStart: number =
                        cy +
                        g.firstStaffInAccolade.y +
                        g.firstStaffInAccolade.staveTop +
                        g.firstStaffInAccolade.topSpacing +
                        g.firstStaffInAccolade.topOverflow;
                    let lastEnd: number =
                        cy +
                        g.lastStaffInAccolade.y +
                        g.lastStaffInAccolade.topSpacing +
                        g.lastStaffInAccolade.topOverflow +
                        g.lastStaffInAccolade.staveBottom;

                    const hasTrackName =
                        this.index === 0 &&
                        this.layout.renderer.settings.notation.isNotationElementVisible(NotationElement.TrackNames);

                    let barStartX: number = cx + g.firstStaffInAccolade.x;
                    let barSize: number = StaffSystem.AccoladeBarSize * this.layout.scale;
                    let barOffset: number = settings.display.accoladeBarPaddingRight * this.layout.scale;
                    let accoladeStart: number = firstStart - barSize * 4;
                    let accoladeEnd: number = lastEnd + barSize * 4;
                    // text
                    if (hasTrackName) {
                        canvas.fillText(
                            g.track.shortName,
                            cx + settings.display.systemLabelPaddingLeft * this.layout.scale,
                            firstStart
                        );
                        // canvas.strokeRect(
                        //     cx + settings.display.systemLabelPaddingLeft * this.layout.scale,
                        //     firstStart,
                        //     canvas.measureText(g.track.shortName).width,
                        //     10
                        // );
                    }
                    // rect
                    canvas.fillRect(
                        barStartX - barOffset - barSize,
                        accoladeStart,
                        barSize,
                        accoladeEnd - accoladeStart
                    );
                    let spikeStartX: number = barStartX - barOffset - barSize;
                    let spikeEndX: number = barStartX + barSize * 2;
                    // top spike
                    canvas.beginPath();
                    canvas.moveTo(spikeStartX, accoladeStart);
                    canvas.bezierCurveTo(
                        spikeStartX,
                        accoladeStart,
                        spikeStartX,
                        accoladeStart,
                        spikeEndX,
                        accoladeStart - barSize
                    );
                    canvas.bezierCurveTo(
                        barStartX,
                        accoladeStart + barSize,
                        spikeStartX,
                        accoladeStart + barSize,
                        spikeStartX,
                        accoladeStart + barSize
                    );
                    canvas.closePath();
                    canvas.fill();
                    // bottom spike
                    canvas.beginPath();
                    canvas.moveTo(spikeStartX, accoladeEnd);
                    canvas.bezierCurveTo(
                        spikeStartX,
                        accoladeEnd,
                        barStartX,
                        accoladeEnd,
                        spikeEndX,
                        accoladeEnd + barSize
                    );
                    canvas.bezierCurveTo(
                        barStartX,
                        accoladeEnd - barSize,
                        spikeStartX,
                        accoladeEnd - barSize,
                        spikeStartX,
                        accoladeEnd - barSize
                    );
                    canvas.closePath();
                    canvas.fill();
                }
            }
        }
    }

    public finalizeSystem(): void {
        const settings = this.layout.renderer.settings;
        if (this.index === 0) {
            this.topPadding = settings.display.firstSystemPaddingTop * settings.display.scale;
        }
        if (this.isLast) {
            this.bottomPadding = settings.display.lastSystemPaddingBottom * settings.display.scale;
        }

        let currentY: number = 0;
        for (let staff of this._allStaves) {
            staff.x = this.accoladeWidth;
            staff.y = currentY;
            staff.finalizeStaff();
            currentY += staff.height;
        }
    }

    public buildBoundingsLookup(cx: number, cy: number): void {
        if (this.layout.renderer.boundsLookup!.isFinished) {
            return;
        }
        if (!this._firstStaffInAccolade || !this._lastStaffInAccolade) {
            return;
        }
        cy += this.topPadding;

        let lastStaff: RenderStaff = this._allStaves[this._allStaves.length - 1];
        let visualTop: number = cy + this.y + this._firstStaffInAccolade.y;
        let visualBottom: number = cy + this.y + this._lastStaffInAccolade.y + this._lastStaffInAccolade.height;
        let realTop: number = cy + this.y + this._allStaves[0].y;
        let realBottom: number = cy + this.y + lastStaff.y + lastStaff.height;
        let lineTop: number =
            cy +
            this.y +
            this._firstStaffInAccolade.y +
            this._firstStaffInAccolade.topSpacing +
            this._firstStaffInAccolade.topOverflow +
            (this._firstStaffInAccolade.barRenderers.length > 0
                ? this._firstStaffInAccolade.barRenderers[0].topPadding
                : 0);
        let lineBottom: number =
            cy +
            this.y +
            lastStaff.y +
            lastStaff.height -
            lastStaff.bottomSpacing -
            lastStaff.bottomOverflow -
            (lastStaff.barRenderers.length > 0 ? lastStaff.barRenderers[0].bottomPadding : 0);
        let visualHeight: number = visualBottom - visualTop;
        let lineHeight: number = lineBottom - lineTop;
        let realHeight: number = realBottom - realTop;
        let x: number = this.x + this._firstStaffInAccolade.x;
        let staffSystemBounds = new StaffSystemBounds();
        staffSystemBounds.visualBounds = new Bounds();
        staffSystemBounds.visualBounds.x = cx;
        staffSystemBounds.visualBounds.y = cy + this.y;
        staffSystemBounds.visualBounds.w = this.width;
        staffSystemBounds.visualBounds.h = this.height - this.topPadding - this.bottomPadding;
        staffSystemBounds.realBounds = new Bounds();
        staffSystemBounds.realBounds.x = cx;
        staffSystemBounds.realBounds.y = cy + this.y;
        staffSystemBounds.realBounds.w = this.width;
        staffSystemBounds.realBounds.h = this.height;
        this.layout.renderer.boundsLookup!.addStaffSystem(staffSystemBounds);
        let masterBarBoundsLookup: Map<number, MasterBarBounds> = new Map<number, MasterBarBounds>();
        for (let i: number = 0; i < this.staves.length; i++) {
            for (let staff of this.staves[i].stavesRelevantForBoundsLookup) {
                for (let renderer of staff.barRenderers) {
                    let masterBarBounds: MasterBarBounds;
                    if (!masterBarBoundsLookup.has(renderer.bar.masterBar.index)) {
                        masterBarBounds = new MasterBarBounds();
                        masterBarBounds.index = renderer.bar.masterBar.index;
                        masterBarBounds.isFirstOfLine = renderer.isFirstOfLine;
                        masterBarBounds.realBounds = new Bounds();
                        masterBarBounds.realBounds.x = x + renderer.x;
                        masterBarBounds.realBounds.y = realTop;
                        masterBarBounds.realBounds.w = renderer.width;
                        masterBarBounds.realBounds.h = realHeight;

                        masterBarBounds.visualBounds = new Bounds();
                        masterBarBounds.visualBounds.x = x + renderer.x;
                        masterBarBounds.visualBounds.y = visualTop;
                        masterBarBounds.visualBounds.w = renderer.width;
                        masterBarBounds.visualBounds.h = visualHeight;

                        masterBarBounds.lineAlignedBounds = new Bounds();
                        masterBarBounds.lineAlignedBounds.x = x + renderer.x;
                        masterBarBounds.lineAlignedBounds.y = lineTop;
                        masterBarBounds.lineAlignedBounds.w = renderer.width;
                        masterBarBounds.lineAlignedBounds.h = lineHeight;
                        this.layout.renderer.boundsLookup!.addMasterBar(masterBarBounds);
                        masterBarBoundsLookup.set(masterBarBounds.index, masterBarBounds);
                    } else {
                        masterBarBounds = masterBarBoundsLookup.get(renderer.bar.masterBar.index)!;
                    }
                    renderer.buildBoundingsLookup(masterBarBounds, x, cy + this.y + staff.y);
                }
            }
        }
    }

    public getBarX(index: number): number {
        if (!this._firstStaffInAccolade || this.layout.renderer.tracks!.length === 0) {
            return 0;
        }
        let bar: Bar = this.layout.renderer.tracks![0].staves[0].bars[index];
        let renderer: BarRendererBase = this.layout.getRendererForBar(this._firstStaffInAccolade.staveId, bar)!;
        return renderer.x;
    }
}
