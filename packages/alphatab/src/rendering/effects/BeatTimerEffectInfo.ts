import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { Settings } from '@coderline/alphatab/Settings';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { BeatTimerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatTimerGlyph';

/**
 * @internal
 */
export class BeatTimerEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectBeatTimer;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.showTimer;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new BeatTimerGlyph(beat.timer ?? 0);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
