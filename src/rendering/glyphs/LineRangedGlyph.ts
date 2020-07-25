import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { RenderingResources } from '@src/RenderingResources';

export class LineRangedGlyph extends GroupedEffectGlyph {
    public static readonly LineSpacing: number = 3;
    public static readonly LineTopPadding: number = 4;
    public static readonly LineTopOffset: number = 5;
    public static readonly LineSize: number = 8;
    private _label: string;

    public constructor(label: string) {
        super(BeatXPosition.OnNotes);
        this._label = label;
    }

    public doLayout(): void {
        if (this.renderer.settings.notation.extendLineEffectsToBeatEnd) {
            this.endPosition = BeatXPosition.EndBeat;
            this.forceGroupedRendering = true;
        }
        super.doLayout();
        this.height = this.renderer.resources.effectFont.size;
    }

    protected paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        canvas.font = res.effectFont;
        let x: TextAlign = canvas.textAlign;
        canvas.textAlign = TextAlign.Center;
        canvas.fillText(this._label, cx + this.x, cy + this.y);
        canvas.textAlign = x;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        this.paintNonGrouped(cx, cy, canvas);
        let lineSpacing: number = 3 * this.scale;
        let textWidth: number = canvas.measureText(this._label);
        let startX: number = cx + this.x + textWidth / 2 + lineSpacing;
        let lineY: number = cy + this.y + 4 * this.scale;
        let lineSize: number = 8 * this.scale;
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
            canvas.moveTo(endX, (lineY - 5 * this.scale) | 0);
            canvas.lineTo(endX, (lineY + 5 * this.scale) | 0);
            canvas.stroke();
        }
    }
}
