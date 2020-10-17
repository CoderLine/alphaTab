import { Bar } from '@src/model/Bar';
import { Beat, BeatBeamingMode } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { Note } from '@src/model/Note';
import { Staff } from '@src/model/Staff';
import { Voice } from '@src/model/Voice';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { ModelUtils } from '@src/model/ModelUtils';
import { MidiUtils } from '@src/midi/MidiUtils';
import { AccidentalHelper } from './AccidentalHelper';
import { BarRendererBase, NoteYPosition } from '../BarRendererBase';

class BeatLinePositions {
    public staffId: string = '';
    public up: number = 0;
    public down: number = 0;
}

/**
 * This public class helps drawing beams and bars for notes.
 */
export class BeamingHelper {
    private _staff: Staff;
    private _beatLineXPositions: Map<number, BeatLinePositions> = new Map();
    private _renderer: BarRendererBase;

    public voice: Voice | null = null;
    public beats: Beat[] = [];
    public shortestDuration: Duration = Duration.QuadrupleWhole;

    /**
     * the number of fingering indicators that will be drawn
     */
    public fingeringCount: number = 0;

    /**
     * an indicator whether any beat has a tuplet on it.
     */
    public hasTuplet: boolean = false;

    private _firstBeatLowestNote: Note | null = null;
    private _firstBeatLowestNoteCompareValue: number = -1;

    private _firstBeatHighestNote: Note | null = null;
    private _firstBeatHighestNoteCompareValue: number = -1;

    private _lastBeatLowestNote: Note | null = null;
    private _lastBeatLowestNoteCompareValue: number = -1;

    private _lastBeatHighestNote: Note | null = null;
    private _lastBeatHighestNoteCompareValue: number = -1;

    private _lowestNoteInHelper: Note | null = null;
    private _lowestNoteCompareValueInHelper: number = -1;

    private _highestNoteInHelper: Note | null = null;
    private _highestNoteCompareValueInHelper: number = -1;

    public invertBeamDirection: boolean = false;
    public preferredBeamDirection: BeamDirection | null = null;
    public isGrace: boolean = false;

    public get hasLine(): boolean {
        return this.beats.length === 1 && this.beats[0].duration > Duration.Whole;
    }

    public get hasFlag(): boolean {
        return (
            this.beats.length === 1 &&
            (this.beats[0].duration > Duration.Quarter || this.beats[0].graceType !== GraceType.None)
        );
    }

    public constructor(staff: Staff, renderer: BarRendererBase) {
        this._staff = staff;
        this._renderer = renderer;
        this.beats = [];
    }

    public getBeatLineX(beat: Beat): number {
        if (this.hasBeatLineX(beat)) {
            if (this.direction === BeamDirection.Up) {
                return this._beatLineXPositions.get(beat.index)!.up;
            }
            return this._beatLineXPositions.get(beat.index)!.down;
        }
        return 0;
    }

    public hasBeatLineX(beat: Beat): boolean {
        return this._beatLineXPositions.has(beat.index);
    }

    public registerBeatLineX(staffId: string, beat: Beat, up: number, down: number): void {
        let positions: BeatLinePositions = this.getOrCreateBeatPositions(beat);
        positions.staffId = staffId;
        positions.up = up;
        positions.down = down;
    }

    private getOrCreateBeatPositions(beat: Beat): BeatLinePositions {
        if (!this._beatLineXPositions.has(beat.index)) {
            this._beatLineXPositions.set(beat.index, new BeatLinePositions());
        }
        return this._beatLineXPositions.get(beat.index)!;
    }

    public direction: BeamDirection = BeamDirection.Up;
    public finish(): void {
        this.direction = this.calculateDirection();
    }

    private calculateDirection(): BeamDirection {
        let preferredBeamDirection = this.preferredBeamDirection;
        if (preferredBeamDirection !== null) {
            return preferredBeamDirection;
        }

        if (!this.voice) {
            return BeamDirection.Up;
        }

        // multivoice handling
        if (this.voice.index > 0) {
            return this.invert(BeamDirection.Down);
        }
        if (this.voice.bar.voices.length > 1) {
            for (let v: number = 1; v < this.voice.bar.voices.length; v++) {
                if (!this.voice.bar.voices[v].isEmpty) {
                    return this.invert(BeamDirection.Up);
                }
            }
        }
        if (this.beats[0].graceType !== GraceType.None) {
            return this.invert(BeamDirection.Up);
        }

        // the average line is used for determination
        //      key lowerequal than middle line -> up
        //      key higher than middle line -> down
        const highestNotePosition = this._renderer.getNoteY(this._highestNoteInHelper!, NoteYPosition.Center);
        const lowestNotePosition = this._renderer.getNoteY(this._lowestNoteInHelper!, NoteYPosition.Center);
        const avg = (highestNotePosition + lowestNotePosition) / 2;

        return this.invert(this._renderer.middleYPosition < avg ? BeamDirection.Up : BeamDirection.Down);
    }

    private invert(direction: BeamDirection): BeamDirection {
        if (!this.invertBeamDirection) {
            return direction;
        }
        switch (direction) {
            case BeamDirection.Down:
                return BeamDirection.Up;
            case BeamDirection.Up:
            default:
                return BeamDirection.Down;
        }
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
                    add = BeamingHelper.canJoin(this.beats[this.beats.length - 1], beat);
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
            if (beat.preferredBeamDirection !== null) {
                this.preferredBeamDirection = beat.preferredBeamDirection;
            }

            this.beats.push(beat);
            if (beat.graceType !== GraceType.None) {
                this.isGrace = true;
            }
            if (beat.hasTuplet) {
                this.hasTuplet = true;
            }
            let fingeringCount: number = 0;
            for (let n: number = 0; n < beat.notes.length; n++) {
                let note: Note = beat.notes[n];
                if (note.leftHandFinger !== Fingers.Unknown || note.rightHandFinger !== Fingers.Unknown) {
                    fingeringCount++;
                }
            }
            if (fingeringCount > this.fingeringCount) {
                this.fingeringCount = fingeringCount;
            }
            this._lastBeatLowestNote = null;
            this._lastBeatHighestNote = null;
            this.checkNote(beat.minNote);
            this.checkNote(beat.maxNote);
            if (this.shortestDuration < beat.duration) {
                this.shortestDuration = beat.duration;
            }
            if (beat.hasTuplet) {
                this.hasTuplet = true;
            }
        }
        return add;
    }

    private checkNote(note: Note | null): void {
        if (!note) {
            return;
        }

        // a note can expand to 2 note heads if it has a harmonic
        let lowestValueForNote;
        let highestValueForNote;

        // For percussion we use the line as value to compare whether it is
        // higher or lower.
        if (this.voice && note.isPercussion) {
            lowestValueForNote = -AccidentalHelper.getPercussionLine(
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

        if (this.beats.length === 1 && this.beats[0] === note.beat) {
            if (!this._firstBeatLowestNote || lowestValueForNote < this._firstBeatLowestNoteCompareValue) {
                this._firstBeatLowestNote = note;
                this._firstBeatLowestNoteCompareValue = lowestValueForNote;
            }
            if (!this._firstBeatHighestNote || highestValueForNote > this._firstBeatHighestNoteCompareValue) {
                this._firstBeatHighestNote = note;
                this._firstBeatHighestNoteCompareValue = highestValueForNote;
            }
        }

        if (!this._lastBeatLowestNote || lowestValueForNote < this._lastBeatLowestNoteCompareValue) {
            this._lastBeatLowestNote = note;
            this._lastBeatLowestNoteCompareValue = lowestValueForNote;
        }

        if (!this._lastBeatHighestNote || highestValueForNote > this._lastBeatHighestNoteCompareValue) {
            this._lastBeatHighestNote = note;
            this._lastBeatHighestNoteCompareValue = highestValueForNote;
        }

        if (!this._lowestNoteInHelper || lowestValueForNote < this._lowestNoteCompareValueInHelper) {
            this._lowestNoteInHelper = note;
            this._lowestNoteCompareValueInHelper = lowestValueForNote;
        }
        if (!this._highestNoteInHelper || highestValueForNote > this._highestNoteCompareValueInHelper) {
            this._highestNoteInHelper = note;
            this._highestNoteCompareValueInHelper = highestValueForNote;
        }
    }

    
    // TODO: Check if this beaming is really correct, I'm not sure if we are connecting beats correctly
    private static canJoin(b1: Beat, b2: Beat): boolean {
        // is this a voice we can join with?
        if (
            !b1 ||
            !b2 ||
            b1.isRest ||
            b2.isRest ||
            b1.graceType !== b2.graceType ||
            b1.graceType === GraceType.BendGrace ||
            b2.graceType === GraceType.BendGrace
        ) {
            return false;
        }
        if (b1.graceType !== GraceType.None && b2.graceType !== GraceType.None) {
            return true;
        }
        let m1: Bar = b1.voice.bar;
        let m2: Bar = b1.voice.bar;
        // only join on same measure
        if (m1 !== m2) {
            return false;
        }
        // get times of those voices and check if the times
        // are in the same division
        let start1: number = b1.playbackStart;
        let start2: number = b2.playbackStart;
        // we can only join 8th, 16th, 32th and 64th voices
        if (!BeamingHelper.canJoinDuration(b1.duration) || !BeamingHelper.canJoinDuration(b2.duration)) {
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
        let division1: number = ((divisionLength + start1) / divisionLength) | 0 | 0;
        let division2: number = ((divisionLength + start2) / divisionLength) | 0 | 0;
        return division1 === division2;
    }

    private static canJoinDuration(d: Duration): boolean {
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
        // TODO: this getindex call seems expensive since we call this method very often.
        return ModelUtils.getIndex(a.duration) - 2 - barIndex > 0 && ModelUtils.getIndex(b.duration) - 2 - barIndex > 0;
    }

    public get beatOfLowestNote(): Beat {
        return this._lowestNoteInHelper!.beat;
    }

    public get beatOfHighestNote(): Beat {
        return this._highestNoteInHelper!.beat;
    }

    /**
     * Returns whether the the position of the given beat, was registered by the staff of the given ID
     * @param staffId
     * @param beat
     * @returns
     */
    public isPositionFrom(staffId: string, beat: Beat): boolean {
        if (!this._beatLineXPositions.has(beat.index)) {
            return true;
        }
        return (
            this._beatLineXPositions.get(beat.index)!.staffId === staffId ||
            !this._beatLineXPositions.get(beat.index)!.staffId
        );
    }
}
