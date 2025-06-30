import { Color } from '@src/model/Color';
import { VibratoType } from '@src/model/VibratoType';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';

export class BeatVibratoGlyph extends GroupedEffectGlyph {
    private _type: VibratoType;
    private _stepSize: number = 0;

    public constructor(type: VibratoType) {
        super(BeatXPosition.EndBeat);
        this._type = type;
    }

    public override doLayout(): void {
        super.doLayout();
        switch (this._type) {
            case VibratoType.Slight:
                this._stepSize = this.renderer.smuflMetrics.slightBeatVibratoStepSize;
                break;
            case VibratoType.Wide:
                this._stepSize = this.renderer.smuflMetrics.wideBeatVibratoStepSize;
                break;
        }
        this.height = this.renderer.smuflMetrics.beatVibratoHeight;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        let startX: number = cx + this.x;
        const width: number = endX - startX;
        const loops: number = Math.max(1, width / this._stepSize);
        canvas.beginPath();
        const padding= canvas.lineWidth;
        canvas.moveTo(startX, cy + this.y + padding);
        for (let i: number = 0; i < loops; i++) {
            canvas.lineTo(startX + this._stepSize / 2, cy + this.y + this.height - padding);
            canvas.lineTo(startX + this._stepSize, cy + this.y + padding);
            startX += this._stepSize;
        }
        canvas.stroke();

        const c = canvas.color;
        canvas.color = Color.random();
        canvas.fillRect(cx + this.x, cy + this.y, width, this.height);
        canvas.color = c;
    }
}
