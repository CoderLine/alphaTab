import { Environment } from '@src/Environment';
import { Color } from '@src/model/Color';
import { Font, FontStyle, FontWeight } from '@src/model/Font';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { ICanvas, TextAlign, TextBaseline, TextMetrics } from '@src/platform/ICanvas';
import { Settings } from '@src/Settings';
import type * as alphaSkia from '@coderline/alphaskia';
import type { AlphaSkiaTypeface }  from '@coderline/alphaskia';

/**
 * Describes the members of the alphaSkia module.
 * @target web
 */
export interface AlphaSkiaModule {
    AlphaSkiaCanvas: typeof alphaSkia.AlphaSkiaCanvas,
    AlphaSkiaImage: typeof alphaSkia.AlphaSkiaImage,
    AlphaSkiaTextAlign: typeof alphaSkia.AlphaSkiaTextAlign,
    AlphaSkiaTextBaseline: typeof alphaSkia.AlphaSkiaTextBaseline,
    AlphaSkiaTypeface: typeof alphaSkia.AlphaSkiaTypeface,
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

    private static musicFont: AlphaSkiaTypeface | null = null;

    private static readonly customTypeFaces = new Map<string, alphaSkia.AlphaSkiaTypeface>();

    /**
     * @target web
     * @partial
     */
    public static enable(musicFontData: ArrayBuffer,
        alphaSkia: unknown) {
        SkiaCanvas.alphaSkia = alphaSkia as AlphaSkiaModule;
        SkiaCanvas.initializeMusicFont(SkiaCanvas.alphaSkia.AlphaSkiaTypeface.register(musicFontData)!);
    }

    public static initializeMusicFont(musicFont: AlphaSkiaTypeface) {
        SkiaCanvas.musicFont = musicFont;
    }

    public static registerFont(fontData: Uint8Array, fontInfo?: Font | undefined): Font {
        const typeface = SkiaCanvas.alphaSkia.AlphaSkiaTypeface.register(fontData.buffer)!;
        if (!fontInfo) {
            fontInfo = Font.withFamilyList([typeface.familyName], 12, typeface.isItalic ? FontStyle.Italic : FontStyle.Plain,
                typeface.isBold ? FontWeight.Bold : FontWeight.Regular);
        }

        for (const family of fontInfo.families) {
            this.customTypeFaces.set(SkiaCanvas.customTypefaceKey(family, fontInfo.isBold, fontInfo.isItalic), typeface);
        }

        return fontInfo;
    }

    private static customTypefaceKey(fontFamily: string, isBold: boolean, isItalic: boolean): string {
        return fontFamily.toLowerCase() + "_" + isBold + "_" + isItalic;
    }

    private _canvas: alphaSkia.AlphaSkiaCanvas;
    private _color: Color = new Color(0, 0, 0, 0);
    private _lineWidth: number = 0;
    private _typeFaceCache: string = "";
    private _typeFaceIsSystem: boolean = false;
    private _typeFace: alphaSkia.AlphaSkiaTypeface | null = null;
    private _scale = 1;

    public settings!: Settings;

    private getTypeFace(): alphaSkia.AlphaSkiaTypeface {
        if (this._typeFaceCache != this.font.toCssString(this._scale)) {
            if (this._typeFaceIsSystem) {
                using _ = this._typeFace!;
            }

            for (const family of this.font.families) {
                var key = SkiaCanvas.customTypefaceKey(family, this.font.isBold, this.font.isItalic);
                if (!SkiaCanvas.customTypeFaces.has(key)) {
                    this._typeFaceIsSystem = true;
                    this._typeFace = SkiaCanvas.alphaSkia.AlphaSkiaTypeface.create(family,
                        this.font.isBold,
                        this.font.isItalic
                    )!;
                }
                else {
                    this._typeFaceIsSystem = false;
                    this._typeFace = SkiaCanvas.customTypeFaces.get(key)!;
                }

            }

            this._typeFaceCache = this.font.toCssString(this._scale);
        }

        return this._typeFace!;
    }

    public constructor() {
        this._canvas = new SkiaCanvas.alphaSkia.AlphaSkiaCanvas();
        this.color = new Color(0, 0, 0, 0xff)
    }

    public destroy() {
        using _ = this._canvas;
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
            this._canvas.fillRect(((x * this._scale) | 0), ((y * this._scale) | 0), w * this._scale, h * this._scale);
        }
    }

    public strokeRect(x: number, y: number, w: number, h: number): void {
        this._canvas.strokeRect(((x * this._scale) | 0), ((y * this._scale) | 0), w * this._scale, h * this._scale);
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
        this._canvas.bezierCurveTo(cp1X * this._scale, cp1Y * this._scale, cp2X * this._scale, cp2Y * this._scale, x * this._scale, y * this._scale);
    }

    public fillCircle(x: number, y: number, radius: number): void {
        this._canvas.fillCircle(
            x * this._scale,
            y * this._scale,
            radius * this._scale,
        );
    }

    public strokeCircle(x: number, y: number, radius: number): void {
        this._canvas.strokeCircle(
            x * this._scale,
            y * this._scale,
            radius * this._scale,
        );
    }

    public fill(): void {
        this._canvas.fill();
    }

    public stroke(): void {
        this._canvas.stroke();
    }

    public font: Font = new Font('Arial', 10, FontStyle.Plain);
    public textAlign: TextAlign = TextAlign.Left;
    public textBaseline: TextBaseline = TextBaseline.Top;

    public beginGroup(_identifier: string): void {
        // not supported
    }

    public endGroup(): void {
        // not supported
    }

    public fillText(text: string, x: number, y: number): void {
        if (text.length == 0) {
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


        this._canvas.fillText(text, this.getTypeFace(), this.font.size * this._scale, x * this._scale, y * this._scale, textAlign, textBaseline);
    }

    /**
     * TODO: extend alphaSkia to provide font metrics.
     */
    private static readonly FontSizeToLineHeight = 1.2;

    private _initialMeasure = true;
    public measureText(text: string) {
        // BUG: for some reason the very initial measure text in alphaSkia delivers wrong results, so we it twice
        if(this._initialMeasure) {
            this._canvas.measureText(text, this.getTypeFace(), this.font.size * this._scale);
            this._initialMeasure = false;
        }
        return new TextMetrics(this._canvas.measureText(text, this.getTypeFace(), this.font.size * this._scale), this.font.size * this._scale * SkiaCanvas.FontSizeToLineHeight);
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
        for (let symbol of symbols) {
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
            SkiaCanvas.musicFont!,
            Environment.MusicFontSize * this._scale * relativeScale,
            x * this._scale, y * this._scale,
            centerAtPosition ? SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Center : SkiaCanvas.alphaSkia.AlphaSkiaTextAlign.Left,
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