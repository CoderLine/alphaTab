import { AccidentalType } from '@src/model/AccidentalType';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Clef } from '@src/model/Clef';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { Staff } from '@src/model/Staff';
import { PercussionMapper } from '@src/rendering/utils/PercussionMapper';
import { ModelUtils } from '@src/model/ModelUtils';

/**
 * This small utilty public class allows the assignment of accidentals within a
 * desired scope.
 */
export class AccidentalHelper {
    private _bar: Bar;

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
    private static OctaveSteps: number[] = [40, 34, 32, 28, 40];

    /**
     * The step offsets of the notes within an octave in case of for sharp keysignatures
     */
    private static SharpNoteSteps: number[] = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

    /**
     * The step offsets of the notes within an octave in case of for flat keysignatures
     */
    private static FlatNoteSteps: number[] = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];

    private _registeredAccidentals: Map<number, boolean> = new Map();
    private _appliedScoreLines: Map<number, number> = new Map();
    private _appliedScoreLinesByValue: Map<number, number> = new Map();
    private _notesByValue: Map<number, Note> = new Map();

    public maxNoteValueBeat: Beat | null = null;
    public minNoteValueBeat: Beat | null = null;
    public maxNoteValue: number = -1;
    public minNoteValue: number = -1;

    public constructor(bar: Bar) {
        this._bar = bar;
    }

    /**
     * Calculates the accidental for the given note and assignes the value to it.
     * The new accidental type is also registered within the current scope
     * @param note
     * @returns
     */
    public applyAccidental(note: Note): AccidentalType {
        let staff: Staff = this._bar.staff;
        let noteValue: number = staff.isPercussion
            ? PercussionMapper.mapNoteForDisplay(note.displayValue)
            : note.displayValue;
        let quarterBend: boolean = note.hasQuarterToneOffset;
        let line: number = this.registerNoteLine(note, noteValue);
        if (this.minNoteValue === -1 || noteValue < this.minNoteValue) {
            this.minNoteValue = noteValue;
            this.minNoteValueBeat = note.beat;
        }
        if (this.maxNoteValue === -1 || noteValue > this.maxNoteValue) {
            this.maxNoteValue = noteValue;
            this.maxNoteValueBeat = note.beat;
        }

        return this.getAccidental(line, noteValue, quarterBend, note.accidentalMode);
    }

    /**
     * Calculates the accidental for the given note value and assignes the value to it.
     * The new accidental type is also registered within the current scope
     * @param relatedBeat
     * @param noteValue
     * @param quarterBend
     * @returns
     */
    public applyAccidentalForValue(relatedBeat: Beat, noteValue: number, quarterBend: boolean): AccidentalType {
        let staff: Staff = this._bar.staff;
        if (staff.isPercussion) {
            noteValue = PercussionMapper.mapNoteForDisplay(noteValue);
        }
        let line: number = this.registerNoteValueLine(noteValue);
        if (this.minNoteValue === -1 || noteValue < this.minNoteValue) {
            this.minNoteValue = noteValue;
            this.minNoteValueBeat = relatedBeat;
        }
        if (this.maxNoteValue === -1 || noteValue > this.maxNoteValue) {
            this.maxNoteValue = noteValue;
            this.maxNoteValueBeat = relatedBeat;
        }
        return this.getAccidental(line, noteValue, quarterBend, NoteAccidentalMode.Default);
    }

    private getAccidental(line: number, noteValue: number, quarterBend: boolean, accidentalMode: NoteAccidentalMode): AccidentalType {
        let accidentalToSet: AccidentalType = AccidentalType.None;
        if (!this._bar.staff.isPercussion) {
            let ks: number = this._bar.masterBar.keySignature;
            let ksi: number = ks + 7;
            let index: number = noteValue % 12;
            // the key signature symbol required according to
            let keySignatureAccidental: AccidentalType = ksi < 7 ? AccidentalType.Flat : AccidentalType.Sharp;
            // determine whether the current note requires an accidental according to the key signature
            let hasNoteAccidentalForKeySignature: boolean = AccidentalHelper.KeySignatureLookup[ksi][index];
            let isAccidentalNote: boolean = AccidentalHelper.AccidentalNotes[index];

            switch (accidentalMode) {
                case NoteAccidentalMode.ForceSharp:
                case NoteAccidentalMode.ForceDoubleSharp:
                case NoteAccidentalMode.ForceFlat:
                case NoteAccidentalMode.ForceDoubleFlat:
                    isAccidentalNote = true;
                    break;
            }

            if (quarterBend) {
                accidentalToSet = isAccidentalNote ? keySignatureAccidental : AccidentalType.Natural;
            } else {
                let isAccidentalRegistered: boolean = this._registeredAccidentals.has(line);
                if (hasNoteAccidentalForKeySignature !== isAccidentalNote && !isAccidentalRegistered) {
                    this._registeredAccidentals.set(line, true);
                    accidentalToSet = isAccidentalNote ? keySignatureAccidental : AccidentalType.Natural;
                } else if (hasNoteAccidentalForKeySignature === isAccidentalNote && isAccidentalRegistered) {
                    this._registeredAccidentals.delete(line);
                    accidentalToSet = isAccidentalNote ? keySignatureAccidental : AccidentalType.Natural;
                }
            }
        }
        // TODO: change accidentalToSet according to note.AccidentalMode
        if (quarterBend) {
            switch (accidentalToSet) {
                case AccidentalType.Natural:
                    return AccidentalType.NaturalQuarterNoteUp;
                case AccidentalType.Sharp:
                    return AccidentalType.SharpQuarterNoteUp;
                case AccidentalType.Flat:
                    return AccidentalType.FlatQuarterNoteUp;
            }
        } else {
            switch (accidentalMode) {
                case NoteAccidentalMode.ForceSharp:
                    return AccidentalType.Sharp;
                case NoteAccidentalMode.ForceDoubleSharp:
                    return AccidentalType.DoubleSharp;
                case NoteAccidentalMode.ForceFlat:
                    return AccidentalType.Flat;
                case NoteAccidentalMode.ForceDoubleFlat:
                    return AccidentalType.DoubleFlat;
            }
        }
        return accidentalToSet;
    }

    private registerNoteLine(n: Note, noteValue: number): number {
        let steps: number = this.calculateNoteLine(noteValue, n.accidentalMode);
        this._appliedScoreLines.set(n.id, steps);
        this._notesByValue.set(noteValue, n);
        return steps;
    }

    private registerNoteValueLine(noteValue: number): number {
        let steps: number = this.calculateNoteLine(noteValue, NoteAccidentalMode.Default);
        this._appliedScoreLinesByValue.set(noteValue, steps);
        return steps;
    }

    private calculateNoteLine(noteValue: number, mode: NoteAccidentalMode): number {
        let value: number = noteValue;
        let ks: number = this._bar.masterBar.keySignature;
        let clef: Clef = this._bar.clef;
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
