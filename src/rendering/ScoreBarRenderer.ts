import { AccidentalType } from '@src/model/AccidentalType';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Clef } from '@src/model/Clef';
import { Duration } from '@src/model/Duration';
import { Note } from '@src/model/Note';
import { Voice } from '@src/model/Voice';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { ClefGlyph } from '@src/rendering/glyphs/ClefGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreBeatGlyph } from '@src/rendering/glyphs/ScoreBeatGlyph';
import { ScoreBeatPreNotesGlyph } from '@src/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreTimeSignatureGlyph } from '@src/rendering/glyphs/ScoreTimeSignatureGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { ScoreBeatContainerGlyph } from '@src/rendering/ScoreBeatContainerGlyph';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { AccidentalHelper } from '@src/rendering/utils/AccidentalHelper';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeamingHelper, BeamingHelperDrawInfo } from '@src/rendering/utils/BeamingHelper';
import { ModelUtils } from '@src/model/ModelUtils';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { KeySignature } from '@src/model/KeySignature';
import { LineBarRenderer } from './LineBarRenderer';

/**
 * This BarRenderer renders a bar using standard music notation.
 */
export class ScoreBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'score';
    private static SharpKsSteps: number[] = [-1, 2, -2, 1, 4, 0, 3];
    private static FlatKsSteps: number[] = [3, 0, 4, 1, 5, 2, 6];

    public simpleWhammyOverflow: number = 0;

    public accidentalHelper: AccidentalHelper;

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
        this.accidentalHelper = new AccidentalHelper(this);
    }

    public override get lineSpacing(): number {
        return BarRendererBase.RawLineSpacing;
    }

    public override get heightLineCount(): number {
        return 5;
    }

    public override get drawnLineCount(): number {
        return this.bar.staff.standardNotationLineCount;
    }

    /**
     * Gets the relative y position of the given steps relative to first line.
     * @param steps the amount of steps while 2 steps are one line
     * @returns
     */
    public getScoreY(steps: number): number {
        return super.getLineY(steps / 2);
    }

    /**
     * Gets the height of an element that spans the given amount of steps.
     * @param steps the amount of steps while 2 steps are one line
     * @param correction
     * @returns
     */
    public getScoreHeight(steps: number): number {
        return super.getLineHeight(steps / 2);
    }

    public override doLayout(): void {
        super.doLayout();
        if (!this.bar.isEmpty && this.accidentalHelper.maxLineBeat) {
            let top: number = this.getScoreY(-2);
            let bottom: number = this.getScoreY(10);
            let whammyOffset: number = this.simpleWhammyOverflow;
            this.registerOverflowTop(whammyOffset);
            let maxNoteY: number = this.getScoreY(this.accidentalHelper.maxLine);
            let maxNoteHelper: BeamingHelper = this.helpers.getBeamingHelperForBeat(this.accidentalHelper.maxLineBeat);
            if (maxNoteHelper.direction === BeamDirection.Up) {
                maxNoteY -= this.getStemSize(maxNoteHelper);
                maxNoteY -= maxNoteHelper.fingeringCount * this.resources.graceFont.size;
                if (maxNoteHelper.hasTuplet) {
                    maxNoteY -= this.tupletSize;
                }
            }
            if (maxNoteY < top) {
                this.registerOverflowTop(Math.abs(maxNoteY) + whammyOffset);
            }
            let minNoteY: number = this.getScoreY(this.accidentalHelper.minLine);
            let minNoteHelper: BeamingHelper = this.helpers.getBeamingHelperForBeat(this.accidentalHelper.minLineBeat!);
            if (minNoteHelper.direction === BeamDirection.Down) {
                minNoteY += this.getStemSize(minNoteHelper);
                minNoteY += minNoteHelper.fingeringCount * this.resources.graceFont.size;
                if (minNoteHelper.hasTuplet) {
                    minNoteY += this.tupletSize;
                }
            }
            if (minNoteY > bottom) {
                this.registerOverflowBottom(Math.abs(minNoteY) - bottom);
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        this.paintBeams(cx, cy, canvas);
        this.paintTuplets(cx, cy, canvas);
    }

    protected override getFlagTopY(beat: Beat): number {
        return this.getScoreY(this.accidentalHelper.getMinLine(beat));
    }

    protected override getFlagBottomY(beat: Beat): number {
        return this.getScoreY(this.accidentalHelper.getMaxLine(beat));
    }

    protected override getBeamDirection(helper: BeamingHelper): BeamDirection {
        return helper.direction;
    }

    public getStemSize(helper: BeamingHelper): number {
        let size: number =
            helper.beats.length === 1
                ? this.getFlagStemSize(helper.shortestDuration)
                : this.getBarStemSize(helper.shortestDuration);
        if (helper.isGrace) {
            size = size * NoteHeadGlyph.GraceScale;
        }
        return size;
    }

    private getBarStemSize(duration: Duration): number {
        let size: number = 0;
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.Half:
            case Duration.Quarter:
            case Duration.Eighth:
            case Duration.Sixteenth:
                size = 6;
                break;
            case Duration.ThirtySecond:
                size = 8;
                break;
            case Duration.SixtyFourth:
                size = 9;
                break;
            case Duration.OneHundredTwentyEighth:
                size = 9;
                break;
            case Duration.TwoHundredFiftySixth:
                size = 10;
                break;
            default:
                size = 0;
                break;
        }
        return this.getScoreHeight(size);
    }

    public override get middleYPosition(): number {
        return this.getScoreY(this.bar.staff.standardNotationLineCount - 1);
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        let y = super.getNoteY(note, requestedPosition);
        if (isNaN(y)) {
            // NOTE: some might request the note position before the glyphs have been created
            // e.g. the beaming helper, for these we just need a rough
            // estimate on the position
            const line = AccidentalHelper.computeLineWithoutAccidentals(this.bar, note);
            y = this.getScoreY(line);
        }
        return y;
    }

    public override applyLayoutingInfo(): boolean {
        const result = super.applyLayoutingInfo();
        if (result && this.bar.isMultiVoice) {
            // consider rest overflows
            let top: number = this.getScoreY(-2);
            let bottom: number = this.getScoreY(10);
            let minMax = this.helpers.collisionHelper.getBeatMinMaxY();
            if (minMax[0] < top) {
                this.registerOverflowTop(Math.abs(minMax[0]));
            }
            if (minMax[1] > bottom) {
                this.registerOverflowBottom(Math.abs(minMax[1]) - bottom);
            }
        }
        return result;
    }

    protected override calculateBeamYWithDirection(h: BeamingHelper, x: number, direction: BeamDirection): number {
        let stemSize: number = this.getStemSize(h);

        if (!h.drawingInfos.has(direction)) {
            let drawingInfo = new BeamingHelperDrawInfo();
            h.drawingInfos.set(direction, drawingInfo);

            // the beaming logic works like this:
            // 1. we take the first and last note, add the stem, and put a diagnal line between them.
            // 2. the height of the diagonal line must not exceed a max height,
            //    - if this is the case, the line on the more distant note just gets longer
            // 3. any middle elements (notes or rests) shift this diagonal line up/down to avoid overlaps

            const firstBeat = h.beats[0];
            const lastBeat = h.beats[h.beats.length - 1];

            let isRest = h.isRestBeamHelper;

            // 1. put direct diagonal line.
            drawingInfo.startBeat = firstBeat;
            drawingInfo.startX = h.getBeatLineX(firstBeat);
            if (isRest) {
                drawingInfo.startY =
                    direction === BeamDirection.Up ? this.getScoreY(h.minRestLine!) : this.getScoreY(h.maxRestLine!);
            } else {
                drawingInfo.startY =
                    direction === BeamDirection.Up
                        ? this.getScoreY(this.accidentalHelper.getMinLine(firstBeat)) - stemSize
                        : this.getScoreY(this.accidentalHelper.getMaxLine(firstBeat)) + stemSize;
            }

            drawingInfo.endBeat = lastBeat;
            drawingInfo.endX = h.getBeatLineX(lastBeat);
            if (isRest) {
                drawingInfo.endY =
                    direction === BeamDirection.Up ? this.getScoreY(h.minRestLine!) : this.getScoreY(h.maxRestLine!);
            } else {
                drawingInfo.endY =
                    direction === BeamDirection.Up
                        ? this.getScoreY(this.accidentalHelper.getMinLine(lastBeat)) - stemSize
                        : this.getScoreY(this.accidentalHelper.getMaxLine(lastBeat)) + stemSize;
            }
            // 2. ensure max height
            // we use the min/max notes to place the beam along their real position
            // we only want a maximum of 10 offset for their gradient
            let maxDistance: number = 10 * this.scale;
            if (
                direction === BeamDirection.Down &&
                drawingInfo.startY > drawingInfo.endY &&
                drawingInfo.startY - drawingInfo.endY > maxDistance
            ) {
                drawingInfo.endY = drawingInfo.startY - maxDistance;
            }
            if (
                direction === BeamDirection.Down &&
                drawingInfo.endY > drawingInfo.startY &&
                drawingInfo.endY - drawingInfo.startY > maxDistance
            ) {
                drawingInfo.startY = drawingInfo.endY - maxDistance;
            }
            if (
                direction === BeamDirection.Up &&
                drawingInfo.startY < drawingInfo.endY &&
                drawingInfo.endY - drawingInfo.startY > maxDistance
            ) {
                drawingInfo.endY = drawingInfo.startY + maxDistance;
            }
            if (
                direction === BeamDirection.Up &&
                drawingInfo.endY < drawingInfo.startY &&
                drawingInfo.startY - drawingInfo.endY > maxDistance
            ) {
                drawingInfo.startY = drawingInfo.endY + maxDistance;
            }

            // 3. let middle elements shift up/down
            if (h.beats.length > 1) {
                // check if highest note shifts bar up or down
                if (direction === BeamDirection.Up) {
                    let yNeededForHighestNote =
                        this.getScoreY(this.accidentalHelper.getMinLine(h.beatOfHighestNote)) - stemSize;
                    const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfHighestNote));

                    const diff = yGivenByCurrentValues - yNeededForHighestNote;
                    if (diff > 0) {
                        drawingInfo.startY -= diff;
                        drawingInfo.endY -= diff;
                    }
                } else {
                    let yNeededForLowestNote =
                        this.getScoreY(this.accidentalHelper.getMaxLine(h.beatOfLowestNote)) + stemSize;
                    const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfLowestNote));

                    const diff = yNeededForLowestNote - yGivenByCurrentValues;
                    if (diff > 0) {
                        drawingInfo.startY += diff;
                        drawingInfo.endY += diff;
                    }
                }

                // check if rest shifts bar up or down
                if (h.minRestLine !== null || h.maxRestLine !== null) {
                    const barCount: number = ModelUtils.getIndex(h.shortestDuration) - 2;
                    let scaleMod: number = h.isGrace ? NoteHeadGlyph.GraceScale : 1;
                    let barSpacing: number =
                        barCount *
                        (BarRendererBase.BeamSpacing + BarRendererBase.BeamThickness) *
                        this.scale *
                        scaleMod;
                    barSpacing += BarRendererBase.BeamSpacing;

                    if (direction === BeamDirection.Up && h.minRestLine !== null) {
                        let yNeededForRest = this.getScoreY(h.minRestLine!) - barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMinRestLine!));

                        const diff = yGivenByCurrentValues - yNeededForRest;
                        if (diff > 0) {
                            drawingInfo.startY -= diff;
                            drawingInfo.endY -= diff;
                        }
                    } else if (direction === BeamDirection.Down && h.maxRestLine !== null) {
                        let yNeededForRest = this.getScoreY(h.maxRestLine!) + barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMaxRestLine!));

                        const diff = yNeededForRest - yGivenByCurrentValues;
                        if (diff > 0) {
                            drawingInfo.startY += diff;
                            drawingInfo.endY += diff;
                        }
                    }
                }
            }
        }

        return h.drawingInfos.get(direction)!.calcY(x);
    }

    protected override getBarLineStart(beat: Beat, direction: BeamDirection): number {
        return direction === BeamDirection.Up
            ? this.getScoreY(this.accidentalHelper.getMaxLine(beat))
            : this.getScoreY(this.accidentalHelper.getMinLine(beat));
    }

    protected override createLinePreBeatGlyphs(): void {
        // Clef
        if (
            this.isFirstOfLine ||
            this.bar.clef !== this.bar.previousBar!.clef ||
            this.bar.clefOttava !== this.bar.previousBar!.clefOttava
        ) {
            let offset: number = 0;
            switch (this.bar.clef) {
                case Clef.Neutral:
                    offset = this.bar.staff.standardNotationLineCount - 1;
                    break;
                case Clef.F4:
                    offset = 2;
                    break;
                case Clef.C3:
                    offset = 4;
                    break;
                case Clef.C4:
                    offset = 2;
                    break;
                case Clef.G2:
                    offset = 6;
                    break;
            }
            this.createStartSpacing();

            this.addPreBeatGlyph(
                new ClefGlyph(
                    0,
                    this.getScoreY(offset) + 0.5 * BarRendererBase.StaffLineThickness,
                    this.bar.clef,
                    this.bar.clefOttava
                )
            );
        }
        // Key signature
        if (
            (this.index === 0 && this.bar.masterBar.keySignature !== KeySignature.C) ||
            (this.bar.previousBar && this.bar.masterBar.keySignature !== this.bar.previousBar.masterBar.keySignature)
        ) {
            this.createStartSpacing();
            this.createKeySignatureGlyphs();
        }
        // Time Signature
        if (
            !this.bar.previousBar ||
            (this.bar.previousBar &&
                this.bar.masterBar.timeSignatureNumerator !== this.bar.previousBar.masterBar.timeSignatureNumerator) ||
            (this.bar.previousBar &&
                this.bar.masterBar.timeSignatureDenominator !== this.bar.previousBar.masterBar.timeSignatureDenominator)
        ) {
            this.createStartSpacing();
            this.createTimeSignatureGlyphs();
        }
    }

    private createKeySignatureGlyphs(): void {
        let offsetClef: number = 0;
        let currentKey: number = this.bar.masterBar.keySignature;
        let previousKey: number = !this.bar.previousBar ? 0 : this.bar.previousBar.masterBar.keySignature;
        switch (this.bar.clef) {
            case Clef.Neutral:
                offsetClef = 0;
                break;
            case Clef.G2:
                offsetClef = 1;
                break;
            case Clef.F4:
                offsetClef = 3;
                break;
            case Clef.C3:
                offsetClef = 2;
                break;
            case Clef.C4:
                offsetClef = 0;
                break;
        }
        let newLines: Map<number, boolean> = new Map<number, boolean>();
        let newGlyphs: Glyph[] = [];
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        // var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (ModelUtils.keySignatureIsSharp(currentKey)) {
            for (let i: number = 0; i < Math.abs(currentKey); i++) {
                let step: number = ScoreBarRenderer.SharpKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Sharp, 1));
                newLines.set(step, true);
            }
        } else {
            for (let i: number = 0; i < Math.abs(currentKey); i++) {
                let step: number = ScoreBarRenderer.FlatKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Flat, 1));
                newLines.set(step, true);
            }
        }
        // naturalize previous key
        let naturalizeSymbols: number = Math.abs(previousKey);
        let previousKeyPositions = ModelUtils.keySignatureIsSharp(previousKey)
            ? ScoreBarRenderer.SharpKsSteps
            : ScoreBarRenderer.FlatKsSteps;
        for (let i: number = 0; i < naturalizeSymbols; i++) {
            let step: number = previousKeyPositions[i] + offsetClef;
            if (!newLines.has(step)) {
                this.addPreBeatGlyph(
                    new AccidentalGlyph(
                        0,
                        this.getScoreY(previousKeyPositions[i] + offsetClef),
                        AccidentalType.Natural,
                        1
                    )
                );
            }
        }
        for (let newGlyph of newGlyphs) {
            this.addPreBeatGlyph(newGlyph);
        }
    }

    private createTimeSignatureGlyphs(): void {
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 5 * this.scale));

        const lines = this.bar.staff.standardNotationLineCount - 1;
        this.addPreBeatGlyph(
            new ScoreTimeSignatureGlyph(
                0,
                this.getScoreY(lines),
                this.bar.masterBar.timeSignatureNumerator,
                this.bar.masterBar.timeSignatureDenominator,
                this.bar.masterBar.timeSignatureCommon
            )
        );
    }

    protected override createVoiceGlyphs(v: Voice): void {
        for (const b of v.beats) {
            let container: ScoreBeatContainerGlyph = new ScoreBeatContainerGlyph(b, this.getVoiceContainer(v)!);
            container.preNotes = new ScoreBeatPreNotesGlyph();
            container.onNotes = new ScoreBeatGlyph();
            this.addBeatGlyph(container);
        }
    }

    public getNoteLine(n: Note): number {
        return this.accidentalHelper.getNoteLine(n);
    }

    public override completeBeamingHelper(helper: BeamingHelper) {
        // for multi-voice bars we need to register the positions
        // for multi-voice rest displacement to avoid collisions
        if (this.bar.isMultiVoice && helper.highestNoteInHelper && helper.lowestNoteInHelper) {
            let highestNotePosition = this.getNoteY(helper.highestNoteInHelper, NoteYPosition.Center);
            let lowestNotePosition = this.getNoteY(helper.lowestNoteInHelper, NoteYPosition.Center);

            let offset = this.getStemSize(helper);
            if (helper.hasTuplet) {
                offset += this.resources.effectFont.size * 2;
            }

            if (helper.direction == BeamDirection.Up) {
                highestNotePosition -= offset;
            } else {
                lowestNotePosition += offset;
            }

            for (const beat of helper.beats) {
                this.helpers.collisionHelper.reserveBeatSlot(beat, highestNotePosition, lowestNotePosition);
            }
        }
    }

    protected override paintBeamingStem(
        beat: Beat,
        cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void {
        canvas.lineWidth = BarRendererBase.StemWidth * this.scale;
        canvas.beginPath();
        canvas.moveTo(x, topY);
        canvas.lineTo(x, bottomY);
        canvas.stroke();
        canvas.lineWidth = this.scale;
    }
}