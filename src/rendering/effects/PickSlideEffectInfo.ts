import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { SlideOutType } from '@src/model/SlideOutType';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { NoteEffectInfoBase } from '@src/rendering/effects/NoteEffectInfoBase';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@src/rendering/glyphs/LineRangedGlyph';
import { NotationElement } from '@src/NotationSettings';

export class PickSlideEffectInfo extends NoteEffectInfoBase {
    public get notationElement(): NotationElement {
        return NotationElement.EffectPickSlide;
    }

    protected shouldCreateGlyphForNote(note: Note): boolean {
        return note.slideOutType === SlideOutType.PickSlideDown || note.slideOutType === SlideOutType.PickSlideUp;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeat;
    }

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new LineRangedGlyph('P.S.');
    }
}
