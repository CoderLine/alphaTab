import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { Color } from '@coderline/alphatab/model/Color';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { TuningDisplayMode } from '@coderline/alphatab/model/RenderStylesheet';
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

    function render(settings: Settings, score: Score, tracks: number[]): string[] {
        const renderer = new ScoreRenderer(settings);
        renderer.width = 800;
        const results: string[] = [];
        renderer.partialRenderFinished.on(e => {
            results.push(e.renderResult as string);
        });
        renderer.renderScore(score, tracks);
        return results;
    }

    it('score-info', () => {
        const settings = createSettings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        const unstyled = render(settings, score, [0]);

        score.style = new ScoreStyle();
        score.style.colors.set(ScoreSubElement.Title, null);
        score.style.colors.set(ScoreSubElement.Artist, null);

        expect(render(settings, score, [0])).toEqual(unstyled);
    });

    it('track-name', () => {
        const settings = createSettings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        const unstyled = render(settings, score, [0]);

        score.tracks[0].style = new TrackStyle();
        score.tracks[0].style.colors.set(TrackSubElement.TrackName, null);

        expect(render(settings, score, [0])).toEqual(unstyled);
    });

    it('system-separator', () => {
        const settings = createSettings();
        const bars = '0.6 3.6 0.5 2.5 | 0.6 3.6 0.5 2.5 | 0.6 3.6 0.5 2.5 | 0.6 3.6 0.5 2.5';
        const score = ScoreLoader.loadAlphaTex(
            `\\track "One" :4 ${bars} | ${bars} \\track "Two" :4 ${bars} | ${bars}`,
            settings
        );
        score.stylesheet.useSystemSignSeparator = true;
        const tracks = [0, 1];
        const unstyled = render(settings, score, tracks);
        expect(unstyled.join('')).toContain('&#' + (MusicFontSymbol.SystemDivider as number) + ';');

        // without an entry the separator is painted in the main glyph colour
        score.tracks[0].style = new TrackStyle();
        score.tracks[0].style.colors.set(TrackSubElement.SystemSeparator, settings.display.resources.mainGlyphColor);
        expect(render(settings, score, tracks)).toEqual(unstyled);

        score.tracks[0].style.colors.set(TrackSubElement.SystemSeparator, null);
        expect(render(settings, score, tracks)).toEqual(unstyled);
    });

    it('string-tuning-header', () => {
        const settings = createSettings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        score.stylesheet.tuningDisplayMode = TuningDisplayMode.Score;
        const unstyled = render(settings, score, [0]);

        score.tracks[0].style = new TrackStyle();
        score.tracks[0].style.colors.set(TrackSubElement.StringTuning, null);

        expect(render(settings, score, [0])).toEqual(unstyled);
    });

    it('string-tuning-inline', () => {
        const settings = createSettings();
        const score = ScoreLoader.loadAlphaTex(tex, settings);
        score.stylesheet.tuningDisplayMode = TuningDisplayMode.Staff;
        const unstyled = render(settings, score, [0]);

        score.tracks[0].style = new TrackStyle();
        score.tracks[0].style.colors.set(TrackSubElement.StringTuning, null);

        expect(render(settings, score, [0])).toEqual(unstyled);
    });
});
