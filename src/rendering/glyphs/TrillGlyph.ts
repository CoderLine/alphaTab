import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { RenderingResources } from '@src/RenderingResources';

export class TrillGlyph extends EffectGlyph {
    public constructor(x: number, y: number) {
        super(x, y);
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = this.renderer.resources.markerFont.size * this.scale;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        canvas.font = res.markerFont;
        let textw: number = canvas.measureText('tr');
        canvas.fillText('tr', cx + this.x, cy + this.y);
        let startX: number = textw + 3 * this.scale;
        let endX: number = this.width - startX;
        let waveScale: number = 1.2;
        let step: number = 11 * this.scale * waveScale;
        let loops: number = Math.max(1, (endX - startX) / step);
        let loopX: number = startX;
        let loopY: number = cy + this.y + this.height * 1.2;
        for (let i: number = 0; i < loops; i++) {
            canvas.fillMusicFontSymbol(
                cx + this.x + loopX,
                loopY,
                waveScale,
                MusicFontSymbol.WiggleTrill,
                false
            );
            loopX += step;
        }
    }
}
