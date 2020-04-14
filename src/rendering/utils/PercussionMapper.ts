import { Note } from '@src/model/Note';

export class PercussionMapper {
    private static ElementVariationToMidi: Int32Array[] = [
        new Int32Array([35, 35, 35]),
        new Int32Array([38, 38, 37]),
        new Int32Array([56, 56, 56]),
        new Int32Array([56, 56, 56]),
        new Int32Array([56, 56, 56]),
        new Int32Array([41, 41, 41]),
        new Int32Array([43, 43, 43]),
        new Int32Array([45, 45, 45]),
        new Int32Array([47, 47, 47]),
        new Int32Array([48, 48, 48]),
        new Int32Array([42, 46, 46]),
        new Int32Array([44, 44, 44]),
        new Int32Array([49, 49, 49]),
        new Int32Array([57, 57, 57]),
        new Int32Array([55, 55, 55]),
        new Int32Array([51, 59, 53]),
        new Int32Array([52, 52, 52])
    ];

    public static midiFromElementVariation(note: Note): number {
        return PercussionMapper.ElementVariationToMidi[note.element][note.variation];
    }

    /**
     * Maps the given note to a normal note value to place the note at the
     * correct line on score notation
     * @param value
     * @returns
     */
    public static mapNoteForDisplay(value: number): number {
        if (value === 61 || value === 66 || value === 44) {
            return 62;
        }
        if (value === 60 || value === 65) {
            return 64;
        }
        if (value >= 35 && value <= 36) {
            return 65;
        }
        if (value === 41 || value === 64) {
            return 67;
        }
        if (value === 43 || value === 62) {
            return 69;
        }
        if (value === 45 || value === 63) {
            return 71;
        }
        if (value === 47 || value === 54) {
            return 74;
        }
        if (value === 48 || value === 56) {
            return 76;
        }
        if (value === 50) {
            return 77;
        }
        if (value === 42 || value === 46 || (value >= 49 && value <= 53) || value === 57 || value === 59) {
            return 79;
        }
        return 72;
    }
}
