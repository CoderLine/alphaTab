import type { Beat } from '@coderline/alphatab/model/Beat';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { NotationElement, NotationMode } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TabWhammyBarGlyph } from '@coderline/alphatab/rendering/glyphs/TabWhammyBarGlyph';
import type { Settings } from '@coderline/alphatab/Settings';

/**
 * @internal
 */
export class SimpleDipWhammyBarEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectWhammyBar;
    }

    public override get effectId(): string {
        return `${super.effectId}.simpledip`;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SingleOnBeat;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return (
            settings.notation.notationMode === NotationMode.SongBook &&
            beat.hasWhammyBar &&
            beat.whammyBarType === WhammyType.Dip
        );
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TabWhammyBarGlyph(beat);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
