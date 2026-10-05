import { describe, expect, it } from 'vitest';
import { BendType } from '@coderline/alphatab/model/BendType';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Score } from '@coderline/alphatab/model/Score';
import { MusicXmlImporterTestHelper } from 'test/importer/MusicXmlImporterTestHelper';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { MidiFileGenerator } from '@coderline/alphatab/midi/MidiFileGenerator';
import { FlatMidiEventGenerator, FlatTempoEvent } from 'test/audio/FlatMidiEventGenerator';

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
});
