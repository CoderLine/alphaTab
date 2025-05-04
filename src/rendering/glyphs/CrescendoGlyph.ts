import { CrescendoType } from '@src/model/CrescendoType';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class CrescendoGlyph extends GroupedEffectGlyph {
    private _crescendo: CrescendoType;

    public constructor(x: number, y: number, crescendo: CrescendoType) {
        super(BeatXPosition.EndBeat);
        this._crescendo = CrescendoType.None;
        this._crescendo = crescendo;
        this.x = x;
        this.y = y;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = 17;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        const startX: number = cx + this.x;
        const height: number = this.height;
        const padding = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.NoteheadBlack)! / 2;
        canvas.beginPath();
        if (this._crescendo === CrescendoType.Crescendo) {
            endX -= padding;
            canvas.moveTo(endX, cy + this.y);
            canvas.lineTo(startX, cy + this.y + height / 2);
            canvas.lineTo(endX, cy + this.y + height);
        } else {
            endX -= padding;
            canvas.moveTo(startX, cy + this.y);
            canvas.lineTo(endX, cy + this.y + height / 2);
            canvas.lineTo(startX, cy + this.y + height);
        }
        canvas.stroke();
    }
}
