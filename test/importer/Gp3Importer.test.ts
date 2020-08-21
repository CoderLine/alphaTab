import { AutomationType } from '@src/model/Automation';
import { BrushType } from '@src/model/BrushType';
import { DynamicValue } from '@src/model/DynamicValue';
import { Score } from '@src/model/Score';
import { SlideOutType } from '@src/model/SlideOutType';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { HarmonicType } from '@src/model/HarmonicType';

describe('Gp3ImporterTest', () => {
    it('score-info', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/score-info.gp3');
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
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/notes.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/time-signatures.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/dead.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('accentuations', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/accentuations.gp3');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].isGhost).toBe(true);
        // it seems accentuation is handled as Forte Fortissimo
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].dynamics).toEqual(DynamicValue.FFF);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].isLetRing).toBe(true);
    });

    it('harmonics', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/harmonics.gp3');
        let score: Score = reader.readScore();    
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].harmonicType).toBe(HarmonicType.Natural);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].harmonicType).toBe(HarmonicType.Artificial);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].harmonicType).toBe(HarmonicType.Artificial);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].harmonicType).toBe(HarmonicType.Artificial);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[4].notes[0].harmonicType).toBe(HarmonicType.Artificial);
    });

    it('hammer', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/hammer.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bends', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/bends.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkBend(score);
    });

    it('slides', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/slides.gp3');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getNoteOnString(5)!.slideOutType).toEqual(
            SlideOutType.Shift
        );
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].getNoteOnString(2)!.slideOutType).toEqual(
            SlideOutType.Shift
        );
    });

    it('vibrato', async () => {
        // TODO: Check why this vibrato is not recognized
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/vibrato.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, false);
    });

    it('other-effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/other-effects.gp3');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].tap).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].slap).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].pop).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].fadeIn).toBe(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].hasChord).toBe(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].chord!.name).toEqual('C');
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].text).toEqual('Text');
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo)).toBeTruthy();
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Tempo)!.value).toEqual(
            120
        );
        expect(
            score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)
        ).toBeTruthy();
        expect(
            score.tracks[0].staves[0].bars[4].voices[0].beats[0].getAutomation(AutomationType.Instrument)!.value
        ).toEqual(25);
    });

    it('strokes', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/strokes.gp3');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].brushType).toEqual(BrushType.BrushDown);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].brushType).toEqual(BrushType.BrushUp);
    });

    it('tuplets', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/tuplets.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/ranges.gp3');
        let score: Score = reader.readScore();
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].notes[0].isLetRing).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].notes[0].isLetRing).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].notes[0].isLetRing).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].notes[0].isLetRing).toBe(true);
    });

    it('effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/effects.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('strings', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro3/strings.gp3');
        let score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });
});
