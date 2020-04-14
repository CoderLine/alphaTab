import { Chord } from '@src/model/Chord';
import { ICanvas } from '@src/platform/ICanvas';
import { ChordDiagramGlyph } from '@src/rendering/glyphs/ChordDiagramGlyph';
import { ChordDiagramRowGlyph } from '@src/rendering/glyphs/ChordDiagramRowGlyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

export class ChordDiagramContainerGlyph extends GlyphGroup {
    private static readonly Padding: number = 3;
    private _rows: ChordDiagramRowGlyph[] = [];
    public height: number = 0;

    public constructor(x: number, y: number) {
        super(x, y);
        this.height = 0.0;
        this.glyphs = [];
    }

    public addChord(chord: Chord): void {
        if (chord.strings.length > 0) {
            let chordDiagram: ChordDiagramGlyph = new ChordDiagramGlyph(0, 0, chord);
            chordDiagram.renderer = this.renderer;
            chordDiagram.doLayout();
            this.glyphs!.push(chordDiagram);
        }
    }

    public doLayout(): void {
        let x: number = 0;
        let y: number = 0;
        let padding: number = 2 * 3 * this.scale;
        this._rows = [];
        let row: ChordDiagramRowGlyph = new ChordDiagramRowGlyph(x, y);
        row.width = this.width;
        for (let g of this.glyphs!) {
            if (x + g.width < this.width) {
                row.addChord(g as ChordDiagramGlyph);
                x += g.width;
            } else {
                if (!row.isEmpty) {
                    row.doLayout();
                    this._rows.push(row);
                    y += row.height + padding;
                }
                x = 0;
                row = new ChordDiagramRowGlyph(x, y);
                row.width = this.width;
                row.addChord(g as ChordDiagramGlyph);
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
            row.paint(cx + this.x, cy + this.y + 3 * this.scale, canvas);
        }
    }
}
