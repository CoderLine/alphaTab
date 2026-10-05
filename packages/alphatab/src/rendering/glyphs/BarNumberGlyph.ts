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
    }

    public override doLayout(): void {
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.elementFonts.get(NotationElement.BarNumber)!;
        const size = this.renderer.scoreRenderer.canvas!.measureText(this._barNumberText);
        this.width = size.width;
        this.height = size.height;
        // Center the number over the start barline (Behind Bars) rather than
        // left-aligning to it, so it reads as belonging to the barline. The x-range this
        // produces also feeds collision placement, so half the glyph sits left of the bar.
        this.x = -this.width / 2;
    }

    public override populateSkyline(): void {
        this.renderer.insertSkylineFromBbox(this);
    }

    /**
     * The glyph is created for every bar which may carry a bar number, but whether it is displayed
     * depends on the position of the bar in the layout (e.g. first bar of the system).
     * Hidden bar numbers report no extent (NaN bounds) so they do not take part in the placement.
     */
    private get _isVisible(): boolean {
        return (this.renderer as LineBarRenderer).isBarNumberVisible;
    }

    public override getBoundingBoxLeft(): number {
        return this._isVisible ? super.getBoundingBoxLeft() : Number.NaN;
    }

    public override getBoundingBoxRight(): number {
        return this._isVisible ? super.getBoundingBoxRight() : Number.NaN;
    }

    public override getBoundingBoxTop(): number {
        return this._isVisible ? super.getBoundingBoxTop() : Number.NaN;
    }

    public override getBoundingBoxBottom(): number {
        return this._isVisible ? super.getBoundingBoxBottom() : Number.NaN;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this._isVisible) {
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
