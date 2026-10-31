import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { TabBrushGlyph } from '@coderline/alphatab/rendering/glyphs/TabBrushGlyph';

/**
 * @internal
 */
export class TabBeatPreNotesGlyph extends BeatGlyphBase {
    public override doLayout(): void {
        this.beginPlacement();
        if (this.container.beat.index === 0) {
            this.placeSpacing(1 * this.renderer.smuflMetrics.oneStaffSpace);
        }

        if (this.container.beat.brushType !== BrushType.None && !this.container.beat.isRest) {
            this.placeEffect(new TabBrushGlyph(this.container.beat));
            this.placeSpacing(this.renderer.smuflMetrics.preNoteEffectPadding);
        }
    }

    protected override get effectElement() {
        return BeatSubElement.GuitarTabEffects;
    }
}
