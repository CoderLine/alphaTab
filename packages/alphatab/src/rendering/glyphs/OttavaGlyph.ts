import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@coderline/alphatab/rendering/glyphs/GroupedEffectGlyph';

/**
 * @internal
 */
export class OttavaGlyph extends GroupedEffectGlyph {
    private _ottava: Ottavia;
    private _aboveStaff: boolean;
    private _symbolWidth: number = 0;

    public constructor(ottava: Ottavia, aboveStaff: boolean) {
        super(BeatXPosition.PostNotes);
        this._ottava = ottava;
        this._aboveStaff = aboveStaff;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.QuindicesimaAlta)!;
        this._symbolWidth = OttavaGlyph._resolveSymbolWidth(this._ottava, this.renderer.smuflMetrics.glyphWidths);
    }

    public override getBoundingBoxLeft(): number {
        return this.x - this._symbolWidth / 2;
    }

    private static _resolveSymbolWidth(ottava: Ottavia, glyphWidths: Map<MusicFontSymbol, number>): number {
        switch (ottava) {
            case Ottavia._15ma:
                return glyphWidths.get(MusicFontSymbol.QuindicesimaAlta) ?? 0;
            case Ottavia._8va:
                return glyphWidths.get(MusicFontSymbol.OttavaAlta) ?? 0;
            case Ottavia._8vb:
                return glyphWidths.get(MusicFontSymbol.OttavaBassaVb) ?? 0;
            case Ottavia._15mb:
                return (
                    (glyphWidths.get(MusicFontSymbol.Quindicesima) ?? 0) +
                    (glyphWidths.get(MusicFontSymbol.OctaveBaselineM) ?? 0) +
                    (glyphWidths.get(MusicFontSymbol.OctaveBaselineB) ?? 0)
                );
            default:
                return 0;
        }
    }

    protected override paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        this._paintOttava(cx, cy, canvas);
    }

    private _paintOttava(cx: number, cy: number, canvas: ICanvas): number {
        let size: number = 0;
        switch (this._ottava) {
            case Ottavia._15ma:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.QuindicesimaAlta)!;
                CanvasHelper.fillMusicFontSymbolSafe(
                    canvas,
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    1,
                    MusicFontSymbol.QuindicesimaAlta,
                    false
                );
                break;
            case Ottavia._8va:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OttavaAlta)!;
                CanvasHelper.fillMusicFontSymbolSafe(
                    canvas,
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    1,
                    MusicFontSymbol.OttavaAlta,
                    false
                );
                break;
            case Ottavia._8vb:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OttavaBassaVb)!;
                CanvasHelper.fillMusicFontSymbolSafe(
                    canvas,
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
                CanvasHelper.fillMusicFontSymbolsSafe(
                    canvas,
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
