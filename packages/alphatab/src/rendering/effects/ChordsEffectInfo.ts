import type { Beat } from '@coderline/alphatab/model/Beat';
import { TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';
import { EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { Settings } from '@coderline/alphatab/Settings';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { ChordDiagramGlyph } from '@coderline/alphatab/rendering/glyphs/ChordDiagramGlyph';

/**
 * @internal
 */
export class ChordsEffectInfo extends EffectInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectChordNames;
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
        return beat.hasChord;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        const showDiagram = beat.voice.bar.staff.track.score.stylesheet.globalDisplayChordDiagramsInScore;
        return showDiagram
            ? new ChordDiagramGlyph(0, 0, beat.chord!, NotationElement.EffectChordNames, true)
            : new TextGlyph(
                  0,
                  0,
                  beat.chord!.name,
                  renderer.resources.elementFonts.get(NotationElement.EffectChordNames)!,
                  TextAlign.Center
              );
    }

    public canExpand(_from: Beat, _to: Beat): boolean {
        return false;
    }
}
