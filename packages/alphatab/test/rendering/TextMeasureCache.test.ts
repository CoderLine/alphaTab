import { Font, FontStyle } from '@coderline/alphatab/model/Font';
import { CssFontSvgCanvas } from '@coderline/alphatab/platform/svg/CssFontSvgCanvas';
import { TextMeasureCache } from '@coderline/alphatab/rendering/utils/TextMeasureCache';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

describe('TextMeasureCacheTests', () => {
    function createCanvas(): CssFontSvgCanvas {
        const canvas = new CssFontSvgCanvas();
        canvas.settings = new Settings();
        return canvas;
    }

    it('reuses-measurements-per-font-and-text', () => {
        const canvas = createCanvas();
        const cache = new TextMeasureCache();
        const small = new Font('Arial', 10, FontStyle.Plain);
        const large = new Font('Arial', 20, FontStyle.Plain);

        canvas.font = small;
        const first = cache.measureText(canvas, '12');
        expect(cache.measureText(canvas, '12')).toBe(first);
        expect(cache.measureText(canvas, '1').width).toBeLessThan(first.width);

        canvas.font = large;
        const largeFirst = cache.measureText(canvas, '12');
        expect(largeFirst.width).toBeGreaterThan(first.width);

        canvas.font = small;
        expect(cache.measureText(canvas, '12')).toBe(first);
    });

    it('remeasures-after-font-change', () => {
        const canvas = createCanvas();
        const cache = new TextMeasureCache();
        const font = new Font('Arial', 10, FontStyle.Plain);
        canvas.font = font;
        const before = cache.measureText(canvas, '12');

        font.size = 20;
        const after = cache.measureText(canvas, '12');
        expect(after.width).toBeGreaterThan(before.width);
    });

    it('remeasures-on-other-canvas-and-after-clear', () => {
        const cache = new TextMeasureCache();
        const font = new Font('Arial', 10, FontStyle.Plain);
        const canvas = createCanvas();
        canvas.font = font;
        const first = cache.measureText(canvas, '12');

        const other = createCanvas();
        other.font = font;
        const onOther = cache.measureText(other, '12');
        expect(onOther === first).toBe(false);
        expect(onOther.width).toBe(first.width);

        cache.clear();
        expect(cache.measureText(other, '12') === onOther).toBe(false);
    });
});
