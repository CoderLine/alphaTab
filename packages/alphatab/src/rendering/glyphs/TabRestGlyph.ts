import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { Duration } from '@coderline/alphatab/model/Duration';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { ScoreRestGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreRestGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class TabRestGlyph extends MusicFontGlyph {
    private _isVisibleRest: boolean;

    public constructor(x: number, y: number, isVisibleRest: boolean, duration: Duration) {
        super(x, y, 1, ScoreRestGlyph.getSymbol(duration));
        this._isVisibleRest = isVisibleRest;
    }

    public override doLayout(): void {
        super.doLayout();
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this._isVisibleRest) {
            using _ = ElementStyleHelper.beat(canvas, BeatSubElement.GuitarTabRests, this.beat!);
            super.paint(cx, cy, canvas);
        }
    }
}
