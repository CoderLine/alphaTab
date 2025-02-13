import { Gp7To8Importer } from '@src/importer/Gp7To8Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { BeatBeamingMode } from '@src/model/Beat';
import { Direction } from '@src/model/Direction';
import { BracketExtendMode } from '@src/model/RenderStylesheet';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { Settings } from '@src/Settings';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';

describe('Gp8ImporterTest', () => {
    async function prepareImporterWithFile(name: string): Promise<Gp7To8Importer> {
        const data = await TestPlatform.loadFile('test-data/' + name);
        return prepareImporterWithBytes(data);
    }

    function prepareImporterWithBytes(buffer: Uint8Array) {
        let readerBase: Gp7To8Importer = new Gp7To8Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    }

    it('layout-configuration', async () => {
        const track1 = (await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-1.gp')).readScore();
        const track2 = (await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-2.gp')).readScore();
        const trackAll = (
            await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-all.gp')
        ).readScore();
        const track1And3 = (
            await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-1-3.gp')
        ).readScore();

        GpImporterTestHelper.checkMultiTrackLayoutConfiguration(track1, track2, trackAll, track1And3);
    });

    it('slash', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/slash.gp')).readScore();
        GpImporterTestHelper.checkSlash(score);
    });

    it('beat-tempo-change', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/beat-tempo-change.gp')).readScore();

        expect(score.masterBars[0].tempoAutomations).to.have.length(2);
        expect(score.masterBars[0].tempoAutomations[0].value).to.have.equal(120);
        expect(score.masterBars[0].tempoAutomations[0].ratioPosition).to.equal(0);
        expect(score.masterBars[0].tempoAutomations[1].value).to.equal(60);
        expect(score.masterBars[0].tempoAutomations[1].ratioPosition).to.equal(0.5);

        expect(score.masterBars[1].tempoAutomations).to.have.length(2);
        expect(score.masterBars[1].tempoAutomations[0].value).to.equal(100);
        expect(score.masterBars[1].tempoAutomations[0].ratioPosition).to.equal(0);
        expect(score.masterBars[1].tempoAutomations[1].value).to.equal(120);
        expect(score.masterBars[1].tempoAutomations[1].ratioPosition).to.equal(0.6375);
    });

    it('bracket-braces', async () => {
        const noBrackets = (await prepareImporterWithFile('visual-tests/layout/brackets-braces-none.gp')).readScore();
        expect(noBrackets.stylesheet.bracketExtendMode).to.equal(BracketExtendMode.NoBrackets);

        const groupStaves = (
            await prepareImporterWithFile('visual-tests/layout/brackets-braces-staves.gp')
        ).readScore();
        expect(groupStaves.stylesheet.bracketExtendMode).to.equal(BracketExtendMode.GroupStaves);

        const groupSimilarInstruments = (
            await prepareImporterWithFile('visual-tests/layout/brackets-braces-similar.gp')
        ).readScore();
        expect(groupSimilarInstruments.stylesheet.bracketExtendMode).to.equal(
            BracketExtendMode.GroupSimilarInstruments
        );
    });

    it('system-separator', async () => {
        const noBrackets = (await prepareImporterWithFile('visual-tests/layout/system-divider.gp')).readScore();
        expect(noBrackets.stylesheet.useSystemSignSeparator).to.be.true;
    });

    it('directions', async () => {
        const directions = (await prepareImporterWithFile('guitarpro8/directions.gp')).readScore();

        expect(directions.masterBars[0].directions).to.be.ok;
        expect(directions.masterBars[0].directions).to.contain(Direction.TargetFine);
        expect(directions.masterBars[0].directions).to.contain(Direction.TargetSegno);
        expect(directions.masterBars[0].directions).to.contain(Direction.TargetSegnoSegno);
        expect(directions.masterBars[0].directions).to.contain(Direction.TargetCoda);
        expect(directions.masterBars[0].directions).to.contain(Direction.TargetDoubleCoda);

        expect(directions.masterBars[1]).to.be.ok;
        expect(directions.masterBars[1].directions).to.contain(Direction.JumpDaCapo);
        expect(directions.masterBars[1].directions).to.contain(Direction.JumpDalSegno);
        expect(directions.masterBars[1].directions).to.contain(Direction.JumpDalSegnoSegno);
        expect(directions.masterBars[1].directions).to.contain(Direction.JumpDaCoda);
        expect(directions.masterBars[1].directions).to.contain(Direction.JumpDaDoubleCoda);

        expect(directions.masterBars[2].directions).to.be.ok;
        expect(directions.masterBars[2].directions).to.contain(Direction.JumpDaCapoAlCoda);
        expect(directions.masterBars[2].directions).to.contain(Direction.JumpDalSegnoAlCoda);
        expect(directions.masterBars[2].directions).to.contain(Direction.JumpDalSegnoSegnoAlCoda);

        expect(directions.masterBars[3].directions).to.be.ok;
        expect(directions.masterBars[3].directions).to.contain(Direction.JumpDaCapoAlDoubleCoda);
        expect(directions.masterBars[3].directions).to.contain(Direction.JumpDalSegnoAlDoubleCoda);
        expect(directions.masterBars[3].directions).to.contain(Direction.JumpDalSegnoSegnoAlDoubleCoda);

        expect(directions.masterBars[4].directions).to.be.ok;
        expect(directions.masterBars[4].directions).to.contain(Direction.JumpDaCapoAlFine);
        expect(directions.masterBars[4].directions).to.contain(Direction.JumpDalSegnoAlFine);
        expect(directions.masterBars[4].directions).to.contain(Direction.JumpDalSegnoSegnoAlFine);

        expect(directions.masterBars[5].directions).to.not.be.ok;
    });

    it('hide-tuning', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/hide-tuning.gp')).readScore();
        expect(hide.stylesheet.globalDisplayTuning).to.be.false;

        const show = (await prepareImporterWithFile('guitarpro8/directions.gp')).readScore();
        expect(show.stylesheet.globalDisplayTuning).to.be.true;
    });

    it('hide-chord-diagram-list', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/hide-diagrams.gp')).readScore();
        expect(hide.stylesheet.globalDisplayChordDiagramsOnTop).to.be.false;

        const show = (await prepareImporterWithFile('guitarpro8/directions.gp')).readScore();
        expect(show.stylesheet.globalDisplayChordDiagramsOnTop).to.be.true;
    });

    it('beaming-mode', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/beaming-mode.gp')).readScore();

        // auto
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].preferredBeamDirection).to.equal(BeamDirection.Up);

        // force
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.ForceMergeWithNext);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);
        
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].beamingMode).to.equal(BeatBeamingMode.ForceMergeWithNext);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].beamingMode).to.equal(BeatBeamingMode.ForceMergeWithNext);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].preferredBeamDirection).to.equal(BeamDirection.Up);

        // break
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.ForceSplitToNext);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);
        
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].beamingMode).to.equal(BeatBeamingMode.ForceSplitToNext);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].beamingMode).to.equal(BeatBeamingMode.ForceSplitToNext);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].preferredBeamDirection).to.equal(BeamDirection.Up);

        // break secondary
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.ForceSplitOnSecondaryToNext);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);
        
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].preferredBeamDirection).to.equal(BeamDirection.Up);

        // invert to down
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Down);

        // invert to up
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);
    });
});
