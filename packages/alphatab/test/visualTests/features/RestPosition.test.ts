import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
import { describe, it } from 'vitest';

// Visual coverage for the rest-display-pitch pipeline. Each test renders the rest and a note at the same
// pitch so the reader can verify they land at the same staff position. The exhaustive step-math invariant
// is covered by AccidentalHelperRestDisplay.test.ts.

// Renders one bar per rest duration, each pairing the overridden rest with a note at the same pitch.
// The whole-rest bar and the whole-note bar are separate since either occupies a full 4/4 measure.
function restVsNote(tex: string, pitch: string): string {
    const prefix = tex ? `${tex} ` : '';
    const rest = (d: string) => `r.${d}{restDisplayPitch ${pitch}}`;
    return [
        `${prefix}${rest('1')}`,
        `${pitch}.1`,
        `${rest('2')} ${pitch}.2`,
        `${rest('4')} ${pitch}.4 *3`,
        `${rest('8')} ${pitch}.8 *7`,
        `${rest('16')} ${pitch}.16 *15`,
        `${rest('32')} ${pitch}.32 *31`
    ].join(' | ');
}

describe('RestPositionTests', () => {
    it('rest-position-default', async () => {
        await VisualTestHelper.runVisualTestTex(
            'r.1 | r.2 e5.2 | r.4 e5.4 *3 | r.8 e5.8 *7 | r.16 e5.16 *15 | r.32 e5.32 *31',
            'test-data/visual-tests/rest-position/rest-position-default.png'
        );
    });

    it('rest-position-treble-E4', async () => {
        await VisualTestHelper.runVisualTestTex(
            restVsNote('', 'E4'),
            'test-data/visual-tests/rest-position/rest-position-treble-E4.png'
        );
    });

    it('rest-position-bass-G2', async () => {
        await VisualTestHelper.runVisualTestTex(
            restVsNote('\\clef bass', 'G2'),
            'test-data/visual-tests/rest-position/rest-position-bass-G2.png'
        );
    });

    it('rest-position-alto-F3', async () => {
        await VisualTestHelper.runVisualTestTex(
            restVsNote('\\clef alto', 'F3'),
            'test-data/visual-tests/rest-position/rest-position-alto-F3.png'
        );
    });

    it('rest-position-tenor-D3', async () => {
        await VisualTestHelper.runVisualTestTex(
            restVsNote('\\clef tenor', 'D3'),
            'test-data/visual-tests/rest-position/rest-position-tenor-D3.png'
        );
    });

    it('rest-position-staff-lines-1', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\staff { score 1 } ${restVsNote('', 'B4')}`,
            'test-data/visual-tests/rest-position/rest-position-staff-lines-1.png'
        );
    });

    it('rest-position-staff-lines-2', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\staff { score 2 } ${restVsNote('', 'B4')}`,
            'test-data/visual-tests/rest-position/rest-position-staff-lines-2.png'
        );
    });

    it('rest-position-staff-lines-3', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\staff { score 3 } ${restVsNote('', 'B4')}`,
            'test-data/visual-tests/rest-position/rest-position-staff-lines-3.png'
        );
    });

    it('rest-position-staff-lines-4', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\staff { score 4 } ${restVsNote('', 'B4')}`,
            'test-data/visual-tests/rest-position/rest-position-staff-lines-4.png'
        );
    });

    it('rest-position-staff-lines-5', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\staff { score 5 } ${restVsNote('', 'B4')}`,
            'test-data/visual-tests/rest-position/rest-position-staff-lines-5.png'
        );
    });

    it('rest-position-multi-voice', async () => {
        await VisualTestHelper.runVisualTestTex(
            '\\voice ' +
                'r.1{restDisplayPitch C5} | r.2{restDisplayPitch C5} C5.2 | r.4{restDisplayPitch C5} C5.4 *3' +
                ' \\voice ' +
                'E4.1 | E4.2 r.2{restDisplayPitch E4} | E4.4 *3 r.4{restDisplayPitch E4}',
            'test-data/visual-tests/rest-position/rest-position-multi-voice.png'
        );
    });
});
