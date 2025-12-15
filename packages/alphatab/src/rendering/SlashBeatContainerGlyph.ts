import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { FlagGlyph } from '@coderline/alphatab/rendering/glyphs/FlagGlyph';
import { SlashBeatGlyph } from '@coderline/alphatab/rendering/glyphs/SlashBeatGlyph';
import { SlashTieGlyph } from '@coderline/alphatab/rendering/glyphs/SlashTieGlyph';
import type { SlashBarRenderer } from '@coderline/alphatab/rendering/SlashBarRenderer';

/**
 * @internal
 */
export class SlashBeatContainerGlyph extends BeatContainerGlyph {
    private _tiedNoteTie: SlashTieGlyph | null = null;

    public constructor(beat:Beat){
        super(beat);
        this.preNotes = new BeatGlyphBase();
        this.onNotes = new SlashBeatGlyph();
    }

    public override doLayout(): void {
        // make space for flag
        const sr = this.renderer as SlashBarRenderer;
        const beat = this.beat;
        const isGrace = beat.graceType !== GraceType.None;
        if (sr.hasFlag(beat)) {
            const direction = this.renderer.getBeatDirection(beat);
            const scale = isGrace ? EngravingSettings.GraceScale : 1;
            const symbol = FlagGlyph.getSymbol(beat.duration, direction, isGrace);
            const flagWidth = this.renderer.smuflMetrics.glyphWidths.get(symbol)! * scale;
            this._flagStretch = flagWidth;
        } else if (isGrace) {
            // always use flag size as spacing on grace notes
            const graceSpacing =
                this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.Flag8thUp)! * EngravingSettings.GraceScale;
            this._flagStretch = graceSpacing;
        }

        super.doLayout();
    }

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

    private _flagStretch = 0;

    protected override get postBeatStretch(): number {
        return super.postBeatStretch + this._flagStretch;
    }

    protected override updateWidth(): void {
        super.updateWidth();
        this.width += this._flagStretch;
        this.minWidth += this._flagStretch;
    }
}
