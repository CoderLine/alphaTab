import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { Beat } from '@coderline/alphatab/model/Beat';
import { Voice } from '@coderline/alphatab/model/Voice';
import { ComparisonHelpers } from 'test/model/ComparisonHelpers';
import { describe, expect, it } from 'vitest';

describe('ComparisonHelpersTests', () => {
    it('number-on-one-side-only', () => {
        const stringValue: number = 6;
        const fretValue: number = 3;
        const expected = new Map<string, unknown>();
        expected.set('string', stringValue);
        expected.set('fret', fretValue);
        const actual = new Map<string, unknown>();
        actual.set('string', stringValue);

        expect(() => ComparisonHelpers.expectJsonEqual(expected, actual, '<note>', null)).toThrow();
        expect(() => ComparisonHelpers.expectJsonEqual(actual, expected, '<note>', null)).toThrow();
    });

    it('nan-against-number', () => {
        const nan: number = Number.NaN;
        const one: number = 1;
        expect(() => ComparisonHelpers.expectJsonEqual(nan, one, '<value>', null)).toThrow();
        expect(() => ComparisonHelpers.expectJsonEqual(one, nan, '<value>', null)).toThrow();
        ComparisonHelpers.expectJsonEqual(nan, nan, '<value>', null);
        ComparisonHelpers.expectJsonEqual(one, one, '<value>', null);
    });

    it('alphatex-roundtrip-ignores-empty-voices-of-expected', () => {
        const tex = '\\track "Guitar" 0.6.4 1.6.4 2.6.4 3.6.4 | 0.5.4 1.5.4 2.5.4 3.5.4';
        const expected = ScoreLoader.loadAlphaTex(tex);
        for (const bar of expected.tracks[0].staves[0].bars) {
            const voice = new Voice();
            const beat = new Beat();
            beat.isEmpty = true;
            voice.addBeat(beat);
            bar.addVoice(voice);
        }
        const actual = ScoreLoader.loadAlphaTex(tex);

        ComparisonHelpers.alphaTexExportRoundtripEqual('empty-voices', actual, expected);
        expect(expected.tracks[0].staves[0].bars[0].voices.length).toBe(1);
    });
});
