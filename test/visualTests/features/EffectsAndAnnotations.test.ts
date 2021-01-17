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
        await VisualTestHelper.runVisualTest('effects-and-annotations/fade-in.gp');
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
