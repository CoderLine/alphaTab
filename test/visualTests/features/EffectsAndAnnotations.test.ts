import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';

describe('EffectsAndAnnotationsTests', () => {
    it('markers', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/markers.gp5');
    });

    it('tempo', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tempo.gp5');
    });

    it('text', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/text.gp5');
    });

    it('chords', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/chords.gp5');
    });

    it('vibrato', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/vibrato.gp5');
    });

    it('dynamics', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/dynamics.gp5');
    });

    it('tap', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tap.gp5');
    });

    it('fade-in', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade-in.gp5');
    });

    it('let-ring', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/let-ring.gp5');
    });

    it('palm-mute', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/palm-mute.gp5');
    });

    it('bends', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/bends.gp');
    });

    it('tremolo-bar', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tremolo-bar.gp');
    });

    it('tremolo-picking', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tremolo-picking.gp5');
    });

    it('brush', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/brush.gp5');
    });

    it('slides', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/slides.gp5');
    });

    it('trill', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/trill.gp5');
    });

    it('pickStroke', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/pick-stroke.gp5');
    });

    it('tuplets', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets.gp5');
    });

    it('tuplets-advanced', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/tuplets-advanced.gp', undefined, [0,1,2]);
    });

    it('fingering', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/fingering.gpx');
    });

    it('triplet-feel', async () => {
        await VisualTestHelper.runVisualTest('effects-and-annotations/triplet-feel.gpx');
    });
});
