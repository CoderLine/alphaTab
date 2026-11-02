import { FormatError } from '@coderline/alphatab/FormatError';
import { ScoreImporter } from '@coderline/alphatab/importer/ScoreImporter';
import { TefBarBuilder, TefCell, TefTrackInfo } from '@coderline/alphatab/importer/tablEdit/TefBarBuilder';
import { TefBinary } from '@coderline/alphatab/importer/tablEdit/TefBinary';
import { TefFormat2Reader } from '@coderline/alphatab/importer/tablEdit/TefFormat2Reader';
import {
    TefReadingGuide,
    TefReadingList,
    TefReadingListItem
} from '@coderline/alphatab/importer/tablEdit/TefReadingList';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { Chord } from '@coderline/alphatab/model/Chord';
import { Clef } from '@coderline/alphatab/model/Clef';
import { Duration } from '@coderline/alphatab/model/Duration';
import type { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { BeamingRules, MasterBar } from '@coderline/alphatab/model/MasterBar';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Score } from '@coderline/alphatab/model/Score';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { Track } from '@coderline/alphatab/model/Track';

/**
 * This ScoreImporter can read TablEdit (.tef) files of TablEdit 2.6x and later (formats 3 to 12).
 * @internal
 */
export class TablEditImporter extends ScoreImporter {
    private static readonly _headerSize = 256;
    private static readonly _firstFormat2 = 3;
    private static readonly _firstSupportedFormat = 10;
    private static readonly _protectedFormat = 12;
    private static readonly _lastSupportedFormat = 12;
    private static readonly _wideMeasureRecordHeader = 16;
    private static readonly _maxMeasureCount = 10000;
    private static readonly _maxInstrumentCount = 64;
    private static readonly _maxStringCount = 12;
    private static readonly _maxCellCount = 1000000;
    private static readonly _cellSize = 12;
    private static readonly _drumFlag = 0x80;
    private static readonly _pickupFlag = 0x08;
    private static readonly _minorFlag = 0x20;
    private static readonly _freeBarFlags = 0x06;
    private static readonly _halfBarBeamingFlag = 0x04;
    private static readonly _maxTextCount = 4096;
    private static readonly _maxReadingListCount = 4096;
    private static readonly _readingGuideMarker = 0xb7;
    private static readonly _maxChordCount = 4096;
    private static readonly _readingListRecordSize = 0x20;
    private static readonly _chordStringBytes = 14;
    private static readonly _bankMsbFactor = 128;
    private static readonly _letRingOption = 0x0200;
    private static readonly _nameOffset = 32;
    private static readonly _nameLength = 36;
    private static readonly _abbreviationOffset = 26;
    private static readonly _abbreviationMark = 0x5e;
    private static readonly _cellEnd = 4294967295;

    private _data!: TefBinary;
    private _score!: Score;
    private _cells: TefCell[] = [];
    private _lyrics: string = '';
    private _readingList: TefReadingListItem[] = [];
    private _measureStarts: number[] = [];
    private _measureSizes: number[] = [];
    private _tracks: TefTrackInfo[] = [];
    private _totalStrings: number = 0;
    private _pickupBars: Set<number> = new Set<number>();
    private _minorBars: Set<number> = new Set<number>();
    private _keys: number[] = [];

    public get name(): string {
        return 'TablEdit';
    }

    public readScore(): Score {
        this._data = new TefBinary(this.data.readAll());
        const format = this._detectFormat();
        if (format < TablEditImporter._firstFormat2) {
            throw new FormatError(
                'TablEdit files older than version 2.6 are not supported, re-save the file with TablEdit 3'
            );
        }
        if (format > TablEditImporter._lastSupportedFormat) {
            throw new FormatError(`TablEdit file format ${format} is newer than the supported format`);
        }

        this._score = new Score();
        const builder =
            format < TablEditImporter._firstSupportedFormat ? this._readFormat2() : this._readFormat3(format);
        builder.pickupBars = this._pickupBars;
        builder.build(this._cells);
        builder.applyLyrics(this._lyrics);

        for (const info of this._tracks) {
            const bars = info.track.staves[0].bars;
            for (let b = 0; b < bars.length && b < this._keys.length; b++) {
                bars[b].keySignature = TablEditImporter._writtenKey(this._keys[b], info.keyShift);
                bars[b].keySignatureType = this._minorBars.has(b) ? KeySignatureType.Minor : KeySignatureType.Major;
            }
        }

        const readingList = this._readingList;
        TefReadingList.apply(this._score, readingList, readingList.length > 0 ? [] : this._readGuides(this._cells));

        ModelUtils.consolidate(this._score);
        this._score.finish(this.settings);
        this._score.rebuildRepeatGroups();
        TefReadingList.verify(this._score, readingList);
        return this._score;
    }

    private _readFormat3(format: number): TefBarBuilder {
        if (this._u32(16) !== 0 || format === TablEditImporter._protectedFormat) {
            throw new FormatError('Protected TablEdit files are not supported');
        }
        this._readInformation();
        this._readMeasures(this._u32(92));
        this._readInstruments(this._u32(96));
        this._cells = this._readContents(this._u32(60));

        const builder = new TefBarBuilder(this._tracks, this._measureStarts, this._measureSizes);
        builder.initialTempo = this._u16(6) > 0 ? this._u16(6) : 120;
        builder.initialSyncopation = Math.max(-3, Math.min(3, this._s16(12)));
        builder.texts = this._readTexts(this._u32(84));
        builder.chords = this._readChords(this._u32(88));
        builder.version = this._u16(2);
        this._lyrics = this._readString(this._u32(80));
        this._readingList = this._readReadingList(this._u32(128));
        return builder;
    }

    private _readFormat2(): TefBarBuilder {
        const reader = new TefFormat2Reader(this._data, this.settings.importer.maxDecodingBufferSize);
        reader.read();
        this._score.title = reader.title;
        this._score.subTitle = reader.author;
        this._score.instructions = reader.comment;
        this._score.notices = reader.notes;

        let position = 0;
        for (let i = 0; i < reader.measures.length; i++) {
            const measure = reader.measures[i];
            const masterBar = new MasterBar();
            masterBar.timeSignatureNumerator = measure.numerator;
            masterBar.timeSignatureDenominator = measure.denominator;
            this._score.addMasterBar(masterBar);
            this._keys.push(measure.key);
            if (measure.isMinor) {
                this._minorBars.add(i);
            }
            this._measureStarts.push(position);
            this._measureSizes.push(measure.size);
            position += measure.size;
        }
        this._readInstrumentRecords(reader.instruments, 0, reader.instrumentCount, reader.instrumentRecordSize);
        this._cells = reader.cells;

        const builder = new TefBarBuilder(this._tracks, this._measureStarts, this._measureSizes);
        builder.initialTempo = reader.tempo;
        builder.initialSyncopation = Math.max(-3, Math.min(3, reader.syncopation));
        builder.texts = reader.texts;
        builder.chords = this._readChordRecords(reader.chordsOffset, reader.chordCount, reader.chordRecordSize);
        builder.version = reader.version;
        this._lyrics = reader.lyrics;
        this._readingList = reader.readingList;
        return builder;
    }

    /**
     * Returns the format version of a file that looks like a TablEdit file.
     * Throws an {@link UnsupportedFormatError} for anything else.
     */
    private _detectFormat(): number {
        if (this._data.length < TablEditImporter._headerSize) {
            throw new UnsupportedFormatError('Data too short for a TablEdit file');
        }
        const numerator = this._u16(202);
        const denominator = this._u8(204);
        const format = this._u8(205);
        const isPowerOfTwo = denominator > 0 && (denominator & (denominator - 1)) === 0;
        const longestMeasure = isPowerOfTwo ? (64 / denominator) * numerator : 0;
        if (!isPowerOfTwo || format === 0 || longestMeasure < 4 || longestMeasure > 256) {
            throw new UnsupportedFormatError('Not a TablEdit file');
        }
        return format;
    }

    private _readInformation(): void {
        this._score.title = this._readString(this._u32(64));
        this._score.subTitle = this._readString(this._u32(68));
        this._score.instructions = this._readString(this._u32(72));
        this._score.notices = this._readString(this._u32(76));
        this._score.copyright = this._readString(this._u32(140));
    }

    private _readMeasures(offset: number): void {
        if (offset === 0) {
            throw new FormatError('TablEdit file without measures');
        }
        const recordSize = this._u16(offset) === TablEditImporter._wideMeasureRecordHeader ? 12 : 8;
        const count = this._u16(offset + 2);
        this._ensureLoopBoundary(count, TablEditImporter._maxMeasureCount, 'measure count');
        let position = 0;
        let p = offset + 8;
        for (let i = 0; i < count; i++) {
            const masterBar = new MasterBar();
            const denominator = this._u8(p + 4);
            const numerator = this._u8(p + 5);
            masterBar.timeSignatureNumerator = numerator > 0 ? numerator : 4;
            masterBar.timeSignatureDenominator = denominator > 0 ? denominator : 4;
            const flags = this._u8(p);
            if ((flags & TablEditImporter._pickupFlag) !== 0) {
                masterBar.isAnacrusis = true;
                this._pickupBars.add(i);
            }
            if ((flags & TablEditImporter._minorFlag) !== 0) {
                this._minorBars.add(i);
            }
            this._keys.push(this._s8(p + 2));
            this._score.addMasterBar(masterBar);

            let size = (64 / masterBar.timeSignatureDenominator) * masterBar.timeSignatureNumerator;
            if (size <= 0 || size > 1024 || size !== Math.floor(size)) {
                size = 64;
            }
            if ((flags & TablEditImporter._freeBarFlags) !== 0) {
                masterBar.beamingRules = TablEditImporter._freeBarBeaming(
                    masterBar,
                    size,
                    (flags & TablEditImporter._halfBarBeamingFlag) !== 0
                );
            }
            this._measureStarts.push(position);
            this._measureSizes.push(size);
            position += size;
            p += recordSize;
        }
    }

    /**
     * Free bars beam their eighths across the whole bar or across each half.
     */
    private static _freeBarBeaming(masterBar: MasterBar, size: number, halves: boolean): BeamingRules {
        const eighths = Math.max(1, Math.floor(size / 8));
        const groups: number[] = [];
        if (halves && eighths > 1) {
            groups.push(Math.ceil(eighths / 2));
            groups.push(Math.floor(eighths / 2));
        } else {
            groups.push(eighths);
        }
        return BeamingRules.createSimple(
            masterBar.timeSignatureNumerator,
            masterBar.timeSignatureDenominator,
            Duration.Eighth,
            groups
        );
    }

    private _readInstruments(offset: number): void {
        if (offset === 0) {
            throw new FormatError('TablEdit file without instruments');
        }
        this._readInstrumentRecords(this._data, offset + 4, this._u16(offset + 2), this._u16(offset));
    }

    private _readInstrumentRecords(data: TefBinary, offset: number, count: number, recordSize: number): void {
        this._ensureLoopBoundary(count, TablEditImporter._maxInstrumentCount, 'instrument count');
        let p = offset;
        for (let i = 0; i < count; i++) {
            const stringCount = data.u16(p);
            this._ensureLoopBoundary(stringCount, TablEditImporter._maxStringCount, 'string count');

            const track = new Track();
            track.ensureStaveCount(1);
            const staff: Staff = track.staves[0];
            this._score.addTrack(track);
            track.name = data.readCString(p + TablEditImporter._nameOffset, TablEditImporter._nameLength);
            // the bytes between the name and the abbreviation are leftovers of earlier names
            const abbreviation = p + TablEditImporter._nameOffset + TablEditImporter._abbreviationOffset;
            if (data.u8(abbreviation) === TablEditImporter._abbreviationMark) {
                track.shortName = data.readCString(
                    abbreviation + 1,
                    TablEditImporter._nameLength - TablEditImporter._abbreviationOffset - 1
                );
            }
            track.playbackInfo.program = data.u8(p + 8);
            track.playbackInfo.bank = data.u8(p + 9) * TablEditImporter._bankMsbFactor;

            const capo = data.u16(p + 12);
            const openPitches: number[] = [];
            for (let s = 0; s < stringCount; s++) {
                openPitches.push(96 - data.u8(p + 20 + s));
            }
            const isPercussion = (data.u8(p + 4) & TablEditImporter._drumFlag) !== 0;
            staff.isPercussion = isPercussion;
            if (!isPercussion) {
                staff.capo = capo;
                const tuning: number[] = [];
                for (const pitch of openPitches) {
                    tuning.push(pitch - capo);
                }
                staff.stringTuning.tunings = tuning;
            }
            const transposition = data.u8(p + 11) & 0x07;
            staff.displayTranspositionPitch = data.s8(p + 14) - 12 - TablEditImporter._transpositionOf(transposition);

            switch ((data.u8(p + 16) >> 4) & 0x03) {
                case 1:
                    staff.showTablature = true;
                    staff.showStandardNotation = false;
                    break;
                case 2:
                    staff.showTablature = false;
                    staff.showStandardNotation = true;
                    break;
                default:
                    staff.showTablature = true;
                    staff.showStandardNotation = true;
                    break;
            }
            track.playbackInfo.balance = Math.round(((data.u8(p + 17) & 0x0f) * 16) / 15);
            track.playbackInfo.volume = Math.round(((15 - (data.u8(p + 18) & 0x0f)) * 16) / 15);

            const info = new TefTrackInfo();
            info.track = track;
            info.firstString = this._totalStrings;
            info.stringCount = stringCount;
            info.openPitches = openPitches;
            info.isPercussion = isPercussion;
            info.clef = TablEditImporter._clefOf(data.u8(p + 15) & 0x07, openPitches);
            info.keyShift = (transposition & 0x03) === 0 ? 0 : 4 - transposition;
            info.isLetRing = (data.u16(p + 18) & TablEditImporter._letRingOption) !== 0;
            this._tracks.push(info);
            this._totalStrings += stringCount;
            p += recordSize;
        }
    }

    private _readReadingList(offset: number): TefReadingListItem[] {
        const items: TefReadingListItem[] = [];
        if (offset === 0) {
            return items;
        }
        const recordSize = this._u16(offset);
        if (recordSize !== TablEditImporter._readingListRecordSize) {
            return items;
        }
        const count = this._u16(offset + 2);
        this._ensureLoopBoundary(count, TablEditImporter._maxReadingListCount, 'reading list count');
        let p = offset + 4;
        for (let i = 0; i < count; i++) {
            const item = new TefReadingListItem();
            item.first = this._u16(p) - 1;
            item.last = this._u16(p + 2) - 1;
            item.label = this._readCString(p + 4, recordSize - 4);
            items.push(item);
            p += recordSize;
        }
        return items;
    }

    private _readGuides(cells: TefCell[]): TefReadingGuide[] {
        const guides: TefReadingGuide[] = [];
        for (const cell of cells) {
            if (cell.data[0] === TablEditImporter._readingGuideMarker) {
                const guide = new TefReadingGuide();
                let bar = 0;
                while (bar + 1 < this._measureStarts.length && this._measureStarts[bar + 1] <= cell.position) {
                    bar++;
                }
                guide.bar = bar;
                guide.value = cell.data[2];
                guides.push(guide);
            }
        }
        return guides;
    }

    private _readTexts(offset: number): string[] {
        const texts: string[] = [];
        if (offset === 0) {
            return texts;
        }
        const count = this._u16(offset);
        this._ensureLoopBoundary(count, TablEditImporter._maxTextCount, 'text count');
        let p = offset + 2;
        for (let i = 0; i < count; i++) {
            texts.push(this._readString(p));
            p += 2 + this._u16(p);
        }
        return texts;
    }

    /**
     * Reads the chord diagrams with one fret per string slot. The records do not say which instrument
     * they belong to, the strings are cut to the instrument when the chord is attached.
     */
    private _readChords(offset: number): Chord[] {
        const chords: Chord[] = [];
        if (offset === 0) {
            return chords;
        }
        return this._readChordRecords(offset + 4, this._u16(offset + 2), this._u16(offset));
    }

    private _readChordRecords(offset: number, count: number, recordSize: number): Chord[] {
        const chords: Chord[] = [];
        this._ensureLoopBoundary(count, TablEditImporter._maxChordCount, 'chord count');
        let p = offset;
        for (let i = 0; i < count; i++) {
            const chord = new Chord();
            chord.name = this._readCString(p + 14, 17);
            for (let s = 0; s < TablEditImporter._chordStringBytes; s++) {
                const value = this._u8(p + s);
                chord.strings.push(value === 0xff ? -1 : value & 0x1f);
            }
            const firstFret = this._s8(p + 31);
            chord.firstFret = firstFret > 0 ? firstFret : 1;
            chords.push(chord);
            p += recordSize;
        }
        return chords;
    }

    /**
     * The key shown for an instrument whose written key is shifted by the given number of sharps.
     */
    private static _writtenKey(key: number, shift: number): KeySignature {
        let written = key + shift;
        if (written > 7) {
            written -= 12;
        } else if (written < -7) {
            written += 12;
        }
        return Math.max(-7, Math.min(7, written)) as KeySignature;
    }

    /**
     * The written pitch shift of a transposing instrument in semitones.
     */
    private static _transpositionOf(value: number): number {
        if ((value & 0x03) === 0) {
            return 0;
        }
        const shift = ((((4 - value) * 7) % 12) + 12) % 12;
        return shift === 9 ? -3 : shift;
    }

    private static _clefOf(value: number, openPitches: number[]): Clef {
        switch (value) {
            case 1:
                return Clef.G2;
            case 2:
            case 3:
                return Clef.F4;
            case 4:
                return Clef.C4;
            case 5:
            case 6:
            case 7:
                return Clef.C3;
        }
        let highest = 0;
        let lowest = 127;
        for (const pitch of openPitches) {
            highest = Math.max(highest, pitch);
            lowest = Math.min(lowest, pitch);
        }
        return openPitches.length > 0 && highest < 46 && lowest < 30 ? Clef.F4 : Clef.G2;
    }

    private _readContents(offset: number): TefCell[] {
        const cells: TefCell[] = [];
        if (offset === 0 || this._totalStrings === 0) {
            return cells;
        }
        const totalLength =
            this._measureStarts.length > 0
                ? this._measureStarts[this._measureStarts.length - 1] +
                  this._measureSizes[this._measureSizes.length - 1]
                : 0;
        let p = offset;
        while (true) {
            const location = this._u32(p);
            if (location === TablEditImporter._cellEnd) {
                break;
            }
            this._ensureLoopBoundary(cells.length, TablEditImporter._maxCellCount, 'cell count');
            const slot = Math.floor(location / 8);
            const cell = new TefCell();
            cell.position = Math.floor(slot / this._totalStrings);
            cell.row = slot % this._totalStrings;
            cell.data = this._data.bytes.subarray(p + 4, p + TablEditImporter._cellSize);
            if (cell.position < totalLength) {
                cells.push(cell);
            }
            p += TablEditImporter._cellSize;
        }
        return cells;
    }

    private _readString(offset: number): string {
        if (offset === 0) {
            return '';
        }
        return this._data.readString(offset, this.settings.importer.maxDecodingBufferSize);
    }

    private _readCString(offset: number, maxLength: number): string {
        return this._data.readCString(offset, maxLength);
    }

    private _u8(offset: number): number {
        return this._data.u8(offset);
    }

    private _s8(offset: number): number {
        return this._data.s8(offset);
    }

    private _s16(offset: number): number {
        return this._data.s16(offset);
    }

    private _u16(offset: number): number {
        return this._data.u16(offset);
    }

    private _u32(offset: number): number {
        return this._data.u32(offset);
    }

    private _ensureLoopBoundary(value: number, maximumValue: number, label: string) {
        TefBinary.ensureLoopBoundary(value, maximumValue, label);
    }
}
