import type { Beat } from '@coderline/alphatab/model/Beat';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import { DynamicsGlyph } from '@coderline/alphatab/rendering/glyphs/DynamicsGlyph';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';

function getPreviousDynamicsBeat(beat: Beat): Beat | null {
    let previousBeat = beat.previousBeat;
    while (previousBeat != null) {
        if (!previousBeat.isRest) {
            return previousBeat;
        }
        previousBeat = previousBeat.previousBeat;
    }
    return null;
}

function shouldCreateDynamicsGlyph(beat: Beat): boolean {
    if (beat.voice.bar.staff.track.score.stylesheet.hideDynamics || beat.isEmpty || beat.voice.isEmpty || beat.isRest) {
        return false;
    }

    const previousBeat = getPreviousDynamicsBeat(beat);

    let show: boolean = (beat.voice.index === 0 && !previousBeat) || beat.dynamics !== previousBeat?.dynamics;
    // ensure we do not show duplicate dynamics
    if (show && beat.voice.index > 0) {
        for (const voice of beat.voice.bar.voices) {
            if (voice.index < beat.voice.index) {
                const beatAtSamePos = voice.getBeatAtPlaybackStart(beat.playbackStart);
                if (
                    beatAtSamePos &&
                    beat.dynamics === beatAtSamePos.dynamics &&
                    shouldCreateDynamicsGlyph(beatAtSamePos)
                ) {
                    show = false;
                }
            }
        }
    }
    return show;
}

/**
 * @internal
 */
export const dynamicsEffectInfo: EffectInfo = {
    effectId: 'EffectDynamics',
    notationElement: NotationElement.EffectDynamics,
    hideOnMultiTrack: false,
    sizingMode: EffectBarGlyphSizing.SingleOnBeat,
    shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => {
        return shouldCreateDynamicsGlyph(beat);
    },
    createNewGlyph: (_renderer: BarRendererBase, beat: Beat): EffectGlyph => {
        return new DynamicsGlyph(0, 0, beat.dynamics);
    },
    canExpand: (_from: Beat, _to: Beat): boolean => true,
    placementCategory: EffectBandPlacementCategory.NoteAttached
};
