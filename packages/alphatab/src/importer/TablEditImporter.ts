import { FormatError } from '@coderline/alphatab/FormatError';
import { ScoreImporter } from '@coderline/alphatab/importer/ScoreImporter';
import { TefBarBuilder, TefCell, TefTrackInfo } from '@coderline/alphatab/importer/tablEdit/TefBarBuilder';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { OverflowError } from '@coderline/alphatab/io/IReadable';
import { Automation } from '@coderline/alphatab/model/Automation';
import { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { Score } from '@coderline/alphatab/model/Score';
import type { Staff } from '@coderline/alphatab/model/Staff';
import { Track } from '@coderline/alphatab/model/Track';

/**
 * This ScoreImporter can read TablEdit (.tef) files of format version 3.
 * @internal
 */
export class TablEditImporter extends ScoreImporter {
    private static readonly _headerSize = 256;
    private static readonly _firstSupportedFormat = 10;
    private static readonly _protectedFormat = 12;
    private static readonly _lastSupportedFormat = 12;
    private static readonly _wideMeasureRecordHeader = 16;
    private static readonly _maxMeasureCount = 10000;
    private static readonly _maxInstrumentCount = 64;
    private static readonly _maxStringCount = 12;
    private static readonly _maxCellCount = 1000000;
    private static readonly _cellSize = 12;
    private static readonly _cellEnd = 4294967295;

    private _bytes!: Uint8Array;
    private _score!: Score;
    private _measureStarts: number[] = [];
    private _measureSizes: number[] = [];
    private _tracks: TefTrackInfo[] = [];
    private _totalStrings: number = 0;

    public get name(): string {
        return 'TablEdit';
    }

    public readScore(): Score {
        this._bytes = this.data.readAll();
        const format = this._detectFormat();
        if (format < TablEditImporter._firstSupportedFormat) {
            throw new FormatError(
                'TablEdit files older than version 3 are not supported, re-save the file with TablEdit 3'
            );
        }
        if (format > TablEditImporter._lastSupportedFormat) {
            throw new FormatError(`TablEdit file format ${format} is newer than the supported format`);
        }
        if (this._u32(16) !== 0 || format === TablEditImporter._protectedFormat) {
            throw new FormatError('Protected TablEdit files are not supported');
        }

        this._score = new Score();
        this._readInformation();
        this._readMeasures(this._u32(92));
        this._readInstruments(this._u32(96));
        const cells = this._readContents(this._u32(60));

        const builder = new TefBarBuilder(this._tracks, this._measureStarts, this._measureSizes);
        builder.build(cells);

        if (this._score.masterBars.length > 0) {
            this._score.masterBars[0].tempoAutomations.push(
                Automation.buildTempoAutomation(false, 0, this._u16(6) > 0 ? this._u16(6) : 120, 2)
            );
        }

        ModelUtils.consolidate(this._score);
        this._score.finish(this.settings);
        this._score.rebuildRepeatGroups();
        return this._score;
    }

    /**
     * Returns the format version of a file that looks like a TablEdit file.
     * Throws an {@link UnsupportedFormatError} for anything else.
     */
    private _detectFormat(): number {
        if (this._bytes.length < TablEditImporter._headerSize) {
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
            this._score.addMasterBar(masterBar);

            let size = (64 / masterBar.timeSignatureDenominator) * masterBar.timeSignatureNumerator;
            if (size <= 0 || size > 1024 || size !== Math.floor(size)) {
                size = 64;
            }
            this._measureStarts.push(position);
            this._measureSizes.push(size);
            position += size;
            p += recordSize;
        }
    }

    private _readInstruments(offset: number): void {
        if (offset === 0) {
            throw new FormatError('TablEdit file without instruments');
        }
        const recordSize = this._u16(offset);
        const count = this._u16(offset + 2);
        this._ensureLoopBoundary(count, TablEditImporter._maxInstrumentCount, 'instrument count');
        let p = offset + 4;
        for (let i = 0; i < count; i++) {
            const stringCount = this._u16(p);
            this._ensureLoopBoundary(stringCount, TablEditImporter._maxStringCount, 'string count');

            const track = new Track();
            track.ensureStaveCount(1);
            const staff: Staff = track.staves[0];
            this._score.addTrack(track);
            track.name = this._readCString(p + 32, 36);
            track.playbackInfo.program = this._u8(p + 8);
            track.playbackInfo.bank = this._u8(p + 9);

            const capo = this._u16(p + 12);
            staff.capo = capo;
            const tuning: number[] = [];
            for (let s = 0; s < stringCount; s++) {
                tuning.push(96 - this._u8(p + 20 + s) - capo);
            }
            staff.stringTuning.tunings = tuning;
            staff.displayTranspositionPitch = this._s8(p + 14) - 12;
            staff.showTablature = true;
            staff.showStandardNotation = true;

            const info = new TefTrackInfo();
            info.track = track;
            info.firstString = this._totalStrings;
            info.stringCount = stringCount;
            this._tracks.push(info);
            this._totalStrings += stringCount;
            p += recordSize;
        }
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
            cell.data = this._bytes.subarray(p + 4, p + TablEditImporter._cellSize);
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
        const length = this._u16(offset);
        this._ensureLoopBoundary(length, this.settings.importer.maxDecodingBufferSize, 'string length');
        this._requireRange(offset + 2, length);
        let end = offset + 2 + length;
        while (end > offset + 2 && this._bytes[end - 1] === 0) {
            end--;
        }
        return TablEditImporter._decode(this._bytes.subarray(offset + 2, end));
    }

    private _readCString(offset: number, maxLength: number): string {
        this._requireRange(offset, maxLength);
        let end = offset;
        while (end < offset + maxLength && this._bytes[end] !== 0) {
            end++;
        }
        return TablEditImporter._decode(this._bytes.subarray(offset, end));
    }

    /**
     * Texts are UTF-8, but older files may still carry Windows-1252 text.
     */
    private static _decode(data: Uint8Array): string {
        return IOHelper.toString(data, TablEditImporter._isValidUtf8(data) ? 'utf-8' : 'windows-1252');
    }

    private static _isValidUtf8(data: Uint8Array): boolean {
        let i = 0;
        while (i < data.length) {
            const b = data[i];
            let follow = 0;
            if (b < 0x80) {
                follow = 0;
            } else if (b >= 0xc2 && b <= 0xdf) {
                follow = 1;
            } else if (b >= 0xe0 && b <= 0xef) {
                follow = 2;
            } else if (b >= 0xf0 && b <= 0xf4) {
                follow = 3;
            } else {
                return false;
            }
            if (i + follow >= data.length && follow > 0) {
                return false;
            }
            for (let k = 1; k <= follow; k++) {
                if ((data[i + k] & 0xc0) !== 0x80) {
                    return false;
                }
            }
            i += follow + 1;
        }
        return true;
    }

    private _requireRange(offset: number, length: number): void {
        if (offset < 0 || offset + length > this._bytes.length) {
            throw new FormatError(`TablEdit data at ${offset} (${length} bytes) is outside of the file`);
        }
    }

    private _u8(offset: number): number {
        this._requireRange(offset, 1);
        return this._bytes[offset];
    }

    private _s8(offset: number): number {
        const v = this._u8(offset);
        return v > 127 ? v - 256 : v;
    }

    private _u16(offset: number): number {
        this._requireRange(offset, 2);
        return this._bytes[offset] | (this._bytes[offset + 1] << 8);
    }

    private _u32(offset: number): number {
        this._requireRange(offset, 4);
        const b = this._bytes;
        return (b[offset] | (b[offset + 1] << 8) | (b[offset + 2] << 16)) + b[offset + 3] * 16777216;
    }

    private _ensureLoopBoundary(value: number, maximumValue: number, label: string) {
        if (value > maximumValue) {
            throw new OverflowError(
                `'${label}' with value ${value} has exceeded the internal safety threshold of ${maximumValue}`
            );
        }
    }
}
