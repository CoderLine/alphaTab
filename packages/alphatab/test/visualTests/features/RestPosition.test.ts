import { describe, it } from 'vitest';
import { Settings } from '@coderline/alphatab/Settings';
import { RestPosition } from '@coderline/alphatab/model/RestPosition';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
const primaryDurations = `r.1 | r.2 e5.2 | r.4 e5.4 *3 | r.8 e5.8 *7 | r.16 e5.16 *15 | r.32 e5.32 *31`;
const secondaryDurations = `e4.1 | e4.2 r.2 | e4.4 *3 r.4 | e4.8 *7 r.8 | e4.16 *15 r.16 | e4.32 *31 r.32`;
const restPositionEntries = Object.entries(RestPosition).filter(([k]) => isNaN(Number(k))) as [string, RestPosition][];

describe('RestPositionTests', () => {
    it('rest-position-default', async () => {
        await VisualTestHelper.runVisualTestTex(
            primaryDurations,
            'test-data/visual-tests/rest-position/rest-position-default.png'
        );
    });

    it('rest-position-default-multi-voice', async () => {
        await VisualTestHelper.runVisualTestTex(
            `\\voice ${primaryDurations} \\voice ${secondaryDurations}`,
            'test-data/visual-tests/rest-position/rest-position-default-multi-voice.png'
        );
    });

    describe('rest-position-main', () => {
        for (const [name, value] of restPositionEntries) {
            it(`position-${name}`, async () => {
                const settings = new Settings();
                settings.display.resources.engravingSettings.restPositionMain = value;
                await VisualTestHelper.runVisualTestTex(
                    primaryDurations,
                    `test-data/visual-tests/rest-position/rest-position-main-${name}.png`,
                    settings
                );
            });
        }
    });

    it('rest-position-durations', async () => {
        const settings = new Settings();
        settings.display.resources.engravingSettings.restPositionMain = RestPosition.Line5;
        await VisualTestHelper.runVisualTestTex(
            primaryDurations,
            'test-data/visual-tests/rest-position/rest-position-durations.png',
            settings
        );
    });

    it('rest-position-multi-voice-both-set', async () => {
        const settings = new Settings();
        settings.display.resources.engravingSettings.restPositionMain = RestPosition.Line5;
        settings.display.resources.engravingSettings.restPositionSecondary = RestPosition.Line1;
        await VisualTestHelper.runVisualTestTex(
            `\\voice ${primaryDurations} \\voice ${secondaryDurations}`,
            'test-data/visual-tests/rest-position/rest-position-multi-voice-both-set.png',
            settings
        );
    });

    it('rest-position-multi-voice-main-only', async () => {
        const settings = new Settings();
        settings.display.resources.engravingSettings.restPositionMain = RestPosition.Line5;
        await VisualTestHelper.runVisualTestTex(
            `\\voice ${primaryDurations} \\voice ${secondaryDurations}`,
            'test-data/visual-tests/rest-position/rest-position-multi-voice-main-only.png',
            settings
        );
    });

    it('rest-position-multi-voice-secondary-only', async () => {
        const settings = new Settings();
        settings.display.resources.engravingSettings.restPositionSecondary = RestPosition.Line1;
        await VisualTestHelper.runVisualTestTex(
            `\\voice ${primaryDurations} \\voice ${secondaryDurations}`,
            'test-data/visual-tests/rest-position/rest-position-multi-voice-secondary-only.png',
            settings
        );
    });

    describe('rest-position-staff-lines', () => {
        for (const lineCount of [1, 2, 3, 4, 5]) {
            it(`linecount-${lineCount}`, async () => {
                const settings = new Settings();
                settings.display.resources.engravingSettings.restPositionMain = RestPosition.Line1;
                await VisualTestHelper.runVisualTestTex(
                    `\\staff { score ${lineCount} } ${primaryDurations}`,
                    `test-data/visual-tests/rest-position/rest-position-staff-lines-${lineCount}.png`,
                    settings
                );
            });
        }
    });
});
