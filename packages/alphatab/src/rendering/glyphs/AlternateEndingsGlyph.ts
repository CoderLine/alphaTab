import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import type { RenderingResources } from '@src/RenderingResources';
import { ModelUtils } from '@src/model/ModelUtils';
import { BarLineStyle } from '@src/model/Bar';

export class AlternateEndingsGlyph extends EffectGlyph {
    private _endings: number[];
    private _endingsString: string = '';
    private _openLine: boolean;
    private _closeLine: boolean;
    private _indent: boolean;

    public constructor(
        x: number,
        y: number,
        alternateEndings: number,
        openLine: boolean,
        closeLine: boolean,
        indent: boolean
    ) {
        super(x, y);
        this._endings = ModelUtils.getAlternateEndingsList(alternateEndings);
        this._openLine = openLine;
        this._closeLine = closeLine;
        this._indent = indent;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = this.renderer.resources.wordsFont.size + this.renderer.smuflMetrics.alternateEndingsPadding * 2;
        let endingsStrings: string = '';
        for (let i: number = 0, j: number = this._endings.length; i < j; i++) {
            endingsStrings += this._endings[i] + 1;
            endingsStrings += '. ';
        }
        this._endingsString = endingsStrings;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        let width = this._closeLine ? this.width - canvas.lineWidth : this.width;

        const lineBarRight = this.renderer.bar.getActualBarLineRight();
        if(lineBarRight === BarLineStyle.LightHeavy) {
            width -= this.renderer.smuflMetrics.thickBarlineThickness + this.renderer.smuflMetrics.barlineSeparation;
        }

        cx = (cx | 0) + canvas.lineWidth / 2;
        cy = (cy | 0) + canvas.lineWidth / 2;

        if (this._indent) {
            cx += this.renderer.smuflMetrics.alternateEndingsPadding;
            width -= this.renderer.smuflMetrics.alternateEndingsPadding;
        }

        if (this._openLine) {
            canvas.moveTo(cx + this.x, cy + this.y + this.height);
            canvas.lineTo(cx + this.x, cy + this.y);
        } else {
            canvas.moveTo(cx + this.x, cy + this.y);
        }

        canvas.lineTo(cx + this.x + width, cy + this.y);

        if (this._closeLine) {
            canvas.lineTo(cx + this.x + width, cy + this.y + this.height);
        }

        canvas.stroke();

        if (this._openLine) {
            const baseline: TextBaseline = canvas.textBaseline;
            canvas.textBaseline = TextBaseline.Top;
            const res: RenderingResources = this.renderer.resources;
            canvas.font = res.wordsFont;
            canvas.fillText(
                this._endingsString,
                cx + this.x + this.renderer.smuflMetrics.alternateEndingsPadding,
                cy + this.y + this.renderer.smuflMetrics.alternateEndingsPadding
            );
            canvas.textBaseline = baseline;
        }
    }
}
