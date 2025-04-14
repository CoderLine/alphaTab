import type { Beat } from '@src/model/Beat';
import type { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { AlternateEndingsGlyph } from '@src/rendering/glyphs/AlternateEndingsGlyph';
import type { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import type { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';

export class AlternateEndingsEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectAlternateEndings;
    }

    public get hideOnMultiTrack(): boolean {
        return true;
    }

    public get canShareBand(): boolean {
        return false;
    }

    public get sizingMode(): EffectBarGlyphSizing {
        return EffectBarGlyphSizing.FullBar;
    }

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return beat.voice.index === 0 && beat.index === 0 && beat.voice.bar.masterBar.alternateEndings !== 0;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        const masterBar = beat.voice.bar.masterBar;
        const openLine =
            masterBar.previousMasterBar === null ||
            masterBar.alternateEndings !== masterBar.previousMasterBar!.alternateEndings;
        let closeLine =
            masterBar.isRepeatEnd ||
            masterBar.nextMasterBar === null ||
            masterBar.alternateEndings !== masterBar.nextMasterBar!.alternateEndings;

        if (!masterBar.repeatGroup.closings.some(c => c.index >= masterBar.index)) {
            closeLine = false;
        }

        return new AlternateEndingsGlyph(0, 0, masterBar.alternateEndings, openLine, closeLine);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
