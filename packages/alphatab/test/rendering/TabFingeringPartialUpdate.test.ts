/**
 * A transposed tab is fingered per segment of linked bars. A partial render starting inside a
 * segment which began in an earlier system must re-finger the whole segment like a fresh render.
 */
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Score } from '@coderline/alphatab/model/Score';
import type { RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { TabBarRenderer } from '@coderline/alphatab/rendering/TabBarRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class TabFingeringRenderHints implements RenderHints {
    public reuseViewport?: boolean;
    public firstChangedMasterBar?: number;
}

describe('TabFingeringPartialUpdate', () => {
    /**
     * @static
     */
    function createSettings(): Settings {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = true;
        settings.display.barsPerRow = 2;
        return settings;
    }

    /**
     * @static
     */
    function createScore(settings: Settings): Score {
        // the hammer-on crosses from the first into the second system
        return ScoreLoader.loadAlphaTex(
            '\\track \\staff { tabs } \\transpose -4 :4 5.3 5.3 5.3 5.3 | 5.3 5.3 5.3 2.3{h} | 4.3 5.3 5.3 5.3 | 5.3 5.3 5.3 5.3',
            settings
        );
    }

    /**
     * @static
     */
    function render(settings: Settings, score: Score): ScoreRenderer {
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1000;
        renderer.renderScore(score, [0]);
        return renderer;
    }

    /**
     * @static
     */
    function displayString(renderer: ScoreRenderer, note: Note): number {
        const tab = renderer.layout!.getRendererForBar(TabBarRenderer.StaffId, note.beat.voice.bar) as TabBarRenderer;
        return tab.getDisplayString(note);
    }

    it('re-fingers the segment started in an earlier system', () => {
        const settings = createSettings();
        const score = createScore(settings);
        const staff = score.tracks[0].staves[0];
        const origin = staff.bars[1].voices[0].beats[3].notes[0];
        const destination = staff.bars[2].voices[0].beats[0].notes[0];

        const renderer = render(settings, score);
        // moved to the D string together with its destination
        expect(displayString(renderer, origin)).toBe(3);
        expect(displayString(renderer, destination)).toBe(3);

        // the destination does not fit on the D string anymore, the pair stays on the G string
        destination.fret = 24;
        const hints = new TabFingeringRenderHints();
        hints.firstChangedMasterBar = 2;
        renderer.render(hints);

        const fresh = render(settings, score);
        expect(displayString(fresh, origin)).toBe(4);
        expect(displayString(renderer, origin)).toBe(displayString(fresh, origin));
        expect(displayString(renderer, destination)).toBe(displayString(fresh, destination));
    });
});
