import { Beat } from '@src/model/Beat';
import { ICanvas } from '@src/platform/ICanvas';
import { BendNoteHeadGroupGlyph } from '@src/rendering/glyphs/BendNoteHeadGroupGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class ScoreHelperNotesBaseGlyph extends Glyph {
    private static readonly SlurHeight: number = 11;
    public static readonly EndPadding: number = ((10 / 2) | 0) + 3;
    protected BendNoteHeads: BendNoteHeadGroupGlyph[] = [];

    protected drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        scale: number,
        slurText?: string
    ): void {
        let normalVectorX: number = y2 - y1;
        let normalVectorY: number = x2 - x1;
        let length: number = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
        if (down) {
            normalVectorX *= -1;
        } else {
            normalVectorY *= -1;
        }
        // make to unit vector
        normalVectorX /= length;
        normalVectorY /= length;
        // center of connection
        // TODO: should be 1/3
        let centerX: number = (x2 + x1) / 2;
        let centerY: number = (y2 + y1) / 2;
        let offset: number = 11 * scale;
        if (x2 - x1 < 20) {
            offset /= 2;
        }
        let cp1X: number = centerX + offset * normalVectorX;
        let cp1Y: number = centerY + offset * normalVectorY;
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(cp1X, cp1Y);
        canvas.lineTo(x2, y2);
        canvas.stroke();
        if (slurText) {
            let w: number = canvas.measureText(slurText);
            let textOffset: number = down ? 0 : -canvas.font.size;
            canvas.fillText(slurText, cp1X - w / 2, cp1Y + textOffset);
        }
    }

    public doLayout(): void {
        super.doLayout();
        this.width = 0;
        for (let noteHeads of this.BendNoteHeads) {
            noteHeads.doLayout();
            this.width += noteHeads.width + 10 * this.scale;
        }
    }

    protected getBeamDirection(beat: Beat, noteRenderer: ScoreBarRenderer): BeamDirection {
        // invert direction (if stems go up, ties go down to not cross them)
        switch (noteRenderer.getBeatDirection(beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }
}
