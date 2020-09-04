import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { Note } from '@src/model/Note';
import { Staff } from '@src/model/Staff';
import { Voice } from '@src/model/Voice';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeatLinePositions } from '@src/rendering/utils/BeatLinePositions';
import { IBeamYCalculator } from '@src/rendering/utils/IBeamYCalculator';
import { ModelUtils } from '@src/model/ModelUtils';
import { MidiUtils } from '@src/midi/MidiUtils';
import { AccidentalHelper } from './AccidentalHelper';

/**
 * This public class helps drawing beams and bars for notes.
 */
export class BeamingHelper {
    private static ScoreMiddleKeys: number[] = [71, 60, 57, 50, 71];

    private _staff: Staff;
    private _beatLineXPositions: Map<number, BeatLinePositions> = new Map();
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

    /**
     * the first min note within this group
     */
    public firstMinNoteValue: number = -1;

    /**
     * the first max note within this group
     */
    public firstMaxNoteValue: number = -1;

    /**
     * the last min note within this group
     */
    public lastMinNoteValue: number = -1;

    /**
     * the last max note within this group
     */
    public lastMaxNoteValue: number = -1;

    /**
     * the overall min note value within this group.
     * This includes values caused by bends.
     */
    public minNoteValue: number = -1;

    public minNoteBeat: Beat | null = null;

    /**
     * the overall max note value within this group
     * This includes values caused by bends.
     */
    public maxNoteValue: number = 0;

    public maxNoteBeat: Beat | null = null;
    public invertBeamDirection: boolean = false;
    public preferredBeamDirection: BeamDirection | null = null;
    public isGrace: boolean = false;

    public get hasLine(): boolean {
        return this.beats.length === 1 && this.beats[0].duration > Duration.Whole;
    }

    public get hasFlag(): boolean {
        return this.beats.length === 1 &&
            (this.beats[0].duration > Duration.Quarter || this.beats[0].graceType != GraceType.None);
    }

    public constructor(staff: Staff) {
        this._staff = staff;
        this.beats = [];
    }

    private getMaxValue(n: Note): number {
        let value: number = AccidentalHelper.getNoteValue(n);
        if (n.harmonicType !== HarmonicType.None && n.harmonicType !== HarmonicType.Natural) {
            value = n.realValue - this._staff.displayTranspositionPitch;
        }
        return value;
    }

    private getMinValue(n: Note): number {
        return AccidentalHelper.getNoteValue(n);
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
        // the average key is used for determination
        //      key lowerequal than middle line -> up
        //      key higher than middle line -> down
        let avg: number = ((this.maxNoteValue + this.minNoteValue) / 2) | 0;
        return this.invert(
            avg < BeamingHelper.ScoreMiddleKeys[this.beats[this.beats.length - 1].voice.bar.clef]
                ? BeamDirection.Up
                : BeamDirection.Down
        );
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
        } else if (BeamingHelper.canJoin(this.beats[this.beats.length - 1], beat)) {
            add = true;
        }
        if (add) {
            if (beat.preferredBeamDirection !== null) {
                this.preferredBeamDirection = beat.preferredBeamDirection;
            }

            this.beats.push(beat);
            if (beat.graceType !== GraceType.None) {
                this.isGrace = true;
            }
            let positions: BeatLinePositions = this.getOrCreateBeatPositions(beat);
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
            this.lastMinNoteValue = -1;
            this.lastMaxNoteValue = -1;
            this.checkNote(beat.minNote);
            this.checkNote(beat.maxNote);
            positions.minNoteValue = this.lastMinNoteValue;
            positions.maxNoteValue = this.lastMaxNoteValue;
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

        let value: number = AccidentalHelper.getNoteValue(note);
        if (this.beats.length === 1 && this.beats[0] === note.beat) {
            if (this.firstMinNoteValue === -1 || value < this.firstMinNoteValue) {
                this.firstMinNoteValue = value;
            }
            if (this.firstMaxNoteValue === -1 || value > this.firstMaxNoteValue) {
                this.firstMaxNoteValue = value;
            }
        }
        if (this.lastMinNoteValue === -1 || value < this.lastMinNoteValue) {
            this.lastMinNoteValue = value;
        }
        if (this.lastMaxNoteValue === -1 || value > this.lastMaxNoteValue) {
            this.lastMaxNoteValue = value;
        }
        let minValue: number = this.getMinValue(note);
        if (this.minNoteValue === -1 || this.minNoteValue > minValue) {
            this.minNoteValue = minValue;
            this.minNoteBeat = note.beat;
        }
        let maxValue: number = this.getMaxValue(note);
        if (this.maxNoteValue === -1 || this.maxNoteValue < maxValue) {
            this.maxNoteValue = maxValue;
            this.maxNoteBeat = note.beat;
        }
    }

    public calculateBeamY(
        stemSize: number,
        xCorrection: number,
        xPosition: number,
        scale: number,
        yPosition: IBeamYCalculator
    ): number {
        return this.calculateBeamYWithDirection(stemSize, xCorrection, xPosition, scale, yPosition, this.direction);
    }

    public calculateBeamYWithDirection(
        stemSize: number,
        xCorrection: number,
        xPosition: number,
        scale: number,
        yPosition: IBeamYCalculator,
        direction: BeamDirection
    ): number {
        // create a line between the min and max note of the group
        if (this.beats.length === 1) {
            if (direction === BeamDirection.Up) {
                return yPosition.getYPositionForNoteValue(this.maxNoteValue) - stemSize;
            }
            return yPosition.getYPositionForNoteValue(this.minNoteValue) + stemSize;
        }
        // we use the min/max notes to place the beam along their real position
        // we only want a maximum of 10 offset for their gradient
        let maxDistance: number = 10 * scale;
        // if the min note is not first or last, we can align notes directly to the position
        // of the min note
        if (
            direction === BeamDirection.Down &&
            this.minNoteBeat !== this.beats[0] &&
            this.minNoteBeat !== this.beats[this.beats.length - 1]
        ) {
            return yPosition.getYPositionForNoteValue(this.minNoteValue) + stemSize;
        }
        if (
            direction === BeamDirection.Up &&
            this.maxNoteBeat !== this.beats[0] &&
            this.minNoteBeat !== this.beats[this.beats.length - 1]
        ) {
            return yPosition.getYPositionForNoteValue(this.maxNoteValue) - stemSize;
        }
        let startX: number = this.getBeatLineX(this.beats[0]) + xCorrection;
        let startY: number =
            direction === BeamDirection.Up
                ? yPosition.getYPositionForNoteValue(this.firstMaxNoteValue) - stemSize
                : yPosition.getYPositionForNoteValue(this.firstMinNoteValue) + stemSize;
        let endX: number = this.getBeatLineX(this.beats[this.beats.length - 1]) + xCorrection;
        let endY: number =
            direction === BeamDirection.Up
                ? yPosition.getYPositionForNoteValue(this.lastMaxNoteValue) - stemSize
                : yPosition.getYPositionForNoteValue(this.lastMinNoteValue) + stemSize;
        // ensure the maxDistance
        if (direction === BeamDirection.Down && startY > endY && startY - endY > maxDistance) {
            endY = startY - maxDistance;
        }
        if (direction === BeamDirection.Down && endY > startY && endY - startY > maxDistance) {
            startY = endY - maxDistance;
        }
        if (direction === BeamDirection.Up && startY < endY && endY - startY > maxDistance) {
            endY = startY + maxDistance;
        }
        if (direction === BeamDirection.Up && endY < startY && startY - endY > maxDistance) {
            startY = endY + maxDistance;
        }
        // get the y position of the given beat on this curve
        if (startX === endX) {
            return startY;
        }
        // y(x)  = ( (y2 - y1) / (x2 - x1) )  * (x - x1) + y1;
        return ((endY - startY) / (endX - startX)) * (xPosition - startX) + startY;
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

    public getBeatMinValue(beat: Beat): number {
        if (!this._beatLineXPositions.has(beat.index)) {
            return beat.minNote!.displayValue;
        }
        return this._beatLineXPositions.get(beat.index)!.minNoteValue;
    }

    public getBeatMaxValue(beat: Beat): number {
        if (!this._beatLineXPositions.has(beat.index)) {
            return beat.maxNote!.displayValue;
        }
        return this._beatLineXPositions.get(beat.index)!.maxNoteValue;
    }
}
