import { Bar } from '@src/model/Bar';
import { Font } from '@src/model/Font';
import { Track } from '@src/model/Track';
import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
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
import { BracketExtendMode } from '@src/model/RenderStylesheet';
import { MusicFontSymbol } from '@src/model';
import { Environment } from '@src/Environment';

export abstract class SystemBracket {
    public firstStaffInBracket: RenderStaff | null = null;
    public lastStaffInBracket: RenderStaff | null = null;
    public drawAsBrace: boolean = false;
    public braceScale: number = 1;
    public width: number = 0;
    public index: number = 0;

    public abstract includesStaff(s: RenderStaff): boolean;

    public finalize() {
        // normal bracket width
        this.width = 3;

        if (!this.drawAsBrace || !this.firstStaffInBracket || !this.lastStaffInBracket) {
            return;
        }

        const firstStart: number = this.firstStaffInBracket.contentTop;
        const lastEnd: number = this.lastStaffInBracket.contentBottom;

        // SMUFL: The brace glyph should have a height of 1em, i.e. the height of a single five-line stave, and should be scaled proportionally
        const bravuraBraceHeightAtMusicFontSize = Environment.MusicFontSize;
        const bravuraBraceWidthAtMusicFontSize = 3;

        const requiredHeight = lastEnd - firstStart;
        const requiredScaleForBracket = requiredHeight / bravuraBraceHeightAtMusicFontSize;
        this.braceScale = requiredScaleForBracket;
        this.width = bravuraBraceWidthAtMusicFontSize * this.braceScale;
    }
}

class SingleTrackSystemBracket extends SystemBracket {
    protected track: Track;

    public constructor(track: Track) {
        super();
        this.track = track;
        this.drawAsBrace = SingleTrackSystemBracket.trackDrawAsBrace(track);
    }

    public override includesStaff(r: RenderStaff): boolean {
        return r.modelStaff.track === this.track;
    }

    public static trackDrawAsBrace(track: Track) {
        return track.staves.filter(s => s.showStandardNotation).length > 1;
    }
}

class SimilarInstrumentSystemBracket extends SingleTrackSystemBracket {
    public constructor(track: Track) {
        super(track);
    }

    public override includesStaff(r: RenderStaff): boolean {
        // allow merging on same track (for braces, percussion and items belonging together)
        if (r.modelStaff.track === this.track) {
            return true;
        }

        // braces are never cross-track
        if (this.drawAsBrace) {
            return false;
        }

        // we allow cross track merging of staffs when they have the same program
        return this.track.playbackInfo.program == r.modelStaff.track.playbackInfo.program;
    }
}

/**
 * A StaffSystem consists of a list of different staves and groups
 * them using an accolade.
 */
export class StaffSystem {
    private _allStaves: RenderStaff[] = [];
    private _firstStaffInBrackets: RenderStaff | null = null;
    private _lastStaffInBrackets: RenderStaff | null = null;

    private _accoladeSpacingCalculated: boolean = false;

    private _brackets: SystemBracket[] = [];

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
        this.calculateAccoladeSpacing(tracks);

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
        this.calculateAccoladeSpacing(tracks);

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

            // NOTE: we have a chicken-egg problem when it comes to scaling braces which we try to mitigate here:
            // - The brace scales with the height of the system
            // - The height of the system depends on the bars which can be fitted
            // By taking another bar into the system, the height can grow and by this the width of the brace and then it doesn't fit anymore.
            // It is not worth the complexity to align the height and width of the brace.
            // So we do a rough approximation of the space needed for the brace based on the staves we have at this point.
            // Additional Staff separations caused later are not respected.
            // users can mitigate truncation with specfiying a systemLabelPaddingLeft.

            // alternative idea for the future:
            // - we could force the brace to the width we initially calculate here so it will not grow beyond that.
            // - requires a feature to draw glyphs with a max-width or a horizontal stretch scale

            let currentY: number = 0;
            for (let staff of this._allStaves) {
                staff.y = currentY;
                staff.calculateHeightForAccolade();
                currentY += staff.height;
            }

            let braceWidth = 0;
            for (const b of this._brackets) {
                b.finalize();
                braceWidth = Math.max(braceWidth, b.width * this.layout.scale);
            }

            this.accoladeWidth += braceWidth;

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
        if (staff.isInsideBracket) {
            if (!this._firstStaffInBrackets) {
                this._firstStaffInBrackets = staff;
                staff.isFirstInSystem = true;
            }
            if (!group.firstStaffInBracket) {
                group.firstStaffInBracket = staff;
            }
            this._lastStaffInBrackets = staff;
            group.lastStaffInBracket = staff;

            let bracket = this._brackets.find(b => b.includesStaff(staff));
            if (!bracket) {
                switch (track.score.stylesheet.bracketExtendMode) {
                    case BracketExtendMode.NoBrackets:
                        break;
                    case BracketExtendMode.GroupStaves:
                        // when grouping staves, we create one bracket for the whole track across all staves
                        bracket = new SingleTrackSystemBracket(track);
                        bracket.index = this._brackets.length;
                        this._brackets.push(bracket);
                        break;
                    case BracketExtendMode.GroupSimilarInstruments:
                        bracket = new SimilarInstrumentSystemBracket(track);
                        bracket.index = this._brackets.length;
                        this._brackets.push(bracket);
                        break;
                }
            }

            if (bracket) {
                if (!bracket.firstStaffInBracket) {
                    bracket.firstStaffInBracket = staff;
                }
                bracket.lastStaffInBracket = staff;
                // NOTE: one StaffTrackGroup can currently never have multiple brackets so we can safely keep the last known here
                group.bracket = bracket;
            }
        }
    }

    public get height(): number {
        return this._allStaves.length === 0
            ? 0
            : this._allStaves[this._allStaves.length - 1].y +
                  this._allStaves[this._allStaves.length - 1].height +
                  this.topPadding +
                  this.bottomPadding;
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

            const firstStaffInBracket = this._firstStaffInBrackets;
            const lastStaffInBracket = this._lastStaffInBrackets;

            if (firstStaffInBracket && lastStaffInBracket) {
                //
                // draw grouping line for all staves
                //
                let firstStart: number = cy + firstStaffInBracket.contentTop;
                let lastEnd: number = cy + lastStaffInBracket.contentBottom;
                let acooladeX: number = cx + firstStaffInBracket.x;
                canvas.beginPath();
                canvas.moveTo(acooladeX, firstStart);
                canvas.lineTo(acooladeX, lastEnd);
                canvas.stroke();
            }

            //
            // Draw track names
            const settings = this.layout.renderer.settings;
            const hasTrackName =
                this.index === 0 &&
                this.layout.renderer.settings.notation.isNotationElementVisible(NotationElement.TrackNames);
            canvas.font = res.effectFont;
            if (hasTrackName) {
                for (const g of this.staves) {
                    if (g.firstStaffInBracket && g.lastStaffInBracket) {
                        let firstStart: number = cy + g.firstStaffInBracket.contentTop;
                        let lastEnd: number = cy + g.lastStaffInBracket.contentBottom;

                        const textX =
                            // start at beginning of first renderer
                            cx +
                            g.firstStaffInBracket.x -
                            // left side of the bracket
                            settings.display.accoladeBarPaddingRight * this.layout.scale -
                            (g.bracket?.width ?? 0) * this.layout.scale -
                            // padding between label and bracket
                            settings.display.systemLabelPaddingRight * this.layout.scale;
                        canvas.textBaseline = TextBaseline.Middle;
                        canvas.textAlign = TextAlign.Right;
                        canvas.fillText(g.track.shortName, textX, (firstStart + lastEnd) / 2);
                    }
                }
            }

            //
            // Draw brackets
            for (const bracket of this._brackets!) {
                if (bracket.firstStaffInBracket && bracket.lastStaffInBracket) {
                    const barStartX: number = cx + bracket.firstStaffInBracket.x;
                    const barSize: number = bracket.width * this.layout.scale;
                    const barOffset: number = settings.display.accoladeBarPaddingRight * this.layout.scale;
                    const firstStart: number = cy + bracket.firstStaffInBracket.contentTop;
                    const lastEnd: number = cy + bracket.lastStaffInBracket.contentBottom;
                    let accoladeStart: number = firstStart;
                    let accoladeEnd: number = lastEnd;

                    if (bracket.drawAsBrace) {
                        canvas.fillMusicFontSymbol(
                            barStartX - barOffset - barSize,
                            accoladeEnd,
                            bracket.braceScale,
                            MusicFontSymbol.Brace
                        );
                    } else if (bracket.firstStaffInBracket !== bracket.lastStaffInBracket) {
                        const barOverflow = barSize / 2;
                        accoladeStart -= barOverflow;
                        accoladeEnd += barOverflow * 2;
                        canvas.fillRect(
                            barStartX - barOffset - barSize,
                            accoladeStart,
                            barSize,
                            Math.ceil(accoladeEnd - accoladeStart)
                        );

                        let spikeX: number = barStartX - barOffset - barSize - 0.5 * this.layout.scale;
                        canvas.fillMusicFontSymbol(spikeX, accoladeStart, 1, MusicFontSymbol.BracketTop);
                        canvas.fillMusicFontSymbol(spikeX, Math.floor(accoladeEnd), 1, MusicFontSymbol.BracketBottom);
                    }
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

        for (const b of this._brackets!) {
            b.finalize();
        }
    }

    public buildBoundingsLookup(cx: number, cy: number): void {
        if (this.layout.renderer.boundsLookup!.isFinished) {
            return;
        }
        const _firstStaffInBrackets = this._firstStaffInBrackets;
        const _lastStaffInBrackets = this._lastStaffInBrackets;
        if (!_firstStaffInBrackets || !_lastStaffInBrackets) {
            return;
        }
        cy += this.topPadding;

        let lastStaff: RenderStaff = this._allStaves[this._allStaves.length - 1];
        let visualTop: number = cy + this.y + _firstStaffInBrackets.y;
        let visualBottom: number = cy + this.y + _lastStaffInBrackets.y + _lastStaffInBrackets.height;
        let realTop: number = cy + this.y + this._allStaves[0].y;
        let realBottom: number = cy + this.y + lastStaff.y + lastStaff.height;
        let lineTop: number =
            cy +
            this.y +
            _firstStaffInBrackets.y +
            _firstStaffInBrackets.topSpacing +
            _firstStaffInBrackets.topOverflow +
            (_firstStaffInBrackets.barRenderers.length > 0 ? _firstStaffInBrackets.barRenderers[0].topPadding : 0);
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
        let x: number = this.x + _firstStaffInBrackets.x;
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
        if (!this._firstStaffInBrackets || this.layout.renderer.tracks!.length === 0) {
            return 0;
        }
        let bar: Bar = this.layout.renderer.tracks![0].staves[0].bars[index];
        let renderer: BarRendererBase = this.layout.getRendererForBar(this._firstStaffInBrackets.staveId, bar)!;
        return renderer.x;
    }
}
