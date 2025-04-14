import { AutomationType } from '@src/model/Automation';
import { BrushType } from '@src/model/BrushType';
import { DynamicValue } from '@src/model/DynamicValue';
import type { Score } from '@src/model/Score';
import { SlideOutType } from '@src/model/SlideOutType';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { HarmonicType } from '@src/model/HarmonicType';
import { expect } from 'chai';

describe('Gp3ImporterTest', () => {
    it('score-info', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/score-info.gp3');
        const score: Score = reader.readScore();
        expect(score.title).to.equal('Title');
        expect(score.subTitle).to.equal('Subtitle');
        expect(score.artist).to.equal('Artist');
        expect(score.album).to.equal('Album');
        expect(score.words).to.equal('Music'); // no words in gp4

        expect(score.music).to.equal('Music');
        expect(score.copyright).to.equal('Copyright');
        expect(score.tab).to.equal('Tab');
        expect(score.instructions).to.equal('Instructions');
        expect(score.notices).to.equal('Notice1\r\nNotice2');
        expect(score.masterBars.length).to.equal(5);
        expect(score.tracks.length).to.equal(1);
        expect(score.tracks[0].name).to.equal('Track 1');
    });

    it('notes', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/notes.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/time-signatures.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/dead.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('accentuations', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/accentuations.gp3');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isGhost).to.be.equal(true);
        // it seems accentuation is handled as Forte Fortissimo
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].dynamics).to.equal(DynamicValue.FFF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLetRing).to.be.equal(true);
    });

    it('harmonics', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/harmonics.gp3');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).to.be.equal(
            HarmonicType.Natural
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).to.be.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).to.be.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).to.be.equal(
            HarmonicType.Artificial
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).to.be.equal(
            HarmonicType.Artificial
        );
    });

    it('hammer', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/hammer.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bends', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/bends.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkBend(score);
    });

    it('slides', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/slides.gp3');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.slideOutType).to.equal(
            SlideOutType.Shift
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].getNoteOnString(2)!.slideOutType).to.equal(
            SlideOutType.Shift
        );
    });

    it('vibrato', async () => {
        // TODO: Check why this vibrato is not recognized
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/vibrato.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, false);
    });

    it('other-effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/other-effects.gp3');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].slap).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].pop).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].fadeIn).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].hasChord).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].chord!.name).to.equal('C');
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].text).to.equal('Text');
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo)).to.be.ok;
        expect(
            score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo)!.value
        ).to.equal(120);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)).to.be.ok;
        expect(
            score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)!.value
        ).to.equal(25);
    });

    it('strokes', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/strokes.gp3');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).to.equal(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).to.equal(BrushType.BrushUp);
    });

    it('tuplets', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/tuplets.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/ranges.gp3');
        const score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isLetRing).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].isLetRing).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].isLetRing).to.be.equal(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].isLetRing).to.be.equal(true);
    });

    it('effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/effects.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('strings', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/strings.gp3');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });
});
