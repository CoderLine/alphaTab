import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { TabTieGlyph } from '@coderline/alphatab/rendering/glyphs/TabTieGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * The notes connected by the effect slur arc of one side of a beat.
 * @internal
 * @record
 */
export interface TabEffectSlurGroup {
    startNote: Note;
    endNote: Note;
}

/**
 * The arc of hammer-ons, pull-offs and legato slides on the tab staff.
 * @remarks
 * Like Guitar Pro, the notes of a beat take one arc per side (above the upper strings, below the lower strings),
 * connecting the outer note of that side up to the furthest destination of the chains starting on it.
 * @internal
 */
export class TabSlurGlyph extends TabTieGlyph {
    /**
     * Gets the notes the effect slur arc on the given side of the beat connects.
     * @returns The notes, or null if no effect slur chain starts on this side of the beat.
     */
    public static getEffectSlurGroup(beat: Beat, direction: BeamDirection): TabEffectSlurGroup | null {
        const isUp = direction === BeamDirection.Up;
        let startNote: Note | null = null;
        let endNote: Note | null = null;
        for (const n of beat.notes) {
            const destination = n.effectSlurDestination;
            if (
                !n.isVisible ||
                !n.isEffectSlurOrigin ||
                !destination ||
                TabTieGlyph.getBeamDirectionForNote(n) !== direction
            ) {
                continue;
            }

            if (!startNote || (isUp ? n.realValue > startNote.realValue : n.realValue < startNote.realValue)) {
                startNote = n;
            }

            if (
                !endNote ||
                destination.beat.absoluteDisplayStart > endNote.beat.absoluteDisplayStart ||
                (destination.beat === endNote.beat &&
                    (isUp ? destination.realValue > endNote.realValue : destination.realValue < endNote.realValue))
            ) {
                endNote = destination;
            }
        }
        if (!startNote || !endNote) {
            return null;
        }
        return { startNote: startNote!, endNote: endNote! };
    }

    public override getTieHeight(startX: number, _startY: number, endX: number, _endY: number): number {
        return (Math.log(endX - startX + 1) * this.renderer.settings.notation.slurHeight) / 2;
    }
}
