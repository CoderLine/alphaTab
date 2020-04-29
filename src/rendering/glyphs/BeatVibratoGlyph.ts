import { VibratoType } from '@src/model/VibratoType';
import { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';

export class BeatVibratoGlyph extends GroupedEffectGlyph {
    private _type: VibratoType;
    private _stepSize: number = 0;

    public constructor(type: VibratoType) {
        super(BeatXPosition.EndBeat);
        this._type = type;
    }

    public doLayout(): void {
        super.doLayout();
        switch (this._type) {
            case VibratoType.Slight:
                this._stepSize = 12 * this.scale;
                break;
            case VibratoType.Wide:
                this._stepSize = 23 * this.scale;
                break;
        }
        this.height = 18 * this.scale;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        let startX: number = cx + this.x;
        let width: number = endX - startX;
        let loops: number = Math.max(1, width / this._stepSize);
        canvas.beginPath();
        canvas.moveTo(startX, cy + this.y);
        for (let i: number = 0; i < loops; i++) {
            canvas.lineTo(startX + this._stepSize / 2, cy + this.y + this.height);
            canvas.lineTo(startX + this._stepSize, cy + this.y);
            startX += this._stepSize;
        }
        canvas.stroke();
    }
}
