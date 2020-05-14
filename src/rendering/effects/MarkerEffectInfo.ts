import { Beat } from '@src/model/Beat';
import { TextAlign } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

export class MarkerEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectMarker;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        return true;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.SinglePreBeat;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return (
            beat.voice.bar.staff.index === 0 &&
            beat.voice.index === 0 &&
            beat.index === 0 &&
            beat.voice.bar.masterBar.isSectionStart
        );
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new TextGlyph(
            0,
            0,
            !beat.voice.bar.masterBar.section!.marker
                ? beat.voice.bar.masterBar.section!.text
                : '[' + beat.voice.bar.masterBar.section!.marker + '] ' + beat.voice.bar.masterBar.section!.text,
            renderer.resources.markerFont,
            TextAlign.Left
        );
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
