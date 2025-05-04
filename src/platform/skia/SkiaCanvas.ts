import { Environment } from '@src/Environment';
import { Color } from '@src/model/Color';
import { Font, FontStyle, FontWeight } from '@src/model/Font';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { type ICanvas, TextAlign, TextBaseline, MeasuredText } from '@src/platform/ICanvas';
import type { Settings } from '@src/Settings';
import type * as alphaSkia from '@coderline/alphaskia';

/**
 * Describes the members of the alphaSkia module.
 * @target web
 */
export interface AlphaSkiaModule {
    AlphaSkiaCanvas: typeof alphaSkia.AlphaSkiaCanvas;
    AlphaSkiaImage: typeof alphaSkia.AlphaSkiaImage;
    AlphaSkiaTextAlign: typeof alphaSkia.AlphaSkiaTextAlign;
    AlphaSkiaTextBaseline: typeof alphaSkia.AlphaSkiaTextBaseline;
    AlphaSkiaTypeface: typeof alphaSkia.AlphaSkiaTypeface;
    AlphaSkiaTextStyle: typeof alphaSkia.AlphaSkiaTextStyle;
    AlphaSkiaTextMetrics: typeof alphaSkia.AlphaSkiaTextMetrics;
}

/**
 * A canvas implementation using alphaSkia as rendering backend
 * @partial
 */
export class SkiaCanvas implements ICanvas {
    /**
     * @target web
     * @delegated csharp
     * @delegated kotlin
     */
    private static alphaSkia: AlphaSkiaModule;

    private static musicTextStyle: alphaSkia.AlphaSkiaTextStyle | null = null;

    /**
     * @target web
     * @partial
     */
    public static enable(musicFontData: ArrayBuffer, alphaSkia: unknown) {
        SkiaCanvas.alphaSkia = alphaSkia as AlphaSkiaModule;
        SkiaCanvas.initializeMusicFont(SkiaCanvas.alphaSkia.AlphaSkiaTypeface.register(musicFontData)!);
    }

    public static initializeMusicFont(musicFont: alphaSkia.AlphaSkiaTypeface) {
        SkiaCanvas.musicTextStyle = new SkiaCanvas.alphaSkia.AlphaSkiaTextStyle(
            [musicFont.familyName],
            musicFont.weight,
            musicFont.isItalic
        );
    }

    public static registerFont(fontData: Uint8Array, fontInfo?: Font | undefined): Font {
        const typeface = SkiaCanvas.alphaSkia.AlphaSkiaTypeface.register(fontData.buffer as ArrayBuffer)!;
        if (!fontInfo) {
            fontInfo = Font.withFamilyList(
                [typeface.familyName],
                12,
                typeface.isItalic ? FontStyle.Italic : FontStyle.Plain,
                typeface.weight > 400 ? FontWeight.Bold : FontWeight.Regular
            );
        }

        return fontInfo;
    }

    private _canvas: alphaSkia.AlphaSkiaCanvas;
    private _color: Color = new Color(0, 0, 0, 0);
    private _lineWidth: number = 0;
    private _textStyle: alphaSkia.AlphaSkiaTextStyle | null = null;
    private _scale = 1;
    private _textStyles: Map<string, alphaSkia.AlphaSkiaTextStyle> = new Map<string, alphaSkia.AlphaSkiaTextStyle>();
    private _font: Font = new Font('Arial', 10, FontStyle.Plain);

    public settings!: Settings;

    public get font(): Font {
        return this._font;
    }

    public set font(value: Font) {
        if (this._font === value) {
            return;
        }
        this._font = value;

        const key = this.textStyleKey(value);
        if (this._textStyles.has(key)) {
            this._textStyle = this._textStyles.get(key)!;
        } else {
            const textStyle = new SkiaCanvas.alphaSkia.AlphaSkiaTextStyle(
                value.families,
                value.weight === FontWeight.Bold ? 700 : 400,
                value.isItalic
            );
            this._textStyles.set(key, textStyle);
            this._textStyle = textStyle;
        }
    }

    private textStyleKey(font: Font): string {
        return [...font.families, font.weight.toString(), font.isItalic ? 'italic' : 'upright'].join('_');
    }

    public constructor() {
        this._canvas = new SkiaCanvas.alphaSkia.AlphaSkiaCanvas();
        this.color = new Color(0, 0, 0, 0xff);
    }

    public destroy() {
        this._canvas[Symbol.dispose]();
        for (const textStyle of this._textStyles.values()) {
            textStyle[Symbol.dispose]();
        }
    }

    public onRenderFinished(): unknown {
        return null;
    }

    public beginRender(width: number, height: number): void {
        this._scale = this.settings.display.scale;
        this._canvas.beginRender(width, height, Environment.HighDpiFactor);
    }

    public endRender(): unknown {
        return this._canvas.endRender();
    }

    public get color(): Color {
        return this._color;
    }

    public set color(value: Color) {
        if (this._color.rgba === value.rgba) {
            return;
        }
        this._color = value;
        this._canvas.color = SkiaCanvas.alphaSkia.AlphaSkiaCanvas.rgbaToColor(value.r, value.g, value.b, value.a);
    }

    public get lineWidth(): number {
        return this._lineWidth;
    }

    public set lineWidth(value: number) {
        this._lineWidth = value;
        this._canvas.lineWidth = value;
    }

    public fillRect(x: number, y: number, w: number, h: number): void {
        if (w > 0) {
            this._canvas.fillRect((x * this._scale) | 0, (y * this._scale) | 0, w * this._scale, h * this._scale);
        }
    }

    public strokeRect(x: number, y: number, w: number, h: number): void {
        const blurOffset = this.lineWidth % 2 === 0 ? 0 : 0.5;
        this._canvas.strokeRect(
            ((x * this._scale) | 0) + blurOffset,
            ((y * this._scale) | 0) + blurOffset,
            w * this._scale,
            h * this._scale
        );
    }

    public beginPath(): void {
        this._canvas.beginPath();
    }

    public closePath(): void {
        this._canvas.closePath();
    }

    public moveTo(x: number, y: number): void {
        this._canvas.moveTo(x * this._scale, y * this._scale);
    }

    public lineTo(x: number, y: number): void {
        this._canvas.lineTo(x * this._scale, y * this._scale);
    }

    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        this._canvas.quadraticCurveTo(cpx * this._scale, cpy * this._scale, x * this._scale, y * this._scale);
    }

    public bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, x: number, y: number): void {
        this._canvas.bezierCurveTo(
            cp1X * this._scale,
            cp1Y * this._scale,
            cp2X * this._scale,
            cp2Y * this._scale,
            x * this._scale,
            y * this._scale
        );
    }

    public fillCircle(x: number, y: number, radius: number): void {
        this._canvas.fillCircle(x * this._scale, y * this._scale, radius * this._scale);
    }

    public strokeCircle(x: number, y: number, radius: number): void {
        this._canvas.strokeCircle(x * this._scale, y * this._scale, radius * this._scale);
    }

    public fill(): void {
        this._canvas.fill();
    }

    public stroke(): void {
        this._canvas.stroke();
    }

    public textAlign: TextAlign = TextAlign.Left;
    public textBaseline: TextBaseline = TextBaseline.Top;

    public beginGroup(_identifier: string): void {
        // not supported
    }

    public endGroup(): void {
        // not supported
    }

    public fillText(text: string, x: number, y: number): void {
        if (text.length === 0) {
            return;
        }

        let textAlign = SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Left;
        switch (this.textAlign) {
            case TextAlign.Left:
                textAlign = SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Left;
                break;
            case TextAlign.Center:
                textAlign = SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Center;
                break;
            case TextAlign.Right:
                textAlign = SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Right;
                break;
        }

        let textBaseline = SkiaCanvas.alphaSkia.AlphaSkiaTextBaseline.Top;
        switch (this.textBaseline) {
            case TextBaseline.Top:
                textBaseline = SkiaCanvas.alphaSkia.AlphaSkiaTextBaseline.Top;
                break;
            case TextBaseline.Middle:
                textBaseline = SkiaCanvas.alphaSkia.AlphaSkiaTextBaseline.Middle;
                break;
            case TextBaseline.Bottom:
                textBaseline = SkiaCanvas.alphaSkia.AlphaSkiaTextBaseline.Bottom;
                break;
        }

        // NOTE: Avoiding sub-pixel text positions as they can lead to strange artifacts.
        this._canvas.fillText(
            text,
            this._textStyle!,
            this._font.size * this._scale,
            (x * this._scale) | 0,
            (y * this._scale) | 0,
            textAlign,
            textBaseline
        );
    }

    public measureText(text: string) {
        using metrics = this._canvas.measureText(
            text,
            this._textStyle!,
            this._font.size,
            SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Left,
            SkiaCanvas.alphaSkia.AlphaSkiaTextBaseline.Alphabetic
        );

        return new MeasuredText(metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
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
        this.fillMusicFontSymbolText(x, y, relativeScale, String.fromCharCode(symbol), centerAtPosition);
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
                s += String.fromCharCode(symbol);
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
        this._canvas.fillText(
            symbols,
            SkiaCanvas.musicTextStyle!,
            Environment.MusicFontSize * this._scale * relativeScale,
            x * this._scale,
            y * this._scale,
            centerAtPosition
                ? SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Center
                : SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Left,
            SkiaCanvas.alphaSkia.AlphaSkiaTextBaseline.Alphabetic
        );
    }

    public beginRotate(centerX: number, centerY: number, angle: number): void {
        this._canvas.beginRotate(centerX * this._scale, centerY * this._scale, angle);
    }

    public endRotate(): void {
        this._canvas.endRotate();
    }
}
