import { type ICanvas, TextAlign } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import type { RenderingResources } from '@src/RenderingResources';

export class LineRangedGlyph extends GroupedEffectGlyph {
    private _label: string;
    private _dashed: boolean;

    public constructor(label: string, dashed: boolean = true) {
        super(BeatXPosition.OnNotes);
        this._label = label;
        this._dashed = dashed;
    }

    public override doLayout(): void {
        if (this.renderer.settings.notation.extendLineEffectsToBeatEnd) {
            this.endPosition = BeatXPosition.EndBeat;
            this.forceGroupedRendering = true;
        }
        super.doLayout();
        this.height = this.renderer.resources.effectFont.size;
    }

    protected override paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        const res: RenderingResources = this.renderer.resources;
        canvas.font = res.effectFont;
        const x: TextAlign = canvas.textAlign;
        canvas.textAlign = TextAlign.Center;
        canvas.fillText(this._label, cx + this.x, cy + this.y);
        canvas.textAlign = x;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        this.paintNonGrouped(cx, cy, canvas);
        const lineSpacing: number = this.renderer.smuflMetrics.lineRangedGlyphSpacing;
        const textWidth: number = canvas.measureText(this._label).width;
        const startX: number = cx + this.x + textWidth / 2 + lineSpacing;
        const lineY: number = cy + this.y + this.renderer.smuflMetrics.lineRangedGlyphTopPadding;
        const lineSize: number = this.renderer.smuflMetrics.lineRangedGlyphSize;
        if (this._dashed) {
            if (endX > startX) {
                let lineX: number = startX;
                while (lineX < endX) {
                    canvas.beginPath();
                    canvas.moveTo(lineX, lineY | 0);
                    canvas.lineTo(Math.min(lineX + lineSize, endX), lineY | 0);
                    lineX += lineSize + lineSpacing;
                    canvas.stroke();
                }
                canvas.beginPath();
                canvas.moveTo(endX, (lineY - this.renderer.smuflMetrics.lineRangedGlyphTopOffset) | 0);
                canvas.lineTo(endX, (lineY + this.renderer.smuflMetrics.lineRangedGlyphTopOffset) | 0);
                canvas.stroke();
            }
        } else {
            canvas.beginPath();
            canvas.moveTo(startX, lineY | 0);
            canvas.lineTo(endX, lineY | 0);
            canvas.lineTo(endX, (lineY + this.renderer.smuflMetrics.lineRangedGlyphTopOffset) | 0);
            canvas.stroke();
        }
    }
}
