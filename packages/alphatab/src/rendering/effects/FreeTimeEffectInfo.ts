import type { Beat } from '@coderline/alphatab/model/Beat';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { EffectBarRendererInfo } from '@coderline/alphatab/rendering/EffectBarRendererInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';

/**
 * @internal
 */
export class FreeTimeEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectText;
    }

    public get hideOnMultiTrack(): boolean {
        return false;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SinglePreBeat;
    }

    public shouldCreateGlyph(_settings: Settings, beat: Beat): boolean {
        const masterBar = beat.voice.bar.masterBar;
        const isFirstBeat = beat.voice.bar.staff.index === 0 && beat.voice.index === 0 && beat.index === 0;
        return (
            isFirstBeat &&
            masterBar.isFreeTime &&
            (masterBar.index === 0 || masterBar.isFreeTime !== masterBar.previousMasterBar!.isFreeTime)
        );
    }

    public createNewGlyph(renderer: BarRendererBase, _beat: Beat): EffectGlyph {
        return new TextGlyph(0, 0, 'Free time', renderer.resources.effectFont, TextAlign.Left);
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return true;
    }
}
