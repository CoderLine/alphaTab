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

    it('text', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/text.gp');
    });

    it('chords', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/chords.gp');
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
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade-in.gp', 
        undefined, undefined, undefined, 2);
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

        await VisualTestHelper.runVisualTestScoreWithResize(score,
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
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets-advanced.gp', undefined, [0,1,2]);
    });

    it('fingering', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fingering.gp');
    });

    it('triplet-feel', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/triplet-feel.gp');
    });
});
