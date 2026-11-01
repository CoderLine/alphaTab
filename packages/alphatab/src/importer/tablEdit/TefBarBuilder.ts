import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Note } from '@coderline/alphatab/model/Note';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import type { Track } from '@coderline/alphatab/model/Track';
import { Voice } from '@coderline/alphatab/model/Voice';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * A raw grid cell of a TablEdit file.
 * @internal
 */
export class TefCell {
    /**
     * The grid position in 1/64 notes from the start of the piece.
     */
    public position: number = 0;
    /**
     * The string row counted over all instruments.
     */
    public row: number = 0;
    public data!: Uint8Array;
}

/**
 * @internal
 */
export class TefTrackInfo {
    public track!: Track;
    public firstString: number = 0;
    public stringCount: number = 0;
}

/**
 * The rhythmic value of a TablEdit duration code.
 * @internal
 */
class TefDuration {
    public duration: Duration;
    public dots: number;
    public tupletNumerator: number;
    public tupletDenominator: number;

    public constructor(duration: Duration, dots: number, tupletNumerator: number, tupletDenominator: number) {
        this.duration = duration;
        this.dots = dots;
        this.tupletNumerator = tupletNumerator;
        this.tupletDenominator = tupletDenominator;
    }

    public get isTuplet(): boolean {
        return this.tupletNumerator > 0;
    }

    /**
     * The length of the plain value in grid cells (1/64).
     */
    public get plainCells(): number {
        return 64 / (this.duration as number);
    }

    /**
     * The real length in sub-units.
     */
    public get length(): number {
        let length = this.plainCells * TefBarBuilder.subUnitsPerCell;
        if (this.dots === 1) {
            length = (length * 3) / 2;
        } else if (this.dots === 2) {
            length = (length * 7) / 4;
        }
        if (this.isTuplet) {
            length = (length * this.tupletDenominator) / this.tupletNumerator;
        }
        return length;
    }
}

/**
 * A decoded note or rest event.
 * @internal
 */
class TefEvent {
    public cell!: TefCell;
    public isRest: boolean = false;
    public stringIndex: number = 0;
    public fret: number = 0;
    public durationCode: number = 0;
    public dynamics: number = 0;
    public isTied: boolean = false;
    public voiceHint: number = 0;
    public accidental: number = 0;
    public bar: number = 0;
    /**
     * The grid column within the bar, in cells.
     */
    public column: number = 0;
    public realStart: number = 0;
    public realEnd: number = 0;
    public lane: number = -1;
}

/**
 * Notes of one voice sounding with the same start and length.
 * @internal
 */
class TefUnit {
    public events: TefEvent[] = [];
    public start: number = 0;
    public end: number = 0;
    public bar: number = 0;
    public isRest: boolean = false;
    public duration: TefDuration | null = null;
    public voiceGroup: number = 0;
    public lane: number = -1;
}

/**
 * Builds the bars, voices and beats of each track from the TablEdit grid.
 * @internal
 */
export class TefBarBuilder {
    /**
     * Sub-units per grid cell. 2520 is the least common multiple of 1..10,
     * which keeps the members of every tuplet kind on whole sub-units.
     */
    public static readonly subUnitsPerCell = 2520;

    private static readonly _restCode = 0x33;
    private static readonly _tieDynamics = 7;
    private static readonly _upperVoice = 2;
    private static readonly _lowerVoice = 3;

    private _tracks: TefTrackInfo[];
    private _measureStarts: number[];
    private _measureSizes: number[];

    public constructor(tracks: TefTrackInfo[], measureStarts: number[], measureSizes: number[]) {
        this._tracks = tracks;
        this._measureStarts = measureStarts;
        this._measureSizes = measureSizes;
    }

    public build(cells: TefCell[]): void {
        for (const info of this._tracks) {
            const events: TefEvent[] = [];
            for (const cell of cells) {
                if (cell.row >= info.firstString && cell.row < info.firstString + info.stringCount) {
                    const e = this._decode(cell, info);
                    if (e) {
                        events.push(e);
                    }
                }
            }
            this._buildTrack(info, events);
        }
    }

    private _decode(cell: TefCell, info: TefTrackInfo): TefEvent | null {
        const type = cell.data[0] & 0x3f;
        if (type > TefBarBuilder._restCode) {
            return null;
        }
        const code = cell.data[1] & 0x1f;
        if (!TefBarBuilder._durationOf(code)) {
            return null;
        }
        const e = new TefEvent();
        e.cell = cell;
        e.isRest = type === TefBarBuilder._restCode;
        e.stringIndex = cell.row - info.firstString;
        e.fret = type - 1;
        e.durationCode = code;
        e.dynamics = cell.data[1] >> 5;
        e.isTied = !e.isRest && e.dynamics === TefBarBuilder._tieDynamics;
        e.voiceHint = (cell.data[2] >> 4) & 0x03;
        e.accidental = cell.data[2] >> 6;
        e.bar = this._barOf(cell.position);
        e.column = cell.position - this._measureStarts[e.bar];
        return e;
    }

    private _barOf(position: number): number {
        let lo = 0;
        let hi = this._measureStarts.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (this._measureStarts[mid] <= position) {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        return lo;
    }

    private static _durationOf(code: number): TefDuration | null {
        switch (code) {
            case 0:
                return new TefDuration(Duration.Whole, 0, -1, -1);
            case 1:
                return new TefDuration(Duration.Half, 1, -1, -1);
            case 2:
                return new TefDuration(Duration.Whole, 0, 3, 2);
            case 3:
                return new TefDuration(Duration.Half, 0, -1, -1);
            case 4:
                return new TefDuration(Duration.Quarter, 1, -1, -1);
            case 5:
                return new TefDuration(Duration.Half, 0, 3, 2);
            case 6:
                return new TefDuration(Duration.Quarter, 0, -1, -1);
            case 7:
                return new TefDuration(Duration.Eighth, 1, -1, -1);
            case 8:
                return new TefDuration(Duration.Quarter, 0, 3, 2);
            case 9:
                return new TefDuration(Duration.Eighth, 0, -1, -1);
            case 10:
                return new TefDuration(Duration.Sixteenth, 1, -1, -1);
            case 11:
                return new TefDuration(Duration.Eighth, 0, 3, 2);
            case 12:
                return new TefDuration(Duration.Sixteenth, 0, -1, -1);
            case 13:
                return new TefDuration(Duration.ThirtySecond, 1, -1, -1);
            case 14:
                return new TefDuration(Duration.Sixteenth, 0, 3, 2);
            case 15:
                return new TefDuration(Duration.ThirtySecond, 0, -1, -1);
            case 16:
                return new TefDuration(Duration.SixtyFourth, 1, -1, -1);
            case 17:
                return new TefDuration(Duration.ThirtySecond, 0, 3, 2);
            case 18:
                return new TefDuration(Duration.SixtyFourth, 0, -1, -1);
            case 19:
                return new TefDuration(Duration.Half, 2, -1, -1);
            case 20:
                return new TefDuration(Duration.Sixteenth, 0, 5, 4);
            case 22:
                return new TefDuration(Duration.Quarter, 2, -1, -1);
            case 23:
                return new TefDuration(Duration.Sixteenth, 0, 7, 4);
            case 25:
                return new TefDuration(Duration.Eighth, 2, -1, -1);
            case 26:
                return new TefDuration(Duration.ThirtySecond, 0, 9, 8);
            case 28:
                return new TefDuration(Duration.Sixteenth, 2, -1, -1);
            case 29:
                return new TefDuration(Duration.ThirtySecond, 0, 10, 8);
            case 31:
                return new TefDuration(Duration.Whole, 1, -1, -1);
        }
        return null;
    }

    private _buildTrack(info: TefTrackInfo, events: TefEvent[]): void {
        const staff = info.track.staves[0];
        const barCount = this._measureStarts.length;
        events.sort((a, b) => {
            if (a.cell.position !== b.cell.position) {
                return a.cell.position - b.cell.position;
            }
            return a.cell.row - b.cell.row;
        });

        for (let i = 0; i < barCount; i++) {
            const bar = new Bar();
            staff.addBar(bar);
        }

        const units: TefUnit[] = [];
        for (let b = 0; b < barCount; b++) {
            const barEvents: TefEvent[] = [];
            for (const e of events) {
                if (e.bar === b) {
                    barEvents.push(e);
                }
            }
            for (let group = 0; group < 3; group++) {
                const groupEvents: TefEvent[] = [];
                for (const e of barEvents) {
                    if (TefBarBuilder._voiceGroupOf(e) === group) {
                        groupEvents.push(e);
                    }
                }
                if (groupEvents.length > 0) {
                    this._assignRealTime(groupEvents, b, info.track);
                    TefBarBuilder._collectUnits(groupEvents, group, b, units);
                }
            }
        }

        const laneCounts = this._assignLanes(units);
        this._createVoices(info, units, laneCounts);
    }

    /**
     * 0 = automatic, 1 = upper, 2 = lower.
     */
    private static _voiceGroupOf(e: TefEvent): number {
        switch (e.voiceHint) {
            case TefBarBuilder._upperVoice:
                return 1;
            case TefBarBuilder._lowerVoice:
                return 2;
        }
        return 0;
    }

    /**
     * Converts the grid columns of a bar and voice into real time. Tuplet members are stored
     * closer together than they sound and are spread out again relative to an anchor:
     * triplets relative to the beat of the first member of a run, other tuplets relative to
     * the beat they are in.
     */
    private _assignRealTime(events: TefEvent[], barIndex: number, track: Track): void {
        const unit = TefBarBuilder.subUnitsPerCell;
        const barEnd = this._measureSizes[barIndex] * unit;
        const beat = TefBarBuilder._beatCells(track.score.masterBars[barIndex], this._measureSizes[barIndex]);
        let runCode = -1;
        let runAnchor = 0;
        for (const e of events) {
            const d = TefBarBuilder._durationOf(e.durationCode)!;
            const column = e.column;
            let start = column * unit;
            if (TefBarBuilder._isTriplet(e.durationCode)) {
                if (runCode !== e.durationCode) {
                    runCode = e.durationCode;
                    runAnchor = column - (column % beat);
                }
                const span = TefBarBuilder._tripletSpan(e.durationCode);
                start = column * unit + ((((column - runAnchor) % span) + span) % span) * (unit / 3);
            } else {
                runCode = -1;
                if (d.isTuplet) {
                    const anchor = column - (column % beat);
                    start = anchor * unit + (column - anchor) * TefBarBuilder._tupletStretch(e.durationCode, unit);
                }
            }
            e.realStart = start;
            e.realEnd = start + d.length;
            if (e.realEnd > barEnd) {
                e.realEnd = barEnd;
            }
        }
    }

    private static _isTriplet(code: number): boolean {
        return code === 5 || code === 8 || code === 11 || code === 14 || code === 17;
    }

    /**
     * The window (in cells) after which the stretching of a triplet run starts over:
     * the plain value two levels longer than the triplet member.
     */
    private static _tripletSpan(code: number): number {
        return 64 / Math.pow(2, (code - 5) / 3);
    }

    /**
     * Real sub-units per grid cell for the members of the other tuplet kinds.
     */
    private static _tupletStretch(code: number, unit: number): number {
        switch (code) {
            case 23:
                return (unit * 8) / 7;
            case 26:
                return (unit * 16) / 9;
        }
        return (unit * 8) / 5;
    }

    private static _beatCells(masterBar: MasterBar, size: number): number {
        const denominator = masterBar.timeSignatureDenominator;
        let beat = 64 / denominator;
        if (size % 3 === 0 && denominator > 4) {
            beat = (3 * 64) / denominator;
        }
        if (beat < 9) {
            beat = size % 16 === 0 ? 16 : size;
        }
        return beat;
    }

    private static _collectUnits(events: TefEvent[], group: number, bar: number, units: TefUnit[]): void {
        const byKey = new Map<string, TefUnit>();
        for (const e of events) {
            const key = `${e.isRest}:${e.realStart}:${e.realEnd}:${e.durationCode}`;
            let unit = byKey.get(key);
            if (!unit) {
                unit = new TefUnit();
                unit.start = e.realStart;
                unit.end = e.realEnd;
                unit.bar = bar;
                unit.isRest = e.isRest;
                unit.voiceGroup = group;
                const d = TefBarBuilder._durationOf(e.durationCode)!;
                if (d.length === e.realEnd - e.realStart) {
                    unit.duration = d;
                }
                byKey.set(key, unit);
                units.push(unit);
            }
            unit.events.push(e);
        }
    }

    /**
     * Places every unit into a lane of its voice group so that no lane holds overlapping units.
     * Ties stay in the lane of the note they continue, since alphaTab resolves them along a voice.
     */
    private _assignLanes(units: TefUnit[]): number[] {
        const cell = TefBarBuilder.subUnitsPerCell;
        const absolute = (u: TefUnit, t: number) => this._measureStarts[u.bar] * cell + t;
        units.sort((a, b) => {
            const sa = absolute(a, a.start);
            const sb = absolute(b, b.start);
            if (sa !== sb) {
                return sa - sb;
            }
            if (a.isRest !== b.isRest) {
                return a.isRest ? 1 : -1;
            }
            return a.end - a.start - (b.end - b.start);
        });

        const laneEnds: number[][] = [[], [], []];
        const lastOnString = new Map<number, TefEvent>();
        for (const u of units) {
            const ends = laneEnds[u.voiceGroup];
            const start = absolute(u, u.start);
            let preferred = -1;
            for (const e of u.events) {
                if (e.isTied) {
                    const origin = lastOnString.get(e.stringIndex);
                    if (origin && origin.lane >= 0) {
                        preferred = origin.lane;
                        break;
                    }
                }
            }
            let lane = -1;
            if (preferred >= 0 && (preferred >= ends.length || ends[preferred] <= start)) {
                lane = preferred;
            } else {
                for (let l = 0; l < ends.length; l++) {
                    if (ends[l] <= start) {
                        lane = l;
                        break;
                    }
                }
            }
            if (u.isRest && lane !== 0 && !(ends.length === 0)) {
                continue;
            }
            if (lane < 0) {
                lane = ends.length;
            }
            while (ends.length <= lane) {
                ends.push(0);
            }
            ends[lane] = absolute(u, u.end);
            u.lane = lane;
            for (const e of u.events) {
                e.lane = lane;
                if (!e.isRest) {
                    lastOnString.set(e.stringIndex, e);
                }
            }
        }
        return [laneEnds[0].length, laneEnds[1].length, laneEnds[2].length];
    }

    private _createVoices(info: TefTrackInfo, units: TefUnit[], laneCounts: number[]): void {
        const staff = info.track.staves[0];
        // upper voices first, then lower ones, keeping alphaTab's stem convention for voice 0 and 1
        const order: number[][] = [];
        const maxLanes = Math.max(laneCounts[0], laneCounts[1], laneCounts[2]);
        for (let l = 0; l < maxLanes; l++) {
            for (const group of [1, 0, 2]) {
                if (l < laneCounts[group]) {
                    order.push([group, l]);
                }
            }
        }
        if (order.length === 0) {
            order.push([0, 0]);
        }

        for (let b = 0; b < staff.bars.length; b++) {
            const bar = staff.bars[b];
            const barLength = this._measureSizes[b] * TefBarBuilder.subUnitsPerCell;
            for (let v = 0; v < order.length; v++) {
                const [group, lane] = order[v];
                const voice = new Voice();
                bar.addVoice(voice);
                const laneUnits: TefUnit[] = [];
                for (const u of units) {
                    if (u.bar === b && u.voiceGroup === group && u.lane === lane) {
                        laneUnits.push(u);
                    }
                }
                laneUnits.sort((x, y) => x.start - y.start);
                this._fillVoice(info, voice, laneUnits, barLength, group);
                if (voice.beats.length === 0) {
                    bar.voices.pop();
                    ModelUtils.appendPlaceholderVoice(bar);
                }
            }
        }
    }

    private _fillVoice(info: TefTrackInfo, voice: Voice, units: TefUnit[], barLength: number, group: number): void {
        let cursor = 0;
        let hasContent = false;
        for (let i = 0; i < units.length; i++) {
            const u = units[i];
            if (u.start < cursor) {
                continue;
            }
            if (u.start > cursor) {
                this._addRests(voice, cursor, u.start, u.duration);
            }
            let end = u.end;
            if (i + 1 < units.length && units[i + 1].start < end) {
                end = units[i + 1].start;
            }
            if (end > barLength) {
                end = barLength;
            }
            const values =
                u.duration && end - u.start === u.duration.length
                    ? [u.duration]
                    : TefBarBuilder._splitPlain(u.start, end);
            for (let k = 0; k < values.length; k++) {
                const beat = TefBarBuilder._createBeat(values[k]);
                voice.addBeat(beat);
                if (group !== 0) {
                    beat.preferredBeamDirection = group === 1 ? BeamDirection.Up : BeamDirection.Down;
                }
                if (!u.isRest) {
                    this._addNotes(info, beat, u, k > 0);
                }
            }
            hasContent = true;
            cursor = end;
        }
        if (hasContent && cursor < barLength) {
            this._addRests(voice, cursor, barLength, null);
        }
    }

    private _addRests(voice: Voice, start: number, end: number, next: TefDuration | null): void {
        const values =
            next && next.isTuplet && (end - start) % next.length === 0
                ? TefBarBuilder._repeat(next, (end - start) / next.length)
                : TefBarBuilder._splitPlain(start, end);
        for (const v of values) {
            voice.addBeat(TefBarBuilder._createBeat(v));
        }
    }

    private static _repeat(d: TefDuration, count: number): TefDuration[] {
        const values: TefDuration[] = [];
        for (let i = 0; i < count; i++) {
            values.push(d);
        }
        return values;
    }

    /**
     * Splits a stretch of real time into plain values aligned to their own length.
     */
    private static _splitPlain(start: number, end: number): TefDuration[] {
        const cell = TefBarBuilder.subUnitsPerCell;
        const values: TefDuration[] = [];
        let t = start;
        while (end - t >= cell) {
            let cells = 64;
            while (cells > 1 && ((t / cell) % cells !== 0 || t + cells * cell > end)) {
                cells = cells / 2;
            }
            values.push(new TefDuration((64 / cells) as Duration, 0, -1, -1));
            t += cells * cell;
        }
        return values;
    }

    private static _createBeat(d: TefDuration): Beat {
        const beat = new Beat();
        beat.duration = d.duration;
        beat.dots = d.dots;
        if (d.isTuplet) {
            beat.tupletNumerator = d.tupletNumerator;
            beat.tupletDenominator = d.tupletDenominator;
        }
        return beat;
    }

    private _addNotes(info: TefTrackInfo, beat: Beat, unit: TefUnit, isContinuation: boolean): void {
        let loudest = 7;
        for (const e of unit.events) {
            const note = new Note();
            note.string = info.stringCount - e.stringIndex;
            note.fret = e.fret;
            note.isTieDestination = e.isTied || isContinuation;
            switch (e.accidental) {
                case 1:
                    note.accidentalMode = NoteAccidentalMode.ForceSharp;
                    break;
                case 2:
                    note.accidentalMode = NoteAccidentalMode.ForceFlat;
                    break;
                case 3:
                    note.accidentalMode = NoteAccidentalMode.ForceNatural;
                    break;
            }
            if (!e.isTied && e.dynamics < loudest) {
                loudest = e.dynamics;
            }
            beat.addNote(note);
        }
        if (loudest < 7) {
            beat.dynamics = TefBarBuilder._dynamicsOf(loudest);
            beat.showDynamics = false;
        }
    }

    private static _dynamicsOf(value: number): DynamicValue {
        switch (value) {
            case 0:
                return DynamicValue.FFF;
            case 1:
                return DynamicValue.FF;
            case 2:
                return DynamicValue.F;
            case 3:
                return DynamicValue.MF;
            case 4:
                return DynamicValue.MP;
            case 5:
                return DynamicValue.P;
        }
        return DynamicValue.PP;
    }
}
