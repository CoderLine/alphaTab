import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Clef } from '@coderline/alphatab/model/Clef';
import { ModelUtils, type ResolvedSpelling } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';

/**
 * @internal
 */
class BeatSteps {
    public maxSteps: number = -1000;
    public maxStepsNote: Note | null = null;
    public minSteps: number = -1000;
    public minStepsNote: Note | null = null;
}

/**
 * This small utilty public class allows the assignment of accidentals within a
 * desired scope.
 * @internal
 */
export class AccidentalHelper {
    private _bar: Bar;
    private _barRenderer: LineBarRenderer;

    /**
     * We always have 7 steps per octave.
     * (by a step the offsets inbetween score lines is meant,
     *      0 steps is on the first line (counting from top)
     *      1 steps is on the space inbetween the first and the second line
     */
    private static readonly _stepsPerOctave: number = 7;

    /**
     * Those are the amount of steps for the different clefs in case of a note value 0
     * [Neutral, C3, C4, F4, G2]
     */
    private static _octaveSteps: number[] = [38, 32, 30, 26, 38];

    /**
     * Diatonic step offsets within an octave.
     */
    private static readonly _diatonicSteps: number[] = [0, 1, 2, 3, 4, 5, 6];

    private _registeredAccidentals: Map<number, number> = new Map();
    private _appliedScoreSteps: Map<number, number> = new Map();
    private _appliedScoreStepsByValue: Map<number, number> = new Map();
    private _notesByValue: Map<number, Note> = new Map();
    private _beatSteps: Map<number, BeatSteps> = new Map();

    /**
     * The beat on which the highest note of this helper was added.
     * Used together with beaming helper to calculate overflow.
     */
    public maxStepsBeat: Beat | null = null;
    /**
     * The beat on which the lowest note of this helper was added.
     * Used together with beaming helper to calculate overflow.
     */
    public minStepsBeat: Beat | null = null;
    /**
     * The steps of the highest note added to this helper.
     */
    public maxSteps: number = -1000;
    /**
     * The steps of the lowest note added to this helper.
     */
    public minSteps: number = -1000;

    public constructor(barRenderer: LineBarRenderer) {
        this._barRenderer = barRenderer;
        this._bar = barRenderer.bar;
    }

    public static getPercussionSteps(note: Note): number {
        return PercussionMapper.getArticulation(note)?.staffLine ?? 0;
    }

    public static getNoteValue(note: Note) {
        return note.displayValue;
    }

    /**
     * Calculates the accidental for the given note and assignes the value to it.
     * The new accidental type is also registered within the current scope
     * @param note
     * @returns
     */
    public applyAccidental(note: Note): AccidentalType {
        const noteValue = AccidentalHelper.getNoteValue(note);
        const quarterBend: boolean = note.hasQuarterToneOffset;
        return this._getAccidental(noteValue, quarterBend, note.beat, false, note);
    }

    /**
     * Calculates the accidental for the given note value and assignes the value to it.
     * The new accidental type is also registered within the current scope
     * @param relatedBeat
     * @param noteValue
     * @param quarterBend
     * @param isHelperNote true if the note registered via this call, is a small helper note (e.g. for bends) or false if it is a main note head (e.g. for harmonics)
     * @returns
     */
    public applyAccidentalForValue(
        relatedBeat: Beat,
        noteValue: number,
        quarterBend: boolean,
        isHelperNote: boolean
    ): AccidentalType {
        return this._getAccidental(noteValue, quarterBend, relatedBeat, isHelperNote, null);
    }

    public static computeStepsWithoutAccidentals(bar: Bar, note: Note) {
        let steps = 0;
        const noteValue = AccidentalHelper.getNoteValue(note);

        if (note.isPercussion) {
            steps = AccidentalHelper.getPercussionSteps(note);
        } else {
            const spelling = ModelUtils.resolveSpelling(bar.keySignature, noteValue, note.accidentalMode);
            steps = AccidentalHelper.calculateNoteSteps(bar.clef, spelling);
        }
        return steps;
    }

    private _getAccidental(
        noteValue: number,
        quarterBend: boolean,
        relatedBeat: Beat,
        isHelperNote: boolean,
        note: Note | null = null
    ): AccidentalType {
        let steps: number = 0;

        let accidentalToSet = AccidentalType.None;

        const isPercussion = note != null ? note.isPercussion : false;
        if (isPercussion) {
            steps = AccidentalHelper.getPercussionSteps(note!);
        } else {
            const accidentalMode = note ? note.accidentalMode : NoteAccidentalMode.Default;
            const spelling = ModelUtils.resolveSpelling(this._bar.keySignature, noteValue, accidentalMode);
            steps = AccidentalHelper.calculateNoteSteps(this._bar.clef, spelling);

            const currentAccidentalOffset = this._registeredAccidentals.has(steps)
                ? this._registeredAccidentals.get(steps)!
                : null;

            accidentalToSet = ModelUtils.computeAccidentalForSpelling(
                this._bar.keySignature,
                accidentalMode,
                spelling,
                quarterBend,
                currentAccidentalOffset
            );

            let skipAccidental = false;
            switch (accidentalToSet) {
                case AccidentalType.NaturalQuarterNoteUp:
                case AccidentalType.SharpQuarterNoteUp:
                case AccidentalType.FlatQuarterNoteUp:
                    // quarter notes are always set and not compared with steps
                    break;
                default:
                    // Issue #472: Tied notes across bars do not show the accidentals but also
                    // do not register them.
                    // https://ultimatemusictheory.com/tied-notes-with-accidentals/
                    if (note && note.isTieDestination && note.beat.index === 0) {
                        // candidate for skip, check further if start note is on the same steps
                        const tieOriginBarRenderer = this._barRenderer.scoreRenderer.layout?.getRendererForBar(
                            this._barRenderer.staff!.staffId,
                            note.tieOrigin!.beat.voice.bar
                        ) as ScoreBarRenderer | null;
                        if (tieOriginBarRenderer && tieOriginBarRenderer.staff === this._barRenderer.staff) {
                            const tieOriginSteps = tieOriginBarRenderer.accidentalHelper.getNoteSteps(note.tieOrigin!);
                            if (tieOriginSteps === steps) {
                                skipAccidental = true;
                            }
                        }
                    }

                    if (skipAccidental) {
                        accidentalToSet = AccidentalType.None;
                    }
                    break;
            }

            const shouldRegister = !quarterBend && accidentalToSet !== AccidentalType.None;

            if (shouldRegister) {
                this._registeredAccidentals.set(steps, spelling.accidentalOffset);
            }
        }

        if (note) {
            this._appliedScoreSteps.set(note.id, steps);
            this._notesByValue.set(noteValue, note);
        } else {
            this._appliedScoreStepsByValue.set(noteValue, steps);
        }

        if (this.minSteps === -1000 || this.minSteps < steps) {
            this.minSteps = steps;
            this.minStepsBeat = relatedBeat;
        }
        if (this.maxSteps === -1000 || this.maxSteps > steps) {
            this.maxSteps = steps;
            this.maxStepsBeat = relatedBeat;
        }

        if (!isHelperNote) {
            this._registerSteps(relatedBeat, steps, note);
        }

        return accidentalToSet;
    }

    private _registerSteps(relatedBeat: Beat, steps: number, note: Note | null) {
        let beatSteps: BeatSteps;
        if (this._beatSteps.has(relatedBeat.id)) {
            beatSteps = this._beatSteps.get(relatedBeat.id)!;
        } else {
            beatSteps = new BeatSteps();
            this._beatSteps.set(relatedBeat.id, beatSteps);
        }
        if (beatSteps.minSteps === -1000 || steps < beatSteps.minSteps) {
            beatSteps.minSteps = steps;
            beatSteps.minStepsNote = note;
        }
        if (beatSteps.minSteps === -1000 || steps > beatSteps.maxSteps) {
            beatSteps.maxSteps = steps;
            beatSteps.maxStepsNote = note;
        }
    }

    public getMaxSteps(b: Beat): number {
        return this._beatSteps.has(b.id) ? this._beatSteps.get(b.id)!.maxSteps : 0;
    }

    public getMaxStepsNote(b: Beat): Note | null {
        return this._beatSteps.has(b.id) ? this._beatSteps.get(b.id)!.maxStepsNote : null;
    }

    public getMinSteps(b: Beat): number {
        return this._beatSteps.has(b.id) ? this._beatSteps.get(b.id)!.minSteps : 0;
    }

    public getMinStepsNote(b: Beat): Note | null {
        return this._beatSteps.has(b.id) ? this._beatSteps.get(b.id)!.minStepsNote : null;
    }

    public static calculateNoteSteps(clef: Clef, spelling: ResolvedSpelling): number {
        const clefValue: number = clef as number;

        // Initial Position
        let steps: number = AccidentalHelper._octaveSteps[clefValue];
        // Move to Octave
        steps -= spelling.octave * AccidentalHelper._stepsPerOctave;
        // Move within octave
        steps -= AccidentalHelper._diatonicSteps[spelling.degree];

        return steps;
    }

    public getNoteSteps(n: Note): number {
        return this._appliedScoreSteps.get(n.id)!;
    }

    public getNoteStepsForValue(rawValue: number, searchForNote: boolean = false): number {
        if (this._appliedScoreStepsByValue.has(rawValue)) {
            return this._appliedScoreStepsByValue.get(rawValue)!;
        }
        if (searchForNote && this._notesByValue.has(rawValue)) {
            return this.getNoteSteps(this._notesByValue.get(rawValue)!);
        }
        return 0;
    }
}