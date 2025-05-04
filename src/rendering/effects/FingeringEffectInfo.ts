import type { Beat } from '@src/model/Beat';
import { Fingers } from '@src/model/Fingers';
import type { Note } from '@src/model/Note';
import { FingeringMode, NotationElement } from '@src/NotationSettings';
import { TextAlign } from '@src/platform/ICanvas';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { Settings } from '@src/Settings';
import { ModelUtils } from '@src/model/ModelUtils';

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
        const s: string = ModelUtils.fingerToString(renderer.settings, beat, finger, isLeft) ?? '';
        return new TextGlyph(0, 0, s, renderer.resources.fingeringFont, TextAlign.Left);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
