import { TefCell } from '@coderline/alphatab/importer/tablEdit/TefCell';
import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { Automation, AutomationType } from '@coderline/alphatab/model/Automation';
import { Bar } from '@coderline/alphatab/model/Bar';
import { Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { Chord } from '@coderline/alphatab/model/Chord';
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
import type { Staff } from '@coderline/alphatab/model/Staff';
import type { Track } from '@coderline/alphatab/model/Track';
import { TremoloPickingEffect } from '@coderline/alphatab/model/TremoloPickingEffect';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { Voice } from '@coderline/alphatab/model/Voice';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

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
    /**
     * The number of sharps the written key differs from the concert key.
     */
    public keyShift: number = 0;
    public isLetRing: boolean = false;
}

/**
 * A stretch of a bar whose notes are played as an n-tuplet.
 * @internal
 */
class TefTupletRange {
    public bar: number = 0;
    public start: number = 0;
    /**
     * The last column the range covers.
     */
    public end: number = 0;
    public numerator: number = 0;
    public denominator: number = 0;
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
    public duration!: TefDuration;
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
    public tuplet: TefTupletRange | null = null;
    /**
     * The next note on the same string.
     */
    public next: TefEvent | null = null;
    /**
     * The previous note on the same string, in any voice.
     */
    public previous: TefEvent | null = null;
    /**
     * The first and the last note created for this event (more than one when it is split into tied beats).
     */
    public firstNote: Note | null = null;
    public lastNote: Note | null = null;
    public extension: Uint8Array | null = null;
    /**
     * A hammer-on or pull-off grace on another string, slurred to this note.
     */
    public slurredGrace: Note | null = null;
}

/**
 * Notes of one voice sounding with the same start and length.
 * @internal
 */
class TefUnit {
    /**
     * The order in which the unit was found, which decides between units that sort equal.
     */
    public index: number = 0;
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
 * A beat of a bar with its voice and its real start in the bar.
 * @internal
 */
class TefBeatRecord {
    public beat: Beat;
    public voice: number;
    public start: number;
    /**
     * The grid column of the note or rest the beat starts, -1 for a beat that continues one or fills a gap.
     */
    public column: number;

    public constructor(beat: Beat, voice: number, start: number, column: number) {
        this.beat = beat;
        this.voice = voice;
        this.start = start;
        this.column = column;
    }
}

/**
 * Builds the bars, voices and beats of each track from the TablEdit grid.
 * @internal
 */
export class TefBarBuilder {
    /**
     * Sub-units per grid cell. 360360 is the least common multiple of 1..15,
     * which keeps the members of every tuplet ratio up to 15 on whole sub-units.
     */
    public static readonly subUnitsPerCell = 360360;
    /**
     * The shortest plain value used to fill gaps, a 1/128 note.
     */
    private static readonly _smallestPlain = TefBarBuilder.subUnitsPerCell / 2;

    private static readonly _cellsPerQuarter = 16;
    private static readonly _durationMask = 0x1f;
    private static readonly _tieDynamics = 7;
    private static readonly _upperVoice = 2;
    private static readonly _lowerVoice = 3;
    private static readonly _automaticGroup = 0;
    private static readonly _upperGroup = 1;
    private static readonly _lowerGroup = 2;
    private static readonly _voiceOrder = [
        TefBarBuilder._automaticGroup,
        TefBarBuilder._upperGroup,
        TefBarBuilder._lowerGroup
    ];
    private static readonly _acciaccaturaFlag = 0x40;
    private static readonly _graceDurationMask = 0x07;
    private static readonly _extensionParameterFlag = 0x20;
    private static readonly _fromStringFlag = 0x80;
    private static readonly _wideFretFlag = 0x80;
    private static readonly _ornamentDirectionFlag = 0x10;
    private static readonly _noEffect = 0x94;
    private static readonly _harmonicIntervalTag = 0xb0;
    private static readonly _hiddenInNotation = 0x0f;
    private static readonly _restSecondaryBeamBreak = 0x07;
    private static readonly _excludeFromBeamingMask = 0x88;
    /**
     * Ticks between two strings of a brush or roll per speed step: 5 TablEdit ticks of 240 per quarter.
     */
    private static readonly _strumTicksPerSpeed = 20;
    private static readonly _defaultCrescendoAmount = 16;
    private static readonly _crescendoAmountVersion = 0x03060000;
    private static readonly _maskedSlurLengthVersion = 0x030600a4;
    private static readonly _decrescendoFlag = 0x10;
    private static readonly _doubleBarFlag = 0x04;
    private static readonly _fermataSymbols = [0x6b, 0x6c];
    private static readonly _bracketFlag = 0x80;
    private static readonly _connectionLengthMask = 0x3f;
    private static readonly _maxSyncopation = 3;
    private static readonly _lyricsTextPrefix = '>';
    private static readonly _lyricsSectionStart = '\n>';
    private static readonly _noChord = 0xffff;
    /**
     * The primary effect matching each combination effect; 3 (roll) and 7 (artificial harmonic) differ.
     */
    private static readonly _combinationEffects = [0, 1, 2, 0, 0, 5, 6, 0, 0x11, 0x14, 15, 0, 0, 0, 0, 0];

    private static readonly _durations: (TefDuration | null)[] = [
        new TefDuration(Duration.Whole, 0, -1, -1),
        new TefDuration(Duration.Half, 1, -1, -1),
        new TefDuration(Duration.Whole, 0, 3, 2),
        new TefDuration(Duration.Half, 0, -1, -1),
        new TefDuration(Duration.Quarter, 1, -1, -1),
        new TefDuration(Duration.Half, 0, 3, 2),
        new TefDuration(Duration.Quarter, 0, -1, -1),
        new TefDuration(Duration.Eighth, 1, -1, -1),
        new TefDuration(Duration.Quarter, 0, 3, 2),
        new TefDuration(Duration.Eighth, 0, -1, -1),
        new TefDuration(Duration.Sixteenth, 1, -1, -1),
        new TefDuration(Duration.Eighth, 0, 3, 2),
        new TefDuration(Duration.Sixteenth, 0, -1, -1),
        new TefDuration(Duration.ThirtySecond, 1, -1, -1),
        new TefDuration(Duration.Sixteenth, 0, 3, 2),
        new TefDuration(Duration.ThirtySecond, 0, -1, -1),
        new TefDuration(Duration.SixtyFourth, 1, -1, -1),
        new TefDuration(Duration.ThirtySecond, 0, 3, 2),
        new TefDuration(Duration.SixtyFourth, 0, -1, -1),
        new TefDuration(Duration.Half, 2, -1, -1),
        new TefDuration(Duration.Sixteenth, 0, 5, 4),
        null,
        new TefDuration(Duration.Quarter, 2, -1, -1),
        new TefDuration(Duration.Sixteenth, 0, 7, 4),
        null,
        new TefDuration(Duration.Eighth, 2, -1, -1),
        new TefDuration(Duration.ThirtySecond, 0, 9, 8),
        null,
        new TefDuration(Duration.Sixteenth, 2, -1, -1),
        new TefDuration(Duration.ThirtySecond, 0, 10, 8),
        null,
        new TefDuration(Duration.Whole, 1, -1, -1)
    ];

    private _tracks: TefTrackInfo[];
    private _measureStarts: number[];
    private _measureSizes: number[];
    /**
     * Per bar, the beats of the track being built, voice by voice in time order.
     */
    private _beats: TefBeatRecord[][] = [];

    /**
     * Bars flagged as pick-up measures. They keep their nominal size on the grid.
     */
    public pickupBars: Set<number> = new Set<number>();
    private _columnOffsets: Map<number, number> = new Map<number, number>();
    public texts: string[] = [];
    public chords: Chord[] = [];
    public initialTempo: number = 120;
    public initialSyncopation: number = 0;
    /**
     * The version and sub-version of TablEdit which saved the file, as 0xMMmmSSSS.
     */
    public version: number = 0;

    public constructor(tracks: TefTrackInfo[], measureStarts: number[], measureSizes: number[]) {
        this._tracks = tracks;
        this._measureStarts = measureStarts;
        this._measureSizes = measureSizes;
    }

    public build(cells: TefCell[]): void {
        this._trimPickupBars(cells);
        const extensions = new Map<string, Uint8Array>();
        const rowTracks: number[] = [];
        const trackCells: TefCell[][] = [];
        for (let t = 0; t < this._tracks.length; t++) {
            trackCells.push([]);
            for (let s = 0; s < this._tracks[t].stringCount; s++) {
                rowTracks.push(t);
            }
        }
        for (const cell of cells) {
            if (cell.data[0] === TefCell.extensionMarker && cell.data[1] !== 0) {
                extensions.set(`${cell.row}:${cell.position - 1}`, cell.data);
            }
            if (cell.row < rowTracks.length) {
                trackCells[rowTracks[cell.row]].push(cell);
            }
        }
        for (let t = 0; t < this._tracks.length; t++) {
            const info = this._tracks[t];
            const tuplets = new Map<number, TefTupletRange[]>();
            for (const cell of trackCells[t]) {
                const tuplet = this._tupletRangeOf(cell);
                if (tuplet) {
                    if (!tuplets.has(tuplet.bar)) {
                        tuplets.set(tuplet.bar, []);
                    }
                    tuplets.get(tuplet.bar)!.push(tuplet);
                }
            }
            const events: TefEvent[] = [];
            for (const cell of trackCells[t]) {
                const e = this._decode(cell, info);
                if (e) {
                    const ext = extensions.get(`${cell.row}:${cell.position}`);
                    if (ext) {
                        e.extension = ext;
                    }
                    e.tuplet = TefBarBuilder._tupletAt(tuplets, e);
                    e.duration = e.tuplet
                        ? new TefDuration(
                              e.duration.duration,
                              e.duration.dots,
                              e.tuplet.numerator,
                              e.tuplet.denominator
                          )
                        : e.duration;
                    events.push(e);
                }
            }
            this._buildTrack(info, events);
            for (const cell of trackCells[t]) {
                this._applyTrackMarker(info, cell);
            }
        }
        this._applyGlobalMarkers(cells);
    }

    /**
     * A numbered connection plays the plain notes it covers as an n-tuplet.
     */
    private _tupletRangeOf(cell: TefCell): TefTupletRange | null {
        const data = cell.data;
        if (data[0] !== TefCell.connectionMarker || (data[7] & TefBarBuilder._bracketFlag) !== 0) {
            return null;
        }
        const numerator = data[2] >> 4;
        if (numerator < 3) {
            return null;
        }
        const bar = this.barOf(cell.position);
        const masterBar = this._tracks[0].track.score.masterBars[bar];
        const compound = TefBarBuilder._beatCells(masterBar, this._measureSizes[bar]) % 3 === 0;
        let stretch = compound ? 3 : 4;
        while (stretch < numerator) {
            stretch *= 2;
        }
        if (stretch % 2 !== 0) {
            return null;
        }
        const range = new TefTupletRange();
        range.bar = bar;
        range.start = this._columnOf(cell.position, bar);
        range.end = range.start + (data[1] & TefBarBuilder._connectionLengthMask) + 1;
        range.numerator = numerator;
        range.denominator = stretch / 2;
        return range;
    }

    private static _tupletAt(ranges: Map<number, TefTupletRange[]>, e: TefEvent): TefTupletRange | null {
        if (e.duration.isTuplet || !ranges.has(e.bar)) {
            return null;
        }
        for (const range of ranges.get(e.bar)!) {
            if (e.column >= range.start && e.column <= range.end) {
                return range;
            }
        }
        return null;
    }

    /**
     * Pick-up measures only last from their first to their last sounding note.
     */
    private _trimPickupBars(cells: TefCell[]): void {
        if (this.pickupBars.size === 0) {
            return;
        }
        const firsts = new Map<number, number>();
        const ends = new Map<number, number>();
        for (const cell of cells) {
            const type = cell.data[0] & TefCell.typeMask;
            const d = TefBarBuilder._durations[cell.data[1] & TefBarBuilder._durationMask];
            if (type === 0 || type >= TefCell.rest || !d) {
                continue;
            }
            const bar = this.barOf(cell.position);
            if (!this.pickupBars.has(bar)) {
                continue;
            }
            const column = cell.position - this._measureStarts[bar];
            const end = column + Math.ceil(d.length / TefBarBuilder.subUnitsPerCell);
            if (!firsts.has(bar)) {
                firsts.set(bar, column);
                ends.set(bar, end);
            } else {
                firsts.set(bar, Math.min(firsts.get(bar)!, column));
                ends.set(bar, Math.max(ends.get(bar)!, end));
            }
        }
        for (const bar of this.pickupBars) {
            if (firsts.has(bar)) {
                const first = firsts.get(bar)!;
                this._columnOffsets.set(bar, first);
                this._measureSizes[bar] = Math.min(this._measureSizes[bar], ends.get(bar)!) - first;
            }
        }
    }

    /**
     * The grid position at which the content of the bar starts.
     */
    private _gridStart(bar: number): number {
        const offset = this._columnOffsets.get(bar);
        return this._measureStarts[bar] + (offset === undefined ? 0 : offset);
    }

    private _columnOf(position: number, bar: number): number {
        return position - this._gridStart(bar);
    }

    /**
     * Applies the lyrics block: sections are lines starting with '>' and the track letter. TablEdit shows only
     * the first section of a track.
     */
    public applyLyrics(text: string): void {
        const sections = `\n${text}`.split(TefBarBuilder._lyricsSectionStart);
        const applied = new Set<number>();
        for (let s = 1; s < sections.length; s++) {
            const section = sections[s];
            if (section.length === 0) {
                continue;
            }
            const trackIndex = section.charCodeAt(0) - 65;
            if (trackIndex < 0 || trackIndex >= this._tracks.length || applied.has(trackIndex)) {
                continue;
            }
            applied.add(trackIndex);
            const lines = section.split('\n');
            const verses: string[] = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].split('\r').join('');
                const verseStart = TefBarBuilder._verseStart(line);
                if (verseStart > 0) {
                    verses.push(line.substring(verseStart));
                } else if (verses.length === 0) {
                    verses.push(line);
                } else {
                    verses[verses.length - 1] += ` ${line}`;
                }
            }
            const track = this._tracks[trackIndex].track;
            const beats: Beat[] = [];
            for (const bar of track.staves[0].bars) {
                const voice = bar.voices.find(v => v.beats.length > 0);
                if (voice) {
                    for (const beat of voice.beats) {
                        beats.push(beat);
                    }
                }
            }
            for (let v = 0; v < verses.length; v++) {
                TefBarBuilder._applySyllables(beats, 0, v, verses[v]);
            }
        }
    }

    /**
     * Returns the length of a leading verse number like "2. ", or 0.
     */
    private static _verseStart(line: string): number {
        let i = 0;
        while (i < line.length && line.charAt(i) === ' ') {
            i++;
        }
        const digits = i;
        while (i < line.length && line.charCodeAt(i) >= 48 && line.charCodeAt(i) <= 57) {
            i++;
        }
        if (i === digits || i >= line.length || line.charAt(i) !== '.') {
            return 0;
        }
        i++;
        while (i < line.length && line.charAt(i) === ' ') {
            i++;
        }
        return i;
    }

    /**
     * Assigns one syllable per sounding note, starting at the given beat. Chord names in brackets
     * are attached to the note of the syllable that follows them.
     */
    private static _applySyllables(beats: Beat[], startIndex: number, verse: number, text: string): void {
        const chordNames: string[] = [];
        const syllables = TefBarBuilder._syllables(text, chordNames);
        let index = 0;
        for (let i = startIndex; i < beats.length && index < syllables.length; i++) {
            const beat = beats[i];
            if (beat.isRest || beat.graceType !== GraceType.None || beat.notes.every(n => n.isTieDestination)) {
                continue;
            }
            if (!beat.lyrics) {
                beat.lyrics = [];
            }
            while (beat.lyrics.length <= verse) {
                beat.lyrics.push('');
            }
            beat.lyrics[verse] = syllables[index];
            if (chordNames[index].length > 0 && !beat.chordId) {
                TefBarBuilder._attachChordName(beat, chordNames[index]);
            }
            index++;
        }
    }

    private static _attachChordName(beat: Beat, name: string): void {
        const staff = beat.voice.bar.staff;
        const id = `lyrics:${name}`;
        if (!staff.hasChord(id)) {
            const chord = new Chord();
            chord.name = name;
            chord.showDiagram = false;
            staff.addChord(id, chord);
        }
        beat.chordId = id;
    }

    /**
     * Splits lyrics into one entry per note: spaces and hyphens move to the next note,
     * '+' and '_' are a space and a hyphen within the syllable.
     * @param chordNames receives the chord name given before each syllable, or an empty string.
     */
    private static _syllables(text: string, chordNames: string[]): string[] {
        const syllables: string[] = [];
        let current = '';
        let inChord = false;
        let chordName = '';
        let pendingChord = '';
        let pendingSpace = false;
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);
            if (inChord) {
                if (c === ']') {
                    inChord = false;
                    pendingChord = chordName.trim();
                } else {
                    chordName += c;
                }
                continue;
            }
            switch (c) {
                case '[':
                    inChord = true;
                    chordName = '';
                    break;
                case ' ':
                case '\t':
                    if (current.length > 0) {
                        syllables.push(current);
                        chordNames.push(pendingChord);
                        pendingChord = '';
                        current = '';
                    } else if (pendingSpace) {
                        syllables.push('');
                        chordNames.push(pendingChord);
                        pendingChord = '';
                    }
                    pendingSpace = true;
                    break;
                case '-':
                case '~':
                    syllables.push(c === '-' ? `${current}-` : current);
                    chordNames.push(pendingChord);
                    pendingChord = '';
                    current = '';
                    pendingSpace = false;
                    break;
                case '+':
                    current += ' ';
                    break;
                case '_':
                    current += '-';
                    break;
                default:
                    current += c;
                    pendingSpace = false;
                    break;
            }
        }
        if (current.length > 0 || pendingChord.length > 0) {
            syllables.push(current);
            chordNames.push(pendingChord);
        }
        return syllables;
    }

    private _applyGlobalMarkers(cells: TefCell[]): void {
        const score = this._tracks[0].track.score;
        const syncopation: number[] = [];
        for (let b = 0; b < score.masterBars.length; b++) {
            syncopation.push(Number.NaN);
        }
        score.masterBars[0].tempoAutomations.push(Automation.buildTempoAutomation(false, 0, this.initialTempo, 2));
        let tempo = this.initialTempo;
        const lineBreakBars: number[] = [];
        const barsPerLine: number[] = [];
        for (const cell of cells) {
            const data = cell.data;
            const bar = this.barOf(cell.position);
            switch (data[0]) {
                case TefCell.tempoMarker: {
                    const bpm = data[1] | (data[2] << 8);
                    if (bpm > 1) {
                        this._addTempoChange(Math.max(cell.position, this._gridStart(bar)), tempo, bpm, data[3]);
                        tempo = bpm;
                    }
                    break;
                }
                case TefCell.syncopationMarker:
                    syncopation[bar] = TefBarBuilder._clampSyncopation(data[1] - 8);
                    break;
                case TefCell.lineBreakMarker:
                    this._addLineBreak(bar + 1);
                    if ((data[7] & TefBarBuilder._doubleBarFlag) !== 0) {
                        score.masterBars[bar].isDoubleBar = true;
                    }
                    lineBreakBars.push(bar + 1);
                    barsPerLine.push(data[5] & 0x0f);
                    break;
            }
        }
        for (let i = 0; i < lineBreakBars.length; i++) {
            const perLine = barsPerLine[i];
            const until = i + 1 < lineBreakBars.length ? lineBreakBars[i + 1] : score.masterBars.length;
            if (perLine > 0) {
                for (let b = lineBreakBars[i] + perLine; b < until; b += perLine) {
                    this._addLineBreak(b);
                }
            }
        }
        let current = TefBarBuilder._clampSyncopation(this.initialSyncopation);
        for (let b = 0; b < score.masterBars.length; b++) {
            if (!Number.isNaN(syncopation[b])) {
                current = syncopation[b];
            }
            const masterBar = score.masterBars[b];
            const compound = masterBar.timeSignatureNumerator % 3 === 0 && masterBar.timeSignatureDenominator >= 8;
            masterBar.tripletFeel = compound ? TripletFeel.NoTripletFeel : TefBarBuilder._tripletFeelOf(current);
        }
    }

    private static _clampSyncopation(value: number): number {
        return Math.max(-TefBarBuilder._maxSyncopation, Math.min(TefBarBuilder._maxSyncopation, value));
    }

    private _addLineBreak(bar: number): void {
        if (bar > 0 && bar < this._measureStarts.length) {
            for (const t of this._tracks) {
                t.track.addLineBreaks(bar);
            }
        }
    }

    /**
     * Gradual tempo changes are approximated with a hidden tempo change on every quarter note.
     * A change at the very start replaces the initial tempo.
     */
    private _addTempoChange(position: number, from: number, to: number, rampQuarters: number): void {
        const score = this._tracks[0].track.score;
        const steps = Math.max(1, rampQuarters);
        for (let i = 1; i <= steps; i++) {
            const stepPosition = position + (i - 1) * TefBarBuilder._cellsPerQuarter;
            const b = this.barOf(stepPosition);
            const column = stepPosition - this._gridStart(b);
            if (column < 0 || column >= this._measureSizes[b]) {
                continue;
            }
            const value = steps === 1 ? to : Math.round(from + ((to - from) * i) / steps);
            const automations = score.masterBars[b].tempoAutomations;
            if (b === 0 && column === 0) {
                automations[0].value = value;
            } else {
                automations.push(
                    Automation.buildTempoAutomation(false, column / this._measureSizes[b], value, 2, i === 1)
                );
            }
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

    /**
     * The beat sounding at the given column in the first voice of the bar that has content.
     */
    private _beatAt(bar: number, column: number): Beat | null {
        const records = this._beats[bar];
        const time = column * TefBarBuilder.subUnitsPerCell;
        let found: Beat | null = null;
        for (const r of records) {
            if (r.voice !== records[0].voice) {
                break;
            }
            if (r.start <= time) {
                found = r.beat;
            }
        }
        return found;
    }

    private _applyTrackMarker(info: TefTrackInfo, cell: TefCell): void {
        const data = cell.data;
        const bar = this.barOf(cell.position);
        const column = Math.max(0, this._columnOf(cell.position, bar));
        const beat = this._beatAt(bar, column);
        if (!beat) {
            return;
        }
        const unit = TefBarBuilder.subUnitsPerCell;
        switch (data[0]) {
            case TefCell.textMarker: {
                const index = data[1] | (data[2] << 8);
                if (index < this.texts.length) {
                    const text = TefBarBuilder._plainText(this.texts[index]);
                    if (text.startsWith(TefBarBuilder._lyricsTextPrefix)) {
                        const beats = beat.voice.beats;
                        TefBarBuilder._applySyllables(beats, beats.indexOf(beat), 0, text.substring(1));
                    } else if (text.length > 0) {
                        beat.text = beat.text ? `${beat.text} ${text}` : text;
                    }
                }
                break;
            }
            case TefCell.chordMarker: {
                const index = data[1] | (data[2] << 8);
                if (index !== TefBarBuilder._noChord && index < this.chords.length) {
                    const id = `${index}`;
                    const staff = info.track.staves[0];
                    if (!staff.hasChord(id)) {
                        staff.addChord(id, TefBarBuilder._chordForStaff(this.chords[index], staff));
                    }
                    beat.chordId = id;
                }
                break;
            }
            case TefCell.accentMarker:
                for (const b of this._beatsAtColumn(bar, column)) {
                    for (const n of b.notes) {
                        n.accentuated = AccentuationType.Normal;
                    }
                }
                break;
            case TefCell.fingeringMarker: {
                const stroke = TefBarBuilder._pickStrokeOf(data[6]);
                if (stroke !== PickStroke.None) {
                    for (const b of this._beatsAtColumn(bar, column)) {
                        if (!b.isRest) {
                            b.pickStroke = stroke;
                        }
                    }
                }
                break;
            }
            case TefCell.crescendoMarker: {
                const amount =
                    this.version < TefBarBuilder._crescendoAmountVersion
                        ? TefBarBuilder._defaultCrescendoAmount
                        : data[6];
                if (data[2] !== 0 && amount !== 0) {
                    const type =
                        (data[1] & TefBarBuilder._decrescendoFlag) !== 0
                            ? CrescendoType.Decrescendo
                            : CrescendoType.Crescendo;
                    for (const b of this._beatsInRange(bar, column * unit, (column + data[2]) * unit)) {
                        b.crescendo = type;
                    }
                }
                break;
            }
            case TefCell.symbolMarker:
                if (TefBarBuilder._fermataSymbols.indexOf(data[1]) >= 0) {
                    const fermata = new Fermata();
                    fermata.type = FermataType.Medium;
                    beat.fermata = fermata;
                }
                break;
            case TefCell.connectionMarker:
                if ((data[7] & TefBarBuilder._bracketFlag) === 0) {
                    const tuplet = this._tupletRangeOf(cell);
                    if (tuplet) {
                        // the covered notes are spread out, so the slur ends at the last covered column
                        let lastColumn = tuplet.start;
                        for (const r of this._beats[bar]) {
                            if (r.column > lastColumn && r.column <= tuplet.end) {
                                lastColumn = r.column;
                            }
                        }
                        const stretch = (2 * tuplet.denominator) / tuplet.numerator;
                        const last = (tuplet.start + (lastColumn - tuplet.start) * stretch) * unit;
                        TefBarBuilder._applySlur(this._beatsInRange(bar, tuplet.start * unit, last + 1));
                    } else {
                        const length =
                            this.version < TefBarBuilder._maskedSlurLengthVersion
                                ? data[1] & TefBarBuilder._connectionLengthMask
                                : data[1];
                        TefBarBuilder._applySlur(this._beatsInRange(bar, column * unit, (column + length + 1) * unit));
                    }
                }
                break;
            case TefCell.patchMarker:
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

    /**
     * The beats of all voices whose note or rest starts exactly at the given grid column.
     */
    private _beatsAtColumn(bar: number, column: number): Beat[] {
        const found: Beat[] = [];
        for (const r of this._beats[bar]) {
            if (r.column === column) {
                found.push(r.beat);
            }
        }
        return found;
    }

    /**
     * The beats starting in the given stretch of real time, counted from the start of the given bar,
     * taken per bar from the first voice that has content.
     */
    private _beatsInRange(bar: number, from: number, to: number): Beat[] {
        const found: Beat[] = [];
        const origin = this._gridStart(bar);
        for (let b = bar; b < this._beats.length; b++) {
            const offset = (this._gridStart(b) - origin) * TefBarBuilder.subUnitsPerCell;
            if (offset >= to) {
                break;
            }
            const records = this._beats[b];
            for (const r of records) {
                if (r.voice !== records[0].voice) {
                    break;
                }
                const start = offset + r.start;
                if (start >= from && start < to) {
                    found.push(r.beat);
                }
            }
        }
        return found;
    }

    private static _chordForStaff(chord: Chord, staff: Staff): Chord {
        const result = new Chord();
        result.name = chord.name;
        result.firstFret = chord.firstFret;
        const stringCount = staff.tuning.length > 0 ? staff.tuning.length : chord.strings.length;
        for (let s = 0; s < stringCount && s < chord.strings.length; s++) {
            result.strings.push(chord.strings[s]);
        }
        return result;
    }

    /**
     * Slurs the first to the last of the given beats that have notes.
     */
    private static _applySlur(beats: Beat[]): void {
        let first: Beat | null = null;
        let last: Beat | null = null;
        for (const b of beats) {
            if (b.notes.length > 0) {
                if (!first) {
                    first = b;
                }
                last = b;
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

    /**
     * The note or rest of a cell, null for anything else and for rests outside a trimmed pick-up measure.
     */
    private _decode(cell: TefCell, info: TefTrackInfo): TefEvent | null {
        const type = cell.data[0] & TefCell.typeMask;
        const duration = TefBarBuilder._durations[cell.data[1] & TefBarBuilder._durationMask];
        if (type === 0 || type > TefCell.rest || !duration) {
            return null;
        }
        const e = new TefEvent();
        e.cell = cell;
        e.bar = this.barOf(cell.position);
        e.column = this._columnOf(cell.position, e.bar);
        if (e.column < 0 || e.column >= this._measureSizes[e.bar]) {
            return null;
        }
        e.isRest = type === TefCell.rest;
        e.stringIndex = cell.row - info.firstString;
        e.fret = type - 1;
        e.durationCode = cell.data[1] & TefBarBuilder._durationMask;
        e.duration = duration;
        e.dynamics = cell.data[1] >> 5;
        e.isTied = !e.isRest && e.dynamics === TefBarBuilder._tieDynamics;
        e.voiceHint = (cell.data[2] >> 4) & 0x03;
        e.accidental = cell.data[2] >> 6;
        return e;
    }

    /**
     * The bar the given grid position falls into.
     */
    public barOf(position: number): number {
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
                    e.previous = previous;
                }
                lastOnString.set(e.stringIndex, e);
            }
        }

        const barEvents: TefEvent[][] = [];
        this._beats = [];
        for (let i = 0; i < barCount; i++) {
            const bar = new Bar();
            bar.clef = info.isPercussion ? Clef.Neutral : info.clef;
            staff.addBar(bar);
            barEvents.push([]);
            this._beats.push([]);
        }
        for (const e of events) {
            barEvents[e.bar].push(e);
        }

        const units: TefUnit[] = [];
        for (let b = 0; b < barCount; b++) {
            for (let group = 0; group < 3; group++) {
                const groupEvents = barEvents[b].filter(e => TefBarBuilder._voiceGroupOf(e) === group);
                if (groupEvents.length > 0) {
                    this._assignRealTime(groupEvents, b, info.track);
                    TefBarBuilder._collectUnits(groupEvents, group, b, units);
                }
            }
        }

        const laneCounts = this._assignLanes(units);
        this._createVoices(info, units, laneCounts);
        TefBarBuilder._linkTies(events);
    }

    /**
     * TablEdit ties a note to the previous note on its string, which may be in another voice.
     */
    private static _linkTies(events: TefEvent[]): void {
        for (const e of events) {
            const origin = e.previous ? e.previous.lastNote : null;
            if (e.isTied && e.firstNote && origin) {
                e.firstNote.tieOrigin = origin;
                origin.tieDestination = e.firstNote;
            }
        }
    }

    private static _voiceGroupOf(e: TefEvent): number {
        switch (e.voiceHint) {
            case TefBarBuilder._upperVoice:
                return TefBarBuilder._upperGroup;
            case TefBarBuilder._lowerVoice:
                return TefBarBuilder._lowerGroup;
        }
        return TefBarBuilder._automaticGroup;
    }

    /**
     * Sets the real start and end within the bar of the events of one bar and voice group.
     */
    private _assignRealTime(events: TefEvent[], barIndex: number, track: Track): void {
        const unit = TefBarBuilder.subUnitsPerCell;
        const barEnd = this._measureSizes[barIndex] * unit;
        const beat = TefBarBuilder._beatCells(track.score.masterBars[barIndex], this._measureSizes[barIndex]);
        let runCode = -1;
        let runAnchor = 0;
        for (const e of events) {
            const d = e.duration;
            const column = e.column;
            let start = column * unit;
            if (e.tuplet) {
                runCode = -1;
                const anchor = e.tuplet.start;
                start = anchor * unit + ((column - anchor) * unit * 2 * e.tuplet.denominator) / e.tuplet.numerator;
            } else if (TefBarBuilder._isTriplet(e.durationCode)) {
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
                    start = anchor * unit + (column - anchor) * TefBarBuilder._tupletStretch(e.durationCode);
                }
            }
            e.realStart = start;
            e.realEnd = Math.min(start + d.length, barEnd);
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
    private static _tupletStretch(code: number): number {
        const unit = TefBarBuilder.subUnitsPerCell;
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
            if (e.realStart >= e.realEnd) {
                continue;
            }
            const key = `${e.isRest}:${e.realStart}:${e.realEnd}:${e.durationCode}:${e.tuplet ? e.tuplet.numerator : 0}`;
            let unit = byKey.get(key);
            if (!unit) {
                unit = new TefUnit();
                unit.index = units.length;
                unit.start = e.realStart;
                unit.end = e.realEnd;
                unit.bar = bar;
                unit.isRest = e.isRest;
                unit.voiceGroup = group;
                if (e.duration.length === e.realEnd - e.realStart) {
                    unit.duration = e.duration;
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
            const length = a.end - a.start - (b.end - b.start);
            return length !== 0 ? length : a.index - b.index;
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
            if (u.isRest && lane !== 0 && ends.length > 0) {
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
        // per lane the automatic, upper and lower voice: alphaTab draws every voice after the first one
        // in the secondary colour, the automatic voice usually holds most notes
        const order: number[][] = [];
        const maxLanes = Math.max(laneCounts[0], laneCounts[1], laneCounts[2]);
        for (let l = 0; l < maxLanes; l++) {
            for (const group of TefBarBuilder._voiceOrder) {
                if (l < laneCounts[group]) {
                    order.push([group, l]);
                }
            }
        }
        if (order.length === 0) {
            order.push([TefBarBuilder._automaticGroup, 0]);
        }

        const barUnits: TefUnit[][] = [];
        for (let b = 0; b < staff.bars.length; b++) {
            barUnits.push([]);
        }
        for (const u of units) {
            if (u.lane >= 0) {
                barUnits[u.bar].push(u);
            }
        }
        for (let b = 0; b < staff.bars.length; b++) {
            const bar = staff.bars[b];
            const barLength = this._measureSizes[b] * TefBarBuilder.subUnitsPerCell;
            // stems of the automatic voice point away from an upper voice
            const automaticStems: BeamDirection | null = barUnits[b].some(
                u => u.voiceGroup === TefBarBuilder._upperGroup
            )
                ? BeamDirection.Down
                : null;
            for (let v = 0; v < order.length; v++) {
                const voice = new Voice();
                bar.addVoice(voice);
                const group = order[v][0];
                const lane = order[v][1];
                const laneUnits = barUnits[b].filter(u => u.voiceGroup === group && u.lane === lane);
                const stems: BeamDirection | null =
                    group === TefBarBuilder._upperGroup
                        ? BeamDirection.Up
                        : group === TefBarBuilder._lowerGroup
                          ? BeamDirection.Down
                          : automaticStems;
                this._fillVoice(info, voice, v, laneUnits, barLength, stems);
            }
        }
    }

    /**
     * Fills a voice with the units of one lane, which follow each other without overlap, and the rests between them.
     */
    private _fillVoice(
        info: TefTrackInfo,
        voice: Voice,
        voiceIndex: number,
        units: TefUnit[],
        barLength: number,
        stems: BeamDirection | null
    ): void {
        if (units.length === 0) {
            return;
        }
        const bar = units[0].bar;
        let cursor = 0;
        let previous: TefDuration | null = null;
        const staff = info.track.staves[0];
        for (const u of units) {
            if (u.start > cursor) {
                this._addRests(voice, bar, voiceIndex, cursor, u.start, u.duration, previous);
            }
            const values =
                u.duration && u.end - u.start === u.duration.length
                    ? [u.duration]
                    : TefBarBuilder._splitPlain(u.start, u.end);
            if (!u.isRest) {
                this._addGraceBeat(info, voice, u);
            }
            let beatStart = u.start;
            for (let k = 0; k < values.length; k++) {
                const beat = TefBarBuilder._createBeat(values[k]);
                voice.addBeat(beat);
                this._beats[bar].push(
                    new TefBeatRecord(beat, voiceIndex, beatStart, k === 0 ? u.events[0].column : -1)
                );
                beatStart += values[k].length;
                if (stems !== null) {
                    beat.preferredBeamDirection = stems;
                }
                if (!u.isRest) {
                    this._addNotes(info, beat, u, k > 0);
                }
                if (k === 0) {
                    TefBarBuilder._applyLayoutAttributes(staff, voice, beat, u);
                }
            }
            previous = values.length > 0 ? values[values.length - 1] : previous;
            cursor = u.end;
        }
        if (cursor < barLength) {
            this._addRests(voice, bar, voiceIndex, cursor, barLength, null, previous);
        }
    }

    /**
     * Applies beaming and visibility attributes. Hidden notes and rests are only hidden when no
     * other displayed staff would still show them.
     */
    private static _applyLayoutAttributes(staff: Staff, voice: Voice, beat: Beat, unit: TefUnit): void {
        if (unit.isRest) {
            let hidden = true;
            for (const e of unit.events) {
                const flags = e.cell.data[7];
                const inNotation = (flags & TefCell.restHiddenInNotationFlag) !== 0;
                const inTab = (flags & TefCell.restHiddenInTabFlag) !== 0;
                hidden =
                    hidden &&
                    (inNotation || inTab) &&
                    (inNotation || !staff.showStandardNotation) &&
                    (inTab || !staff.showTablature);
            }
            beat.isEmpty = hidden;
            if (unit.events[0].cell.data[4] === TefBarBuilder._restSecondaryBeamBreak) {
                const before = TefBarBuilder._previousNoteBeat(voice, beat);
                if (before && before.beamingMode === BeatBeamingMode.Auto) {
                    before.beamingMode = BeatBeamingMode.ForceSplitOnSecondaryToNext;
                }
            }
            return;
        }
        for (const e of unit.events) {
            const beaming: number = e.cell.data[7] & TefBarBuilder._excludeFromBeamingMask;
            if (beaming === TefCell.excludeFromBeaming) {
                beat.beamingMode = BeatBeamingMode.ForceSplitToNext;
                const before = TefBarBuilder._previousNoteBeat(voice, beat);
                if (before) {
                    before.beamingMode = BeatBeamingMode.ForceSplitToNext;
                }
            }
        }
        if (!staff.showTablature) {
            for (let i = 0; i < unit.events.length && i < beat.notes.length; i++) {
                if (unit.events[i].cell.data[4] === TefBarBuilder._hiddenInNotation) {
                    beat.notes[i].isVisible = false;
                }
            }
        }
    }

    private static _previousNoteBeat(voice: Voice, beat: Beat): Beat | null {
        for (let i = voice.beats.indexOf(beat) - 1; i >= 0; i--) {
            const candidate = voice.beats[i];
            if (!candidate.isRest && candidate.graceType === GraceType.None) {
                return candidate;
            }
        }
        return null;
    }

    /**
     * Fills a gap with rests. Gaps off the plain grid follow the tuplet of the neighbouring notes.
     */
    private _addRests(
        voice: Voice,
        bar: number,
        voiceIndex: number,
        start: number,
        end: number,
        next: TefDuration | null,
        previous: TefDuration | null
    ): void {
        const gap = end - start;
        let values: TefDuration[];
        if (next && next.isTuplet && gap % next.length === 0) {
            values = TefBarBuilder._repeat(next, gap / next.length);
        } else if (gap % TefBarBuilder._smallestPlain !== 0 && previous && previous.isTuplet) {
            // members of the tuplet up to the plain grid, plain values after it
            values = [];
            let tupletEnd = start;
            while (tupletEnd % TefBarBuilder._smallestPlain !== 0 && tupletEnd + previous.length <= end) {
                values.push(previous);
                tupletEnd += previous.length;
            }
            const rest =
                tupletEnd % TefBarBuilder._smallestPlain === 0 && end % TefBarBuilder._smallestPlain === 0
                    ? TefBarBuilder._splitPlain(tupletEnd, end)
                    : TefBarBuilder._splitTuplet(end - tupletEnd, previous);
            for (const v of rest) {
                values.push(v);
            }
        } else {
            values = TefBarBuilder._splitPlain(start, end);
        }
        let t = start;
        for (const v of values) {
            const beat = TefBarBuilder._createBeat(v);
            voice.addBeat(beat);
            this._beats[bar].push(new TefBeatRecord(beat, voiceIndex, t, -1));
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
        while (end - t >= TefBarBuilder._smallestPlain) {
            let cells = 64;
            while (
                cells * cell > TefBarBuilder._smallestPlain &&
                ((t / cell) % cells !== 0 || t + cells * cell > end)
            ) {
                cells = cells / 2;
            }
            values.push(new TefDuration((64 / cells) as Duration, 0, -1, -1));
            t += cells * cell;
        }
        return values;
    }

    /**
     * Splits a stretch of real time into members of the given tuplet kind, longest first.
     */
    private static _splitTuplet(length: number, tuplet: TefDuration): TefDuration[] {
        const cell = TefBarBuilder.subUnitsPerCell;
        let plain = (length * tuplet.tupletNumerator) / tuplet.tupletDenominator;
        if (plain % TefBarBuilder._smallestPlain !== 0) {
            return TefBarBuilder._splitPlain(0, length);
        }
        const values: TefDuration[] = [];
        let cells = 64;
        while (plain > 0 && cells * cell >= TefBarBuilder._smallestPlain) {
            if (cells * cell <= plain) {
                values.push(
                    new TefDuration((64 / cells) as Duration, 0, tuplet.tupletNumerator, tuplet.tupletDenominator)
                );
                plain -= cells * cell;
            } else {
                cells = cells / 2;
            }
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
            TefBarBuilder._setPosition(info, note, e.stringIndex, e.fret);
            note.isTieDestination = e.isTied || isContinuation;
            if (isContinuation) {
                note.tieOrigin = e.lastNote;
            } else {
                e.firstNote = note;
            }
            e.lastNote = note;
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
                this._applyEffects(info, beat, note, e, unit);
                if (e.slurredGrace) {
                    e.slurredGrace.slurDestination = note;
                    note.slurOrigin = e.slurredGrace;
                    note.isSlurDestination = true;
                }
            }
        }
        if (loudest < 7) {
            beat.dynamics = TefBarBuilder._dynamicsOf(loudest);
            beat.showDynamics = false;
        }
    }

    /**
     * Places the note on a string and fret, or on the drum instrument of a line and fret.
     */
    private static _setPosition(info: TefTrackInfo, note: Note, stringIndex: number, fret: number): void {
        if (info.isPercussion) {
            const articulation = PercussionMapper.getArticulationById(info.openPitches[stringIndex] + fret);
            if (articulation) {
                note.percussionArticulation = info.track.getOrRegisterPercussionArticulation(articulation);
            }
            note.fret = Number.NaN;
        } else {
            note.string = info.stringCount - stringIndex;
            note.fret = fret;
        }
    }

    private _addGraceBeat(info: TefTrackInfo, voice: Voice, unit: TefUnit): void {
        let grace: Beat | null = null;
        for (const e of unit.events) {
            const data = e.cell.data;
            if ((data[0] & TefCell.graceFlag) === 0) {
                continue;
            }
            const kind = data[3] >> 5;
            // complex graces become ornaments
            if (kind >= 4) {
                continue;
            }
            const extension = TefBarBuilder._graceExtension(e);
            let stringIndex = e.stringIndex;
            const fret = TefBarBuilder._graceFret(e);
            if (extension && (extension[3] & TefBarBuilder._fromStringFlag) !== 0) {
                const other = extension[3] & 0x0f;
                if (other < info.stringCount) {
                    stringIndex = other;
                }
            }
            // a grace on the main note's fret without its own duration is neither shown nor played
            const hasDuration = extension !== null && (extension[1] & TefBarBuilder._graceDurationMask) > 1;
            if (fret === e.fret && stringIndex === e.stringIndex && !hasDuration) {
                continue;
            }
            if (!grace) {
                grace = new Beat();
                grace.duration = Duration.ThirtySecond;
                grace.graceType =
                    extension && (extension[7] & TefBarBuilder._acciaccaturaFlag) !== 0
                        ? GraceType.BeforeBeat
                        : GraceType.OnBeat;
                voice.addBeat(grace);
            }
            const note = new Note();
            TefBarBuilder._setPosition(info, note, stringIndex, fret);
            switch (kind) {
                case 1:
                    // alphaTab ties hammer-ons and pull-offs to one string, a slur keeps the connection
                    if (stringIndex === e.stringIndex) {
                        note.isHammerPullOrigin = true;
                    } else {
                        e.slurredGrace = note;
                    }
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

    private static _graceExtension(e: TefEvent): Uint8Array | null {
        return e.extension && (e.extension[1] & TefBarBuilder._graceDurationMask) !== 0 ? e.extension : null;
    }

    /**
     * The fret of the grace or ornament note, which the extension record holds when it exceeds 31.
     */
    private static _graceFret(e: TefEvent): number {
        const extension = TefBarBuilder._graceExtension(e);
        if (extension && (extension[4] & TefBarBuilder._wideFretFlag) !== 0) {
            return extension[4] & 0x3f;
        }
        return e.cell.data[3] & 0x1f;
    }

    /**
     * Whether the first auxiliary note of a double or gruppetto lies below the main note: the grace byte
     * holds the intervals with a direction flag, or the extension record holds both auxiliary frets.
     */
    private static _turnStartsBelow(e: TefEvent): boolean {
        const extension = TefBarBuilder._graceExtension(e);
        if ((e.cell.data[3] & 0x1f) === 0 && extension && (extension[4] & TefBarBuilder._wideFretFlag) !== 0) {
            return (extension[4] & 0x3f) < e.fret;
        }
        return (e.cell.data[3] & TefBarBuilder._ornamentDirectionFlag) !== 0;
    }

    private _applyEffects(info: TefTrackInfo, beat: Beat, note: Note, e: TefEvent, unit: TefUnit): void {
        const data = e.cell.data;
        let effect = data[2] & 0x0f;
        let combination = data[4] >> 4;
        if (effect === 0 && data[4] === TefBarBuilder._noEffect) {
            combination = 0;
        } else if (effect === 0 && combination !== 3 && (data[4] & 0x0f) !== 0) {
            effect = 0x10 + (data[4] & 0x0f);
        }
        const hasParameter = (data[0] & (TefCell.graceFlag | TefCell.pitchChangeFlag)) === 0;
        let parameter = hasParameter ? data[3] : 0;
        let hasParameterByte = hasParameter;
        if (!hasParameter && e.extension && (e.extension[1] & TefBarBuilder._extensionParameterFlag) !== 0) {
            parameter = e.extension[2];
            hasParameterByte = true;
        }

        TefBarBuilder._applyEffect(beat, note, e, unit, effect, parameter, hasParameterByte);
        switch (combination) {
            case 3:
                TefBarBuilder._applyBrush(
                    beat,
                    e,
                    unit,
                    true,
                    hasParameterByte && (parameter & 0x0f) !== 0 ? parameter & 0x07 : 4
                );
                break;
            case 7:
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = 12;
                break;
            default:
                TefBarBuilder._applyEffect(
                    beat,
                    note,
                    e,
                    unit,
                    TefBarBuilder._combinationEffects[combination],
                    parameter,
                    hasParameterByte
                );
                break;
        }
        if (info.isLetRing) {
            note.isLetRing = true;
        }

        if ((data[0] & TefCell.graceFlag) !== 0) {
            switch (data[3] >> 5) {
                case 4:
                    note.ornament =
                        TefBarBuilder._graceFret(e) < e.fret ? NoteOrnament.LowerMordent : NoteOrnament.UpperMordent;
                    break;
                case 5:
                case 6:
                    note.ornament = TefBarBuilder._turnStartsBelow(e) ? NoteOrnament.InvertedTurn : NoteOrnament.Turn;
                    break;
                case 7: {
                    const trillFret = TefBarBuilder._graceFret(e);
                    note.trillValue =
                        trillFret !== e.fret && !info.isPercussion ? trillFret + note.stringTuning : note.realValue + 2;
                    break;
                }
            }
        }

        if ((data[0] & TefCell.pitchChangeFlag) !== 0) {
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
        const stroke = TefBarBuilder._pickStrokeOf(data[6]);
        if (stroke !== PickStroke.None) {
            beat.pickStroke = stroke;
        }

        switch (data[7] & TefCell.ottavaMask) {
            case TefCell.ottavaBassa:
                beat.ottava = Ottavia._8vb;
                break;
            case TefCell.ottavaAlta:
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
        hasParameter: boolean
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
                TefBarBuilder._applyBrush(beat, e, unit, false, hasParameter ? ((parameter >> 4) & 0x07) + 1 : 4);
                break;
            case 14: {
                const speed = ((parameter >> 4) & 0x07) + 4;
                TefBarBuilder._applyBrush(beat, e, unit, true, !hasParameter ? 4 : speed > 8 ? speed - 8 : speed);
                break;
            }
            case 6:
                note.harmonicType = HarmonicType.Natural;
                note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(note.fret);
                break;
            case 7:
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = TefBarBuilder._artificialHarmonicFret(parameter, e.cell.data[4]);
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
                if (e.next && e.next.fret !== e.fret) {
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
            case 0x15:
            case 0x16:
                if (e.next && e.next.fret !== e.fret) {
                    TefBarBuilder._addWhammy(beat, (e.next.fret - e.fret) * 2, effect === 0x16);
                }
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
    private static _applyBrush(beat: Beat, e: TefEvent, unit: TefUnit, isRoll: boolean, speed: number): void {
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
        beat.brushDuration = speed * TefBarBuilder._strumTicksPerSpeed * Math.max(0, unit.events.length - 1);
    }

    private static _hasPickStroke(e: TefEvent): boolean {
        return TefBarBuilder._pickStrokeOf(e.cell.data[6]) !== PickStroke.None;
    }

    private static _pickStrokeOf(value: number): PickStroke {
        switch (value >> 5) {
            case 3:
                return PickStroke.Up;
            case 4:
                return PickStroke.Down;
        }
        return PickStroke.None;
    }

    private static _addWhammy(beat: Beat, quarterTones: number, isDiveReturn: boolean): void {
        beat.whammyBarPoints = null;
        beat.addWhammyBarPoint(new BendPoint(0, 0));
        beat.addWhammyBarPoint(new BendPoint(BendPoint.MaxPosition / 2, quarterTones));
        beat.addWhammyBarPoint(new BendPoint(BendPoint.MaxPosition, isDiveReturn ? 0 : quarterTones));
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

    /**
     * The harmonic fret of an artificial harmonic. The interval is stored with the note or in the
     * combination byte; anything else is the octave.
     */
    private static _artificialHarmonicFret(parameter: number, combination: number): number {
        let value = 0;
        const parameterTag: number = parameter & 0xf0;
        const combinationTag: number = combination & 0xf0;
        if (parameterTag === TefBarBuilder._harmonicIntervalTag) {
            value = parameter & 0x0f;
        } else if (combinationTag === TefBarBuilder._harmonicIntervalTag) {
            value = combination & 0x0f;
        }
        switch (value) {
            case 3:
            case 4:
            case 5:
            case 7:
            case 9:
                return value;
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
