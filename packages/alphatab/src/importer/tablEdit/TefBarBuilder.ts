import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { Automation, AutomationType } from '@coderline/alphatab/model/Automation';
import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat } from '@coderline/alphatab/model/Beat';
import { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import type { Chord } from '@coderline/alphatab/model/Chord';
import { Clef } from '@coderline/alphatab/model/Clef';
import { CrescendoType } from '@coderline/alphatab/model/CrescendoType';
import { Duration } from '@coderline/alphatab/model/Duration';
import { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import { FadeType } from '@coderline/alphatab/model/FadeType';
import { Fermata, FermataType } from '@coderline/alphatab/model/Fermata';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { HarmonicType } from '@coderline/alphatab/model/HarmonicType';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Note } from '@coderline/alphatab/model/Note';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { NoteOrnament } from '@coderline/alphatab/model/NoteOrnament';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import { Rasgueado } from '@coderline/alphatab/model/Rasgueado';
import { SlideOutType } from '@coderline/alphatab/model/SlideOutType';
import type { Track } from '@coderline/alphatab/model/Track';
import { TremoloPickingEffect } from '@coderline/alphatab/model/TremoloPickingEffect';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
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
    /**
     * The open string pitches from the highest string, capo included.
     */
    public openPitches: number[] = [];
    public isPercussion: boolean = false;
    public clef: Clef = Clef.G2;
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
    /**
     * The next note on the same string.
     */
    public next: TefEvent | null = null;
    public extension: Uint8Array | null = null;
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
    private static readonly _extensionMarker = 0x7d;
    private static readonly _graceFlag = 0x40;
    private static readonly _pitchChangeFlag = 0x80;
    private static readonly _acciaccaturaFlag = 0x40;

    private static readonly _chordMarker = 0x35;
    private static readonly _lineBreakMarker = 0x36;
    private static readonly _accentMarker = 0x37;
    private static readonly _crescendoMarker = 0x38;
    private static readonly _textMarker = 0x39;
    private static readonly _connectionMarker = 0x3d;
    private static readonly _patchMarker = 0x7e;
    private static readonly _symbolMarker = 0xb6;
    private static readonly _syncopationMarker = 0xfd;
    private static readonly _tempoMarker = 0xfe;
    private static readonly _noChord = 0xffff;

    private _tracks: TefTrackInfo[];
    private _measureStarts: number[];
    private _measureSizes: number[];
    /**
     * Per bar, the beats of the first voice of the track being built with their real start.
     */
    private _beatStarts: Map<number, number[]> = new Map<number, number[]>();
    private _beatsByBar: Map<number, Beat[]> = new Map<number, Beat[]>();

    public texts: string[] = [];
    public chords: Chord[] = [];
    public initialTempo: number = 120;
    public initialSyncopation: number = 0;

    public constructor(tracks: TefTrackInfo[], measureStarts: number[], measureSizes: number[]) {
        this._tracks = tracks;
        this._measureStarts = measureStarts;
        this._measureSizes = measureSizes;
    }

    public build(cells: TefCell[]): void {
        const extensions = new Map<string, Uint8Array>();
        for (const cell of cells) {
            if (cell.data[0] === TefBarBuilder._extensionMarker && (cell.data[1] & 0x07) !== 0) {
                extensions.set(`${cell.row}:${cell.position - 1}`, cell.data);
            }
        }
        for (const info of this._tracks) {
            const events: TefEvent[] = [];
            for (const cell of cells) {
                if (cell.row >= info.firstString && cell.row < info.firstString + info.stringCount) {
                    const e = this._decode(cell, info);
                    if (e) {
                        const ext = extensions.get(`${cell.row}:${cell.position}`);
                        if (ext) {
                            e.extension = ext;
                        }
                        events.push(e);
                    }
                }
            }
            this._beatStarts = new Map<number, number[]>();
            this._beatsByBar = new Map<number, Beat[]>();
            this._buildTrack(info, events);
            for (const cell of cells) {
                if (cell.row >= info.firstString && cell.row < info.firstString + info.stringCount) {
                    this._applyTrackMarker(info, cell);
                }
            }
        }
        this._applyGlobalMarkers(cells);
    }

    private _applyGlobalMarkers(cells: TefCell[]): void {
        const score = this._tracks[0].track.score;
        const syncopation: number[] = [];
        for (let b = 0; b < score.masterBars.length; b++) {
            syncopation.push(Number.NaN);
        }
        score.masterBars[0].tempoAutomations.push(Automation.buildTempoAutomation(false, 0, this.initialTempo, 2));
        let tempo = this.initialTempo;
        for (const cell of cells) {
            const data = cell.data;
            const bar = this._barOf(cell.position);
            const column = cell.position - this._measureStarts[bar];
            switch (data[0]) {
                case TefBarBuilder._tempoMarker: {
                    const bpm = data[1] | (data[2] << 8);
                    if (bpm > 1) {
                        this._addTempoChange(bar, column, tempo, bpm, data[3]);
                        tempo = bpm;
                    }
                    break;
                }
                case TefBarBuilder._syncopationMarker:
                    syncopation[bar] = Math.max(-3, Math.min(3, data[1] - 8));
                    break;
                case TefBarBuilder._lineBreakMarker:
                    if (bar + 1 < score.masterBars.length) {
                        for (const t of this._tracks) {
                            t.track.addLineBreaks(bar + 1);
                        }
                    }
                    if ((data[7] & 0x04) !== 0) {
                        score.masterBars[bar].isDoubleBar = true;
                    }
                    break;
            }
        }
        let current = this.initialSyncopation;
        for (let b = 0; b < score.masterBars.length; b++) {
            if (!Number.isNaN(syncopation[b])) {
                current = syncopation[b];
            }
            const masterBar = score.masterBars[b];
            const compound = masterBar.timeSignatureNumerator % 3 === 0 && masterBar.timeSignatureDenominator >= 8;
            masterBar.tripletFeel = compound ? TripletFeel.NoTripletFeel : TefBarBuilder._tripletFeelOf(current);
        }
    }

    /**
     * Gradual tempo changes are approximated with a hidden tempo change on every quarter note.
     */
    private _addTempoChange(bar: number, column: number, from: number, to: number, rampQuarters: number): void {
        const score = this._tracks[0].track.score;
        const steps = Math.max(1, rampQuarters);
        const start = this._measureStarts[bar] + column;
        for (let i = 1; i <= steps; i++) {
            const position = start + (i - 1) * 16;
            const b = this._barOf(position);
            if (b >= score.masterBars.length || position >= this._measureStarts[b] + this._measureSizes[b]) {
                break;
            }
            const value = steps === 1 ? to : Math.round(from + ((to - from) * i) / steps);
            score.masterBars[b].tempoAutomations.push(
                Automation.buildTempoAutomation(
                    false,
                    (position - this._measureStarts[b]) / this._measureSizes[b],
                    value,
                    2,
                    i === 1
                )
            );
        }
    }

    private static _tripletFeelOf(syncopation: number): TripletFeel {
        if (syncopation >= 3) {
            return TripletFeel.Dotted8th;
        }
        if (syncopation > 0) {
            return TripletFeel.Triplet8th;
        }
        if (syncopation < 0) {
            return TripletFeel.Scottish8th;
        }
        return TripletFeel.NoTripletFeel;
    }

    private _beatAt(bar: number, column: number): Beat | null {
        const starts = this._beatStarts.get(bar);
        const beats = this._beatsByBar.get(bar);
        if (!starts || !beats) {
            return null;
        }
        const time = column * TefBarBuilder.subUnitsPerCell;
        let found: Beat | null = null;
        for (let i = 0; i < starts.length; i++) {
            if (starts[i] <= time) {
                found = beats[i];
            }
        }
        return found;
    }

    private _applyTrackMarker(info: TefTrackInfo, cell: TefCell): void {
        const data = cell.data;
        const bar = this._barOf(cell.position);
        const column = cell.position - this._measureStarts[bar];
        const beat = this._beatAt(bar, column);
        if (!beat) {
            return;
        }
        switch (data[0]) {
            case TefBarBuilder._textMarker: {
                const index = data[1] | (data[2] << 8);
                if (index < this.texts.length) {
                    const text = TefBarBuilder._plainText(this.texts[index]);
                    if (text.length > 0) {
                        beat.text = beat.text ? `${beat.text} ${text}` : text;
                    }
                }
                break;
            }
            case TefBarBuilder._chordMarker: {
                const index = data[1] | (data[2] << 8);
                if (index !== TefBarBuilder._noChord && index < this.chords.length) {
                    const id = `${index}`;
                    const staff = info.track.staves[0];
                    if (!staff.hasChord(id)) {
                        staff.addChord(id, this.chords[index]);
                    }
                    beat.chordId = id;
                }
                break;
            }
            case TefBarBuilder._accentMarker:
                for (const n of beat.notes) {
                    n.accentuated = AccentuationType.Normal;
                }
                break;
            case TefBarBuilder._crescendoMarker: {
                const type = (data[1] & 0x10) !== 0 ? CrescendoType.Decrescendo : CrescendoType.Crescendo;
                this._applyToRange(bar, column, data[2], b => {
                    b.crescendo = type;
                });
                break;
            }
            case TefBarBuilder._symbolMarker:
                if (data[1] === 0x6b || data[1] === 0x6c) {
                    const fermata = new Fermata();
                    fermata.type = FermataType.Medium;
                    beat.fermata = fermata;
                }
                break;
            case TefBarBuilder._connectionMarker:
                if ((data[7] & 0x80) === 0) {
                    this._applySlur(bar, column, data[1] + 1);
                }
                break;
            case TefBarBuilder._patchMarker:
                beat.automations.push(Automation.buildInstrumentAutomation(false, 0, data[1]));
                if (data[2] !== 0 || data[3] !== 0) {
                    const bank = new Automation();
                    bank.type = AutomationType.Bank;
                    bank.value = data[2] * 128 + data[3];
                    beat.automations.push(bank);
                }
                break;
        }
    }

    private _applyToRange(bar: number, column: number, length: number, action: (beat: Beat) => void): void {
        const starts = this._beatStarts.get(bar);
        const beats = this._beatsByBar.get(bar);
        if (!starts || !beats) {
            return;
        }
        const from = column * TefBarBuilder.subUnitsPerCell;
        const to = (column + length) * TefBarBuilder.subUnitsPerCell;
        for (let i = 0; i < starts.length; i++) {
            if (starts[i] >= from && starts[i] < to) {
                action(beats[i]);
            }
        }
    }

    private _applySlur(bar: number, column: number, length: number): void {
        const starts = this._beatStarts.get(bar);
        const beats = this._beatsByBar.get(bar);
        if (!starts || !beats) {
            return;
        }
        const from = column * TefBarBuilder.subUnitsPerCell;
        const to = (column + length) * TefBarBuilder.subUnitsPerCell;
        let first: Beat | null = null;
        let last: Beat | null = null;
        for (let i = 0; i < starts.length; i++) {
            if (starts[i] >= from && starts[i] < to && beats[i].notes.length > 0) {
                if (!first) {
                    first = beats[i];
                }
                last = beats[i];
            }
        }
        if (first && last && first !== last) {
            const origin = first.notes[0];
            const destination = last.notes[0];
            origin.slurDestination = destination;
            destination.slurOrigin = origin;
            destination.isSlurDestination = true;
        }
    }

    /**
     * Removes the formatting prefixes TablEdit allows in texts and drops texts that are commands.
     */
    private static _plainText(text: string): string {
        let t = text;
        while (t.length >= 2 && t.charAt(0) === '&' && 'biu'.indexOf(t.charAt(1)) >= 0) {
            t = t.substring(2);
        }
        if (t.startsWith('%') || t.startsWith('0x')) {
            return '';
        }
        return t.trim();
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

        const lastOnString = new Map<number, TefEvent>();
        for (const e of events) {
            if (!e.isRest) {
                const previous = lastOnString.get(e.stringIndex);
                if (previous) {
                    previous.next = e;
                }
                lastOnString.set(e.stringIndex, e);
            }
        }

        for (let i = 0; i < barCount; i++) {
            const bar = new Bar();
            bar.clef = info.isPercussion ? Clef.Neutral : info.clef;
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
                const group = order[v][0];
                const lane = order[v][1];
                const voice = new Voice();
                bar.addVoice(voice);
                const laneUnits: TefUnit[] = [];
                for (const u of units) {
                    if (u.bar === b && u.voiceGroup === group && u.lane === lane) {
                        laneUnits.push(u);
                    }
                }
                laneUnits.sort((x, y) => x.start - y.start);
                this._fillVoice(info, voice, laneUnits, barLength, group, v === 0 ? b : -1);
                if (voice.beats.length === 0) {
                    bar.voices.pop();
                    ModelUtils.appendPlaceholderVoice(bar);
                }
            }
        }
    }

    private _fillVoice(
        info: TefTrackInfo,
        voice: Voice,
        units: TefUnit[],
        barLength: number,
        group: number,
        recordBar: number
    ): void {
        let cursor = 0;
        let hasContent = false;
        for (let i = 0; i < units.length; i++) {
            const u = units[i];
            if (u.start < cursor) {
                continue;
            }
            if (u.start > cursor) {
                this._addRests(voice, cursor, u.start, u.duration, recordBar);
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
            if (!u.isRest) {
                this._addGraceBeat(info, voice, u);
            }
            let beatStart = u.start;
            for (let k = 0; k < values.length; k++) {
                const beat = TefBarBuilder._createBeat(values[k]);
                voice.addBeat(beat);
                if (recordBar >= 0) {
                    this._recordBeat(recordBar, beatStart, beat);
                }
                beatStart += values[k].length;
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
            this._addRests(voice, cursor, barLength, null, recordBar);
        }
    }

    private _recordBeat(bar: number, start: number, beat: Beat): void {
        let starts = this._beatStarts.get(bar);
        let beats = this._beatsByBar.get(bar);
        if (!starts || !beats) {
            starts = [];
            beats = [];
            this._beatStarts.set(bar, starts);
            this._beatsByBar.set(bar, beats);
        }
        starts.push(start);
        beats.push(beat);
    }

    private _addRests(voice: Voice, start: number, end: number, next: TefDuration | null, recordBar: number): void {
        const values =
            next && next.isTuplet && (end - start) % next.length === 0
                ? TefBarBuilder._repeat(next, (end - start) / next.length)
                : TefBarBuilder._splitPlain(start, end);
        let t = start;
        for (const v of values) {
            const beat = TefBarBuilder._createBeat(v);
            voice.addBeat(beat);
            if (recordBar >= 0) {
                this._recordBeat(recordBar, t, beat);
            }
            t += v.length;
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
            if (info.isPercussion) {
                const articulation = PercussionMapper.getArticulationById(info.openPitches[e.stringIndex] + e.fret);
                if (articulation) {
                    note.percussionArticulation = info.track.getOrRegisterPercussionArticulation(articulation);
                }
                note.fret = Number.NaN;
            } else {
                note.string = info.stringCount - e.stringIndex;
                note.fret = e.fret;
            }
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
            if (!isContinuation) {
                this._applyEffects(beat, note, e, unit);
            }
        }
        if (loudest < 7) {
            beat.dynamics = TefBarBuilder._dynamicsOf(loudest);
            beat.showDynamics = false;
        }
    }

    private _addGraceBeat(info: TefTrackInfo, voice: Voice, unit: TefUnit): void {
        let grace: Beat | null = null;
        for (const e of unit.events) {
            const data = e.cell.data;
            if ((data[0] & TefBarBuilder._graceFlag) === 0) {
                continue;
            }
            const kind = data[3] >> 5;
            // complex graces become ornaments
            if (kind >= 4) {
                continue;
            }
            let stringIndex = e.stringIndex;
            let fret = data[3] & 0x1f;
            if (e.extension) {
                if ((e.extension[3] & 0x80) !== 0) {
                    stringIndex = e.extension[3] & 0x0f;
                }
                if ((e.extension[4] & 0x80) !== 0) {
                    fret = e.extension[4] & 0x3f;
                }
            }
            if (kind === 0) {
                fret = e.fret;
            }
            // a grace on the main note's fret without its own duration is neither shown nor played
            const hasDuration = e.extension !== null && (e.extension[1] & 0x07) > 1;
            if (fret === e.fret && stringIndex === e.stringIndex && !hasDuration) {
                continue;
            }
            if (!grace) {
                grace = new Beat();
                grace.duration = Duration.ThirtySecond;
                grace.graceType =
                    e.extension && (e.extension[7] & TefBarBuilder._acciaccaturaFlag) !== 0
                        ? GraceType.BeforeBeat
                        : GraceType.OnBeat;
                voice.addBeat(grace);
            }
            const note = new Note();
            note.string = info.stringCount - stringIndex;
            note.fret = fret;
            switch (kind) {
                case 1:
                    note.isHammerPullOrigin = true;
                    break;
                case 2:
                    note.slideOutType = SlideOutType.Legato;
                    break;
                case 3:
                    TefBarBuilder._addBend(note, (e.fret - fret) * 2, false);
                    break;
            }
            grace.addNote(note);
        }
    }

    /**
     * The primary effect sits in the low nibble of the third byte, effects of the second dialog
     * column in the low nibble of the fifth byte; its high nibble holds the combination effect.
     */
    private _applyEffects(beat: Beat, note: Note, e: TefEvent, unit: TefUnit): void {
        const data = e.cell.data;
        let effect = data[2] & 0x0f;
        const combination = data[4] >> 4;
        if (effect === 0 && combination !== 3 && (data[4] & 0x0f) !== 0) {
            effect = 0x10 + (data[4] & 0x0f);
        }
        const hasParameter = (data[0] & (TefBarBuilder._graceFlag | TefBarBuilder._pitchChangeFlag)) === 0;
        const parameter = hasParameter ? data[3] : 0;

        TefBarBuilder._applyEffect(beat, note, e, unit, effect, parameter, combination === 11);
        switch (combination) {
            case 1:
            case 2:
                note.isHammerPullOrigin = true;
                break;
            case 3:
                TefBarBuilder._applyEffect(beat, note, e, unit, 14, 0, false);
                break;
            case 5:
                TefBarBuilder._applyEffect(beat, note, e, unit, 5, 0, false);
                break;
            case 6:
                note.harmonicType = HarmonicType.Natural;
                break;
            case 7:
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = 12;
                break;
            case 8:
                note.isLetRing = true;
                break;
            case 9:
                note.isGhost = true;
                break;
            case 10:
                note.isDead = true;
                break;
        }

        if ((data[0] & TefBarBuilder._graceFlag) !== 0) {
            switch (data[3] >> 5) {
                case 4:
                    note.ornament = NoteOrnament.UpperMordent;
                    break;
                case 5:
                case 6:
                    note.ornament = NoteOrnament.Turn;
                    break;
                case 7:
                    note.trillValue = note.realValue + 2;
                    break;
            }
        }

        if ((data[0] & TefBarBuilder._pitchChangeFlag) !== 0) {
            const semitones = (data[3] & 0x07) - 4;
            if (semitones > 0) {
                note.bendPoints = null;
                note.addBendPoint(new BendPoint(0, semitones * 2));
                note.addBendPoint(new BendPoint(BendPoint.MaxPosition, semitones * 2));
            }
        }

        const fingering = data[6] & 0x1f;
        const leftHand = fingering % 6;
        const rightHand = Math.floor(fingering / 6);
        if (leftHand > 0) {
            note.leftHandFinger = TefBarBuilder._fingerOf(leftHand - 1);
        }
        if (rightHand > 0) {
            note.rightHandFinger = TefBarBuilder._fingerOf(rightHand - 1);
        }
        switch (data[6] >> 5) {
            case 3:
                beat.pickStroke = PickStroke.Up;
                break;
            case 4:
                beat.pickStroke = PickStroke.Down;
                break;
        }

        switch (data[7] & 0x44) {
            case 0x40:
                beat.ottava = Ottavia._8vb;
                break;
            case 0x44:
                beat.ottava = Ottavia._8va;
                break;
        }
    }

    private static _applyEffect(
        beat: Beat,
        note: Note,
        e: TefEvent,
        unit: TefUnit,
        effect: number,
        parameter: number,
        isVariation: boolean
    ): void {
        switch (effect) {
            case 1:
            case 2:
                note.isHammerPullOrigin = true;
                break;
            case 3:
                // the destination is only struck again when it carries a pick stroke
                note.slideOutType =
                    e.next && TefBarBuilder._hasPickStroke(e.next) ? SlideOutType.Shift : SlideOutType.Legato;
                break;
            case 4:
                TefBarBuilder._addBend(note, Math.max(1, parameter & 0x0f), false);
                break;
            case 5:
            case 14:
                TefBarBuilder._applyBrush(beat, e, unit, effect === 14);
                break;
            case 6:
                note.harmonicType = HarmonicType.Natural;
                break;
            case 7:
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = TefBarBuilder._artificialHarmonicOffset(parameter);
                break;
            case 8:
                note.isPalmMute = true;
                break;
            case 9:
                beat.tap = true;
                break;
            case 10:
                note.vibrato = VibratoType.Slight;
                break;
            case 11: {
                const tremolo = new TremoloPickingEffect();
                tremolo.marks = 3;
                beat.tremoloPicking = tremolo;
                break;
            }
            case 12:
            case 13:
                if (e.next && e.next.isTied && e.next.fret !== e.fret) {
                    TefBarBuilder._addBend(note, (e.next.fret - e.fret) * 2, effect === 13);
                }
                break;
            case 15:
                note.isDead = true;
                break;
            case 0x11:
                note.isLetRing = true;
                break;
            case 0x12:
                beat.slap = true;
                break;
            case 0x13:
                beat.rasgueado = Rasgueado.Ii;
                break;
            case 0x14:
                note.isGhost = true;
                break;
            case 0x17:
                note.isStaccato = true;
                break;
            case 0x18:
                beat.fade = FadeType.FadeIn;
                break;
            case 0x19:
                beat.fade = FadeType.FadeOut;
                break;
        }
    }

    /**
     * The brush direction follows the string carrying the effect: on the lowest sounding string
     * the chord is struck from the bass, on the highest from the treble.
     */
    private static _applyBrush(beat: Beat, e: TefEvent, unit: TefUnit, isRoll: boolean): void {
        let highest = e.stringIndex;
        for (const other of unit.events) {
            if (other.stringIndex < highest) {
                highest = other.stringIndex;
            }
        }
        const fromTreble = e.stringIndex === highest && unit.events.length > 1;
        if (isRoll) {
            beat.brushType = fromTreble ? BrushType.ArpeggioUp : BrushType.ArpeggioDown;
        } else {
            beat.brushType = fromTreble ? BrushType.BrushUp : BrushType.BrushDown;
        }
    }

    private static _hasPickStroke(e: TefEvent): boolean {
        const stroke = e.cell.data[6] >> 5;
        return stroke === 3 || stroke === 4;
    }

    private static _addBend(note: Note, quarterTones: number, release: boolean): void {
        if (quarterTones === 0) {
            return;
        }
        note.bendPoints = null;
        note.addBendPoint(new BendPoint(0, 0));
        if (release) {
            note.addBendPoint(new BendPoint(BendPoint.MaxPosition / 4, quarterTones));
            note.addBendPoint(new BendPoint((BendPoint.MaxPosition * 3) / 4, quarterTones));
            note.addBendPoint(new BendPoint(BendPoint.MaxPosition, 0));
        } else {
            note.addBendPoint(new BendPoint(BendPoint.MaxPosition / 2, quarterTones));
            note.addBendPoint(new BendPoint(BendPoint.MaxPosition, quarterTones));
        }
    }

    private static _artificialHarmonicOffset(parameter: number): number {
        if ((parameter & 0xf0) === 0xb0) {
            switch (parameter & 0x0f) {
                case 3:
                    return 31;
                case 4:
                case 9:
                    return 28;
                case 5:
                    return 24;
                case 7:
                    return 19;
            }
        }
        return 12;
    }

    private static _fingerOf(value: number): Fingers {
        switch (value) {
            case 0:
                return Fingers.Thumb;
            case 1:
                return Fingers.IndexFinger;
            case 2:
                return Fingers.MiddleFinger;
            case 3:
                return Fingers.AnnularFinger;
        }
        return Fingers.LittleFinger;
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
