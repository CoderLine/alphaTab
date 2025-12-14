import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { type Bar, BarSubElement } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Clef } from '@coderline/alphatab/model/Clef';
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
import { ScoreTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTimeSignatureGlyph';
import { SlashNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/SlashNoteHeadGlyph';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ScoreBeatContainerGlyph } from '@coderline/alphatab/rendering/ScoreBeatContainerGlyph';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
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

    public override get lineSpacing(): number {
        return this.smuflMetrics.oneStaffSpace;
    }

    public override get heightLineCount(): number {
        return Math.max(5, this.bar.staff.standardNotationLineCount);
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
        this.calculateBeamingOverflows(rendererTop, rendererBottom);
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
            const scale = beat.graceType !== GraceType.None ? EngravingSettings.GraceScale : 1;

            if (direction === BeamDirection.Down) {
                slashY -= this.smuflMetrics.stemDown.has(symbol)
                    ? this.smuflMetrics.stemDown.get(symbol)!.topY * scale
                    : 0;
            } else {
                slashY -= this.smuflMetrics.stemUp.has(symbol)
                    ? this.smuflMetrics.stemUp.get(symbol)!.bottomY * scale
                    : 0;
                if (!beat.isRest) {
                    slashY -= this.smuflMetrics.standardStemLength + scale;
                }
            }

            return slashY;
        }

        const minNote = this.accidentalHelper.getMinStepsNote(beat);
        if (minNote) {
            return this.getNoteY(
                minNote,
                direction === BeamDirection.Up ? NoteYPosition.TopWithStem : NoteYPosition.StemDown
            );
        }

        let y = this.getScoreY(this.accidentalHelper.getMinSteps(beat));

        if (direction === BeamDirection.Up && !beat.isRest) {
            const scale = beat.graceType !== GraceType.None ? EngravingSettings.GraceScale : 1;
            y -= this.smuflMetrics.standardStemLength * scale;
        }

        return y;
    }

    protected override getFlagBottomY(beat: Beat, direction: BeamDirection): number {
        if (beat.slashed) {
            let slashY = this._getSlashFlagY();
            const symbol = SlashNoteHeadGlyph.getSymbol(beat.duration);
            const scale = beat.graceType !== GraceType.None ? EngravingSettings.GraceScale : 1;

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

        const maxNote = this.accidentalHelper.getMaxStepsNote(beat);
        if (maxNote) {
            return this.getNoteY(
                maxNote,
                direction === BeamDirection.Up ? NoteYPosition.StemUp : NoteYPosition.BottomWithStem
            );
        }

        let y = this.getScoreY(this.accidentalHelper.getMaxSteps(beat));
        if (direction === BeamDirection.Down) {
            const scale = beat.graceType !== GraceType.None ? EngravingSettings.GraceScale : 1;
            y += this.smuflMetrics.standardStemLength * scale;
        }
        return y;
    }

    protected override getBeamDirection(helper: BeamingHelper): BeamDirection {
        return helper.direction;
    }

    public centerStaffStemY(direction: BeamDirection) {
        const isStandardFive = this.bar.staff.standardNotationLineCount === Staff.DefaultStandardNotationLineCount;
        if (isStandardFive) {
            // center on the middle line for a standard 5-line staff
            return this.getScoreY(this.bar.staff.standardNotationLineCount - 1);
        }

        // for other staff line counts, we align the stem either on the top or bottom line
        if (direction === BeamDirection.Up) {
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
            const steps = AccidentalHelper.computeStepsWithoutAccidentals(this.bar, note);
            y = this.getScoreY(steps);
            const scale = note.beat.graceType === GraceType.None ? 1 : EngravingSettings.GraceScale;
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

        this.ensureBeamDrawingInfo(h, direction);
        return h.drawingInfos.get(direction)!.calcY(x);
    }

    protected override getBarLineStart(beat: Beat, direction: BeamDirection): number {
        if (beat.slashed) {
            return direction === BeamDirection.Down
                ? this.getFlagTopY(beat, direction)
                : this.getFlagBottomY(beat, direction);
        }

        if (direction === BeamDirection.Up) {
            const maxNote = this.accidentalHelper.getMaxStepsNote(beat);
            if (maxNote) {
                return this.getNoteY(maxNote, NoteYPosition.StemUp);
            }
            return this.getScoreY(this.accidentalHelper.getMaxSteps(beat));
        }

        const minNote = this.accidentalHelper.getMinStepsNote(beat);
        if (minNote) {
            return this.getNoteY(minNote, NoteYPosition.StemDown);
        }
        return this.getScoreY(this.accidentalHelper.getMinSteps(beat));
    }

    protected override getMinLineOfBeat(beat: Beat): number {
        return this.accidentalHelper.getMinSteps(beat) / 2;
    }

    protected override getMaxLineOfBeat(beat: Beat): number {
        return this.accidentalHelper.getMaxSteps(beat) / 2;
    }

    protected override createLinePreBeatGlyphs(): void {
        // Clef
        let hasClef = false;
        if (
            this.isFirstOfStaff ||
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
            this.addBeatGlyph(new ScoreBeatContainerGlyph(b));
        }
    }

    public override getNoteLine(note: Note): number {
        return this.accidentalHelper.getNoteSteps(note) / 2;
    }

    public getNoteSteps(n: Note): number {
        return this.accidentalHelper.getNoteSteps(n);
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
