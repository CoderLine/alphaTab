import { ICanvas } from '@src/platform';
import { LeftToRightLayoutingGlyphGroup } from './LeftToRightLayoutingGlyphGroup';
import { ElementStyleHelper } from '../utils/ElementStyleHelper';
import { BarSubElement } from '@src/model';

export class KeySignatureGlyph extends LeftToRightLayoutingGlyphGroup {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationKeySignature, this.renderer.bar);
        super.paint(cx, cy, canvas);
    }
}
