import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import type { Score } from '@coderline/alphatab/model/Score';
import { GpImporterTestHelper } from 'test/importer/GpImporterTestHelper';
import { describe, expect, it } from 'vitest';
describe('Gp4ImporterTest', () => {
    it('score-info', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/score-info.gp4');
        const score: Score = reader.readScore();
        expect(score.title).toBe('Title');
        expect(score.subTitle).toBe('Subtitle');
        expect(score.artist).toBe('Artist');
        expect(score.album).toBe('Album');
        expect(score.words).toBe('Music'); // no words in gp4

        expect(score.music).toBe('Music');
        expect(score.copyright).toBe('Copyright');
        expect(score.tab).toBe('Tab');
        expect(score.instructions).toBe('Instructions');
        expect(score.notices).toBe('Notice1\r\nNotice2');
        expect(score.masterBars.length).toBe(5);
        expect(score.tracks.length).toBe(1);
        expect(score.tracks[0].name).toBe('Track 1');
    });

    it('notes', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/notes.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/time-signatures.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/dead.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('grace', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/grace.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkGrace(score);
    });

    it('accentuations', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/accentuations.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkAccentuations(score, false);
    });

    it('harmonics', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/harmonics.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });

    it('hammer', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/hammer.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bend', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/bends.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkBend(score);
    });

    it('tremolo', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/tremolo.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTremolo(score);
    });

    it('slides', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/slides.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkSlides(score);
    });

    it('vibrato', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/vibrato.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, true);
    });

    it('trills', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/trills.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTrills(score);
    });

    it('otherEffects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/other-effects.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkOtherEffects(score, false);
    });

    it('fingering', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/fingering.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkFingering(score);
    });

    it('stroke', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/strokes.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStroke(score);
    });

    it('tuplets', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/tuplets.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/ranges.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkRanges(score);
    });

    it('effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/effects.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('strings', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/strings.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });

    it('colors', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/colors.gp4');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkColors(score);
    });

    it('harmonic-types', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro4/harmonic-types.gp4');
        const score = reader.readScore();
        const b0 = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        expect(b0.notes[0].harmonicType).toBe(HarmonicType.Natural);
        expect(b0.notes[0].harmonicValue).toBe(12);

        const b1 = score.tracks[0].staves[0].bars[0].voices[0].beats[1];
        expect(b1.notes[0].harmonicType).toBe(HarmonicType.Artificial);
        expect(b1.notes[0].harmonicValue).toBe(5);

        const b2 = score.tracks[0].staves[0].bars[0].voices[0].beats[2];
        expect(b2.notes[0].harmonicType).toBe(HarmonicType.Artificial);
        expect(b2.notes[0].harmonicValue).toBe(7);

        const b3 = score.tracks[0].staves[0].bars[0].voices[0].beats[3];
        expect(b3.notes[0].harmonicType).toBe(HarmonicType.Artificial);
        expect(b3.notes[0].harmonicValue).toBe(12);

        const b4 = score.tracks[0].staves[0].bars[1].voices[0].beats[0];
        expect(b4.notes[0].harmonicType).toBe(HarmonicType.Tap);
        expect(b4.notes[0].harmonicValue).toBe(12);

        const b5 = score.tracks[0].staves[0].bars[1].voices[0].beats[1];
        expect(b5.notes[0].harmonicType).toBe(HarmonicType.Pinch);
        expect(b5.notes[0].harmonicValue).toBe(12);

        const b6 = score.tracks[0].staves[0].bars[1].voices[0].beats[2];
        expect(b6.notes[0].harmonicType).toBe(HarmonicType.Semi);
        expect(b6.notes[0].harmonicValue).toBe(12);
    });
});
