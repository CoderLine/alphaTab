import { Ottavia } from '@src/model/Ottavia';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';

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
        this.height = MusicFontSymbolSizes.Heights.get(MusicFontSymbol.QuindicesimaAlta)!;
    }

    protected override paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        this.paintOttava(cx, cy, canvas);
    }

    private paintOttava(cx: number, cy: number, canvas: ICanvas): number {
        let size: number = 0;
        switch (this._ottava) {
            case Ottavia._15ma:
                size = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.QuindicesimaAlta)! * 0.8;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    0.8,
                    MusicFontSymbol.QuindicesimaAlta,
                    false
                );
                break;
            case Ottavia._8va:
                size = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.OttavaAlta)! * 0.8;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    0.8,
                    MusicFontSymbol.OttavaAlta,
                    false
                );
                break;
            case Ottavia._8vb:
                size = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.OttavaBassaVb)! * 0.8;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    0.8,
                    MusicFontSymbol.OttavaBassaVb,
                    false
                );
                break;
            case Ottavia._15mb:
                size =
                    (MusicFontSymbolSizes.Widths.get(MusicFontSymbol.Quindicesima)! +
                        MusicFontSymbolSizes.Widths.get(MusicFontSymbol.OctaveBaselineM)! +
                        MusicFontSymbolSizes.Widths.get(MusicFontSymbol.OctaveBaselineB)!) *
                    0.8;

                // NOTE: SMUFL does not have a glyph for 15mb so we build it
                canvas.fillMusicFontSymbols(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    0.8,
                    [MusicFontSymbol.Quindicesima, MusicFontSymbol.OctaveBaselineM, MusicFontSymbol.OctaveBaselineB],
                    false
                );
                break;
        }
        return size / 2;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        const size: number = this.paintOttava(cx, cy, canvas);
        const lineSpacing: number = 3;
        const startX: number = cx + this.x + size + lineSpacing;
        let lineY: number = cy + this.y;
        lineY += this._aboveStaff ? 2 : this.height - 2;
        const lineSize: number = 8;
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
