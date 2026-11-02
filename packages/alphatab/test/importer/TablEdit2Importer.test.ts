import { FormatError } from '@coderline/alphatab/FormatError';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { TablEditImporter } from '@coderline/alphatab/importer/TablEditImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { AutomationType } from '@coderline/alphatab/model/Automation';
import { type Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { Clef } from '@coderline/alphatab/model/Clef';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { Duration } from '@coderline/alphatab/model/Duration';
import { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import type { Score } from '@coderline/alphatab/model/Score';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { Settings } from '@coderline/alphatab/Settings';
import { ComparisonHelpers } from 'test/model/ComparisonHelpers';
import { TestPlatform } from 'test/TestPlatform';
import { describe, expect, it } from 'vitest';

/**
 * The files in test-data/tabledit/v2 are TablEdit 2 files (format 3) written byte by byte for these tests
 * (6-string guitar in standard tuning unless noted). Each `<name>.v3.tef` is the same file opened in
 * TablEdit 3.06 and saved again, so the TablEdit 2 import must equal the import of TablEdit's conversion.
 * String rows count from the highest string of the first instrument, the model counts strings from the lowest.
 */
describe('TablEdit2ImporterTest', () => {
    const formatOffset = 205;

    function loadData(name: string): Promise<Uint8Array> {
        return TestPlatform.loadFile(`test-data/tabledit/v2/${name}.tef`);
    }

    function readBytes(data: Uint8Array): Score {
        const importer = new TablEditImporter();
        importer.init(ByteBuffer.fromBuffer(data), new Settings());
        return importer.readScore();
    }

    async function load(name: string): Promise<Score> {
        const score = ScoreLoader.loadScoreFromBytes(await loadData(name), new Settings());
        expectBarsFilled(score);
        return score;
    }

    function expectBarsFilled(score: Score) {
        for (const track of score.tracks) {
            for (const bar of track.staves[0].bars) {
                for (const voice of bar.voices) {
                    if (voice.isEmpty) {
                        continue;
                    }
                    let duration = 0;
                    for (const b of voice.beats) {
                        duration += b.playbackDuration;
                    }
                    expect(duration, `bar ${bar.index} voice ${voice.index}`).toBe(bar.masterBar.calculateDuration());
                }
            }
        }
    }

    function beats(score: Score, bar: number, voice: number = 0, track: number = 0): Beat[] {
        return score.tracks[track].staves[0].bars[bar].voices[voice].beats;
    }

    function noteNames(beat: Beat): string[] {
        return beat.notes.map(n => `${n.fret}.${n.string}`).sort();
    }

    describe('format', () => {
        it('loads-format-2', async () => {
            const score = await load('notes');
            expect(score.masterBars.length).toBe(4);
            expect(score.tracks.length).toBe(1);
        });

        it('formats-3-to-9', async () => {
            const expected = JsonConverter.scoreToJsObject(readBytes(await loadData('markers')));
            for (let format = 4; format <= 9; format++) {
                const data = await loadData('markers');
                data[formatOffset] = format;
                ComparisonHelpers.expectJsonEqual(
                    expected,
                    JsonConverter.scoreToJsObject(readBytes(data)),
                    `<format ${format}>`,
                    null
                );
            }
        });

        it('rejects-older-formats', async () => {
            for (const format of [1, 2]) {
                const data = await loadData('notes');
                data[formatOffset] = format;
                expect(() => readBytes(data), `format ${format}`).toThrow(FormatError);
            }
        });

        it('truncated', async () => {
            const data = await loadData('markers');
            for (const length of [300, data.length - 40, data.length - 1]) {
                expect(() => readBytes(data.slice(0, length)), `${length} bytes`).toThrow(FormatError);
            }
        });

        it('string-count-mismatch', async () => {
            const data = await loadData('notes');
            data[240] = 7;
            expect(() => readBytes(data)).toThrow(FormatError);
        });

        it('skips-patterns', async () => {
            const plain = await loadData('notes');
            const expected = JsonConverter.scoreToJsObject(readBytes(plain));
            // notes.tef has neither texts nor chords, so both pattern blocks follow the reading list
            const patternsAt = 256 + 2 + (plain[256] | (plain[257] << 8)) * 6 + 2;
            const patternBlock = 108 + 4;
            const data = new Uint8Array(plain.length + 2 * patternBlock);
            data.set(plain.subarray(0, patternsAt), 0);
            data.set(plain.subarray(patternsAt, plain.length), patternsAt + 2 * patternBlock);
            data[234] = 1;
            data[235] = 1;
            ComparisonHelpers.expectJsonEqual(
                expected,
                JsonConverter.scoreToJsObject(readBytes(data)),
                '<patterns>',
                null
            );
        });

        it('protected', async () => {
            const data = await loadData('notes');
            // security code (u16 at 208), non-zero when TablEdit 2 protects the file
            data[208] = 0x68;
            data[209] = 0x16;
            expect(() => readBytes(data)).toThrow(FormatError);
        });

        it('longest-measure', async () => {
            const data = await loadData('notes');
            data[202] = 0;
            data[203] = 1;
            data[204] = 64;
            expect(() => readBytes(data)).toThrow(FormatError);
        });
    });

    describe('content', () => {
        it('notes', async () => {
            const score = await load('notes');
            expect(score.title).toBe('Notes café');
            expect(score.subTitle).toBe('alphaTab');
            expect(score.instructions).toBe('Synthetic TablEdit 2 file');
            expect(score.notices).toBe('Notes text');
            expect(score.tempo).toBe(100);
            // TablEdit 3 keeps a TablEdit 2 name as it is, an abbreviation needs its own place in the record
            expect(score.tracks[0].name).toBe('Guitar^Gt.');
            expect(score.tracks[0].shortName).toBe('Guitar^Gt.');

            const bar0 = beats(score, 0);
            expect(bar0.map(b => noteNames(b))).toEqual([['3.1'], ['2.2'], ['0.3'], ['1.4', '1.5']]);
            expect(bar0.every(b => b.duration === Duration.Quarter)).toBe(true);

            const bar1 = beats(score, 1);
            expect(bar1.map(b => (b.isRest ? 'r' : noteNames(b).join(' ')))).toEqual([
                '0.6',
                '1.5',
                '2.4',
                '3.3',
                'r',
                '5.4',
                '7.4'
            ]);
            expect(bar1.map(b => b.duration)).toEqual([
                Duration.Eighth,
                Duration.Eighth,
                Duration.Eighth,
                Duration.Eighth,
                Duration.Quarter,
                Duration.Eighth,
                Duration.Sixteenth
            ]);
            expect(bar1[5].dots).toBe(1);

            const bar2 = beats(score, 2);
            expect(bar2.map(b => b.duration)).toEqual([Duration.Half, Duration.Half]);
            expect(bar2[0].dynamics).toBe(DynamicValue.P);
            expect(bar2[1].notes[0].isTieDestination).toBe(true);
            expect(bar2[1].notes[0].tieOrigin).toBe(bar2[0].notes[0]);

            const bar3 = beats(score, 3);
            expect(bar3.map(b => noteNames(b))).toEqual([['0.4'], ['2.4'], ['4.4'], ['2.3'], ['0.1']]);
            expect(bar3.slice(0, 3).every(b => b.tupletNumerator === 3 && b.tupletDenominator === 2)).toBe(true);
            expect(bar3.map(b => b.dynamics)).toEqual([
                DynamicValue.FFF,
                DynamicValue.FFF,
                DynamicValue.FFF,
                DynamicValue.F,
                DynamicValue.PP
            ]);
        });

        it('effects', async () => {
            const score = await load('effects');
            const bar0 = beats(score, 0, 1);
            expect(bar0[0].notes[0].isHammerPullOrigin).toBe(true);
            expect(bar0[2].notes[0].isPalmMute).toBe(true);
            const chord = bar0[3].notes.sort((a, b) => a.string - b.string);
            expect(chord[0].isDead).toBe(true);
            expect(chord[1].vibrato).toBe(VibratoType.Slight);

            const bar1 = beats(score, 1, 1);
            expect(bar1.map(b => b.graceType)).toEqual([
                GraceType.OnBeat,
                GraceType.None,
                GraceType.OnBeat,
                GraceType.None,
                GraceType.None,
                GraceType.None
            ]);
            expect(bar1.map(b => noteNames(b).join(' '))).toEqual(['5.5', '7.5', '3.5', '5.5', '5.4', '2.3']);
            expect(bar1[0].notes[0].isHammerPullOrigin).toBe(true);
            expect(bar1[2].notes[0].slideOutType).toBe(SlideOutType.Legato);
            expect(bar1[4].notes[0].leftHandFinger).toBe(Fingers.IndexFinger);
            expect(bar1[5].pickStroke).toBe(PickStroke.Down);

            const middle = beats(score, 2, 1);
            expect(middle[0].ottava).toBe(Ottavia._8vb);
            expect(middle[1].notes[0].bendPoints!.map(p => [p.offset, p.value])).toEqual([
                [0, 4],
                [60, 4]
            ]);
            expect(noteNames(beats(score, 2, 0)[1])).toEqual(['1.5']);
            expect(beats(score, 2, 2).map(b => (b.isRest ? 'r' : noteNames(b).join(' ')))).toEqual(['r', '0.1', '3.1']);
        });

        it('markers', async () => {
            const score = await load('markers');
            const staff = score.tracks[0].staves[0];
            expect(staff.bars.every(b => b.keySignature === KeySignature.G)).toBe(true);

            const bar0 = beats(score, 0);
            expect(staff.chords!.get(bar0[0].chordId!)!.name).toBe('C');
            expect(staff.chords!.get(bar0[0].chordId!)!.strings).toEqual([0, 1, 0, 2, 3, -1]);
            expect(bar0[0].text).toBe('Intro');
            expect(score.masterBars[0].tempoAutomations.map(a => [a.ratioPosition, a.value])).toEqual([
                [0, 120],
                [0.25, 80]
            ]);
            expect(bar0[2].notes[0].accentuated).toBe(AccentuationType.Normal);
            expect(bar0[3].fermata).not.toBe(null);

            const bar1 = beats(score, 1);
            expect(bar1[0].notes[0].slurDestination).toBe(bar1[1].notes[0]);
            expect(bar1.map(b => b.crescendo)).toEqual([
                CrescendoType.None,
                CrescendoType.None,
                CrescendoType.Crescendo,
                CrescendoType.Crescendo,
                CrescendoType.Decrescendo,
                CrescendoType.Decrescendo,
                CrescendoType.None,
                CrescendoType.None
            ]);
            expect(score.masterBars[1].isDoubleBar).toBe(true);
            expect(Array.from(score.tracks[0].lineBreaks!)).toEqual([2]);

            expect(score.masterBars.map(m => m.tripletFeel)).toEqual([
                TripletFeel.NoTripletFeel,
                TripletFeel.NoTripletFeel,
                TripletFeel.Triplet8th,
                TripletFeel.Triplet8th
            ]);
            const bar2 = beats(score, 2);
            expect(staff.chords!.get(bar2[0].chordId!)!.name).toBe('G');
            expect(bar2[2].text).toBe('Fine');

            const patch = beats(score, 3)[0].automations.find(a => a.type === AutomationType.Instrument);
            expect(patch!.value).toBe(24);

            expect(score.masterBars.map(m => m.isRepeatStart)).toEqual([true, false, false, false]);
            expect(score.masterBars.map(m => m.repeatCount)).toEqual([0, 2, 0, 0]);
            expect(score.masterBars[0].section!.text).toBe('Start');
        });

        it('measures', async () => {
            const score = await load('measures');
            expect(score.masterBars.map(m => `${m.timeSignatureNumerator}/${m.timeSignatureDenominator}`)).toEqual([
                '4/4',
                '3/4',
                '6/8',
                '2/4',
                '4/4'
            ]);
            const bars = score.tracks[0].staves[0].bars;
            // keys beyond 7 sharps wrap around the circle of fifths
            expect(bars.map(b => b.keySignature)).toEqual([2, 2, -2, -1, -1]);
            expect(bars.every(b => b.keySignatureType === KeySignatureType.Major)).toBe(true);
            expect(beats(score, 1).map(b => noteNames(b))).toEqual([['2.4'], ['4.4'], ['0.4']]);
            expect(beats(score, 2).map(b => noteNames(b))).toEqual([['4.3'], ['2.3'], ['0.3'], ['2.2']]);
            expect(beats(score, 3).map(b => noteNames(b))).toEqual([['1.5'], ['3.5']]);
            expect(beats(score, 4).map(b => b.duration)).toEqual([Duration.Whole]);
        });

        it('instruments', async () => {
            const score = await load('instruments');
            expect(score.tracks.map(t => t.name)).toEqual(['Guitar', 'Bass']);
            const guitar = score.tracks[0].staves[0];
            expect(guitar.capo).toBe(2);
            expect(guitar.tuning).toEqual([64, 59, 55, 50, 45, 40]);
            const bass = score.tracks[1].staves[0];
            expect(bass.tuning).toEqual([43, 38, 33, 28]);
            expect(score.tracks[1].playbackInfo.program).toBe(33);
            expect(bass.bars[0].clef).toBe(Clef.F4);
            expect(beats(score, 0).map(b => noteNames(b))).toEqual([['0.6'], ['1.5'], ['2.4']]);
            expect(beats(score, 0, 0, 1).map(b => noteNames(b))).toEqual([['0.1']]);
            expect(beats(score, 0, 0, 1)[0].dots).toBe(1);
            expect(beats(score, 1, 0, 1).map(b => noteNames(b))).toEqual([['2.3'], ['0.2']]);
        });

        it('cell-kinds', async () => {
            const score = await load('probes');
            const bar0 = beats(score, 0);
            expect(bar0.map(b => noteNames(b).join(' '))).toEqual(['27.4', '3.4', '5.4', '5.4', '5.4']);
            expect(bar0[1].graceType).toBe(GraceType.OnBeat);
            expect(bar0[3].notes[0].bendPoints!.map(p => [p.offset, p.value])).toEqual([
                [0, 2],
                [60, 2]
            ]);
            expect(bar0[4].notes[0].bendPoints).toBe(null);

            const bar1 = beats(score, 1);
            expect(bar1[0].fermata).not.toBe(null);
            expect(bar1[0].beamingMode).toBe(BeatBeamingMode.ForceSplitToNext);
            expect(bar1[3].ottava).toBe(Ottavia._8va);
            expect(bar1[4].brushType).toBe(BrushType.ArpeggioDown);

            // the connection (number 3, length 16) also covers the quarter at its end
            const bar2 = beats(score, 2);
            expect(bar2.map(b => [b.isRest, b.tupletNumerator, b.playbackStart])).toEqual([
                [false, 3, 0],
                [false, 3, 320],
                [false, 3, 640],
                [true, 3, 960],
                [false, 3, 1280],
                [false, -1, 1920]
            ]);
            expect(bar2[4].notes[0].accentuated).toBe(AccentuationType.Normal);
            expect(bar2[5].pickStroke).toBe(PickStroke.Up);
        });
    });

    describe('tabledit-conversion', () => {
        async function expectSameAsConversion(name: string) {
            const v2 = await load(name);
            const v3 = ScoreLoader.loadScoreFromBytes(
                await TestPlatform.loadFile(`test-data/tabledit/v2/${name}.v3.tef`),
                new Settings()
            );
            ComparisonHelpers.expectJsonEqual(
                JsonConverter.scoreToJsObject(v3),
                JsonConverter.scoreToJsObject(v2),
                `<${name}>`,
                null
            );
        }

        it('notes', async () => {
            await expectSameAsConversion('notes');
        });

        it('effects', async () => {
            await expectSameAsConversion('effects');
        });

        it('markers', async () => {
            await expectSameAsConversion('markers');
        });

        it('measures', async () => {
            await expectSameAsConversion('measures');
        });

        it('instruments', async () => {
            await expectSameAsConversion('instruments');
        });

        it('cell-kinds', async () => {
            await expectSameAsConversion('probes');
        });
    });
});
