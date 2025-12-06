import type { Note } from '@coderline/alphatab/model/Note';
import { TabTieGlyph } from '@coderline/alphatab/rendering/glyphs/TabTieGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class TabSlurGlyph extends TabTieGlyph {
    private _forSlide: boolean;

    public constructor(slurEffectId: string, startNote: Note, endNote: Note, forSlide: boolean) {
        super(slurEffectId, startNote, endNote);
        this._forSlide = forSlide;
    }

    protected override getTieHeight(startX: number, _startY: number, endX: number, _endY: number): number {
        return (Math.log(endX - startX + 1) * this.renderer.settings.notation.slurHeight) / 2;
    }

    public tryExpand(startNote: Note, endNote: Note, forSlide: boolean): boolean {
        // same type required
        if (this._forSlide !== forSlide) {
            return false;
        }
        // same start and endbeat
        if (this.startNote.beat.id !== startNote.beat.id) {
            return false;
        }
        if (this.endNote.beat.id !== endNote.beat.id) {
            return false;
        }
        // same draw direction
        if (this.tieDirection !== TabTieGlyph.getBeamDirectionForNote(startNote)) {
            return false;
        }
        // if we can expand, expand in correct direction
        switch (this.tieDirection) {
            case BeamDirection.Up:
                if (startNote.realValue > this.startNote.realValue) {
                    this.startNote = startNote;
                }
                if (endNote.realValue > this.endNote.realValue) {
                    this.endNote = endNote;
                }
                break;
            case BeamDirection.Down:
                if (startNote.realValue < this.startNote.realValue) {
                    this.startNote = startNote;
                }
                if (endNote.realValue < this.endNote.realValue) {
                    this.endNote = endNote;
                }
                break;
        }
        return true;
    }
}
