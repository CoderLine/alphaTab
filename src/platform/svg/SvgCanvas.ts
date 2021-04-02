import { Color } from '@src/model/Color';
import { Font, FontStyle } from '@src/model/Font';
import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { FontSizes } from '@src/platform/svg/FontSizes';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Settings } from '@src/Settings';

/**
 * A canvas implementation storing SVG data
 */
export abstract class SvgCanvas implements ICanvas {
    protected buffer: string = '';

    private _currentPath: string = '';
    private _currentPathIsEmpty: boolean = true;

    public color: Color = new Color(255, 255, 255, 0xff);
    public lineWidth: number = 1;
    public font: Font = new Font('Arial', 10, FontStyle.Plain);
    public textAlign: TextAlign = TextAlign.Left;
    public textBaseline: TextBaseline = TextBaseline.Top;
    public settings!: Settings;

    public beginRender(width: number, height: number): void {
        this.buffer = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${width | 0}px" height="${height | 0
            }px" class="at-surface-svg">\n`;
        this._currentPath = '';
        this._currentPathIsEmpty = true;
        this.textBaseline = TextBaseline.Top;
    }

    public beginGroup(identifier: string): void {
        this.buffer += `<g class="${identifier}">`;
    }

    public endGroup(): void {
        this.buffer += '</g>';
    }

    public endRender(): unknown {
        this.buffer += '</svg>';
        return this.buffer;
    }

    public fillRect(x: number, y: number, w: number, h: number): void {
        if (w > 0) {
            this.buffer += `<rect x="${x | 0}" y="${y | 0}" width="${w}" height="${h}" fill="${this.color.rgba}" />\n`;
        }
    }

    public strokeRect(x: number, y: number, w: number, h: number): void {
        this.buffer += `<rect x="${x | 0}" y="${y | 0}" width="${w}" height="${h}" stroke="${this.color.rgba}"`;
        if (this.lineWidth !== 1) {
            this.buffer += ` stroke-width="${this.lineWidth}"`;
        }
        this.buffer += ' fill="transparent" />\n';
    }

    public beginPath(): void {
        // nothing to do
    }

    public closePath(): void {
        this._currentPath += ' z';
    }

    public moveTo(x: number, y: number): void {
        this._currentPath += ` M${x},${y}`;
    }

    public lineTo(x: number, y: number): void {
        this._currentPathIsEmpty = false;
        this._currentPath += ` L${x},${y}`;
    }

    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        this._currentPathIsEmpty = false;
        this._currentPath += ` Q${cpx},${cpy},${x},${y}`;
    }

    public bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, x: number, y: number): void {
        this._currentPathIsEmpty = false;
        this._currentPath += ` C${cp1X},${cp1Y},${cp2X},${cp2Y},${x},${y}`;
    }

    public fillCircle(x: number, y: number, radius: number): void {
        this._currentPathIsEmpty = false;
        //
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        this._currentPath += ` M${x - radius},${y} A1,1 0 0,0 ${x + radius},${y} A1,1 0 0,0 ${x - radius},${y} z`;
        this.fill();
    }

    public strokeCircle(x: number, y: number, radius: number): void {
        this._currentPathIsEmpty = false;
        //
        // M0,250 A1,1 0 0,0 500,250 A1,1 0 0,0 0,250 z
        this._currentPath += ` M${x - radius},${y} A1,1 0 0,0 ${x + radius},${y} A1,1 0 0,0 ${x - radius},${y} z`;
        this.stroke();
    }

    public fill(): void {
        if (!this._currentPathIsEmpty) {
            this.buffer += `<path d="${this._currentPath}"`;
            if (this.color.rgba !== '#000000') {
                this.buffer += ` fill="${this.color.rgba}"`;
            }
            this.buffer += ' style="stroke: none"/>';
        }
        this._currentPath = '';
        this._currentPathIsEmpty = true;
    }

    public stroke(): void {
        if (!this._currentPathIsEmpty) {
            let s: string = `<path d="${this._currentPath}" stroke="${this.color.rgba}"`;
            if (this.lineWidth !== 1) {
                s += ` stroke-width="${this.lineWidth}"`;
            }
            s += ' style="fill: none" />';
            this.buffer += s;
        }
        this._currentPath = '';
        this._currentPathIsEmpty = true;
    }

    public fillText(text: string, x: number, y: number): void {
        if (text === '') {
            return;
        }
        let s: string = `<text x="${x | 0}" y="${y | 0}" style="stroke: none; font:${this.font.toCssString(
            this.settings.display.scale
        )}" ${this.getSvgBaseLine()}`;
        if (this.color.rgba !== '#000000') {
            s += ` fill="${this.color.rgba}"`;
        }
        if (this.textAlign !== TextAlign.Left) {
            s += ` text-anchor="${this.getSvgTextAlignment(this.textAlign)}"`;
        }
        s += `>${SvgCanvas.escapeText(text)}</text>`;
        this.buffer += s;
    }

    private static escapeText(text: string) {
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
                return `dominant-baseline="hanging"`;
            case TextBaseline.Bottom:
                return `dominant-baseline="bottom"`;
            case TextBaseline.Middle:
            default:
                // middle is set as default on the SVG tag via css
                return '';
        }
    }

    public measureText(text: string): number {
        if (!text) {
            return 0;
        }
        return FontSizes.measureString(text, this.font.family, this.font.size, this.font.style);
    }

    public abstract fillMusicFontSymbol(
        x: number,
        y: number,
        scale: number,
        symbol: MusicFontSymbol,
        centerAtPosition?: boolean
    ): void;

    public abstract fillMusicFontSymbols(
        x: number,
        y: number,
        scale: number,
        symbols: MusicFontSymbol[],
        centerAtPosition?: boolean
    ): void;

    public onRenderFinished(): unknown {
        // nothing to do
        return null;
    }

    public beginRotate(centerX: number, centerY: number, angle: number): void {
        this.buffer += '<g transform="translate(' + centerX + ' ,' + centerY + ') rotate( ' + angle + ')">';
    }

    public endRotate(): void {
        this.buffer += '</g>';
    }
}
