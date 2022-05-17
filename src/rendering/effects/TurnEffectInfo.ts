import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TurnGlyph } from '@src/rendering/glyphs/TurnGlyph';
import { NotationElement } from '@src/NotationSettings';

export class TurnEffectInfo extends NoteEffectInfoBase {
    public get notationElement(): NotationElement {
        return NotationElement.EffectTurn;
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        return note.isTurn;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TurnGlyph(0, 0);
    }
}
