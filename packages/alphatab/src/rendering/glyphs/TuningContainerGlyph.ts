import { TextAlign } from '@src/platform/ICanvas';
import { RowContainerGlyph } from '@src/rendering/glyphs/RowContainerGlyph';

/**
 * @internal
 */
export class TuningContainerGlyph extends RowContainerGlyph {
    public constructor(x: number, y: number) {
        super(x, y, TextAlign.Left);
    }
}
