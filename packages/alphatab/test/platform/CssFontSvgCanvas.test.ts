import { Color } from '@coderline/alphatab/model/Color';
import { Font, FontStyle } from '@coderline/alphatab/model/Font';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
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

    it('attributes-follow-state-changes', () => {
        const canvas = createCanvas();
        const black = new Color(0, 0, 0, 0xff);
        canvas.color = black;
        canvas.fillRect(1, 2, 3, 4);
        canvas.color = new Color(255, 0, 0, 0xff);
        canvas.fillRect(1.5, 2, 3, 4);
        canvas.color = black;
        canvas.fillRect(1, 2, 3, 4);
        canvas.font = new Font('Arial', 12, FontStyle.Plain);
        canvas.textBaseline = TextBaseline.Middle;
        canvas.textAlign = TextAlign.Center;
        canvas.fillText('a', 5, 6);
        canvas.textAlign = TextAlign.Left;
        canvas.fillText('b', 5, 6);
        canvas.color = new Color(0, 0, 255, 0xff);
        canvas.fillText('c', 5, 6);
        canvas.textBaseline = TextBaseline.Alphabetic;
        canvas.fillText('d', 5, 6);
        canvas.font = new Font('Arial', 14, FontStyle.Plain);
        canvas.fillText('e', 5, 6);
        canvas.fillMusicFontSymbol(10, 10, 1, MusicFontSymbol.GClef, false);
        canvas.fillMusicFontSymbol(10, 10, 0.5, MusicFontSymbol.GClef, true);
        canvas.color = black;
        canvas.fillMusicFontSymbol(10, 10, 0.5, MusicFontSymbol.GClef, true);
        canvas.fillMusicFontSymbol(10, 10, 0.5, MusicFontSymbol.GClef, false);
        const svg = canvas.endRender() as string;

        const clef = `&#${MusicFontSymbol.GClef as number};`;
        const expected =
            '<rect x="1" y="2" width="3" height="4" fill="#000000" />\n' +
            '<rect x="1.5" y="2" width="3" height="4" fill="#FF0000" />\n' +
            '<rect x="1" y="2" width="3" height="4" fill="#000000" />\n' +
            '<text x="5" y="6" style=\'stroke: none; font:12px Arial; dominant-baseline: middle\' text-anchor="middle">a</text>' +
            '<text x="5" y="6" style=\'stroke: none; font:12px Arial; dominant-baseline: middle\'>b</text>' +
            '<text x="5" y="6" style=\'stroke: none; font:12px Arial; dominant-baseline: middle\' fill="#0000FF">c</text>' +
            '<text x="5" y="6" style=\'stroke: none; font:12px Arial; \' fill="#0000FF">d</text>' +
            '<text x="5" y="6" style=\'stroke: none; font:14px Arial; \' fill="#0000FF">e</text>' +
            `<g transform="translate(10 10)" class="at" ><text style="stroke:none" fill="#0000FF">${clef}</text></g>` +
            `<g transform="translate(10 10)" class="at" ><text style="font-size: 50%; stroke:none" fill="#0000FF" text-anchor="middle">${clef}</text></g>` +
            `<g transform="translate(10 10)" class="at" ><text style="font-size: 50%; stroke:none" text-anchor="middle">${clef}</text></g>` +
            `<g transform="translate(10 10)" class="at" ><text style="font-size: 50%; stroke:none">${clef}</text></g>` +
            '</svg>';
        expect(svg.substring(svg.indexOf('\n') + 1)).toBe(expected);
    });

    it('begin-render-starts-a-new-document', () => {
        const canvas = createCanvas();
        canvas.fillRect(1, 2, 3, 4);
        const first = canvas.endRender() as string;
        canvas.beginRender(50, 60);
        canvas.fillRect(5, 6, 7, 8);
        const second = canvas.endRender() as string;

        expect(first.indexOf('width="100px"') > 0).toBe(true);
        expect(first.indexOf('<rect x="1"') > 0).toBe(true);
        expect(second.indexOf('<svg') === 0).toBe(true);
        expect(second.indexOf('width="50px" height="60px"') > 0).toBe(true);
        expect(second.indexOf('<rect x="1"') < 0).toBe(true);
        expect(second.indexOf('<rect x="5"') > 0).toBe(true);
        expect(second.indexOf('</svg>')).toBe(second.length - 6);
    });
});
