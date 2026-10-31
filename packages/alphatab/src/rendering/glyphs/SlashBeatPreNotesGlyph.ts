import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';

/**
 * @internal
 */
export class SlashBeatPreNotesGlyph extends BeatGlyphBase {
    /**
     * The spacing (in stave-spaces) before each slash beat.
     */
    private static readonly _beatSpacing: number = 0.6;

    public override doLayout(): void {
        this.beginPlacement();
        this.placeSpacing(SlashBeatPreNotesGlyph._beatSpacing * this.renderer.smuflMetrics.oneStaffSpace);
    }
}
