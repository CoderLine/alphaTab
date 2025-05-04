import { SystemsLayoutMode } from '@src/DisplaySettings';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { BeatBarreEffectInfo } from '@src/rendering/effects/BeatBarreEffectInfo';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';
import { VisualTestHelper, VisualTestOptions, VisualTestRun } from '@test/visualTests/VisualTestHelper';
import { expect } from 'chai';

describe('EffectsAndAnnotationsTests', () => {
    it('markers', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/markers.gp');
    });

    it('tempo', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tempo.gp');
    });

    it('tempo-text', async () => {
        await VisualTestHelper.runVisualTestTex(
            `
            \\tempo 90 "First"
            .
            :4 3.3*4 | 3.3 3.3 {v f tempo 120 "Other" } 3.3 6.3
        `,
            'test-data/visual-tests/effects-and-annotations/tempo-text.png'
        );
    });

    it('beat-tempo-change', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/beat-tempo-change.gp');
    });

    it('text', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/text.gp');
    });

    it('chords', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/chords.gp');
    });

    it('chords-duplicates', async () => {
        // This file was manually modified to contain 2 separate chords with the same details.
        await VisualTestHelper.runVisualTest('effects-and-annotations/chords-duplicates.gp');
    });

    it('vibrato', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/vibrato.gp');
    });

    it('dynamics', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/dynamics.gp');
    });

    it('tap', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tap.gp');
    });

    it('fade-in', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade-in.gp');
    });

    it('fade', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade.gp');
    });

    it('let-ring', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/let-ring.gp');
    });

    it('palm-mute', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/palm-mute.gp');
    });

    it('bends', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/bends.gp');
    });

    it('tremolo-bar', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tremolo-bar.gp');
    });

    it('tremolo-picking', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tremolo-picking.gp');
    });

    it('brush', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/brush.gp');
    });

    it('slides', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/slides.gp');
    });

    it('slides-line-break', async () => {
        const tex = '14.1.2 :8 17.2 15.1 14.1{h} 17.2{ss} | 18.2';
        const settings = new Settings();
        settings.display.barsPerRow = 1;

        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        const score = importer.readScore();

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [new VisualTestRun(400, 'test-data/visual-tests/effects-and-annotations/slides-line-break.png')],
                settings
            )
        );
    });

    it('trill', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/trill.gp');
    });

    it('pickStroke', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/pick-stroke.gp');
    });

    it('tuplets', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets.gp');
    });

    it('tuplets-advanced', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets-advanced.gp', undefined, o => {
            o.tracks = [0, 1, 2];
        });
    });

    it('fingering', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fingering.gp');
    });

    it('triplet-feel', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/triplet-feel.gp');
    });

    it('free-time', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/free-time.gp');
    });

    it('fingering-new', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fingering-new.gp');
    });

    it('accentuations', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/accentuations.gp');
    });

    it('string-numbers', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/string-numbers.gp');
    });

    it('beat-slash', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/beat-slash.gp');
    });

    it('sustain-pedal', async () => {
        await VisualTestHelper.runVisualTestFull(
            await VisualTestOptions.file('effects-and-annotations/sustain.gp', [
                new VisualTestRun(1200, 'test-data/visual-tests/effects-and-annotations/sustain-1200.png'),
                new VisualTestRun(850, 'test-data/visual-tests/effects-and-annotations/sustain-850.png'),
                new VisualTestRun(600, 'test-data/visual-tests/effects-and-annotations/sustain-600.png')
            ])
        );
    });

    it('sustain-pedal-alphatex', async () => {
        const importer = new AlphaTexImporter();
        const settings = new Settings();
        importer.initFromString(
            `
        .
        \\track "pno."
        :8 G3 { spd } G3 G3 { spu } G3 G3 { spd } G3 {spu} G3 G3 {spd} |
        G3 { spu } G3 G3 G3 G3 G3 G3 G3 |
        F4.1 { spd } | F4 | F4 |
        F4.4 F4.4 { spu } F4 F4 |
        G3.8 { spd } G3 G3 { spu } G3 G3 { spd } G3 G3 G3 {spu} |
        G3.4 G3.4 G3.4 {spd} G3.4 {spe}
        `,
            settings
        );
        const score = importer.readScore();
        score.stylesheet.hideDynamics = true;

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [
                    new VisualTestRun(1200, 'test-data/visual-tests/effects-and-annotations/sustain-1200.png'),
                    new VisualTestRun(850, 'test-data/visual-tests/effects-and-annotations/sustain-850.png'),
                    new VisualTestRun(600, 'test-data/visual-tests/effects-and-annotations/sustain-600.png')
                ],
                settings
            )
        );
    });

    it('dead-slap', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/dead-slap.gp');
    });

    it('golpe', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/golpe.gp');
    });

    it('golpe-tab', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/golpe-tab.gp');
    });

    it('roman-numbers', () => {
        expect(BeatBarreEffectInfo.toRoman(0)).to.equal('');
        expect(BeatBarreEffectInfo.toRoman(1)).to.equal('I');
        expect(BeatBarreEffectInfo.toRoman(2)).to.equal('II');
        expect(BeatBarreEffectInfo.toRoman(3)).to.equal('III');
        expect(BeatBarreEffectInfo.toRoman(4)).to.equal('IV');
        expect(BeatBarreEffectInfo.toRoman(5)).to.equal('V');
        expect(BeatBarreEffectInfo.toRoman(6)).to.equal('VI');
        expect(BeatBarreEffectInfo.toRoman(7)).to.equal('VII');
        expect(BeatBarreEffectInfo.toRoman(8)).to.equal('VIII');
        expect(BeatBarreEffectInfo.toRoman(9)).to.equal('IX');
        expect(BeatBarreEffectInfo.toRoman(10)).to.equal('X');
        expect(BeatBarreEffectInfo.toRoman(11)).to.equal('XI');
        expect(BeatBarreEffectInfo.toRoman(12)).to.equal('XII');
        expect(BeatBarreEffectInfo.toRoman(13)).to.equal('XIII');
        expect(BeatBarreEffectInfo.toRoman(14)).to.equal('XIV');
        expect(BeatBarreEffectInfo.toRoman(15)).to.equal('XV');
        expect(BeatBarreEffectInfo.toRoman(16)).to.equal('XVI');
        expect(BeatBarreEffectInfo.toRoman(17)).to.equal('XVII');
        expect(BeatBarreEffectInfo.toRoman(18)).to.equal('XVIII');
        expect(BeatBarreEffectInfo.toRoman(19)).to.equal('XIX');
        expect(BeatBarreEffectInfo.toRoman(20)).to.equal('XX');
        expect(BeatBarreEffectInfo.toRoman(21)).to.equal('XXI');
        expect(BeatBarreEffectInfo.toRoman(22)).to.equal('XXII');
        expect(BeatBarreEffectInfo.toRoman(23)).to.equal('XXIII');
        expect(BeatBarreEffectInfo.toRoman(24)).to.equal('XXIV');
        expect(BeatBarreEffectInfo.toRoman(25)).to.equal('XXV');
        expect(BeatBarreEffectInfo.toRoman(26)).to.equal('XXVI');
        expect(BeatBarreEffectInfo.toRoman(27)).to.equal('XXVII');
        expect(BeatBarreEffectInfo.toRoman(28)).to.equal('XXVIII');
        expect(BeatBarreEffectInfo.toRoman(29)).to.equal('XXIX');
    });

    it('barre', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/barre.gp');
    });

    it('ornaments', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/ornaments.gp');
    });

    it('rasgueado', async () => {
        const settings = new Settings();
        settings.display.systemsLayoutMode = SystemsLayoutMode.UseModelLayout;
        await VisualTestHelper.runVisualTest('effects-and-annotations/rasgueado.gp', settings);
    });

    it('bend-vibrato-default', async () => {
        const inputFileData = await TestPlatform.loadFile(
            'test-data/visual-tests/effects-and-annotations/bend-vibrato.gp'
        );
        const settings = new Settings();
        const score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [new VisualTestRun(-1, 'test-data/visual-tests/effects-and-annotations/bend-vibrato-default.png')],
                settings
            )
        );
    });

    it('bend-vibrato-songbook', async () => {
        const inputFileData = await TestPlatform.loadFile(
            'test-data/visual-tests/effects-and-annotations/bend-vibrato.gp'
        );
        const settings = new Settings();
        settings.setSongBookModeSettings();
        const score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);

        await VisualTestHelper.runVisualTestFull(
            new VisualTestOptions(
                score,
                [new VisualTestRun(-1, 'test-data/visual-tests/effects-and-annotations/bend-vibrato-songbook.png')],
                settings
            )
        );
    });

    it('directions-simple', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/directions-simple.gp');
    });

    it('directions-symbols', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/directions-symbols.gp');
    });

    it('timer', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/timer.gp');
    });

    it('legato', async () => {
        await VisualTestHelper.runVisualTestTex(
            '3.3.4{ legatoOrigin } 10.3.4',
            'test-data/visual-tests/effects-and-annotations/legato.png'
        );
    });
});
