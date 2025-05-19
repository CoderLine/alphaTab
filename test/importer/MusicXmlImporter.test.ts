import { MusicXmlImporterTestHelper } from '@test/importer/MusicXmlImporterTestHelper';
import type { Score } from '@src/model/Score';
import { BendType } from '@src/model/BendType';
import { expect } from 'chai';
import { JsonConverter } from '@src/model/JsonConverter';

describe('MusicXmlImporterTests', () => {
    it('track-volume', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.volume).to.be.equal(16);
        expect(score.tracks[1].playbackInfo.volume).to.be.equal(12);
        expect(score.tracks[2].playbackInfo.volume).to.be.equal(8);
        expect(score.tracks[3].playbackInfo.volume).to.be.equal(4);
        expect(score.tracks[4].playbackInfo.volume).to.be.equal(0);
    });

    it('track-balance', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.balance).to.be.equal(0);
        expect(score.tracks[1].playbackInfo.balance).to.be.equal(4);
        expect(score.tracks[2].playbackInfo.balance).to.be.equal(8);
        expect(score.tracks[3].playbackInfo.balance).to.be.equal(12);
        expect(score.tracks[4].playbackInfo.balance).to.be.equal(16);
    });

    it('full-bar-rest', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/full-bar-rest.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isFullBarRest).to.be.true;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].isFullBarRest).to.be.true;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].isFullBarRest).to.be.true;
    });

    it('first-bar-tempo', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/first-bar-tempo.musicxml'
        );

        expect(score.tempo).to.be.equal(60);
        expect(score.masterBars[0].tempoAutomations).to.have.length(1);
        expect(score.masterBars[0].tempoAutomations[0]?.value).to.be.equal(60);
        expect(score.masterBars[1].tempoAutomations).to.have.length(1);
        expect(score.masterBars[1].tempoAutomations[0].value).to.be.equal(60);
    });
    it('tie-destination', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/tie-destination.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isTieOrigin).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].tieDestination).to.be.ok;

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isTieDestination).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].tieOrigin).to.be.ok;

        score = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score));

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].isTieOrigin).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].tieDestination).to.be.ok;

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].isTieDestination).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].tieOrigin).to.be.ok;
    });
    it('chord-diagram', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/chord-diagram.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord).to.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).to.equal('C');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[0]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[1]).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[2]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[3]).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[4]).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[5]).to.equal(-1);

        score = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score));

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord).to.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).to.equal('C');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[0]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[1]).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[2]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[3]).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[4]).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[5]).to.equal(-1);
    });
    it('compressed', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml3/compressed.mxl');

        expect(score.title).to.equal('Title');
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
    });
    it('bend', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml4/bends.xml');
        let note = score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.equal(60);
        expect(note.bendPoints![1].value).to.equal(2);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.Prebend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(4);
        expect(note.bendPoints![1].offset).to.equal(60);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0];
        expect(note.bendType).to.equal(BendType.BendRelease);
        expect(note.bendPoints!.length).to.equal(4);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.equal(30);
        expect(note.bendPoints![1].value).to.equal(4);
        expect(note.bendPoints![2].offset).to.equal(30);
        expect(note.bendPoints![2].value).to.equal(4);
        expect(note.bendPoints![3].offset).to.equal(60);
        expect(note.bendPoints![3].value).to.equal(0);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0];
        expect(note.bendType).to.equal(BendType.PrebendRelease);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(2);
        expect(note.bendPoints![1].offset).to.equal(60);
        expect(note.bendPoints![1].value).to.equal(0);

        note = score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0];
        expect(note.bendType).to.equal(BendType.PrebendBend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(2);
        expect(note.bendPoints![1].offset).to.equal(60);
        expect(note.bendPoints![1].value).to.equal(4);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0];
        expect(note.bendType).to.equal(BendType.BendRelease);
        expect(note.bendPoints!.length).to.equal(4);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.equal(30);
        expect(note.bendPoints![1].value).to.equal(2);
        expect(note.bendPoints![2].offset).to.equal(30);
        expect(note.bendPoints![2].value).to.equal(2);
        expect(note.bendPoints![3].offset).to.equal(60);
        expect(note.bendPoints![3].value).to.equal(0);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[1];
        expect(note.bendType).to.equal(BendType.BendRelease);
        expect(note.bendPoints!.length).to.equal(4);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.equal(30);
        expect(note.bendPoints![1].value).to.equal(2);
        expect(note.bendPoints![2].offset).to.equal(30);
        expect(note.bendPoints![2].value).to.equal(2);
        expect(note.bendPoints![3].offset).to.equal(60);
        expect(note.bendPoints![3].value).to.equal(0);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[2];
        expect(note.bendType).to.equal(BendType.None);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0];
        expect(note.bendType).to.equal(BendType.Custom);
        expect(note.bendPoints!.length).to.equal(12);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(1);
        expect(note.bendPoints![1].offset).to.equal(10);
        expect(note.bendPoints![1].value).to.equal(1);
        expect(note.bendPoints![2].offset).to.equal(10);
        expect(note.bendPoints![2].value).to.equal(1);
        expect(note.bendPoints![3].offset).to.equal(20);
        expect(note.bendPoints![3].value).to.equal(3);
        expect(note.bendPoints![4].offset).to.equal(20);
        expect(note.bendPoints![4].value).to.equal(3);
        expect(note.bendPoints![5].offset).to.equal(30);
        expect(note.bendPoints![5].value).to.equal(4);
        expect(note.bendPoints![6].offset).to.equal(30);
        expect(note.bendPoints![6].value).to.equal(4);
        expect(note.bendPoints![7].offset).to.equal(40);
        expect(note.bendPoints![7].value).to.equal(8);
        expect(note.bendPoints![8].offset).to.equal(40);
        expect(note.bendPoints![8].value).to.equal(8);
        expect(note.bendPoints![9].offset).to.equal(50);
        expect(note.bendPoints![9].value).to.equal(4);
        expect(note.bendPoints![10].offset).to.equal(50);
        expect(note.bendPoints![10].value).to.equal(4);
        expect(note.bendPoints![11].offset).to.equal(60);
        expect(note.bendPoints![11].value).to.equal(8);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0];
        expect(note.bendType).to.equal(BendType.PrebendRelease);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(8);
        expect(note.bendPoints![1].offset).to.equal(60);
        expect(note.bendPoints![1].value).to.equal(0);

        note = score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0];
        expect(note.bendType).to.equal(BendType.Bend);
        expect(note.bendPoints!.length).to.equal(2);
        expect(note.bendPoints![0].offset).to.equal(0);
        expect(note.bendPoints![0].value).to.equal(0);
        expect(note.bendPoints![1].offset).to.equal(30);
        expect(note.bendPoints![1].value).to.equal(2);
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
});
