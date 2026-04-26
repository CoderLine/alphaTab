import { describe, expect, it } from 'vitest';
import { Settings } from '@coderline/alphatab/Settings';
import { type Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { Direction } from '@coderline/alphatab/model/Direction';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { type Score, ScoreSubElement } from '@coderline/alphatab/model/Score';
import { WahPedal } from '@coderline/alphatab/model/WahPedal';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { GpImporterTestHelper } from 'test/importer/GpImporterTestHelper';
import { Clef } from '@coderline/alphatab/model/Clef';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';

describe('Gp5ImporterTest', () => {
    it('score-info', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/score-info.gp5');
        const score: Score = reader.readScore();
        expect(score.title).toBe('Title');
        expect(score.subTitle).toBe('Subtitle');
        expect(score.artist).toBe('Artist');
        expect(score.album).toBe('Album');
        expect(score.words).toBe('Words');
        expect(score.music).toBe('Music');
        expect(score.copyright).toBe('Copyright');
        expect(score.tab).toBe('Tab');
        expect(score.instructions).toBe('Instructions');
        expect(score.notices).toBe('Notice1\r\nNotice2');
        expect(score.masterBars.length).toBe(5);
        expect(score.tracks.length).toBe(2);
        expect(score.tracks[0].name).toBe('Track 1');
        expect(score.tracks[1].name).toBe('Track 2');
    });

    it('notes', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/notes.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkNotes(score);
    });

    it('time-signatures', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/time-signatures.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTimeSignatures(score);
    });

    it('dead', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/dead.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkDead(score);
    });

    it('grace', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/grace.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkGrace(score);
    });

    it('accentuations', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/accentuations.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkAccentuations(score, true);
    });

    it('harmonics', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/harmonics.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHarmonics(score);
    });

    it('hammer', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/hammer.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkHammer(score);
    });

    it('bend', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/bends.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkBend(score);
    });

    it('tremolo', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/tremolo.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTremolo(score);
    });

    it('slides', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/slides.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkSlides(score);
    });

    it('vibrato', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/vibrato.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkVibrato(score, true);
    });

    it('trills', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/trills.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTrills(score);
    });

    it('other-effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/other-effects.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkOtherEffects(score, false);
    });

    it('fingering', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/fingering.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkFingering(score);
    });

    it('stroke', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/strokes.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStroke(score);
    });

    it('tuplets', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/tuplets.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkTuplets(score);
    });

    it('ranges', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/ranges.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkRanges(score);
    });

    it('effects', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/effects.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkEffects(score);
    });

    it('serenade', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/serenade.gp5');
        reader.readScore();
        // only Check reading
    });

    it('strings', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/strings.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkStrings(score);
    });

    it('key-signatures', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/key-signatures.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkKeySignatures(score);
    });

    it('chords', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/chords.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkChords(score);
    });

    it('colors', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/colors.gp5');
        const score: Score = reader.readScore();
        GpImporterTestHelper.checkColors(score);
    });

    it('alternate-endings-section-error', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile(
            'guitarpro5/alternate-endings-section-error.gp5'
        );
        const score: Score = reader.readScore();
        expect(score.masterBars.length).toBe(2);
        expect(score.masterBars[1].alternateEndings).toBe(4);
        expect(score.masterBars[1].section).toBeTruthy();
        expect(score.masterBars[1].section?.text).toBe('Outro');
    });

    it('canon', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/canon.gp5');
        const score: Score = reader.readScore();
        expect(score.title).toBe('Canon Rock');
        expect(score.subTitle).toBe('');
        expect(score.artist).toBe('JerryC');
        expect(score.album).toBe('');
        expect(score.words).toBe('');
        expect(score.music).toBe('JerryC');
        expect(score.copyright).toBe('');
        expect(score.tab).toBe('');
        expect(score.instructions).toBe('');
        expect(score.notices).toBe('');
        expect(score.masterBars.length).toBe(224);
        expect(score.tracks.length).toBe(9);
        expect(score.tracks[0].name).toBe('Guitar Player');
        expect(score.tracks[1].name).toBe('Low Bassy Sound');
        expect(score.tracks[2].name).toBe('High Soundy Thing');
        expect(score.tracks[3].name).toBe('Second Guitar');
        expect(score.tracks[4].name).toBe('Drums');
        expect(score.tracks[5].name).toBe('Harmonizer');
        expect(score.tracks[6].name).toBe('The clean guitar');
        expect(score.tracks[7].name).toBe('Track 8');
        expect(score.tracks[8].name).toBe('Percussion');
    });
    it('beat-text-lyrics', async () => {
        const settings = new Settings();
        settings.importer.beatTextAsLyrics = true;
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/beat-text-lyrics.gp5', settings);
        const score: Score = reader.readScore();

        const expectedChunks: string[] = [
            '',
            'So',
            'close,',
            'no',
            'mat',
            'ter',
            'how',
            '',
            'far.',
            '',
            '',
            'Could-',
            "n't",
            'be',
            'much',
            'more',
            'from',
            'the',
            '',
            'heart.',
            '',
            '',
            '',
            '',
            'For-',
            'ev-',
            'er',
            'trust-',
            'ing',
            'who',
            'we',
            'are.',
            '',
            '',
            '',
            '',
            '',
            '',
            'And',
            'noth-',
            'ing',
            'else',
            '',
            'mat-',
            'ters.',
            '',
            ''
        ];

        let beat: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];
        const actualChunks: string[] = [];
        while (beat != null) {
            if (beat.lyrics) {
                actualChunks.push(beat.lyrics[0]);
            } else {
                actualChunks.push('');
            }
            beat = beat.nextBeat;
        }

        expect(actualChunks.join(';')).toBe(expectedChunks.join(';'));
    });

    it('layout-configuration', async () => {
        const track1 = (
            await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/layout-configuration-multi-track-1.gp5')
        ).readScore();
        const track2 = (
            await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/layout-configuration-multi-track-2.gp5')
        ).readScore();
        const trackAll = (
            await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/layout-configuration-multi-track-all.gp5')
        ).readScore();
        const track1And3 = (
            await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/layout-configuration-multi-track-1-3.gp5')
        ).readScore();

        GpImporterTestHelper.checkMultiTrackLayoutConfiguration(track1, track2, trackAll, track1And3);
    });

    it('hide-tuning', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/hide-tuning.gp5')).readScore();

        expect(score.stylesheet.perTrackDisplayTuning).toBeTruthy();
        expect(score.stylesheet.perTrackDisplayTuning!.has(0)).toBe(true);
        expect(score.stylesheet.perTrackDisplayTuning!.get(0)).toBe(false);

        expect(score.stylesheet.perTrackDisplayTuning!.has(1)).toBe(true);
        expect(score.stylesheet.perTrackDisplayTuning!.get(1)).toBe(true);
    });

    it('staves', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/staves.gp5')).readScore();

        expect(score.tracks[0].staves[0].showNumbered).toBe(false);
        expect(score.tracks[0].staves[0].showSlash).toBe(false);
        expect(score.tracks[0].staves[0].showTablature).toBe(true);
        expect(score.tracks[0].staves[0].showStandardNotation).toBe(true);

        expect(score.tracks[1].staves[0].showNumbered).toBe(false);
        expect(score.tracks[1].staves[0].showSlash).toBe(false);
        expect(score.tracks[1].staves[0].showTablature).toBe(false);
        expect(score.tracks[1].staves[0].showStandardNotation).toBe(true);

        expect(score.tracks[2].staves[0].showNumbered).toBe(false);
        expect(score.tracks[2].staves[0].showSlash).toBe(false);
        expect(score.tracks[2].staves[0].showTablature).toBe(true);
        expect(score.tracks[2].staves[0].showStandardNotation).toBe(false);
    });

    it('hide-diagram', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/hide-diagrams.gp5')).readScore();

        expect(score.stylesheet.perTrackChordDiagramsOnTop).toBeTruthy();
        expect(score.stylesheet.perTrackChordDiagramsOnTop!.has(0)).toBe(true);
        expect(score.stylesheet.perTrackChordDiagramsOnTop!.get(0)).toBe(false);

        expect(score.stylesheet.perTrackChordDiagramsOnTop!.has(1)).toBe(true);
        expect(score.stylesheet.perTrackChordDiagramsOnTop!.get(1)).toBe(true);
    });

    it('directions', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/directions.gp5')).readScore();

        // order just top down as in GP5, every direction on one bar.
        const expectedDirections = [
            Direction.TargetCoda,
            Direction.TargetDoubleCoda,
            Direction.TargetSegno,
            Direction.TargetSegnoSegno,
            Direction.TargetFine,

            Direction.JumpDaCapo,
            Direction.JumpDaCapoAlCoda,
            Direction.JumpDaCapoAlDoubleCoda,
            Direction.JumpDaCapoAlFine,

            Direction.JumpDalSegno,
            Direction.JumpDalSegnoSegno,

            Direction.JumpDalSegnoAlCoda,
            Direction.JumpDalSegnoAlDoubleCoda,

            Direction.JumpDalSegnoSegnoAlCoda,
            Direction.JumpDalSegnoSegnoAlDoubleCoda,

            Direction.JumpDalSegnoAlFine,
            Direction.JumpDalSegnoSegnoAlFine,

            Direction.JumpDaCoda,
            Direction.JumpDaDoubleCoda
        ];

        for (let i = 0; i < expectedDirections.length; i++) {
            expect(score.masterBars[i].directions).toBeTruthy();
            expect(score.masterBars[i].directions!.has(expectedDirections[i])).toBe(true);
        }
    });

    it('beaming-mode', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/beaming-mode.gp5')).readScore();

        // auto
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].preferredBeamDirection).not.toBeTruthy();

        // force
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.Auto // already has beam, no need to force
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].beamingMode).toBe(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].beamingMode).toBe(
            BeatBeamingMode.Auto // already has beam, no need to force
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].preferredBeamDirection).not.toBeTruthy();

        // break
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].beamingMode).toBe(
            BeatBeamingMode.Auto // already has no beam, no need to break
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].beamingMode).toBe(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].preferredBeamDirection).not.toBeTruthy();

        // break secondary
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).toBe(
            BeatBeamingMode.ForceSplitOnSecondaryToNext
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].preferredBeamDirection).not.toBeTruthy();

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].beamingMode).toBe(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].invertBeamDirection).toBe(false);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].preferredBeamDirection).not.toBeTruthy();

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

    it('ottavia', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/ottavia.gp5')).readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].ottava).toBe(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].ottava).toBe(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].ottava).toBe(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].ottava).toBe(Ottavia._15mb);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].ottava).toBe(Ottavia.Regular);
    });

    it('wah-wah', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/wah-wah.gp5')).readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].wahPedal).toBe(WahPedal.None);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].wahPedal).toBe(WahPedal.Open);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].wahPedal).toBe(WahPedal.Closed);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].wahPedal).toBe(WahPedal.Open);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].wahPedal).toBe(WahPedal.Closed);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].wahPedal).toBe(WahPedal.None);
    });

    it('header-footer', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/header-footer.gp5')).readScore();

        expect(score.style).toBeTruthy();

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Title)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.template).toBe('Title: %TITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.SubTitle)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.template).toBe('Subtitle: %SUBTITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Artist)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.template).toBe('Artist: %ARTIST%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Album)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.template).toBe('Album: %ALBUM%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Words)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.template).toBe('Words: %WORDS%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.textAlign).toBe(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Music)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.template).toBe('Music: %MUSIC%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.WordsAndMusic)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.template).toBe(
            'Words & Music: %WORDSMUSIC%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.isVisible).toBe(false);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.textAlign).toBe(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Transcriber)).toBe(false);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Copyright)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.template).toBe(
            'Copyright: %COPYRIGHT%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.textAlign).toBe(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.CopyrightSecondLine)).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.template).toBe('Copyright2');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.isVisible).toBe(true);
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.textAlign).toBe(
            TextAlign.Center
        );
    });

    it('bank', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/bank.gp5')).readScore();

        expect(score.tracks[0].playbackInfo.program).toBe(25);
        expect(score.tracks[0].playbackInfo.bank).toBe(0);

        expect(score.tracks[1].playbackInfo.program).toBe(25);
        expect(score.tracks[1].playbackInfo.bank).toBe(77);
    });

    it('tuning-bass-clef', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/bass-tuning.gp5')).readScore();
        expect(score.tracks[0].staves[0].bars[0].clef).toBe(Clef.G2);
        expect(score.tracks[1].staves[0].bars[0].clef).toBe(Clef.F4);
        expect(score.tracks[2].staves[0].bars[0].clef).toBe(Clef.F4);
        expect(score.tracks[3].staves[0].bars[0].clef).toBe(Clef.F4);
    });

    it('percusson', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/percussion-all.gp5')).readScore();

        let beat: Beat | null = score.tracks[0].staves[0].bars[0].voices[0].beats[0];

        while (beat) {
            if (beat.notes.length === 1) {
                const articulationName = PercussionMapper.getArticulationName(beat.notes[0]);
                const hasArticulation = PercussionMapper.instrumentArticulationNames.has(articulationName);
                expect(hasArticulation).toBe(true);
                beat = beat.nextBeat;
            }
        }
    });
});
