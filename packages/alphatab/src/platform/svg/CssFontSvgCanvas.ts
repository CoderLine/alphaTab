/** biome-ignore-all lint/style/useTemplate: String concatenation is more efficient that templates */
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { SvgCanvas } from '@coderline/alphatab/platform/svg/SvgCanvas';

/**
 * This SVG canvas renders the music symbols by adding a CSS class 'at' to all elements.
 * @internal
 */
export class CssFontSvgCanvas extends SvgCanvas {
    private static _symbolTexts: Map<MusicFontSymbol, string> | null = null;

    private _symbolTailScale: number = -1;
    private _symbolTailColor: string = '';
    private _symbolTailCenter: boolean = false;
    private _symbolTail: string = '';

    private static _symbolText(symbol: MusicFontSymbol): string {
        let texts = CssFontSvgCanvas._symbolTexts;
        if (texts === null) {
            texts = new Map<MusicFontSymbol, string>();
            CssFontSvgCanvas._symbolTexts = texts;
        }
        let text = texts.get(symbol);
        if (text === undefined) {
            // as number: Kotlin would otherwise format the enum value as a double (57424.0)
            text = '&#' + (symbol as number) + ';';
            texts.set(symbol, text);
        }
        return text;
    }

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
        this._fillMusicFontSymbolText(x, y, relativeScale, CssFontSvgCanvas._symbolText(symbol), centerAtPosition);
    }

    public fillMusicFontSymbols(
        x: number,
        y: number,
        relativeScale: number,
        symbols: MusicFontSymbol[],
        centerAtPosition?: boolean
    ): void {
        let s: string = '';
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (symbol !== MusicFontSymbol.None) {
                s += CssFontSvgCanvas._symbolText(symbol);
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
        const scale = s * relativeScale;
        const rgba = this.color.rgba;
        const center = centerAtPosition === true;
        if (scale !== this._symbolTailScale || rgba !== this._symbolTailColor || center !== this._symbolTailCenter) {
            this._symbolTailScale = scale;
            this._symbolTailColor = rgba;
            this._symbolTailCenter = center;
            let tail: string =
                scale !== 1 ? ` style="font-size: ${scale * 100}%; stroke:none"` : ' style="stroke:none"';
            if (rgba !== '#000000') {
                tail += ' fill="' + rgba + '"';
            }
            if (center) {
                tail += ' text-anchor="middle"';
            }
            this._symbolTail = tail + '>';
        }
        if (s === 1) {
            this.buffer.append(
                '<g transform="translate(' +
                    x +
                    ' ' +
                    y +
                    ')" class="at" ><text' +
                    this._symbolTail +
                    symbols +
                    '</text></g>'
            );
        } else {
            const sx = x * s;
            const sy = y * s;
            this.buffer.append(
                `<g transform="translate(${sx} ${sy})" class="at" ><text` + this._symbolTail + symbols + '</text></g>'
            );
        }
    }
}
