import { DynamicValue } from '@src/model/DynamicValue';
import type { Duration } from '@src/model/Duration';

export class MidiUtils {
    public static readonly QuarterTime: number = 960;
    private static readonly MinVelocity: number = 15;
    public static readonly VelocityIncrement: number = 16;

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

    public static dynamicToVelocity(dynamicValue: DynamicValue, adjustment: number = 0): number {
        let velocity: number = 1;
        switch (dynamicValue) {
            case DynamicValue.PPP:
                velocity = MidiUtils.MinVelocity + 0 * MidiUtils.VelocityIncrement;
                break;
            case DynamicValue.PP:
                velocity = MidiUtils.MinVelocity + 1 * MidiUtils.VelocityIncrement;
                break;
            case DynamicValue.P:
                velocity = MidiUtils.MinVelocity + 2 * MidiUtils.VelocityIncrement;
                break;
            case DynamicValue.MP:
                velocity = MidiUtils.MinVelocity + 3 * MidiUtils.VelocityIncrement;
                break;
            case DynamicValue.MF:
                velocity = MidiUtils.MinVelocity + 4 * MidiUtils.VelocityIncrement;
                break;
            case DynamicValue.F:
                velocity = MidiUtils.MinVelocity + 5 * MidiUtils.VelocityIncrement;
                break;
            case DynamicValue.FF:
                velocity = MidiUtils.MinVelocity + 6 * MidiUtils.VelocityIncrement;
                break;
            case DynamicValue.FFF:
                velocity = MidiUtils.MinVelocity + 7 * MidiUtils.VelocityIncrement;
                break;

            // special
            case DynamicValue.PPPP:
                velocity = 10;
                break;

            case DynamicValue.PPPPP:
                velocity = 5;
                break;

            case DynamicValue.PPPPPP:
                velocity = 3;
                break;

            case DynamicValue.FFFF:
                velocity = MidiUtils.MinVelocity + 8 * MidiUtils.VelocityIncrement;
                break;

            case DynamicValue.FFFFF:
                velocity = MidiUtils.MinVelocity + 9 * MidiUtils.VelocityIncrement;
                break;

            case DynamicValue.FFFFFF:
                velocity = MidiUtils.MinVelocity + 10 * MidiUtils.VelocityIncrement;
                break;

            // "forced" variants -> a bit louder than normal, same as FF for us
            case DynamicValue.SF:
            case DynamicValue.SFP:
            case DynamicValue.SFZP:
            case DynamicValue.SFPP:
            case DynamicValue.SFZ:
            case DynamicValue.FZ:
                velocity = MidiUtils.MinVelocity + 6 * MidiUtils.VelocityIncrement;
                break;

            // force -> piano, same as F for us
            case DynamicValue.FP:
                velocity = MidiUtils.MinVelocity + 5 * MidiUtils.VelocityIncrement;
                break;

            // "rinforced" varaints -> like "forced" but typically for a whole passage
            // not a single note, same as FF for us
            case DynamicValue.RF:
            case DynamicValue.RFZ:
            case DynamicValue.SFFZ:
                velocity = MidiUtils.MinVelocity + 5 * MidiUtils.VelocityIncrement;
                break;

            // almost not hearable but still a value
            case DynamicValue.N:
                velocity = 1;
                break;
            // A bit weaker than standard F but stronger than MF
            case DynamicValue.PF:
                velocity = MidiUtils.MinVelocity + ((4.5 * MidiUtils.VelocityIncrement) | 0);
                break;
        }

        // 0 would means note-off (not played) so we need a minimum of 1 to have still a note played
        velocity += adjustment * MidiUtils.VelocityIncrement;
        return Math.min(Math.max(velocity, 1), 127);
    }
}
