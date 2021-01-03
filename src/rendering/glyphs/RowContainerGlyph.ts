import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { RowGlyphContainer } from '@src/rendering/glyphs/RowGlyphContainer';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

export class RowContainerGlyph extends GlyphGroup {
    private static readonly Padding: number = 3;
    private _rows: RowGlyphContainer[] = [];
    private _align: TextAlign;

    public constructor(x: number, y: number, align: TextAlign = TextAlign.Center) {
        super(x, y);
        this.height = 0.0;
        this.glyphs = [];
        this._align = align;
    }

    public doLayout(): void {
        let x: number = 0;
        let y: number = 0;
        let padding: number = 2 * RowContainerGlyph.Padding * this.scale;
        this._rows = [];
        let row: RowGlyphContainer = new RowGlyphContainer(x, y, this._align);
        row.width = this.width;
        for (let g of this.glyphs!) {
            if (x + g.width < this.width) {
                row.addGlyphToRow(g);
                x += g.width;
            } else {
                if (!row.isEmpty) {
                    row.doLayout();
                    this._rows.push(row);
                    y += row.height + padding;
                }
                x = 0;
                row = new RowGlyphContainer(x, y, this._align);
                row.width = this.width;
                row.addGlyphToRow(g);
                x += g.width;
            }
        }
        if (!row.isEmpty) {
            row.doLayout();
            this._rows.push(row);
            y += row.height + padding;
        }
        this.height = y + padding;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        for (let row of this._rows) {
            row.paint(cx + this.x, cy + this.y + RowContainerGlyph.Padding * this.scale, canvas);
        }
    }
}
