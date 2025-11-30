import type { Beat } from '@coderline/alphatab/model/Beat';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { NoteEffectInfoBase } from '@coderline/alphatab/rendering/effects/NoteEffectInfoBase';
import type { Note } from '@coderline/alphatab/model/Note';
import { LeftHandTapGlyph } from '@coderline/alphatab/rendering/glyphs/LeftHandTapGlyph';

/**
 * @internal
 */
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

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new LeftHandTapGlyph();
    }
}
