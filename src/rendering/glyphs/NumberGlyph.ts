import { DigitGlyph } from '@src/rendering/glyphs/DigitGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

export class NumberGlyph extends GlyphGroup {
    public static readonly numberHeight:number = 18;
    
    private _number: number = 0;
    private _scale: number = 0;

    public constructor(x: number, y: number, num: number, scale: number = 1.0) {
        super(x, y);
        this._number = num;
        this._scale = scale;
    }

    public doLayout(): void {
        let i: number = this._number;
        while (i > 0) {
            let num: number = i % 10;
            let gl: DigitGlyph = new DigitGlyph(0, 0, num, this._scale);
            this.addGlyph(gl);
            i = (i / 10) | 0;
        }

        if (this.glyphs) {
            this.glyphs.reverse();
            let cx: number = 0;
            for (let j: number = 0, k: number = this.glyphs.length; j < k; j++) {
                let g: Glyph = this.glyphs[j];
                g.x = cx;
                g.y = 0;
                g.renderer = this.renderer;
                g.doLayout();
                cx += g.width;
            }
            this.width = cx;
        }
    }
}
