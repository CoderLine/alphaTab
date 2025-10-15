import { NotationElement } from '@src/NotationSettings';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import type { Settings } from '@src/Settings';
import type { Beat } from '@src/model/Beat';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { BeatTimerGlyph } from '@src/rendering/glyphs/BeatTimerGlyph';

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
