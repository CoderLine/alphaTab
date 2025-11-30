import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { RowContainerGlyph } from '@coderline/alphatab/rendering/glyphs/RowContainerGlyph';

/**
 * @internal
 */
export class TuningContainerGlyph extends RowContainerGlyph {
    public constructor(x: number, y: number) {
        super(x, y, TextAlign.Left);
    }
}
