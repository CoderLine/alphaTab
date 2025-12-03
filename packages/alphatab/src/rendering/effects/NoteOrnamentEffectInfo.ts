import type { Beat } from '@coderline/alphatab/model/Beat';
import { NoteOrnament } from '@coderline/alphatab/model/NoteOrnament';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { NoteOrnamentGlyph } from '@coderline/alphatab/rendering/glyphs/NoteOrnamentGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class NoteOrnamentEffectInfo extends EffectInfo {
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

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.notes.some(n => n.ornament !== NoteOrnament.None);
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new NoteOrnamentGlyph(beat.notes.find(n => n.ornament !== NoteOrnament.None)!.ornament);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }
}
