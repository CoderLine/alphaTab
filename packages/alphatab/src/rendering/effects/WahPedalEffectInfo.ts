import type { Beat } from '@src/model/Beat';
import { WahPedal } from '@src/model/WahPedal';
import { NotationElement } from '@src/NotationSettings';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { WahPedalGlyph } from '@src/rendering/glyphs/WahPedalGlyph';
import type { Settings } from '@src/Settings';

export class WahPedalEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectWahPedal;
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
        return beat.wahPedal !== WahPedal.None;
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new WahPedalGlyph(beat.wahPedal);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }
}
