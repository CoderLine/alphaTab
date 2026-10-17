import type { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { ScoreSlurGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreSlurGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * The slur of hammer-ons, pull-offs and legato slides in standard notation.
 * @remarks
 * Behind Bars: all notes on one stem take a single slur, and not a slur to each note.
 * Hence the slur connects the outer notes of the start and end beat on the side of the slur,
 * regardless of which notes of the chords carry the effect.
 *
 * In multi-voice bars each voice has its own stem direction. Like articulation, the slur is then
 * placed at the stem end (Behind Bars: never on the notehead side in double-stemmed writing).
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

    /**
     * Gets the beat on which the effect slur started on the given beat ends: the furthest destination
     * of the effect slur chains starting on any note of the beat.
     * @returns The destination beat or null if no effect slur chain starts on the beat.
     */
    public static getDestinationBeat(beat: Beat): Beat | null {
        let destination: Beat | null = null;
        for (const n of beat.notes) {
            if (n.isEffectSlurOrigin && n.effectSlurDestination) {
                const noteDestination = n.effectSlurDestination.beat;
                if (!destination || noteDestination.absoluteDisplayStart > destination.absoluteDisplayStart) {
                    destination = noteDestination;
                }
            }
        }
        return destination;
    }

    private static _isOnStemEnd(beat: Beat, renderer: LineBarRenderer, direction: BeamDirection): boolean {
        return (
            beat.voice.bar.isMultiVoice &&
            !beat.isRest &&
            beat.duration > Duration.Whole &&
            renderer.getBeatDirection(beat) === direction
        );
    }

    private _stemEndY(renderer: LineBarRenderer, beat: Beat): number {
        // same padding as other effects placed at the stem end
        const padding = renderer.smuflMetrics.onNoteEffectPadding;
        const y = renderer.getBeatStemEndY(beat);
        return this.tieDirection === BeamDirection.Up ? y - padding : y + padding;
    }

    protected override calculateTieDirection(): BeamDirection {
        let direction = super.calculateTieDirection();
        if (this._startBeat.voice.bar.isMultiVoice) {
            // multi-voice: slur on the stem side
            direction = this.lookupStartBeatRenderer().getBeatDirection(this._startBeat);
        }
        const isUp = direction === BeamDirection.Up;
        this.startNote = (isUp ? this._startBeat.maxNote : this._startBeat.minNote) ?? this.startNote;
        this.endNote = (isUp ? this._endBeat.maxNote : this._endBeat.minNote) ?? this.endNote;
        return direction;
    }

    protected override calculateStartX(): number {
        const renderer = this.lookupStartBeatRenderer();
        if (ScoreEffectSlurGlyph._isOnStemEnd(this._startBeat, renderer, this.tieDirection)) {
            return renderer.x + renderer.getBeatX(this._startBeat, BeatXPosition.Stem);
        }
        return super.calculateStartX();
    }

    protected override calculateStartY(): number {
        const renderer = this.lookupStartBeatRenderer();
        if (ScoreEffectSlurGlyph._isOnStemEnd(this._startBeat, renderer, this.tieDirection)) {
            return this._stemEndY(renderer, this._startBeat);
        }
        return super.calculateStartY();
    }

    protected override calculateEndX(): number {
        const renderer = this.lookupEndBeatRenderer();
        if (renderer && ScoreEffectSlurGlyph._isOnStemEnd(this._endBeat, renderer, this.tieDirection)) {
            return renderer.x + renderer.getBeatX(this._endBeat, BeatXPosition.Stem);
        }
        return super.calculateEndX();
    }

    protected override caclculateEndY(): number {
        const renderer = this.lookupEndBeatRenderer();
        if (renderer && ScoreEffectSlurGlyph._isOnStemEnd(this._endBeat, renderer, this.tieDirection)) {
            return this._stemEndY(renderer, this._endBeat);
        }
        return super.caclculateEndY();
    }
}
