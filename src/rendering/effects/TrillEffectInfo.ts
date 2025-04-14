import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TrillGlyph } from '@src/rendering/glyphs/TrillGlyph';
import { NotationElement } from '@src/NotationSettings';

export class TrillEffectInfo extends NoteEffectInfoBase {
    public get notationElement(): NotationElement {
        return NotationElement.EffectTrill;
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        return note.isTrill;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeatToEnd;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TrillGlyph(0, 0);
    }
}
