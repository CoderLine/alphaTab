import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { NoteVibratoGlyph } from '@coderline/alphatab/rendering/glyphs/NoteVibratoGlyph';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class SlightNoteVibratoEffectInfo extends NoteEffectInfoBase {
    // for tied bends ending in a vibrato, the vibrato is drawn by the TabBendGlyph for proper alignment
    private _hideOnTiedBend: boolean;

    public get notationElement(): NotationElement {
        return NotationElement.EffectSlightNoteVibrato;
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        let hasVibrato =
            note.vibrato === VibratoType.Slight ||
            (note.isTieDestination && note.tieOrigin!.vibrato === VibratoType.Slight);

        if (this._hideOnTiedBend && hasVibrato && note.isTieDestination && note.tieOrigin!.hasBend) {
            hasVibrato = false;
        }
        return hasVibrato;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeatToEnd;
    }

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new NoteVibratoGlyph(0, 0, VibratoType.Slight);
    }

    public constructor(hideOnTiedBend: boolean) {
        super();
        this._hideOnTiedBend = hideOnTiedBend;
    }
}
