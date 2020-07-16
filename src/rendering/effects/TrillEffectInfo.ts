import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
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
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TrillGlyph(0, 0);
    }
}
