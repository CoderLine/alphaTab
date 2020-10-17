import { Ottavia } from '@src/model/Ottavia';
import { ICanvas } from '@src/platform/ICanvas';
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

    public doLayout(): void {
        super.doLayout();
        this.height = 13 * this.scale;
    }

    protected paintNonGrouped(cx: number, cy: number, canvas: ICanvas): void {
        this.paintOttava(cx, cy, canvas);
    }

    private paintOttava(cx: number, cy: number, canvas: ICanvas): number {
        let size: number = 0;
        switch (this._ottava) {
            case Ottavia._15ma:
                size = 37 * this.scale;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    0.8,
                    MusicFontSymbol.QuindicesimaAlta,
                    false
                );
                break;
            case Ottavia._8va:
                size = 26 * this.scale;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    0.8,
                    MusicFontSymbol.OttavaAlta,
                    false
                );
                break;
            case Ottavia._8vb:
                size = 23 * this.scale;
                canvas.fillMusicFontSymbol(
                    cx + this.x - size / 2,
                    cy + this.y + this.height,
                    0.8,
                    MusicFontSymbol.OttavaBassaVb,
                    false
                );
                break;
            case Ottavia._15mb:
                size = 36 * this.scale;
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
        let size: number = this.paintOttava(cx, cy, canvas);
        let lineSpacing: number = 3 * this.scale;
        let startX: number = cx + this.x + size + lineSpacing;
        let lineY: number = cy + this.y;
        lineY += this._aboveStaff ? 2 * this.scale : this.height - 2 * this.scale;
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
