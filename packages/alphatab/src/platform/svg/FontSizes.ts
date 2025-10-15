import { FontStyle, FontWeight } from '@src/model/Font';
import { Environment } from '@src/Environment';
import { MeasuredText } from '@src/platform/ICanvas';
import { WebPlatform } from '@src/platform/javascript/WebPlatform';

/**
 * Describes the sizes of a font for measuring purposes.
 * @internal
 */
export class FontSizeDefinition {
    /**
     * The widths of each character starting with the ascii code 0x20 at index 0.
     */
    public characterWidths: Uint8Array;

    /**
     * The heights of each character starting with the ascii code 0x20 at index 0.
     */
    public characterHeights: Uint8Array;

    public constructor(characterWidths: Uint8Array, characterHeights: Uint8Array) {
        this.characterWidths = characterWidths;
        this.characterHeights = characterHeights;
    }
}

/**
 * This public class stores text widths for several fonts and allows width calculation
 * @partial
 * @internal
 */
export class FontSizes {
    public static readonly fontSizeLookupTables: Map<string, FontSizeDefinition> = new Map<string, FontSizeDefinition>();

    public static readonly ControlChars: number = 0x20;

    /**
     * @target web
     * @partial
     */
    public static generateFontLookup(family: string): void {
        if (FontSizes.fontSizeLookupTables.has(family)) {
            return;
        }

        if (!Environment.isRunningInWorker && Environment.webPlatform !== WebPlatform.NodeJs) {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const measureContext: CanvasRenderingContext2D = canvas.getContext('2d')!;
            const measureSize = 11;
            measureContext.font = `${measureSize}px ${family}`;
            const widths: number[] = [];
            const heights: number[] = [];
            for (let i: number = FontSizes.ControlChars; i < 255; i++) {
                const s: string = String.fromCharCode(i);
                const metrics = measureContext.measureText(s);
                widths.push(metrics.width);

                const height = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;
                heights.push(height);
            }

            const data: FontSizeDefinition = new FontSizeDefinition(new Uint8Array(widths), new Uint8Array(heights));
            FontSizes.fontSizeLookupTables.set(family, data);
        } else {
            const data: FontSizeDefinition = new FontSizeDefinition(new Uint8Array([8]), new Uint8Array([10]));
            FontSizes.fontSizeLookupTables.set(family, data);
        }
    }

    public static measureString(
        s: string,
        families: string[],
        size: number,
        style: FontStyle,
        weight: FontWeight
    ): MeasuredText {
        let data: FontSizeDefinition;
        const dataSize: number = 11;
        let family = families[0]; // default to first font

        // find a font which is maybe registered already
        for (let i = 0; i < families.length; i++) {
            if (FontSizes.fontSizeLookupTables.has(families[i])) {
                family = families[i];
                break;
            }
        }

        if (!FontSizes.fontSizeLookupTables.has(family)) {
            FontSizes.generateFontLookup(family);
        }
        data = FontSizes.fontSizeLookupTables.get(family)!;
        let factor: number = 1;
        if (style === FontStyle.Italic) {
            factor *= 1.1;
        }
        if (weight === FontWeight.Bold) {
            factor *= 1.1;
        }

        let stringSize: number = 0;
        let stringHeight: number = 0;
        for (let i: number = 0; i < s.length; i++) {
            const code: number = Math.min(data.characterWidths.length - 1, s.charCodeAt(i) - FontSizes.ControlChars);
            if (code >= 0) {
                stringSize += (data.characterWidths[code] * size) / dataSize;
                stringHeight = Math.max(stringHeight, (data.characterHeights[code] * size) / dataSize)
            }
        }

        // add a small increase of size for spacing/kerning etc.
        // we really need to improve the width calculation, maybe by using offscreencanvas?
        factor *= 1.07;

        return new MeasuredText(stringSize * factor, stringHeight);
    }
}
