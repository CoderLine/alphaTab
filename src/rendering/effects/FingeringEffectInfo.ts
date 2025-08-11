import type { Beat } from '@src/model/Beat';
import { Fingers } from '@src/model/Fingers';
import type { Note } from '@src/model/Note';
import { FingeringMode, NotationElement } from '@src/NotationSettings';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { Settings } from '@src/Settings';
import { FingeringGroupGlyph } from '@src/rendering/glyphs/FingeringGroupGlyph';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

export class FingeringEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectFingering;
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
        if (
            beat.voice.index !== 0 ||
            beat.isRest ||
            (settings.notation.fingeringMode !== FingeringMode.SingleNoteEffectBand &&
                settings.notation.fingeringMode !== FingeringMode.SingleNoteEffectBandForcePiano)
        ) {
            return false;
        }
        if (beat.notes.length !== 1) {
            return false;
        }
        return beat.notes[0].isFingering;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        let finger: Fingers = Fingers.Unknown;
        let isLeft: boolean = false;
        const note: Note = beat.notes[0];
        if (note.leftHandFinger !== Fingers.Unknown) {
            finger = note.leftHandFinger;
            isLeft = true;
        } else if (note.rightHandFinger !== Fingers.Unknown) {
            finger = note.rightHandFinger;
        }
        const s = FingeringGroupGlyph.fingerToMusicFontSymbol(renderer.settings, beat, finger, isLeft) ?? '';
        const g = new MusicFontGlyph(0, 0, 1, s);
        g.center = true;
        g.renderer = renderer;
        g.doLayout();
        g.offsetY = renderer.smuflMetrics.glyphTop.get(g.symbol)!;
        return g;
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
