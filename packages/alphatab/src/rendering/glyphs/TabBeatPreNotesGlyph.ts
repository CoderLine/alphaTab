import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';
import { TabBrushGlyph } from '@coderline/alphatab/rendering/glyphs/TabBrushGlyph';

/**
 * @internal
 */
export class TabBeatPreNotesGlyph extends BeatGlyphBase {
    public override doLayout(): void {
        if (this.container.beat.brushType !== BrushType.None && !this.container.beat.isRest) {
            this.addEffect(new TabBrushGlyph(this.container.beat));
            this.addNormal(new SpacingGlyph(0, 0, this.renderer.smuflMetrics.preNoteEffectPadding));
        }
        super.doLayout();
    }

    protected override get effectElement() {
        return BeatSubElement.GuitarTabEffects;
    }
}
