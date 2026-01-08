import type { Chord } from '@coderline/alphatab/model/Chord';
import { ScoreSubElement } from '@coderline/alphatab/model/Score';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { ChordDiagramGlyph } from '@coderline/alphatab/rendering/glyphs/ChordDiagramGlyph';
import { RowContainerGlyph } from '@coderline/alphatab/rendering/glyphs/RowContainerGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class ChordDiagramContainerGlyph extends RowContainerGlyph {
    public addChord(chord: Chord): void {
        if (chord.strings.length > 0) {
            const chordDiagram: ChordDiagramGlyph = new ChordDiagramGlyph(0, 0, chord, NotationElement.ChordDiagrams);
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
