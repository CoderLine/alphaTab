import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TrillGlyph } from '@coderline/alphatab/rendering/glyphs/TrillGlyph';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
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

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new TrillGlyph(0, 0);
    }
}
