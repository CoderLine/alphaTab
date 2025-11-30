import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { LeftToRightLayoutingGlyphGroup } from '@coderline/alphatab/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@coderline/alphatab/model/Bar';

/**
 * @internal
 */
export class KeySignatureGlyph extends LeftToRightLayoutingGlyphGroup {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationKeySignature, this.renderer.bar);
        super.paint(cx, cy, canvas);
    }
}
