import { GraceType } from '@coderline/alphatab/model/GraceType';
import type { Note } from '@coderline/alphatab/model/Note';
import { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { FlagGlyph } from '@coderline/alphatab/rendering/glyphs/FlagGlyph';
import { SlashTieGlyph } from '@coderline/alphatab/rendering/glyphs/SlashTieGlyph';
import type { SlashBarRenderer } from '@coderline/alphatab/rendering/SlashBarRenderer';

/**
 * @internal
 */
export class SlashBeatContainerGlyph extends BeatContainerGlyph {
    private _tiedNoteTie: SlashTieGlyph | null = null;

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }
        if (!this._tiedNoteTie && n.isTieOrigin && n.tieDestination!.isVisible) {
            const tie: SlashTieGlyph = new SlashTieGlyph('slash.tie', n, n.tieDestination!, false);
            this._tiedNoteTie = tie;
            this.addTie(tie);
        }
        if (!this._tiedNoteTie && n.isTieDestination) {
            const tie: SlashTieGlyph = new SlashTieGlyph('slash.tie', n.tieOrigin!, n, true);
            this._tiedNoteTie = tie;
            this.addTie(tie);
        }
    }

    protected override updateWidth(): void {
        super.updateWidth();
        // make space for flag
        const sr = this.renderer as SlashBarRenderer;
        const beat = this.beat;
        if (sr.hasFlag(beat)) {
            const direction = this.renderer.getBeatDirection(beat);
            const symbol = FlagGlyph.getSymbol(beat.duration, direction, beat.graceType !== GraceType.None);
            const flagWidth = this.renderer.smuflMetrics.glyphWidths.get(symbol)!;
            this.width += flagWidth;
            this.minWidth += flagWidth;
        }
    }
}
