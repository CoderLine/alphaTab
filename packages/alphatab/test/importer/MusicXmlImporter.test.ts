import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import { BendType } from '@coderline/alphatab/model/BendType';
import { Direction } from '@coderline/alphatab/model/Direction';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { FlatMidiEventGenerator, FlatNoteEvent, FlatTempoEvent } from 'test/audio/FlatMidiEventGenerator';
import { MusicXmlImporterTestHelper } from 'test/importer/MusicXmlImporterTestHelper';
import { describe, expect, it } from 'vitest';

describe('MusicXmlImporterTests', () => {
    it('track-volume', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.volume).toBe(16);
        expect(score.tracks[1].playbackInfo.volume).toBe(12);
        expect(score.tracks[2].playbackInfo.volume).toBe(8);
        expect(score.tracks[3].playbackInfo.volume).toBe(4);
        expect(score.tracks[4].playbackInfo.volume).toBe(0);
    });

    it('track-balance', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.balance).toBe(0);
        expect(score.tracks[1].playbackInfo.balance).toBe(4);
        expect(score.tracks[2].playbackInfo.balance).toBe(8);
        expect(score.tracks[3].playbackInfo.balance).toBe(12);
        expect(score.tracks[4].playbackInfo.balance).toBe(16);
    });

    it('full-bar-rest', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/full-bar-rest.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isFullBarRest).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].isFullBarRest).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].isFullBarRest).toBe(true);
    });

    it('first-bar-tempo', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/first-bar-tempo.musicxml'
        );

        // dotted quarter = 60
        expect(score.tempo).toBe(90);
        expect(score.masterBars[0].tempoAutomations.length).toBe(1);
        expect(score.masterBars[0].tempoAutomations[0]?.value).toBe(90);
        expect(score.masterBars[1].tempoAutomations.length).toBe(1);
        expect(score.masterBars[1].tempoAutomations[0].value).toBe(90);
    });
    it('tie-destination', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/tie-destination.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isTieOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].tieDestination).toBeTruthy();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isTieDestination).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].tieOrigin).toBeTruthy();

        // notes carry a <instrument id="..."/> reference purely to disambiguate the
        // score-instrument (a pitched acoustic guitar) - this must not mark them as percussion.
        for (const beat of score.tracks[0].staves[0].bars[0].voices[0].beats) {
            for (const note of beat.notes) {
                expect(note.isPercussion).toBe(false);
            }
        }

        score = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score));

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isTieOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].tieDestination).toBeTruthy();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isTieDestination).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].tieOrigin).toBeTruthy();
    });
    it('chord-diagram', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/chord-diagram.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).toBe('C');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[0]).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[1]).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[2]).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[3]).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[4]).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[5]).toBe(-1);

        score = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score));

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).toBe('C');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[0]).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[1]).toBe(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[2]).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[3]).toBe(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[4]).toBe(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[5]).toBe(-1);
    });
    it('compressed', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml3/compressed.mxl');

        expect(score.title).toBe('Title');
        expect(score.tracks.length).toBe(1);
        expect(score.masterBars.length).toBe(1);
    });
    it('bend', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml4/bends.xml');
        let note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBe(60);
        expect(note.bendPoints![1].value).toBe(2);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.Prebend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(4);
        expect(note.bendPoints![1].offset).toBe(60);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0];
        expect(note.bendType).toBe(BendType.BendRelease);
        expect(note.bendPoints!.length).toBe(4);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBe(30);
        expect(note.bendPoints![1].value).toBe(4);
        expect(note.bendPoints![2].offset).toBe(30);
        expect(note.bendPoints![2].value).toBe(4);
        expect(note.bendPoints![3].offset).toBe(60);
        expect(note.bendPoints![3].value).toBe(0);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0];
        expect(note.bendType).toBe(BendType.PrebendRelease);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(2);
        expect(note.bendPoints![1].offset).toBe(60);
        expect(note.bendPoints![1].value).toBe(0);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0];
        expect(note.bendType).toBe(BendType.PrebendBend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(2);
        expect(note.bendPoints![1].offset).toBe(60);
        expect(note.bendPoints![1].value).toBe(4);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0];
        expect(note.bendType).toBe(BendType.BendRelease);
        expect(note.bendPoints!.length).toBe(4);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBe(30);
        expect(note.bendPoints![1].value).toBe(2);
        expect(note.bendPoints![2].offset).toBe(30);
        expect(note.bendPoints![2].value).toBe(2);
        expect(note.bendPoints![3].offset).toBe(60);
        expect(note.bendPoints![3].value).toBe(0);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[1];
        expect(note.bendType).toBe(BendType.BendRelease);
        expect(note.bendPoints!.length).toBe(4);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBe(30);
        expect(note.bendPoints![1].value).toBe(2);
        expect(note.bendPoints![2].offset).toBe(30);
        expect(note.bendPoints![2].value).toBe(2);
        expect(note.bendPoints![3].offset).toBe(60);
        expect(note.bendPoints![3].value).toBe(0);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[2];
        expect(note.bendType).toBe(BendType.None);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0];
        expect(note.bendType).toBe(BendType.Custom);
        expect(note.bendPoints!.length).toBe(12);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(1);
        expect(note.bendPoints![1].offset).toBe(10);
        expect(note.bendPoints![1].value).toBe(1);
        expect(note.bendPoints![2].offset).toBe(10);
        expect(note.bendPoints![2].value).toBe(1);
        expect(note.bendPoints![3].offset).toBe(20);
        expect(note.bendPoints![3].value).toBe(3);
        expect(note.bendPoints![4].offset).toBe(20);
        expect(note.bendPoints![4].value).toBe(3);
        expect(note.bendPoints![5].offset).toBe(30);
        expect(note.bendPoints![5].value).toBe(4);
        expect(note.bendPoints![6].offset).toBe(30);
        expect(note.bendPoints![6].value).toBe(4);
        expect(note.bendPoints![7].offset).toBe(40);
        expect(note.bendPoints![7].value).toBe(8);
        expect(note.bendPoints![8].offset).toBe(40);
        expect(note.bendPoints![8].value).toBe(8);
        expect(note.bendPoints![9].offset).toBe(50);
        expect(note.bendPoints![9].value).toBe(4);
        expect(note.bendPoints![10].offset).toBe(50);
        expect(note.bendPoints![10].value).toBe(4);
        expect(note.bendPoints![11].offset).toBe(60);
        expect(note.bendPoints![11].value).toBe(8);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0];
        expect(note.bendType).toBe(BendType.PrebendRelease);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(8);
        expect(note.bendPoints![1].offset).toBe(60);
        expect(note.bendPoints![1].value).toBe(0);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0];
        expect(note.bendType).toBe(BendType.Bend);
        expect(note.bendPoints!.length).toBe(2);
        expect(note.bendPoints![0].offset).toBe(0);
        expect(note.bendPoints![0].value).toBe(0);
        expect(note.bendPoints![1].offset).toBe(30);
        expect(note.bendPoints![1].value).toBe(2);
    });

    it('partwise-basic', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/partwise-basic.xml');
        expect(score).toMatchSnapshot();
    });

    it('timewise-basic', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/timewise-basic.xml');
        expect(score).toMatchSnapshot();
    });

    it('partwise-anacrusis', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/partwise-anacrusis.xml');
        expect(score).toMatchSnapshot();
    });

    it('timewise-anacrusis', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/timewise-anacrusis.xml');
        expect(score).toMatchSnapshot();
    });

    it('partwise-complex-measures', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/partwise-complex-measures.xml');
        expect(score).toMatchSnapshot();
    });

    it('partwise-staff-change', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/partwise-staff-change.xml');
        expect(score).toMatchSnapshot();
    });

    it('barlines', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/barlines.xml');
        expect(score).toMatchSnapshot();
    });

    it('2102-corrupt-direction', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/2102-corrupt-direction.xml');
        expect(score).toMatchSnapshot();
    });

    it('bank', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/midi-bank.xml');

        expect(score.tracks[0].playbackInfo.program).toBe(0);
        expect(score.tracks[0].playbackInfo.bank).toBe(0);

        expect(score.tracks[1].playbackInfo.program).toBe(1);
        expect(score.tracks[1].playbackInfo.bank).toBe(77);
    });

    it('buzzroll', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/buzzroll.xml');
        expect(score).toMatchSnapshot();
    });

    it('percussion-articulation', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/percussion-articulation.xml');
        const notes = score.tracks[0].staves[0].bars[0].voices[0].beats.flatMap(b => b.notes);
        const trackArticulations = score.tracks[0].percussionArticulations;

        expect(notes).toHaveLength(2);
        expect(notes[0].displayValue).toBe(38);
        expect(notes[0].isPercussion).toBe(true);
        expect(notes[0].percussionArticulation).toBe(0);
        expect(trackArticulations[0].outputMidiNumber).toBe(38);

        expect(notes[1].displayValue).toBe(49);
        expect(notes[1].isPercussion).toBe(true);
        expect(notes[1].percussionArticulation).toBe(1);
        expect(trackArticulations[1].outputMidiNumber).toBe(49);
    });

    it('percussion-instrument-vs-pitched', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile(
            'test-data/musicxml4/percussion-instrument-vs-pitched.xml'
        );
        const notes = score.tracks[0].staves[0].bars[0].voices[0].beats.flatMap(b => b.notes);

        expect(notes).toHaveLength(2);

        // <pitch> note referencing a normal pitched instrument via <instrument id> just to
        // disambiguate the score-instrument -> must NOT be treated as percussion.
        expect(notes[0].isPercussion).toBe(false);
        expect(Number.isNaN(notes[0].percussionArticulation)).toBe(true);
        expect(notes[0].realValue).toBe(60); // C4

        // <pitch> note referencing a score-instrument declared unpitched via
        // <midi-instrument><midi-unpitched> -> IS a genuine percussion sound.
        expect(notes[1].isPercussion).toBe(true);
        expect(notes[1].percussionArticulation).toBeGreaterThanOrEqual(0);
    });

    it('accidental-spelling', async () => {
        const score = await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml4/accidental-spelling.xml');

        // written spelling of all notes as [bar, degree, accidental offset, octave]
        const expected = [
            [0, 3, 1, 4], // F#4
            [0, 3, 1, 4], // F#4 without printed sign
            [0, 4, 0, 4], // G4
            [1, 3, 1, 4], // F#4 tied
            [2, 3, 1, 4], // F#4 tie destination without printed sign
            [3, 6, 0, 4], // B4 in Gb major
            [3, 6, 0, 4], // B4 in Gb major without printed sign
            [4, 3, 1, 4], // F#4 with a contradicting flat sign
            [5, 6, 1, 4], // B#4
            [5, 0, 0, 5], // C5
            [5, 0, -1, 5] // Cb5
        ];

        let i = 0;
        for (const bar of score.tracks[0].staves[0].bars) {
            for (const beat of bar.voices[0].beats) {
                for (const note of beat.notes) {
                    const spelling = ModelUtils.resolveSpelling(
                        bar.keySignature,
                        note.displayValue,
                        note.accidentalMode
                    );
                    const context = `note ${i}`;
                    expect(bar.index, context).toBe(expected[i][0]);
                    expect(spelling.degree, context).toBe(expected[i][1]);
                    expect(spelling.accidentalOffset, context).toBe(expected[i][2]);
                    expect(spelling.octave, context).toBe(expected[i][3]);
                    i++;
                }
            }
        }
        expect(i).toBe(expected.length);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].isTieDestination).toBe(true);
    });

    it('transposed-tie', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/transposed-tie.xml');
        const notes = score.tracks[0].staves[0].bars[0].voices[0].beats.map(b => b.notes[0]);

        // ties without number are matched by pitch, this must respect the staff transposition
        expect(notes[0].isTieOrigin).toBe(true);
        expect(notes[0].tieDestination).toBe(notes[1]);
        expect(notes[1].isTieDestination).toBe(true);
        expect(notes[1].tieOrigin).toBe(notes[0]);
    });

    it('dead-note', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/dead-note.xml');
        const notes = (track: number, staff: number) =>
            score.tracks[track].staves[staff].bars[0].voices[0].beats.flatMap(b => b.notes);

        // tab staff: x notehead
        const tab = notes(0, 0);
        expect(tab[0].isDead).toBe(false);
        expect(tab[1].isDead).toBe(true);
        expect(tab[1].fret).toBe(2);

        // MuseScore: x notehead on notation and tab staff, tuning only on the tab staff
        expect(notes(1, 0)[0].isDead).toBe(true);
        expect(notes(1, 1)[0].isDead).toBe(true);

        // TuxGuitar: x notehead and mute on notation staff, only mute on the tab staff
        expect(notes(2, 0)[0].isDead).toBe(true);
        expect(notes(2, 1)[0].isDead).toBe(true);

        // Guitar Pro 5: x notehead with string but without fret
        const gp5 = notes(3, 0)[0];
        expect(gp5.isDead).toBe(true);
        expect(gp5.isStringed).toBe(true);
        expect(gp5.string).toBe(4);
        expect(gp5.fret).toBe(2);
        expect(gp5.showStringNumber).toBe(false);

        // drums: x notehead is a hi-hat
        const drums = notes(4, 0)[0];
        expect(drums.isPercussion).toBe(true);
        expect(drums.isDead).toBe(false);

        // voice: x notehead
        expect(notes(5, 0)[0].isDead).toBe(false);

        // trumpet: straight mute
        const trumpet = notes(6, 0)[0];
        expect(trumpet.isDead).toBe(false);
        expect(trumpet.isPalmMute).toBe(false);
    });

    it('string-annotation', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/string-annotation.xml');

        // staff without tuning: <string> is only an annotation on the pitched note
        const notation = score.tracks[0].staves[0].bars[0].voices[0].beats.map(b => b.notes[0]);
        expect(score.tracks[0].staves[0].tuning).toHaveLength(0);
        for (const note of [notation[0], notation[1]]) {
            expect(note.isStringed).toBe(false);
            expect(note.isPiano).toBe(true);
            expect(note.realValue).toBe(69);
            expect(note.string).toBe(6);
            expect(note.showStringNumber).toBe(true);
            expect(Number.isNaN(note.fret)).toBe(true);
        }
        // out of range string
        expect(Number.isNaN(notation[2].string)).toBe(true);
        expect(notation[2].showStringNumber).toBe(false);
        expect(notation[2].realValue).toBe(69);
        expect(Number.isNaN(notation[3].string)).toBe(true);
        expect(notation[3].showStringNumber).toBe(false);

        // staff with tuning: string+fret is the tab position, string only is an annotation
        const tab = score.tracks[1].staves[0].bars[0].voices[0].beats.map(b => b.notes[0]);
        expect(score.tracks[1].staves[0].tuning).toHaveLength(6);
        expect(tab[0].isStringed).toBe(true);
        expect(tab[0].string).toBe(6);
        expect(tab[0].fret).toBe(5);
        expect(tab[0].realValue).toBe(69);
        expect(tab[0].showStringNumber).toBe(false);

        expect(tab[1].isStringed).toBe(false);
        expect(tab[1].string).toBe(5);
        expect(tab[1].showStringNumber).toBe(true);
        expect(tab[1].realValue).toBe(69);

        // out of range string
        expect(tab[2].isStringed).toBe(false);
        expect(Number.isNaN(tab[2].string)).toBe(true);
        expect(Number.isNaN(tab[2].fret)).toBe(true);
        expect(tab[2].showStringNumber).toBe(false);
        expect(tab[2].realValue).toBe(69);

        const midiFile = new MidiFile();
        new MidiFileGenerator(score, new Settings(), new AlphaSynthMidiFileHandler(midiFile)).generate();
        expect(midiFile.events.filter(e => Number.isNaN(e.tick))).toHaveLength(0);
    });

    it('fingering', async () => {
        const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/fingering.xml');
        // each part has every value once as <fingering> (bars 0-5) and once as <pluck> (bars 6-11)
        const notes = (track: number, firstBar: number): Note[] => {
            const result: Note[] = [];
            for (let i = firstBar; i < firstBar + 6; i++) {
                for (const b of score.tracks[track].staves[0].bars[i].voices[0].beats) {
                    result.push(b.notes[0]);
                }
            }
            return result;
        };

        const letters = [
            Fingers.Thumb, // p
            Fingers.Thumb, // t
            Fingers.Thumb, // T
            Fingers.Thumb, // P
            Fingers.IndexFinger, // i
            Fingers.IndexFinger, // I
            Fingers.MiddleFinger, // m
            Fingers.MiddleFinger, // M
            Fingers.AnnularFinger, // a
            Fingers.AnnularFinger, // A
            Fingers.LittleFinger, // c
            Fingers.LittleFinger, // C
            Fingers.LittleFinger, // e
            Fingers.LittleFinger, // o
            Fingers.LittleFinger, // q
            Fingers.LittleFinger, // s
            Fingers.LittleFinger, // x
            Fingers.Unknown // 6
        ];
        // 0 1 2 3 4 5
        const keyboardDigits = [
            Fingers.NoOrDead,
            Fingers.Thumb,
            Fingers.IndexFinger,
            Fingers.MiddleFinger,
            Fingers.AnnularFinger,
            Fingers.LittleFinger
        ];
        const fretDigits = [
            Fingers.NoOrDead,
            Fingers.IndexFinger,
            Fingers.MiddleFinger,
            Fingers.AnnularFinger,
            Fingers.LittleFinger,
            Fingers.Thumb
        ];

        function expectFingers(actual: Fingers[], digits: Fingers[]) {
            const expected: Fingers[] = [];
            for (const f of digits) {
                expected.push(f);
            }
            for (const f of letters) {
                expected.push(f);
            }
            expect(actual).toEqual(expected);
        }

        // guitar
        expect(score.tracks[0].playbackInfo.program).toBe(24);
        expectFingers(
            notes(0, 0).map(n => n.leftHandFinger),
            fretDigits
        );
        expectFingers(
            notes(0, 6).map(n => n.rightHandFinger),
            keyboardDigits
        );

        // piano
        expect(score.tracks[1].playbackInfo.program).toBe(0);
        expectFingers(
            notes(1, 0).map(n => n.leftHandFinger),
            keyboardDigits
        );
        expectFingers(
            notes(1, 6).map(n => n.rightHandFinger),
            keyboardDigits
        );
    });

    it('hammer-pull', () => {
        // 5h7p5 5 on the low E string
        const note = (step: string, fret: number, technical: string) =>
            `<note><pitch><step>${step}</step><octave>2</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type>` +
            `<notations><technical>${technical}<string>6</string><fret>${fret}</fret></technical></notations></note>`;
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Guitar</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>TAB</sign><line>5</line></clef>
      <staff-details><staff-lines>6</staff-lines>
        <staff-tuning line="1"><tuning-step>E</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>
        <staff-tuning line="2"><tuning-step>A</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>
        <staff-tuning line="3"><tuning-step>D</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
        <staff-tuning line="4"><tuning-step>G</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
        <staff-tuning line="5"><tuning-step>B</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
        <staff-tuning line="6"><tuning-step>E</tuning-step><tuning-octave>4</tuning-octave></staff-tuning>
      </staff-details>
    </attributes>
    ${note('A', 5, '<hammer-on type="start">H</hammer-on>')}
    ${note('B', 7, '<hammer-on type="stop"/><pull-off type="start">P</pull-off>')}
    ${note('A', 5, '<pull-off type="stop"/>')}
    ${note('A', 5, '')}
  </measure></part>
</score-partwise>`;
        const score = MusicXmlImporterTestHelper.prepareImporterWithBytes(IOHelper.stringToBytes(xml)).readScore();
        const notes = score.tracks[0].staves[0].bars[0].voices[0].beats.map(b => b.notes[0]);

        expect(notes.map(n => n.isHammerPullOrigin)).toEqual([true, true, false, false]);
        expect(notes[0].hammerPullDestination).toBe(notes[1]);
        expect(notes[1].hammerPullDestination).toBe(notes[2]);
        expect(notes[3].isHammerPullDestination).toBe(false);
    });

    describe('barnumberdisplay', async () => {
        async function testPartwise(filename: string, display: BarNumberDisplay) {
            const score = await MusicXmlImporterTestHelper.loadFile(`test-data/musicxml4/${filename}`);
            expect(score.tracks[0].staves[0].bars[1].barNumberDisplay).toBe(display);
            expect(score.tracks[1].staves[0].bars[2].barNumberDisplay).toBe(display);
        }

        async function testTimewise(filename: string, display: BarNumberDisplay) {
            const score = await MusicXmlImporterTestHelper.loadFile(`test-data/musicxml4/${filename}`);
            expect(score.tracks[0].staves[0].bars[1].barNumberDisplay).toBe(display);
            expect(score.tracks[1].staves[0].bars[1].barNumberDisplay).toBe(display);
        }

        it('partwise-none', async () =>
            await testPartwise('partwise-measure-numbering-none.xml', BarNumberDisplay.Hide));
        it('partwise-measure', async () =>
            await testPartwise('partwise-measure-numbering-measure.xml', BarNumberDisplay.AllBars));
        it('partwise-system', async () =>
            await testPartwise('partwise-measure-numbering-system.xml', BarNumberDisplay.FirstOfSystem));
        it('partwise-implicit', async () => {
            const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/partwise-anacrusis.xml');
            expect(score.tracks[0].staves[0].bars[0].barNumberDisplay).toBe(BarNumberDisplay.Hide);
            expect(score.tracks[0].staves[0].bars[1].barNumberDisplay).toBeUndefined();
            expect(score.tracks[0].staves[0].bars[3].barNumberDisplay).toBe(BarNumberDisplay.Hide);
            expect(score.tracks[1].staves[0].bars[0].barNumberDisplay).toBe(BarNumberDisplay.Hide);
            expect(score.tracks[1].staves[0].bars[1].barNumberDisplay).toBeUndefined();
            expect(score.tracks[1].staves[0].bars[3].barNumberDisplay).toBe(BarNumberDisplay.Hide);
        });

        it('timewise-none', async () =>
            await testTimewise('timewise-measure-numbering-none.xml', BarNumberDisplay.Hide));
        it('timewise-measure', async () =>
            await testTimewise('timewise-measure-numbering-measure.xml', BarNumberDisplay.AllBars));
        it('timewise-system', async () =>
            await testTimewise('timewise-measure-numbering-system.xml', BarNumberDisplay.FirstOfSystem));
        it('timewise-implicit', async () => {
            const score = await MusicXmlImporterTestHelper.loadFile('test-data/musicxml4/timewise-anacrusis.xml');
            expect(score.tracks[0].staves[0].bars[0].barNumberDisplay).toBe(BarNumberDisplay.Hide);
            expect(score.tracks[0].staves[0].bars[1].barNumberDisplay).toBeUndefined();
            expect(score.tracks[0].staves[0].bars[3].barNumberDisplay).toBe(BarNumberDisplay.Hide);
            expect(score.tracks[1].staves[0].bars[0].barNumberDisplay).toBe(BarNumberDisplay.Hide);
            expect(score.tracks[1].staves[0].bars[1].barNumberDisplay).toBeUndefined();
            expect(score.tracks[1].staves[0].bars[3].barNumberDisplay).toBe(BarNumberDisplay.Hide);
        });
    });

    describe('metronome-tempo', () => {
        function loadMetronome(beatUnit: string, dots: number, perMinute: number, soundTempo: number = -1): Score {
            let beatUnitDots = '';
            for (let i = 0; i < dots; i++) {
                beatUnitDots += '<beat-unit-dot/>';
            }
            const sound = soundTempo > 0 ? `<sound tempo="${soundTempo}"/>` : '';
            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <time><beats>6</beats><beat-type>8</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome><beat-unit>${beatUnit}</beat-unit>${beatUnitDots}<per-minute>${perMinute}</per-minute></metronome>
        </direction-type>
        ${sound}
      </direction>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
  </part>
</score-partwise>`;
            return MusicXmlImporterTestHelper.prepareImporterWithBytes(IOHelper.stringToBytes(xml)).readScore();
        }

        function expectTempo(score: Score, expected: number) {
            expect(score.masterBars[0].tempoAutomations.length).toBe(1);
            expect(score.masterBars[0].tempoAutomations[0].value).toBe(expected);
            expect(score.tempo).toBe(expected);
        }

        it('quarter', () => expectTempo(loadMetronome('quarter', 0, 120), 120));
        it('eighth', () => expectTempo(loadMetronome('eighth', 0, 120), 60));
        it('16th', () => expectTempo(loadMetronome('16th', 0, 240), 60));
        it('half', () => expectTempo(loadMetronome('half', 0, 60), 120));
        it('whole', () => expectTempo(loadMetronome('whole', 0, 30), 120));
        it('breve', () => expectTempo(loadMetronome('breve', 0, 15), 120));

        it('dotted-quarter', () => expectTempo(loadMetronome('quarter', 1, 40), 60));
        it('dotted-eighth', () => expectTempo(loadMetronome('eighth', 1, 120), 90));
        it('dotted-half', () => expectTempo(loadMetronome('half', 1, 60), 180));
        it('double-dotted-quarter', () => expectTempo(loadMetronome('quarter', 2, 40), 70));

        it('sound-tempo-matching', () => expectTempo(loadMetronome('eighth', 0, 120, 60), 60));
        it('sound-tempo-precedence', () => expectTempo(loadMetronome('eighth', 0, 120, 200), 200));

        it('playback-tempo', () => {
            const score = loadMetronome('eighth', 0, 120);

            const handler = new FlatMidiEventGenerator();
            const generator = new MidiFileGenerator(score, null, handler);
            generator.generate();

            const tempoChanges: FlatTempoEvent[] = [];
            for (const evt of handler.midiEvents) {
                if (evt instanceof FlatTempoEvent) {
                    tempoChanges.push(evt as FlatTempoEvent);
                }
            }

            expect(tempoChanges.length).toBe(1);
            expect(tempoChanges[0].tick).toBe(0);
            expect(tempoChanges[0].tempo).toBe(60);
        });
    });

    describe('sound-directions', () => {
        function loadMeasures(measures: string[]): Score {
            let xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
  <part id="P1">`;
            for (let i = 0; i < measures.length; i++) {
                xml += `<measure number="${i + 1}">`;
                if (i === 0) {
                    xml +=
                        '<attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>';
                }
                xml += measures[i];
                xml +=
                    '<note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type></note>';
                xml += '</measure>';
            }
            xml += '</part></score-partwise>';
            return MusicXmlImporterTestHelper.prepareImporterWithBytes(IOHelper.stringToBytes(xml)).readScore();
        }

        function direction(content: string): string {
            return `<direction placement="above">${content}</direction>`;
        }

        function expectDirections(score: Score, barIndex: number, expected: Direction[]) {
            const actual = score.masterBars[barIndex].directions;
            expect(actual === null ? 0 : actual.size).toBe(expected.length);
            for (const d of expected) {
                expect(actual!.has(d)).toBe(true);
            }
        }

        function beatText(score: Score, barIndex: number): string | null {
            return score.tracks[0].staves[0].bars[barIndex].voices[0].beats[0].text;
        }

        it('direction-level', () => {
            const score = loadMeasures([
                '',
                direction('<direction-type><words>To Coda</words></direction-type><sound tocoda="coda1"/>'),
                direction('<direction-type><words>D.C. al Coda</words></direction-type><sound dacapo="yes"/>'),
                direction('<direction-type><coda/></direction-type><sound coda="coda1"/>')
            ]);
            expectDirections(score, 0, []);
            expectDirections(score, 1, [Direction.JumpDaCoda]);
            expectDirections(score, 2, [Direction.JumpDaCapo]);
            expectDirections(score, 3, [Direction.TargetCoda]);
            expect(beatText(score, 1)).toBeNull();
            expect(beatText(score, 2)).toBeNull();
        });

        it('measure-level', () => {
            const score = loadMeasures([
                '',
                `${direction('<direction-type><words>To Coda</words></direction-type>')}<sound tocoda="coda1"/>`,
                `${direction('<direction-type><words>D.C. al Coda</words></direction-type>')}<sound dacapo="yes"/>`,
                `${direction('<direction-type><coda/></direction-type>')}<sound coda="coda1"/>`
            ]);
            expectDirections(score, 0, []);
            expectDirections(score, 1, [Direction.JumpDaCoda]);
            expectDirections(score, 2, [Direction.JumpDaCapo]);
            expectDirections(score, 3, [Direction.TargetCoda]);
        });

        it('segno-fine-dalsegno', () => {
            const score = loadMeasures([
                direction('<direction-type><segno/></direction-type><sound segno="segno1"/>'),
                direction('<direction-type><words>Fine</words></direction-type><sound fine="yes"/>'),
                direction('<direction-type><words>D.S. al Fine</words></direction-type><sound dalsegno="segno1"/>')
            ]);
            expectDirections(score, 0, [Direction.TargetSegno]);
            expectDirections(score, 1, [Direction.TargetFine]);
            expectDirections(score, 2, [Direction.JumpDalSegno]);
            expect(beatText(score, 1)).toBeNull();
            expect(beatText(score, 2)).toBeNull();
        });

        it('coda-symbol-with-tocoda', () => {
            const score = loadMeasures([
                direction(
                    '<direction-type><words>To Coda</words></direction-type><direction-type><coda/></direction-type><sound tocoda="coda1"/>'
                )
            ]);
            expectDirections(score, 0, [Direction.JumpDaCoda]);
            expect(beatText(score, 0)).toBeNull();
        });

        it('unknown-words-kept', () => {
            const score = loadMeasures([
                direction('<direction-type><words>Andante</words></direction-type><sound dacapo="yes"/>'),
                direction('<direction-type><words>Fine</words></direction-type><sound dacapo="yes"/>')
            ]);
            expectDirections(score, 0, [Direction.JumpDaCapo]);
            expectDirections(score, 1, [Direction.JumpDaCapo]);
            expect(beatText(score, 0)).toBe('Andante');
            expect(beatText(score, 1)).toBe('Fine');
        });

        it('label-variants', () => {
            const score = loadMeasures([
                direction('<direction-type><words>D. C.  al Fine</words></direction-type><sound dacapo="yes"/>'),
                direction(
                    '<direction-type><words>D.S. al </words><words>Coda</words></direction-type><sound dalsegno="segno1"/>'
                ),
                direction('<direction-type><words>To\u00a0Coda</words></direction-type><sound tocoda="coda1"/>')
            ]);
            expectDirections(score, 0, [Direction.JumpDaCapo]);
            expectDirections(score, 1, [Direction.JumpDalSegno]);
            expectDirections(score, 2, [Direction.JumpDaCoda]);
            expect(beatText(score, 0)).toBeNull();
            expect(beatText(score, 1)).toBeNull();
            expect(beatText(score, 2)).toBeNull();
        });

        it('dacapo-no', () => {
            const score = loadMeasures([
                direction('<direction-type><words>Andante</words></direction-type><sound dacapo="no"/>')
            ]);
            expectDirections(score, 0, []);
            expect(beatText(score, 0)).toBe('Andante');
        });

        it('display-only-symbols', () => {
            const score = loadMeasures([
                direction('<direction-type><segno/></direction-type>'),
                direction('<direction-type><coda/></direction-type>')
            ]);
            expectDirections(score, 0, [Direction.TargetSegno]);
            expectDirections(score, 1, [Direction.TargetCoda]);
        });
    });

    describe('direction-spans', () => {
        const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

        // parts of 4/4 measures, a single tablature staff or two notation staves
        function load(parts: string[][], staves: number = 1, divisions: number = 1): Score {
            let attributes = `<attributes><divisions>${divisions}</divisions><time><beats>4</beats><beat-type>4</beat-type></time>`;
            if (staves === 1) {
                attributes += '<clef><sign>TAB</sign><line>5</line></clef><staff-details><staff-lines>6</staff-lines>';
                for (let i = 0; i < tuning.length; i++) {
                    attributes += `<staff-tuning line="${i + 1}"><tuning-step>${tuning[i][0]}</tuning-step><tuning-octave>${tuning[i][1]}</tuning-octave></staff-tuning>`;
                }
                attributes += '</staff-details>';
            } else {
                attributes += `<staves>${staves}</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef>`;
            }
            attributes += '</attributes>';

            let xml = '<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0"><part-list>';
            for (let i = 0; i < parts.length; i++) {
                xml += `<score-part id="P${i + 1}"><part-name>P${i + 1}</part-name></score-part>`;
            }
            xml += '</part-list>';
            for (let i = 0; i < parts.length; i++) {
                xml += `<part id="P${i + 1}">`;
                for (let j = 0; j < parts[i].length; j++) {
                    xml += `<measure number="${j + 1}">${j === 0 ? attributes : ''}${parts[i][j]}</measure>`;
                }
                xml += '</part>';
            }
            xml += '</score-partwise>';
            return MusicXmlImporterTestHelper.prepareImporterWithBytes(IOHelper.stringToBytes(xml)).readScore();
        }

        // a quarter note, on the tablature if a string is given
        function note(
            pitch: string,
            string: number = 0,
            fret: number = 0,
            chord: boolean = false,
            voice: number = 1,
            staff: number = 0
        ): string {
            const technical =
                string > 0
                    ? `<notations><technical><string>${string}</string><fret>${fret}</fret></technical></notations>`
                    : '';
            return (
                `<note>${chord ? '<chord/>' : ''}<pitch><step>${pitch[0]}</step><octave>${pitch[1]}</octave></pitch>` +
                `<duration>1</duration><voice>${voice}</voice><type>quarter</type>${staff > 0 ? `<staff>${staff}</staff>` : ''}${technical}</note>`
            );
        }

        function open(count: number): string {
            let notes = '';
            for (let i = 0; i < count; i++) {
                notes += note('E2', 6);
            }
            return notes;
        }

        function dashes(words: string, type: string, number: string = '1', extra: string = ''): string {
            const label = words.length > 0 ? `<direction-type><words>${words}</words></direction-type>` : '';
            return `<direction>${label}<direction-type><dashes type="${type}" number="${number}"/></direction-type>${extra}</direction>`;
        }

        function notesOf(score: Score, track: number, staff: number, bar: number, voice: number): Note[] {
            const notes: Note[] = [];
            for (const b of score.tracks[track].staves[staff].bars[bar].voices[voice].beats) {
                for (const n of b.notes) {
                    notes.push(n);
                }
            }
            return notes;
        }

        function expectLetRing(
            score: Score,
            expected: boolean[],
            track: number = 0,
            staff: number = 0,
            bar: number = 0,
            voice: number = 0
        ) {
            expect(notesOf(score, track, staff, bar, voice).map(n => n.isLetRing)).toEqual(expected);
        }

        function expectPalmMute(score: Score, expected: boolean[], bar: number = 0) {
            expect(notesOf(score, 0, 0, bar, 0).map(n => n.isPalmMute)).toEqual(expected);
        }

        function noteLengths(score: Score): number[] {
            const handler = new FlatMidiEventGenerator();
            new MidiFileGenerator(score, new Settings(), handler).generate();
            const lengths: number[] = [];
            for (const e of handler.midiEvents) {
                if (e instanceof FlatNoteEvent) {
                    lengths.push(e.length);
                }
            }
            return lengths;
        }

        it('let-ring', () => {
            const score = load([
                [
                    dashes('LetRing', 'start') +
                        note('E2', 6) +
                        note('A2', 5) +
                        note('D3', 4) +
                        note('G3', 3) +
                        dashes('LetRing', 'stop')
                ]
            ]);
            expectLetRing(score, [true, true, true, true]);
            expect(noteLengths(score)).toEqual([3840, 2880, 1920, 960]);

            const serialized = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), new Settings());
            expectLetRing(serialized, [true, true, true, true]);
            expect(serialized.tracks[0].staves[0].bars[0].voices[0].beats.map(b => b.isLetRing)).toEqual([
                true,
                true,
                true,
                true
            ]);
        });

        it('let-ring-same-string', () => {
            // ringing ends when the string is struck again
            const score = load([
                [
                    dashes('LetRing', 'start') +
                        note('E2', 6, 0) +
                        note('G2', 6, 3) +
                        note('A2', 5, 0) +
                        note('B2', 5, 2) +
                        dashes('LetRing', 'stop')
                ]
            ]);
            expect(noteLengths(score)).toEqual([960, 2880, 960, 960]);
        });

        it('palm-mute', () => {
            const score = load([[dashes('P.M.', 'start') + open(2) + dashes('P.M.', 'stop') + open(2)]]);
            expectPalmMute(score, [true, true, false, false]);
        });

        it('stop-without-words', () => {
            const score = load([[dashes('LetRing', 'start') + open(2) + dashes('', 'stop') + open(2), open(4)]]);
            expectLetRing(score, [true, true, false, false]);
            expectLetRing(score, [false, false, false, false], 0, 0, 1);
        });

        it('offset', () => {
            // the offset (in divisions) moves start and stop by a quarter note back
            const offset: string = '<offset>-2</offset>';
            const quarter = (pitch: string) =>
                `<note><pitch><step>${pitch[0]}</step><octave>${pitch[1]}</octave></pitch><duration>2</duration><voice>1</voice><type>quarter</type></note>`;
            const score = load(
                [
                    [
                        quarter('E2') +
                            dashes('LetRing', 'start', '1', offset) +
                            quarter('E2') +
                            quarter('E2') +
                            dashes('', 'stop', '1', offset) +
                            quarter('E2')
                    ]
                ],
                1,
                2
            );
            expectLetRing(score, [true, true, false, false]);
        });

        it('across-bars-and-chords', () => {
            const score = load([
                [
                    open(2) + dashes('LetRing', 'start') + note('E2', 6) + note('E2', 6) + note('A2', 5, 0, true),
                    open(1) + dashes('', 'stop') + open(3)
                ]
            ]);
            expectLetRing(score, [false, false, true, true, true], 0, 0, 0);
            expectLetRing(score, [true, false, false, false], 0, 0, 1);
        });

        it('numbers', () => {
            // overlapping let ring (1) and palm mute (2), stopped without words
            const score = load([
                [
                    dashes('LetRing', 'start', '1') +
                        note('E2', 6) +
                        dashes('P.M.', 'start', '2') +
                        note('E2', 6) +
                        dashes('', 'stop', '1') +
                        note('E2', 6) +
                        dashes('', 'stop', '2') +
                        note('E2', 6),
                    // one direction starting a new span with the number of the span it stops
                    dashes('LetRing', 'start', '1') +
                        open(2) +
                        '<direction><direction-type><words>P.M.</words></direction-type>' +
                        '<direction-type><dashes type="start" number="1"/></direction-type>' +
                        '<direction-type><dashes type="stop" number="1"/></direction-type></direction>' +
                        open(2) +
                        dashes('', 'stop', '1')
                ]
            ]);
            expectLetRing(score, [true, true, false, false]);
            expectPalmMute(score, [false, true, true, false]);
            expectLetRing(score, [true, true, false, false], 0, 0, 1);
            expectPalmMute(score, [false, false, true, true], 1);
        });

        it('staves-and-voices', () => {
            // the stop (voice 1) appears in the document before the start (voice 2)
            const staff1: string = '<staff>1</staff>';
            const score = load(
                [
                    [
                        note('C5', 0, 0, false, 1, 1) +
                            note('C5', 0, 0, false, 1, 1) +
                            dashes('', 'stop', '1', staff1) +
                            note('C5', 0, 0, false, 1, 1) +
                            note('C5', 0, 0, false, 1, 1) +
                            '<backup><duration>4</duration></backup>' +
                            note('A4', 0, 0, false, 2, 1) +
                            dashes('LetRing', 'start', '1', staff1) +
                            note('A4', 0, 0, false, 2, 1) +
                            note('A4', 0, 0, false, 2, 1) +
                            note('A4', 0, 0, false, 2, 1) +
                            '<backup><duration>4</duration></backup>' +
                            note('C3', 0, 0, false, 5, 2) +
                            note('C3', 0, 0, false, 5, 2) +
                            note('C3', 0, 0, false, 5, 2) +
                            note('C3', 0, 0, false, 5, 2)
                    ]
                ],
                2
            );
            expectLetRing(score, [false, true, false, false], 0, 0, 0, 0);
            expectLetRing(score, [false, true, false, false], 0, 0, 0, 1);
            expectLetRing(score, [false, false, false, false], 0, 1, 0, 0);
        });

        it('unclosed-per-part', () => {
            const score = load([
                [dashes('LetRing', 'start') + open(4), open(4)],
                [open(4), open(4)]
            ]);
            expectLetRing(score, [true, true, true, true], 0, 0, 0);
            expectLetRing(score, [true, true, true, true], 0, 0, 1);
            expectLetRing(score, [false, false, false, false], 1, 0, 0);
            expectLetRing(score, [false, false, false, false], 1, 0, 1);
        });

        it('stop-and-start-without-open-span', () => {
            // a stray stop in the direction starting a span must not end the new span
            const score = load([
                [
                    '<direction><direction-type><dashes type="stop" number="1"/></direction-type>' +
                        '<direction-type><words>LetRing</words></direction-type>' +
                        '<direction-type><dashes type="start" number="1"/></direction-type></direction>' +
                        open(2) +
                        dashes('', 'stop') +
                        open(2)
                ]
            ]);
            expectLetRing(score, [true, true, false, false]);
        });

        it('continue-and-unknown-words', () => {
            const score = load([
                [
                    dashes('LetRing', 'continue') +
                        open(2) +
                        dashes('', 'stop') +
                        dashes('cresc.', 'start') +
                        open(2) +
                        dashes('', 'stop')
                ]
            ]);
            expectLetRing(score, [true, true, false, false]);
            expectPalmMute(score, [false, false, false, false]);
            expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].text).toBeNull();
        });
    });
});
