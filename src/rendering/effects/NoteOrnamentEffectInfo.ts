import type { Beat } from '@src/model/Beat';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { NotationElement } from '@src/NotationSettings';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { NoteOrnamentGlyph } from '@src/rendering/glyphs/NoteOrnamentGlyph';
import type { Settings } from '@src/Settings';

export class NoteOrnamentEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectNoteOrnament;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.notes.some(n => n.ornament !== NoteOrnament.None);
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new NoteOrnamentGlyph(beat.notes.find(n => n.ornament !== NoteOrnament.None)!.ornament);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return false;
    }
}
