import { Gp7To8Importer } from '@src/importer/Gp7To8Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { BeatBeamingMode } from '@src/model/Beat';
import { Direction } from '@src/model/Direction';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { ScoreSubElement } from '@src/model/Score';
import { TextAlign } from '@src/platform/ICanvas';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { Settings } from '@src/Settings';
import { SynthConstants } from '@src/synth/SynthConstants';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { TestPlatform } from '@test/TestPlatform';
import { expect } from 'chai';

describe('Gp8ImporterTest', () => {
    async function prepareImporterWithFile(name: string): Promise<Gp7To8Importer> {
        const data = await TestPlatform.loadFile(`test-data/${name}`);
        return prepareImporterWithBytes(data);
    }

    function prepareImporterWithBytes(buffer: Uint8Array) {
        const readerBase: Gp7To8Importer = new Gp7To8Importer();
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
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].beamingMode).to.equal(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].beamingMode).to.equal(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].preferredBeamDirection).to.equal(BeamDirection.Up);

        // break
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].preferredBeamDirection).to.equal(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].preferredBeamDirection).to.equal(BeamDirection.Up);

        // break secondary
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitOnSecondaryToNext
        );
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
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].preferredBeamDirection).to.equal(
            BeamDirection.Down
        );

        // invert to up
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].preferredBeamDirection).to.equal(BeamDirection.Up);
    });

    it('track-names-hidden', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/track-names-hidden.gp')).readScore();
        expect(hide.stylesheet.singleTrackTrackNamePolicy).to.equal(TrackNamePolicy.Hidden);
        expect(hide.stylesheet.multiTrackTrackNamePolicy).to.equal(TrackNamePolicy.Hidden);
    });

    it('track-names-adjusted', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/track-names.gp')).readScore();
        expect(hide.stylesheet.singleTrackTrackNamePolicy).to.equal(TrackNamePolicy.AllSystems);
        expect(hide.stylesheet.multiTrackTrackNamePolicy).to.equal(TrackNamePolicy.AllSystems);

        expect(hide.stylesheet.firstSystemTrackNameMode).to.equal(TrackNameMode.FullName);
        expect(hide.stylesheet.otherSystemsTrackNameMode).to.equal(TrackNameMode.FullName);

        expect(hide.stylesheet.firstSystemTrackNameOrientation).to.equal(TrackNameOrientation.Horizontal);
        expect(hide.stylesheet.otherSystemsTrackNameOrientation).to.equal(TrackNameOrientation.Vertical);
    });

    it('timer', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/timer.gp')).readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].timer).to.equal(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].timer).to.equal(2000);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].timer).to.equal(4000);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].timer).to.equal(6000);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].timer).to.equal(8000);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].timer).to.equal(16000);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[6].voices[0].beats[0].showTimer).to.be.true;
        // inprecision bug in guitar pro, should actually be 26000
        expect(score.tracks[0].staves[0].bars[6].voices[0].beats[0].timer).to.equal(25999);
        expect(score.tracks[0].staves[0].bars[6].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[7].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[7].voices[0].beats[0].timer).to.equal(28000);
        expect(score.tracks[0].staves[0].bars[7].voices[0].beats[1].showTimer).to.be.false;

        expect(score.tracks[0].staves[0].bars[8].voices[0].beats[0].showTimer).to.be.true;
        expect(score.tracks[0].staves[0].bars[8].voices[0].beats[0].timer).to.equal(0);
        expect(score.tracks[0].staves[0].bars[8].voices[0].beats[1].showTimer).to.be.false;
    });

    it('multibar-rest', async () => {
        const enabled = (await prepareImporterWithFile('guitarpro8/multibar-rest.gp')).readScore();
        const disabled = (await prepareImporterWithFile('guitarpro8/timer.gp')).readScore();

        expect(disabled.stylesheet.multiTrackMultiBarRest).to.be.false;
        expect(disabled.stylesheet.perTrackMultiBarRest).to.equal(null);
        expect(enabled.stylesheet.multiTrackMultiBarRest).to.be.true;
        expect(enabled.stylesheet.perTrackMultiBarRest).to.be.ok;
        expect(enabled.stylesheet.perTrackMultiBarRest!.has(0)).to.be.false;
        expect(enabled.stylesheet.perTrackMultiBarRest!.has(1)).to.be.true;
        expect(enabled.stylesheet.perTrackMultiBarRest!.has(2)).to.be.true;
    });

    it('header-footer', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/header-footer.gp')).readScore();

        expect(score.style).to.be.ok;

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Title)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.template).to.equal('Title: %TITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.textAlign).to.equal(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.SubTitle)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.template).to.equal('Subtitle: %SUBTITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Artist)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.template).to.equal('Artist: %ARTIST%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Album)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.template).to.equal('Album: %ALBUM%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.textAlign).to.equal(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Words)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.template).to.equal('Words: %WORDS%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Music)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.template).to.equal('Music: %MUSIC%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.WordsAndMusic)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.template).to.equal(
            'Words & Music: %MUSIC%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.textAlign).to.equal(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Transcriber)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.template).to.equal(
            'Transcriber: %TABBER%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Copyright)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.template).to.equal(
            'Copyright: %COPYRIGHT%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.CopyrightSecondLine)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.template).to.equal('Copyright2');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.textAlign).to.equal(
            TextAlign.Right
        );
    });

    it('faulty', async () => {
        // this is a GP8 file from unknown source.
        // the score.gpif contents indicate that this file was NOT written by a real Guitar Pro 8 instance but
        // by some 3rd party software. there are inconsistencies like:
        // * line 752 and 764: Line Breaks in the list of NoteHeads
        // * line 67: No line break on close tag, wrong indention
        // * line 403: Additional empty line break
        // * line 293: Missing line break
        // * line 352,353: Missing Midi channels
        // * Equal bars/voices/beats are not reused across the file

        // Generally the file looks surprisingly complete for a "non real Guitar Pro" (RSE stuff) but it feels rather like
        // a software which has read an original file, and then applied modifications to it before saving again.

        // Maybe its the MacOS version which behaves differently than the Windows Version?
        // Or more likely: a non-open source platform like Sound Slice?

        const score = (await prepareImporterWithFile('guitarpro8/faulty.gp')).readScore();

        const usedChannels = new Set<number>();
        for (const t of score.tracks) {
            expect(Number.isNaN(t.playbackInfo.primaryChannel)).to.be.false;
            expect(Number.isNaN(t.playbackInfo.secondaryChannel)).to.be.false;

            if (t.playbackInfo.primaryChannel !== SynthConstants.PercussionChannel) {
                expect(usedChannels.has(t.playbackInfo.primaryChannel)).to.be.false;
                expect(usedChannels.has(t.playbackInfo.secondaryChannel)).to.be.false;

                usedChannels.add(t.playbackInfo.primaryChannel);
                usedChannels.add(t.playbackInfo.secondaryChannel);
            }
        }
    });

    it('audio-track', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/canon-audio-track.gp')).readScore();

        // track data not relevant for snapshots
        score.tracks = [];

        expect(score).to.toMatchSnapshot();
    });
});
