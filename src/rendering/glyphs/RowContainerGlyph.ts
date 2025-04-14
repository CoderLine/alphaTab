import { type ICanvas, TextAlign } from '@src/platform/ICanvas';
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

    public override doLayout(): void {
        let x: number = 0;
        let y: number = 0;
        const padding: number = RowContainerGlyph.Padding;
        this._rows = [];
        let row: RowGlyphContainer = new RowGlyphContainer(x, y, this._align);
        row.width = this.width;
        for (const g of this.glyphs!) {
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
        this.height = y;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (const row of this._rows) {
            row.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
