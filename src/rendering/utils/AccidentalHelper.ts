import { AccidentalType } from '@src/model/AccidentalType';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Clef } from '@src/model/Clef';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { ModelUtils } from '@src/model/ModelUtils';
import { PercussionMapper } from '../../model/PercussionMapper';
import { ScoreBarRenderer } from '../ScoreBarRenderer';


class BeatLines {
    public maxLine: number = -1000;
    public minLine: number = -1000;
}


/**
 * This small utilty public class allows the assignment of accidentals within a
 * desired scope.
 */
export class AccidentalHelper {
    private _bar: Bar;
    private _barRenderer: ScoreBarRenderer;

    /**
     * a lookup list containing an info whether the notes within an octave
     * need an accidental rendered. the accidental symbol is determined based on the type of key signature.
     */
    private static KeySignatureLookup: Array<boolean[]> = [
        // Flats (where the value is true, a flat accidental is required for the notes)
        [true, true, true, true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, false, true, true, true, true, true, true],
        [false, true, true, true, true, false, true, true, true, true, true, true],
        [false, true, true, true, true, false, false, false, true, true, true, true],
        [false, false, false, true, true, false, false, false, true, true, true, true],
        [false, false, false, true, true, false, false, false, false, false, true, true],
        [false, false, false, false, false, false, false, false, false, false, true, true],
        // natural
        [false, false, false, false, false, false, false, false, false, false, false, false],
        // sharps  (where the value is true, a flat accidental is required for the notes)
        [false, false, false, false, false, true, true, false, false, false, false, false],
        [true, true, false, false, false, true, true, false, false, false, false, false],
        [true, true, false, false, false, true, true, true, true, false, false, false],
        [true, true, true, true, false, true, true, true, true, false, false, false],
        [true, true, true, true, false, true, true, true, true, true, true, false],
        [true, true, true, true, true, true, true, true, true, true, true, false],
        [true, true, true, true, true, true, true, true, true, true, true, true]
    ];

    /**
     * Contains the list of notes within an octave have accidentals set.
     */
    // prettier-ignore
    private static AccidentalNotes: boolean[] = [
        false, true, false, true, false, false, true, false, true, false, true, false
    ];

    /**
     * We always have 7 steps per octave.
     * (by a step the offsets inbetween score lines is meant,
     *      0 steps is on the first line (counting from top)
     *      1 steps is on the space inbetween the first and the second line
     */
    private static readonly StepsPerOctave: number = 7;

    /**
     * Those are the amount of steps for the different clefs in case of a note value 0
     * [Neutral, C3, C4, F4, G2]
     */
    private static OctaveSteps: number[] = [38, 32, 30, 26, 38];

    /**
     * The step offsets of the notes within an octave in case of for sharp keysignatures
     */
    private static SharpNoteSteps: number[] = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

    /**
     * The step offsets of the notes within an octave in case of for flat keysignatures
     */
    private static FlatNoteSteps: number[] = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];

    private _registeredAccidentals: Map<number, AccidentalType> = new Map();
    private _appliedScoreLines: Map<number, number> = new Map();
    private _appliedScoreLinesByValue: Map<number, number> = new Map();
    private _notesByValue: Map<number, Note> = new Map();
    private _beatLines: Map<number, BeatLines> = new Map();

    /**
     * The beat on which the highest note of this helper was added.
     * Used together with beaming helper to calculate overflow.
     */
    public maxLineBeat: Beat | null = null;
    /**
     * The beat on which the lowest note of this helper was added.
     * Used together with beaming helper to calculate overflow.
     */
    public minLineBeat: Beat | null = null;
    /**
     * The line of the highest note added to this helper.
     */
    public maxLine: number = -1000;
    /**
     * The line of the lowest note added to this helper.
     */
    public minLine: number = -1000;

    public constructor(barRenderer: ScoreBarRenderer) {
        this._barRenderer = barRenderer;
        this._bar = barRenderer.bar;
    }

    public static getPercussionLine(bar: Bar, noteValue: number): number {
        if (noteValue < bar.staff.track.percussionArticulations.length) {
            return bar.staff.track.percussionArticulations[noteValue]!.staffLine;
        } else {
            return PercussionMapper.getArticulationByValue(noteValue)?.staffLine ?? 0;
        }
    }

    public static getNoteValue(note: Note) {
        if (note.isPercussion) {
            return note.percussionArticulation;
        }

        let noteValue: number = note.displayValue;

        // adjust note height according to accidentals enforced
        switch (note.accidentalMode) {
            case NoteAccidentalMode.ForceDoubleFlat:
                noteValue += 2;
                break;
            case NoteAccidentalMode.ForceDoubleSharp:
                noteValue -= 2;
                break;
            case NoteAccidentalMode.ForceFlat:
                noteValue += 1;
                break;
            case NoteAccidentalMode.ForceSharp:
                noteValue -= 1;
                break;
        }

        return noteValue;
    }

    /**
     * Calculates the accidental for the given note and assignes the value to it.
     * The new accidental type is also registered within the current scope
     * @param note
     * @returns
     */
    public applyAccidental(note: Note): AccidentalType {
        const noteValue = AccidentalHelper.getNoteValue(note);
        let quarterBend: boolean = note.hasQuarterToneOffset;
        return this.getAccidental(noteValue, quarterBend, note.beat, false, note);
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
    public applyAccidentalForValue(relatedBeat: Beat, noteValue: number, quarterBend: boolean, isHelperNote: boolean): AccidentalType {
        return this.getAccidental(noteValue, quarterBend, relatedBeat, isHelperNote, null);
    }

    public static computeLineWithoutAccidentals(bar: Bar, note: Note) {
        let line: number = 0;
        const noteValue = AccidentalHelper.getNoteValue(note);

        if (bar.staff.isPercussion) {
            line = AccidentalHelper.getPercussionLine(bar, noteValue);
        } else {
            const accidentalMode = note ? note.accidentalMode : NoteAccidentalMode.Default;
            line = AccidentalHelper.calculateNoteLine(bar, noteValue, accidentalMode);
        }
        return line;
    }

    private getAccidental(
        noteValue: number,
        quarterBend: boolean,
        relatedBeat: Beat,
        isHelperNote: boolean,
        note: Note | null = null
    ): AccidentalType {
        let accidentalToSet: AccidentalType = AccidentalType.None;
        let line: number = 0;

        if (this._bar.staff.isPercussion) {
            line = AccidentalHelper.getPercussionLine(this._bar, noteValue);
        } else {
            const accidentalMode = note ? note.accidentalMode : NoteAccidentalMode.Default;
            line = AccidentalHelper.calculateNoteLine(this._bar, noteValue, accidentalMode);

            let ks: number = this._bar.masterBar.keySignature;
            let ksi: number = ks + 7;
            let index: number = noteValue % 12;

            let accidentalForKeySignature: AccidentalType = ksi < 7 ? AccidentalType.Flat : AccidentalType.Sharp;
            let hasKeySignatureAccidentalSetForNote: boolean = AccidentalHelper.KeySignatureLookup[ksi][index];
            let hasNoteAccidentalWithinOctave: boolean = AccidentalHelper.AccidentalNotes[index];

            // the general logic is like this:
            // - we check if the key signature has an accidental defined
            // - we calculate which accidental a note needs according to its index in the octave
            // - if the accidental is already placed at this line, nothing needs to be done, otherwise we place it
            // - if there should not be an accidental, but there is one in the key signature, we clear it.

            // the exceptions are:
            // - for quarter bends we just place the corresponding accidental
            // - the accidental mode can enforce the accidentals for the note

            if (quarterBend) {
                accidentalToSet = hasNoteAccidentalWithinOctave ? accidentalForKeySignature : AccidentalType.Natural;
                switch (accidentalToSet) {
                    case AccidentalType.Natural:
                        accidentalToSet = AccidentalType.NaturalQuarterNoteUp;
                        break;
                    case AccidentalType.Sharp:
                        accidentalToSet = AccidentalType.SharpQuarterNoteUp;
                        break;
                    case AccidentalType.Flat:
                        accidentalToSet = AccidentalType.FlatQuarterNoteUp;
                        break;
                }
            } else {
                // define which accidental should be shown ignoring what might be set on the KS already
                switch (accidentalMode) {
                    case NoteAccidentalMode.ForceSharp:
                        accidentalToSet = AccidentalType.Sharp;
                        break;
                    case NoteAccidentalMode.ForceDoubleSharp:
                        accidentalToSet = AccidentalType.DoubleSharp;
                        break;
                    case NoteAccidentalMode.ForceFlat:
                        accidentalToSet = AccidentalType.Flat;
                        break;
                    case NoteAccidentalMode.ForceDoubleFlat:
                        accidentalToSet = AccidentalType.DoubleFlat;
                        break;
                    default:
                        // if note has an accidental in the octave, we place a symbol
                        // according to the Key Signature
                        if (hasNoteAccidentalWithinOctave) {
                            accidentalToSet = accidentalForKeySignature;
                        } else if (hasKeySignatureAccidentalSetForNote) {
                            // note does not get an accidental, but KS defines one -> Naturalize
                            accidentalToSet = AccidentalType.Natural;
                        }
                        break;
                }

                // Issue #472: Tied notes across bars do not show the accidentals but also 
                // do not register them. 
                // https://ultimatemusictheory.com/tied-notes-with-accidentals/
                let skipAccidental = false;
                if (note && note.isTieDestination && note.beat.index === 0) {
                    // candidate for skip, check further if start note is on the same line
                    const previousRenderer = this._barRenderer.previousRenderer as ScoreBarRenderer;
                    if (previousRenderer) {
                        const tieOriginLine = previousRenderer.accidentalHelper.getNoteLine(note.tieOrigin!);
                        if (tieOriginLine === line) {
                            skipAccidental = true;
                        }
                    }
                }


                if (skipAccidental) {
                    accidentalToSet = AccidentalType.None;
                } else {
                    // do we need an accidental on the note?
                    if (accidentalToSet !== AccidentalType.None) {
                        // if we already have an accidental on this line we will reset it if it's the same
                        if (this._registeredAccidentals.has(line)) {
                            if (this._registeredAccidentals.get(line) === accidentalToSet) {
                                accidentalToSet = AccidentalType.None;
                            }
                        }
                        // if there is no accidental on the line, and the key signature has it set already, we clear it on the note
                        else if (hasKeySignatureAccidentalSetForNote && accidentalToSet === accidentalForKeySignature) {
                            accidentalToSet = AccidentalType.None;
                        }

                        // register the new accidental on the line if any.
                        if (accidentalToSet != AccidentalType.None) {
                            this._registeredAccidentals.set(line, accidentalToSet);
                        }
                    } else {
                        // if we don't want an accidental, but there is already one applied, we place a naturalize accidental
                        // and clear the registration
                        if (this._registeredAccidentals.has(line)) {
                            // if there is already a naturalize symbol on the line, we don't care.
                            if (this._registeredAccidentals.get(line) === AccidentalType.Natural) {
                                accidentalToSet = AccidentalType.None;
                            } else {
                                accidentalToSet = AccidentalType.Natural;
                                this._registeredAccidentals.set(line, accidentalToSet);
                            }
                        } else {
                            this._registeredAccidentals.delete(line);
                        }
                    }
                }
            }
        }

        if (note) {
            this._appliedScoreLines.set(note.id, line);
            this._notesByValue.set(noteValue, note);
        } else {
            this._appliedScoreLinesByValue.set(noteValue, line);
        }

        if (this.minLine === -1000 || this.minLine < line) {
            this.minLine = line;
            this.minLineBeat = relatedBeat;
        }
        if (this.maxLine === -1000 || this.maxLine > line) {
            this.maxLine = line;
            this.maxLineBeat = relatedBeat;
        }

        if (!isHelperNote) {
            this.registerLine(relatedBeat, line);
        }

        return accidentalToSet;
    }

    private registerLine(relatedBeat: Beat, line: number) {
        let lines: BeatLines;
        if (this._beatLines.has(relatedBeat.id)) {
            lines = this._beatLines.get(relatedBeat.id)!;
        }
        else {
            lines = new BeatLines();
            this._beatLines.set(relatedBeat.id, lines);
        }
        if (lines.minLine === -1000 || line < lines.minLine) {
            lines.minLine = line;
        }
        if (lines.minLine === -1000 || line > lines.maxLine) {
            lines.maxLine = line;
        }
    }

    public getMaxLine(b: Beat): number {
        return this._beatLines.has(b.id)
            ? this._beatLines.get(b.id)!.maxLine
            : 0;
    }

    public getMinLine(b: Beat): number {
        return this._beatLines.has(b.id)
            ? this._beatLines.get(b.id)!.minLine
            : 0;
    }

    private static calculateNoteLine(bar: Bar, noteValue: number, mode: NoteAccidentalMode): number {
        let value: number = noteValue;
        let ks: number = bar.masterBar.keySignature;
        let clef: Clef = bar.clef;
        let index: number = value % 12;
        let octave: number = ((value / 12) | 0) - 1;

        // Initial Position
        let steps: number = AccidentalHelper.OctaveSteps[clef];
        // Move to Octave
        steps -= octave * AccidentalHelper.StepsPerOctave;
        // get the step list for the current keySignature
        let stepList =
            ModelUtils.keySignatureIsSharp(ks) || ModelUtils.keySignatureIsNatural(ks)
                ? AccidentalHelper.SharpNoteSteps
                : AccidentalHelper.FlatNoteSteps;
        // Add offset for note itself
        switch (mode) {
            default:
                // normal behavior: simply use the position where
                // the keysignature defines the position
                break;
        }
        steps -= stepList[index];

        return steps;
    }

    public getNoteLine(n: Note): number {
        return this._appliedScoreLines.get(n.id)!;
    }

    public getNoteLineForValue(rawValue: number, searchForNote: boolean = false): number {
        if (this._appliedScoreLinesByValue.has(rawValue)) {
            return this._appliedScoreLinesByValue.get(rawValue)!;
        }
        if (searchForNote && this._notesByValue.has(rawValue)) {
            return this.getNoteLine(this._notesByValue.get(rawValue)!);
        }
        return 0;
    }
}
