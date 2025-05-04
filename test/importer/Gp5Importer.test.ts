import { Settings } from '@src/Settings';
import { type Beat, BeatBeamingMode } from '@src/model/Beat';
import { Direction } from '@src/model/Direction';
import { Ottavia } from '@src/model/Ottavia';
import { type Score, ScoreSubElement } from '@src/model/Score';
import { WahPedal } from '@src/model/WahPedal';
import { TextAlign } from '@src/platform/ICanvas';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { expect } from 'chai';

describe('Gp5ImporterTest', () => {
    it('score-info', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/score-info.gp5');
        const score: Score = reader.readScore();
        expect(score.title).to.equal('Title');
        expect(score.subTitle).to.equal('Subtitle');
        expect(score.artist).to.equal('Artist');
        expect(score.album).to.equal('Album');
        expect(score.words).to.equal('Words');
        expect(score.music).to.equal('Music');
        expect(score.copyright).to.equal('Copyright');
        expect(score.tab).to.equal('Tab');
        expect(score.instructions).to.equal('Instructions');
        expect(score.notices).to.equal('Notice1\r\nNotice2');
        expect(score.masterBars.length).to.equal(5);
        expect(score.tracks.length).to.equal(2);
        expect(score.tracks[0].name).to.equal('Track 1');
        expect(score.tracks[1].name).to.equal('Track 2');
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
        expect(score.masterBars.length).to.be.equal(2);
        expect(score.masterBars[1].alternateEndings).to.be.equal(4);
        expect(score.masterBars[1].section).to.be.ok;
        expect(score.masterBars[1].section?.text).to.be.equal('Outro');
    });

    it('canon', async () => {
        const reader = await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/canon.gp5');
        const score: Score = reader.readScore();
        expect(score.title).to.equal('Canon Rock');
        expect(score.subTitle).to.equal('');
        expect(score.artist).to.equal('JerryC');
        expect(score.album).to.equal('');
        expect(score.words).to.equal('');
        expect(score.music).to.equal('JerryC');
        expect(score.copyright).to.equal('');
        expect(score.tab).to.equal('');
        expect(score.instructions).to.equal('');
        expect(score.notices).to.equal('');
        expect(score.masterBars.length).to.equal(224);
        expect(score.tracks.length).to.equal(9);
        expect(score.tracks[0].name).to.equal('Guitar Player');
        expect(score.tracks[1].name).to.equal('Low Bassy Sound');
        expect(score.tracks[2].name).to.equal('High Soundy Thing');
        expect(score.tracks[3].name).to.equal('Second Guitar');
        expect(score.tracks[4].name).to.equal('Drums');
        expect(score.tracks[5].name).to.equal('Harmonizer');
        expect(score.tracks[6].name).to.equal('The clean guitar');
        expect(score.tracks[7].name).to.equal('Track 8');
        expect(score.tracks[8].name).to.equal('Percussion');
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

        expect(actualChunks.join(';')).to.equal(expectedChunks.join(';'));
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

        expect(score.stylesheet.perTrackDisplayTuning).to.be.ok;
        expect(score.stylesheet.perTrackDisplayTuning!.has(0)).to.be.true;
        expect(score.stylesheet.perTrackDisplayTuning!.get(0)).to.equal(false);

        expect(score.stylesheet.perTrackDisplayTuning!.has(1)).to.be.true;
        expect(score.stylesheet.perTrackDisplayTuning!.get(1)).to.equal(true);
    });

    it('staves', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/staves.gp5')).readScore();

        expect(score.tracks[0].staves[0].showNumbered).to.be.false;
        expect(score.tracks[0].staves[0].showSlash).to.be.false;
        expect(score.tracks[0].staves[0].showTablature).to.be.true;
        expect(score.tracks[0].staves[0].showStandardNotation).to.be.true;

        expect(score.tracks[1].staves[0].showNumbered).to.be.false;
        expect(score.tracks[1].staves[0].showSlash).to.be.false;
        expect(score.tracks[1].staves[0].showTablature).to.be.false;
        expect(score.tracks[1].staves[0].showStandardNotation).to.be.true;

        expect(score.tracks[2].staves[0].showNumbered).to.be.false;
        expect(score.tracks[2].staves[0].showSlash).to.be.false;
        expect(score.tracks[2].staves[0].showTablature).to.be.true;
        expect(score.tracks[2].staves[0].showStandardNotation).to.be.false;
    });

    it('hide-diagram', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/hide-diagrams.gp5')).readScore();

        expect(score.stylesheet.perTrackChordDiagramsOnTop).to.be.ok;
        expect(score.stylesheet.perTrackChordDiagramsOnTop!.has(0)).to.be.true;
        expect(score.stylesheet.perTrackChordDiagramsOnTop!.get(0)).to.equal(false);

        expect(score.stylesheet.perTrackChordDiagramsOnTop!.has(1)).to.be.true;
        expect(score.stylesheet.perTrackChordDiagramsOnTop!.get(1)).to.equal(true);
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
            expect(score.masterBars[i].directions).to.be.ok;
            expect(score.masterBars[i].directions!.has(expectedDirections[i])).to.be.true;
        }
    });

    it('beaming-mode', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/beaming-mode.gp5')).readScore();

        // auto
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].preferredBeamDirection).to.not.be.ok;

        // force
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.Auto // already has beam, no need to force
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].beamingMode).to.equal(
            BeatBeamingMode.ForceMergeWithNext
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].beamingMode).to.equal(
            BeatBeamingMode.Auto // already has beam, no need to force
        );
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].preferredBeamDirection).to.not.be.ok;

        // break
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[0].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].beamingMode).to.equal(
            BeatBeamingMode.Auto // already has no beam, no need to break
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[1].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitToNext
        );
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].preferredBeamDirection).to.not.be.ok;

        // break secondary
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].beamingMode).to.equal(
            BeatBeamingMode.ForceSplitOnSecondaryToNext
        );
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[0].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[1].preferredBeamDirection).to.not.be.ok;

        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].beamingMode).to.equal(BeatBeamingMode.Auto);
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].invertBeamDirection).to.be.false;
        expect(score.tracks[0].staves[0].bars[3].voices[0].beats[2].preferredBeamDirection).to.not.be.ok;

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

    it('ottavia', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/ottavia.gp5')).readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].ottava).to.equal(Ottavia._8va);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].ottava).to.equal(Ottavia._8vb);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].ottava).to.equal(Ottavia._15ma);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].ottava).to.equal(Ottavia._15mb);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].ottava).to.equal(Ottavia.Regular);
    });

    it('wah-wah', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/wah-wah.gp5')).readScore();

        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[0].wahPedal).to.equal(WahPedal.None);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[1].wahPedal).to.equal(WahPedal.Open);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].wahPedal).to.equal(WahPedal.Closed);
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[3].wahPedal).to.equal(WahPedal.Open);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].wahPedal).to.equal(WahPedal.Closed);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].wahPedal).to.equal(WahPedal.None);
    });

    it('header-footer', async () => {
        const score = (await GpImporterTestHelper.prepareImporterWithFile('guitarpro5/header-footer.gp5')).readScore();

        expect(score.style).to.be.ok;

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Title)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.template).to.equal('Title: %TITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Title)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.SubTitle)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.template).to.equal('Subtitle: %SUBTITLE%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.SubTitle)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Artist)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.template).to.equal('Artist: %ARTIST%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Artist)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Album)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.template).to.equal('Album: %ALBUM%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Album)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Words)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.template).to.equal('Words: %WORDS%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Words)!.textAlign).to.equal(TextAlign.Left);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Music)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.template).to.equal('Music: %MUSIC%');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Music)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.WordsAndMusic)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.template).to.equal(
            'Words & Music: %WORDSMUSIC%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.isVisible).to.be.false;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.WordsAndMusic)!.textAlign).to.equal(TextAlign.Right);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Transcriber)).to.be.false;

        expect(score.style!.headerAndFooter.has(ScoreSubElement.Copyright)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.template).to.equal(
            'Copyright: %COPYRIGHT%'
        );
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.Copyright)!.textAlign).to.equal(TextAlign.Center);

        expect(score.style!.headerAndFooter.has(ScoreSubElement.CopyrightSecondLine)).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.template).to.equal('Copyright2');
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.isVisible).to.be.true;
        expect(score.style!.headerAndFooter.get(ScoreSubElement.CopyrightSecondLine)!.textAlign).to.equal(
            TextAlign.Center
        );
    });
});
