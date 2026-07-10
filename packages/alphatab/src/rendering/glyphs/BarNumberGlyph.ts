import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { type ICanvas, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class BarNumberGlyph extends EffectGlyph {
    private _barNumberText: string;

    public constructor(x: number, y: number, barNumberText: string) {
        super(x, y);
        this._barNumberText = barNumberText;
        // TEMP: for visual regression parity
        this._barNumberText += '  ';
    }

    public override doLayout(): void {
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.elementFonts.get(NotationElement.BarNumber)!;
        const size = this.renderer.scoreRenderer.canvas!.measureText(this._barNumberText);
        this.width = size.width;
        this.height = size.height;
        this.y -= this.height;
    }

    public override populateSkyline(): void {
        this.renderer.insertSkylineFromBbox(this);
    }

    /** Collapse bbox on non-first staves so the per-x skyline doesn't see a phantom obstacle. */
    public override getBoundingBoxLeft(): number {
        if (!this.renderer.staff!.isFirstInSystem) {
            return this.x;
        }
        return super.getBoundingBoxLeft();
    }

    public override getBoundingBoxRight(): number {
        if (!this.renderer.staff!.isFirstInSystem) {
            return this.x;
        }
        return super.getBoundingBoxRight();
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this.renderer.staff!.isFirstInSystem) {
            return;
        }

        using _ = ElementStyleHelper.bar(
            canvas,
            (this.renderer as LineBarRenderer).barNumberBarSubElement,
            this.renderer.bar,
            true
        );

        const res: RenderingResources = this.renderer.resources;
        const baseline = canvas.textBaseline;
        canvas.font = res.elementFonts.get(NotationElement.BarNumber)!;
        canvas.textBaseline = TextBaseline.Top;
        canvas.fillText(this._barNumberText, cx + this.x, cy + this.y);
        canvas.textBaseline = baseline;
    }
}
