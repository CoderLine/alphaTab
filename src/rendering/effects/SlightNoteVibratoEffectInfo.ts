import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { VibratoType } from '@src/model/VibratoType';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { NoteVibratoGlyph } from '@src/rendering/glyphs/NoteVibratoGlyph';
import { NotationElement } from '@src/NotationSettings';

export class SlightNoteVibratoEffectInfo extends NoteEffectInfoBase {
    public get notationElement(): NotationElement {
        return NotationElement.EffectSlightNoteVibrato;
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        return (
            note.vibrato === VibratoType.Slight ||
            (note.isTieDestination && note.tieOrigin!.vibrato === VibratoType.Slight)
        );
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeatToEnd;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new NoteVibratoGlyph(0, 0, VibratoType.Slight, 1.2);
    }

    public constructor() {
        super();
    }
}
