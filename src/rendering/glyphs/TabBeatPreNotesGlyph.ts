import { BeatSubElement } from '@src/model/Beat';
import { BrushType } from '@src/model/BrushType';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { TabBrushGlyph } from '@src/rendering/glyphs/TabBrushGlyph';

export class TabBeatPreNotesGlyph extends BeatGlyphBase {
    public override doLayout(): void {
        if (this.container.beat.brushType !== BrushType.None && !this.container.beat.isRest) {
            this.addEffect(new TabBrushGlyph(this.container.beat));
            this.addNormal(new SpacingGlyph(0, 0, 4));
        }
        super.doLayout();
    }

    protected override get effectElement() {
        return BeatSubElement.GuitarTabEffects;
    }
}
