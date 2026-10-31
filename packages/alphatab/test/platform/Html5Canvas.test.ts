/**
 * Tests for the HTML5 canvas text placement. Uses a fake 2d context with metrics as measured
 * in real browsers, so web-only.
 *
 * @target web
 */

import { Font } from '@coderline/alphatab/model/Font';
import { TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { Html5Canvas } from '@coderline/alphatab/platform/javascript/Html5Canvas';
import { Settings } from '@coderline/alphatab/Settings';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface FakeMetrics {
    alphabeticBaseline: number | undefined;
    fontBoundingBoxAscent: number | undefined;
}

class FakeContext {
    public font = '';
    public textBaseline = 'alphabetic';
    public textAlign = 'left';
    public lineWidth = 1;
    public readonly drawnY: number[] = [];
    private readonly _hangingMetrics: FakeMetrics;

    public constructor(hangingMetrics: FakeMetrics) {
        this._hangingMetrics = hangingMetrics;
    }

    public scale(): void {}

    public measureText(_text: string) {
        return { width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0, ...this._hangingMetrics };
    }

    public fillText(_text: string, _x: number, y: number): void {
        this.drawnY.push(y);
    }
}

describe('Html5CanvasTests', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function drawTopText(hangingMetrics: FakeMetrics): number {
        const context = new FakeContext(hangingMetrics);
        vi.stubGlobal('document', {
            createElement: () => ({ style: {}, getContext: () => context })
        });

        const canvas = new Html5Canvas();
        canvas.settings = new Settings();
        canvas.settings.display.resources.smuflFontFamilyName = 'Bravura';
        canvas.beginRender(100, 100);
        canvas.font = new Font('serif', 32);
        canvas.textBaseline = TextBaseline.Top;
        canvas.fillText('Lithium', 0, 10);
        return context.drawnY[0];
    }

    // 32px serif, measured with the 'hanging' baseline
    it('top-text-chromium-unchanged', () => {
        expect(drawTopText({ alphabeticBaseline: -23.2, fontBoundingBoxAscent: 5.8 })).toBeCloseTo(10, 6);
    });

    it('top-text-firefox-moved-to-chromium-placement', () => {
        // hanging at 0.6 em (19.2px) instead of 0.8 of the 34px ascent (27.2px)
        expect(drawTopText({ alphabeticBaseline: -19.2, fontBoundingBoxAscent: 14.8 })).toBeCloseTo(18, 6);
    });

    it('top-text-without-font-metrics-unchanged', () => {
        expect(drawTopText({ alphabeticBaseline: undefined, fontBoundingBoxAscent: undefined })).toBe(10);
    });
});
