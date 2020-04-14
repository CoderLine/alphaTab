import { Beat } from '@src/model/Beat';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { TempoGlyph } from '@src/rendering/glyphs/TempoGlyph';
import { IEffectBarRendererInfo } from '@src/rendering/IEffectBarRendererInfo';
import { Settings } from '@src/Settings';

export class TempoEffectInfo implements IEffectBarRendererInfo {
    public get effectId(): string {
        return 'tempo';
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

    public shouldCreateGlyph(settings: Settings, beat: Beat): boolean {
        return (
            beat.voice.bar.staff.index === 0 &&
            beat.voice.index === 0 &&
            beat.index === 0 &&
            (!!beat.voice.bar.masterBar.tempoAutomation || beat.voice.bar.index === 0)
        );
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        let tempo: number = 0;
        if (beat.voice.bar.masterBar.tempoAutomation) {
            tempo = beat.voice.bar.masterBar.tempoAutomation.value;
        } else {
            tempo = beat.voice.bar.staff.track.score.tempo;
        }
        return new TempoGlyph(0, 0, tempo);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
