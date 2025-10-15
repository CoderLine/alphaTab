import type { Beat } from '@src/model/Beat';
import { GraceType } from '@src/model/GraceType';
import type { Voice } from '@src/model/Voice';

/**
 * Represents a list of beats that are grouped within the same tuplet.
 * @public
 */
export class TupletGroup {
    private static readonly _halfTicks: number = 1920;
    private static readonly _quarterTicks: number = 960;
    private static readonly _eighthTicks: number = 480;
    private static readonly _sixteenthTicks: number = 240;
    private static readonly _thirtySecondTicks: number = 120;
    private static readonly _sixtyFourthTicks: number = 60;
    private static readonly _oneHundredTwentyEighthTicks: number = 30;
    private static readonly _twoHundredFiftySixthTicks: number = 15;

    private static _allTicks: number[] = [
        TupletGroup._halfTicks,
        TupletGroup._quarterTicks,
        TupletGroup._eighthTicks,
        TupletGroup._sixteenthTicks,
        TupletGroup._thirtySecondTicks,
        TupletGroup._sixtyFourthTicks,
        TupletGroup._oneHundredTwentyEighthTicks,
        TupletGroup._twoHundredFiftySixthTicks
    ];

    private _isEqualLengthTuplet: boolean = true;

    public totalDuration: number = 0;

    /**
     * Gets or sets the list of beats contained in this group.
     */
    public beats: Beat[] = [];

    /**
     * Gets or sets the voice this group belongs to.
     */
    public voice: Voice;

    /**
     * Gets a value indicating whether the tuplet group is fully filled.
     */
    public isFull: boolean = false;

    /**
     * Initializes a new instance of the {@link TupletGroup} class.
     * @param voice The voice this group belongs to.
     */
    public constructor(voice: Voice) {
        this.voice = voice;
    }

    public check(beat: Beat): boolean {
        if (this.beats.length === 0) {
            // accept first beat
            this.beats.push(beat);
            this.totalDuration += beat.playbackDuration;
            return true;
        }
        if (beat.graceType !== GraceType.None) {
            // grace notes do not break tuplet group, but also do not contribute to them.
            return true;
        }
        if (
            beat.voice !== this.voice ||
            this.isFull ||
            beat.tupletNumerator !== this.beats[0].tupletNumerator ||
            beat.tupletDenominator !== this.beats[0].tupletDenominator
        ) {
            // only same tuplets are potentially accepted
            return false;
        }
        // TBH: I do not really know how the 100% tuplet grouping of Guitar Pro might work
        // it sometimes has really strange rules where notes filling 3 quarters, are considered a full 3:2 tuplet
        // in alphaTab we have now 2 rules where we consider a tuplet full:
        // 1. if all beats have the same length, the tuplet must contain N notes of an N:M tuplet
        // 2. if we have mixed beats, we check if the current set of beats, matches a N:M tuplet
        //    by checking all potential note durations.
        // this logic is very likely not 100% correct but for most cases the tuplets
        // appeared correct.
        if (beat.playbackDuration !== this.beats[0].playbackDuration) {
            this._isEqualLengthTuplet = false;
        }
        this.beats.push(beat);
        this.totalDuration += beat.playbackDuration;
        if (this._isEqualLengthTuplet) {
            if (this.beats.length === this.beats[0].tupletNumerator) {
                this.isFull = true;
            }
        } else {
            const factor: number = (this.beats[0].tupletNumerator / this.beats[0].tupletDenominator) | 0;
            for (const potentialMatch of TupletGroup._allTicks) {
                if (this.totalDuration === potentialMatch * factor) {
                    this.isFull = true;
                    break;
                }
            }
        }
        return true;
    }
}
