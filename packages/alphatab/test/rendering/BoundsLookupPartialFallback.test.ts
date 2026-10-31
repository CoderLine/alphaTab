/**
 * A render with `firstChangedMasterBar` keeps the bounds of the systems before the change. When the
 * layout cannot update only the changed systems and lays out the whole score instead, the bounds
 * lookup must equal the one of a fresh render.
 */
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Duration } from '@coderline/alphatab/model/Duration';
import type { Score } from '@coderline/alphatab/model/Score';
import type { RenderHints } from '@coderline/alphatab/rendering/IScoreRenderer';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

/**
 * @internal
 */
class PartialFallbackRenderHints implements RenderHints {
    public reuseViewport?: boolean;
    public firstChangedMasterBar?: number;
}

describe('BoundsLookupPartialFallback', () => {
    const barCount = 12;

    function createSettings(layoutMode: LayoutMode, lazy: boolean): Settings {
        const settings = new Settings();
        settings.core.engine = 'svg';
        settings.core.enableLazyLoading = lazy;
        settings.display.layoutMode = layoutMode;
        settings.display.barsPerRow = 3;
        return settings;
    }

    function createScore(settings: Settings): Score {
        let tex = '\\track \\staff {score} :4 ';
        for (let i = 0; i < barCount; i++) {
            tex += 'C4 D4 E4 F4 | ';
        }
        return ScoreLoader.loadAlphaTex(tex, settings);
    }

    function createRenderer(settings: Settings, score: Score): ScoreRenderer {
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1000;
        const tracks: number[] = [0];
        renderer.renderScore(score, tracks);
        return renderer;
    }

    /** The master bars of every staff system and how often each beat is listed. */
    function describeLookup(lookup: BoundsLookup, score: Score): string {
        const lines: string[] = [];
        for (const staffSystem of lookup.staffSystems) {
            const masterBars: string[] = [];
            for (const masterBar of staffSystem.bars) {
                masterBars.push(`${masterBar.index}`);
            }
            lines.push(`system ${masterBars.join(',')}`);
        }
        for (const bar of score.tracks[0].staves[0].bars) {
            for (const beat of bar.voices[0].beats) {
                const all = lookup.findBeats(beat);
                const count = all !== null ? all.length : 0;
                lines.push(`bar ${bar.index} beat ${beat.index}: ${count}`);
            }
        }
        return lines.join('\n');
    }

    function renderPartial(renderer: ScoreRenderer, firstChangedMasterBar: number) {
        const hints = new PartialFallbackRenderHints();
        hints.firstChangedMasterBar = firstChangedMasterBar;
        renderer.render(hints);
    }

    function expectLikeFreshRender(renderer: ScoreRenderer, settings: Settings, score: Score) {
        const fresh = createRenderer(settings, score);
        expect(fresh.boundsLookup!.staffSystems.length).toBeGreaterThan(0);
        expect(describeLookup(renderer.boundsLookup!, score)).toBe(describeLookup(fresh.boundsLookup!, score));
    }

    it('page-partial-update', () => {
        const settings = createSettings(LayoutMode.Page, true);
        const score = createScore(settings);
        const renderer = createRenderer(settings, score);
        renderPartial(renderer, 7);
        expectLikeFreshRender(renderer, settings, score);
    });

    it('page-spacing-reference-changed', () => {
        const settings = createSettings(LayoutMode.Page, true);
        const score = createScore(settings);
        const renderer = createRenderer(settings, score);
        const beats = score.tracks[0].staves[0].bars[barCount - 1].voices[0].beats;
        const last = beats[beats.length - 1];
        last.duration = Duration.TwoHundredFiftySixth;
        last.updateDurations();
        renderPartial(renderer, barCount - 1);
        expectLikeFreshRender(renderer, settings, score);
    });

    it('page-without-lazy-loading', () => {
        const settings = createSettings(LayoutMode.Page, false);
        const score = createScore(settings);
        const renderer = createRenderer(settings, score);
        renderPartial(renderer, 7);
        expectLikeFreshRender(renderer, settings, score);
    });

    it('horizontal', () => {
        const settings = createSettings(LayoutMode.Horizontal, true);
        settings.display.barCountPerPartial = 3;
        const score = createScore(settings);
        const renderer = createRenderer(settings, score);
        renderPartial(renderer, 7);
        expectLikeFreshRender(renderer, settings, score);
    });
});
