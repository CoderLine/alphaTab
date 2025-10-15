import { type ICanvas, TextAlign } from '@src/platform/ICanvas';
import { RowGlyphContainer } from '@src/rendering/glyphs/RowGlyphContainer';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

/**
 * @internal
 */
export class RowContainerGlyph extends GlyphGroup {
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
        const gap: number = this.renderer.smuflMetrics.rowContainerGap;
        this._rows = [];
        let row: RowGlyphContainer = new RowGlyphContainer(x, y, this._align);
        row.renderer = this.renderer;
        row.width = this.width;
        for (const g of this.glyphs!) {
            const endX = x + g.width + gap;
            if (endX < this.width) {
                row.addGlyphToRow(g);
                x = Math.ceil(endX);
            } else {
                if (!row.isEmpty) {
                    row.doLayout();
                    this._rows.push(row);
                    y += row.height + gap;
                }
                x = 0;
                row = new RowGlyphContainer(x, y, this._align);
                row.renderer = this.renderer;
                row.width = this.width;
                row.addGlyphToRow(g);
                x += Math.ceil(g.width + gap);
            }
        }
        if (!row.isEmpty) {
            row.doLayout();
            this._rows.push(row);
            y += Math.ceil(row.height + this.renderer.smuflMetrics.rowContainerPadding);
        }
        this.height = y;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (const row of this._rows) {
            row.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
