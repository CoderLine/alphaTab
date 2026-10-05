import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { SpacingGlyph } from '@coderline/alphatab/rendering/glyphs/SpacingGlyph';

/**
 * @internal
 */
export class SlashBeatPreNotesGlyph extends BeatGlyphBase {
    /**
     * The spacing (in stave-spaces) before each slash beat.
     */
    private static readonly _beatSpacing: number = 0.6;

    public override doLayout(): void {
        this.addNormal(
            new SpacingGlyph(0, 0, SlashBeatPreNotesGlyph._beatSpacing * this.renderer.smuflMetrics.oneStaffSpace)
        );
        super.doLayout();
    }
}
