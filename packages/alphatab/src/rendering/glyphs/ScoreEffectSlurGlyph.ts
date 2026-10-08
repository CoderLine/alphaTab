import type { Beat } from '@coderline/alphatab/model/Beat';
import { ScoreSlurGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreSlurGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * The slur of hammer-ons, pull-offs and legato slides in standard notation.
 * @remarks
 * Behind Bars: all notes on one stem take a single slur, and not a slur to each note.
 * Hence the slur connects the outer notes of the start and end beat on the side of the slur,
 * regardless of which notes of the chords carry the effect.
 * @internal
 */
export class ScoreEffectSlurGlyph extends ScoreSlurGlyph {
    private _startBeat: Beat;
    private _endBeat: Beat;

    public constructor(slurEffectId: string, startBeat: Beat, endBeat: Beat, forEnd: boolean) {
        super(slurEffectId, startBeat.maxNote!, endBeat.maxNote!, forEnd);
        this._startBeat = startBeat;
        this._endBeat = endBeat;
    }

    protected override calculateTieDirection(): BeamDirection {
        const direction = super.calculateTieDirection();
        const isUp = direction === BeamDirection.Up;
        this.startNote = (isUp ? this._startBeat.maxNote : this._startBeat.minNote) ?? this.startNote;
        this.endNote = (isUp ? this._endBeat.maxNote : this._endBeat.minNote) ?? this.endNote;
        return direction;
    }
}
