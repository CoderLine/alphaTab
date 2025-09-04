import type { ICanvas } from '@src/platform/ICanvas';
import { LeftToRightLayoutingGlyphGroup } from '@src/rendering/glyphs/LeftToRightLayoutingGlyphGroup';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@src/model/Bar';

export class KeySignatureGlyph extends LeftToRightLayoutingGlyphGroup {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationKeySignature, this.renderer.bar);
        super.paint(cx, cy, canvas);
    }
}
