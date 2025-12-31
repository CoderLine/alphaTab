import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import type { Bar } from '@coderline/alphatab/model/Bar';
import { type Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Voice } from '@coderline/alphatab/model/Voice';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import type { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';


/**
 * @internal
 */
export class BeamingHelperDrawInfo {
    public startBeat: Beat | null = null;
    public startX: number = 0;
    public startY: number = 0;

    public endBeat: Beat | null = null;
    public endX: number = 0;
    public endY: number = 0;

    //
    /**
     * calculates the Y-position given a X-pos using the current start end point
     * @param x
     */
    public calcY(x: number): number {
        // get the y position of the given beat on this curve
        if (this.startX === this.endX) {
            return this.startY;
        }

        // y(x)  = ( (y2 - y1) / (x2 - x1) )  * (x - x1) + y1;
        return ((this.endY - this.startY) / (this.endX - this.startX)) * (x - this.startX) + this.startY;
    }
}

/**
 * This public class helps drawing beams and bars for notes.
 * @internal
 */
export class BeamingHelper {
    private _staff: Staff;
    private _renderer: BarRendererBase;

    public voice: Voice | null = null;
    public beats: Beat[] = [];
    public shortestDuration: Duration = Duration.QuadrupleWhole;
    public tremoloDuration?: Duration;

    /**
     * an indicator whether any beat has a tuplet on it.
     */
    public hasTuplet: boolean = false;

    public slashBeats: Beat[] = [];
    public restBeats: Beat[] = [];

    public lowestNoteInHelper: Note | null = null;
    private _lowestNoteCompareValueInHelper: number = -1;

    public highestNoteInHelper: Note | null = null;
    private _highestNoteCompareValueInHelper: number = -1;

    public invertBeamDirection: boolean = false;
    public preferredBeamDirection: BeamDirection | null = null;
    public graceType: GraceType = GraceType.None;

    public get isRestBeamHelper(): boolean {
        return this.beats.length === 1 && this.beats[0].isRest;
    }

    public hasStem(forceFlagOnSingleBeat: boolean, beat?: Beat): boolean {
        return (
            (forceFlagOnSingleBeat && BeamingHelper.beatHasStem(beat!)) ||
            (!forceFlagOnSingleBeat && BeamingHelper.beatHasStem(beat!))
        );
    }

    public static beatHasStem(beat: Beat): boolean {
        return beat!.duration > Duration.Whole;
    }

    public hasFlag(forceFlagOnSingleBeat: boolean, beat?: Beat): boolean {
        return (
            (forceFlagOnSingleBeat && BeamingHelper.beatHasFlag(beat!)) ||
            (!forceFlagOnSingleBeat && this.beats.length === 1 && BeamingHelper.beatHasFlag(this.beats[0]))
        );
    }

    public static beatHasFlag(beat: Beat) {
        return (
            !beat.deadSlapped && !beat.isRest && (beat.duration > Duration.Quarter || beat.graceType !== GraceType.None)
        );
    }

    public constructor(staff: Staff, renderer: BarRendererBase) {
        this._staff = staff;
        this._renderer = renderer;
        this.beats = [];
    }

    public alignWithBeats() {
        for (const v of this.drawingInfos.values()) {
            v.startX = this._renderer.getBeatX(v.startBeat!, BeatXPosition.Stem);
            v.endX = this._renderer.getBeatX(v.endBeat!, BeatXPosition.Stem);
            this.drawingInfos.clear();
        }
    }

    public finish(): void {
        this._renderer.completeBeamingHelper(this);
    }


    public static computeLineHeightsForRest(duration: Duration): number[] {
        switch (duration) {
            case Duration.QuadrupleWhole:
                return [2, 2];
            case Duration.DoubleWhole:
                return [2, 2];
            case Duration.Whole:
                return [0, 1];
            case Duration.Half:
                return [1, 0];
            case Duration.Quarter:
                return [3, 3];
            case Duration.Eighth:
                return [2, 2];
            case Duration.Sixteenth:
                return [2, 4];
            case Duration.ThirtySecond:
                return [4, 4];
            case Duration.SixtyFourth:
                return [4, 6];
            case Duration.OneHundredTwentyEighth:
                return [6, 6];
            case Duration.TwoHundredFiftySixth:
                return [6, 8];
        }
        return [0, 0];
    }

    public checkBeat(beat: Beat): boolean {
        if (beat.invertBeamDirection) {
            this.invertBeamDirection = true;
        }
        if (!this.voice) {
            this.voice = beat.voice;
        }

        // allow adding if there are no beats yet
        let add: boolean = false;
        if (this.beats.length === 0) {
            add = true;
        } else {
            switch (this.beats[this.beats.length - 1].beamingMode) {
                case BeatBeamingMode.Auto:
                case BeatBeamingMode.ForceSplitOnSecondaryToNext:
                    add = BeamingHelper._canJoin(this.beats[this.beats.length - 1], beat);
                    break;
                case BeatBeamingMode.ForceSplitToNext:
                    add = false;
                    break;
                case BeatBeamingMode.ForceMergeWithNext:
                    add = true;
                    break;
            }
        }

        if (add) {
            if (this.preferredBeamDirection == null && beat.preferredBeamDirection !== null) {
                this.preferredBeamDirection = beat.preferredBeamDirection;
            }

            if (beat.hasTuplet) {
                this.hasTuplet = true;
            }

            if (beat.isTremolo) {
                if (!this.tremoloDuration || this.tremoloDuration < beat.tremoloSpeed!) {
                    this.tremoloDuration = beat.tremoloSpeed!;
                }
            }

            if (beat.graceType !== GraceType.None) {
                this.graceType = beat.graceType;
            }

            if (!beat.isRest) {
                if (this.isRestBeamHelper) {
                    this.beats = [];
                }
                this.beats.push(beat);
                this._checkNote(beat.minNote);
                this._checkNote(beat.maxNote);
                if (this.shortestDuration < beat.duration) {
                    this.shortestDuration = beat.duration;
                }
            } else if (this.beats.length === 0) {
                this.beats.push(beat);
            } else {
                this.restBeats.push(beat);
            }

            if (beat.slashed) {
                this.slashBeats.push(beat);
            }
        }
        return add;
    }

    private _checkNote(note: Note | null): void {
        if (!note) {
            return;
        }

        // a note can expand to 2 note heads if it has a harmonic
        let lowestValueForNote: number;
        let highestValueForNote: number;

        // For percussion we use the line as value to compare whether it is
        // higher or lower.
        if (this.voice && note.isPercussion) {
            lowestValueForNote = -AccidentalHelper.getPercussionSteps(
                this.voice.bar,
                AccidentalHelper.getNoteValue(note)
            );
            highestValueForNote = lowestValueForNote;
        } else {
            lowestValueForNote = AccidentalHelper.getNoteValue(note);
            highestValueForNote = lowestValueForNote;
            if (note.harmonicType !== HarmonicType.None && note.harmonicType !== HarmonicType.Natural) {
                highestValueForNote = note.realValue - this._staff.displayTranspositionPitch;
            }
        }

        if (!this.lowestNoteInHelper || lowestValueForNote < this._lowestNoteCompareValueInHelper) {
            this.lowestNoteInHelper = note;
            this._lowestNoteCompareValueInHelper = lowestValueForNote;
        }
        if (!this.highestNoteInHelper || highestValueForNote > this._highestNoteCompareValueInHelper) {
            this.highestNoteInHelper = note;
            this._highestNoteCompareValueInHelper = highestValueForNote;
        }
    }

    // TODO: Check if this beaming is really correct, I'm not sure if we are connecting beats correctly
    private static _canJoin(b1: Beat, b2: Beat): boolean {
        // is this a voice we can join with?
        if (
            !b1 ||
            !b2 ||
            b1.graceType !== b2.graceType ||
            b1.graceType === GraceType.BendGrace ||
            b2.graceType === GraceType.BendGrace ||
            b1.deadSlapped ||
            b2.deadSlapped
        ) {
            return false;
        }
        if (b1.graceType !== GraceType.None && b2.graceType !== GraceType.None) {
            return true;
        }
        const m1: Bar = b1.voice.bar;
        const m2: Bar = b2.voice.bar;
        // only join on same measure
        if (m1 !== m2) {
            return false;
        }
        // get times of those voices and check if the times
        // are in the same division
        const start1: number = b1.playbackStart;
        const start2: number = b2.playbackStart;
        // we can only join 8th, 16th, 32th and 64th voices
        if (!BeamingHelper._canJoinDuration(b1.duration) || !BeamingHelper._canJoinDuration(b2.duration)) {
            return start1 === start2;
        }
        // break between different tuplet groups
        if (b1.tupletGroup !== b2.tupletGroup) {
            return false;
        }
        if (b1.hasTuplet && b2.hasTuplet) {
            // force joining for full tuplet groups
            if (b1.tupletGroup === b2.tupletGroup && b1.tupletGroup!.isFull) {
                return true;
            }
        }
        // TODO: create more rules for automatic beaming
        let divisionLength: number = MidiUtils.QuarterTime;
        switch (m1.masterBar.timeSignatureDenominator) {
            case 8:
                if (m1.masterBar.timeSignatureNumerator % 3 === 0) {
                    divisionLength += (MidiUtils.QuarterTime / 2) | 0;
                }
                break;
        }
        // check if they are on the same division
        const division1: number = ((divisionLength + start1) / divisionLength) | 0 | 0;
        const division2: number = ((divisionLength + start2) / divisionLength) | 0 | 0;
        return division1 === division2;
    }

    private static _canJoinDuration(d: Duration): boolean {
        switch (d) {
            case Duration.Whole:
            case Duration.Half:
            case Duration.Quarter:
                return false;
            default:
                return true;
        }
    }

    public static isFullBarJoin(a: Beat, b: Beat, barIndex: number): boolean {
        return ModelUtils.getIndex(a.duration) - 2 - barIndex > 0 && ModelUtils.getIndex(b.duration) - 2 - barIndex > 0;
    }

    public get beatOfLowestNote(): Beat {
        return this.lowestNoteInHelper!.beat;
    }

    public get beatOfHighestNote(): Beat {
        return this.highestNoteInHelper!.beat;
    }

    public drawingInfos: Map<BeamDirection, BeamingHelperDrawInfo> = new Map<BeamDirection, BeamingHelperDrawInfo>();
}
