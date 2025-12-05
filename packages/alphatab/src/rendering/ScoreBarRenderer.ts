import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { type Bar, BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Clef } from '@coderline/alphatab/model/Clef';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import { Staff } from '@coderline/alphatab/model/Staff';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import { ClefGlyph } from '@coderline/alphatab/rendering/glyphs/ClefGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { KeySignatureGlyph } from '@coderline/alphatab/rendering/glyphs/KeySignatureGlyph';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import { ScoreBeatGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreBeatGlyph';
import { ScoreBeatPreNotesGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTimeSignatureGlyph';
import { SlashNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/SlashNoteHeadGlyph';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ScoreBeatContainerGlyph } from '@coderline/alphatab/rendering/ScoreBeatContainerGlyph';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { type BeamingHelper, BeamingHelperDrawInfo } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * This BarRenderer renders a bar using standard music notation.
 * @internal
 */
export class ScoreBarRenderer extends LineBarRenderer {
    public static readonly StaffId: string = 'score';
    private static _sharpKsSteps: number[] = [-1, 2, -2, 1, 4, 0, 3];
    private static _flatKsSteps: number[] = [3, 0, 4, 1, 5, 2, 6];

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

    protected override calculateOverflows(rendererTop: number, rendererBottom: number): void {
        super.calculateOverflows(rendererTop, rendererBottom);
        if (this.bar.isEmpty) {
            return;
        }
        
        const noteOverflowPadding = this.getScoreHeight(1);

        let maxNoteY = 0;
        let minNoteY = 0;

        for (const v of this.helpers.beamHelpers) {
            for (const h of v) {
                if (h.isRestBeamHelper) {
                    if (h.minRestSteps) {
                        const topY = this.getScoreY(h.maxRestSteps!) - noteOverflowPadding;
                        if (topY < maxNoteY) {
                            maxNoteY = topY;
                        }
                    }
                    if (h.maxRestSteps) {
                        const bottomY = this.getScoreY(h.maxRestSteps!) + noteOverflowPadding;
                        if (bottomY < maxNoteY) {
                            maxNoteY = bottomY;
                        }
                    }
                }
                // notes with stems
                else if (h.beats.length === 1 && h.beats[0].duration >= Duration.Half) {
                    if (h.direction === BeamDirection.Up) {
                        let topY = this.getFlagTopY(h.beats[0], h.direction);
                        if (h.hasTuplet) {
                            topY -= this.tupletSize + this.tupletOffset;
                        }
                        if (topY < maxNoteY) {
                            maxNoteY = topY;
                        }

                        // bottom handled via beat container bBox
                    } else {
                        let bottomY = this.getFlagBottomY(h.beats[0], h.direction);
                        if (h.hasTuplet) {
                            bottomY += this.tupletSize + this.tupletOffset;
                        }
                        if (bottomY > minNoteY) {
                            minNoteY = bottomY;
                        }

                        // top handled via beat container bBox
                    }
                }
                // beamed notes and notes without stems
                // (see paintTuplets in case of doubts how we handle tuplets on non beamed notes)
                else {
                    this._ensureBeamDrawingInfo(h, h.direction);
                    const drawingInfo = h.drawingInfos.get(h.direction)!;

                    if (h.direction === BeamDirection.Up) {
                        let topY = Math.min(drawingInfo.startY, drawingInfo.endY);
                        if (h.hasTuplet) {
                            topY -= this.tupletSize + this.tupletOffset;
                        }

                        if (topY < maxNoteY) {
                            maxNoteY = topY;
                        }

                        const bottomY: number =
                            this.getBarLineStart(h.beatOfLowestNote, h.direction) + noteOverflowPadding;
                        if (bottomY > minNoteY) {
                            minNoteY = bottomY;
                        }
                    } else {
                        let bottomY = Math.max(drawingInfo.startY, drawingInfo.endY);

                        if (h.hasTuplet) {
                            bottomY += this.tupletSize + this.tupletOffset;
                        }

                        if (bottomY > minNoteY) {
                            minNoteY = bottomY;
                        }

                        const topY: number =
                            this.getBarLineStart(h.beatOfHighestNote, h.direction) - noteOverflowPadding;
                        if (topY < maxNoteY) {
                            maxNoteY = topY;
                        }
                    }
                }

                const beatContainer = this.getBeatContainer(h.beats[0]);
                if (beatContainer) {
                    const bBoxTop = beatContainer.getBoundingBoxTop();
                    const bBoxBottom = beatContainer.getBoundingBoxBottom();
                    if (bBoxBottom > minNoteY) {
                        minNoteY = bBoxBottom;
                    }
                    if (bBoxTop < maxNoteY) {
                        maxNoteY = bBoxTop;
                    }
                }
            }
        }

        if (maxNoteY < rendererTop) {
            this.registerOverflowTop(Math.abs(maxNoteY));
        }

        if (minNoteY > rendererBottom) {
            this.registerOverflowBottom(Math.abs(minNoteY) - rendererBottom);
        }
    }

    protected override get flagsSubElement(): BeatSubElement {
        return BeatSubElement.StandardNotationFlags;
    }

    protected override get beamsSubElement(): BeatSubElement {
        return BeatSubElement.StandardNotationBeams;
    }

    protected override get tupletSubElement(): BeatSubElement {
        return BeatSubElement.StandardNotationTuplet;
    }

    private _getSlashFlagY() {
        const line = (this.heightLineCount - 1) / 2;
        const slashY = this.getLineY(line);
        return slashY;
    }

    protected override getFlagTopY(beat: Beat, direction: BeamDirection): number {
        if (beat.slashed) {
            let slashY = this._getSlashFlagY();
            const symbol = SlashNoteHeadGlyph.getSymbol(beat.duration);
            const scale = beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;

            if (direction === BeamDirection.Down) {
                slashY -= this.smuflMetrics.stemDown.has(symbol)
                    ? this.smuflMetrics.stemDown.get(symbol)!.topY * scale
                    : 0;
            } else {
                slashY -= this.smuflMetrics.stemUp.has(symbol)
                    ? this.smuflMetrics.stemUp.get(symbol)!.bottomY * scale
                    : 0;
                slashY -= this.smuflMetrics.standardStemLength + scale;
            }

            return slashY;
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
            let slashY = this._getSlashFlagY();
            const symbol = SlashNoteHeadGlyph.getSymbol(beat.duration);
            const scale = beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;

            if (direction === BeamDirection.Down) {
                slashY -= this.smuflMetrics.stemDown.has(symbol)
                    ? this.smuflMetrics.stemDown.get(symbol)!.topY * scale
                    : 0;
                slashY += this.smuflMetrics.standardStemLength + scale;
            } else {
                slashY -= this.smuflMetrics.stemUp.has(symbol)
                    ? this.smuflMetrics.stemUp.get(symbol)!.bottomY * scale
                    : 0;
            }

            return slashY;
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

    public getStemBottomY(_beamingHelper: BeamingHelper): number {
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
            const bottom: number = this.getScoreY(this.heightLineCount * 2);
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

        this._ensureBeamDrawingInfo(h, direction);
        return h.drawingInfos.get(direction)!.calcY(x);
    }

    private _ensureBeamDrawingInfo(h: BeamingHelper, direction: BeamDirection) {
        if (!h.drawingInfos.has(direction)) {
            const scale = h.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;
            const barCount: number = ModelUtils.getIndex(h.shortestDuration) - 2;
            let stemSize = this.smuflMetrics.standardStemLength * scale;

            if (h.tremoloDuration) {
                // for 16th and shorter beats we need more space for all tremolos
                // for 8th beats we need only more space for 32nd tremolos

                // the logic here is not perfect but there is no SMuFL guideline
                // on how tremolos need to extend stems

                const oneBeamSize = (this.smuflMetrics.beamThickness + this.smuflMetrics.beamSpacing) * scale;
                if (h.shortestDuration > Duration.Eighth) {
                    if (h.tremoloDuration === Duration.Eighth) {
                        stemSize += oneBeamSize;
                    } else {
                        stemSize += oneBeamSize * 1.5;
                    }
                } else if (h.tremoloDuration === Duration.ThirtySecond) {
                    stemSize += oneBeamSize * 1.5;
                }
            }

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
                    direction === BeamDirection.Up ? this.getScoreY(h.minRestSteps!) : this.getScoreY(h.maxRestSteps!);
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
                    direction === BeamDirection.Up ? this.getScoreY(h.minRestSteps!) : this.getScoreY(h.maxRestSteps!);
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
                if (h.minRestSteps !== null || h.maxRestSteps !== null) {
                    const scaleMod: number = h.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1;
                    let barSpacing: number =
                        barCount * (this.smuflMetrics.beamSpacing + this.smuflMetrics.beamThickness) * scaleMod;
                    barSpacing += this.smuflMetrics.beamSpacing;

                    if (direction === BeamDirection.Up && h.minRestSteps !== null) {
                        const yNeededForRest = this.getScoreY(h.minRestSteps!) - barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMinRestSteps!));

                        const diff = yGivenByCurrentValues - yNeededForRest;
                        if (diff > 0) {
                            drawingInfo.startY -= diff;
                            drawingInfo.endY -= diff;
                        }
                    } else if (direction === BeamDirection.Down && h.maxRestSteps !== null) {
                        const yNeededForRest = this.getScoreY(h.maxRestSteps!) + barSpacing;
                        const yGivenByCurrentValues = drawingInfo.calcY(h.getBeatLineX(h.beatOfMaxRestSteps!));

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
                        const yNeededForSlash =
                            h.direction === BeamDirection.Up
                                ? this.getFlagTopY(b, h.direction)
                                : this.getFlagBottomY(b, h.direction);

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
            if (barCount > 2 && !isRest) {
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
            return direction === BeamDirection.Down
                ? this.getFlagTopY(beat, direction)
                : this.getFlagBottomY(beat, direction);
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
            this._createKeySignatureGlyphs();
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
            this._createTimeSignatureGlyphs();
        }
    }

    private _createKeySignatureGlyphs(): void {
        let offsetClef: number = 0;
        const currentKey = this.bar.keySignature as number;
        const previousKey = !this.bar.previousBar ? 0 : (this.bar.previousBar.keySignature as number);
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
                const step: number = ScoreBarRenderer._sharpKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Sharp, 1));
                newLines.set(step, true);
            }
        } else {
            for (let i: number = 0; i < Math.abs(currentKey); i++) {
                const step: number = ScoreBarRenderer._flatKsSteps[i] + offsetClef;
                newGlyphs.push(new AccidentalGlyph(0, this.getScoreY(step), AccidentalType.Flat, 1));
                newLines.set(step, true);
            }
        }
        // naturalize previous key if naturalizing
        if (this.bar.keySignature === KeySignature.C) {
            const naturalizeSymbols: number = Math.abs(previousKey);
            const previousKeyPositions = ModelUtils.keySignatureIsSharp(previousKey)
                ? ScoreBarRenderer._sharpKsSteps
                : ScoreBarRenderer._flatKsSteps;
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

    private _createTimeSignatureGlyphs(): void {
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
        super.createVoiceGlyphs(v);
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
        _cy: number,
        x: number,
        topY: number,
        bottomY: number,
        canvas: ICanvas
    ): void {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationStem, beat);
        canvas.fillRect(x, topY, this.smuflMetrics.stemThickness, bottomY - topY);
    }
}
