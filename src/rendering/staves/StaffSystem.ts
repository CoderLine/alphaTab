import type { Bar } from '@src/model/Bar';
import type { Font } from '@src/model/Font';
import { type Track, TrackSubElement } from '@src/model/Track';
import { type ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import type { ScoreLayout } from '@src/rendering/layout/ScoreLayout';
import { BarLayoutingInfo } from '@src/rendering/staves/BarLayoutingInfo';
import { MasterBarsRenderers } from '@src/rendering/staves/MasterBarsRenderers';
import type { RenderStaff } from '@src/rendering/staves/RenderStaff';
import { StaffTrackGroup } from '@src/rendering/staves/StaffTrackGroup';
import { Bounds } from '@src/rendering/utils/Bounds';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import { StaffSystemBounds } from '@src/rendering/utils/StaffSystemBounds';
import type { RenderingResources } from '@src/RenderingResources';
import { NotationElement } from '@src/NotationSettings';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';

export abstract class SystemBracket {
    public firstStaffInBracket: RenderStaff | null = null;
    public lastStaffInBracket: RenderStaff | null = null;
    public drawAsBrace: boolean = false;
    public braceScale: number = 1;
    public width: number = 0;
    public index: number = 0;

    public abstract includesStaff(s: RenderStaff): boolean;

    public finalizeBracket() {
        // systems with just a single staff do not have a bracket
        if (this.firstStaffInBracket === this.lastStaffInBracket) {
            this.width = 0;
            return;
        }

        // SMUFL: The brace glyph should have a height of 1em, i.e. the height of a single five-line stave, and should be scaled proportionally
        const bravuraBraceHeightAtMusicFontSize = MusicFontSymbolSizes.Heights.get(MusicFontSymbol.Brace)!;
        const bravuraBraceWidthAtMusicFontSize = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.Brace)!;

        // normal bracket width
        this.width = bravuraBraceWidthAtMusicFontSize;
        if (!this.drawAsBrace || !this.firstStaffInBracket || !this.lastStaffInBracket) {
            return;
        }

        const firstStart: number = this.firstStaffInBracket.contentTop;
        const lastEnd: number = this.lastStaffInBracket.contentBottom;

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
        this.drawAsBrace = SingleTrackSystemBracket.isTrackDrawAsBrace(track);
    }

    public override includesStaff(r: RenderStaff): boolean {
        return r.modelStaff.track === this.track;
    }

    public static isTrackDrawAsBrace(track: Track) {
        return track.staves.filter(s => s.showStandardNotation as boolean).length > 1;
    }
}

class SimilarInstrumentSystemBracket extends SingleTrackSystemBracket {
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
        return this.track.playbackInfo.program === r.modelStaff.track.playbackInfo.program;
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
    private _hasSystemSeparator = false;

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
        return this.masterBarsRenderers[this.masterBarsRenderers.length - 1].lastMasterBarIndex;
    }

    public addMasterBarRenderers(tracks: Track[], renderers: MasterBarsRenderers): MasterBarsRenderers | null {
        if (tracks.length === 0) {
            return null;
        }
        this.masterBarsRenderers.push(renderers);
        renderers.layoutingInfo.preBeatSize = 0;
        let src: number = 0;
        for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
            const g: StaffTrackGroup = this.staves[i];
            for (let k: number = 0, l: number = g.staves.length; k < l; k++) {
                const s: RenderStaff = g.staves[k];
                const renderer: BarRendererBase = renderers.renderers[src++];
                s.addBarRenderer(renderer);
            }
        }
        this.calculateAccoladeSpacing(tracks);

        this.updateWidthFromLastBar();
        return renderers;
    }

    public addBars(
        tracks: Track[],
        barIndex: number,
        additionalMultiBarRestIndexes: number[] | null
    ): MasterBarsRenderers {
        const result: MasterBarsRenderers = new MasterBarsRenderers();
        result.additionalMultiBarRestIndexes = additionalMultiBarRestIndexes;
        result.layoutingInfo = new BarLayoutingInfo();
        result.masterBar = tracks[0].score.masterBars[barIndex];
        this.masterBarsRenderers.push(result);

        // add renderers
        const barLayoutingInfo: BarLayoutingInfo = result.layoutingInfo;
        for (const g of this.staves) {
            for (const s of g.staves) {
                const bar: Bar = g.track.staves[s.modelStaff.index].bars[barIndex];

                const additionalMultiBarsRestBars: Bar[] | null =
                    additionalMultiBarRestIndexes == null
                        ? null
                        : additionalMultiBarRestIndexes.map(b => g.track.staves[s.modelStaff.index].bars[b]);

                s.addBar(bar, barLayoutingInfo, additionalMultiBarsRestBars);
                const renderer: BarRendererBase = s.barRenderers[s.barRenderers.length - 1];
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
            const toRemove: MasterBarsRenderers = this.masterBarsRenderers[this.masterBarsRenderers.length - 1];
            this.masterBarsRenderers.splice(this.masterBarsRenderers.length - 1, 1);
            let width: number = 0;
            let barDisplayScale: number = 0;
            for (let i: number = 0, j: number = this._allStaves.length; i < j; i++) {
                const s: RenderStaff = this._allStaves[i];
                const lastBar: BarRendererBase = s.revertLastBar();
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
            const s: RenderStaff = this._allStaves[i];

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

            this.accoladeWidth = 0;

            const stylesheet = this.layout.renderer.score!.stylesheet;
            const hasTrackName = this.layout.renderer.settings.notation.isNotationElementVisible(
                NotationElement.TrackNames
            );

            if (hasTrackName) {
                const trackNamePolicy =
                    this.layout.renderer.tracks!.length === 1
                        ? stylesheet.singleTrackTrackNamePolicy
                        : stylesheet.multiTrackTrackNamePolicy;

                const trackNameMode =
                    this.index === 0 ? stylesheet.firstSystemTrackNameMode : stylesheet.otherSystemsTrackNameMode;

                const trackNameOrientation =
                    this.index === 0
                        ? stylesheet.firstSystemTrackNameOrientation
                        : stylesheet.otherSystemsTrackNameOrientation;

                let shouldRender = false;

                switch (trackNamePolicy) {
                    case TrackNamePolicy.Hidden:
                        break;
                    case TrackNamePolicy.FirstSystem:
                        shouldRender = this.index === 0;
                        break;
                    case TrackNamePolicy.AllSystems:
                        shouldRender = true;
                        break;
                }

                let hasAnyTrackName = false;
                if (shouldRender) {
                    const canvas: ICanvas = this.layout.renderer.canvas!;
                    const res: Font = settings.display.resources.effectFont;
                    canvas.font = res;
                    for (const t of tracks) {
                        let trackNameText = '';
                        switch (trackNameMode) {
                            case TrackNameMode.FullName:
                                trackNameText = t.name;
                                break;
                            case TrackNameMode.ShortName:
                                trackNameText = t.shortName;
                                break;
                        }

                        if (trackNameText.length > 0) {
                            hasAnyTrackName = true;
                            const size = canvas.measureText(trackNameText);
                            switch (trackNameOrientation) {
                                case TrackNameOrientation.Horizontal:
                                    this.accoladeWidth = Math.ceil(Math.max(this.accoladeWidth, size.width));
                                    break;
                                case TrackNameOrientation.Vertical:
                                    this.accoladeWidth = Math.ceil(Math.max(this.accoladeWidth, size.height));
                                    break;
                            }
                        }
                    }

                    if (hasAnyTrackName) {
                        this.accoladeWidth += settings.display.systemLabelPaddingLeft;
                        this.accoladeWidth += settings.display.systemLabelPaddingRight;
                    }
                }
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
            for (const staff of this._allStaves) {
                staff.y = currentY;
                staff.calculateHeightForAccolade();
                currentY += staff.height;
            }

            let braceWidth = 0;
            for (const b of this._brackets) {
                b.finalizeBracket();
                braceWidth = Math.max(braceWidth, b.width);
            }

            this.accoladeWidth += braceWidth;

            this.width += this.accoladeWidth;
            this.computedWidth += this.accoladeWidth;
        }
    }

    private getStaffTrackGroup(track: Track): StaffTrackGroup | null {
        for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
            const g: StaffTrackGroup = this.staves[i];
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

        if (this._hasSystemSeparator) {
            using _ = ElementStyleHelper.track(
                canvas,
                TrackSubElement.SystemSeparator,
                this._allStaves[0].modelStaff.track
            );

            canvas.fillMusicFontSymbol(
                cx + this.x,
                cy + this.y + this.height - 10,
                1,
                MusicFontSymbol.SystemDivider,
                false
            );
            canvas.fillMusicFontSymbol(
                cx + this.x + this.width - StaffSystem.SystemSignSeparatorWidth,
                cy + this.y + this.height - StaffSystem.SystemSignSeparatorPadding,
                1,
                MusicFontSymbol.SystemDivider,
                false
            );
        }
    }

    public paintPartial(cx: number, cy: number, canvas: ICanvas, startIndex: number, count: number): void {
        for (let i: number = 0, j: number = this._allStaves.length; i < j; i++) {
            this._allStaves[i].paint(cx, cy, canvas, startIndex, count);
        }
        const res: RenderingResources = this.layout.renderer.settings.display.resources;

        if (this.staves.length > 0 && startIndex === 0) {
            //
            // Draw start grouping
            //
            canvas.color = res.barSeparatorColor;

            //
            // Draw track names
            const settings = this.layout.renderer.settings;
            const hasTrackName = this.layout.renderer.settings.notation.isNotationElementVisible(
                NotationElement.TrackNames
            );
            canvas.font = res.effectFont;
            if (hasTrackName) {
                const stylesheet = this.layout.renderer.score!.stylesheet;

                const trackNamePolicy =
                    this.layout.renderer.tracks!.length === 1
                        ? stylesheet.singleTrackTrackNamePolicy
                        : stylesheet.multiTrackTrackNamePolicy;

                const trackNameMode =
                    this.index === 0 ? stylesheet.firstSystemTrackNameMode : stylesheet.otherSystemsTrackNameMode;

                const trackNameOrientation =
                    this.index === 0
                        ? stylesheet.firstSystemTrackNameOrientation
                        : stylesheet.otherSystemsTrackNameOrientation;

                let shouldRender = false;

                switch (trackNamePolicy) {
                    case TrackNamePolicy.Hidden:
                        break;
                    case TrackNamePolicy.FirstSystem:
                        shouldRender = this.index === 0;
                        break;
                    case TrackNamePolicy.AllSystems:
                        shouldRender = true;
                        break;
                }

                if (shouldRender) {
                    const oldBaseLine = canvas.textBaseline;
                    const oldTextAlign = canvas.textAlign;
                    for (const g of this.staves) {
                        if (g.firstStaffInBracket && g.lastStaffInBracket) {
                            const firstStart: number = cy + g.firstStaffInBracket.contentTop;
                            const lastEnd: number = cy + g.lastStaffInBracket.contentBottom;

                            let trackNameText = '';
                            switch (trackNameMode) {
                                case TrackNameMode.FullName:
                                    trackNameText = g.track.name;
                                    break;
                                case TrackNameMode.ShortName:
                                    trackNameText = g.track.shortName;
                                    break;
                            }

                            using _trackNameStyle = ElementStyleHelper.track(
                                canvas,
                                TrackSubElement.TrackName,
                                g.track
                            );

                            if (trackNameText.length > 0) {
                                const textEndX =
                                    // start at beginning of first renderer
                                    cx +
                                    g.firstStaffInBracket.x -
                                    // left side of the bracket
                                    settings.display.accoladeBarPaddingRight -
                                    (g.bracket?.width ?? 0) -
                                    // padding between label and bracket
                                    settings.display.systemLabelPaddingRight;

                                switch (trackNameOrientation) {
                                    case TrackNameOrientation.Horizontal:
                                        canvas.textBaseline = TextBaseline.Middle;
                                        canvas.textAlign = TextAlign.Right;
                                        canvas.fillText(trackNameText, textEndX, (firstStart + lastEnd) / 2);
                                        break;
                                    case TrackNameOrientation.Vertical:
                                        canvas.textBaseline = TextBaseline.Bottom;
                                        canvas.textAlign = TextAlign.Center;

                                        // -90° looks terrible in chrome, antialiasing seems to be disabled
                                        // adding 0.1° to re-enable antialiasing at the cost of a slight angle
                                        const chromeTextAntialiasingFix = 0.1;

                                        canvas.beginRotate(
                                            textEndX,
                                            (firstStart + lastEnd) / 2,
                                            -90 - chromeTextAntialiasingFix
                                        );
                                        canvas.fillText(trackNameText, 0, 0);
                                        canvas.endRotate();
                                        break;
                                }
                            }
                        }
                    }
                    canvas.textBaseline = oldBaseLine;
                    canvas.textAlign = oldTextAlign;
                }
            }

            if (this._allStaves.length > 0) {
                let previousStaffInBracket: RenderStaff | null = null;
                for (const s of this._allStaves) {
                    if (s.isInsideBracket) {
                        if (previousStaffInBracket !== null) {
                            const previousBottom = previousStaffInBracket.contentBottom;
                            const thisTop = s.contentTop;

                            const accoladeX: number = cx + previousStaffInBracket.x;

                            const firstLineBarRenderer = previousStaffInBracket.barRenderers[0] as LineBarRenderer;

                            using _ = ElementStyleHelper.bar(
                                canvas,
                                firstLineBarRenderer.staffLineBarSubElement,
                                firstLineBarRenderer.bar
                            );
                            const h = Math.ceil(thisTop - previousBottom);
                            canvas.fillRect(accoladeX, cy + previousBottom, 1, h);
                        }

                        previousStaffInBracket = s;
                    }
                }
            }

            //
            // Draw brackets
            for (const bracket of this._brackets!) {
                if (bracket.firstStaffInBracket && bracket.lastStaffInBracket) {
                    const barStartX: number = cx + bracket.firstStaffInBracket.x;
                    const barSize: number = bracket.width;
                    const barOffset: number = settings.display.accoladeBarPaddingRight;
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

                        const spikeX: number = barStartX - barOffset - barSize - 0.5;
                        canvas.fillMusicFontSymbol(spikeX, accoladeStart, 1, MusicFontSymbol.BracketTop);
                        canvas.fillMusicFontSymbol(spikeX, Math.floor(accoladeEnd), 1, MusicFontSymbol.BracketBottom);
                    }
                }
            }
        }
    }

    private static readonly SystemSignSeparatorHeight = 40;
    private static readonly SystemSignSeparatorPadding = 10;
    private static readonly SystemSignSeparatorWidth = 36;

    public finalizeSystem(): void {
        const settings = this.layout.renderer.settings;
        if (this.index === 0) {
            this.topPadding = settings.display.firstSystemPaddingTop;
        }

        if (this.isLast) {
            this.bottomPadding = settings.display.lastSystemPaddingBottom;
        } else if (
            this.layout.renderer.score!.stylesheet.useSystemSignSeparator &&
            this.layout.renderer.tracks!.length > 1
        ) {
            this.bottomPadding += StaffSystem.SystemSignSeparatorHeight;
            this._hasSystemSeparator = true;
        }

        let currentY: number = 0;
        for (const staff of this._allStaves) {
            staff.x = this.accoladeWidth;
            staff.y = currentY;
            staff.finalizeStaff();
            currentY += staff.height;
        }

        for (const b of this._brackets!) {
            b.finalizeBracket();
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

        const lastStaff: RenderStaff = this._allStaves[this._allStaves.length - 1];
        const visualTop: number = cy + this.y + _firstStaffInBrackets.y;
        const visualBottom: number = cy + this.y + _lastStaffInBrackets.y + _lastStaffInBrackets.height;
        const realTop: number = cy + this.y + this._allStaves[0].y;
        const realBottom: number = cy + this.y + lastStaff.y + lastStaff.height;
        const lineTop: number =
            cy +
            this.y +
            _firstStaffInBrackets.y +
            _firstStaffInBrackets.topSpacing +
            _firstStaffInBrackets.topOverflow +
            (_firstStaffInBrackets.barRenderers.length > 0 ? _firstStaffInBrackets.barRenderers[0].topPadding : 0);
        const lineBottom: number =
            cy +
            this.y +
            lastStaff.y +
            lastStaff.height -
            lastStaff.bottomSpacing -
            lastStaff.bottomOverflow -
            (lastStaff.barRenderers.length > 0 ? lastStaff.barRenderers[0].bottomPadding : 0);
        const visualHeight: number = visualBottom - visualTop;
        const lineHeight: number = lineBottom - lineTop;
        const realHeight: number = realBottom - realTop;
        const x: number = this.x + _firstStaffInBrackets.x;
        const staffSystemBounds = new StaffSystemBounds();
        staffSystemBounds.visualBounds = new Bounds();
        staffSystemBounds.visualBounds.x = cx + this.x;
        staffSystemBounds.visualBounds.y = cy + this.y;
        staffSystemBounds.visualBounds.w = this.width;
        staffSystemBounds.visualBounds.h = this.height - this.topPadding - this.bottomPadding;
        staffSystemBounds.realBounds = new Bounds();
        staffSystemBounds.realBounds.x = cx + this.x;
        staffSystemBounds.realBounds.y = cy + this.y;
        staffSystemBounds.realBounds.w = this.width;
        staffSystemBounds.realBounds.h = this.height;
        this.layout.renderer.boundsLookup!.addStaffSystem(staffSystemBounds);
        const masterBarBoundsLookup: Map<number, MasterBarBounds> = new Map<number, MasterBarBounds>();
        for (let i: number = 0; i < this.staves.length; i++) {
            for (const staff of this.staves[i].stavesRelevantForBoundsLookup) {
                for (const renderer of staff.barRenderers) {
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
        const bar: Bar = this.layout.renderer.tracks![0].staves[0].bars[index];
        const renderer: BarRendererBase = this.layout.getRendererForBar(this._firstStaffInBrackets.staffId, bar)!;
        return renderer.x;
    }
}
