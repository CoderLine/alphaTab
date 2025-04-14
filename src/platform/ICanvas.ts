import type { Color } from '@src/model/Color';
import type { Font } from '@src/model/Font';
import type { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { Settings } from '@src/Settings';

/**
 * This public enum lists all different text alignments
 */
export enum TextAlign {
    /**
     * Text is left aligned.
     */
    Left = 0,
    /**
     * Text is centered.
     */ Center = 1,
    /**
     * Text is right aligned.
     */ Right = 2
}

/**
 * This public enum lists all base line modes
 */
export enum TextBaseline {
    /**
     * Text is aligned on top.
     */
    Top = 0,
    /**
     * Text is aligned middle
     */
    Middle = 1,
    /**
     * Text is aligend on the bottom.
     */
    Bottom = 2
}

/**
 * The MeasuredText class represents the dimensions of a piece of text in the canvas;
 */
export class MeasuredText {
    /**
     * Returns the width of a segment of inline text in CSS pixels.
     */
    public width: number;

    /**
     * Returns the height of a segment of inline text in CSS pixels.
     */
    public height: number;

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

/**
 * This is the base public interface for canvas implementations on different plattforms.
 */
export interface ICanvas {
    settings: Settings;

    color: Color;

    lineWidth: number;

    fillRect(x: number, y: number, w: number, h: number): void;

    strokeRect(x: number, y: number, w: number, h: number): void;

    fillCircle(x: number, y: number, radius: number): void;
    strokeCircle(x: number, y: number, radius: number): void;

    font: Font;

    textAlign: TextAlign;

    textBaseline: TextBaseline;

    beginGroup(identifier: string): void;

    endGroup(): void;

    fillText(text: string, x: number, y: number): void;

    measureText(text: string): MeasuredText;

    fillMusicFontSymbol(
        x: number,
        y: number,
        relativeScale: number,
        symbol: MusicFontSymbol,
        centerAtPosition?: boolean
    ): void;

    fillMusicFontSymbols(
        x: number,
        y: number,
        relativeScale: number,
        symbols: MusicFontSymbol[],
        centerAtPosition?: boolean
    ): void;

    beginRender(width: number, height: number): void;

    endRender(): unknown;

    onRenderFinished(): unknown;

    beginRotate(centerX: number, centerY: number, angle: number): void;

    endRotate(): void;

    beginPath(): void;

    closePath(): void;

    fill(): void;

    stroke(): void;

    moveTo(x: number, y: number): void;

    lineTo(x: number, y: number): void;

    bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, x: number, y: number): void;

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;

    destroy(): void;
}
