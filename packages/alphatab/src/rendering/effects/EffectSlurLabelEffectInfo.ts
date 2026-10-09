import type { Beat } from '@coderline/alphatab/model/Beat';
import type { SlurSegment } from '@coderline/alphatab/model/SlurSegment';
import { SlurSegmentKind } from '@coderline/alphatab/model/SlurSegmentKind';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import type { EffectBand } from '@coderline/alphatab/rendering/EffectBand';
import { EffectBarGlyphSizing } from '@coderline/alphatab/rendering/EffectBarGlyphSizing';
import { EffectBandPlacementCategory, type EffectInfo } from '@coderline/alphatab/rendering/EffectInfo';
import type { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { EffectSlurLabelGlyph } from '@coderline/alphatab/rendering/glyphs/EffectSlurLabelGlyph';

function labelText(segment: SlurSegment): string {
    if (segment.text !== null) {
        return segment.text;
    }
    if (segment.kind === SlurSegmentKind.LegatoSlide) {
        return 'sl.';
    }
    return segment.toNote.realValue >= segment.fromNote.realValue ? 'H' : 'P';
}

function hasSegment(beat: Beat, kind: SlurSegmentKind): boolean {
    for (const n of beat.notes) {
        if (n.isVisible && n.effectSlurSegment && n.effectSlurSegment.kind === kind) {
            return true;
        }
    }
    return false;
}

/**
 * Creates the effect info showing the labels of one kind of effect slur segment
 * (hammer-on/pull-off or legato slide) above the staff.
 * @remarks
 * Like in Guitar Pro the labels are not attached to the slur arcs: all notes of a beat take
 * one label, centered between the beat and the beat where the segment ends.
 * @internal
 */
function createEffectSlurLabelEffectInfo(
    effectId: string,
    kind: SlurSegmentKind,
    notationElement: NotationElement
): EffectInfo {
    return {
        effectId,
        notationElement,
        hideOnMultiTrack: false,
        sizingMode: EffectBarGlyphSizing.SingleOnBeat,
        // labels sit between the beats and must not widen them
        contributesToBeatSpacing: false,
        shouldCreateGlyph: (_renderer: BarRendererBase, beat: Beat): boolean => hasSegment(beat, kind),
        createNewGlyph: (renderer: BarRendererBase, beat: Beat): EffectGlyph => {
            const texts: string[] = [];
            let endBeat: Beat = beat;
            for (const n of beat.notes) {
                const segment = n.effectSlurSegment;
                if (!n.isVisible || !segment || segment.kind !== kind) {
                    continue;
                }
                const text = labelText(segment);
                if (texts.indexOf(text) === -1) {
                    texts.push(text);
                }
                if (segment.toNote.beat.absoluteDisplayStart > endBeat.absoluteDisplayStart) {
                    endBeat = segment.toNote.beat;
                }
            }
            return new EffectSlurLabelGlyph(
                texts.join(' '),
                renderer.resources.getFontForNotationElement(notationElement),
                endBeat
            );
        },
        canExpand: (_from: Beat, _to: Beat): boolean => true,
        placementCategory: EffectBandPlacementCategory.NoteAttached,
        // all bars of the system have their final positions here, labels can be centered
        // towards beats in later bars before the band is placed vertically.
        finalizeBand: (band: EffectBand): void => {
            for (const voiceGlyphs of band.glyphsByVoice) {
                for (const g of voiceGlyphs) {
                    (g as EffectSlurLabelGlyph).resolveOffset();
                }
            }
            band.invalidateXRange();
        }
    };
}

/**
 * @internal
 */
export const hammerPullLabelEffectInfo: EffectInfo = createEffectSlurLabelEffectInfo(
    'EffectHammerOnPullOffText',
    SlurSegmentKind.HammerPull,
    NotationElement.EffectHammerOnPullOffText
);

/**
 * @internal
 */
export const slideLabelEffectInfo: EffectInfo = createEffectSlurLabelEffectInfo(
    'EffectSlideText',
    SlurSegmentKind.LegatoSlide,
    NotationElement.EffectSlideText
);
