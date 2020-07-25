import { Score } from '@src/model/Score';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';

describe('Gp4ImporterTest', () => {
    it('score-info', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/score-info.gp4');
        let score: Score = reader.readScore();
        expect(score.title).toEqual('Title');
        expect(score.subTitle).toEqual('Subtitle');
        expect(score.artist).toEqual('Artist');
        expect(score.album).toEqual('Album');
        expect(score.words).toEqual('Music'); // no words in gp4

        expect(score.music).toEqual('Music');
        expect(score.copyright).toEqual('Copyright');
        expect(score.tab).toEqual('Tab');
        expect(score.instructions).toEqual('Instructions');
        expect(score.notices).toEqual('Notice1\r\nNotice2');
        expect(score.masterBars.length).toEqual(5);
        expect(score.tracks.length).toEqual(1);
        expect(score.tracks[0].name).toEqual('Track 1');
    });

    it('notes', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/notes.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/time-signatures.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/dead.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('grace', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/grace.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkGrace(score);
    });

    it('accentuations', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/accentuations.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkAccentuations(score, false);
    });

    it('harmonics', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/harmonics.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });

    it('hammer', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/hammer.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bend', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/bends.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkBend(score);
    });

    it('tremolo', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/tremolo.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTremolo(score);
    });

    it('slides', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/slides.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkSlides(score);
    });

    it('vibrato', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/vibrato.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, true);
    });

    it('trills', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/trills.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTrills(score);
    });

    it('otherEffects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/other-effects.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkOtherEffects(score, false);
    });

    it('fingering', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/fingering.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkFingering(score);
    });

    it('stroke', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/strokes.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkStroke(score);
    });

    it('tuplets', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/tuplets.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/ranges.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkRanges(score);
    });

    it('effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/effects.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('strings', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/strings.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });

    it('colors', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/colors.gp4');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkColors(score);
    });
});
