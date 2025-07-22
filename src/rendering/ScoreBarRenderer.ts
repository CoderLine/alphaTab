import { AccidentalType } from '@src/model/AccidentalType';
import { type Bar, BarSubElement } from '@src/model/Bar';
import { type Beat, BeatSubElement } from '@src/model/Beat';
import { Clef } from '@src/model/Clef';
import { Duration } from '@src/model/Duration';
import type { Note } from '@src/model/Note';
import type { Voice } from '@src/model/Voice';
import type { ICanvas } from '@src/platform/ICanvas';
import { NoteYPosition } from '@src/rendering/BarRendererBase';
import { AccidentalGlyph } from '@src/rendering/glyphs/AccidentalGlyph';
import { ClefGlyph } from '@src/rendering/glyphs/ClefGlyph';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreBeatGlyph } from '@src/rendering/glyphs/ScoreBeatGlyph';
import { ScoreBeatPreNotesGlyph } from '@src/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreTimeSignatureGlyph } from '@src/rendering/glyphs/ScoreTimeSignatureGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { ScoreBeatContainerGlyph } from '@src/rendering/ScoreBeatContainerGlyph';
import type { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { AccidentalHelper } from '@src/rendering/utils/AccidentalHelper';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { type BeamingHelper, BeamingHelperDrawInfo } from '@src/rendering/utils/BeamingHelper';
import { ModelUtils } from '@src/model/ModelUtils';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { KeySignature } from '@src/model/KeySignature';
import { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { KeySignatureGlyph } from '@src/rendering/glyphs/KeySignatureGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { Staff } from '@src/model/Staff';
import { GraceType } from '@src/model/GraceType';

/**
 * This BarRenderer renders a bar using standard music notation.
 */
export class ScoreBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'score';
    private static SharpKsSteps: number[] = [-1, 2, -2, 1, 4, 0, 3];
    private static FlatKsSteps: number[] = [3, 0, 4, 1, 5, 2, 6];

    public simpleWhammyOverflow: number = 0;

    public beatEffectsMinY: number | null = null;
    public beatEffectsMaxY: number | null = null;

    public accidentalHelper: AccidentalHelper;

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
        this.accidentalHelper = new AccidentalHelper(this);
    }

    public override get repeatsBarSubElement(): BarSubElement {
        return BarSubElement.StandardNotationRepeats;
    }

    public override get barNumberBarSubElement(): BarSubElement {
        return BarSubElement.StandardNotationBarNumber;
    }

    public override get barLineBarSubElement(): BarSubElement {
        return BarSubElement.StandardNotationBarLines;
    }

    public override get staffLineBarSubElement(): BarSubElement {
        return BarSubElement.StandardNotationStaffLine;
    }

    public override get showMultiBarRest(): boolean {
        return true;
    }

    public override get lineSpacing(): number {
        return this.smuflMetrics.oneStaffSpace;
    }

    public override get heightLineCount(): number {
        return 5;
    }

    public override get drawnLineCount(): number {
        return this.bar.staff.standardNotationLineCount;
    }

    public registerBeatEffectOverflows(beatEffectsMinY: number, beatEffectsMaxY: number) {
        const currentBeatEffectsMinY = this.beatEffectsMinY;
        if (currentBeatEffectsMinY == null || beatEffectsMinY < currentBeatEffectsMinY) {
            this.beatEffectsMinY = beatEffectsMinY;
        }

        const currentBeatEffectsMaxY = this.beatEffectsMaxY;
        if (currentBeatEffectsMaxY == null || beatEffectsMaxY > currentBeatEffectsMaxY) {
            this.beatEffectsMaxY = beatEffectsMaxY;
        }
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
            const top: number = this.getScoreY(-2);
            const bottom: number = this.getScoreY(this.heightLineCount * 2);
            const whammyOffset: number = this.simpleWhammyOverflow;

            const beatEffectsMinY = this.beatEffectsMinY;
            if (beatEffectsMinY !== null) {
                const beatEffectTopOverflow = top - beatEffectsMinY;
                if (beatEffectTopOverflow > 0) {
                    this.registerOverflowTop(beatEffectTopOverflow);
                }
            }

            const beatEffectsMaxY = this.beatEffectsMaxY;
            if (beatEffectsMaxY !== null) {
                const beatEffectBottomOverflow = beatEffectsMaxY - bottom;
                if (beatEffectBottomOverflow > 0) {
                    this.registerOverflowBottom(beatEffectBottomOverflow);
                }
            }

            this.registerOverflowTop(whammyOffset);

            const maxNoteHelper: BeamingHelper = this.helpers.getBeamingHelperForBeat(
                this.accidentalHelper.maxLineBeat
            );
            const noteOverflowPadding = this.getScoreHeight(1);

            // -1 to cover the half note head
            let maxNoteY: number = this.getScoreY(this.accidentalHelper.maxLine - 1) - noteOverflowPadding;
            if (maxNoteHelper.beats.length === 1) {
                if (maxNoteHelper.direction === BeamDirection.Up && maxNoteHelper.shortestDuration >= Duration.Whole) {
                    maxNoteY -= this.smuflMetrics.standardStemLength;
                }
            } else if (maxNoteHelper.direction === BeamDirection.Up) {
                // handle space needed for beams
                this.ensureDrawingInfo(maxNoteHelper, maxNoteHelper.direction);
                const maxNoteDrawingInfo = maxNoteHelper.drawingInfos.get(maxNoteHelper.direction)!;
                maxNoteY = maxNoteDrawingInfo.startY - noteOverflowPadding;
            }
            if (maxNoteHelper.hasTuplet) {
                maxNoteY -= this.tupletSize + this.tupletOffset;
            }

            if (maxNoteY < top) {
                this.registerOverflowTop(Math.abs(maxNoteY) + whammyOffset);
            }

            let minNoteY: number = this.getScoreY(this.accidentalHelper.minLine + 1) + noteOverflowPadding;
            const minNoteHelper: BeamingHelper = this.helpers.getBeamingHelperForBeat(
                this.accidentalHelper.minLineBeat!
            );

            if (minNoteHelper.beats.length === 1) {
                if (
                    minNoteHelper.direction === BeamDirection.Down &&
                    minNoteHelper.shortestDuration >= Duration.Quarter
                ) {
                    minNoteY += this.smuflMetrics.standardStemLength;
                }
            } else if (minNoteHelper.direction === BeamDirection.Down) {
                // handle space needed for beams
                this.ensureDrawingInfo(minNoteHelper, minNoteHelper.direction);
                const minNoteDrawingInfo = minNoteHelper.drawingInfos.get(minNoteHelper.direction)!;
                minNoteY = minNoteDrawingInfo.startY + noteOverflowPadding;
            }

            if (minNoteHelper.hasTuplet) {
                minNoteY += this.tupletSize + this.tupletOffset;
            }

            if (minNoteY > bottom) {
                this.registerOverflowBottom(Math.abs(minNoteY) - bottom);
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        this.paintBeams(cx, cy, canvas, BeatSubElement.StandardNotationFlags, BeatSubElement.StandardNotationBeams);
        this.paintTuplets(cx, cy, canvas, BeatSubElement.StandardNotationTuplet);
    }

    private getSlashFlagY(duration: Duration, direction: BeamDirection) {
        let line = (this.heightLineCount - 1) / 2;
        let offset = 0;
        switch (duration) {
            case Duration.QuadrupleWhole:
            case Duration.DoubleWhole:
            case Duration.Whole:
                offset += 2;
                break;
            default:
                offset += 1;
                break;
        }

        if (direction === BeamDirection.Down) {
            line += offset;
        } else {
            line -= offset;
        }

        const slashY = this.getLineY(line);
        return slashY;
    }

    protected override getFlagTopY(beat: Beat, direction: BeamDirection): number {
        if (beat.slashed) {
            return this.getSlashFlagY(beat.duration, direction);
        }

        const minNote = this.accidentalHelper.getMinLineNote(beat);
        if (minNote) {
            return this.getBeatContainer(beat)!.onNotes.getNoteY(
                minNote,
                direction === BeamDirection.Up ? NoteYPosition.TopWithStem : NoteYPosition.StemDown
            );
        }

        let y = this.getScoreY(this.accidentalHelper.getMinLine(beat));

        if (direction === BeamDirection.Up) {
            const scale = beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;
            y -= this.smuflMetrics.standardStemLength * scale;
        }

        return y;
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        if (beat.slashed) {
            return this.getSlashFlagY(beat.duration, direction);
        }

        const maxNote = this.accidentalHelper.getMaxLineNote(beat);
        if (maxNote) {
            return this.getBeatContainer(beat)!.onNotes.getNoteY(
                maxNote,
                direction === BeamDirection.Up ? NoteYPosition.StemUp : NoteYPosition.BottomWithStem
            );
        }

        let y = this.getScoreY(this.accidentalHelper.getMaxLine(beat));
        if (direction === BeamDirection.Down) {
            const scale = beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;
            y += this.smuflMetrics.standardStemLength * scale;
        }
        return y;
    }

    protected override getBeamDirection(helper: BeamingHelper): BeamDirection {
        return helper.direction;
    }

    public centerStaffStemY(helper: BeamingHelper) {
        const isStandardFive = this.bar.staff.standardNotationLineCount === Staff.DefaultStandardNotationLineCount;
        if (isStandardFive) {
            // center on the middle line for a standard 5-line staff
            return this.getScoreY(this.bar.staff.standardNotationLineCount - 1);
        }

        // for other staff line counts, we align the stem either on the top or bottom line
        if (helper.direction === BeamDirection.Up) {
            return this.getScoreY(this.bar.staff.standardNotationLineCount * 2);
        }
        return this.getScoreY(0);
    }

    public getStemBottomY(beamingHelper: BeamingHelper): number {
        throw new Error('Method not implemented.');
    }

    public override get middleYPosition(): number {
        return this.getScoreY(this.bar.staff.standardNotationLineCount - 1);
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        if (note.beat.slashed) {
            const line = (this.heightLineCount - 1) / 2;
            return this.getLineY(line);
        }

        let y = super.getNoteY(note, requestedPosition);
        if (Number.isNaN(y)) {
            // NOTE: some might request the note position before the glyphs have been created
            // e.g. the beaming helper, for these we just need a rough
            // estimate on the position
            const line = AccidentalHelper.computeLineWithoutAccidentals(this.bar, note);
            y = this.getScoreY(line);
            const scale = note.beat.graceType === GraceType.None ? 1 : NoteHeadGlyph.GraceScale;
            const stemHeight = this.smuflMetrics.standardStemLength * scale;
            const noteHeadHeight =
                this.smuflMetrics.glyphHeights.get(NoteHeadGlyph.getSymbol(note.beat.duration))! * scale;
            switch (requestedPosition) {
                case NoteYPosition.TopWithStem:
                    y -= stemHeight;
                    break;
                case NoteYPosition.Top:
                    y -= noteHeadHeight / 2;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                    y += noteHeadHeight / 2;
                    break;
                case NoteYPosition.BottomWithStem:
                    y += stemHeight;
                    break;
                case NoteYPosition.StemUp:
                    break;
                case NoteYPosition.StemDown:
                    break;
            }
        }
        return y;
    }

    public override applyLayoutingInfo(): boolean {
        const result = super.applyLayoutingInfo();
        if (result && this.bar.isMultiVoice) {
            // consider rest overflows
            const top: number = this.getScoreY(-2);
            const bottom: number = this.getScoreY(10);
            const minMax = this.helpers.collisionHelper.getBeatMinMaxY();
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
        if (h.beats.length === 0) {
            return direction === BeamDirection.Up
                ? this.getFlagTopY(h.beats[0], direction)
                : this.getFlagBottomY(h.beats[0], direction);
        }

        this.ensureDrawingInfo(h, direction);
        return h.drawingInfos.get(direction)!.calcY(x);
    }

    private ensureDrawingInfo(h: BeamingHelper, direction: BeamDirection) {
        if (!h.drawingInfos.has(direction)) {
            const scale = h.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;
            const stemSize = this.smuflMetrics.standardStemLength * scale;
            const drawingInfo = new BeamingHelperDrawInfo();
            h.drawingInfos.set(direction, drawingInfo);

            // the beaming logic works like this:
            // 1. we take the first and last note, add the stem, and put a diagnal line between them.
            // 2. the height of the diagonal line must not exceed a max height,
            //    - if this is the case, the line on the more distant note just gets longer
            // 3. any middle elements (notes or rests) shift this diagonal line up/down to avoid overlaps

            const firstBeat = h.beats[0];
            const lastBeat = h.beats[h.beats.length - 1];

            const isRest = h.isRestBeamHelper;

            // 1. put direct diagonal line.
            drawingInfo.startBeat = firstBeat;
            drawingInfo.startX = h.getBeatLineX(firstBeat);
            if (isRest) {
                drawingInfo.startY =
                    direction === BeamDirection.Up ? this.getScoreY(h.minRestLine!) : this.getScoreY(h.maxRestLine!);
            } else {
                drawingInfo.startY =
                    direction === BeamDirection.Up
                        ? this.getFlagTopY(firstBeat, direction)
                        : this.getFlagBottomY(firstBeat, direction);
            }

            drawingInfo.endBeat = lastBeat;
            drawingInfo.endX = h.getBeatLineX(lastBeat);
            if (isRest) {
                drawingInfo.endY =
                    direction === BeamDirection.Up ? this.getScoreY(h.minRestLine!) : this.getScoreY(h.maxRestLine!);
            } else {
                drawingInfo.endY =
                    direction === BeamDirection.Up
                        ? this.getFlagTopY(lastBeat, direction)
                        : this.getFlagBottomY(lastBeat, direction);
            }

            // 2. ensure max slope
            // we use the min/max notes to place the beam along their real position
            // we only want a maximum of 10 offset for their gradient
            const maxSlope: number = this.smuflMetrics.oneStaffSpace;
            if (
                direction === BeamDirection.Down &&
                drawingInfo.startY > drawingInfo.endY &&
                drawingInfo.startY - drawingInfo.endY > maxSlope
            ) {
                drawingInfo.endY = drawingInfo.startY - maxSlope;
            }
            if (
                direction === BeamDirection.Down &&
                drawingInfo.endY > drawingInfo.startY &&
                drawingInfo.endY - drawingInfo.startY > maxSlope
            ) {
                drawingInfo.startY = drawingInfo.endY - maxSlope;
            }
            if (
                direction === BeamDirection.Up &&
                drawingInfo.startY < drawingInfo.endY &&
                drawingInfo.endY - drawingInfo.startY > maxSlope
            ) {
                drawingInfo.endY = drawingInfo.startY + maxSlope;
            }
            if (
                direction === BeamDirection.Up &&
                drawingInfo.endY < drawingInfo.startY &&
                drawingInfo.startY - drawingInfo.endY > maxSlope
            ) {
                drawingInfo.startY = drawingInfo.endY + maxSlope;
            }

            // 3. let middle elements shift up/down
            if (h.beats.length > 1) {
                // check if highest note shifts bar up or down
                if (direction === BeamDirection.Up) {
                    const yNeededForHighestNote =
                        this.getScoreY(this.accidentalHelper.getMinLine(h.beatOfHighestNote)) - stemSize;
                    const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfHighestNote));

                    const diff = yGivenByCurrentValues - yNeededForHighestNote;
                    if (diff > 0) {
                        drawingInfo.startY -= diff;
                        drawingInfo.endY -= diff;
                    }
                } else {
                    const yNeededForLowestNote =
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
                    const scaleMod: number = h.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;
                    let barSpacing: number =
                        barCount * (this.smuflMetrics.beamSpacing + this.smuflMetrics.beamThickness) * scaleMod;
                    barSpacing += this.smuflMetrics.beamSpacing;

                    if (direction === BeamDirection.Up && h.minRestLine !== null) {
                        const yNeededForRest = this.getScoreY(h.minRestLine!) - barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMinRestLine!));

                        const diff = yGivenByCurrentValues - yNeededForRest;
                        if (diff > 0) {
                            drawingInfo.startY -= diff;
                            drawingInfo.endY -= diff;
                        }
                    } else if (direction === BeamDirection.Down && h.maxRestLine !== null) {
                        const yNeededForRest = this.getScoreY(h.maxRestLine!) + barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMaxRestLine!));

                        const diff = yNeededForRest - yGivenByCurrentValues;
                        if (diff > 0) {
                            drawingInfo.startY += diff;
                            drawingInfo.endY += diff;
                        }
                    }
                }

                // check if slash shifts bar up or down
                if (h.slashBeats.length > 0) {
                    for (const b of h.slashBeats) {
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(b));
                        let yNeededForSlash = this.getSlashFlagY(b.duration, direction);

                        if (direction === BeamDirection.Up) {
                            yNeededForSlash -= stemSize;
                        } else if (direction === BeamDirection.Down) {
                            yNeededForSlash += stemSize;
                        }

                        const diff = yNeededForSlash - yGivenByCurrentValues;
                        if (diff > 0) {
                            drawingInfo.startY += diff;
                            drawingInfo.endY += diff;
                        }
                    }
                }
            }

            // we can only draw up to 2 beams towards the noteheads, then we have to grow to the other side
            // here we shift accordingly
            const barCount: number = ModelUtils.getIndex(h.shortestDuration) - 2;
            if (barCount > 2 && !isRest) {
                const scale = h.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;
                const beamSpacing = this.smuflMetrics.beamSpacing * scale;
                const beamThickness = this.smuflMetrics.beamThickness * scale;
                const totalBarsHeight = barCount * beamThickness + (barCount - 1) * beamSpacing;

                if (direction === BeamDirection.Up) {
                    const bottomBarY = drawingInfo.startY + 2 * beamThickness + beamSpacing;
                    const barTopY = bottomBarY - totalBarsHeight;
                    const diff = drawingInfo.startY - barTopY;
                    if (diff > 0) {
                        drawingInfo.startY -= diff;
                        drawingInfo.endY -= diff;
                    }
                } else {
                    const topBarY = drawingInfo.startY - 2 * beamThickness + beamSpacing;
                    const barBottomY = topBarY + totalBarsHeight;
                    const diff = barBottomY - drawingInfo.startY;
                    if (diff > 0) {
                        drawingInfo.startY += diff;
                        drawingInfo.endY += diff;
                    }
                }
            }
        }
    }

    protected override getBarLineStart(beat: Beat, direction: BeamDirection): number {
        if (beat.slashed) {
            return this.getSlashFlagY(beat.duration, direction);
        }

        if (direction === BeamDirection.Up) {
            const maxNote = this.accidentalHelper.getMaxLineNote(beat);
            if (maxNote) {
                return this.getBeatContainer(beat)!.onNotes.getNoteY(maxNote, NoteYPosition.StemUp);
            }
            return this.getScoreY(this.accidentalHelper.getMaxLine(beat));
        }

        const minNote = this.accidentalHelper.getMinLineNote(beat);
        if (minNote) {
            return this.getBeatContainer(beat)!.onNotes.getNoteY(minNote, NoteYPosition.StemDown);
        }
        return this.getScoreY(this.accidentalHelper.getMinLine(beat));
    }

    protected override createLinePreBeatGlyphs(): void {
        // Clef
        let hasClef = false;
        if (
            this.isFirstOfLine ||
            this.bar.clef !== this.bar.previousBar!.clef ||
            this.bar.clefOttava !== this.bar.previousBar!.clefOttava
        ) {
            // SMUFL: Clefs should be positioned such that the pitch the clef refers to is on the baseline
            // (e.g. the F clef is placed such that the upper dot is above and the lower dot below the baseline).
            // If a clef does not refer specifically to a pitch, its y=0 should coincide with the center staff line on a five-line staff, or the visual center for staves with more or fewer than five lines (e.g. tablature staves).

            let offset = 0;
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

            this.addPreBeatGlyph(new ClefGlyph(0, this.getScoreY(offset), this.bar.clef, this.bar.clefOttava));
            this.addPreBeatGlyph(new SpacingGlyph(0, 0, this.smuflMetrics.preBeatGlyphSpacing));
            hasClef = true;
        }
        // Key signature
        if (
            hasClef ||
            (this.index === 0 && this.bar.keySignature !== KeySignature.C) ||
            (this.bar.previousBar && this.bar.keySignature !== this.bar.previousBar.keySignature)
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
                this.bar.masterBar.timeSignatureDenominator !==
                    this.bar.previousBar.masterBar.timeSignatureDenominator) ||
            (this.bar.previousBar &&
                this.bar.masterBar.isFreeTime &&
                this.bar.masterBar.isFreeTime !== this.bar.previousBar.masterBar.isFreeTime)
        ) {
            this.createStartSpacing();
            this.createTimeSignatureGlyphs();
        }
    }

    private createKeySignatureGlyphs(): void {
        let offsetClef: number = 0;
        const currentKey: number = this.bar.keySignature;
        const previousKey: number = !this.bar.previousBar ? 0 : this.bar.previousBar.keySignature;
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

        const glyph = new KeySignatureGlyph();
        glyph.gap = this.smuflMetrics.accidentalPadding;
        glyph.renderer = this;

        const newLines: Map<number, boolean> = new Map<number, boolean>();
        const newGlyphs: Glyph[] = [];
        // how many symbols do we need to get from a C-keysignature
        // to the new one
        // var offsetSymbols = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (ModelUtils.keySignatureIsSharp(currentKey)) {
            for (let i: number = 0; i < Math.abs(currentKey); i++) {
                const step: number = ScoreBarRenderer.SharpKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Sharp, 1));
                newLines.set(step, true);
            }
        } else {
            for (let i: number = 0; i < Math.abs(currentKey); i++) {
                const step: number = ScoreBarRenderer.FlatKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Flat, 1));
                newLines.set(step, true);
            }
        }
        // naturalize previous key if naturalizing
        if (this.bar.keySignature === KeySignature.C) {
            const naturalizeSymbols: number = Math.abs(previousKey);
            const previousKeyPositions = ModelUtils.keySignatureIsSharp(previousKey)
                ? ScoreBarRenderer.SharpKsSteps
                : ScoreBarRenderer.FlatKsSteps;
            for (let i: number = 0; i < naturalizeSymbols; i++) {
                const step: number = previousKeyPositions[i] + offsetClef;
                if (!newLines.has(step)) {
                    glyph.addGlyph(
                        new AccidentalGlyph(
                            0,
                            this.getScoreY(previousKeyPositions[i] + offsetClef),
                            AccidentalType.Natural,
                            1
                        )
                    );
                }
            }
        }

        for (const newGlyph of newGlyphs) {
            glyph.addGlyph(newGlyph);
        }

        this.addPreBeatGlyph(glyph);

        if (!glyph.isEmpty) {
            this.addPreBeatGlyph(new SpacingGlyph(0, 0, this.smuflMetrics.preBeatGlyphSpacing));
        }
    }

    private createTimeSignatureGlyphs(): void {
        const lines = this.bar.staff.standardNotationLineCount - 1;
        this.addPreBeatGlyph(
            new ScoreTimeSignatureGlyph(
                0,
                this.getScoreY(lines),
                this.bar.masterBar.timeSignatureNumerator,
                this.bar.masterBar.timeSignatureDenominator,
                this.bar.masterBar.timeSignatureCommon,
                this.bar.masterBar.isFreeTime
            )
        );
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, this.smuflMetrics.preBeatGlyphSpacing));
    }

    protected override createVoiceGlyphs(v: Voice): void {
        for (const b of v.beats) {
            const container: ScoreBeatContainerGlyph = new ScoreBeatContainerGlyph(b, this.getVoiceContainer(v)!);
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
            let highestNotePosition = 0;
            let lowestNotePosition = 0;

            let offset = 0;
            if (helper.hasTuplet) {
                offset += this.resources.effectFont.size * 2;
            }

            if (helper.direction === BeamDirection.Up) {
                highestNotePosition = this.getNoteY(helper.highestNoteInHelper, NoteYPosition.TopWithStem) - offset;
                lowestNotePosition = this.getNoteY(helper.lowestNoteInHelper, NoteYPosition.Bottom);
            } else {
                highestNotePosition = this.getNoteY(helper.highestNoteInHelper, NoteYPosition.Top);
                lowestNotePosition = this.getNoteY(helper.lowestNoteInHelper, NoteYPosition.BottomWithStem) + offset;
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
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationStem, beat);
        canvas.fillRect(x, topY, this.smuflMetrics.stemThickness, bottomY - topY);
    }

    protected override paintStemEffects(
        beat: Beat,
        cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationEffects, beat);
        super.paintStemEffects(beat, cy, x, topY, bottomY, canvas);
    }
}
