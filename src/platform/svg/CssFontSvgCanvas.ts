import { TextAlign } from '@src/platform/ICanvas';
import { SvgCanvas } from '@src/platform/svg/SvgCanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

/**
 * This SVG canvas renders the music symbols by adding a CSS class 'at' to all elements.
 */
export class CssFontSvgCanvas extends SvgCanvas {
    public fillMusicFontSymbol(
        x: number,
        y: number,
        relativeScale: number,
        symbol: MusicFontSymbol,
        centerAtPosition?: boolean
    ): void {
        if (symbol === MusicFontSymbol.None) {
            return;
        }
        this.fillMusicFontSymbolText(x, y, relativeScale, `&#${symbol};`, centerAtPosition);
    }

    public fillMusicFontSymbols(
        x: number,
        y: number,
        relativeScale: number,
        symbols: MusicFontSymbol[],
        centerAtPosition?: boolean
    ): void {
        let s: string = '';
        for (const symbol of symbols) {
            if (symbol !== MusicFontSymbol.None) {
                s += `&#${symbol};`;
            }
        }
        this.fillMusicFontSymbolText(x, y, relativeScale, s, centerAtPosition);
    }

    private fillMusicFontSymbolText(
        x: number,
        y: number,
        relativeScale: number,
        symbols: string,
        centerAtPosition?: boolean
    ): void {
        x *= this.scale;
        y *= this.scale;

        this.buffer += `<g transform="translate(${x} ${y})" class="at" ><text`;
        const scale = this.scale * relativeScale;
        if (scale !== 1) {
            this.buffer += ` style="font-size: ${scale * 100}%; stroke:none"`;
        } else {
            this.buffer += ' style="stroke:none"';
        }
        if (this.color.rgba !== '#000000') {
            this.buffer += ` fill="${this.color.rgba}"`;
        }
        if (centerAtPosition) {
            this.buffer += ` text-anchor="${this.getSvgTextAlignment(TextAlign.Center)}"`;
        }
        this.buffer += `>${symbols}</text></g>`;
    }
}
