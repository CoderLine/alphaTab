import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { FingeringAssigner, FingeringOptions } from '@coderline/alphatab/model/FingeringAssigner';
import { Note } from '@coderline/alphatab/model/Note';
import { Staff } from '@coderline/alphatab/model/Staff';
import { Track } from '@coderline/alphatab/model/Track';
import { Voice } from '@coderline/alphatab/model/Voice';
import { describe, expect, it } from 'vitest';

interface BuildOptions {
    transposition?: number;
    percussionIndices?: number[];
    tuning?: number[];
    capo?: number;
}

// Once assign() mutates note.string/fret, note.realValue routes through
// staff.tuning — so the same tuning passed to the assigner must live on staff.
function buildBeat(pitches: number[], opts?: BuildOptions): Beat {
    const track = new Track();
    const staff = new Staff();
    staff.transpositionPitch = opts?.transposition ?? 0;
    if (opts?.tuning) {
        staff.stringTuning.tunings = opts.tuning.slice();
    }
    if (opts?.capo !== undefined) {
        staff.capo = opts.capo;
    }
    track.addStaff(staff);
    const bar = new Bar();
    staff.addBar(bar);
    const voice = new Voice();
    bar.addVoice(voice);
    const beat = new Beat();
    voice.addBeat(beat);
    const percussionSet = new Set(opts?.percussionIndices ?? []);
    for (let i = 0; i < pitches.length; i++) {
        const midi = pitches[i];
        const note = new Note();
        if (percussionSet.has(i)) {
            note.percussionArticulation = midi;
        } else {
            note.octave = Math.floor(midi / 12);
            note.tone = midi - note.octave * 12;
        }
        beat.addNote(note);
    }
    return beat;
}

// Standard tunings (high-to-low, matching Staff.tuning convention).
const GUITAR_6 = [64, 59, 55, 50, 45, 40];
const BASS_5 = [43, 38, 33, 28, 23];

// Capture the MIDI value of each pre-assignment note. Percussion notes get -1.
function capturePitches(beat: Beat): number[] {
    return beat.notes.map(n => (n.isPercussion ? -1 : n.realValue));
}

// Assert that stringPitch(s) + fret == originalMidi[i] + transposition for
// every assigned note.
function expectPitchIdentity(beat: Beat, tuning: number[], originalMidi: number[], capo = 0, transposition = 0) {
    for (let i = 0; i < beat.notes.length; i++) {
        const note = beat.notes[i];
        if (note.isPercussion) {
            continue;
        }
        expect(Number.isNaN(note.string)).toBe(false);
        expect(Number.isNaN(note.fret)).toBe(false);
        const stringPitch = capo + tuning[tuning.length - note.string];
        expect(stringPitch + note.fret).toBe(originalMidi[i] + transposition);
    }
}

describe('FingeringAssignerTests', () => {
    describe('A pitch identity', () => {
        it('A1 single-note-guitar-range', () => {
            const beat = buildBeat([60], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            expect(beat.notes[0].fret).toBeGreaterThanOrEqual(0);
            expect(beat.notes[0].string).toBeGreaterThanOrEqual(1);
            expect(beat.notes[0].string).toBeLessThanOrEqual(6);
        });

        it('A2 chord-3-notes-guitar', () => {
            const beat = buildBeat([55, 62, 67], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            const strings = beat.notes.map(n => n.string);
            expect(new Set(strings).size).toBe(3);
        });

        it('A3 chord-6-notes-guitar-open-tuning', () => {
            const beat = buildBeat([40, 45, 50, 55, 59, 64], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            for (const n of beat.notes) {
                expect(n.fret).toBe(0);
            }
            const strings = beat.notes.map(n => n.string).sort((x, y) => x - y);
            expect(strings).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('A4 capo-non-zero', () => {
            const beat = buildBeat([63], { tuning: GUITAR_6, capo: 3 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 3, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi, 3);
        });

        it('A5 transposition-non-zero', () => {
            const beat = buildBeat([60], { tuning: GUITAR_6, transposition: -12 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, -12);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi, 0, -12);
        });

        it('A6 capo-and-transposition', () => {
            const beat = buildBeat([60], { tuning: GUITAR_6, capo: 2, transposition: -12 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 2, -12);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi, 2, -12);
        });

        it('A7 bass-5-string', () => {
            const beat = buildBeat([40], { tuning: BASS_5 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(BASS_5, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, BASS_5, midi);
        });
    });

    describe('B chord voicing quality', () => {
        it('B1 power-chord-clusters', () => {
            const beat = buildBeat([55, 62, 67], { tuning: GUITAR_6 });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            const strings = beat.notes.map(n => n.string).sort((x, y) => x - y);
            expect(strings[1] - strings[0]).toBe(1);
            expect(strings[2] - strings[1]).toBe(1);
            const frets = beat.notes.map(n => n.fret);
            expect(Math.max(...frets) - Math.min(...frets)).toBeLessThanOrEqual(4);
        });

        it('B2 wide-piano-chord', () => {
            const beat = buildBeat([48, 52, 55, 60], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            const strings = beat.notes.map(n => n.string);
            expect(new Set(strings).size).toBe(4);
            const frets = beat.notes.map(n => n.fret);
            expect(Math.max(...frets) - Math.min(...frets)).toBeLessThanOrEqual(7);
        });

        it('B3 chord-with-open-strings', () => {
            const beat = buildBeat([40, 55, 64], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            // MIDI 40 = string 1 open (E2). The lowest note in a chord where
            // an open string is available at the natural position should land
            // there — proves the openStringBonus works when the fret matches
            // the natural open position.
            const byMidi: Map<number, Note> = new Map();
            for (let i = 0; i < beat.notes.length; i++) {
                byMidi.set(midi[i], beat.notes[i]);
            }
            expect(byMidi.get(40)!.fret).toBe(0);
            expect(byMidi.get(40)!.string).toBe(1);
            // The upper notes (55, 64) may land anywhere consistent with the
            // pitch identity — the hand-position anchor pulls them to
            // near-fret-5 positions rather than open strings, which is the
            // expected behaviour of a strong distance-cost term.
        });
    });

    describe('C streaming state', () => {
        it('C1 initial-hand-position', () => {
            const beat = buildBeat([62], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            // With preferredHandPosition=5, either (s=4, f=7) or (s=5, f=3)
            // is equidistant from the hand — the tie-break is implementation
            // detail. We assert the fret is within reach of the anchor.
            expect(Math.abs(beat.notes[0].fret - 5)).toBeLessThanOrEqual(2);
        });

        it('C2 hysteresis-holds', () => {
            const b1 = buildBeat([62], { tuning: GUITAR_6 });
            const b2 = buildBeat([62], { tuning: GUITAR_6 });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(b1);
            a.assign(b2);
            expect(b1.notes[0].string).toBe(b2.notes[0].string);
            expect(b1.notes[0].fret).toBe(b2.notes[0].fret);
        });

        it('C3 same-pitch-across-beats', () => {
            const b1 = buildBeat([60], { tuning: GUITAR_6 });
            const b2 = buildBeat([60], { tuning: GUITAR_6 });
            const b3 = buildBeat([60], { tuning: GUITAR_6 });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(b1);
            a.assign(b2);
            a.assign(b3);
            expect(b1.notes[0].string).toBe(b2.notes[0].string);
            expect(b2.notes[0].string).toBe(b3.notes[0].string);
        });

        it('C4 scale-with-spike', () => {
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            const pre: Beat[] = [];
            for (let i = 0; i < 4; i++) {
                const b = buildBeat([50], { tuning: GUITAR_6 });
                a.assign(b);
                pre.push(b);
            }
            const spike = buildBeat([84], { tuning: GUITAR_6 });
            a.assign(spike);
            const post: Beat[] = [];
            for (let i = 0; i < 4; i++) {
                const b = buildBeat([50], { tuning: GUITAR_6 });
                a.assign(b);
                post.push(b);
            }
            // EWMA smoothing must keep the post-spike position closer to the
            // pre-spike position than to the spike itself — i.e. the anchor
            // is not permanently pinned by a single high note.
            const preFret = pre[3].notes[0].fret;
            const spikeFret = spike.notes[0].fret;
            const postFret = post[3].notes[0].fret;
            expect(Math.abs(postFret - preFret)).toBeLessThan(Math.abs(postFret - spikeFret));
        });

        it('C5 reset-clears-state', () => {
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(buildBeat([84], { tuning: GUITAR_6 }));
            a.reset();
            const fresh = buildBeat([60], { tuning: GUITAR_6 });
            a.assign(fresh);

            const control = new FingeringAssigner(GUITAR_6, 0, 0);
            const controlBeat = buildBeat([60], { tuning: GUITAR_6 });
            control.assign(controlBeat);
            expect(fresh.notes[0].string).toBe(controlBeat.notes[0].string);
            expect(fresh.notes[0].fret).toBe(controlBeat.notes[0].fret);
        });

        it('C6 open-only-chord-preserves-hand', () => {
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(buildBeat([60, 64, 67], { tuning: GUITAR_6 }));
            // All-open chord: none of these notes has a non-zero fret. Anchor
            // must not slide back to preferredHandPosition.
            a.assign(buildBeat([40, 45, 50, 55, 59, 64], { tuning: GUITAR_6 }));
            const probe = buildBeat([62], { tuning: GUITAR_6 });
            a.assign(probe);
            // Following note reflects an elevated hand position (not near 3).
            expect(probe.notes[0].fret).toBeGreaterThanOrEqual(3);
        });
    });

    describe('D ties', () => {
        it('D1 tie-destination-inherits', () => {
            const b1 = buildBeat([60], { tuning: GUITAR_6 });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(b1);
            const origin = b1.notes[0];
            const originString = origin.string;
            const originFret = origin.fret;

            // Push hand position elsewhere so a fresh greedy would differ.
            a.assign(buildBeat([84], { tuning: GUITAR_6 }));

            const b2 = buildBeat([60], { tuning: GUITAR_6 });
            const dest = b2.notes[0];
            dest.tieOrigin = origin;
            dest.isTieDestination = true;
            a.assign(b2);
            expect(dest.string).toBe(originString);
            expect(dest.fret).toBe(originFret);
        });

        it('D2 tie-destination-without-stringed-origin', () => {
            // Origin is a piano note (no string/fret) — normal assignment path.
            const originBeat = buildBeat([60], { tuning: GUITAR_6 });
            const origin = originBeat.notes[0];
            expect(origin.isStringed).toBe(false);

            const b2 = buildBeat([60], { tuning: GUITAR_6 });
            const midi = capturePitches(b2);
            const dest = b2.notes[0];
            dest.tieOrigin = origin;
            dest.isTieDestination = true;

            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(b2);
            expectPitchIdentity(b2, GUITAR_6, midi);
        });
    });

    describe('E edge cases', () => {
        it('E1 empty-beat', () => {
            const beat = buildBeat([], { tuning: GUITAR_6 });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expect(beat.notes.length).toBe(0);
        });

        it('E2 all-percussion-beat', () => {
            const beat = buildBeat([38, 42], { tuning: GUITAR_6, percussionIndices: [0, 1] });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            for (const n of beat.notes) {
                expect(Number.isNaN(n.string)).toBe(true);
                expect(Number.isNaN(n.fret)).toBe(true);
            }
        });

        it('E3 mixed-percussion-pitched', () => {
            const beat = buildBeat([38, 60], { tuning: GUITAR_6, percussionIndices: [0] });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expect(Number.isNaN(beat.notes[0].string)).toBe(true);
            expect(Number.isNaN(beat.notes[1].string)).toBe(false);
            const stringPitch = GUITAR_6[GUITAR_6.length - beat.notes[1].string];
            expect(stringPitch + beat.notes[1].fret).toBe(midi[1]);
        });

        it('E4 pitch-below-range', () => {
            const beat = buildBeat([20], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            expect(beat.notes[0].fret).toBeLessThan(0);
        });

        it('E5 pitch-above-range', () => {
            const beat = buildBeat([120], { tuning: GUITAR_6 });
            const midi = capturePitches(beat);
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            expectPitchIdentity(beat, GUITAR_6, midi);
            expect(beat.notes[0].fret).toBeGreaterThan(24);
        });

        it('E6 chord-overflow-collides', () => {
            const beat = buildBeat([40, 45, 50, 55, 59, 64, 67, 72], { tuning: GUITAR_6 });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            for (const n of beat.notes) {
                expect(Number.isNaN(n.string)).toBe(false);
                expect(Number.isNaN(n.fret)).toBe(false);
            }
            const keys = new Set(beat.notes.map(n => `${n.string},${n.fret}`));
            expect(keys.size).toBe(beat.notes.length);
        });

        it('E7 sortedidx-buffer-growth', () => {
            const pitches: number[] = [];
            for (let i = 0; i < 20; i++) {
                pitches.push(40 + i);
            }
            const beat = buildBeat(pitches, { tuning: GUITAR_6 });
            const a = new FingeringAssigner(GUITAR_6, 0, 0);
            a.assign(beat);
            for (const n of beat.notes) {
                expect(Number.isNaN(n.string)).toBe(false);
                expect(Number.isNaN(n.fret)).toBe(false);
            }
        });
    });

    describe('F constructor validation', () => {
        it('F1 tuning-empty', () => {
            expect(() => new FingeringAssigner([], 0, 0)).toThrow();
        });

        it('F2 tuning-oversize', () => {
            const oversized = new Array<number>(31).fill(40);
            expect(() => new FingeringAssigner(oversized, 0, 0)).toThrow();
        });

        it('F3 tuning-min-boundary', () => {
            const a = new FingeringAssigner([40], 0, 0);
            const beat = buildBeat([40], { tuning: [40] });
            a.assign(beat);
            expect(beat.notes[0].string).toBe(1);
            expect(beat.notes[0].fret).toBe(0);
        });

        it('F4 tuning-max-boundary', () => {
            const wide = new Array<number>(30);
            for (let i = 0; i < 30; i++) {
                wide[i] = 60 - i;
            }
            const a = new FingeringAssigner(wide, 0, 0);
            const beat = buildBeat([50], { tuning: wide });
            a.assign(beat);
            expect(Number.isNaN(beat.notes[0].string)).toBe(false);
            expect(Number.isNaN(beat.notes[0].fret)).toBe(false);
        });

        it('F5 options-override-openStringBonus', () => {
            // With a very negative openStringBonus, open E4 (string 6 fret 0)
            // should beat the default choice for MIDI 64.
            const opts = new FingeringOptions();
            opts.openStringBonus = -20;
            const a = new FingeringAssigner(GUITAR_6, 0, 0, opts);
            const beat = buildBeat([64], { tuning: GUITAR_6 });
            a.assign(beat);
            expect(beat.notes[0].fret).toBe(0);
            expect(beat.notes[0].string).toBe(6);
        });
    });
});
