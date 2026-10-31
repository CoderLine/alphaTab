import { Note } from '@coderline/alphatab/model/Note';
import { Staff } from '@coderline/alphatab/model/Staff';
import { Track } from '@coderline/alphatab/model/Track';
import { Tuning } from '@coderline/alphatab/model/Tuning';
import { TabBarRendererFactory } from '@coderline/alphatab/rendering/TabBarRendererFactory';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

describe('PercussionTablature', () => {
    describe('Note.isPercussion', () => {
        it('returns true when percussionArticulation is set regardless of string', () => {
            const note = new Note();
            note.percussionArticulation = 36;
            note.string = 6;
            note.fret = 36;

            expect(note.isPercussion).toBe(true);
            expect(note.isStringed).toBe(true);
        });

        it('returns true when percussionArticulation is set without string', () => {
            const note = new Note();
            note.percussionArticulation = 38;

            expect(note.isPercussion).toBe(true);
            expect(note.isStringed).toBe(false);
        });

        it('returns false when percussionArticulation is not set', () => {
            const note = new Note();
            note.string = 1;
            note.fret = 5;

            expect(note.isPercussion).toBe(false);
            expect(note.isStringed).toBe(true);
        });
    });

    describe('Staff.finish', () => {
        it('preserves showTablature and tuning for percussion with virtual tuning', () => {
            const staff = new Staff();
            staff.isPercussion = true;
            staff.showTablature = true;
            staff.stringTuning = new Tuning('', [0, 0, 0, 0, 0, 0], false);

            staff.finish(new Settings());

            expect(staff.showTablature).toBe(true);
            expect(staff.tuning.length).toBe(6);
            expect(staff.displayTranspositionPitch).toBe(0);
        });

        it('preserves showTablature for percussion without tuning', () => {
            const staff = new Staff();
            staff.isPercussion = true;
            staff.showTablature = true;
            staff.stringTuning = new Tuning('', [], false);

            staff.finish(new Settings());

            expect(staff.showTablature).toBe(true);
            expect(staff.tuning.length).toBe(6);
        });

        it('resets displayTranspositionPitch for percussion', () => {
            const staff = new Staff();
            staff.isPercussion = true;
            staff.displayTranspositionPitch = 12;
            staff.stringTuning = new Tuning('', [0, 0, 0, 0, 0, 0], false);

            staff.finish(new Settings());

            expect(staff.displayTranspositionPitch).toBe(0);
        });

        it('preserves showTablature for non-percussion with tuning', () => {
            const staff = new Staff();
            staff.isPercussion = false;
            staff.showTablature = true;
            staff.stringTuning = new Tuning('', [64, 59, 55, 50, 45, 40], false);

            staff.finish(new Settings());

            expect(staff.showTablature).toBe(true);
            expect(staff.tuning.length).toBe(6);
        });
    });

    describe('TabBarRendererFactory.canCreate', () => {
        function createStaff(isPercussion: boolean, showTablature: boolean, tuning: number[]): [Track, Staff] {
            const track = new Track();
            const staff = new Staff();
            staff.isPercussion = isPercussion;
            staff.showTablature = showTablature;
            staff.stringTuning = new Tuning('', tuning, false);
            staff.track = track;
            track.staves.push(staff);
            return [track, staff];
        }

        it('allows creation for percussion staff with virtual tuning and showTablature', () => {
            const factory = new TabBarRendererFactory([]);
            const [track, staff] = createStaff(true, true, [0, 0, 0, 0, 0, 0]);

            expect(factory.canCreate(track, staff)).toBe(true);
        });

        it('rejects percussion staff when showTablature is false', () => {
            const factory = new TabBarRendererFactory([]);
            const [track, staff] = createStaff(true, false, [0, 0, 0, 0, 0, 0]);

            expect(factory.canCreate(track, staff)).toBe(false);
        });

        it('rejects percussion staff without tuning', () => {
            const factory = new TabBarRendererFactory([]);
            const [track, staff] = createStaff(true, true, []);

            expect(factory.canCreate(track, staff)).toBe(false);
        });

        it('allows creation for regular guitar staff', () => {
            const factory = new TabBarRendererFactory([]);
            const [track, staff] = createStaff(false, true, [64, 59, 55, 50, 45, 40]);

            expect(factory.canCreate(track, staff)).toBe(true);
        });
    });
});
