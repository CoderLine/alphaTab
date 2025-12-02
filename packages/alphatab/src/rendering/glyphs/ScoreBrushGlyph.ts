import type { Beat } from '@coderline/alphatab/model/Beat';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteVibratoGlyph } from '@coderline/alphatab/rendering/glyphs/NoteVibratoGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';

/**
 * @internal
 */
export class ScoreBrushGlyph extends Glyph {
    private _beat: Beat;
    private _noteVibratoGlyph?: NoteVibratoGlyph;

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
    }

    public override doLayout(): void {
        if (this._beat.brushType === BrushType.ArpeggioUp || this._beat.brushType === BrushType.ArpeggioDown) {
            const glyph: NoteVibratoGlyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight, true);
            glyph.renderer = this.renderer;
            glyph.doLayout();
            this._noteVibratoGlyph = glyph;
            this.width = glyph.height;
        } else {
            this.width = 0;
        }
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
            const arrowSize = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.ArrowheadBlackDown)!;

            const glyph: NoteVibratoGlyph = this._noteVibratoGlyph!;

            if (this._beat.brushType === BrushType.ArpeggioUp) {
                const lineStartY: number = startY + arrowSize;
                const lineEndY: number = endY - arrowSize;
                glyph.width = Math.abs(lineEndY - lineStartY);

                canvas.beginRotate(cx + this.x, lineEndY, -90);
                glyph.paint(0, 0, canvas);
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

                canvas.beginRotate(cx + this.x, lineStartY, 90);
                glyph.paint(0, -glyph.height, canvas);
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
