import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { EffectGlyph } from './EffectGlyph';

export class GuitarGolpeGlyph extends EffectGlyph {
    private _center: boolean;
    public constructor(x: number, y: number, center: boolean = false) {
        super(x, y);
        this._center = center;
    }

    public override doLayout(): void {
        this.width = 9 * this.scale;
        this.height = 10 * this.scale;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillMusicFontSymbol(
            cx + this.x,
            cy + this.y + this.height,
            NoteHeadGlyph.GraceScale * this.scale,
            MusicFontSymbol.GuitarGolpe,
            this._center
        );
    }
}
