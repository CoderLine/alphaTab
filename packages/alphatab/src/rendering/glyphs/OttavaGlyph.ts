import { Ottavia } from '@src/model/Ottavia';
import { CanvasHelper, type ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

/**
 * @internal
 */
export class OttavaGlyph extends GroupedEffectGlyph {
    private _ottava: Ottavia;
    private _aboveStaff: boolean;

    public constructor(ottava: Ottavia, aboveStaff: boolean) {
        super(BeatXPosition.PostNotes);
        this._ottava = ottava;
        this._aboveStaff = aboveStaff;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.QuindicesimaAlta)!;
    }

    protected override paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        this._paintOttava(cx, cy, canvas);
    }

    private _paintOttava(cx: number, cy: number, canvas: ICanvas): number {
        let size: number = 0;
        switch (this._ottava) {
            case Ottavia._15ma:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.QuindicesimaAlta)!;
                CanvasHelper.fillMusicFontSymbolSafe(canvas,
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    1,
                    MusicFontSymbol.QuindicesimaAlta,
                    false
                );
                break;
            case Ottavia._8va:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OttavaAlta)!;
                CanvasHelper.fillMusicFontSymbolSafe(canvas,
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    1,
                    MusicFontSymbol.OttavaAlta,
                    false
                );
                break;
            case Ottavia._8vb:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OttavaBassaVb)!;
                CanvasHelper.fillMusicFontSymbolSafe(canvas,
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    1,
                    MusicFontSymbol.OttavaBassaVb,
                    false
                );
                break;
            case Ottavia._15mb:
                size =
                    (this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.Quindicesima)! +
                        this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OctaveBaselineM)! +
                        this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OctaveBaselineB)!) *
                    1;

                // NOTE: SMUFL does not have a glyph for 15mb so we build it
                CanvasHelper.fillMusicFontSymbolsSafe(canvas,
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    1,
                    [MusicFontSymbol.Quindicesima, MusicFontSymbol.OctaveBaselineM, MusicFontSymbol.OctaveBaselineB],
                    false
                );
                break;
        }
        return size / 2;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        const size: number = this._paintOttava(cx, cy, canvas);
        const lineSpacing: number = this.renderer.smuflMetrics.lineRangedGlyphDashGap;
        const startX: number = cx + this.x + size + lineSpacing;
        let lineY: number = cy + this.y;
        const padding = this.height * 0.5;
        lineY += this._aboveStaff ? 0 : this.height;
        const lineSize: number = this.renderer.smuflMetrics.lineRangedGlyphDashSize;
        const lw = canvas.lineWidth;
        canvas.lineWidth = this.renderer.smuflMetrics.octaveLineThickness;
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
            if (this._aboveStaff) {
                canvas.moveTo(endX, lineY);
                canvas.lineTo(endX, lineY + padding);
            } else {
                canvas.moveTo(endX, lineY);
                canvas.lineTo(endX, lineY - padding);
            }
            canvas.stroke();
        }
        canvas.lineWidth = lw;
    }
}
