import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { VibratoType } from '@src/model/VibratoType';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { NoteVibratoGlyph } from '@src/rendering/glyphs/NoteVibratoGlyph';
import { NotationElement } from '@src/NotationSettings';

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

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new NoteVibratoGlyph(0, 0, VibratoType.Slight, 1.2);
    }

    public constructor(hideOnTiedBend: boolean) {
        super();
        this._hideOnTiedBend = hideOnTiedBend;
    }
}
