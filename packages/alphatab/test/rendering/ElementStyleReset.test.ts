import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { Color } from '@coderline/alphatab/model/Color';
import { type Score, ScoreStyle, ScoreSubElement } from '@coderline/alphatab/model/Score';
import { TrackStyle, TrackSubElement } from '@coderline/alphatab/model/Track';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

/**
 * A `null` entry in a style resets the element to its default colour: the element looks as if it had no style.
 */
describe('ElementStyleResetTests', () => {
    const tex =
        '\\title "Title" \\artist "Artist" \\track "Track Name" \\staff {score tabs} :4 0.6 3.6 0.5 2.5 | 0.6 3.6 0.5 2.5';

    function createSettings(): Settings {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = false;
        // distinct default colours make a wrong default visible in the output
        settings.display.resources.mainGlyphColor = Color.fromJson('#404040')!;
        settings.display.resources.scoreInfoColor = Color.fromJson('#8000FF')!;
        settings.display.resources.barSeparatorColor = Color.fromJson('#0080C0')!;
        return settings;
    }

    function render(settings: Settings, score: Score): string[] {
        const renderer = new ScoreRenderer(settings);
        renderer.width = 800;
        const results: string[] = [];
        renderer.partialRenderFinished.on(e => {
            results.push(e.renderResult as string);
        });
        renderer.renderScore(score, [0]);
        return results;
    }

    it('score-info', () => {
        const settings = createSettings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        const unstyled = render(settings, score);

        score.style = new ScoreStyle();
        score.style.colors.set(ScoreSubElement.Title, null);
        score.style.colors.set(ScoreSubElement.Artist, null);

        expect(render(settings, score)).toEqual(unstyled);
    });

    it('track-name', () => {
        const settings = createSettings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        const unstyled = render(settings, score);

        score.tracks[0].style = new TrackStyle();
        score.tracks[0].style.colors.set(TrackSubElement.TrackName, null);

        expect(render(settings, score)).toEqual(unstyled);
    });
});
