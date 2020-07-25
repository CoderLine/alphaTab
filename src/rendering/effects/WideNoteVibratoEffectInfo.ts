import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { VibratoType } from '@src/model/VibratoType';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { NoteVibratoGlyph } from '@src/rendering/glyphs/NoteVibratoGlyph';
import { NotationElement } from '@src/NotationSettings';

export class WideNoteVibratoEffectInfo extends NoteEffectInfoBase {
    public get notationElement(): NotationElement {
        return NotationElement.EffectWideNoteVibrato;
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        return (
            note.vibrato === VibratoType.Wide || (note.isTieDestination && note.tieOrigin!.vibrato === VibratoType.Wide)
        );
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeatToEnd;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new NoteVibratoGlyph(0, 0, VibratoType.Wide, 1.2);
    }
}
