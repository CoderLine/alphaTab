/** The subset of opentype.js 2 used by the hero generator; the package ships without typings. */
declare module 'opentype.js' {
    export interface BoundingBox {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }

    export interface Path {
        toPathData(options: { decimalPlaces?: number; flipY?: boolean }): string;
    }

    export interface Glyph {
        index: number;
        advanceWidth?: number;
        getBoundingBox(): BoundingBox;
        getPath(x: number, y: number, fontSize: number): Path;
    }

    export interface Font {
        unitsPerEm: number;
        ascender: number;
        descender: number;
        tables: { os2?: { sxHeight?: number } };
        stringToGlyphs(text: string): Glyph[];
        getKerningValue(left: Glyph, right: Glyph): number;
    }

    const opentype: {
        parse(buffer: ArrayBuffer): Font;
    };
    export default opentype;
}
