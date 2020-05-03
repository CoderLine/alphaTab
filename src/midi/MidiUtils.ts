import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';

export class MidiUtils {
    public static readonly QuarterTime: number = 960;
    private static readonly MinVelocity: number = 15;
    private static readonly VelocityIncrement: number = 16;

    /**
     * Converts the given midi tick duration into milliseconds.
     * @param ticks The duration in midi ticks
     * @param tempo The current tempo in BPM.
     * @returns The converted duration in milliseconds.
     */
    public static ticksToMillis(ticks: number, tempo: number): number {
        return (ticks * (60000.0 / (tempo * MidiUtils.QuarterTime))) | 0;
    }

    /**
     * Converts the given midi tick duration into milliseconds.
     * @param millis The duration in milliseconds
     * @param tempo The current tempo in BPM.
     * @returns The converted duration in midi ticks.
     */
    public static millisToTicks(millis: number, tempo: number): number {
        return (millis / (60000.0 / (tempo * MidiUtils.QuarterTime))) | 0;
    }

    /**
     * Converts a duration value to its ticks equivalent.
     */
    public static toTicks(duration: Duration): number {
        return MidiUtils.valueToTicks(duration);
    }

    /**
     * Converts a numerical value to its ticks equivalent.
     * @param duration the numerical proportion to convert. (i.E. timesignature denominator, note duration,...)
     */
    public static valueToTicks(duration: number): number {
        let denomninator: number = duration;
        if (denomninator < 0) {
            denomninator = 1 / -denomninator;
        }
        return (MidiUtils.QuarterTime * (4.0 / denomninator)) | 0;
    }

    public static applyDot(ticks: number, doubleDotted: boolean): number {
        if (doubleDotted) {
            return ticks + ((ticks / 4) | 0) * 3;
        }
        return ticks + ((ticks / 2) | 0);
    }

    public static applyTuplet(ticks: number, numerator: number, denominator: number): number {
        return ((ticks * denominator) / numerator) | 0;
    }

    public static removeTuplet(ticks: number, numerator: number, denominator: number): number {
        return ((ticks * numerator) / denominator) | 0;
    }

    public static dynamicToVelocity(dyn: DynamicValue): number {
        return MidiUtils.MinVelocity + dyn * MidiUtils.VelocityIncrement;
    }
}
