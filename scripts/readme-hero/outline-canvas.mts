/// <reference path="./opentype.d.ts" />
import fs from 'node:fs';
import path from 'node:path';
import type { platform } from '@coderline/alphatab';
import opentype, { type Font, type Glyph } from 'opentype.js';

type AlphaTab = typeof import('@coderline/alphatab');

/** The members of alphaTab's `SvgCanvas` used here; the class is exported at runtime but not part of the typings. */
interface SvgCanvasBase extends platform.ICanvas {
    buffer: string;
    scale: number;
}

const fontDir = path.resolve(import.meta.dirname, '../../packages/alphatab/font');

/**
 * Text aligned against a font: `x`/`y` is the anchor, the run starts left of it for centered or right-aligned text.
 */
export interface TextRun {
    text: string;
    x: number;
    y: number;
    size: number;
    face: FontFace;
    align?: 'start' | 'middle' | 'end';
    letterSpacing?: number;
    attributes?: string;
}

export class FontFace {
    public readonly id: string;
    public readonly font: Font;

    public constructor(id: string, file: string) {
        this.id = id;
        const buffer = fs.readFileSync(path.join(fontDir, file));
        this.font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    }

    public get unitsPerEm(): number {
        return this.font.unitsPerEm;
    }

    /** Font-unit offsets of each glyph in `text`, and the total advance in font units. */
    public layout(text: string, letterSpacing = 0): { glyphs: { glyph: Glyph; x: number }[]; advance: number } {
        const glyphs = this.font.stringToGlyphs(text);
        const spacing = letterSpacing * this.unitsPerEm;
        const placed: { glyph: Glyph; x: number }[] = [];
        let x = 0;
        for (let i = 0; i < glyphs.length; i++) {
            const glyph = glyphs[i];
            placed.push({ glyph, x });
            x += (glyph.advanceWidth ?? 0) + spacing;
            if (i + 1 < glyphs.length) {
                x += this.font.getKerningValue(glyph, glyphs[i + 1]);
            }
        }
        if (glyphs.length > 0) {
            x -= spacing;
        }
        return { glyphs: placed, advance: x };
    }

    public measure(text: string, size: number, letterSpacing = 0): number {
        return (this.layout(text, letterSpacing).advance * size) / this.unitsPerEm;
    }

    /** Ink height of `text` at `size`, matching what canvas `actualBoundingBox*` reports. */
    public inkHeight(text: string, size: number): number {
        let top = 0;
        let bottom = 0;
        for (const glyph of this.font.stringToGlyphs(text)) {
            const box = glyph.getBoundingBox();
            top = Math.max(top, box.y2);
            bottom = Math.min(bottom, box.y1);
        }
        return ((top - bottom) * size) / this.unitsPerEm;
    }

    public get ascender(): number {
        return this.font.ascender / this.unitsPerEm;
    }

    public get descender(): number {
        return this.font.descender / this.unitsPerEm;
    }

    public get xHeight(): number {
        return (this.font.tables.os2?.sxHeight ?? 500) / this.unitsPerEm;
    }
}

/**
 * Collects every glyph outline used in the image once, so text renders as `<use>` references into shared `<defs>`.
 */
export class GlyphLibrary {
    private readonly _paths = new Map<string, string>();

    public readonly sans = new FontFace('s', 'noto-sans/NotoSans-Regular.otf');
    public readonly sansBold = new FontFace('sb', 'noto-sans/NotoSans-Bold.otf');
    public readonly sansItalic = new FontFace('si', 'noto-sans/NotoSans-Italic.otf');
    public readonly sansBoldItalic = new FontFace('sbi', 'noto-sans/NotoSans-BoldItalic.otf');
    public readonly serif = new FontFace('r', 'noto-serif/NotoSerif-Regular.otf');
    public readonly serifBold = new FontFace('rb', 'noto-serif/NotoSerif-Bold.otf');
    public readonly serifItalic = new FontFace('ri', 'noto-serif/NotoSerif-Italic.otf');
    public readonly serifBoldItalic = new FontFace('rbi', 'noto-serif/NotoSerif-BoldItalic.otf');
    public readonly music = new FontFace('m', 'bravura/Bravura.otf');

    private static readonly _serifFamilies = new Set(['georgia', 'times', 'times new roman', 'serif', 'noto serif']);

    /** Maps CSS font families to the bundled Noto faces; unknown families fall back to Noto Sans. */
    public resolve(families: string[], bold: boolean, italic: boolean): FontFace {
        const serif = families.some(f => GlyphLibrary._serifFamilies.has(f.replace(/["']/g, '').trim().toLowerCase()));
        if (serif) {
            return bold ? (italic ? this.serifBoldItalic : this.serifBold) : italic ? this.serifItalic : this.serif;
        }
        return bold ? (italic ? this.sansBoldItalic : this.sansBold) : italic ? this.sansItalic : this.sans;
    }

    private _ref(face: FontFace, glyph: Glyph): string | undefined {
        const id = `${face.id}${glyph.index}`;
        if (!this._paths.has(id)) {
            const d = glyph.getPath(0, 0, face.unitsPerEm).toPathData({ decimalPlaces: 0, flipY: false });
            if (!d) {
                return undefined;
            }
            this._paths.set(id, d);
        }
        return id;
    }

    /** SVG markup drawing `run` as glyph references; returns the markup and the run width. */
    public text(run: TextRun): { svg: string; width: number } {
        const { glyphs, advance } = run.face.layout(run.text, run.letterSpacing ?? 0);
        const scale = run.size / run.face.unitsPerEm;
        let startX = run.x;
        if (run.align === 'middle') {
            startX -= (advance * scale) / 2;
        } else if (run.align === 'end') {
            startX -= advance * scale;
        }
        let uses = '';
        for (const { glyph, x } of glyphs) {
            const id = this._ref(run.face, glyph);
            if (id) {
                uses += x === 0 ? `<use href="#${id}"/>` : `<use href="#${id}" x="${Math.round(x)}"/>`;
            }
        }
        const svg = uses
            ? `<g transform="translate(${num(startX)} ${num(run.y)}) scale(${num(scale, 5)})"${run.attributes ? ` ${run.attributes}` : ''}>${uses}</g>`
            : '';
        return { svg, width: advance * scale };
    }

    public defs(): string {
        let s = '';
        for (const [id, d] of this._paths) {
            s += `<path id="${id}" d="${d}"/>`;
        }
        return s;
    }
}

export function num(v: number, digits = 2): string {
    return String(Number(v.toFixed(digits)));
}

/**
 * Registers an alphaTab render engine named `engine` whose SVG output draws all text and music symbols as outlines
 * from `glyphs`, and measures text with the same fonts so the layout matches the outlines. Text for which `omitText`
 * returns true is laid out but not drawn.
 */
export function registerOutlineEngine(
    alphaTab: AlphaTab,
    glyphs: GlyphLibrary,
    engine: string,
    omitText: (text: string) => boolean = () => false
) {
    const { TextAlign, TextBaseline } = alphaTab.platform;
    const { FontStyle, FontWeight } = alphaTab.model;

    const SvgCanvas = (alphaTab.platform as unknown as { SvgCanvas: abstract new () => SvgCanvasBase }).SvgCanvas;

    class OutlineSvgCanvas extends SvgCanvas {
        private _face(): FontFace {
            return glyphs.resolve(
                this.font.families,
                this.font.weight === FontWeight.Bold,
                this.font.style === FontStyle.Italic
            );
        }

        private _fill(): string {
            return this.color.rgba === '#000000' ? '' : `fill="${this.color.rgba}"`;
        }

        private _append(markup: string) {
            this.buffer += markup;
        }

        public override fillText(text: string, x: number, y: number): void {
            if (!text || omitText(text)) {
                return;
            }
            const face = this._face();
            const size = this.font.size * this.scale;
            let baseline = y * this.scale;
            switch (this.textBaseline) {
                case TextBaseline.Top:
                    // Matches Chromium's `hanging` baseline for fonts without a BASE table: 80% of the ascent.
                    baseline += face.ascender * 0.8 * size;
                    break;
                case TextBaseline.Middle:
                    baseline += (face.xHeight / 2) * size;
                    break;
                case TextBaseline.Bottom:
                    baseline += face.descender * size;
                    break;
            }
            const align =
                this.textAlign === TextAlign.Center ? 'middle' : this.textAlign === TextAlign.Right ? 'end' : 'start';
            this._append(
                glyphs.text({ text, x: x * this.scale, y: baseline, size, face, align, attributes: this._fill() }).svg
            );
        }

        public override measureText(text: string) {
            if (!text) {
                return new alphaTab.platform.MeasuredText(0, 0);
            }
            const face = this._face();
            return new alphaTab.platform.MeasuredText(
                face.measure(text, this.font.size),
                face.inkHeight(text, this.font.size)
            );
        }

        public fillMusicFontSymbol(
            x: number,
            y: number,
            relativeScale: number,
            symbol: number,
            centerAtPosition?: boolean
        ): void {
            this.fillMusicFontSymbols(x, y, relativeScale, [symbol], centerAtPosition);
        }

        public fillMusicFontSymbols(
            x: number,
            y: number,
            relativeScale: number,
            symbols: number[],
            centerAtPosition?: boolean
        ): void {
            const text = symbols
                .filter(s => s !== alphaTab.model.MusicFontSymbol.None)
                .map(s => String.fromCodePoint(s))
                .join('');
            if (!text) {
                return;
            }
            const size = this.settings.display.resources.engravingSettings.musicFontSize * this.scale * relativeScale;
            this._append(
                glyphs.text({
                    text,
                    x: x * this.scale,
                    y: y * this.scale,
                    size,
                    face: glyphs.music,
                    align: centerAtPosition ? 'middle' : 'start',
                    attributes: this._fill()
                }).svg
            );
        }
    }

    alphaTab.Environment.renderEngines.set(
        engine,
        new alphaTab.RenderEngineFactory(false, () => new OutlineSvgCanvas())
    );
}
