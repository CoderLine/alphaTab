import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import { TabTieGlyph } from '@coderline/alphatab/rendering/glyphs/TabTieGlyph';
import { TieGlyphLabels, type TieGlyphLabel } from '@coderline/alphatab/rendering/glyphs/TieGlyphLabel';
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
    private _labels: TieGlyphLabel[] | null = null;

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
        return startNote && endNote ? { startNote, endNote } : null;
    }

    protected invalidateLabels(): void {
        this._labels = null;
    }

    public override getTieHeight(startX: number, _startY: number, endX: number, _endY: number): number {
        return (Math.log(endX - startX + 1) * this.renderer.settings.notation.slurHeight) / 2;
    }

    protected override getSlurLabels(): TieGlyphLabel[] | null {
        if (this._labels === null) {
            this._labels = [];
            const slur = this.startNote.effectSlur;
            if (slur !== null) {
                const notationSettings = this.renderer.settings.notation;
                for (const s of slur.segments) {
                    const label = TieGlyphLabels.build(s, s.toNote.fret >= s.fromNote.fret);
                    if (notationSettings.isNotationElementVisible(label.element)) {
                        this._labels.push(label);
                    }
                }
            }
        }
        return this._labels.length > 0 ? this._labels : null;
    }
}
