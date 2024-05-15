import { MusicXmlImporterTestHelper } from '@test/importer/MusicXmlImporterTestHelper';
import { Score } from '@src/model/Score';
import { JsonConverter } from '@src/model';
import { expect } from 'chai';

describe('MusicXmlImporterTests', () => {
    it('track-volume', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.volume).to.be.equal(16);
        expect(score.tracks[1].playbackInfo.volume).to.be.equal(12);
        expect(score.tracks[2].playbackInfo.volume).to.be.equal(8);
        expect(score.tracks[3].playbackInfo.volume).to.be.equal(4);
        expect(score.tracks[4].playbackInfo.volume).to.be.equal(0);
    });

    it('track-balance', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.balance).to.be.equal(0);
        expect(score.tracks[1].playbackInfo.balance).to.be.equal(4);
        expect(score.tracks[2].playbackInfo.balance).to.be.equal(8);
        expect(score.tracks[3].playbackInfo.balance).to.be.equal(12);
        expect(score.tracks[4].playbackInfo.balance).to.be.equal(16);
    });

    it('full-bar-rest', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
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
        expect(score.masterBars[0].tempoAutomation).to.be.ok;
        expect(score.masterBars[0].tempoAutomation?.value).to.be.equal(60);
        expect(score.masterBars[1].tempoAutomation).to.be.ok;
        expect(score.masterBars[1].tempoAutomation?.value).to.be.equal(60);
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
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).to.equal("C");
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[0]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[1]).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[2]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[3]).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[4]).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[5]).to.equal(-1);


        score = JsonConverter.jsObjectToScore(JsonConverter.scoreToJsObject(score));

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord).to.be.ok;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.name).to.equal("C");
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[0]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[1]).to.equal(1);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[2]).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[3]).to.equal(2);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[4]).to.equal(3);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].chord!.strings[5]).to.equal(-1);
    });

    it('compressed', async () => {
        const score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/compressed.mxl'
        );

        expect(score.title).to.equal("Title");
        expect(score.tracks.length).to.equal(1);
        expect(score.masterBars.length).to.equal(1);
    });
});
