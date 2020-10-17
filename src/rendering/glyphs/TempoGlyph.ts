import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { RenderingResources } from '@src/RenderingResources';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class TempoGlyph extends EffectGlyph {
    private _tempo: number = 0;

    public constructor(x: number, y: number, tempo: number) {
        super(x, y);
        this._tempo = tempo;
    }

    public doLayout(): void {
        super.doLayout();
        this.height = 25 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        canvas.font = res.markerFont;
        canvas.fillMusicFontSymbol(
            cx + this.x,
            cy + this.y + this.height * 0.8,
            this.scale * NoteHeadGlyph.GraceScale,
            MusicFontSymbol.NoteQuarterUp,
            false
        );
        canvas.fillText('= ' + this._tempo, cx + this.x + this.height / 2, cy + this.y + canvas.font.size / 2);
    }
}
