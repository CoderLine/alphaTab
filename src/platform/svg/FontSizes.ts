import { FontStyle, FontWeight } from '@src/model/Font';
import { Environment } from '@src/Environment';
import { MeasuredText } from '@src/platform/ICanvas';
import { WebPlatform } from '@src/platform/javascript/WebPlatform';

/**
 * Describes the sizes of a font for measuring purposes.
 */
export class FontSizeDefinition {
    /**
     * The widths of each character starting with the ascii code 0x20 at index 0.
     */
    public characterWidths: Uint8Array;
    /**
     * A factor to translate a given font size to an actual text height.
     * This is not precise but just an estimation for reserving spaces.
     */
    public fontSizeToHeight: number;

    public constructor(characterWidths: Uint8Array, fontSizeToHeight: number) {
        this.characterWidths = characterWidths;
        this.fontSizeToHeight = fontSizeToHeight;
    }
}

/**
 * This public class stores text widths for several fonts and allows width calculation
 * @partial
 */
export class FontSizes {
    public static FontSizeLookupTables: Map<string, FontSizeDefinition> = new Map<string, FontSizeDefinition>();

    public static readonly ControlChars: number = 0x20;

    /**
     * @target web
     * @partial
     */
    public static generateFontLookup(family: string): void {
        if (FontSizes.FontSizeLookupTables.has(family)) {
            return;
        }

        if (!Environment.isRunningInWorker && Environment.webPlatform !== WebPlatform.NodeJs) {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const measureContext: CanvasRenderingContext2D = canvas.getContext('2d')!;
            const measureSize = 11;
            measureContext.font = `${measureSize}px ${family}`;
            const widths: number[] = [];
            let fullTxt = '';
            for (let i: number = FontSizes.ControlChars; i < 255; i++) {
                const s: string = String.fromCharCode(i);
                fullTxt += s;
                const metrics = measureContext.measureText(s);
                widths.push(metrics.width);
            }

            const heightMetrics = measureContext.measureText(`${fullTxt}ÄÖÜÁÈ`);

            const top = 0 - Math.abs(heightMetrics.fontBoundingBoxAscent);
            const bottom = 0 + Math.abs(heightMetrics.fontBoundingBoxDescent);
            const height = bottom - top;

            const data: FontSizeDefinition = new FontSizeDefinition(new Uint8Array(widths), height / measureSize);
            FontSizes.FontSizeLookupTables.set(family, data);
        } else {
            const data: FontSizeDefinition = new FontSizeDefinition(new Uint8Array([8]), 1.2);
            FontSizes.FontSizeLookupTables.set(family, data);
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
            if (FontSizes.FontSizeLookupTables.has(families[i])) {
                family = families[i];
                break;
            }
        }

        if (!FontSizes.FontSizeLookupTables.has(family)) {
            FontSizes.generateFontLookup(family);
        }
        data = FontSizes.FontSizeLookupTables.get(family)!;
        let factor: number = 1;
        if (style === FontStyle.Italic) {
            factor *= 1.1;
        }
        if (weight === FontWeight.Bold) {
            factor *= 1.1;
        }

        let stringSize: number = 0;
        for (let i: number = 0; i < s.length; i++) {
            const code: number = Math.min(data.characterWidths.length - 1, s.charCodeAt(i) - FontSizes.ControlChars);
            if (code >= 0) {
                stringSize += (data.characterWidths[code] * size) / dataSize;
            }
        }

        // add a small increase of size for spacing/kerning etc.
        // we really need to improve the width calculation, maybe by using offscreencanvas?
        factor *= 1.07;

        return new MeasuredText(stringSize * factor, size * data.fontSizeToHeight);
    }
}
