import { Beat } from '@src/model/Beat';
import { BrushType } from '@src/model/BrushType';
import { VibratoType } from '@src/model/VibratoType';
import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NoteVibratoGlyph } from '@src/rendering/glyphs/NoteVibratoGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';

export class ScoreBrushGlyph extends Glyph {
    private _beat: Beat;

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
    }

    public doLayout(): void {
        this.width = 10 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // TODO: Create webfont version
        let scoreBarRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        let lineSize: number = scoreBarRenderer.lineOffset;
        let startY: number = cy + this.y + (scoreBarRenderer.getNoteY(this._beat.maxNote!, false) - lineSize);
        let endY: number = cy + this.y + scoreBarRenderer.getNoteY(this._beat.minNote!, false) + lineSize;
        let arrowX: number = cx + this.x + this.width / 2;
        let arrowSize: number = 8 * this.scale;
        if (this._beat.brushType !== BrushType.None) {
            if (this._beat.brushType === BrushType.ArpeggioUp) {
                let lineStartY: number = startY - arrowSize;
                let lineEndY: number = endY - arrowSize;
                canvas.beginRotate(cx + this.x + 2 * this.scale, lineEndY, -90);
                let glyph: NoteVibratoGlyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight, 1.2);
                glyph.renderer = this.renderer;
                glyph.doLayout();
                glyph.width = Math.abs(lineEndY - lineStartY);
                glyph.paint(0, 0, canvas);
                canvas.endRotate();
                canvas.beginPath();
                canvas.moveTo(arrowX, endY);
                canvas.lineTo(arrowX + arrowSize / 2, endY - arrowSize);
                canvas.lineTo(arrowX - arrowSize / 2, endY - arrowSize);
                canvas.closePath();
                canvas.fill();
            } else if (this._beat.brushType === BrushType.ArpeggioDown) {
                let lineStartY: number = startY + arrowSize;
                let lineEndY: number = endY + arrowSize;
                canvas.beginRotate(cx + this.x + 7 * this.scale, lineStartY, 90);
                let glyph: NoteVibratoGlyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight, 1.2);
                glyph.renderer = this.renderer;
                glyph.doLayout();
                glyph.width = Math.abs(lineEndY - lineStartY);
                glyph.paint(0, 0, canvas);
                canvas.endRotate();
                canvas.beginPath();
                canvas.moveTo(arrowX, startY);
                canvas.lineTo(arrowX + arrowSize / 2, startY + arrowSize);
                canvas.lineTo(arrowX - arrowSize / 2, startY + arrowSize);
                canvas.closePath();
                canvas.fill();
            }
        }
    }
}
