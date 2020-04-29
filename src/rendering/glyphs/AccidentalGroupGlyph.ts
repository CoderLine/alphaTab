import { Glyph } from '@src/rendering/glyphs/Glyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

export class AccidentalGroupGlyph extends GlyphGroup {
    private static readonly NonReserved: number = -3000;

    public constructor() {
        super(0, 0);
    }

    public doLayout(): void {
        if (!this.glyphs) {
            this.width = 0;
            return;
        }
        //
        // Determine Columns for accidentals
        //
        this.glyphs.sort((a, b) => {
            if (a.y < b.y) {
                return -1;
            }
            if (a.y > b.y) {
                return 1;
            }
            return 0;
        });
        // defines the reserved y position of the columns
        let columns: number[] = [];
        columns.push(AccidentalGroupGlyph.NonReserved);
        let accidentalSize: number = 21 * this.scale;
        for (let i: number = 0, j: number = this.glyphs.length; i < j; i++) {
            let g: Glyph = this.glyphs[i];
            g.renderer = this.renderer;
            g.doLayout();
            // find column where glyph fits into
            // as long the glyph does not fit into the current column
            let gColumn: number = 0;
            while (columns[gColumn] > g.y) {
                // move to next column
                gColumn++;
                // and create the new column if needed
                if (gColumn === columns.length) {
                    columns.push(AccidentalGroupGlyph.NonReserved);
                }
            }
            // temporary save column as X
            g.x = gColumn;
            columns[gColumn] = g.y + accidentalSize;
        }
        //
        // Place accidentals in columns
        //
        let columnWidth: number = 8 * this.scale;
        let padding: number = 2 * this.scale;
        if (this.glyphs.length === 0) {
            this.width = 0;
        } else {
            this.width = padding + columnWidth * columns.length;
        }
        for (let i: number = 0, j: number = this.glyphs.length; i < j; i++) {
            let g: Glyph = this.glyphs[i];
            g.x = padding + (this.width - (g.x + 1) * columnWidth);
        }
    }
}
