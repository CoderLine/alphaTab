import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@coderline/alphatab/model/Bar';
import type { IHeaderRodSink } from '@coderline/alphatab/rendering/staves/HeaderProfile';

/**
 * @internal
 */
export class KeySignatureGlyph extends LeftToRightLayoutingGlyphGroup {
    /**
     * The bar header column of key signatures.
     */
    public static readonly HeaderRank: number = 300;

    public override registerHeaderRod(info: IHeaderRodSink): void {
        if (this.isEmpty) {
            return;
        }
        // left aligned (Behind Bars: key signatures start at the same position across staves)
        const spacing = this.renderer.smuflMetrics.preBeatGlyphSpacing;
        info.addHeaderRod(KeySignatureGlyph.HeaderRank, 0, this.width + spacing, spacing);
    }

    public override applyHeaderRod(info: IHeaderRodSink): void {
        if (this.isEmpty) {
            return;
        }
        this.x = info.getHeaderRodX(KeySignatureGlyph.HeaderRank, 0);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const previousColor = ElementStyleHelper.applyBar(
            canvas,
            BarSubElement.StandardNotationKeySignature,
            this.renderer.bar
        );
        try {
            super.paint(cx, cy, canvas);
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }
}
