import { ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { RenderingResources } from '@src/RenderingResources';
import { MasterBar } from '@src/model/MasterBar';

export class AlternateEndingsGlyph extends EffectGlyph {
    private static readonly Padding: number = 3;
    private _endings: number[];
    private _endingsString: string = "";

    public constructor(x: number, y: number, alternateEndings: number) {
        super(x, y);
        this._endings = [];
        for (let i: number = 0; i < MasterBar.MaxAlternateEndings; i++) {
            if ((alternateEndings & (0x01 << i)) !== 0) {
                this._endings.push(i);
            }
        }
    }

    public doLayout(): void {
        super.doLayout();
        this.height = this.renderer.resources.wordsFont.size + (AlternateEndingsGlyph.Padding * this.scale + 2);
        let endingsStrings: string = '';
        for (let i: number = 0, j: number = this._endings.length; i < j; i++) {
            endingsStrings += this._endings[i] + 1;
            endingsStrings += '. ';
        }
        this._endingsString = endingsStrings;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        let baseline: TextBaseline = canvas.textBaseline;
        canvas.textBaseline = TextBaseline.Top;
        if (this._endings.length > 0) {
            let res: RenderingResources = this.renderer.resources;
            canvas.font = res.wordsFont;
            canvas.moveTo(cx + this.x, cy + this.y + this.height);
            canvas.lineTo(cx + this.x, cy + this.y);
            canvas.lineTo(cx + this.x + this.width, cy + this.y);
            canvas.stroke();
            canvas.fillText(this._endingsString, cx + this.x + AlternateEndingsGlyph.Padding * this.scale, cy + this.y * this.scale);
        }
        canvas.textBaseline = baseline;
    }
}
