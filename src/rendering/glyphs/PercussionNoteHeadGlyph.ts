import { ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from './NoteHeadGlyph';
import { Duration } from '@src/model/Duration';
import { InstrumentArticulation } from '@src/model/InstrumentArticulation';

export class PercussionNoteHeadGlyph extends MusicFontGlyph {
    private _isGrace: boolean;
    private _articulation: InstrumentArticulation;

    public constructor(x: number, y: number, articulation: InstrumentArticulation, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, articulation.getSymbol(duration));
        this._isGrace = isGrace;
        this._articulation = articulation;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let offset: number = this._isGrace ? this.scale : 0;
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, this.glyphScale * this.scale, this.symbol, false);

        if (this._articulation.techniqueSymbol !== MusicFontSymbol.None && this._articulation.techniqueSymbolPlacement === TextBaseline.Middle) {
            canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, this.glyphScale * this.scale, this._articulation.techniqueSymbol, false);
        }
    }

    public doLayout(): void {
        let scale: number = (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
        switch (this.symbol) {
            case MusicFontSymbol.NoteheadWhole:
                this.width = 14;
                break;
            case MusicFontSymbol.NoteheadCircleX:
            case MusicFontSymbol.NoteheadDiamondWhite:
                this.width = 9;
                break;
            case MusicFontSymbol.NoteheadHeavyXHat:
            case MusicFontSymbol.NoteheadHeavyX:
                this.width = 13;
                break;
            default:
                this.width = 10;
                break;
        }

        this.width = this.width * (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
        this.height = NoteHeadGlyph.NoteHeadHeight * scale;
    }
}
