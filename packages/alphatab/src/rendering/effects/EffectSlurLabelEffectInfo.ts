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
            // different texts (e.g. H on one string, P on another) are stacked,
            // the label of the higher note on top
            const texts: string[] = [];
            const textPitches: number[] = [];
            let endBeat: Beat = beat;
            for (const n of beat.notes) {
                const segment = n.effectSlurSegment;
                if (!n.isVisible || !segment || segment.kind !== kind) {
                    continue;
                }
                const text = labelText(segment);
                const existing = texts.indexOf(text);
                if (existing === -1) {
                    texts.push(text);
                    textPitches.push(n.realValue);
                } else if (n.realValue > textPitches[existing]) {
                    textPitches[existing] = n.realValue;
                }
                // isAfter (not the display start): grace notes share the display start of their main note
                if (segment.toNote.beat.isAfter(endBeat)) {
                    endBeat = segment.toNote.beat;
                }
            }
            const lines: string[] = [];
            while (texts.length > 0) {
                let highest = 0;
                for (let i = 1; i < texts.length; i++) {
                    if (textPitches[i] > textPitches[highest]) {
                        highest = i;
                    }
                }
                lines.push(texts[highest]);
                texts.splice(highest, 1);
                textPitches.splice(highest, 1);
            }
            return new EffectSlurLabelGlyph(
                lines,
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
