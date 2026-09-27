import { AlphaTexImporter } from '@coderline/alphatab/importer/AlphaTexImporter';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import type { Score } from '@coderline/alphatab/model/Score';
import type { RenderFinishedEventArgs } from '@coderline/alphatab/rendering/RenderFinishedEventArgs';
import { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

describe('HorizontalScreenLayoutScale', () => {
    // more bars than display.barCountPerPartial so that multiple partials are produced
    const tex = `\\title "scale"\n.${new Array(24).fill('3.3.4*4').join(' | ')}`;

    function createSettings(scale: number): Settings {
        const settings = new Settings();
        settings.core.enableLazyLoading = true;
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.scale = scale;
        // the page padding is scale independent, without it the totals scale exactly
        settings.display.padding = [0, 0, 0, 0];
        return settings;
    }

    function loadScore(settings: Settings): Score {
        const importer = new AlphaTexImporter();
        importer.init(ByteBuffer.fromString(tex), settings);
        return importer.readScore();
    }

    function render(scale: number): [RenderFinishedEventArgs, RenderFinishedEventArgs[]] {
        const settings = createSettings(scale);
        const renderer = new ScoreRenderer(settings);
        renderer.width = 1300;

        const partials: RenderFinishedEventArgs[] = [];
        let total: RenderFinishedEventArgs | undefined;
        renderer.partialLayoutFinished.on(e => partials.push(e));
        renderer.renderFinished.on(e => {
            total = e;
        });
        renderer.error.on(e => {
            throw e;
        });
        renderer.renderScore(loadScore(settings), [0]);

        expect(total).toBeDefined();
        expect(partials.length).toBeGreaterThan(1);
        return [total!, partials];
    }

    it('scales the reported total width like the total height', () => {
        const [unscaled] = render(1);
        const [scaled] = render(2);

        expect(scaled.totalWidth).toBeCloseTo(unscaled.totalWidth * 2, 0);
        expect(scaled.totalHeight).toBeCloseTo(unscaled.totalHeight * 2, 0);
    });

    it('reports the same total width on the partials as on the final result', () => {
        const [total, partials] = render(2);

        for (const partial of partials) {
            expect(Math.abs(partial.totalWidth - total.totalWidth)).toBeLessThanOrEqual(2);
        }
    });
});
