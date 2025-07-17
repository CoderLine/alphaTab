import { TextBaseline, type ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import type { RenderingResources } from '@src/RenderingResources';

export class LineRangedGlyph extends GroupedEffectGlyph {
    private _label: string;
    private _dashed: boolean;
    private _labelWidth = 0;

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
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.effectFont;
        const size = this.renderer.scoreRenderer.canvas!.measureText(this._label);
        this.height = size.height;
        this._labelWidth = size.width;
    }

    protected override paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        const res: RenderingResources = this.renderer.resources;
        canvas.font = res.effectFont;

        const b = canvas.textBaseline;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.fillText(this._label, cx + this.x - this._labelWidth / 2, cy + this.y + this.height / 2);
        canvas.textBaseline = b;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        this.paintNonGrouped(cx, cy, canvas);
        const dashGap: number = this.renderer.smuflMetrics.lineRangedGlyphDashGap;
        const dashSize: number = this.renderer.smuflMetrics.lineRangedGlyphDashSize;
        const dashThickness = this.renderer.smuflMetrics.pedalLineThickness;

        const startX: number = cx + this.x + this._labelWidth / 2 + dashGap / 2;
        const lineY: number = cy + this.y + this.height / 2 - dashThickness / 2;

        if (this._dashed) {
            if (endX > startX) {
                let lineX: number = startX;
                while (lineX < endX) {
                    canvas.beginPath();
                    const dashEndX = Math.min(lineX + dashSize, endX);
                    canvas.fillRect(lineX, lineY, dashEndX - lineX, dashThickness);
                    lineX += dashSize + dashGap;
                }

                canvas.fillRect(endX, lineY - dashSize / 2 + dashThickness / 2, dashThickness, dashSize);
            }
        } else {
            canvas.fillRect(startX, lineY, dashThickness, dashThickness);
        }
    }
}
