import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { CssFontSvgCanvas } from '@coderline/alphatab/platform/svg/CssFontSvgCanvas';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';

// The SVG output must also be valid XML (e.g. when saved as .svg file), so every character
// reference needs its terminating semicolon.
describe('CssFontSvgCanvasTests', () => {
    function createCanvas(): CssFontSvgCanvas {
        const canvas = new CssFontSvgCanvas();
        canvas.settings = new Settings();
        canvas.beginRender(100, 100);
        return canvas;
    }

    it('terminates-single-symbol-references', () => {
        const canvas = createCanvas();
        canvas.fillMusicFontSymbol(10, 10, 1, MusicFontSymbol.GClef, false);
        const svg = canvas.endRender() as string;
        expect(svg).toContain(`>&#${MusicFontSymbol.GClef as number};</text>`);
    });

    it('terminates-symbol-list-references', () => {
        const canvas = createCanvas();
        canvas.fillMusicFontSymbols(10, 10, 1, [MusicFontSymbol.GClef, MusicFontSymbol.FClef], false);
        const svg = canvas.endRender() as string;
        expect(svg).toContain(`>&#${MusicFontSymbol.GClef as number};&#${MusicFontSymbol.FClef as number};</text>`);
    });
});
