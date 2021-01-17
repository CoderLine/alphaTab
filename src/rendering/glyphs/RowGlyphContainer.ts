import { TextAlign } from '@src/platform/ICanvas';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { Glyph } from './Glyph';

export class RowGlyphContainer extends GlyphGroup {
    private _glyphWidth: number = 0;
    private _align: TextAlign;

    public constructor(x: number, y: number, align: TextAlign = TextAlign.Center) {
        super(x, y);
        this.glyphs = [];
        this._align = align;
    }

    public doLayout(): void {
        let x: number = 0;
        switch (this._align) {
            case TextAlign.Left:
                x = 0;
                break;
            case TextAlign.Center:
                x = (this.width - this._glyphWidth) / 2;
                break;
            case TextAlign.Right:
                x = this.width - this._glyphWidth;
                break;
        }
        for (let glyph of this.glyphs!) {
            glyph.x = x;
            x += glyph.width;
        }
    }

    public addGlyphToRow(glyph: Glyph): void {
        this.glyphs!.push(glyph);
        this._glyphWidth += glyph.width;
        if (glyph.height > this.height) {
            this.height = glyph.height;
        }
    }
}
