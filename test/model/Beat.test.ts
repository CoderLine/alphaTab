import { Note } from '@src/model';
import { Beat } from '@src/model/Beat';

describe('BeatTests', () => {
    it('add-stringed-note', () => {
        const beat = new Beat();
        const note = new Note();
        note.string = 2;
        beat.addNote(note);
        expect(beat.notes.length).toBe(1);
        expect(beat.hasNoteOnString(2)).toBe(true);
        expect(beat.getNoteOnString(2)).toBe(note);
    });

    it('remove-stringed-note', () => {
        const beat = new Beat();
        const note = new Note();
        note.string = 1;
        beat.addNote(note);
        beat.removeNote(note);
        expect(beat.notes.length).toBe(0);
        expect(beat.hasNoteOnString(2)).toBe(false);
        expect(beat.getNoteOnString(2)).toBe(null);
    });
});