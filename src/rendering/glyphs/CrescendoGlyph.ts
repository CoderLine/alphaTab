import { CrescendoType } from '@src/model/CrescendoType';
import { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class CrescendoGlyph extends GroupedEffectGlyph {
    private static readonly Padding: number = (NoteHeadGlyph.QuarterNoteHeadWidth / 2) | 0;
    private _crescendo: CrescendoType;

    public constructor(x: number, y: number, crescendo: CrescendoType) {
        super(BeatXPosition.EndBeat);
        this._crescendo = CrescendoType.None;
        this._crescendo = crescendo;
        this.x = x;
        this.y = y;
    }

    public doLayout(): void {
        super.doLayout();
        this.height = 17 * this.scale;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        let startX: number = cx + this.x;
        let height: number = this.height * this.scale;
        canvas.beginPath();
        if (this._crescendo === CrescendoType.Crescendo) {
            endX -= CrescendoGlyph.Padding * this.scale;
            canvas.moveTo(endX, cy + this.y);
            canvas.lineTo(startX, cy + this.y + height / 2);
            canvas.lineTo(endX, cy + this.y + height);
        } else {
            endX -= CrescendoGlyph.Padding * this.scale;
            canvas.moveTo(startX, cy + this.y);
            canvas.lineTo(endX, cy + this.y + height / 2);
            canvas.lineTo(startX, cy + this.y + height);
        }
        canvas.stroke();
    }
}
