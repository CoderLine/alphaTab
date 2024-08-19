import { Bar, Beat, Duration, Fingers, GraceType, Note, TupletGroup } from '@src/model';
import { BarRendererBase } from './BarRendererBase';
import { ScoreRenderer } from './ScoreRenderer';
import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { SpacingGlyph } from './glyphs/SpacingGlyph';
import { BeamingHelper } from './utils/BeamingHelper';
import { BeamDirection } from './utils/BeamDirection';
import { FingeringMode, NotationMode } from '@src/NotationSettings';
import { FlagGlyph } from './glyphs/FlagGlyph';
import { NoteHeadGlyph } from './glyphs/NoteHeadGlyph';
import { Settings } from '@src/Settings';
import { ModelUtils } from '@src/model/ModelUtils';
import { RepeatOpenGlyph } from './glyphs/RepeatOpenGlyph';
import { BarSeperatorGlyph } from './glyphs/BarSeperatorGlyph';
import { RepeatCloseGlyph } from './glyphs/RepeatCloseGlyph';
import { RepeatCountGlyph } from './glyphs/RepeatCountGlyph';
import { BarNumberGlyph } from './glyphs/BarNumberGlyph';

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

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
    }

    public get lineOffset(): number {
        return (this.lineSpacing + 1) * this.scale;
    }

    public abstract get lineSpacing(): number;
    public abstract get heightLineCount(): number;
    public abstract get drawnLineCount(): number;

    protected get topGlyphOverflow() {
        const res = this.resources;
        return (res.tablatureFont.size / 2 + res.tablatureFont.size * 0.2) * this.scale;
    }

    protected get bottomGlyphOverflow() {
        const res = this.resources;
        return (res.tablatureFont.size / 2 + res.tablatureFont.size * 0.2) * this.scale;
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
        let fullLineHeight = this.lineOffset * (this.heightLineCount - 1);
        let actualLineHeight = (this.drawnLineCount - 1) * this.lineOffset;
        this.firstLineY = this.topPadding + (fullLineHeight - actualLineHeight) / 2;
    }

    public override doLayout(): void {
        this.initLineBasedSizes();
        this.updateFirstLineY();
        this.tupletSize = 15 * this.scale + this.resources.effectFont.size * 0.3;
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
        const res = this.resources;
        // canvas.color = Color.random(100);
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
        //
        // draw string lines
        //
        canvas.color = res.staffLineColor;

        // collect tab note position for spaces
        const spaces: Float32Array[][] = [];
        for (let i: number = 0, j: number = this.drawnLineCount; i < j; i++) {
            spaces.push([]);
        }

        this.collectSpaces(spaces);

        // if we have multiple voices we need to sort by X-position, otherwise have a wild mix in the list
        // but painting relies on ascending X-position
        for (const line of spaces) {
            line.sort((a, b) => {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
        }

        for (let i: number = 0; i < this.drawnLineCount; i++) {
            const lineY = this.getLineY(i);

            let lineX: number = 0;
            for (let line of spaces[i]) {
                canvas.fillRect(
                    cx + this.x + lineX,
                    (cy + this.y + lineY) | 0,
                    line[0] - lineX,
                    this.scale * BarRendererBase.StaffLineThickness
                );
                lineX = line[0] + line[1];
            }
            canvas.fillRect(
                cx + this.x + lineX,
                (cy + this.y + lineY) | 0,
                this.width - lineX,
                this.scale * BarRendererBase.StaffLineThickness
            );
        }
        canvas.color = res.mainGlyphColor;

        this.paintSimileMark(cx, cy, canvas);
    }

    protected collectSpaces(spaces: Float32Array[][]) {
        // override in subclasses
    }

    protected createStartSpacing(): void {
        if (this._startSpacing) {
            return;
        }
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 2 * this.scale));
        this._startSpacing = true;
    }

    protected paintTuplets(cx: number, cy: number, canvas: ICanvas): void {
        for (const voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                const container = this.getVoiceContainer(voice)!;
                for (const tupletGroup of container.tupletGroups) {
                    this.paintTupletHelper(cx + this.beatGlyphsStart, cy, canvas, tupletGroup);
                }
            }
        }
    }

    protected abstract getBeamDirection(helper: BeamingHelper): BeamDirection;
    protected abstract calculateBeamYWithDirection(h: BeamingHelper, x: number, direction: BeamDirection): number;

    private paintTupletHelper(cx: number, cy: number, canvas: ICanvas, h: TupletGroup): void {
        const res = this.resources;
        let oldAlign: TextAlign = canvas.textAlign;
        let oldBaseLine = canvas.textBaseline;
        canvas.color = h.voice.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Middle;
        let s: string;
        let num: number = h.beats[0].tupletNumerator;
        let den: number = h.beats[0].tupletDenominator;
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
            s = num + ':' + den;
        }

        // check if we need to paint simple footer
        let offset: number = 10 * this.scale;
        let size: number = 5 * this.scale;

        if (h.beats.length === 1 || !h.isFull) {
            for (const beat of h.beats) {
                let beamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(beat.index)!;
                if (!beamingHelper) {
                    continue;
                }

                let direction: BeamDirection = this.getBeamDirection(beamingHelper);

                let tupletX: number = beamingHelper.getBeatLineX(beat);
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
            let firstBeat: Beat = h.beats[0];
            let lastBeat: Beat = h.beats[h.beats.length - 1];

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
            let firstBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstBeat.index)!;
            let lastBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastBeat.index)!;
            let startX: number = firstBeamingHelper.getBeatLineX(firstBeat);
            let endX: number = lastBeamingHelper.getBeatLineX(lastBeat);

            //
            // calculate the y positions for our bracket
            let firstNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstNonRestBeat.index)!;
            let lastNonRestBeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastNonRestBeat.index)!;
            let direction = this.getBeamDirection(firstBeamingHelper);
            let startY: number = this.calculateBeamYWithDirection(firstNonRestBeamingHelper, startX, direction);
            let endY: number = this.calculateBeamYWithDirection(lastNonRestBeamingHelper, endX, direction);
            if (isRestOnly) {
                startY = Math.max(startY, endY);
                endY = startY;
            }

            //
            // Calculate how many space the text will need
            canvas.font = res.effectFont;
            let sw: number = canvas.measureText(s).width;
            let sp: number = 3 * this.scale;
            //
            // Calculate the offsets where to break the bracket
            let middleX: number = (startX + endX) / 2;
            let offset1X: number = middleX - sw / 2 - sp;
            let offset2X: number = middleX + sw / 2 + sp;

            let k: number = (endY - startY) / (endX - startX);
            let d: number = startY - k * startX;
            let offset1Y: number = k * offset1X + d;
            let middleY: number = k * middleX + d;
            let offset2Y: number = k * offset2X + d;
            if (direction === BeamDirection.Down) {
                offset *= -1;
                size *= -1;
            }

            //
            // draw the bracket
            canvas.beginPath();
            canvas.moveTo(cx + this.x + startX, (cy + this.y + startY - offset) | 0);
            canvas.lineTo(cx + this.x + startX, (cy + this.y + startY - offset - size) | 0);
            canvas.lineTo(cx + this.x + offset1X, (cy + this.y + offset1Y - offset - size) | 0);
            canvas.stroke();
            canvas.beginPath();
            canvas.moveTo(cx + this.x + offset2X, (cy + this.y + offset2Y - offset - size) | 0);
            canvas.lineTo(cx + this.x + endX, (cy + this.y + endY - offset - size) | 0);
            canvas.lineTo(cx + this.x + endX, (cy + this.y + endY - offset) | 0);
            canvas.stroke();
            //
            // Draw the string
            canvas.fillText(s, cx + this.x + middleX, cy + this.y + middleY - offset - size);
        }

        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseLine;
    }

    protected paintBeams(cx: number, cy: number, canvas: ICanvas): void {
        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                this.paintBeamHelper(cx + this.beatGlyphsStart, cy, canvas, h);
            }
        }
    }

    public drawBeamHelperAsFlags(h: BeamingHelper): boolean {
        return h.beats.length === 1;
    }

    private paintBeamHelper(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        canvas.color = h.voice!.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        // TODO: draw stem at least at the center of the score staff.
        // check if we need to paint simple footer
        if (!h.isRestBeamHelper) {
            if (this.drawBeamHelperAsFlags(h)) {
                this.paintFlag(cx, cy, canvas, h);
            } else {
                this.paintBar(cx, cy, canvas, h);
            }
        }
    }

    protected abstract getFlagTopY(beat: Beat): number;
    protected abstract getFlagBottomY(beat: Beat): number;
    protected shouldPaintFlag(beat: Beat, h: BeamingHelper): boolean {
        // no flags for bend grace beats
        if (beat.graceType === GraceType.BendGrace) {
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

    protected paintFlag(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        for (const beat of h.beats) {
            if (!this.shouldPaintFlag(beat, h)) {
                continue;
            }

            let isGrace: boolean = beat.graceType !== GraceType.None;
            let scaleMod: number = isGrace ? NoteHeadGlyph.GraceScale : 1;
            //
            // draw line
            //
            let stemSize: number = this.getFlagStemSize(h.shortestDuration);
            let beatLineX: number = h.getBeatLineX(beat);
            let direction: BeamDirection = this.getBeamDirection(h);
            let topY: number = this.getFlagTopY(beat);
            let bottomY: number = this.getFlagBottomY(beat);
            let beamY: number = 0;
            let fingeringY: number = 0;
            if (direction === BeamDirection.Down) {
                bottomY += stemSize * scaleMod;
                beamY = bottomY;
                fingeringY = cy + this.y + bottomY;
            } else {
                topY -= stemSize * scaleMod;
                beamY = topY;
                fingeringY = cy + this.y + topY;
            }

            this.paintFingering(canvas, beat, cx + this.x + beatLineX, direction, fingeringY);
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

            if (beat.graceType === GraceType.BeforeBeat) {
                let graceSizeY: number = 15 * this.scale;
                let graceSizeX: number = 12 * this.scale;
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
                let glyph: FlagGlyph = new FlagGlyph(
                    beatLineX - this.scale / 2,
                    beamY,
                    beat.duration,
                    direction,
                    isGrace
                );
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

    protected paintFingering(
        canvas: ICanvas,
        beat: Beat,
        beatLineX: number,
        direction: BeamDirection,
        topY: number
    ): void {
        let settings: Settings = this.settings;
        if (
            settings.notation.fingeringMode !== FingeringMode.ScoreDefault &&
            settings.notation.fingeringMode !== FingeringMode.ScoreForcePiano
        ) {
            return;
        }
        if (direction === BeamDirection.Up) {
            beatLineX -= 10 * this.scale;
        } else {
            beatLineX += 3 * this.scale;
        }
        // sort notes ascending in their value to ensure
        // we are drawing the numbers according to their order on the stave
        let noteList: Note[] = beat.notes.slice(0);
        noteList.sort((a, b) => {
            return a.realValue - b.realValue;
        });
        for (let n: number = 0; n < noteList.length; n++) {
            let note: Note = noteList[n];
            let text: string | null = null;
            if (note.leftHandFinger !== Fingers.Unknown) {
                text = ModelUtils.fingerToString(settings, beat, note.leftHandFinger, true);
            } else if (note.rightHandFinger !== Fingers.Unknown) {
                text = ModelUtils.fingerToString(settings, beat, note.rightHandFinger, false);
            }
            if (!text) {
                continue;
            }
            canvas.fillText(text, beatLineX, topY);
            topY -= canvas.font.size | 0;
        }
    }

    protected getFlagStemSize(duration: Duration): number {
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
                size = 0;
                break;
        }
        return this.getLineHeight(size);
    }

    protected abstract getBarLineStart(beat: Beat, direction: BeamDirection): number;

    public calculateBeamY(h: BeamingHelper, x: number): number {
        return this.calculateBeamYWithDirection(h, x, this.getBeamDirection(h));
    }
    protected override createPreBeatGlyphs(): void {
        super.createPreBeatGlyphs();
        if (this.bar.masterBar.isRepeatStart) {
            this.addPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        this.createLinePreBeatGlyphs();
        this.addPreBeatGlyph(new BarNumberGlyph(0, this.getLineHeight(-0.25), this.bar.index + 1));
    }

    protected abstract createLinePreBeatGlyphs(): void;

    protected override createPostBeatGlyphs(): void {
        super.createPostBeatGlyphs();
        if (this.bar.masterBar.isRepeatEnd) {
            this.addPostBeatGlyph(new RepeatCloseGlyph(this.x, 0));
            if (this.bar.masterBar.repeatCount > 2) {
                this.addPostBeatGlyph(new RepeatCountGlyph(0, this.getLineHeight(-0.25), this.bar.masterBar.repeatCount));
            }
        } else {
            this.addPostBeatGlyph(new BarSeperatorGlyph(0, 0));
        }
    }

    protected paintBar(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
            let beat: Beat = h.beats[i];
            if (!h.hasBeatLineX(beat)) {
                continue;
            }

            let isGrace: boolean = beat.graceType !== GraceType.None;
            let scaleMod: number = isGrace ? NoteHeadGlyph.GraceScale : 1;
            //
            // draw line
            //
            let beatLineX: number = h.getBeatLineX(beat);
            let direction: BeamDirection = this.getBeamDirection(h);
            let y1: number = cy + this.y + this.getBarLineStart(beat, direction);
            let y2: number = cy + this.y + this.calculateBeamY(h, beatLineX);

            // canvas.lineWidth = BarRendererBase.StemWidth * this.scale;
            // canvas.beginPath();
            // canvas.moveTo(cx + this.x + beatLineX, y1);
            // canvas.lineTo(cx + this.x + beatLineX, y2);
            // canvas.stroke();
            // canvas.lineWidth = this.scale;

            this.paintBeamingStem(beat, cy + this.y, cx + this.x + beatLineX, y1, y2, canvas);

            let fingeringY: number = y2;
            if (direction === BeamDirection.Down) {
                fingeringY += canvas.font.size * 2;
            } else if (i !== 0) {
                fingeringY -= canvas.font.size * 1.5;
            }
            this.paintFingering(canvas, beat, cx + this.x + beatLineX, direction, fingeringY);
            let brokenBarOffset: number = 6 * this.scale * scaleMod;
            let barSpacing: number =
                (BarRendererBase.BeamSpacing + BarRendererBase.BeamThickness) * this.scale * scaleMod;
            let barSize: number = BarRendererBase.BeamThickness * this.scale * scaleMod;
            let barCount: number = ModelUtils.getIndex(beat.duration) - 2;
            let barStart: number = cy + this.y;
            if (direction === BeamDirection.Down) {
                barSpacing = -barSpacing;
                barSize = -barSize;
            }
            for (let barIndex: number = 0; barIndex < barCount; barIndex++) {
                let barStartX: number = 0;
                let barEndX: number = 0;
                let barStartY: number = 0;
                let barEndY: number = 0;
                let barY: number = barStart + barIndex * barSpacing;
                //
                // Bar to Next?
                //
                if (i < h.beats.length - 1) {
                    // full bar?
                    if (BeamingHelper.isFullBarJoin(beat, h.beats[i + 1], barIndex)) {
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

    protected static paintSingleBar(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number, size: number): void {
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.lineTo(x2, y2 + size);
        canvas.lineTo(x1, y1 + size);
        canvas.closePath();
        canvas.fill();
    }
}
