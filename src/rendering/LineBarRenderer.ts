import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { type ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NotationMode } from '@src/NotationSettings';
import { FlagGlyph } from '@src/rendering/glyphs/FlagGlyph';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { ModelUtils } from '@src/model/ModelUtils';
import { BarLineGlyph } from '@src/rendering/glyphs/BarLineGlyph';
import { RepeatCountGlyph } from '@src/rendering/glyphs/RepeatCountGlyph';
import { BarNumberGlyph } from '@src/rendering/glyphs/BarNumberGlyph';
import { type Beat, BeatBeamingMode, type BeatSubElement } from '@src/model/Beat';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import type { BarSubElement } from '@src/model/Bar';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import type { TupletGroup } from '@src/model/TupletGroup';

/**
 * This is a base class for any bar renderer which renders music notation on a staff
 * with lines like Standard Notation, Guitar Tablatures and Slash Notation.
 *
 * This base class takes care of the typical bits like drawing lines,
 * allowing note positioning and creating glyphs like repeats, bar numbers etc..
 */
export abstract class LineBarRenderer extends BarRendererBase {
    protected firstLineY: number = 0;
    private _startSpacing = false;
    protected tupletSize: number = 0;

    public get lineOffset(): number {
        return this.lineSpacing + 1;
    }

    public get tupletOffset(): number {
        return 10;
    }

    public abstract get lineSpacing(): number;
    public abstract get heightLineCount(): number;
    public abstract get drawnLineCount(): number;

    protected get topGlyphOverflow() {
        const res = this.resources;
        return res.tablatureFont.size / 2 + res.tablatureFont.size * 0.2;
    }

    protected get bottomGlyphOverflow() {
        const res = this.resources;
        return res.tablatureFont.size / 2 + res.tablatureFont.size * 0.2;
    }

    protected initLineBasedSizes() {
        this.topPadding = this.topGlyphOverflow;
        this.bottomPadding = this.bottomGlyphOverflow;
        this.height = this.lineOffset * (this.heightLineCount - 1) + this.topPadding + this.bottomPadding;
    }

    protected override updateSizes(): void {
        this.initLineBasedSizes();
        this.adjustSizes();
        this.updateFirstLineY();

        super.updateSizes();
    }

    protected adjustSizes() {
        // adjusted in subclasses
    }

    protected updateFirstLineY() {
        const fullLineHeight = this.lineOffset * (this.heightLineCount - 1);
        const actualLineHeight = (this.drawnLineCount - 1) * this.lineOffset;
        this.firstLineY = this.topPadding + (fullLineHeight - actualLineHeight) / 2;
    }

    public override doLayout(): void {
        this.initLineBasedSizes();
        this.updateFirstLineY();
        this.tupletSize = 15 + this.resources.effectFont.size * 0.3;
        super.doLayout();
    }

    public getLineY(line: number) {
        return this.firstLineY + this.getLineHeight(line);
    }

    public getLineHeight(line: number): number {
        return this.lineOffset * line;
    }

    // private static readonly Random Random = new Random();
    protected override paintBackground(cx: number, cy: number, canvas: ICanvas): void {
        super.paintBackground(cx, cy, canvas);
        // canvas.color = Color.random(100);
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
        //
        // draw string lines
        //

        this.paintStaffLines(cx, cy, canvas);

        this.paintSimileMark(cx, cy, canvas);
    }

    private paintStaffLines(cx: number, cy: number, canvas: ICanvas) {
        using _ = ElementStyleHelper.bar(canvas, this.staffLineBarSubElement, this.bar, true);

        // collect tab note position for spaces
        const spaces: Float32Array[][] = [];
        for (let i: number = 0, j: number = this.drawnLineCount; i < j; i++) {
            spaces.push([]);
        }

        // on multibar rest glyphs we don't have spaces as they are empty
        if (!this.additionalMultiRestBars) {
            this.collectSpaces(spaces);
        }

        // if we have multiple voices we need to sort by X-position, otherwise have a wild mix in the list
        // but painting relies on ascending X-position
        for (const line of spaces) {
            line.sort((a, b) => {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
        }

        // during system fitting it can happen that we have fraction widths
        // but to have lines until the full end-pixel we round up.
        // this way we avoid holes
        const lineWidth = Math.ceil(this.width);

        for (let i: number = 0; i < this.drawnLineCount; i++) {
            const lineY = this.getLineY(i);

            let lineX: number = 0;
            for (const line of spaces[i]) {
                canvas.fillRect(
                    cx + this.x + lineX,
                    (cy + this.y + lineY) | 0,
                    line[0] - lineX,
                    BarRendererBase.StaffLineThickness
                );
                lineX = line[0] + line[1];
            }
            canvas.fillRect(
                cx + this.x + lineX,
                (cy + this.y + lineY) | 0,
                lineWidth - lineX,
                BarRendererBase.StaffLineThickness
            );
        }
    }

    protected collectSpaces(spaces: Float32Array[][]) {
        // override in subclasses
    }

    protected createStartSpacing(): void {
        if (this._startSpacing) {
            return;
        }
        const padding =
            this.index === 0 ? this.settings.display.firstStaffPaddingLeft : this.settings.display.staffPaddingLeft;
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, padding));
        this._startSpacing = true;
    }

    protected paintTuplets(
        cx: number,
        cy: number,
        canvas: ICanvas,
        beatElement: BeatSubElement,
        bracketsAsArcs: boolean = false
    ): void {
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                const container = this.getVoiceContainer(voice)!;
                for (const tupletGroup of container.tupletGroups) {
                    this.paintTupletHelper(
                        cx + this.beatGlyphsStart,
                        cy,
                        canvas,
                        tupletGroup,
                        beatElement,
                        bracketsAsArcs
                    );
                }
            }
        }
    }

    protected abstract getBeamDirection(helper: BeamingHelper): BeamDirection;
    protected getTupletBeamDirection(helper: BeamingHelper): BeamDirection {
        return this.getBeamDirection(helper);
    }

    protected abstract calculateBeamYWithDirection(h: BeamingHelper, x: number, direction: BeamDirection): number;

    private paintTupletHelper(
        cx: number,
        cy: number,
        canvas: ICanvas,
        h: TupletGroup,
        beatElement: BeatSubElement,
        bracketsAsArcs: boolean
    ): void {
        const res = this.resources;
        const oldAlign: TextAlign = canvas.textAlign;
        const oldBaseLine = canvas.textBaseline;
        canvas.color = h.voice.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Middle;
        let s: string;
        const num: number = h.beats[0].tupletNumerator;
        const den: number = h.beats[0].tupletDenominator;
        // list as in Guitar Pro 7. for certain tuplets only the numerator is shown
        if (num === 2 && den === 3) {
            s = '2';
        } else if (num === 3 && den === 2) {
            s = '3';
        } else if (num === 4 && den === 6) {
            s = '4';
        } else if (num === 5 && den === 4) {
            s = '5';
        } else if (num === 6 && den === 4) {
            s = '6';
        } else if (num === 7 && den === 4) {
            s = '7';
        } else if (num === 9 && den === 8) {
            s = '9';
        } else if (num === 10 && den === 8) {
            s = '10';
        } else if (num === 11 && den === 8) {
            s = '11';
        } else if (num === 12 && den === 8) {
            s = '12';
        } else if (num === 13 && den === 8) {
            s = '13';
        } else {
            s = `${num}:${den}`;
        }

        // check if we need to paint simple footer
        let offset: number = this.tupletOffset;
        let size: number = 5;

        using _ = ElementStyleHelper.beat(canvas, beatElement, h.beats[0]);

        if (h.beats.length === 1 || !h.isFull) {
            for (const beat of h.beats) {
                const beamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(beat.index)!;
                if (!beamingHelper) {
                    continue;
                }

                const direction: BeamDirection = this.getTupletBeamDirection(beamingHelper);

                const tupletX: number = beamingHelper.getBeatLineX(beat);
                let tupletY: number = this.calculateBeamYWithDirection(beamingHelper, tupletX, direction);

                if (direction === BeamDirection.Down) {
                    tupletY += offset + size;
                } else {
                    tupletY -= offset + size;
                }

                canvas.font = res.effectFont;
                canvas.fillText(s, cx + this.x + tupletX, cy + this.y + tupletY);
            }
        } else {
            const firstBeat: Beat = h.beats[0];
            const lastBeat: Beat = h.beats[h.beats.length - 1];

            let firstNonRestBeat: Beat | null = null;
            let lastNonRestBeat: Beat | null = null;
            for (let i = 0; i < h.beats.length; i++) {
                if (!h.beats[i].isRest) {
                    firstNonRestBeat = h.beats[i];
                    break;
                }
            }
            for (let i = h.beats.length - 1; i >= 0; i--) {
                if (!h.beats[i].isRest) {
                    lastNonRestBeat = h.beats[i];
                    break;
                }
            }

            let isRestOnly = false;
            if (!firstNonRestBeat) {
                firstNonRestBeat = firstBeat;
                isRestOnly = true;
            }

            if (!lastNonRestBeat) {
                lastNonRestBeat = lastBeat;
            }

            //
            // Calculate the overall area of the tuplet bracket
            const firstBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstBeat.index)!;
            const lastBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastBeat.index)!;
            const startX: number = firstBeamingHelper.getBeatLineX(firstBeat);
            const endX: number = lastBeamingHelper.getBeatLineX(lastBeat);

            //
            // calculate the y positions for our bracket
            const firstNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstNonRestBeat.index)!;
            const lastNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastNonRestBeat.index)!;
            const direction = this.getTupletBeamDirection(firstBeamingHelper);
            let startY: number = this.calculateBeamYWithDirection(firstNonRestBeamingHelper, startX, direction);
            let endY: number = this.calculateBeamYWithDirection(lastNonRestBeamingHelper, endX, direction);
            if (isRestOnly) {
                startY = Math.max(startY, endY);
                endY = startY;
            }

            //
            // Calculate how many space the text will need
            canvas.font = res.effectFont;
            const sw: number = canvas.measureText(s).width;
            const sp: number = 3;
            //
            // Calculate the offsets where to break the bracket
            const middleX: number = (startX + endX) / 2;
            const offset1X: number = middleX - sw / 2 - sp;
            const offset2X: number = middleX + sw / 2 + sp;

            const k: number = (endY - startY) / (endX - startX);
            const d: number = startY - k * startX;
            const offset1Y: number = k * offset1X + d;
            const middleY: number = k * middleX + d;
            const offset2Y: number = k * offset2X + d;
            if (direction === BeamDirection.Down) {
                offset *= -1;
                size *= -1;
            }

            //
            // draw the bracket
            canvas.beginPath();
            canvas.moveTo(cx + this.x + startX, (cy + this.y + startY - offset) | 0);
            if (bracketsAsArcs) {
                canvas.quadraticCurveTo(
                    cx + this.x + (offset1X + startX) / 2,
                    (cy + this.y + offset1Y - offset - size) | 0,
                    cx + this.x + offset1X,
                    (cy + this.y + offset1Y - offset - size) | 0
                );
            } else {
                canvas.lineTo(cx + this.x + startX, (cy + this.y + startY - offset - size) | 0);
                canvas.lineTo(cx + this.x + offset1X, (cy + this.y + offset1Y - offset - size) | 0);
            }
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(cx + this.x + offset2X, (cy + this.y + offset2Y - offset - size) | 0);
            if (bracketsAsArcs) {
                canvas.quadraticCurveTo(
                    cx + this.x + (endX + offset2X) / 2,
                    (cy + this.y + offset2Y - offset - size) | 0,
                    cx + this.x + endX,
                    (cy + this.y + endY - offset) | 0
                );
            } else {
                canvas.lineTo(cx + this.x + endX, (cy + this.y + endY - offset - size) | 0);
                canvas.lineTo(cx + this.x + endX, (cy + this.y + endY - offset) | 0);
            }

            canvas.stroke();
            //
            // Draw the string
            canvas.fillText(s, cx + this.x + middleX, cy + this.y + middleY - offset - size);
        }

        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseLine;
    }

    protected paintBeams(
        cx: number,
        cy: number,
        canvas: ICanvas,
        flagsElement: BeatSubElement,
        beamsElement: BeatSubElement
    ): void {
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                this.paintBeamHelper(cx + this.beatGlyphsStart, cy, canvas, h, flagsElement, beamsElement);
            }
        }
    }

    public drawBeamHelperAsFlags(h: BeamingHelper): boolean {
        return h.beats.length === 1;
    }

    private paintBeamHelper(
        cx: number,
        cy: number,
        canvas: ICanvas,
        h: BeamingHelper,
        flagsElement: BeatSubElement,
        beamsElement: BeatSubElement
    ): void {
        canvas.color = h.voice!.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        // TODO: draw stem at least at the center of the score staff.
        // check if we need to paint simple footer
        if (!h.isRestBeamHelper) {
            if (this.drawBeamHelperAsFlags(h)) {
                this.paintFlag(cx, cy, canvas, h, flagsElement);
            } else {
                this.paintBar(cx, cy, canvas, h, beamsElement);
            }
        }
    }

    protected abstract getFlagTopY(beat: Beat, direction: BeamDirection): number;
    protected abstract getFlagBottomY(beat: Beat, direction: BeamDirection): number;
    protected shouldPaintFlag(beat: Beat, h: BeamingHelper): boolean {
        // no flags for bend grace beats
        if (beat.graceType === GraceType.BendGrace) {
            return false;
        }

        if (beat.deadSlapped) {
            return false;
        }

        // we don't have an X-position: cannot paint a flag
        if (!h.hasBeatLineX(beat)) {
            return false;
        }

        // no flags for any grace notes on songbook mode
        if (beat.graceType !== GraceType.None && this.settings.notation.notationMode === NotationMode.SongBook) {
            return false;
        }

        // only flags for durations with stems
        if (
            beat.duration === Duration.Whole ||
            beat.duration === Duration.DoubleWhole ||
            beat.duration === Duration.QuadrupleWhole
        ) {
            return false;
        }

        return true;
    }

    protected paintFlag(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper, flagsElement: BeatSubElement): void {
        for (const beat of h.beats) {
            if (!this.shouldPaintFlag(beat, h)) {
                continue;
            }

            const isGrace: boolean = beat.graceType !== GraceType.None;
            const scaleMod: number = isGrace ? NoteHeadGlyph.GraceScale : 1;
            //
            // draw line
            //
            const stemSize: number = this.getFlagStemSize(h.shortestDuration);
            const beatLineX: number = h.getBeatLineX(beat);
            const direction: BeamDirection = this.getBeamDirection(h);
            let topY: number = this.getFlagTopY(beat, direction);
            let bottomY: number = this.getFlagBottomY(beat, direction);
            let beamY: number = 0;
            if (direction === BeamDirection.Down) {
                bottomY += stemSize * scaleMod;
                beamY = bottomY;
            } else {
                topY -= stemSize * scaleMod;
                beamY = topY;
            }

            if (!h.hasLine(true, beat)) {
                continue;
            }

            this.paintBeamingStem(
                beat,
                cy + this.y,
                cx + this.x + beatLineX,
                cy + this.y + topY,
                cy + this.y + bottomY,
                canvas
            );

            using _ = ElementStyleHelper.beat(canvas, flagsElement, beat);

            if (beat.graceType === GraceType.BeforeBeat) {
                const graceSizeY: number = 15;
                const graceSizeX: number = 12;
                canvas.beginPath();
                if (direction === BeamDirection.Down) {
                    canvas.moveTo(cx + this.x + beatLineX - graceSizeX / 2, cy + this.y + bottomY - graceSizeY);
                    canvas.lineTo(cx + this.x + beatLineX + graceSizeX / 2, cy + this.y + bottomY);
                } else {
                    canvas.moveTo(cx + this.x + beatLineX - graceSizeX / 2, cy + this.y + topY + graceSizeY);
                    canvas.lineTo(cx + this.x + beatLineX + graceSizeX / 2, cy + this.y + topY);
                }
                canvas.stroke();
            }

            //
            // Draw flag
            //
            if (h.hasFlag(true, beat)) {
                const glyph: FlagGlyph = new FlagGlyph(beatLineX - 1 / 2, beamY, beat.duration, direction, isGrace);
                glyph.renderer = this;
                glyph.doLayout();
                glyph.paint(cx + this.x, cy + this.y, canvas);
            }
        }
    }

    protected abstract paintBeamingStem(
        beat: Beat,
        cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void;

    protected getFlagStemSize(duration: Duration, forceMinStem: boolean = false): number {
        let size: number = 0;
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.Half:
            case Duration.Quarter:
            case Duration.Eighth:
            case Duration.Sixteenth:
            case Duration.ThirtySecond:
            case Duration.SixtyFourth:
            case Duration.OneHundredTwentyEighth:
            case Duration.TwoHundredFiftySixth:
                size = 3;
                break;
            default:
                size = forceMinStem ? 3 : 0;
                break;
        }
        return this.getLineHeight(size);
    }

    protected override recreatePreBeatGlyphs(): void {
        this._startSpacing = false;
        super.recreatePreBeatGlyphs();
    }

    protected abstract getBarLineStart(beat: Beat, direction: BeamDirection): number;

    public calculateBeamY(h: BeamingHelper, x: number): number {
        return this.calculateBeamYWithDirection(h, x, this.getBeamDirection(h));
    }

    protected override createPreBeatGlyphs(): void {
        super.createPreBeatGlyphs();
        this.addPreBeatGlyph(new BarLineGlyph(false));
        this.createLinePreBeatGlyphs();
        this.addPreBeatGlyph(new BarNumberGlyph(0, this.getLineHeight(-0.25), this.bar.index + 1));
    }

    protected abstract createLinePreBeatGlyphs(): void;

    protected override createPostBeatGlyphs(): void {
        super.createPostBeatGlyphs();
        const lastBar = this.lastBar;

        this.addPostBeatGlyph(new BarLineGlyph(true));

        if (lastBar.masterBar.isRepeatEnd && lastBar.masterBar.repeatCount > 2) {
            this.addPostBeatGlyph(new RepeatCountGlyph(0, this.getLineHeight(-0.25), this.bar.masterBar.repeatCount));
        }
    }

    public abstract get repeatsBarSubElement(): BarSubElement;
    public abstract get barNumberBarSubElement(): BarSubElement;
    public abstract get barLineBarSubElement(): BarSubElement;
    public abstract get staffLineBarSubElement(): BarSubElement;

    protected paintBar(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper, beamsElement: BeatSubElement): void {
        for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
            const beat: Beat = h.beats[i];
            if (!h.hasBeatLineX(beat) || beat.deadSlapped) {
                continue;
            }

            const isGrace: boolean = beat.graceType !== GraceType.None;
            const scaleMod: number = isGrace ? NoteHeadGlyph.GraceScale : 1;
            //
            // draw line
            //
            const beatLineX: number = h.getBeatLineX(beat);
            const direction: BeamDirection = this.getBeamDirection(h);
            const y1: number = cy + this.y + this.getBarLineStart(beat, direction);
            const y2: number = cy + this.y + this.calculateBeamY(h, beatLineX);

            // canvas.lineWidth = BarRendererBase.StemWidth;
            // canvas.beginPath();
            // canvas.moveTo(cx + this.x + beatLineX, y1);
            // canvas.lineTo(cx + this.x + beatLineX, y2);
            // canvas.stroke();
            // canvas.lineWidth = 1;

            this.paintBeamingStem(beat, cy + this.y, cx + this.x + beatLineX, y1, y2, canvas);

            using _ = ElementStyleHelper.beat(canvas, beamsElement, beat);

            let fingeringY: number = y2;
            if (direction === BeamDirection.Down) {
                fingeringY += canvas.font.size * 2;
            } else if (i !== 0) {
                fingeringY -= canvas.font.size * 1.5;
            }
            const brokenBarOffset: number = 6 * scaleMod;
            let barSpacing: number = (BarRendererBase.BeamSpacing + BarRendererBase.BeamThickness) * scaleMod;
            let barSize: number = BarRendererBase.BeamThickness * scaleMod;
            const barCount: number = ModelUtils.getIndex(beat.duration) - 2;
            const barStart: number = cy + this.y;
            if (direction === BeamDirection.Down) {
                barSpacing = -barSpacing;
                barSize = -barSize;
            }
            for (let barIndex: number = 0; barIndex < barCount; barIndex++) {
                let barStartX: number = 0;
                let barEndX: number = 0;
                let barStartY: number = 0;
                let barEndY: number = 0;
                const barY: number = barStart + barIndex * barSpacing;
                //
                // Bar to Next?
                //
                if (i < h.beats.length - 1) {
                    const isFullBarJoin = BeamingHelper.isFullBarJoin(beat, h.beats[i + 1], barIndex);

                    // force two broken bars on secondary (last) beam?
                    if (
                        barIndex === barCount - 1 &&
                        isFullBarJoin &&
                        beat.beamingMode === BeatBeamingMode.ForceSplitOnSecondaryToNext
                    ) {
                        // start part
                        barStartX = beatLineX;
                        barEndX = barStartX + brokenBarOffset;
                        barStartY = barY + this.calculateBeamY(h, barStartX);
                        barEndY = barY + this.calculateBeamY(h, barEndX);
                        LineBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );

                        // end part
                        barEndX = h.getBeatLineX(h.beats[i + 1]);
                        barStartX = barEndX - brokenBarOffset;
                        barStartY = barY + this.calculateBeamY(h, barStartX);
                        barEndY = barY + this.calculateBeamY(h, barEndX);
                        LineBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );
                    } else {
                        if (isFullBarJoin) {
                            // full bar?
                            barStartX = beatLineX;
                            barEndX = h.getBeatLineX(h.beats[i + 1]);
                        } else if (i === 0 || !BeamingHelper.isFullBarJoin(h.beats[i - 1], beat, barIndex)) {
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        } else {
                            continue;
                        }
                        barStartY = barY + this.calculateBeamY(h, barStartX);
                        barEndY = barY + this.calculateBeamY(h, barEndX);
                        LineBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );
                    }
                } else if (i > 0 && !BeamingHelper.isFullBarJoin(beat, h.beats[i - 1], barIndex)) {
                    barStartX = beatLineX - brokenBarOffset;
                    barEndX = beatLineX;
                    barStartY = barY + this.calculateBeamY(h, barStartX);
                    barEndY = barY + this.calculateBeamY(h, barEndX);
                    LineBarRenderer.paintSingleBar(
                        canvas,
                        cx + this.x + barStartX,
                        barStartY,
                        cx + this.x + barEndX,
                        barEndY,
                        barSize
                    );
                }
            }
        }
    }

    protected static paintSingleBar(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        size: number
    ): void {
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.lineTo(x2, y2 + size);
        canvas.lineTo(x1, y1 + size);
        canvas.closePath();
        canvas.fill();
    }
}
