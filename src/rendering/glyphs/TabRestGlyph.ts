import { BeatSubElement } from '@src/model/Beat';
import type { Duration } from '@src/model/Duration';
import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { ScoreRestGlyph } from '@src/rendering/glyphs/ScoreRestGlyph';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class TabRestGlyph extends MusicFontGlyph {
    private _isVisibleRest: boolean;
    public beamingHelper!: BeamingHelper;

    public constructor(x: number, y: number, isVisibleRest: boolean, duration: Duration) {
        super(x, y, 1, ScoreRestGlyph.getSymbol(duration));
        this._isVisibleRest = isVisibleRest;
    }

    public override doLayout(): void {
        super.doLayout();
        if (!this._isVisibleRest) {
            this.width = 10;
        }
    }

    public updateBeamingHelper(cx: number): void {
        if (this.beamingHelper && this.beamingHelper.isPositionFrom('tab', this.beat!)) {
            this.beamingHelper.registerBeatLineX(
                'tab',
                this.beat!,
                cx + this.x + this.width / 2,
                cx + this.x + this.width / 2
            );
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this._isVisibleRest) {
            using _ = ElementStyleHelper.beat(canvas, BeatSubElement.GuitarTabRests, this.beat!);
            super.paint(cx, cy, canvas);
        }
    }
}
