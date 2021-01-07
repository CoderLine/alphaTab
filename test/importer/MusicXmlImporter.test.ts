import { MusicXmlImporterTestHelper } from '@test/importer/MusicXmlImporterTestHelper';
import { Score } from '@src/model/Score';

describe('MusicXmlImporterTests', () => {
    it('track-volume', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.volume).toBe(16);
        expect(score.tracks[1].playbackInfo.volume).toBe(12);
        expect(score.tracks[2].playbackInfo.volume).toBe(8);
        expect(score.tracks[3].playbackInfo.volume).toBe(4);
        expect(score.tracks[4].playbackInfo.volume).toBe(0);
    });

    it('track-balance', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/track-volume-balance.musicxml'
        );

        expect(score.tracks[0].playbackInfo.balance).toBe(0);
        expect(score.tracks[1].playbackInfo.balance).toBe(4);
        expect(score.tracks[2].playbackInfo.balance).toBe(8);
        expect(score.tracks[3].playbackInfo.balance).toBe(12);
        expect(score.tracks[4].playbackInfo.balance).toBe(16);
    });

    
    it('full-bar-rest', async () => {
        let score: Score = await MusicXmlImporterTestHelper.testReferenceFile(
            'test-data/musicxml3/full-bar-rest.musicxml'
        );

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].isFullBarRest).toBeTrue();
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].isFullBarRest).toBeTrue();
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].isFullBarRest).toBeTrue();
    });
});
