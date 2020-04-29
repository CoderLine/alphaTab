import { GeneralMidi } from '@src/audio/util/GeneralMidi';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Fingers } from '@src/model/Fingers';
import { Score } from '@src/model/Score';
import { FingeringMode } from '@src/NotationSettings';
import { Platform } from '@src/platform/Platform';
import { Settings } from '@src/Settings';

export class TuningParseResult {
    public note: string | null = null;
    public noteValue: number = 0;
    public octave: number = 0;

    public get realValue(): number {
        return this.octave * 12 + this.noteValue;
    }
}

/**
 * This public class contains some utilities for working with model public classes
 */
export class ModelUtils {
    public static getIndex(duration: Duration): number {
        let index: number = 0;
        let value: number = duration;
        if (value < 0) {
            return index;
        }
        return Math.log2(duration) | 0;
    }

    public static keySignatureIsFlat(ks: number): boolean {
        return ks < 0;
    }

    public static keySignatureIsNatural(ks: number): boolean {
        return ks === 0;
    }

    public static keySignatureIsSharp(ks: number): boolean {
        return ks > 0;
    }

    public static applyPitchOffsets(settings: Settings, score: Score): void {
        for (let i: number = 0; i < score.tracks.length; i++) {
            if (i < settings.notation.displayTranspositionPitches.length) {
                for (let staff of score.tracks[i].staves) {
                    staff.displayTranspositionPitch = -settings.notation.displayTranspositionPitches[i];
                }
            }
            if (i < settings.notation.transpositionPitches.length) {
                for (let staff of score.tracks[i].staves) {
                    staff.transpositionPitch = -settings.notation.transpositionPitches[i];
                }
            }
        }
    }

    public static fingerToString(settings: Settings, beat: Beat, finger: Fingers, leftHand: boolean): string | null {
        if (
            settings.notation.fingeringMode === FingeringMode.ScoreForcePiano ||
            settings.notation.fingeringMode === FingeringMode.SingleNoteEffectBandForcePiano ||
            GeneralMidi.isPiano(beat.voice.bar.staff.track.playbackInfo.program)
        ) {
            switch (finger) {
                case Fingers.Unknown:
                case Fingers.NoOrDead:
                    return null;
                case Fingers.Thumb:
                    return '1';
                case Fingers.IndexFinger:
                    return '2';
                case Fingers.MiddleFinger:
                    return '3';
                case Fingers.AnnularFinger:
                    return '4';
                case Fingers.LittleFinger:
                    return '5';
                default:
                    return null;
            }
        }
        if (leftHand) {
            switch (finger) {
                case Fingers.Unknown:
                case Fingers.NoOrDead:
                    return '0';
                case Fingers.Thumb:
                    return 'T';
                case Fingers.IndexFinger:
                    return '1';
                case Fingers.MiddleFinger:
                    return '2';
                case Fingers.AnnularFinger:
                    return '3';
                case Fingers.LittleFinger:
                    return '4';
                default:
                    return null;
            }
        }
        switch (finger) {
            case Fingers.Unknown:
            case Fingers.NoOrDead:
                return null;
            case Fingers.Thumb:
                return 'p';
            case Fingers.IndexFinger:
                return 'i';
            case Fingers.MiddleFinger:
                return 'm';
            case Fingers.AnnularFinger:
                return 'a';
            case Fingers.LittleFinger:
                return 'c';
            default:
                return null;
        }
    }

    /**
     * Checks if the given string is a tuning inticator.
     * @param name
     * @returns
     */
    public static isTuning(name: string): boolean {
        return !!ModelUtils.parseTuning(name);
    }

    public static parseTuning(name: string): TuningParseResult | null {
        let note: string = '';
        let octave: string = '';
        for (let i: number = 0; i < name.length; i++) {
            let c: number = name.charCodeAt(i);
            if (Platform.isCharNumber(c, false)) {
                // number without note?
                if (!note) {
                    return null;
                }
                octave += String.fromCharCode(c);
            } else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || c === 0x23) {
                note += String.fromCharCode(c);
            } else {
                return null;
            }
        }
        if (!octave || !note) {
            return null;
        }
        let result: TuningParseResult = new TuningParseResult();
        result.octave = parseInt(octave) + 1;
        result.note = note.toLowerCase();
        result.noteValue = ModelUtils.getToneForText(result.note);
        return result;
    }

    public static getTuningForText(str: string): number {
        let result: TuningParseResult | null = ModelUtils.parseTuning(str);
        if (!result) {
            return -1;
        }
        return result.realValue;
    }

    public static getToneForText(note: string): number {
        let b: number = 0;
        switch (note.toLowerCase()) {
            case 'c':
                b = 0;
                break;
            case 'c#':
            case 'db':
                b = 1;
                break;
            case 'd':
                b = 2;
                break;
            case 'd#':
            case 'eb':
                b = 3;
                break;
            case 'e':
                b = 4;
                break;
            case 'f':
                b = 5;
                break;
            case 'f#':
            case 'gb':
                b = 6;
                break;
            case 'g':
                b = 7;
                break;
            case 'g#':
            case 'ab':
                b = 8;
                break;
            case 'a':
                b = 9;
                break;
            case 'a#':
            case 'bb':
                b = 10;
                break;
            case 'b':
                b = 11;
                break;
            default:
                return 0;
        }
        return b;
    }
}
