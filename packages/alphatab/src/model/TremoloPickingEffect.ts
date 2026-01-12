import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { Duration } from '@coderline/alphatab/model/Duration';

/**
 * The style of tremolo affecting mainly the display of the effect.
 * @public
 */
export enum TremoloPickingStyle {
    /**
     * A classic tremolo expressed by diagonal bars on the stem.
     */
    Default = 0,
    /**
     * A buzz roll tremolo expressed by a 'z' shaped symbol.
     */
    BuzzRoll = 1
}

/**
 * Describes a tremolo picking effect.
 * @json
 * @json_strict
 * @cloneable
 * @public
 */
export class TremoloPickingEffect {
    /**
     * The minimum number of marks for the tremolo picking effect to be valid.
     */
    public static readonly minMarks = 0;

    /**
     * The max number of marks for the tremolo picking effect to be valid.
     */
    public static readonly maxMarks = 5;

    /**
     * The number of marks for the tremolo.
     * A mark is equal to a single bar shown for a default tremolos.
     */
    public marks: number = 0;

    /**
     * The style of the tremolo picking.
     */
    public style: TremoloPickingStyle = TremoloPickingStyle.Default;

    /**
     * @internal
     * @deprecated use {@link getDurationAsTicks} to handle tremolo durations shorter than typical durations.
     */
    public getDuration(beatDuration: Duration): Duration {
        let marks = this.marks;
        if (marks < 1) {
            marks = 1;
        }
        const baseDuration = beatDuration as number;
        const actualDuration = baseDuration * Math.pow(2, marks);
        if (actualDuration <= Duration.TwoHundredFiftySixth) {
            return actualDuration as Duration;
        } else {
            return Duration.TwoHundredFiftySixth;
        }
    }

    /**
     * Gets the duration of a single tremolo note played in a beat of the given duration
     * based on the configured marks.
     */
    public getDurationAsTicks(beatDuration: Duration): number {
        let marks = this.marks;
        if (marks < 1) {
            marks = 1;
        }
        const baseDuration = beatDuration as number;
        const actualDuration = baseDuration * Math.pow(2, marks);
        return MidiUtils.valueToTicks(actualDuration);
    }
}
