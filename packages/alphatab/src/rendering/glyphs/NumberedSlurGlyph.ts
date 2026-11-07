import type { Note } from '@coderline/alphatab/model/Note';
import { TabSlurGlyph } from '@coderline/alphatab/rendering/glyphs/TabSlurGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class NumberedSlurGlyph extends TabSlurGlyph {
    private _forSlide: boolean;

    public constructor(slurEffectId: string, startNote: Note, endNote: Note, forSlide: boolean, forEnd: boolean) {
        super(slurEffectId, startNote, endNote, forEnd);
        this._forSlide = forSlide;
    }

    protected override calculateTieDirection(): BeamDirection {
        return BeamDirection.Up;
    }

    public tryExpand(startNote: Note, endNote: Note, forSlide: boolean, forEnd: boolean): boolean {
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
        const isForEnd = this.renderer === this.lookupEndBeatRenderer();
        if (isForEnd !== forEnd) {
            return false;
        }
        // slurs arc above the numbers, so they attach to the highest note
        if (startNote.realValue > this.startNote.realValue) {
            this.startNote = startNote;
        }
        if (endNote.realValue > this.endNote.realValue) {
            this.endNote = endNote;
        }
        return true;
    }
}
