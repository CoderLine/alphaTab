import { Color } from '@src/model/Color';
import { Font } from '@src/model/Font';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Settings } from '@src/Settings';

/**
 * This public enum lists all different text alignments
 */
export enum TextAlign {
    /**
     * Text is left aligned.
     */
    Left,
    /**
     * Text is centered.
     */ Center,
    /**
     * Text is right aligned.
     */ Right
}

/**
 * This public enum lists all base line modes
 */
export enum TextBaseline {
    /**
     * Text is aligned on top.
     */
    Top,
    /**
     * Text is aligned middle
     */
    Middle,
    /**
     * Text is aligend on the bottom.
     */
    Bottom
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

    measureText(text: string): number;

    fillMusicFontSymbol(x: number, y: number, scale: number, symbol: MusicFontSymbol, centerAtPosition?: boolean): void;

    fillMusicFontSymbols(
        x: number,
        y: number,
        scale: number,
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
}
