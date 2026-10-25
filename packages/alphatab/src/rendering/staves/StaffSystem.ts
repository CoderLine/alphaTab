import type { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Font } from '@coderline/alphatab/model/Font';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import {
    BracketExtendMode,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy,
    TuningDisplayMode
} from '@coderline/alphatab/model/RenderStylesheet';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { type Track, TrackSubElement } from '@coderline/alphatab/model/Track';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { CanvasHelper, type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { Profiler } from '@coderline/alphatab/profiling/Profiler';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import type { ScoreLayout } from '@coderline/alphatab/rendering/layout/ScoreLayout';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { InlineTuningGlyph } from '@coderline/alphatab/rendering/glyphs/InlineTuningGlyph';
import { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import { MasterBarsRenderers } from '@coderline/alphatab/rendering/staves/MasterBarsRenderers';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { StaffTrackGroup } from '@coderline/alphatab/rendering/staves/StaffTrackGroup';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
import { StaffSystemBounds } from '@coderline/alphatab/rendering/utils/StaffSystemBounds';

/**
 * @internal
 */
export abstract class SystemBracket {
    private _system: StaffSystem;
    public firstStaffInBracket?: RenderStaff;
    public lastStaffInBracket?: RenderStaff;
    public firstVisibleStaffInBracket?: RenderStaff;
    public lastVisibleStaffInBracket?: RenderStaff;
    public drawAsBrace: boolean = false;
    public braceScale: number = 1;
    public width: number = 0;
    public index: number = 0;

    public canPaint = false;

    // Captured on the first updateCanPaint call; locks whether this bracket reserves
    // horizontal space in the accolade. A bracket that wasn't initially paintable
    // (deferred-visibility staff) never joins the accolade even if it becomes paintable
    // later, so staves stay aligned with bracket-less systems on the same page.
    private _initialPaintabilityCaptured = false;
    public reservesAccoladeSpace = false;

    public constructor(system: StaffSystem) {
        this._system = system;
    }

    public abstract includesStaff(s: RenderStaff): boolean;

    /**
     * Clears the state derived from the bars of the system; the staves in the bracket are kept.
     */
    public reset(): void {
        this.firstVisibleStaffInBracket = undefined;
        this.lastVisibleStaffInBracket = undefined;
        this.braceScale = 1;
        this.width = 0;
        this.canPaint = false;
        this._initialPaintabilityCaptured = false;
        this.reservesAccoladeSpace = false;
    }

    public updateCanPaint() {
        let firstVisibleStaff: RenderStaff | undefined = undefined;
        let lastVisibleStaff: RenderStaff | undefined = undefined;
        for (let i = this.firstStaffInBracket!.index; i <= this.lastStaffInBracket!.index; i++) {
            const staff = this._system.allStaves[i];
            if (staff.isVisible) {
                if (!firstVisibleStaff) {
                    firstVisibleStaff = staff;
                }
                lastVisibleStaff = staff;
            }
        }
        this.firstVisibleStaffInBracket = firstVisibleStaff;
        this.lastVisibleStaffInBracket = lastVisibleStaff;

        if (!firstVisibleStaff || !lastVisibleStaff) {
            this.canPaint = false;
        } else {
            // single staff brackets?
            const singleStaffBrackets = this._system.layout.renderer.score!.stylesheet.showSingleStaffBrackets;
            if (!singleStaffBrackets && firstVisibleStaff === lastVisibleStaff) {
                this.canPaint = false;
            } else {
                this.canPaint = true;
            }
        }

        if (!this._initialPaintabilityCaptured) {
            this.reservesAccoladeSpace = this.canPaint;
            this._initialPaintabilityCaptured = true;
        }
    }

    public finalizeBracket(smuflMetrics: EngravingSettings) {
        if (!this.canPaint) {
            this.width = 0;
            return;
        }

        // SMUFL: The brace glyph should have a height of 1em, i.e. the height of a single five-line stave, and should be scaled proportionally
        const bravuraBraceHeightAtMusicFontSize = smuflMetrics.glyphHeights.get(MusicFontSymbol.Brace)!;
        const bravuraBraceWidthAtMusicFontSize = smuflMetrics.glyphWidths.get(MusicFontSymbol.Brace)!;

        // normal bracket width
        if (this.drawAsBrace) {
            this.width = bravuraBraceWidthAtMusicFontSize;
        } else {
            this.width = smuflMetrics.bracketThickness;
        }

        if (!this.drawAsBrace) {
            return;
        }

        const firstStart: number = this.firstVisibleStaffInBracket!.contentTop;
        const lastEnd: number = this.lastVisibleStaffInBracket!.contentBottom;

        const requiredHeight = lastEnd - firstStart;
        const requiredScaleForBracket = requiredHeight / bravuraBraceHeightAtMusicFontSize;
        this.braceScale = requiredScaleForBracket;
        this.width = bravuraBraceWidthAtMusicFontSize * this.braceScale;
    }
}

/**
 * @internal
 */
class SingleTrackSystemBracket extends SystemBracket {
    protected track: Track;

    public constructor(system: StaffSystem, track: Track) {
        super(system);
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

/**
 * @internal
 */
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
 * @internal
 */
export class StaffSystem {
    // Single-slot memo for the track-name (measureText-driven) component of
    // `accoladeWidth`. -1 means "not yet computed"; >=0 is the cached value.
    // The track-name component is determined by inputs (tracks array, stylesheet,
    // track-name font, padding) that are stable across a system's lifetime.
    private _trackNamesAccoladeContribution: number = -1;

    /**
     * Visibility bitset of {@link allStaves} (one bit per staff, MSB first) at
     * the time `accoladeWidth` was last fully recomputed. `-1` = uncomputed.
     * Used by `_calculateAccoladeSpacing` to skip the full recompute when
     * visibility is unchanged. Limit: 53 staves (JS safe-integer range).
     */
    private _accoladeVisibilityFingerprint: number = -1;

    private _brackets: SystemBracket[] = [];
    private _staffToBracket = new Map<RenderStaff, SystemBracket>();
    private _inlineTuningGlyphs: InlineTuningGlyph[] = [];
    private _inlineTuningWidth = 0;
    private _contentHeight = 0;

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
     * The current width of the system to which the content is scaled.
     * Includes accolade (tracknames, brackets etc) and the content.
     *
     * Used to determine the final size needed for rendering.
     */
    public width: number = 0;

    /**
     * The minimum/default width to which the system was sized
     * when performing the layout. This is the size of the system if no
     * fitting/resizing is performed.
     *
     * Includes accolade (tracknames, brackets etc) and the content.
     *
     * Used to perform a resizing/refitting of the system.
     */
    public computedWidth: number = 0;

    /**
     * This is the simple sum of all display scales of the bars in this system.
     * This value is mainly used in the parchment style layout for correct scaling of the bars.
     */
    public totalBarDisplayScale: number = 0;

    /**
     * Sum of per-bar {@link MasterBarsRenderers.maxFixedOverhead} across the system. The layout-mode
     * horizontal scaling pass subtracts this from the available staff width before distributing the
     * remainder across bars.
     */
    public totalFixedOverhead: number = 0;

    /**
     * Sum of per-bar {@link MasterBarsRenderers.maxContentWidth} across the system. Used as the
     * denominator when distributing staff width in modes that weight bars by natural content width
     * (Page layout with `SystemsLayoutMode.Automatic`).
     */
    public totalContentWidth: number = 0;

    public isLast: boolean = false;
    public masterBarsRenderers: MasterBarsRenderers[] = [];
    public staves: StaffTrackGroup[] = [];
    public layout!: ScoreLayout;

    public topPadding: number;
    public bottomPadding: number;
    public allStaves: RenderStaff[] = [];
    public firstVisibleStaff?: RenderStaff;

    public constructor(layout: ScoreLayout) {
        this.layout = layout;
        this.topPadding = layout.renderer.settings.display.systemPaddingTop;
        this.bottomPadding = layout.renderer.settings.display.systemPaddingBottom;
    }

    /**
     * Prepares the system to be filled with bars again: the staves, track groups and brackets are
     * kept, everything derived from the bars is cleared.
     */
    public reset(): void {
        const display = this.layout.renderer.settings.display;
        this._accoladeVisibilityFingerprint = -1;
        this._contentHeight = 0;
        this._hasSystemSeparator = false;
        this.x = 0;
        this.y = 0;
        this.accoladeWidth = 0;
        this.isFull = false;
        this.width = 0;
        this.computedWidth = 0;
        this.totalBarDisplayScale = 0;
        this.totalFixedOverhead = 0;
        this.totalContentWidth = 0;
        this.isLast = false;
        this.masterBarsRenderers.splice(0, this.masterBarsRenderers.length);
        this.topPadding = display.systemPaddingTop;
        this.bottomPadding = display.systemPaddingBottom;
        this.firstVisibleStaff = undefined;
        for (const g of this.staves) {
            g.firstVisibleStaff = undefined;
            g.lastVisibleStaff = undefined;
        }
        for (const s of this.allStaves) {
            s.reset();
        }
        for (const b of this._brackets) {
            b.reset();
        }
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
        renderers.layoutingInfo.resetHeaderRods();
        let src: number = 0;

        let firstVisibleStaff: RenderStaff | undefined = undefined;
        let anyStaffVisible = false;

        for (const g of this.staves) {
            let firstVisibleStaffInGroup: RenderStaff | undefined = undefined;
            let lastVisibleStaffInGroup: RenderStaff | undefined = undefined;

            for (const s of g.staves) {
                const renderer: BarRendererBase = renderers.renderers[src++];
                s.addBarRenderer(renderer);

                if (s.isVisible) {
                    anyStaffVisible = true;
                    if (!firstVisibleStaffInGroup) {
                        firstVisibleStaffInGroup = s;
                    }
                    if (!firstVisibleStaff) {
                        firstVisibleStaff = s;
                    }

                    lastVisibleStaffInGroup = s;
                }
            }

            g.firstVisibleStaff = firstVisibleStaffInGroup;
            g.lastVisibleStaff = lastVisibleStaffInGroup;
            if (!firstVisibleStaff) {
                firstVisibleStaff = firstVisibleStaffInGroup;
            }
        }

        if (!anyStaffVisible) {
            const group = this.staves[0];
            const firstStaff = group.staves[0];
            firstStaff.isVisible = true;
            group.firstVisibleStaff = firstStaff;
            group.lastVisibleStaff = firstStaff;
            firstVisibleStaff = firstStaff;
        }

        this.firstVisibleStaff = firstVisibleStaff;
        this._calculateAccoladeSpacing(tracks);

        this._applyLayoutAndUpdateWidth();
        return renderers;
    }

    /**
     * Creates and lays out the renderers of the master bar as if it were the next bar of this
     * system, without adding them (see {@link addMasterBarRenderers}).
     */
    public measureBars(
        tracks: Track[],
        barIndex: number,
        additionalMultiBarRestIndexes: number[] | null
    ): MasterBarsRenderers {
        const result: MasterBarsRenderers = new MasterBarsRenderers();
        result.additionalMultiBarRestIndexes = additionalMultiBarRestIndexes;
        const display = this.layout.renderer.settings.display;
        const sharesMinDuration = this.layout.sharesMinDurationAcrossBars;
        result.layoutingInfo = new BarLayoutingInfo(
            display.spacingRatio,
            display.resources.engravingSettings.beatContentPadding,
            display.resources.engravingSettings.barlineContentPadding,
            sharesMinDuration ? this.layout.referenceMinDuration : BarLayoutingInfo.defaultMinDuration,
            !sharesMinDuration
        );
        result.masterBar = tracks[0].score.masterBars[barIndex];

        for (const g of this.staves) {
            for (const s of g.staves) {
                const bar: Bar = g.track.staves[s.modelStaff.index].bars[barIndex];
                const additionalMultiBarsRestBars: Bar[] | null =
                    additionalMultiBarRestIndexes == null
                        ? null
                        : additionalMultiBarRestIndexes.map(b => g.track.staves[s.modelStaff.index].bars[b]);
                const renderer = s.createBarRenderer(bar, result.layoutingInfo, additionalMultiBarsRestBars);
                result.renderers.push(renderer);
                if (renderer.isLinkedToPrevious) {
                    result.isLinkedToPrevious = true;
                }
                if (bar.simileMark === SimileMark.SecondOfDouble) {
                    result.canWrap = false;
                }
            }
        }

        result.layoutingInfo.finish();
        return result;
    }

    /**
     * The width the master bar would have as the next bar of this system, or as the bar after
     * `pending` more bars. Positions the renderers on the staves of this system without adding them.
     */
    public measureWidth(renderers: MasterBarsRenderers, pending: number = 0): number {
        const info = renderers.layoutingInfo;
        info.resetHeaderRods();
        let src: number = 0;
        for (const g of this.staves) {
            for (const s of g.staves) {
                const renderer: BarRendererBase = renderers.renderers[src++];
                renderer.staff = s;
                renderer.index = s.barRenderers.length + pending;
                renderer.registerHeaderForPosition();
            }
        }
        return info.naturalBarWidth(this.layout.renderer.settings.display.stretchForce);
    }

    public addBars(
        tracks: Track[],
        barIndex: number,
        additionalMultiBarRestIndexes: number[] | null
    ): MasterBarsRenderers {
        const result: MasterBarsRenderers = new MasterBarsRenderers();
        result.additionalMultiBarRestIndexes = additionalMultiBarRestIndexes;
        const display = this.layout.renderer.settings.display;
        const sharesMinDuration = this.layout.sharesMinDurationAcrossBars;
        result.layoutingInfo = new BarLayoutingInfo(
            display.spacingRatio,
            display.resources.engravingSettings.beatContentPadding,
            display.resources.engravingSettings.barlineContentPadding,
            sharesMinDuration ? this.layout.referenceMinDuration : BarLayoutingInfo.defaultMinDuration,
            !sharesMinDuration
        );
        result.masterBar = tracks[0].score.masterBars[barIndex];
        this.masterBarsRenderers.push(result);

        let firstVisibleStaff: RenderStaff | undefined = undefined;
        let anyStaffVisible = false;
        // add renderers
        const barLayoutingInfo: BarLayoutingInfo = result.layoutingInfo;
        for (const g of this.staves) {
            let firstVisibleStaffInGroup: RenderStaff | undefined = undefined;
            let lastVisibleStaffInGroup: RenderStaff | undefined = undefined;

            for (const s of g.staves) {
                const bar: Bar = g.track.staves[s.modelStaff.index].bars[barIndex];

                const additionalMultiBarsRestBars: Bar[] | null =
                    additionalMultiBarRestIndexes == null
                        ? null
                        : additionalMultiBarRestIndexes.map(b => g.track.staves[s.modelStaff.index].bars[b]);

                s.addBar(bar, barLayoutingInfo, additionalMultiBarsRestBars);

                if (s.isVisible) {
                    anyStaffVisible = true;
                    if (!firstVisibleStaffInGroup) {
                        firstVisibleStaffInGroup = s;
                    }
                    lastVisibleStaffInGroup = s;
                }

                const renderer: BarRendererBase = s.barRenderers[s.barRenderers.length - 1];
                result.renderers.push(renderer);
                if (renderer.isLinkedToPrevious) {
                    result.isLinkedToPrevious = true;
                }
                if (bar.simileMark === SimileMark.SecondOfDouble) {
                    result.canWrap = false;
                }
            }
            g.firstVisibleStaff = firstVisibleStaffInGroup;
            g.lastVisibleStaff = lastVisibleStaffInGroup;
            if (!firstVisibleStaff) {
                firstVisibleStaff = firstVisibleStaffInGroup;
            }
        }

        if (!anyStaffVisible) {
            const group = this.staves[0];
            const firstStaff = group.staves[0];
            firstStaff.isVisible = true;
            group.firstVisibleStaff = firstStaff;
            group.lastVisibleStaff = firstStaff;
            firstVisibleStaff = firstStaff;
        }

        this.firstVisibleStaff = firstVisibleStaff;

        this._calculateAccoladeSpacing(tracks);

        barLayoutingInfo.finish();

        // ensure same widths of new renderer
        result.width = this._applyLayoutAndUpdateWidth();

        return result;
    }

    public getBarDisplayScale(renderer: BarRendererBase) {
        return this.staves.length > 1 ? renderer.bar.masterBar.displayScale : renderer.bar.displayScale;
    }

    public revertLastBar(): MasterBarsRenderers | null {
        if (this.masterBarsRenderers.length > 1) {
            const toRemove: MasterBarsRenderers = this.masterBarsRenderers[this.masterBarsRenderers.length - 1];
            this.masterBarsRenderers.splice(this.masterBarsRenderers.length - 1, 1);
            let width: number = 0;
            let barDisplayScale = 0;

            let firstVisibleStaff: RenderStaff | undefined = undefined;
            for (const g of this.staves) {
                let firstVisibleStaffInGroup: RenderStaff | undefined = undefined;
                let lastVisibleStaffInGroup: RenderStaff | undefined = undefined;

                for (const s of g.staves) {
                    const lastBar: BarRendererBase = s.revertLastBar();
                    const computedWidth = lastBar.computedWidth;
                    if (computedWidth > width) {
                        width = computedWidth;
                    }
                    lastBar.afterReverted();

                    barDisplayScale = this.getBarDisplayScale(lastBar);

                    if (s.isVisible) {
                        if (!firstVisibleStaffInGroup) {
                            firstVisibleStaffInGroup = s;
                        }
                        lastVisibleStaffInGroup = s;
                    }
                }

                g.firstVisibleStaff = firstVisibleStaffInGroup;
                g.lastVisibleStaff = lastVisibleStaffInGroup;
                if (!firstVisibleStaff) {
                    firstVisibleStaff = firstVisibleStaffInGroup;
                }
            }
            this.firstVisibleStaff = firstVisibleStaff;

            this.width -= width;
            this.computedWidth -= width;
            this.totalBarDisplayScale -= barDisplayScale;
            this.totalFixedOverhead -= toRemove.maxFixedOverhead;
            this.totalContentWidth -= toRemove.maxContentWidth;

            // Re-run accolade spacing now that visibility has settled. The
            // brace contribution may shrink if a visible staff is no longer
            // visible after this revert.
            this._calculateAccoladeSpacing(this.layout.renderer.tracks!);

            return toRemove;
        }
        return null;
    }

    private _applyLayoutAndUpdateWidth(): number {
        let realWidth: number = 0;
        let maxFixedOverhead: number = 0;
        let maxContentWidth: number = 0;

        let barDisplayScale = 0;
        for (const s of this.allStaves) {
            const last = s.barRenderers[s.barRenderers.length - 1];
            last.applyLayoutingInfo();

            barDisplayScale = this.getBarDisplayScale(last);

            if (last.computedWidth > realWidth) {
                realWidth = last.computedWidth;
            }

            const overhead = last.fixedOverhead;
            if (overhead > maxFixedOverhead) {
                maxFixedOverhead = overhead;
            }
            const content = Math.max(0, last.computedWidth - overhead);
            if (content > maxContentWidth) {
                maxContentWidth = content;
            }
        }

        const renderers = this.masterBarsRenderers[this.masterBarsRenderers.length - 1];
        renderers.maxFixedOverhead = maxFixedOverhead;
        renderers.maxContentWidth = maxContentWidth;

        this.totalBarDisplayScale += barDisplayScale;
        this.totalFixedOverhead += maxFixedOverhead;
        this.totalContentWidth += maxContentWidth;
        this.width += realWidth;
        this.computedWidth += realWidth;

        return realWidth;
    }

    private _calculateAccoladeSpacing(tracks: Track[]): void {
        const settings = this.layout.renderer.settings;

        // Full recompute only when visibility changes (initial call,
        // revertLastBar flipping a staff invisible, or an added bar flipping a
        // previously-invisible staff visible). On stable visibility we still
        // refresh bracket `width` for paint, but leave `accoladeWidth` /
        // `system.width` locked at their first-pass value — the brace
        // contribution would otherwise grow with the overflow accumulators that
        // `calculateHeightForAccolade` reads.
        const visibilityFingerprint = this._computeVisibilityFingerprint();
        if (this._accoladeVisibilityFingerprint === visibilityFingerprint) {
            for (const b of this._brackets) {
                b.updateCanPaint();
                b.finalizeBracket(settings.display.resources.engravingSettings);
            }
            return;
        }

        // Successive recomputes must converge — unwind the previous accolade
        // contribution from system width totals before re-deriving it.
        const prevContribution = this.accoladeWidth;
        this.width -= prevContribution;
        this.computedWidth -= prevContribution;
        this.accoladeWidth = 0;

        const hasTrackName = settings.notation.isNotationElementVisible(NotationElement.TrackNames);

        if (hasTrackName) {
            // The track-name component is determined by the tracks array, the
            // stylesheet, the track-name font and padding settings — all stable
            // within a system's lifetime. Memoize the computed contribution so
            // measureText doesn't run on every addBars/revertLastBar invocation.
            if (this._trackNamesAccoladeContribution >= 0) {
                this.accoladeWidth = this._trackNamesAccoladeContribution;
            } else {
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

                let hasAnyTrackName = false;
                if (shouldRender) {
                    const canvas: ICanvas = this.layout.renderer.canvas!;
                    const res: Font = settings.display.resources.elementFonts.get(NotationElement.TrackNames)!;
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

                    // Accumulates onto the freshly-zeroed accoladeWidth within
                    // this invocation; not a cross-call accumulator.
                    this.accoladeWidth += settings.display.systemLabelPaddingLeft;
                    if (hasAnyTrackName) {
                        this.accoladeWidth += settings.display.systemLabelPaddingRight;
                    }
                }

                this._trackNamesAccoladeContribution = this.accoladeWidth;
            }
        }

        this._createInlineTuningGlyphs();
        this.accoladeWidth += this._inlineTuningWidth;

        let currentY: number = 0;
        for (const staff of this.allStaves) {
            staff.y = currentY;
            staff.calculateHeightForAccolade();
            currentY += staff.height;
        }

        let braceWidth = 0;
        for (const b of this._brackets) {
            b.updateCanPaint();
            b.finalizeBracket(settings.display.resources.engravingSettings);
            if (b.reservesAccoladeSpace) {
                braceWidth = Math.max(braceWidth, b.width);
            }
        }

        this.accoladeWidth += braceWidth;

        this.width += this.accoladeWidth;
        this.computedWidth += this.accoladeWidth;

        this._accoladeVisibilityFingerprint = visibilityFingerprint;
    }

    /**
     * Resets cross-bar staff state in {@link RenderStaff._sharedLayoutData}
     * before `alignGlyphs` runs, so the max-of-idempotent
     * `EffectInfo.onAlignGlyphs` writers start from a clean slate each cycle.
     * Per-revert resets are handled separately by {@link RenderStaff.revertLastBar}.
     */
    public resetAllStavesSharedLayoutData(): void {
        for (const s of this.allStaves) {
            s.resetSharedLayoutData();
        }
    }

    /**
     * Clears the staff overflows before the bars of a fully assembled system are scaled; the bars
     * register them again from their positioned content, the effect placement adds the bands.
     */
    public resetAllStavesOverflows(): void {
        for (const s of this.allStaves) {
            s.resetOverflows();
        }
    }

    private _computeVisibilityFingerprint(): number {
        // Pack one bit per staff into a numeric bitset. `* 2` (not `<< 1`) so
        // we stay in JS double-precision safe-integer range; bitwise ops would
        // cap at 32 bits. See `_accoladeVisibilityFingerprint` for the limit.
        let fingerprint = 0;
        for (const s of this.allStaves) {
            fingerprint = fingerprint * 2 + (s.isVisible ? 1 : 0);
        }
        return fingerprint;
    }

    private _createInlineTuningGlyphs(): void {
        this._inlineTuningGlyphs = [];
        this._inlineTuningWidth = 0;

        const score = this.layout.renderer.score!;
        if (
            this.index !== 0 ||
            !this.layout.renderer.settings.notation.isNotationElementVisible(NotationElement.GuitarTuning) ||
            !score.stylesheet.globalDisplayTuning ||
            score.stylesheet.tuningDisplayMode !== TuningDisplayMode.Staff
        ) {
            return;
        }

        for (const staff of this.allStaves) {
            if (!this._shouldCreateInlineTuningGlyph(staff)) {
                continue;
            }

            const glyph = new InlineTuningGlyph(staff);
            glyph.renderer = staff.barRenderers[0];
            glyph.doLayout();
            this._inlineTuningGlyphs.push(glyph);
            this._inlineTuningWidth = Math.max(this._inlineTuningWidth, glyph.width);
        }
    }

    private _shouldCreateInlineTuningGlyph(staff: RenderStaff): boolean {
        const score = this.layout.renderer.score!;
        if (!staff.isVisible || staff.staffId !== TabBarRenderer.StaffId) {
            return false;
        }

        const modelStaff = staff.modelStaff;
        if (
            modelStaff.isPercussion ||
            !modelStaff.isStringed ||
            !modelStaff.showTablature ||
            modelStaff.stringTuning.tunings.length === 0
        ) {
            return false;
        }

        const perTrackDisplayTuning = score.stylesheet.perTrackDisplayTuning;
        return (
            !perTrackDisplayTuning ||
            !perTrackDisplayTuning.has(modelStaff.track.index) ||
            perTrackDisplayTuning.get(modelStaff.track.index) !== false
        );
    }

    private _getInlineTuningWidthForTrackGroup(group: StaffTrackGroup): number {
        let width = 0;
        for (const glyph of this._inlineTuningGlyphs) {
            if (glyph.staff.staffTrackGroup === group) {
                width = Math.max(width, glyph.width);
            }
        }
        return width;
    }

    private _getStaffTrackGroup(track: Track): StaffTrackGroup | null {
        for (let i: number = 0, j: number = this.staves.length; i < j; i++) {
            const g: StaffTrackGroup = this.staves[i];
            if (g.track === track) {
                return g;
            }
        }
        return null;
    }

    public addStaff(staff: RenderStaff): void {
        const track = staff.modelStaff.track;
        let group: StaffTrackGroup | null = this._getStaffTrackGroup(track);
        if (!group) {
            group = new StaffTrackGroup(this, track);
            this.staves.push(group);
        }
        staff.staffTrackGroup = group;
        staff.system = this;
        staff.index = this.allStaves.length;
        this.allStaves.push(staff);
        group.addStaff(staff);

        let bracket = this._brackets.find(b => b.includesStaff(staff));
        if (!bracket) {
            switch (track.score.stylesheet.bracketExtendMode) {
                case BracketExtendMode.NoBrackets:
                    break;
                case BracketExtendMode.GroupStaves:
                    // when grouping staves, we create one bracket for the whole track across all staves
                    bracket = new SingleTrackSystemBracket(this, track);
                    bracket.index = this._brackets.length;
                    this._brackets.push(bracket);
                    break;
                case BracketExtendMode.GroupSimilarInstruments:
                    bracket = new SimilarInstrumentSystemBracket(this, track);
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
            this._staffToBracket.set(staff, bracket);
        }
    }

    public get height(): number {
        return Math.ceil(this._contentHeight + this.topPadding + this.bottomPadding);
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // const c = canvas.color;
        // canvas.color = Color.random(255);
        // canvas.strokeRect(cx + this.x, cy + this.y, this.width, this.height);
        // canvas.color = c;

        this.paintPartial(cx + this.x, cy + this.y + this.topPadding, canvas, 0, this.masterBarsRenderers.length);

        if (this._hasSystemSeparator) {
            using _ = ElementStyleHelper.track(
                canvas,
                TrackSubElement.SystemSeparator,
                this.allStaves[0].modelStaff.track
            );

            // NOTE: the divider is currently not "nicely" centered between the systems as this would lead to cropping

            // NOTE: Prevent cropping of separator if it overlaps
            const smuflMetrics = this.layout.renderer.settings.display.resources.engravingSettings;
            const overlap = Math.min(0, smuflMetrics.glyphBottom.get(MusicFontSymbol.SystemDivider) ?? 0);
            CanvasHelper.fillMusicFontSymbolSafe(
                canvas,
                cx + this.x,
                cy + this.y + this.height + overlap,
                1,
                MusicFontSymbol.SystemDivider,
                false
            );
            CanvasHelper.fillMusicFontSymbolSafe(
                canvas,
                cx + this.x + this.width - smuflMetrics.glyphWidths.get(MusicFontSymbol.SystemDivider)!,
                cy + this.y + this.height + overlap,
                1,
                MusicFontSymbol.SystemDivider,
                false
            );
        }
    }

    public paintPartial(cx: number, cy: number, canvas: ICanvas, startIndex: number, count: number): void {
        for (const s of this.allStaves) {
            if (s.isVisible) {
                s.paint(cx, cy, canvas, startIndex, count);
            }
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
            canvas.font = res.elementFonts.get(NotationElement.TrackNames)!;
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
                        if (g.firstVisibleStaff) {
                            const firstStart: number = cy + g.firstVisibleStaff.contentTop;
                            const lastEnd: number = cy + g.lastVisibleStaff!.contentBottom;

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
                                    g.staves[0].x -
                                    // left side of the bracket
                                    settings.display.accoladeBarPaddingRight -
                                    this._getInlineTuningWidthForTrackGroup(g) -
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

            this._paintInlineTunings(cx, cy, canvas);

            const needsSystemBarLine = !this.layout.renderer.score!.stylesheet.extendBarLines;
            if (this.allStaves.length > 0 && needsSystemBarLine) {
                let previousStaffInBracket: RenderStaff | null = null;
                for (const s of this.allStaves) {
                    if (!s.isVisible) {
                        continue;
                    }

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
                        canvas.fillRect(accoladeX, cy + previousBottom, res.engravingSettings.thinBarlineThickness, h);
                    }

                    previousStaffInBracket = s;
                }
            }

            //
            // Draw brackets
            this._paintBrackets(cx, cy, canvas);
        }
    }

    private _paintInlineTunings(cx: number, cy: number, canvas: ICanvas): void {
        const accoladeBarPaddingRight = this.layout.renderer.settings.display.accoladeBarPaddingRight;
        for (const glyph of this._inlineTuningGlyphs) {
            // Place labels between the track name and the bracket:
            // shift the glyph's anchor left by the bracket's paint area
            // (accolade bar padding + bracket width) so the tuning sits on the
            // outside of the bracket rather than inside it.
            const bracket = this._staffToBracket.has(glyph.staff) ? this._staffToBracket.get(glyph.staff)! : undefined;
            const bracketOffset = bracket && bracket.width > 0 ? accoladeBarPaddingRight + bracket.width : 0;
            glyph.paint(cx + glyph.staff.x - bracketOffset, cy + glyph.staff.y, canvas);
        }
    }

    private _paintBrackets(cx: number, cy: number, canvas: ICanvas) {
        const settings = this.layout.renderer.settings;

        for (const bracket of this._brackets!) {
            if (bracket.canPaint) {
                const barStartX: number = cx + bracket.firstVisibleStaffInBracket!.x;
                const barSize: number = bracket.width;
                const barOffset: number = settings.display.accoladeBarPaddingRight;
                const firstStart: number = cy + bracket.firstVisibleStaffInBracket!.contentTop;
                const lastEnd: number = cy + bracket.lastVisibleStaffInBracket!.contentBottom;
                let accoladeStart: number = firstStart;
                let accoladeEnd: number = lastEnd;

                if (bracket.drawAsBrace) {
                    CanvasHelper.fillMusicFontSymbolSafe(
                        canvas,
                        barStartX - barOffset - barSize,
                        accoladeEnd,
                        bracket.braceScale,
                        MusicFontSymbol.Brace
                    );
                } else if (bracket.firstVisibleStaffInBracket !== bracket.lastVisibleStaffInBracket) {
                    // brackets typically overflow by 1/4 staff-space
                    const smuflMetrics = settings.display.resources.engravingSettings;

                    const bracketOverflow = smuflMetrics.oneStaffSpace * 0.25;
                    accoladeStart -= bracketOverflow;
                    accoladeEnd += bracketOverflow;

                    // we shift the bar slightly inward so that the spike will hide the edge
                    // if we're precise we might see a slight light line on subpixel level
                    const barShift = 3;
                    canvas.fillRect(
                        barStartX - barOffset - barSize,
                        accoladeStart - barShift,
                        barSize,
                        Math.ceil(accoladeEnd - accoladeStart + barShift * 2)
                    );

                    const spikeX: number = barStartX - barOffset - barSize;
                    CanvasHelper.fillMusicFontSymbolSafe(canvas, spikeX, accoladeStart, 1, MusicFontSymbol.BracketTop);
                    CanvasHelper.fillMusicFontSymbolSafe(
                        canvas,
                        spikeX,
                        Math.floor(accoladeEnd),
                        1,
                        MusicFontSymbol.BracketBottom
                    );
                }
            }
        }
    }

    public finalizeSystem(): void {
        Profiler.begin('layout.finalizeSystem');
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
            // NOTE: Reuse padding to place separato
            const neededHeight = settings.display.resources.engravingSettings.glyphHeights.get(
                MusicFontSymbol.SystemDivider
            )!;
            this.bottomPadding = Math.max(this.bottomPadding, neededHeight);
            this._hasSystemSeparator = true;
        }

        const anyStaffVisible = this._finalizeTrackGroups();

        // for now we always force one staff to be visible.
        // making also whole systems invisible needs separate attention (also on player cursor handling)
        if (!anyStaffVisible) {
            const group = this.staves[0];
            const firstStaff = group.staves[0];
            firstStaff.isVisible = true;
            this._finalizeTrackGroups(true);
        }

        for (const b of this._brackets!) {
            b.finalizeBracket(settings.display.resources.engravingSettings);
        }
        Profiler.end('layout.finalizeSystem');
    }

    /**
     * Calculates the additional vertical space needed between two adjacent staves so that
     * their content (skylines) keeps at least the given padding.
     * @param upper The upper staff (already positioned and finalized).
     * @param lower The lower staff (finalized, positioned directly below `upper`).
     * @param padding The minimum padding between the content of the staves.
     * @returns The additional space to add between the staves (0 if the existing space is enough).
     */
    private static _requiredStaffContentPadding(
        upper: RenderStaff,
        lower: RenderStaff,
        padding: number,
        horizontalPadding: number
    ): number {
        const upperSky = upper.systemSkyline.downSky;
        const lowerSky = lower.systemSkyline.upSky;

        // the maximum combined extent of both staves into the space between them.
        // content of the other staff horizontally closer than `horizontalPadding` to a segment counts as well
        // (e.g. a fingering number right next to a stem of the staff above).
        let contentExtent = 0;
        for (let i = 0, n = upperSky.segmentCount; i < n; i++) {
            const h = upperSky.segmentHeight(i);
            if (h > 0) {
                const combined =
                    h +
                    lowerSky.maxHeightInRange(
                        upperSky.segmentXStart(i) - horizontalPadding,
                        upperSky.segmentXEnd(i) + horizontalPadding
                    );
                if (combined > contentExtent) {
                    contentExtent = combined;
                }
            }
        }
        for (let i = 0, n = lowerSky.segmentCount; i < n; i++) {
            const h = lowerSky.segmentHeight(i);
            if (h > 0) {
                const combined =
                    h +
                    upperSky.maxHeightInRange(
                        lowerSky.segmentXStart(i) - horizontalPadding,
                        lowerSky.segmentXEnd(i) + horizontalPadding
                    );
                if (combined > contentExtent) {
                    contentExtent = combined;
                }
            }
        }

        if (contentExtent <= 0) {
            return 0;
        }

        const available = lower.contentTop - upper.contentBottom;
        const missing = contentExtent + padding - available;
        return missing > 0 ? Math.ceil(missing) : 0;
    }

    private _finalizeTrackGroups(onlyFirstGroup: boolean = false) {
        let currentY: number = 0;
        const settings = this.layout.renderer.settings;
        const smufl = settings.display.resources.engravingSettings;
        const topBracketSpikeHeight = smufl.glyphHeights.get(MusicFontSymbol.BracketTop)!;
        const bottomBracketSpikeHeight = smufl.glyphHeights.get(MusicFontSymbol.BracketBottom)!;

        let previousStaff: RenderStaff | undefined = undefined;

        let endSpikeOverflow = 0;
        let anyStaffVisible = false;
        for (const group of this.staves) {
            let firstVisibleStaffInGroup: RenderStaff | undefined = undefined;
            let lastVisibleStaffInGroup: RenderStaff | undefined = undefined;
            for (const staff of group.staves) {
                // check if we need "in-between padding"
                if (previousStaff !== undefined && previousStaff!.trackIndex !== staff.trackIndex) {
                    currentY += settings.display.trackStaffPaddingBetween;
                }

                const bracket = this._staffToBracket.has(staff) ? this._staffToBracket.get(staff) : undefined;
                const hasBracket = bracket && !bracket.drawAsBrace && bracket.canPaint;
                if (hasBracket && bracket!.firstStaffInBracket === staff) {
                    const spikeOverflow = topBracketSpikeHeight - staff.topOverflow;
                    if (spikeOverflow > 0) {
                        currentY += spikeOverflow;
                    }
                }

                // the bracket spike curls into the first bar of whichever staff it is
                // anchored on; register that horizontal footprint in the bar's own skyline
                // so bar-attached content (e.g. the bar number) shifts out of its way
                // instead of being drawn underneath it.
                if (hasBracket && bracket!.firstVisibleStaffInBracket !== bracket!.lastVisibleStaffInBracket) {
                    if (bracket!.firstVisibleStaffInBracket === staff) {
                        this._registerBracketSpikeSkyline(staff, true);
                    }
                    if (bracket!.lastVisibleStaffInBracket === staff) {
                        this._registerBracketSpikeSkyline(staff, false);
                    }
                }

                staff.x = this.accoladeWidth;
                staff.y = currentY;
                if (!onlyFirstGroup) {
                    staff.finalizeStaff();
                }

                if (staff.isVisible) {
                    // ensure the content of adjacent staves keeps a minimum padding
                    // (only adds space where the content actually comes too close)
                    if (previousStaff !== undefined && !onlyFirstGroup) {
                        const extra = StaffSystem._requiredStaffContentPadding(
                            previousStaff,
                            staff,
                            smufl.staffContentPadding,
                            smufl.beatContentPadding
                        );
                        if (extra > 0) {
                            staff.y += extra;
                            currentY += extra;
                        }
                    }

                    currentY += staff.height;

                    anyStaffVisible = true;
                    previousStaff = staff;

                    if (!firstVisibleStaffInGroup) {
                        firstVisibleStaffInGroup = staff;
                    }
                    lastVisibleStaffInGroup = staff;
                }

                endSpikeOverflow = 0;
                if (hasBracket && bracket!.lastStaffInBracket === staff) {
                    const spikeOverflow = bottomBracketSpikeHeight - staff.bottomOverflow;
                    if (spikeOverflow > 0) {
                        if (staff.isVisible) {
                            currentY += spikeOverflow;
                        } else {
                            endSpikeOverflow = spikeOverflow;
                        }
                    }
                }
            }

            group.firstVisibleStaff = firstVisibleStaffInGroup;
            group.lastVisibleStaff = lastVisibleStaffInGroup;

            if (!this.firstVisibleStaff) {
                this.firstVisibleStaff = firstVisibleStaffInGroup;
            }

            if (onlyFirstGroup) {
                break;
            }
        }

        // ensure we add overflow if last bracket is hidden
        if (endSpikeOverflow) {
            currentY += endSpikeOverflow;
        }

        this._contentHeight = currentY;

        return anyStaffVisible;
    }

    /**
     * Registers the horizontal footprint of the bracket's top/bottom spike glyph (see
     * `_paintBrackets`'s `spikeX`) into the first bar renderer's own skyline. The spike is
     * anchored just left of the staff's content area but its glyph bbox extends `glyphWidth`
     * to the right, which can reach past the accolade into the first bar. Without this, content
     * placed at the top/bottom of that bar (e.g. the bar number) doesn't know to avoid it.
     */
    private _registerBracketSpikeSkyline(staff: RenderStaff, isTop: boolean): void {
        if (staff.barRenderers.length === 0) {
            return;
        }

        const settings = this.layout.renderer.settings;
        const smufl = settings.display.resources.engravingSettings;
        const symbol = isTop ? MusicFontSymbol.BracketTop : MusicFontSymbol.BracketBottom;
        const glyphWidth = smufl.glyphWidths.get(symbol)!;
        const glyphHeight = smufl.glyphHeights.get(symbol)!;
        const barOffset = settings.display.accoladeBarPaddingRight;

        const intrusion = glyphWidth - barOffset - smufl.bracketThickness;
        if (intrusion <= 0) {
            return;
        }

        // brackets typically overflow their content range by 1/4 staff-space (see `_paintBrackets`)
        const height = glyphHeight + smufl.oneStaffSpace * 0.25;

        const firstBar = staff.barRenderers[0];
        if (isTop) {
            firstBar.insertSkylineTop(0, intrusion, height);
        } else {
            firstBar.insertSkylineBottom(0, intrusion, height);
        }
    }

    public buildBoundingsLookup(cx: number, cy: number): void {
        if (this.layout.renderer.boundsLookup!.isFinished) {
            return;
        }
        const firstStaff = this.allStaves[0];
        const lastStaff = this.allStaves[this.allStaves.length - 1];

        cy += this.topPadding;

        const visualTop: number = cy + this.y + firstStaff.y;
        const visualBottom: number = cy + this.y + lastStaff.y + lastStaff.height;
        const visualHeight = visualBottom - visualTop;

        const realTop: number = cy + this.y;
        const realBottom: number = cy + this.y + this.height;
        const realHeight = realBottom - realTop;

        const lineTop = cy + this.y + firstStaff.y + firstStaff.topPadding + firstStaff.topOverflow;
        const lineBottom =
            cy + this.y + lastStaff.y + lastStaff.height - lastStaff.bottomPadding - lastStaff.bottomOverflow;
        const lineHeight = lineBottom - lineTop;

        const x: number = this.x + firstStaff.x;
        const scale = this.layout.renderer.settings.display.scale;
        const systemX = (cx + this.x) * scale;
        const systemY = (cy + this.y) * scale;
        const systemW = this.width * scale;
        const staffSystemBounds = new StaffSystemBounds();
        staffSystemBounds.visualBounds = new Bounds(
            systemX,
            systemY,
            systemW,
            (this.height - this.topPadding - this.bottomPadding) * scale
        );
        staffSystemBounds.realBounds = new Bounds(systemX, systemY, systemW, this.height * scale);

        const boundsLookup = this.layout.renderer.boundsLookup!;
        boundsLookup.addStaffSystem(staffSystemBounds);

        const scaledRealTop = realTop * scale;
        const scaledRealHeight = realHeight * scale;
        const scaledVisualTop = visualTop * scale;
        const scaledVisualHeight = visualHeight * scale;
        const scaledLineTop = lineTop * scale;
        const scaledLineHeight = lineHeight * scale;
        const systemBars = staffSystemBounds.bars;
        for (let i: number = 0; i < this.staves.length; i++) {
            const staves = this.staves[i].staves;
            for (let s = 0; s < staves.length; s++) {
                const staff = staves[s];
                if (!staff.isVisible) {
                    continue;
                }
                const renderers = staff.barRenderers;
                for (let j = 0; j < renderers.length; j++) {
                    const renderer = renderers[j];
                    const masterBarIndex = renderer.bar.masterBar.index;
                    // staves usually hold one renderer per master bar of the system, in the same order
                    let masterBarBounds: MasterBarBounds | null = null;
                    if (j < systemBars.length && systemBars[j].index === masterBarIndex) {
                        masterBarBounds = systemBars[j];
                    } else {
                        for (const b of systemBars) {
                            if (b.index === masterBarIndex) {
                                masterBarBounds = b;
                                break;
                            }
                        }
                    }

                    if (!masterBarBounds) {
                        const barX = (x + renderer.x) * scale;
                        const barW = renderer.width * scale;
                        masterBarBounds = new MasterBarBounds();
                        masterBarBounds.index = masterBarIndex;
                        masterBarBounds.isFirstOfLine = renderer.isFirstOfStaff;
                        masterBarBounds.realBounds = new Bounds(barX, scaledRealTop, barW, scaledRealHeight);
                        masterBarBounds.visualBounds = new Bounds(barX, scaledVisualTop, barW, scaledVisualHeight);
                        masterBarBounds.lineAlignedBounds = new Bounds(barX, scaledLineTop, barW, scaledLineHeight);
                        boundsLookup.addMasterBar(masterBarBounds);
                    }
                    renderer.buildBoundingsLookup(masterBarBounds, x, cy + this.y + staff.y);
                }
            }
        }

        for (const masterBarBounds of systemBars) {
            masterBarBounds.sortBars();
        }
        // the bounds are built scaled and sorted: BoundsLookup.finish must not process them again
        staffSystemBounds.isFinished = true;
    }

    public getBarX(index: number): number {
        if (this.allStaves.length === 0 || this.layout.renderer.tracks!.length === 0) {
            return 0;
        }
        const bar: Bar = this.layout.renderer.tracks![0].staves[0].bars[index];
        const renderer: BarRendererBase = this.layout.getRendererForBar(this.allStaves[0].staffId, bar)!;
        return renderer.x;
    }
}
