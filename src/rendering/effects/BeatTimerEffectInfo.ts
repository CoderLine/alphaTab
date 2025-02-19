import { NotationElement } from '@src/NotationSettings';
import { EffectBarRendererInfo } from '../EffectBarRendererInfo';
import { EffectBarGlyphSizing } from '../EffectBarGlyphSizing';
import { Settings } from '@src/Settings';
import { Beat } from '@src/model';
import { BarRendererBase } from '../BarRendererBase';
import { EffectGlyph } from '../glyphs/EffectGlyph';
import { BeatTimerGlyph } from '../glyphs/BeatTimerGlyph';

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

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.showTimer;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new BeatTimerGlyph(beat.timer ?? 0);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
