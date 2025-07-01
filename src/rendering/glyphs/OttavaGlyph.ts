import { Ottavia } from '@src/model/Ottavia';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

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
        this.paintOttava(cx, cy, canvas);
    }

    private paintOttava(cx: number, cy: number, canvas: ICanvas): number {
        let size: number = 0;
        const ottavaScale = this.renderer.smuflMetrics.ottavaScale;
        switch (this._ottava) {
            case Ottavia._15ma:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.QuindicesimaAlta)! * ottavaScale;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    ottavaScale,
                    MusicFontSymbol.QuindicesimaAlta,
                    false
                );
                break;
            case Ottavia._8va:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OttavaAlta)! * ottavaScale;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    ottavaScale,
                    MusicFontSymbol.OttavaAlta,
                    false
                );
                break;
            case Ottavia._8vb:
                size = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OttavaBassaVb)! * ottavaScale;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    ottavaScale,
                    MusicFontSymbol.OttavaBassaVb,
                    false
                );
                break;
            case Ottavia._15mb:
                size =
                    (this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.Quindicesima)! +
                        this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OctaveBaselineM)! +
                        this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OctaveBaselineB)!) *
                    ottavaScale;

                // NOTE: SMUFL does not have a glyph for 15mb so we build it
                canvas.fillMusicFontSymbols(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    ottavaScale,
                    [MusicFontSymbol.Quindicesima, MusicFontSymbol.OctaveBaselineM, MusicFontSymbol.OctaveBaselineB],
                    false
                );
                break;
        }
        return size / 2;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        const size: number = this.paintOttava(cx, cy, canvas);
        const lineSpacing: number = this.renderer.smuflMetrics.ottavaLineSpacing;
        const startX: number = cx + this.x + size + lineSpacing;
        let lineY: number = cy + this.y;
        lineY += this._aboveStaff ? this.renderer.smuflMetrics.ottavaPaddingY : this.height - this.renderer.smuflMetrics.ottavaPaddingY;
        const lineSize: number = this.renderer.smuflMetrics.ottavaLineSize;
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
                canvas.lineTo(endX, cy + this.y + this.height);
            } else {
                canvas.moveTo(endX, lineY);
                canvas.lineTo(endX, cy + this.y);
            }
            canvas.stroke();
        }
    }
}
