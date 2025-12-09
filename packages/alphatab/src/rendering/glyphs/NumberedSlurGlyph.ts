import { TabSlurGlyph } from '@coderline/alphatab/rendering/glyphs/TabSlurGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class NumberedSlurGlyph extends TabSlurGlyph {
    protected override calculateTieDirection(): BeamDirection {
        return BeamDirection.Up;
    }
}
