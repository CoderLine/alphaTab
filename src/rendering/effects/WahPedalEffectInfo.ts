import type { Beat } from '@src/model';
import { NotationElement } from '@src/NotationSettings';
import type { BarRendererBase } from '../BarRendererBase';
import { EffectBarGlyphSizing } from '../EffectBarGlyphSizing';
import { EffectBarRendererInfo } from '../EffectBarRendererInfo';
import type { EffectGlyph } from '../glyphs/EffectGlyph';
import { WahPedal } from '@src/model/WahPedal';
import type { Settings } from '@src/Settings';
import { WahPedalGlyph } from '../glyphs/WahPedalGlyph';

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

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.wahPedal !== WahPedal.None;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new WahPedalGlyph(beat.wahPedal);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return false;
    }
}
