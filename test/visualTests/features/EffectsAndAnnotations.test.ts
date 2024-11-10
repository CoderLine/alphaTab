import { AlphaTexImporter } from '@src/importer/AlphaTexImporter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('EffectsAndAnnotationsTests', () => {
    it('markers', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/markers.gp');
    });

    it('tempo', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tempo.gp');
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
        // quadratic curve rendering in SkiaSharp is edgy with m80,
        // tolerance compensates this
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade-in.gp', undefined, undefined, undefined, 2);
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
        const tex = `14.1.2 :8 17.2 15.1 14.1{h} 17.2{ss} | 18.2`;
        const settings = new Settings();
        settings.display.barsPerRow = 1;

        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        let score = importer.readScore();

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [400],
            ['effects-and-annotations/slides-line-break.png'],
            settings
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
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets-advanced.gp', undefined, [0, 1, 2]);
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
        await VisualTestHelper.runVisualTestWithResize(
            'effects-and-annotations/sustain.gp',
            [1200, 850, 600],
            [
                'effects-and-annotations/sustain-1200.png',
                'effects-and-annotations/sustain-850.png',
                'effects-and-annotations/sustain-600.png'
            ]
        );
    });

    it('sustain-pedal-alphatex', async () => {
        const importer = new AlphaTexImporter();
        const settings = new Settings();
        importer.initFromString(
            `
        .
        \\track "pno."
        :8 G4 { spd } G4 G4 { spu } G4 G4 { spd } G4 {spu} G4 G4 {spd} |
        G4 { spu } G4 G4 G4 G4 G4 G4 G4 |
        F5.1 { spd } | F5 | F5 |
        F5.4 F5.4 { spu } F5 F5 |
        G4.8 { spd } G4 G4 { spu } G4 G4 { spd } G4 G4 G4 {spu} |
        G4.4 G4.4 G4.4 {spd} G4.4 {spe}
        `,
            settings
        );
        const score = importer.readScore();
        score.stylesheet.hideDynamics = true;

        await VisualTestHelper.runVisualTestScoreWithResize(
            score,
            [1200, 850, 600],
            [
                'effects-and-annotations/sustain-1200.png',
                'effects-and-annotations/sustain-850.png',
                'effects-and-annotations/sustain-600.png'
            ]
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
});
