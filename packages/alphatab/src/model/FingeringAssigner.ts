import type { Beat } from '@coderline/alphatab/model/Beat';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';

/**
 * Cost-function weights for {@link FingeringAssigner}. Defaults tuned for
 * six-string guitar.
 * @internal
 */
export class FingeringOptions {
    public preferredHandPosition: number = 5;
    /** Negative = prefer open strings. */
    public openStringBonus: number = -1;
    public highFretPenaltyWeight: number = 0.5;
    public negativeFretPenaltyWeight: number = 3.0;
    /** Soft; heavy weight prefers distinct strings but permits collisions
     *  for chords with more notes than strings. */
    public collisionPenalty: number = 100;
    /** Negative = cluster chord notes on neighbouring strings. */
    public adjacentStringBonus: number = -1.5;
    /** Negative = repeated pitches stay on the same string across beats. */
    public stringContinuityBonus: number = -0.75;
    /** EWMA weight for the hand-position anchor:
     *  `hand = α·hand + (1−α)·newHand`. */
    public handPositionMomentum: number = 0.7;
}

/**
 * Assigns (string, fret) to a stream of beats via greedy hand-position
 * hysteresis. One instance per (staff, voice); mutates notes in place.
 * Not thread-safe.
 * @internal
 */
export class FingeringAssigner {
    private static readonly _maxStrings: number = 30;

    private readonly _tuning: number[];
    private readonly _capo: number;
    private readonly _transpositionPitch: number;
    private readonly _options: FingeringOptions;

    private _handPosition: number;
    private readonly _lastStringByMidi: Int8Array;
    private _sortedIdx: Int32Array;

    /**
     * @param tuning High-to-low MIDI pitches (matches {@link Staff.tuning}). 1..30 entries.
     */
    public constructor(tuning: number[], capo: number, transpositionPitch: number, options?: FingeringOptions) {
        if (tuning.length < 1 || tuning.length > FingeringAssigner._maxStrings) {
            throw new Error(
                `FingeringAssigner requires 1..${FingeringAssigner._maxStrings} strings, got tuning.length=${tuning.length}`
            );
        }
        this._tuning = tuning;
        this._capo = capo;
        this._transpositionPitch = transpositionPitch;
        this._options = options ?? new FingeringOptions();

        this._handPosition = this._options.preferredHandPosition;
        this._lastStringByMidi = new Int8Array(128);
        this._lastStringByMidi.fill(-1);
        this._sortedIdx = new Int32Array(16);
    }

    /** Reset the hand-position anchor and per-pitch continuity memory. */
    public reset(): void {
        this._handPosition = this._options.preferredHandPosition;
        this._lastStringByMidi.fill(-1);
    }

    /** Assigns `(string, fret)` to notes that don't already carry both. */
    public assign(beat: Beat): void {
        const notes = beat.notes;
        const K = notes.length;
        if (K === 0) {
            return;
        }

        if (this._sortedIdx.length < K) {
            this._sortedIdx = new Int32Array(K);
        }
        const sortedIdx = this._sortedIdx;

        let n = 0;
        for (let i = 0; i < K; i++) {
            const note = notes[i];
            if (note.isStringed) {
                continue;
            }
            if (note.isPercussion) {
                const art = PercussionMapper.getArticulation(note);
                if (art !== null) {
                    if (Number.isNaN(note.string)) {
                        note.string = Math.max(1, Math.min(6, 7 - art.staffLine));
                    }
                    if (Number.isNaN(note.fret)) {
                        note.fret = art.outputMidiNumber;
                    }
                }
                continue;
            }
            const tieOrigin = note.tieOrigin;
            if (note.isTieDestination && tieOrigin !== null && tieOrigin.isStringed) {
                note.string = tieOrigin.string;
                note.fret = tieOrigin.fret;
                continue;
            }
            let j = n;
            const noteValue = note.realValue;
            while (j > 0 && notes[sortedIdx[j - 1]].realValue > noteValue) {
                sortedIdx[j] = sortedIdx[j - 1];
                j--;
            }
            sortedIdx[j] = i;
            n++;
        }

        if (n === 0) {
            return;
        }

        const N = this._tuning.length;
        const opts = this._options;
        let usedStrings = 0;
        let newHand = -1;

        for (let k = 0; k < n; k++) {
            const note = notes[sortedIdx[k]];
            const realValue = note.realValue;
            const target = realValue + this._transpositionPitch;
            const continuityString = realValue >= 0 && realValue < 128 ? this._lastStringByMidi[realValue] : -1;

            let bestString = 1;
            let bestFret = 0;
            let bestCost = Number.POSITIVE_INFINITY;

            for (let s = 1; s <= N; s++) {
                const fret = target - (this._capo + this._tuning[N - s]);
                const distanceCost = Math.abs(fret - this._handPosition);
                const openBonus = fret === 0 ? opts.openStringBonus : 0;
                const negFretPenalty = fret < 0 ? -fret * opts.negativeFretPenaltyWeight : 0;
                const highFretPenalty = fret > 12 ? (fret - 12) * opts.highFretPenaltyWeight : 0;
                const collisionCost = (usedStrings & (1 << (s - 1))) !== 0 ? opts.collisionPenalty : 0;
                const leftUsed = s > 1 && (usedStrings & (1 << (s - 2))) !== 0;
                const rightUsed = s < N && (usedStrings & (1 << s)) !== 0;
                const adjacencyBonus = leftUsed || rightUsed ? opts.adjacentStringBonus : 0;
                const continuityBonus = s === continuityString ? opts.stringContinuityBonus : 0;

                const cost =
                    distanceCost +
                    openBonus +
                    negFretPenalty +
                    highFretPenalty +
                    collisionCost +
                    adjacencyBonus +
                    continuityBonus;

                if (cost < bestCost) {
                    bestCost = cost;
                    bestString = s;
                    bestFret = fret;
                }
            }

            note.string = bestString;
            note.fret = bestFret;
            usedStrings |= 1 << (bestString - 1);
            if (realValue >= 0 && realValue < 128) {
                this._lastStringByMidi[realValue] = bestString;
            }

            if (bestFret > 0 && (newHand < 0 || bestFret < newHand)) {
                newHand = bestFret;
            }
        }

        if (newHand >= 0) {
            const alpha = opts.handPositionMomentum;
            this._handPosition = alpha * this._handPosition + (1 - alpha) * newHand;
        }
    }
}
