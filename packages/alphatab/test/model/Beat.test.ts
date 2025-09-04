import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { expect } from 'chai';

describe('BeatTests', () => {
    it('add-stringed-note', () => {
        const beat = new Beat();
        const note = new Note();
        note.string = 2;
        beat.addNote(note);
        expect(beat.notes.length).to.be.equal(1);
        expect(beat.hasNoteOnString(2)).to.be.equal(true);
        expect(beat.getNoteOnString(2)).to.be.equal(note);
    });

    it('remove-stringed-note', () => {
        const beat = new Beat();
        const note = new Note();
        note.string = 1;
        beat.addNote(note);
        beat.removeNote(note);
        expect(beat.notes.length).to.be.equal(0);
        expect(beat.hasNoteOnString(2)).to.be.equal(false);
        expect(beat.getNoteOnString(2)).to.be.equal(null);
    });
});
