import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import type { Duration } from '@src/model/Duration';
import type { InstrumentArticulation } from '@src/model/InstrumentArticulation';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';

export class PercussionNoteHeadGlyph extends MusicFontGlyph {
    private _isGrace: boolean;
    private _articulation: InstrumentArticulation;

    public constructor(
        x: number,
        y: number,
        articulation: InstrumentArticulation,
        duration: Duration,
        isGrace: boolean
    ) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, articulation.getSymbol(duration));
        this._isGrace = isGrace;
        this._articulation = articulation;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride!;
        }

        const offset: number = this._isGrace ? 1 : 0;
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y + offset, this.glyphScale, this.symbol, false);

        if (
            this._articulation.techniqueSymbol !== MusicFontSymbol.None &&
            this._articulation.techniqueSymbolPlacement === TextBaseline.Middle
        ) {
            canvas.fillMusicFontSymbol(
                cx + this.x,
                cy + this.y + offset,
                this.glyphScale,
                this._articulation.techniqueSymbol,
                false
            );
        }
        canvas.color = c;
    }

    public override doLayout(): void {
        super.doLayout();
        if (this.width === 0) {
            this.height = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.NoteheadBlack)!;
        }
        if (this.height === 0) {
            this.height = MusicFontSymbolSizes.Heights.get(MusicFontSymbol.NoteheadBlack)!;
        }
    }
}
