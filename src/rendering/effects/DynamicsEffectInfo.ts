import { Beat } from '@src/model/Beat';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@src/rendering/EffectBarGlyphSizing';
import { DynamicsGlyph } from '@src/rendering/glyphs/DynamicsGlyph';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { EffectBarRendererInfo } from '@src/rendering/EffectBarRendererInfo';
import { Settings } from '@src/Settings';
import { NotationElement } from '@src/NotationSettings';
import { GraceType } from '@src/model/GraceType';

export class DynamicsEffectInfo extends EffectBarRendererInfo {
    public get notationElement(): NotationElement {
        return NotationElement.EffectDynamics
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
        return this.internalShouldCreateGlyph(beat);
    }

    private internalShouldCreateGlyph(beat: Beat): boolean {
        if (beat.voice.bar.staff.track.score.stylesheet.hideDynamics || beat.isEmpty || beat.voice.isEmpty || beat.isRest || beat.graceType !== GraceType.None) {
            return false;
        }

        let previousBeat = this.getPreviousDynamicsBeat(beat);

        let show: boolean =
            (beat.voice.index === 0 && !previousBeat) ||
            (beat.dynamics !== previousBeat?.dynamics);
        // ensure we do not show duplicate dynamics
        if (show && beat.voice.index > 0) {
            for (let voice of beat.voice.bar.voices) {
                if (voice.index < beat.voice.index) {
                    let beatAtSamePos = voice.getBeatAtPlaybackStart(beat.playbackStart);
                    if (
                        beatAtSamePos &&
                        beat.dynamics === beatAtSamePos.dynamics &&
                        this.internalShouldCreateGlyph(beatAtSamePos)
                    ) {
                        show = false;
                    }
                }
            }
        }
        return show;
    }
    private getPreviousDynamicsBeat(beat: Beat) {
        let previousBeat = beat.previousBeat;
        while (previousBeat != null) {
            if (!previousBeat.isRest && previousBeat.graceType === GraceType.None) {
                return previousBeat;
            }
            previousBeat = previousBeat.previousBeat;
        }
        return null;
    }

    public createNewGlyph(renderer: BarRendererBase, beat: Beat): EffectGlyph {
        return new DynamicsGlyph(0, 0, beat.dynamics);
    }

    public canExpand(from: Beat, to: Beat): boolean {
        return true;
    }
}
