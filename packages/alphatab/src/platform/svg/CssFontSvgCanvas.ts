import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { SvgCanvas } from '@coderline/alphatab/platform/svg/SvgCanvas';

/**
 * This SVG canvas renders the music symbols by adding a CSS class 'at' to all elements.
 * @internal
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
        this._fillMusicFontSymbolText(x, y, relativeScale, `&#${symbol};`, centerAtPosition);
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
        this._fillMusicFontSymbolText(x, y, relativeScale, s, centerAtPosition);
    }

    private _fillMusicFontSymbolText(
        x: number,
        y: number,
        relativeScale: number,
        symbols: string,
        centerAtPosition?: boolean
    ): void {
        const s = this.scale;
        if (s === 1) {
            this.buffer += '<g transform="translate(' + x + ' ' + y + ')" class="at" ><text';
        } else {
            const sx = x * s;
            const sy = y * s;
            this.buffer += `<g transform="translate(${sx} ${sy})" class="at" ><text`;
        }
        const scale = s * relativeScale;
        if (scale !== 1) {
            this.buffer += ` style="font-size: ${scale * 100}%; stroke:none"`;
        } else {
            this.buffer += ' style="stroke:none"';
        }
        if (this.color.rgba !== '#000000') {
            this.buffer += ' fill="' + this.color.rgba + '"';
        }
        if (centerAtPosition) {
            this.buffer += ' text-anchor="middle"';
        }
        this.buffer += '>' + symbols + '</text></g>';
    }
}
