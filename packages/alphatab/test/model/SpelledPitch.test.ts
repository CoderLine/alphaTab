import { describe, expect, it } from 'vitest';
import { SpelledPitch } from '@coderline/alphatab/model/SpelledPitch';

describe('SpelledPitchTests', () => {
    describe('value', () => {
        it('natural', () => expect(new SpelledPitch(0, 0, 4).value).toBe(60));
        it('sharp', () => expect(new SpelledPitch(3, 1, 3).value).toBe(54));
        it('flat', () => expect(new SpelledPitch(4, -1, 3).value).toBe(54));
        it('sharp-above-b', () => expect(new SpelledPitch(6, 1, 3).value).toBe(60));
        it('double-sharp-above-b', () => expect(new SpelledPitch(6, 2, 3).value).toBe(61));
        it('flat-below-c', () => expect(new SpelledPitch(0, -1, 4).value).toBe(59));
        it('double-flat-below-c', () => expect(new SpelledPitch(0, -2, 4).value).toBe(58));
        it('lowest-octave', () => expect(new SpelledPitch(0, 0, -1).value).toBe(0));
    });

    describe('chroma', () => {
        it('natural', () => expect(new SpelledPitch(2, 0, 4).chroma).toBe(4));
        it('sharp-above-b', () => expect(new SpelledPitch(6, 1, 3).chroma).toBe(0));
        it('flat-below-c', () => expect(new SpelledPitch(0, -1, 4).chroma).toBe(11));
        it('double-flat-below-c', () => expect(new SpelledPitch(0, -2, 4).chroma).toBe(10));
    });

    describe('text', () => {
        it('natural', () => expect(new SpelledPitch(2, 0, 4).toString()).toBe('E4'));
        it('sharp', () => expect(new SpelledPitch(3, 1, 3).toString()).toBe('F#3'));
        it('flat', () => expect(new SpelledPitch(4, -1, 3).toString()).toBe('Gb3'));
        it('double-sharp', () => expect(new SpelledPitch(0, 2, 4).toString()).toBe('C##4'));
        it('double-flat', () => expect(new SpelledPitch(6, -2, 2).toString()).toBe('Bbb2'));
        it('name-without-octave', () => expect(new SpelledPitch(4, -1, 3).toNameString()).toBe('Gb'));
    });

    describe('fromValue', () => {
        function test(value: number, preferFlat: boolean, step: number, alter: number, octave: number) {
            const pitch = SpelledPitch.fromValue(value, preferFlat);
            expect(pitch.step).toBe(step);
            expect(pitch.alter).toBe(alter);
            expect(pitch.octave).toBe(octave);
        }

        it('natural-flat', () => test(64, true, 2, 0, 4));
        it('natural-sharp', () => test(64, false, 2, 0, 4));
        it('black-key-flat', () => test(63, true, 2, -1, 4));
        it('black-key-sharp', () => test(63, false, 1, 1, 4));
        it('c', () => test(60, true, 0, 0, 4));
        it('b', () => test(59, false, 6, 0, 3));
        it('fractional-truncates', () => test(63.5, true, 2, -1, 4));
        it('negative', () => test(-1, true, 6, 0, -2));
    });

    describe('formatValue', () => {
        it('matches fromValue', () => {
            for (let v = 0; v < 128; v++) {
                for (const preferFlat of [true, false]) {
                    expect(SpelledPitch.formatValue(v, true, preferFlat)).toBe(
                        SpelledPitch.fromValue(v, preferFlat).toString()
                    );
                    expect(SpelledPitch.formatValue(v, false, preferFlat)).toBe(
                        SpelledPitch.fromValue(v, preferFlat).toNameString()
                    );
                }
            }
        });

        it('value round trip', () => {
            for (let v = 0; v < 128; v++) {
                expect(SpelledPitch.fromValue(v, true).value).toBe(v);
                expect(SpelledPitch.fromValue(v, false).value).toBe(v);
            }
        });
    });

    describe('json', () => {
        it('writes-name', () => expect(SpelledPitch.toJson(new SpelledPitch(4, -1, 3))).toBe('Gb3'));
        it('reads-name', () => expect(SpelledPitch.fromJson('F#3')!.toString()).toBe('F#3'));
        it('reads-double-accidentals', () => {
            expect(SpelledPitch.fromJson('C##4')!.toString()).toBe('C##4');
            expect(SpelledPitch.fromJson('Bbb2')!.toString()).toBe('Bbb2');
        });
        it('reads-negative-octave', () => expect(SpelledPitch.fromJson('C-1')!.value).toBe(0));
        it('reads-value-as-flat', () => expect(SpelledPitch.fromJson(63)!.toString()).toBe('Eb4'));
        it('reads-null', () => expect(SpelledPitch.fromJson(null)).toBeNull());
        it('round-trips-all-spellings', () => {
            for (let step = 0; step < 7; step++) {
                for (let alter = -2; alter <= 2; alter++) {
                    const pitch = new SpelledPitch(step, alter, 3);
                    const read = SpelledPitch.fromJson(SpelledPitch.toJson(pitch))!;
                    expect(read.step).toBe(step);
                    expect(read.alter).toBe(alter);
                    expect(read.octave).toBe(3);
                }
            }
        });
        it('rejects-invalid', () => {
            for (const invalid of ['', 'H4', 'C', 'C#', 'C###4', 'Cb#4', 'C4x', '4']) {
                expect(() => SpelledPitch.fromJson(invalid), invalid).toThrow();
            }
        });
    });

    describe('display', () => {
        it('symbols', () => {
            expect(new SpelledPitch(3, 1, 3).toDisplayNameString()).toBe('F\u266F');
            expect(new SpelledPitch(4, -1, 3).toDisplayNameString()).toBe('G\u266D');
            expect(new SpelledPitch(0, 2, 3).toDisplayNameString()).toBe('C\uD834\uDD2A');
            expect(new SpelledPitch(6, -2, 3).toDisplayNameString()).toBe('B\uD834\uDD2B');
            expect(new SpelledPitch(2, 0, 3).toDisplayNameString()).toBe('E');
        });
    });
});
