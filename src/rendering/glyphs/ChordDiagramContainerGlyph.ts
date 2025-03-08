import { Chord } from '@src/model/Chord';
import { ICanvas } from '@src/platform';
import { ChordDiagramGlyph } from '@src/rendering/glyphs/ChordDiagramGlyph';
import { RowContainerGlyph } from '@src/rendering/glyphs/RowContainerGlyph';
import { ElementStyleHelper } from '../utils/ElementStyleHelper';
import { ScoreSubElement } from '@src/model/Score';

export class ChordDiagramContainerGlyph extends RowContainerGlyph {
    public constructor(x: number, y: number) {
        super(x, y);
    }

    public addChord(chord: Chord): void {
        if (chord.strings.length > 0) {
            let chordDiagram: ChordDiagramGlyph = new ChordDiagramGlyph(0, 0, chord);
            chordDiagram.renderer = this.renderer;
            chordDiagram.doLayout();
            this.glyphs!.push(chordDiagram);
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.glyphs!.length > 0) {
            using _ = ElementStyleHelper.score(
                canvas,
                ScoreSubElement.ChordDiagramList,
                this.renderer.scoreRenderer.score!
            );
            super.paint(cx, cy, canvas);
        }
    }
}
