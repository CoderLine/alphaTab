import type { Beat } from '@src/model/Beat';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { NotationElement } from '@src/NotationSettings';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import type { Note } from '@src/model/Note';
import { LeftHandTapGlyph } from '@src/rendering/glyphs/LeftHandTapGlyph';

export class LeftHandTapEffectInfo extends NoteEffectInfoBase {
    public get notationElement(): NotationElement {
        return NotationElement.EffectTap;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        return note.isLeftHandTapped;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new LeftHandTapGlyph();
    }
}
