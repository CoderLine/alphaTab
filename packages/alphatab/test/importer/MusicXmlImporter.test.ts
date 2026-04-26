import { describe, expect, it } from 'vitest';
import { BendType } from '@coderline/alphatab/model/BendType';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { Score } from '@coderline/alphatab/model/Score';
import { MusicXmlImporterTestHelper } from 'test/importer/MusicXmlImporterTestHelper';

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

        expect(score.tempo).toBe(60);
        expect(score.masterBars[0].tempoAutomations.length).toBe(1);
        expect(score.masterBars[0].tempoAutomations[0]?.value).toBe(60);
        expect(score.masterBars[1].tempoAutomations.length).toBe(1);
        expect(score.masterBars[1].tempoAutomations[0].value).toBe(60);
    });
    it('tie-destination', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/tie-destination.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isTieOrigin).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].tieDestination).toBeTruthy();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isTieDestination).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].tieOrigin).toBeTruthy();

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
});
