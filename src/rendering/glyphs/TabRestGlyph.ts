import { Duration } from '@src/model/Duration';
import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { ScoreRestGlyph } from '@src/rendering/glyphs/ScoreRestGlyph';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';

export class TabRestGlyph extends MusicFontGlyph {
    private _isVisibleRest: boolean;
    private _duration: Duration;
    public beamingHelper!: BeamingHelper;

    public constructor(x: number, y: number, isVisibleRest: boolean, duration: Duration) {
        super(x, y, 1, ScoreRestGlyph.getSymbol(duration));
        this._isVisibleRest = isVisibleRest;
        this._duration = duration;
    }

    public doLayout(): void {
        if (this._isVisibleRest) {
            this.width = ScoreRestGlyph.getSize(this._duration) * this.scale;
        } else {
            this.width = 10 * this.scale;
        }
    }

    public updateBeamingHelper(cx: number): void {
        if (this.beamingHelper && this.beamingHelper.isPositionFrom('tab', this.beat)) {
            this.beamingHelper.registerBeatLineX('tab',
                this.beat,
                cx + this.x + this.width / 2,
                cx + this.x + this.width / 2
            );
        }
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this._isVisibleRest) {
            super.paint(cx, cy, canvas);
        }
    }
}
