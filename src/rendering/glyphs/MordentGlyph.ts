import { MusicFontSymbol } from '@src/model';
import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { RenderingResources } from '@src/RenderingResources';

export class MordentGlyph extends EffectGlyph {
    public constructor(x: number, y: number) {
        super(x, y);
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = 20 * this.scale;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        canvas.font = res.markerFont;
        canvas.fillMusicFontSymbol(cx, cy,this.scale,MusicFontSymbol.OrnamentMordent);
    }
}
