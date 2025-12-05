import type { Beat } from '@coderline/alphatab/model/Beat';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { BarTempoGlyph } from '@coderline/alphatab/rendering/glyphs/BarTempoGlyph';

/**
 * @internal
 */
export class TempoEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectTempo;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SinglePreBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        return (
            beat.voice.bar.staff.index === 0 &&
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.tempoAutomations.some(t => t.isVisible)
        );
    }

    public createNewGlyph(_renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new BarTempoGlyph(beat.voice.bar.masterBar.tempoAutomations.filter(a => a.isVisible));
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
