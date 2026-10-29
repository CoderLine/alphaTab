import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { Logger } from '@coderline/alphatab/Logger';
import { LogLevel } from '@coderline/alphatab/LogLevel';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

/**
 * Numbered notation paints the beaming helpers of rests (duration lines under the 0),
 * so rest-only helpers take part in the beam overflow calculation of the bar.
 */
describe('NumberedRestBeaming', () => {
    function render(tex: string): Error[] {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.logLevel = LogLevel.None;
        Logger.logLevel = LogLevel.None;
        const importer = new AlphaTexImporter();
        importer.initFromString(tex, settings);
        const score = importer.readScore();

        const errors: Error[] = [];
        const renderer = new ScoreRenderer(settings);
        renderer.error.on(e => {
            errors.push(e);
        });
        renderer.width = 1300;
        renderer.renderScore(score, [0]);
        return errors;
    }

    function expectNoErrors(staff: string): void {
        const bars = ['r.1', 'r.1 {tu 3} r.1 {tu 3} r.1 {tu 3}', 'r.2 r.2', '3.3.2 r.2'];
        for (const bar of bars) {
            const errors = render(`\\track \\staff {${staff}} ${bar} | 3.3.4 3.3 3.3 3.3 |`);
            expect(errors.map(e => `${bar}: ${e.message}`).join('\n')).toBe('');
        }
    }

    it('numbered', () => {
        expectNoErrors('numbered');
    });

    it('slash-numbered', () => {
        expectNoErrors('slash numbered');
    });

    it('score-tabs-slash-numbered', () => {
        expectNoErrors('score tabs slash numbered');
    });
});
