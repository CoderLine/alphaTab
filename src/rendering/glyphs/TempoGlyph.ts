import { ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';
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
        this.height = 27 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        canvas.font = res.markerFont;
        const noteHeadHeight = this.scale * NoteHeadGlyph.GraceScale * NoteHeadGlyph.NoteHeadHeight;
        const padding = 1 * this.scale;
        canvas.fillMusicFontSymbol(
            cx + this.x,
            cy + this.y + this.height - noteHeadHeight / 2 - padding,
            this.scale * NoteHeadGlyph.GraceScale,
            MusicFontSymbol.NoteQuarterUp,
            false
        );
        const baseline = canvas.textBaseline;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.fillText('= ' + this._tempo, cx + this.x + this.height / 2, cy + this.y + this.height / 2 - padding);
        canvas.textBaseline = baseline;
    }
}
