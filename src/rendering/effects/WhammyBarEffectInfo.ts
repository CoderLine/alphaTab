import type { Beat } from '@src/model/Beat';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { LineRangedGlyph } from '@src/rendering/glyphs/LineRangedGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

export class WhammyBarEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectWhammyBar;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.GroupedOnBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return beat.hasWhammyBar;
    }

    public createNewGlyph(_renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new LineRangedGlyph('w/bar');
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
