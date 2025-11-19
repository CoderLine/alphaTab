import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import type { Duration } from '@coderline/alphatab/model/Duration';
import { TechniqueSymbolPlacement, type InstrumentArticulation } from '@coderline/alphatab/model/InstrumentArticulation';

/**
 * @internal
 */
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
        CanvasHelper.fillMusicFontSymbolSafe(canvas,cx + this.x, cy + this.y + offset, this.glyphScale, this.symbol, false);

        if (
            this._articulation.techniqueSymbol !== MusicFontSymbol.None &&
            this._articulation.techniqueSymbolPlacement === TechniqueSymbolPlacement.Inside
        ) {
            CanvasHelper.fillMusicFontSymbolSafe(canvas,
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
            this.height = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.NoteheadBlack)!;
        }
        if (this.height === 0) {
            this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.NoteheadBlack)!;
        }
    }
}
