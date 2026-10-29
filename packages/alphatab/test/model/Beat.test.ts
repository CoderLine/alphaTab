import { describe, expect, it } from 'vitest';
import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { Note } from '@coderline/alphatab/model/Note';
import { Score } from '@coderline/alphatab/model/Score';
import { Track } from '@coderline/alphatab/model/Track';
import { Tuning } from '@coderline/alphatab/model/Tuning';
import { Voice } from '@coderline/alphatab/model/Voice';
import { Settings } from '@coderline/alphatab/Settings';
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

    it('songbook-bend-shows-dynamics-once', () => {
        const score = new Score();
        score.addMasterBar(new MasterBar());
        const track = new Track();
        track.ensureStaveCount(1);
        track.staves[0].stringTuning = Tuning.getDefaultTuningFor(6)!;
        score.addTrack(track);
        const bar = new Bar();
        track.staves[0].addBar(bar);
        const voice = new Voice();
        bar.addVoice(voice);
        const beat = new Beat();
        beat.showDynamics = true;
        voice.addBeat(beat);
        const note = new Note();
        note.string = 3;
        note.fret = 5;
        note.addBendPoint(new BendPoint(0, 0));
        note.addBendPoint(new BendPoint(BendPoint.MaxPosition, 4));
        beat.addNote(note);

        const settings = new Settings();
        settings.setSongBookModeSettings();
        score.finish(settings);

        expect(voice.beats.map(b => b.graceType)).toEqual([GraceType.BendGrace, GraceType.None]);
        expect(voice.beats.map(b => b.showDynamics)).toEqual([true, false]);
    });
});
