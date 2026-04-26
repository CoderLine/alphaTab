import { describe, expect, it } from 'vitest';
import { Gp7To8Importer } from '@coderline/alphatab/importer/Gp7To8Importer';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { AutomationType } from '@coderline/alphatab/model/Automation';
import { BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { Direction } from '@coderline/alphatab/model/Direction';
import { Duration } from '@coderline/alphatab/model/Duration';
import {
    BarNumberDisplay,
    BracketExtendMode,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy
} from '@coderline/alphatab/model/RenderStylesheet';
import { ScoreSubElement } from '@coderline/alphatab/model/Score';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { Settings } from '@coderline/alphatab/Settings';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';
import { GpImporterTestHelper } from 'test/importer/GpImporterTestHelper';
import { TestPlatform } from 'test/TestPlatform';

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

        expect(score.masterBars[0].tempoAutomations.length).toBe(2);
        expect(score.masterBars[0].tempoAutomations[0].value).toBe(120);
        expect(score.masterBars[0].tempoAutomations[0].ratioPosition).toBe(0);
        expect(score.masterBars[0].tempoAutomations[1].value).toBe(60);
        expect(score.masterBars[0].tempoAutomations[1].ratioPosition).toBe(0.5);

        expect(score.masterBars[1].tempoAutomations.length).toBe(2);
        expect(score.masterBars[1].tempoAutomations[0].value).toBe(100);
        expect(score.masterBars[1].tempoAutomations[0].ratioPosition).toBe(0);
        expect(score.masterBars[1].tempoAutomations[1].value).toBe(120);
        expect(score.masterBars[1].tempoAutomations[1].ratioPosition).toBe(0.6375);
    });

    it('bracket-braces', async () => {
        const noBrackets = (await prepareImporterWithFile('visual-tests/layout/brackets-braces-none.gp')).readScore();
        expect(noBrackets.stylesheet.bracketExtendMode).toBe(BracketExtendMode.NoBrackets);

        const groupStaves = (
            await prepareImporterWithFile('visual-tests/layout/brackets-braces-staves.gp')
        ).readScore();
        expect(groupStaves.stylesheet.bracketExtendMode).toBe(BracketExtendMode.GroupStaves);

        const groupSimilarInstruments = (
            await prepareImporterWithFile('visual-tests/layout/brackets-braces-similar.gp')
        ).readScore();
        expect(groupSimilarInstruments.stylesheet.bracketExtendMode).toBe(
            BracketExtendMode.GroupSimilarInstruments
        );
    });

    it('system-separator', async () => {
        const noBrackets = (await prepareImporterWithFile('visual-tests/layout/system-divider.gp')).readScore();
        expect(noBrackets.stylesheet.useSystemSignSeparator).toBe(true);
    });

    it('directions', async () => {
        const directions = (await prepareImporterWithFile('guitarpro8/directions.gp')).readScore();

        expect(directions.masterBars[0].directions).toBeTruthy();
        expect(directions.masterBars[0].directions).toContain(Direction.TargetFine);
        expect(directions.masterBars[0].directions).toContain(Direction.TargetSegno);
        expect(directions.masterBars[0].directions).toContain(Direction.TargetSegnoSegno);
        expect(directions.masterBars[0].directions).toContain(Direction.TargetCoda);
        expect(directions.masterBars[0].directions).toContain(Direction.TargetDoubleCoda);

        expect(directions.masterBars[1]).toBeTruthy();
        expect(directions.masterBars[1].directions).toContain(Direction.JumpDaCapo);
        expect(directions.masterBars[1].directions).toContain(Direction.JumpDalSegno);
        expect(directions.masterBars[1].directions).toContain(Direction.JumpDalSegnoSegno);
        expect(directions.masterBars[1].directions).toContain(Direction.JumpDaCoda);
        expect(directions.masterBars[1].directions).toContain(Direction.JumpDaDoubleCoda);

        expect(directions.masterBars[2].directions).toBeTruthy();
        expect(directions.masterBars[2].directions).toContain(Direction.JumpDaCapoAlCoda);
        expect(directions.masterBars[2].directions).toContain(Direction.JumpDalSegnoAlCoda);
        expect(directions.masterBars[2].directions).toContain(Direction.JumpDalSegnoSegnoAlCoda);

        expect(directions.masterBars[3].directions).toBeTruthy();
        expect(directions.masterBars[3].directions).toContain(Direction.JumpDaCapoAlDoubleCoda);
        expect(directions.masterBars[3].directions).toContain(Direction.JumpDalSegnoAlDoubleCoda);
        expect(directions.masterBars[3].directions).toContain(Direction.JumpDalSegnoSegnoAlDoubleCoda);

        expect(directions.masterBars[4].directions).toBeTruthy();
        expect(directions.masterBars[4].directions).toContain(Direction.JumpDaCapoAlFine);
        expect(directions.masterBars[4].directions).toContain(Direction.JumpDalSegnoAlFine);
        expect(directions.masterBars[4].directions).toContain(Direction.JumpDalSegnoSegnoAlFine);

        expect(directions.masterBars[5].directions).not.toBeTruthy();
    });

    it('hide-tuning', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/hide-tuning.gp')).readScore();
        expect(hide.stylesheet.globalDisplayTuning).toBe(false);

        const show = (await prepareImporterWithFile('guitarpro8/directions.gp')).readScore();
        expect(show.stylesheet.globalDisplayTuning).toBe(true);
    });

    it('hide-chord-diagram-list', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/hide-diagrams.gp')).readScore();
        expect(hide.stylesheet.globalDisplayChordDiagramsOnTop).toBe(false);

        const show = (await prepareImporterWithFile('guitarpro8/directions.gp')).readScore();
        expect(show.stylesheet.globalDisplayChordDiagramsOnTop).toBe(true);
    });

    it('show-chord-diagrams-in-score', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/show-diagrams-in-score.gp')).readScore();
        expect(hide.stylesheet.globalDisplayChordDiagramsInScore).toBe(true);

        const show = (await prepareImporterWithFile('guitarpro8/directions.gp')).readScore();
        expect(show.stylesheet.globalDisplayChordDiagramsInScore).toBe(false);
    });

    it('beaming-mode', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/beaming-mode.gp')).readScore();

        // auto
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        // force
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].preferredBeamDirection).toBe(BeamDirection.Up);

        // break
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].preferredBeamDirection).toBe(BeamDirection.Up);

        // break secondary
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceSplitOnSecondaryToNext
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].preferredBeamDirection).toBe(BeamDirection.Up);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].preferredBeamDirection).toBe(BeamDirection.Up);

        // invert to down
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].preferredBeamDirection).toBe(
            BeamDirection.Down
        );

        // invert to up
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].preferredBeamDirection).toBe(BeamDirection.Up);
    });

    it('track-names-hidden', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/track-names-hidden.gp')).readScore();
        expect(hide.stylesheet.singleTrackTrackNamePolicy).toBe(TrackNamePolicy.Hidden);
        expect(hide.stylesheet.multiTrackTrackNamePolicy).toBe(TrackNamePolicy.Hidden);
    });

    it('track-names-adjusted', async () => {
        const hide = (await prepareImporterWithFile('guitarpro8/track-names.gp')).readScore();
        expect(hide.stylesheet.singleTrackTrackNamePolicy).toBe(TrackNamePolicy.AllSystems);
        expect(hide.stylesheet.multiTrackTrackNamePolicy).toBe(TrackNamePolicy.AllSystems);

        expect(hide.stylesheet.firstSystemTrackNameMode).toBe(TrackNameMode.FullName);
        expect(hide.stylesheet.otherSystemsTrackNameMode).toBe(TrackNameMode.FullName);

        expect(hide.stylesheet.firstSystemTrackNameOrientation).toBe(TrackNameOrientation.Horizontal);
        expect(hide.stylesheet.otherSystemsTrackNameOrientation).toBe(TrackNameOrientation.Vertical);
    });

    it('timer', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/timer.gp')).readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].timer).toBe(0);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].timer).toBe(2000);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].timer).toBe(4000);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].timer).toBe(6000);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[0].timer).toBe(8000);
        expect(score.tracks[0].staves[0].bars[4].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[0].timer).toBe(16000);
        expect(score.tracks[0].staves[0].bars[5].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[6].voices[0].beats[0].showTimer).toBe(true);
        // inprecision bug in guitar pro, should actually be 26000
        expect(score.tracks[0].staves[0].bars[6].voices[0].beats[0].timer).toBe(25999);
        expect(score.tracks[0].staves[0].bars[6].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[7].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[7].voices[0].beats[0].timer).toBe(28000);
        expect(score.tracks[0].staves[0].bars[7].voices[0].beats[1].showTimer).toBe(false);

        expect(score.tracks[0].staves[0].bars[8].voices[0].beats[0].showTimer).toBe(true);
        expect(score.tracks[0].staves[0].bars[8].voices[0].beats[0].timer).toBe(0);
        expect(score.tracks[0].staves[0].bars[8].voices[0].beats[1].showTimer).toBe(false);
    });

    it('multibar-rest', async () => {
        const enabled = (await prepareImporterWithFile('guitarpro8/multibar-rest.gp')).readScore();
        const disabled = (await prepareImporterWithFile('guitarpro8/timer.gp')).readScore();

        expect(disabled.stylesheet.multiTrackMultiBarRest).toBe(false);
        expect(disabled.stylesheet.perTrackMultiBarRest).toBe(null);
        expect(enabled.stylesheet.multiTrackMultiBarRest).toBe(true);
        expect(enabled.stylesheet.perTrackMultiBarRest).toBeTruthy();
        expect(enabled.stylesheet.perTrackMultiBarRest!.has(0)).toBe(false);
        expect(enabled.stylesheet.perTrackMultiBarRest!.has(1)).toBe(true);
        expect(enabled.stylesheet.perTrackMultiBarRest!.has(2)).toBe(true);
    });

    it('header-footer', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/header-footer.gp')).readScore();

        expect(score.style).toBeTruthy();

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Title)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.template).toBe('Title: %TITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.textAlign).toBe(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.SubTitle)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.template).toBe('Subtitle: %SUBTITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Artist)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.template).toBe('Artist: %ARTIST%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Album)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.template).toBe('Album: %ALBUM%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.textAlign).toBe(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Words)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.template).toBe('Words: %WORDS%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Music)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.template).toBe('Music: %MUSIC%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.WordsAndMusic)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.template).toBe(
            'Words & Music: %MUSIC%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.textAlign).toBe(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Transcriber)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.template).toBe(
            'Transcriber: %TABBER%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Transcriber)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Copyright)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.template).toBe(
            'Copyright: %COPYRIGHT%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.CopyrightSecondLine)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.template).toBe('Copyright2');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.textAlign).toBe(
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
            expect(Number.isNaN(t.playbackInfo.primaryChannel)).toBe(false);
            expect(Number.isNaN(t.playbackInfo.secondaryChannel)).toBe(false);

            if (t.playbackInfo.primaryChannel !== SynthConstants.PercussionChannel) {
                expect(usedChannels.has(t.playbackInfo.primaryChannel)).toBe(false);
                expect(usedChannels.has(t.playbackInfo.secondaryChannel)).toBe(false);

                usedChannels.add(t.playbackInfo.primaryChannel);
                usedChannels.add(t.playbackInfo.secondaryChannel);
            }
        }
    });

    it('audio-track', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/canon-audio-track.gp')).readScore();

        // track data not relevant for snapshots
        score.tracks = [];

        expect(score).toMatchSnapshot();
    });

    it('bank', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/bank.gp')).readScore();

        expect(score.tracks[0].playbackInfo.program).toBe(25);
        expect(score.tracks[0].playbackInfo.bank).toBe(0);

        expect(score.tracks[1].playbackInfo.program).toBe(25);
        expect(score.tracks[1].playbackInfo.bank).toBe(77);

        expect(score.tracks[2].playbackInfo.program).toBe(25);
        expect(score.tracks[2].playbackInfo.bank).toBe(256);
    });

    it('bank-change', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/bank-change.gp')).readScore();

        expect(score.tracks[0].playbackInfo.program).toBe(25);
        expect(score.tracks[0].playbackInfo.bank).toBe(0);

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].automations.length).toBe(1);
        expect(
            score.tracks[0].staves[0].bars[0].voices[0].beats[0].getAutomation(AutomationType.Instrument)?.value
        ).toBe(25);
        // expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].getAutomation(AutomationType.Bank)?.value).toBe(0); skipped

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].automations.length).toBe(2);
        expect(
            score.tracks[0].staves[0].bars[1].voices[0].beats[0].getAutomation(AutomationType.Instrument)?.value
        ).toBe(25);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].getAutomation(AutomationType.Bank)?.value).toBe(
            256
        );
    });

    it('extend-bar-lines', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/extended-barlines.gp')).readScore();

        expect(score.stylesheet.extendBarLines).toBe(true);
    });

    describe('barnumbers', () => {
        it('all', async () => {
            const score = (await prepareImporterWithFile('guitarpro8/barnumbers-all.gp')).readScore();
            expect(score.stylesheet.barNumberDisplay).toBe(BarNumberDisplay.AllBars);
        });
        it('hide', async () => {
            const score = (await prepareImporterWithFile('guitarpro8/barnumbers-hide.gp')).readScore();
            expect(score.stylesheet.barNumberDisplay).toBe(BarNumberDisplay.Hide);
        });
        it('first', async () => {
            const score = (await prepareImporterWithFile('guitarpro8/barnumbers-first.gp')).readScore();
            expect(score.stylesheet.barNumberDisplay).toBe(BarNumberDisplay.FirstOfSystem);
        });
    });

    it('custom-beaming', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/custom-beaming.gp')).readScore();

        // NOTE: no need to verify all details, we'll have a visual test for that.

        expect(score.masterBars[0].beamingRules).toBeTruthy();
        expect(score.masterBars[0].beamingRules!.groups.has(Duration.Eighth)).toBe(true);
        expect(score.masterBars[0].beamingRules!.groups.get(Duration.Eighth)!.join(',')).toBe('2,2,2,2');
        // equal to previous
        expect(score.masterBars[1].beamingRules === undefined, 'expected beamingRules of bar 1 to be undefined').toBe(true);
        expect(
            score.masterBars[1].actualBeamingRules === score.masterBars[0].beamingRules,
            'actualBeamingRules of bar 1 incorrect'
        ).toBe(true);
        expect(score.masterBars[2].beamingRules === undefined, 'expected beamingRules of bar 2 to be undefined').toBe(true);
        expect(
            score.masterBars[2].actualBeamingRules === score.masterBars[0].beamingRules,
            'actualBeamingRules of bar 1 incorrect'
        ).toBe(true);
        expect(score.masterBars[3].beamingRules === undefined, 'expected beamingRules of bar 3 to be undefined').toBe(true);
        expect(
            score.masterBars[3].actualBeamingRules === score.masterBars[0].beamingRules,
            'actualBeamingRules of bar 1 incorrect'
        ).toBe(true);
        expect(score.masterBars[4].beamingRules === undefined, 'expected beamingRules of bar 4 to be undefined').toBe(true);
        expect(
            score.masterBars[4].actualBeamingRules === score.masterBars[0].beamingRules,
            'actualBeamingRules of bar 1 incorrect'
        ).toBe(true);

        expect(score.masterBars[5].beamingRules!.groups.has(Duration.Eighth)).toBe(true);
        expect(score.masterBars[5].beamingRules!.groups.get(Duration.Eighth)!.join(',')).toBe('4,4');
    });

    it('harmonics-lowercase', async () => {
        const reader = await prepareImporterWithFile('guitarpro8/harmonics-lowercase.gp');
        const score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });
});
