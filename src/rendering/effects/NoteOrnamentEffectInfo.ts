import { Beat } from '@src/model';
import { NotationElement } from '@src/NotationSettings';
import { BarRendererBase } from '../BarRendererBase';
import { EffectBarGlyphSizing } from '../EffectBarGlyphSizing';
import { EffectBarRendererInfo } from '../EffectBarRendererInfo';
import { EffectGlyph } from '../glyphs/EffectGlyph';
import { Settings } from '@src/Settings';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { NoteOrnamentGlyph } from '../glyphs/NoteOrnamentGlyph';

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
        return new NoteOrnamentGlyph(beat.notes.find(n=>n.ornament != NoteOrnament.None)!.ornament);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return false;
    }
}
