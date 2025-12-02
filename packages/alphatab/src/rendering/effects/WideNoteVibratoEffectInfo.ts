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

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new NoteVibratoGlyph(0, 0, VibratoType.Wide);
    }
}
