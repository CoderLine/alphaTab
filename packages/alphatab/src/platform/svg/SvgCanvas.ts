/** biome-ignore-all lint/style/useTemplate: String concatenation is more efficient */
import { Color } from '@coderline/alphatab/model/Color';
import { Font, FontStyle } from '@coderline/alphatab/model/Font';
import type { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { type ICanvas, MeasuredText, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { FontSizes } from '@coderline/alphatab/platform/svg/FontSizes';
import { SvgBuffer } from '@coderline/alphatab/platform/svg/SvgBuffer';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * A canvas implementation storing SVG data
 * @internal
 */
export abstract class SvgCanvas implements ICanvas {
    protected readonly buffer: SvgBuffer = new SvgBuffer();

    private _currentPath: string = '';
    private _currentPathIsEmpty: boolean = true;

    private _rectTailColor: string = '';
    private _rectTail: string = '';
    private _textTailFont: string = '';
    private _textTailBaseline: TextBaseline = TextBaseline.Top;
    private _textTailColor: string = '';
    private _textTailAlign: TextAlign = TextAlign.Left;
    private _textTail: string = '';

    public scale = 1;

    public color: Color = new Color(255, 255, 255, 0xff);
    public lineWidth: number = 1;
    public font: Font = new Font('Arial', 10, FontStyle.Plain);
    public textAlign: TextAlign = TextAlign.Left;
    public textBaseline: TextBaseline = TextBaseline.Top;
    public settings!: Settings;

    public destroy() {}

    public beginRender(width: number, height: number): void {
        this.scale = this.settings.display.scale;
        this.buffer.reset(
            `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${width | 0}px" height="${
                height | 0
            }px" class="at-surface-svg">\n`
        );
        this._currentPath = '';
        this._currentPathIsEmpty = true;
        this.textBaseline = TextBaseline.Top;
    }

    public beginGroup(identifier: string): void {
        this.buffer.append('<g class="' + identifier + '">');
    }

    public endGroup(): void {
        this.buffer.append('</g>');
    }

    public endRender(): unknown {
        this.buffer.append('</svg>');
        return this.buffer.build();
    }

    public fillRect(x: number, y: number, w: number, h: number): void {
        if (w > 0) {
            const rgba = this.color.rgba;
            if (rgba !== this._rectTailColor) {
                this._rectTailColor = rgba;
                this._rectTail = '" fill="' + rgba + '" />\n';
            }
            // scale=1 fast path: skip the 4 multiplies and use `+` concat to avoid template-literal overhead.
            const s = this.scale;
            if (s === 1) {
                this.buffer.append('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + this._rectTail);
            } else {
                this.buffer.append(
                    `<rect x="${x * s}" y="${y * s}" width="${w * s}" height="${h * s}` + this._rectTail
                );
            }
        }
    }

    public strokeRect(x: number, y: number, w: number, h: number): void {
        const blurOffset = (this.lineWidth * this.scale) % 2 === 0 ? 0 : 0.5;
        this.buffer.append(
            `<rect x="${x * this.scale + blurOffset}" y="${y * this.scale + blurOffset}" width="${
                w * this.scale
            }" height="${h * this.scale}" stroke="${this.color.rgba}"` +
                (this.lineWidth !== 1 ? ` stroke-width="${this.lineWidth * this.scale}"` : '') +
                ' fill="transparent" />\n'
        );
    }

    public beginPath(): void {
        // nothing to do
    }

    public closePath(): void {
        this._currentPath += ' z';
    }

    public moveTo(x: number, y: number): void {
        const s = this.scale;
        if (s === 1) {
            this._currentPath += ' M' + x + ',' + y;
        } else {
            this._currentPath += ` M${x * s},${y * s}`;
        }
    }

    public lineTo(x: number, y: number): void {
        this._currentPathIsEmpty = false;
        const s = this.scale;
        if (s === 1) {
            this._currentPath += ' L' + x + ',' + y;
        } else {
            this._currentPath += ` L${x * s},${y * s}`;
        }
    }

    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        this._currentPathIsEmpty = false;
        this._currentPath += ` Q${cpx * this.scale},${cpy * this.scale},${x * this.scale},${y * this.scale}`;
    }

    public bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, x: number, y: number): void {
        this._currentPathIsEmpty = false;
        const s = this.scale;
        if (s === 1) {
            this._currentPath +=
                ' C' + cp1X + ',' + cp1Y + ',' + cp2X + ',' + cp2Y + ',' + x + ',' + y;
        } else {
            this._currentPath += ` C${cp1X * s},${cp1Y * s},${cp2X * s},${cp2Y * s},${x * s},${y * s}`;
        }
    }

    public fillCircle(x: number, y: number, radius: number): void {
        this._currentPathIsEmpty = false;

        x *= this.scale;
        y *= this.scale;
        radius *= this.scale;

        //
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        this._currentPath += ` M${x - radius},${y} A1,1 0 0,0 ${x + radius},${y} A1,1 0 0,0 ${x - radius},${y} z`;
        this.fill();
    }

    public strokeCircle(x: number, y: number, radius: number): void {
        this._currentPathIsEmpty = false;

        x *= this.scale;
        y *= this.scale;
        radius *= this.scale;

        //
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        this._currentPath += ` M${x - radius},${y} A1,1 0 0,0 ${x + radius},${y} A1,1 0 0,0 ${x - radius},${y} z`;
        this.stroke();
    }

    public fill(): void {
        if (!this._currentPathIsEmpty) {
            const rgba = this.color.rgba;
            this.buffer.append(
                '<path d="' +
                    this._currentPath +
                    (rgba !== '#000000' ? '" fill="' + rgba + '" style="stroke: none"/>' : '" style="stroke: none"/>')
            );
        }
        this._currentPath = '';
        this._currentPathIsEmpty = true;
    }

    public stroke(): void {
        if (!this._currentPathIsEmpty) {
            let s: string = '<path d="' + this._currentPath + '" stroke="' + this.color.rgba + '"';
            if (this.lineWidth !== 1 || this.scale !== 1) {
                s += ` stroke-width="${this.lineWidth * this.scale}"`;
            }
            s += ' style="fill: none" />';
            this.buffer.append(s);
        }
        this._currentPath = '';
        this._currentPathIsEmpty = true;
    }

    public fillText(text: string, x: number, y: number): void {
        if (text === '') {
            return;
        }
        const font = this.font.toCssString(this.settings.display.scale);
        const rgba = this.color.rgba;
        if (
            font !== this._textTailFont ||
            this.textBaseline !== this._textTailBaseline ||
            rgba !== this._textTailColor ||
            this.textAlign !== this._textTailAlign
        ) {
            this._textTailFont = font;
            this._textTailBaseline = this.textBaseline;
            this._textTailColor = rgba;
            this._textTailAlign = this.textAlign;
            let tail: string = '" style=\'stroke: none; font:' + font + '; ' + this.getSvgBaseLine() + "'";
            if (rgba !== '#000000') {
                tail += ' fill="' + rgba + '"';
            }
            if (this.textAlign !== TextAlign.Left) {
                tail += ' text-anchor="' + this.getSvgTextAlignment(this.textAlign) + '"';
            }
            this._textTail = tail + '>';
        }
        const sc = this.scale;
        if (sc === 1) {
            this.buffer.append(
                '<text x="' + x + '" y="' + y + this._textTail + SvgCanvas._escapeText(text) + '</text>'
            );
        } else {
            this.buffer.append(
                `<text x="${x * sc}" y="${y * sc}` + this._textTail + SvgCanvas._escapeText(text) + '</text>'
            );
        }
    }

    private static readonly _escapeTextRegex = /[&<>"']/;

    private static _escapeText(text: string) {
        // Short-circuit: most rendered text (bar numbers, fret numbers, etc.) has no escapable chars.
        if (!SvgCanvas._escapeTextRegex.test(text)) {
            return text;
        }
        return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    protected getSvgTextAlignment(textAlign: TextAlign): string {
        switch (textAlign) {
            case TextAlign.Left:
                return 'start';
            case TextAlign.Center:
                return 'middle';
            case TextAlign.Right:
                return 'end';
        }
        return '';
    }

    protected getSvgBaseLine(): string {
        switch (this.textBaseline) {
            case TextBaseline.Top:
                return 'dominant-baseline: hanging';
            case TextBaseline.Bottom:
                return 'dominant-baseline: ideographic';
            case TextBaseline.Alphabetic:
                // alphabetic is set as default on the SVG tag via css
                return '';
            case TextBaseline.Middle:
                // central would maybe look slightly better, but its not available on HTML5 canvas, or Skia
                // hence, we rather stay consistent
                return 'dominant-baseline: middle';
            default:
                return '';
        }
    }

    public measureText(text: string) {
        if (!text) {
            return new MeasuredText(0, 0);
        }
        return FontSizes.measureString(
            text,
            this.font.families,
            this.font.size,
            this.font.style,
            this.font.weight
        );
    }

    public abstract fillMusicFontSymbol(
        x: number,
        y: number,
        relativeScale: number,
        symbol: MusicFontSymbol,
        centerAtPosition?: boolean
    ): void;

    public abstract fillMusicFontSymbols(
        x: number,
        y: number,
        relativeScale: number,
        symbols: MusicFontSymbol[],
        centerAtPosition?: boolean
    ): void;

    public onRenderFinished(): unknown {
        // nothing to do
        return null;
    }

    public beginRotate(centerX: number, centerY: number, angle: number): void {
        this.buffer.append(
            `<g transform="translate(${centerX * this.scale} ,${centerY * this.scale}) rotate( ${angle})">`
        );
    }

    public endRotate(): void {
        this.buffer.append('</g>');
    }
}
