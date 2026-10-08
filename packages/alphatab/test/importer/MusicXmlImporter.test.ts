import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { AlphaSynthMidiFileHandler } from '@coderline/alphatab/midi/AlphaSynthMidiFileHandler';
import { MidiFile } from '@coderline/alphatab/midi/MidiFile';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import { SustainPedalMarkerType } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { BendType } from '@coderline/alphatab/model/BendType';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { Direction } from '@coderline/alphatab/model/Direction';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import type { Note } from '@coderline/alphatab/model/Note';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Score } from '@coderline/alphatab/model/Score';
import { SimileMark } from '@coderline/alphatab/model/SimileMark';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
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

    describe('spans', () => {
        const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

        // parts of 4/4 measures on a single tablature staff, or on the given number of notation staves
        function load(parts: string[][], staves: number = 1, divisions: number = 1, software: string = ''): Score {
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

            let xml = '<?xml version="1.0" encoding="UTF-8"?><score-partwise version="4.0">';
            if (software.length > 0) {
                xml += `<identification><encoding><software>${software}</software></encoding></identification>`;
            }
            xml += '<part-list>';
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

        // a quarter note on the tablature
        function tab(pitch: string, stringNumber: number, fret: number = 0, notations: string = ''): string {
            return (
                `<note><pitch><step>${pitch[0]}</step><octave>${pitch[1]}</octave></pitch>` +
                '<duration>1</duration><voice>1</voice><type>quarter</type>' +
                `<notations><technical><string>${stringNumber}</string><fret>${fret}</fret></technical>${notations}</notations></note>`
            );
        }

        // a quarter (or longer) note on a notation staff
        function note(
            pitch: string,
            voice: number = 1,
            staff: number = 0,
            notations: string = '',
            duration: number = 1,
            type: string = 'quarter'
        ): string {
            return (
                `<note><pitch><step>${pitch[0]}</step><octave>${pitch[1]}</octave></pitch>` +
                `<duration>${duration}</duration><voice>${voice}</voice><type>${type}</type>` +
                `${staff > 0 ? `<staff>${staff}</staff>` : ''}${notations.length > 0 ? `<notations>${notations}</notations>` : ''}</note>`
            );
        }

        function chordNote(pitch: string, stringNumber: number, fret: number, notations: string = ''): string {
            return tab(pitch, stringNumber, fret, notations).replace('<note>', '<note><chord/>');
        }

        function openStrings(count: number): string {
            let notes = '';
            for (let i = 0; i < count; i++) {
                notes += tab('E2', 6);
            }
            return notes;
        }

        function quarters(count: number, pitch: string = 'C4', voice: number = 1, staff: number = 0): string {
            let notes = '';
            for (let i = 0; i < count; i++) {
                notes += note(pitch, voice, staff);
            }
            return notes;
        }

        function direction(directionTypes: string, extra: string = ''): string {
            return `<direction>${directionTypes}${extra}</direction>`;
        }

        function dashes(words: string, type: string, number: string = '1', extra: string = ''): string {
            const label = words.length > 0 ? `<direction-type><words>${words}</words></direction-type>` : '';
            return direction(
                `${label}<direction-type><dashes type="${type}" number="${number}"/></direction-type>`,
                extra
            );
        }

        function notesOf(
            score: Score,
            bar: number = 0,
            staff: number = 0,
            voice: number = 0,
            track: number = 0
        ): Note[] {
            const notes: Note[] = [];
            for (const b of score.tracks[track].staves[staff].bars[bar].voices[voice].beats) {
                for (const n of b.notes) {
                    notes.push(n);
                }
            }
            return notes;
        }

        function beatsOf(
            score: Score,
            bar: number = 0,
            staff: number = 0,
            voice: number = 0,
            track: number = 0
        ): Beat[] {
            return score.tracks[track].staves[staff].bars[bar].voices[voice].beats;
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

        describe('lines', () => {
            it('let-ring', () => {
                const score = load([
                    [
                        dashes('LetRing', 'start') +
                            tab('E2', 6) +
                            tab('A2', 5) +
                            tab('D3', 4) +
                            tab('G3', 3) +
                            dashes('LetRing', 'stop')
                    ]
                ]);
                expect(notesOf(score).map(n => n.isLetRing)).toEqual([true, true, true, true]);
                expect(noteLengths(score)).toEqual([3840, 2880, 1920, 960]);

                const serialized = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score), new Settings());
                expect(notesOf(serialized).map(n => n.isLetRing)).toEqual([true, true, true, true]);
                expect(beatsOf(serialized).map(b => b.isLetRing)).toEqual([true, true, true, true]);
            });

            it('let-ring-same-string', () => {
                // ringing ends when the string is struck again
                const score = load([
                    [
                        dashes('LetRing', 'start') +
                            tab('E2', 6, 0) +
                            tab('G2', 6, 3) +
                            tab('A2', 5, 0) +
                            tab('B2', 5, 2) +
                            dashes('LetRing', 'stop')
                    ]
                ]);
                expect(noteLengths(score)).toEqual([960, 2880, 960, 960]);
            });

            it('palm-mute', () => {
                const score = load([
                    [dashes('P.M.', 'start') + openStrings(2) + dashes('P.M.', 'stop') + openStrings(2)]
                ]);
                expect(notesOf(score).map(n => n.isPalmMute)).toEqual([true, true, false, false]);
            });

            it('musescore-brackets', () => {
                // MuseScore writes let ring and palm mute as words with brackets
                const bracket = (type: string, words: string) =>
                    direction(
                        `${words.length > 0 ? `<direction-type><words>${words}</words></direction-type>` : ''}` +
                            `<direction-type><bracket type="${type}" number="1" line-end="${type === 'start' ? 'none' : 'both'}" line-type="dashed"/></direction-type>`
                    );
                const score = load([
                    [bracket('start', 'let ring') + openStrings(2) + bracket('stop', '') + openStrings(2)],
                    [bracket('start', 'P.M.') + openStrings(3) + bracket('stop', '') + openStrings(1)]
                ]);
                expect(notesOf(score, 0).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score, 0, 0, 0, 1).map(n => n.isPalmMute)).toEqual([true, true, true, false]);
                expect(beatsOf(score)[0].text).toBeNull();
            });

            it('words-in-separate-direction', () => {
                // e.g. music21 writes the label as separate direction
                const score = load([
                    [
                        direction('<direction-type><words>let ring</words></direction-type>') +
                            dashes('', 'start') +
                            openStrings(2) +
                            dashes('', 'stop') +
                            openStrings(2)
                    ]
                ]);
                expect(notesOf(score).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(beatsOf(score)[0].text).toBeNull();
            });

            it('stop-without-words', () => {
                const score = load([
                    [dashes('LetRing', 'start') + openStrings(2) + dashes('', 'stop') + openStrings(2), openStrings(4)]
                ]);
                expect(notesOf(score, 0).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score, 1).map(n => n.isLetRing)).toEqual([false, false, false, false]);
            });

            it('across-bars-and-chords', () => {
                const score = load([
                    [
                        openStrings(2) +
                            dashes('LetRing', 'start') +
                            tab('E2', 6) +
                            tab('E2', 6) +
                            chordNote('A2', 5, 0),
                        openStrings(1) + dashes('', 'stop') + openStrings(3)
                    ]
                ]);
                expect(notesOf(score, 0).map(n => n.isLetRing)).toEqual([false, false, true, true, true]);
                expect(notesOf(score, 1).map(n => n.isLetRing)).toEqual([true, false, false, false]);
            });

            it('numbers', () => {
                // overlapping let ring (1) and palm mute (2), stopped without words
                const score = load([
                    [
                        dashes('LetRing', 'start', '1') +
                            tab('E2', 6) +
                            dashes('P.M.', 'start', '2') +
                            tab('E2', 6) +
                            dashes('', 'stop', '1') +
                            tab('E2', 6) +
                            dashes('', 'stop', '2') +
                            tab('E2', 6),
                        // one direction starting a new span with the number of the span it stops
                        dashes('LetRing', 'start', '1') +
                            openStrings(2) +
                            direction(
                                '<direction-type><words>P.M.</words></direction-type>' +
                                    '<direction-type><dashes type="start" number="1"/></direction-type>' +
                                    '<direction-type><dashes type="stop" number="1"/></direction-type>'
                            ) +
                            openStrings(2) +
                            dashes('', 'stop', '1')
                    ]
                ]);
                expect(notesOf(score, 0).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score, 0).map(n => n.isPalmMute)).toEqual([false, true, true, false]);
                expect(notesOf(score, 1).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score, 1).map(n => n.isPalmMute)).toEqual([false, false, true, true]);
            });

            it('words-identify-same-number', () => {
                // let ring and palm mute with the same number, identified by the words on their stops
                const score = load([
                    [
                        dashes('LetRing', 'start', '1') +
                            tab('E2', 6) +
                            dashes('P.M.', 'start', '1') +
                            tab('E2', 6) +
                            dashes('LetRing', 'stop', '1') +
                            tab('E2', 6) +
                            dashes('P.M.', 'stop', '1') +
                            tab('E2', 6)
                    ]
                ]);
                expect(notesOf(score).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score).map(n => n.isPalmMute)).toEqual([false, true, true, false]);
            });

            it('restart', () => {
                // a start without stop is ended by the next start
                const score = load([
                    [
                        dashes('LetRing', 'start') +
                            openStrings(2) +
                            dashes('LetRing', 'start') +
                            openStrings(1) +
                            dashes('', 'stop') +
                            openStrings(1)
                    ]
                ]);
                expect(notesOf(score).map(n => n.isLetRing)).toEqual([true, true, true, false]);
            });

            it('stop-and-start-without-open-span', () => {
                // a stray stop in the direction starting a span must not end the new span
                const score = load([
                    [
                        direction(
                            '<direction-type><dashes type="stop" number="1"/></direction-type>' +
                                '<direction-type><words>LetRing</words></direction-type>' +
                                '<direction-type><dashes type="start" number="1"/></direction-type>'
                        ) +
                            openStrings(2) +
                            dashes('', 'stop') +
                            openStrings(2)
                    ]
                ]);
                expect(notesOf(score).map(n => n.isLetRing)).toEqual([true, true, false, false]);
            });

            it('staves-and-voices', () => {
                // the stop (voice 1) appears in the document before the start (voice 2), staff 2 has no span
                const staff1: string = '<staff>1</staff>';
                const score = load(
                    [
                        [
                            note('C5', 1, 1) +
                                note('C5', 1, 1) +
                                dashes('', 'stop', '1', staff1) +
                                note('C5', 1, 1) +
                                note('C5', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                note('A4', 2, 1) +
                                dashes('LetRing', 'start', '1', staff1) +
                                quarters(3, 'A4', 2, 1) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(4, 'C3', 5, 2)
                        ]
                    ],
                    2
                );
                expect(notesOf(score, 0, 0, 0).map(n => n.isLetRing)).toEqual([false, true, false, false]);
                expect(notesOf(score, 0, 0, 1).map(n => n.isLetRing)).toEqual([false, true, false, false]);
                expect(notesOf(score, 0, 1, 0).map(n => n.isLetRing)).toEqual([false, false, false, false]);
            });

            it('direction-voice', () => {
                const score = load(
                    [
                        [
                            dashes('LetRing', 'start', '1', '<voice>2</voice><staff>1</staff>') +
                                quarters(4, 'C5', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(4, 'A4', 2, 1) +
                                dashes('', 'stop', '1', '<voice>2</voice><staff>1</staff>')
                        ]
                    ],
                    2
                );
                expect(notesOf(score, 0, 0, 0).map(n => n.isLetRing)).toEqual([false, false, false, false]);
                expect(notesOf(score, 0, 0, 1).map(n => n.isLetRing)).toEqual([true, true, true, true]);
            });

            it('same-staff-preference', () => {
                // exporters reuse numbers on different staves (e.g. MuseScore)
                const score = load(
                    [
                        [
                            dashes('LetRing', 'start', '1', '<staff>1</staff>') +
                                quarters(2, 'C5', 1, 1) +
                                dashes('', 'stop', '1', '<staff>1</staff>') +
                                quarters(2, 'C5', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                dashes('LetRing', 'start', '1', '<staff>2</staff>') +
                                quarters(3, 'C3', 5, 2) +
                                dashes('', 'stop', '1', '<staff>2</staff>') +
                                quarters(1, 'C3', 5, 2)
                        ]
                    ],
                    2
                );
                expect(notesOf(score, 0, 0).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score, 0, 1).map(n => n.isLetRing)).toEqual([true, true, true, false]);
            });

            it('stop-before-start-with-number-on-other-staff', () => {
                // staff 1 has an open span with the same number while the stop of the staff 2 span is read before its start
                const score = load(
                    [
                        [
                            dashes('LetRing', 'start', '1', '<staff>1</staff>') +
                                quarters(4, 'C5', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(2, 'C3', 5, 2) +
                                dashes('', 'stop', '1', '<staff>2</staff>') +
                                quarters(2, 'C3', 5, 2) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(1, 'E3', 6, 2) +
                                dashes('LetRing', 'start', '1', '<staff>2</staff>') +
                                quarters(3, 'E3', 6, 2) +
                                dashes('', 'stop', '1', '<staff>1</staff>')
                        ]
                    ],
                    2
                );
                expect(notesOf(score, 0, 0).map(n => n.isLetRing)).toEqual([true, true, true, true]);
                expect(notesOf(score, 0, 1, 0).map(n => n.isLetRing)).toEqual([false, true, false, false]);
                expect(notesOf(score, 0, 1, 1).map(n => n.isLetRing)).toEqual([false, true, false, false]);
            });

            it('offsets', () => {
                // the offset nudges the stop visually (e.g. Finale), the written voice is covered as written,
                // other voices are covered by the exact position
                const parts = (offset: number) => [
                    [
                        dashes('LetRing', 'start', '1', '<staff>1</staff>') +
                            note('C5', 1, 1, '', 4) +
                            note('C5', 1, 1, '', 4) +
                            dashes('', 'stop', '1', `<offset>${offset}</offset><staff>1</staff>`) +
                            note('C5', 1, 1, '', 4) +
                            note('C5', 1, 1, '', 4) +
                            '<backup><duration>16</duration></backup>' +
                            note('A4', 2, 1, '', 4) +
                            note('A4', 2, 1, '', 8, 'half') +
                            note('A4', 2, 1, '', 4)
                    ]
                ];
                let score = load(parts(3), 2, 4);
                expect(notesOf(score, 0, 0, 0).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score, 0, 0, 1).map(n => n.isLetRing)).toEqual([true, true, false]);

                score = load(parts(0), 2, 4);
                expect(notesOf(score, 0, 0, 1).map(n => n.isLetRing)).toEqual([true, false, false]);
            });

            it('overfull-bar', () => {
                // a stop at the end of a bar longer than its time signature stays in the bar
                const score = load([
                    [dashes('LetRing', 'start') + openStrings(5) + dashes('', 'stop'), openStrings(4)]
                ]);
                expect(notesOf(score, 0).map(n => n.isLetRing)).toEqual([true, true, true, true, true]);
                expect(notesOf(score, 1).map(n => n.isLetRing)).toEqual([false, false, false, false]);
            });

            it('unclosed-per-part', () => {
                const score = load([
                    [dashes('LetRing', 'start') + openStrings(4), openStrings(4)],
                    [openStrings(4), openStrings(4)]
                ]);
                expect(notesOf(score, 1).map(n => n.isLetRing)).toEqual([true, true, true, true]);
                expect(notesOf(score, 0, 0, 0, 1).map(n => n.isLetRing)).toEqual([false, false, false, false]);
            });

            it('continue-and-unknown-words', () => {
                const score = load([
                    [
                        dashes('LetRing', 'continue') +
                            openStrings(2) +
                            dashes('', 'stop') +
                            dashes('cresc.', 'start') +
                            openStrings(2) +
                            dashes('', 'stop')
                    ]
                ]);
                expect(notesOf(score).map(n => n.isLetRing)).toEqual([true, true, false, false]);
                expect(notesOf(score).map(n => n.isPalmMute)).toEqual([false, false, false, false]);
                // lines without meaning keep their label
                expect(beatsOf(score)[2].text).toBe('cresc.');
            });

            it('tied-let-ring', () => {
                const score = load([
                    [
                        tab('E2', 6, 0, '<tied type="let-ring"/>') +
                            // TuxGuitar writes the tie outside the notations
                            tab('A2', 5, 0).replace('<notations>', '<tied type="let-ring"/><notations>') +
                            openStrings(2)
                    ]
                ]);
                expect(notesOf(score).map(n => n.isLetRing)).toEqual([true, true, false, false]);
            });
        });

        describe('wedges', () => {
            it('staff-and-restart', () => {
                const wedge = (type: string, staff: number) =>
                    direction(`<direction-type><wedge type="${type}"/></direction-type>`, `<staff>${staff}</staff>`);
                const score = load(
                    [
                        [
                            wedge('crescendo', 1) +
                                quarters(2, 'C5', 1, 1) +
                                // a new wedge with the same number ends the previous one
                                wedge('diminuendo', 1) +
                                quarters(2, 'C5', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(4, 'C3', 5, 2) +
                                // the open wedge of staff 1 does not apply to staff 2
                                wedge('stop', 1)
                        ]
                    ],
                    2
                );
                expect(beatsOf(score, 0, 0).map(b => b.crescendo)).toEqual([
                    CrescendoType.Crescendo,
                    CrescendoType.Crescendo,
                    CrescendoType.Decrescendo,
                    CrescendoType.Decrescendo
                ]);
                expect(beatsOf(score, 0, 1).map(b => b.crescendo)).toEqual([
                    CrescendoType.None,
                    CrescendoType.None,
                    CrescendoType.None,
                    CrescendoType.None
                ]);
            });

            it('directions-in-order', () => {
                // directions separated by a forward are processed in their order
                const wedge = (type: string) => direction(`<direction-type><wedge type="${type}"/></direction-type>`);
                const score = load(
                    [
                        [
                            wedge('crescendo') +
                                quarters(2) +
                                wedge('diminuendo') +
                                '<forward><duration>1</duration></forward>' +
                                wedge('stop') +
                                quarters(1),
                            quarters(4)
                        ]
                    ],
                    2
                );
                expect(beatsOf(score, 0).map(b => b.crescendo)).toEqual([
                    CrescendoType.Crescendo,
                    CrescendoType.Crescendo,
                    CrescendoType.Decrescendo,
                    CrescendoType.None
                ]);
                expect(beatsOf(score, 1).map(b => b.crescendo)).toEqual([
                    CrescendoType.None,
                    CrescendoType.None,
                    CrescendoType.None,
                    CrescendoType.None
                ]);
            });

            it('written-voice', () => {
                // a wedge is shown on the voice of the following note, other directions do not change it
                const score = load(
                    [
                        [
                            direction('<direction-type><wedge type="crescendo"/></direction-type>') +
                                dashes('LetRing', 'start', '1', '<voice>2</voice>') +
                                quarters(4, 'C5', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(4, 'A4', 2, 1) +
                                direction('<direction-type><wedge type="stop"/></direction-type>')
                        ]
                    ],
                    2
                );
                expect(beatsOf(score, 0, 0, 0).map(b => b.crescendo)).toEqual([
                    CrescendoType.Crescendo,
                    CrescendoType.Crescendo,
                    CrescendoType.Crescendo,
                    CrescendoType.Crescendo
                ]);
                expect(beatsOf(score, 0, 0, 1).map(b => b.crescendo)).toEqual([
                    CrescendoType.None,
                    CrescendoType.None,
                    CrescendoType.None,
                    CrescendoType.None
                ]);
            });

            it('grace-notes', () => {
                // the wedge starts before and ends after the grace notes at the same position
                const grace = (pitch: string) =>
                    `<note><grace/><pitch><step>${pitch[0]}</step><octave>${pitch[1]}</octave></pitch><voice>1</voice><type>16th</type></note>`;
                const score = load(
                    [
                        [
                            direction('<direction-type><wedge type="diminuendo"/></direction-type>') +
                                grace('G5') +
                                grace('F5') +
                                direction('<direction-type><wedge type="stop"/></direction-type>') +
                                note('C5', 1, 0, '', 4, 'whole')
                        ]
                    ],
                    2
                );
                expect(beatsOf(score).map(b => b.crescendo)).toEqual([
                    CrescendoType.Decrescendo,
                    CrescendoType.Decrescendo,
                    CrescendoType.None
                ]);
            });
        });

        describe('octave-shifts', () => {
            const shift = (type: string, size: number, number: string, extra: string) =>
                direction(
                    `<direction-type><octave-shift type="${type}" size="${size}" number="${number}"/></direction-type>`,
                    extra
                );

            it('staff-and-numbers', () => {
                const score = load(
                    [
                        [
                            shift('down', 8, '1', '<staff>1</staff>') +
                                quarters(1, 'C6', 1, 1) +
                                // unsupported sizes are paired but have no effect
                                shift('down', 22, '2', '<staff>1</staff>') +
                                quarters(1, 'C6', 1, 1) +
                                shift('stop', 22, '2', '<staff>1</staff>') +
                                quarters(1, 'C6', 1, 1) +
                                shift('stop', 8, '1', '<staff>1</staff>') +
                                quarters(1, 'C6', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(4, 'C3', 5, 2)
                        ]
                    ],
                    2
                );
                expect(beatsOf(score, 0, 0).map(b => b.ottava)).toEqual([
                    Ottavia._8va,
                    Ottavia._8va,
                    Ottavia._8va,
                    Ottavia.Regular
                ]);
                expect(beatsOf(score, 0, 1).map(b => b.ottava)).toEqual([
                    Ottavia.Regular,
                    Ottavia.Regular,
                    Ottavia.Regular,
                    Ottavia.Regular
                ]);
            });

            it('stop-conventions', () => {
                // Finale writes the stop before the last shifted note, MuseScore after it (see MusicXML test suite 33da/33db)
                const shifted = (software: string) =>
                    load(
                        [
                            [
                                shift('down', 8, '1', '') +
                                    note('C6', 1, 0, '', 4) +
                                    note('C6', 1, 0, '', 4) +
                                    shift('stop', 8, '1', '<offset>1</offset>') +
                                    note('C6', 1, 0, '', 4) +
                                    note('C6', 1, 0, '', 4)
                            ]
                        ],
                        2,
                        4,
                        software
                    );
                expect(beatsOf(shifted('Finale 2011 for Windows')).map(b => b.ottava)).toEqual([
                    Ottavia._8va,
                    Ottavia._8va,
                    Ottavia._8va,
                    Ottavia.Regular
                ]);
                expect(beatsOf(shifted('MuseScore 4.3.0')).map(b => b.ottava)).toEqual([
                    Ottavia._8va,
                    Ottavia._8va,
                    Ottavia.Regular,
                    Ottavia.Regular
                ]);
            });
        });

        describe('pedals', () => {
            const pedal = (type: string, extra: string) =>
                direction(`<direction-type><pedal type="${type}" line="yes"/></direction-type>`, extra);

            it('across-bars', () => {
                const score = load(
                    [[pedal('start', '') + quarters(4), quarters(2) + pedal('stop', '') + quarters(2)]],
                    2
                );
                const bars = score.tracks[0].staves[0].bars;
                expect(bars[0].sustainPedals.map(p => p.pedalType)).toEqual([SustainPedalMarkerType.Down]);
                expect(bars[1].sustainPedals.map(p => p.pedalType)).toEqual([SustainPedalMarkerType.Up]);
                expect(bars[1].sustainPedals[0].ratioPosition).toBe(0.5);
            });

            it('change', () => {
                // a change in a bar after a held bar lifts and retakes the pedal
                const score = load(
                    [
                        [
                            pedal('start', '') + quarters(4),
                            quarters(2) + pedal('change', '') + quarters(2) + pedal('stop', '')
                        ]
                    ],
                    2
                );
                const bar = score.tracks[0].staves[0].bars[1];
                expect(bar.sustainPedals.map(p => p.pedalType)).toEqual([
                    SustainPedalMarkerType.Up,
                    SustainPedalMarkerType.Down,
                    SustainPedalMarkerType.Up
                ]);
                expect(bar.sustainPedals.map(p => p.ratioPosition)).toEqual([0.5, 0.5, 1]);
            });

            it('overfull-bar', () => {
                const score = load([[pedal('start', '') + quarters(5) + pedal('stop', '')]], 2);
                expect(score.tracks[0].staves[0].bars[0].sustainPedals.map(p => p.ratioPosition)).toEqual([0, 1]);
            });

            it('offset', () => {
                // the offset is given in divisions
                const score = load(
                    [
                        [
                            quarters(1) +
                                pedal('start', '<offset>1</offset>') +
                                quarters(1) +
                                pedal('stop', '') +
                                quarters(2)
                        ]
                    ],
                    2
                );
                expect(score.tracks[0].staves[0].bars[0].sustainPedals.map(p => p.ratioPosition)).toEqual([0.5, 0.5]);
            });
        });

        describe('wavy-lines', () => {
            it('trill-line', () => {
                const score = load(
                    [
                        [
                            note(
                                'C5',
                                1,
                                1,
                                '<ornaments><trill-mark trill-step="half"/><wavy-line type="start"/></ornaments>'
                            ) +
                                note('C5', 1, 1) +
                                note('C5', 1, 1, '<ornaments><wavy-line type="stop"/></ornaments>') +
                                note('C5', 1, 1) +
                                '<backup><duration>4</duration></backup>' +
                                quarters(4, 'A4', 2, 1)
                        ]
                    ],
                    2
                );
                expect(notesOf(score, 0, 0, 0).map(n => n.trillValue)).toEqual([73, 73, 73, -1]);
                expect(notesOf(score, 0, 0, 1).map(n => n.isTrill)).toEqual([false, false, false, false]);
            });

            it('trill-on-tablature', () => {
                const score = load([[tab('A2', 6, 5, '<ornaments><trill-mark/></ornaments>') + openStrings(3)]]);
                const trill = notesOf(score)[0];
                expect(trill.trillValue).toBe(47);
                expect(trill.trillFret).toBe(7);
            });

            it('vibrato-line', () => {
                const score = load(
                    [
                        [
                            note('C5', 1, 0, '<ornaments><wavy-line type="start"/></ornaments>') +
                                note('C5') +
                                note('C5', 1, 0, '<ornaments><wavy-line type="stop"/></ornaments>') +
                                quarters(1, 'C5')
                        ]
                    ],
                    2
                );
                expect(notesOf(score).map(n => n.vibrato)).toEqual([
                    VibratoType.Slight,
                    VibratoType.Slight,
                    VibratoType.Slight,
                    VibratoType.None
                ]);
            });
        });

        describe('measure-styles', () => {
            const style = (content: string) => `<attributes><measure-style>${content}</measure-style></attributes>`;

            it('slash-per-part', () => {
                const score = load(
                    [
                        [style('<slash type="start"/>') + quarters(4), quarters(4)],
                        [quarters(4), quarters(4)]
                    ],
                    2
                );
                expect(beatsOf(score, 1).map(b => b.slashed)).toEqual([true, true, true, true]);
                expect(beatsOf(score, 0, 0, 0, 1).map(b => b.slashed)).toEqual([false, false, false, false]);
            });

            it('measure-repeat', () => {
                const score = load(
                    [
                        [
                            quarters(4),
                            style('<measure-repeat type="start" slashes="1"/>') + quarters(4),
                            quarters(4),
                            style('<measure-repeat type="stop"/>') + quarters(4)
                        ]
                    ],
                    2
                );
                expect(score.tracks[0].staves[0].bars.map(b => b.simileMark)).toEqual([
                    SimileMark.None,
                    SimileMark.Simple,
                    SimileMark.Simple,
                    SimileMark.None
                ]);
            });
        });

        it('endings-of-all-parts', () => {
            const start = '<barline location="left"><ending number="1" type="start"/></barline>';
            const stop =
                '<barline location="right"><ending number="1" type="stop"/><repeat direction="backward"/></barline>';
            // a later part without endings keeps the endings of the first part
            const score = load(
                [
                    [quarters(4), start + quarters(4) + stop, quarters(4)],
                    [quarters(4), quarters(4), quarters(4)]
                ],
                2
            );
            expect(score.masterBars.map(m => m.alternateEndings)).toEqual([0, 1, 0]);
        });

        describe('note-links', () => {
            it('ties', () => {
                const score = load(
                    [
                        [
                            // a tie without end is tied to the next note
                            note('C5', 1, 0, '<tied type="start"/>') +
                                note('C5') +
                                // a stop of a note which is not the next one is ignored
                                note('C5', 1, 0, '<tied type="stop"/><tied type="start"/>') +
                                note('C5', 1, 0, '<tied type="stop"/>')
                        ]
                    ],
                    2
                );
                const notes = notesOf(score);
                expect(notes[1].tieOrigin).toBe(notes[0]);
                expect(notes[2].isTieDestination).toBe(false);
                expect(notes[3].tieOrigin).toBe(notes[2]);
            });

            it('ties-on-unisons', () => {
                const score = load([
                    [
                        tab('E4', 1, 0, '<tied type="start"/>') +
                            chordNote('E4', 2, 5, '<tied type="start"/>') +
                            tab('E4', 1, 0, '<tied type="stop"/>') +
                            chordNote('E4', 2, 5, '<tied type="stop"/>') +
                            openStrings(2)
                    ]
                ]);
                const notes = notesOf(score);
                expect(notes[2].tieOrigin).toBe(notes[0]);
                expect(notes[3].tieOrigin).toBe(notes[1]);
            });

            it('slides-and-glissandos', () => {
                const score = load(
                    [
                        [
                            note(
                                'C5',
                                1,
                                0,
                                '<glissando type="start" number="1"/><slide type="start" number="1"/>',
                                1
                            ) +
                                note('E5', 1, 0, '<slide type="stop" number="1"/>') +
                                note('G5', 1, 0, '<glissando type="stop" number="1"/>') +
                                // a stray stop does not link to a previous start
                                note('C5', 1, 0, '<slide type="stop" number="1"/>')
                        ]
                    ],
                    2
                );
                const notes = notesOf(score);
                expect(notes[1].slideOrigin).toBe(notes[0]);
                expect(notes[2].slideOrigin).toBe(notes[0]);
                expect(notes[3].slideOrigin).toBeNull();
            });

            it('slur-on-hammer-on', () => {
                // the hammer-on is drawn as slur, the slur written along is not added
                const score = load([
                    [
                        tab(
                            'A2',
                            6,
                            5,
                            '<slur type="start"/><technical><hammer-on type="start">H</hammer-on></technical>'
                        ) +
                            tab('B2', 6, 7, '<slur type="stop"/><technical><hammer-on type="stop"/></technical>') +
                            openStrings(2)
                    ]
                ]);
                const notes = notesOf(score);
                expect(notes[0].isHammerPullOrigin).toBe(true);
                expect(notes[1].isSlurDestination).toBe(false);
            });
        });

        it('tempo-offset', () => {
            // the offset is given in divisions and only affects the sound if specified
            const tempoPosition = (sound: string) => {
                const score = load(
                    [
                        [
                            quarters(1) +
                                direction(
                                    '<direction-type><words>Andante</words></direction-type>',
                                    `<offset${sound}>1</offset><sound tempo="90"/>`
                                ) +
                                quarters(3)
                        ]
                    ],
                    2
                );
                return score.masterBars[0].tempoAutomations.filter(a => a.value === 90)[0].ratioPosition;
            };
            expect(tempoPosition('')).toBe(0.25);
            expect(tempoPosition(' sound="yes"')).toBe(0.5);
        });
    });
});
