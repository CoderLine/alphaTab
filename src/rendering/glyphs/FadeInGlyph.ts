import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export class FadeInGlyph extends EffectGlyph {
    public doLayout(): void {
        super.doLayout();
        this.height = 17 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let size: number = 6 * this.scale;
        let width: number = Math.max(this.width, 14 * this.scale);
        let offset: number = this.height / 2;
        canvas.beginPath();
        canvas.moveTo(cx + this.x, cy + this.y + offset);
        canvas.quadraticCurveTo(
            cx + this.x + width / 2,
            cy + this.y + offset,
            cx + this.x + width,
            cy + this.y + offset - size
        );
        canvas.moveTo(cx + this.x, cy + this.y + offset);
        canvas.quadraticCurveTo(
            cx + this.x + width / 2,
            cy + this.y + offset,
            cx + this.x + width,
            cy + this.y + offset + size
        );
        canvas.stroke();
    }
}
