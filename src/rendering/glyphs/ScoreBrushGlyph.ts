import type { Beat } from '@src/model/Beat';
import { BrushType } from '@src/model/BrushType';
import { VibratoType } from '@src/model/VibratoType';
import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NoteVibratoGlyph } from '@src/rendering/glyphs/NoteVibratoGlyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { NoteYPosition } from '@src/rendering/BarRendererBase';

export class ScoreBrushGlyph extends Glyph {
    private _beat: Beat;

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
    }

    public override doLayout(): void {
        this.width =
            this._beat.brushType === BrushType.ArpeggioUp || this._beat.brushType === BrushType.ArpeggioDown ? 10 : 0;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this._beat.brushType === BrushType.ArpeggioUp || this._beat.brushType === BrushType.ArpeggioDown) {
            const scoreBarRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
            const lineSize: number = scoreBarRenderer.lineOffset;
            const startY: number =
                cy + this.y + (scoreBarRenderer.getNoteY(this._beat.maxNote!, NoteYPosition.Bottom) - lineSize);
            const endY: number =
                cy + this.y + scoreBarRenderer.getNoteY(this._beat.minNote!, NoteYPosition.Top) + lineSize;
            const arrowX: number = cx + this.x + this.width / 2;
            const arrowSize: number = 8;

            const glyph: NoteVibratoGlyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight, 1.2, true);
            glyph.renderer = this.renderer;
            glyph.doLayout();

            const waveOffset = -glyph.height / 2;

            if (this._beat.brushType === BrushType.ArpeggioUp) {
                const lineStartY: number = startY + arrowSize;
                const lineEndY: number = endY - arrowSize;
                glyph.width = Math.abs(lineEndY - lineStartY);

                canvas.beginRotate(cx + this.x + 5, lineEndY, -90);
                glyph.paint(0, waveOffset, canvas);
                canvas.endRotate();

                canvas.beginPath();
                canvas.moveTo(arrowX, endY);
                canvas.lineTo(arrowX + arrowSize / 2, endY - arrowSize);
                canvas.lineTo(arrowX - arrowSize / 2, endY - arrowSize);
                canvas.closePath();
                canvas.fill();
            } else if (this._beat.brushType === BrushType.ArpeggioDown) {
                const lineStartY: number = startY + arrowSize;
                const lineEndY: number = endY;
                glyph.width = Math.abs(lineEndY - lineStartY);

                canvas.beginRotate(cx + this.x + 5, lineStartY, 90);
                glyph.paint(0, waveOffset, canvas);
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
