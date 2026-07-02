import { describe, expect, it } from 'vitest';
import { Beat } from '@coderline/alphatab/model/Beat';
import { Note } from '@coderline/alphatab/model/Note';
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
