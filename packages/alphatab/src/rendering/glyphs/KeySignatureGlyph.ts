import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@coderline/alphatab/model/Bar';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';

/**
 * @internal
 */
export class KeySignatureGlyph extends LeftToRightLayoutingGlyphGroup {
    /**
     * The bar header column of key signatures.
     */
    public static readonly HeaderRank: number = 300;

    public override registerHeaderRod(info: BarLayoutingInfo): void {
        if (this.isEmpty) {
            return;
        }
        // left aligned (Behind Bars: key signatures start at the same position across staves)
        info.addHeaderRod(
            KeySignatureGlyph.HeaderRank,
            0,
            this.width + this.renderer.smuflMetrics.preBeatGlyphSpacing
        );
    }

    public override applyHeaderRod(info: BarLayoutingInfo): void {
        if (this.isEmpty) {
            return;
        }
        this.x = info.getHeaderRodX(KeySignatureGlyph.HeaderRank, 0);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationKeySignature, this.renderer.bar);
        super.paint(cx, cy, canvas);
    }
}
