import { BrushType } from '@src/model/BrushType';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { TabBrushGlyph } from '@src/rendering/glyphs/TabBrushGlyph';

export class TabBeatPreNotesGlyph extends BeatGlyphBase {
    public doLayout(): void {
        if (this.container.beat.brushType !== BrushType.None && !this.container.beat.isRest) {
            this.addGlyph(new TabBrushGlyph(this.container.beat));
            this.addGlyph(new SpacingGlyph(0, 0, 4 * this.scale));
        }
        super.doLayout();
    }

    public constructor() {
        super();
    }
}
