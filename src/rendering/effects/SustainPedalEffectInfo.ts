import { NotationElement } from '@src/NotationSettings';
import { EffectBarGlyphSizing } from '../EffectBarGlyphSizing';
import type { Settings } from '@src/Settings';
import type { Beat } from '@src/model';
import type { BarRendererBase } from '../BarRendererBase';
import type { EffectGlyph } from '../glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '../EffectBarRendererInfo';
import { SustainPedalGlyph } from '../glyphs/SustainPedalGlyph';

export class SustainPedalEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectSustainPedal;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.FullBar;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.voice.index === 0 && beat.index === 0 && beat.voice.bar.sustainPedals.length > 0;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new SustainPedalGlyph();
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
