import { FormatError } from '@coderline/alphatab/FormatError';
import { TefBinary } from '@coderline/alphatab/importer/tablEdit/TefBinary';
import { TefCell } from '@coderline/alphatab/importer/tablEdit/TefCell';
import { TefReadingListItem } from '@coderline/alphatab/importer/tablEdit/TefReadingList';
import { Logger } from '@coderline/alphatab/Logger';

/**
 * A measure of a TablEdit 2 file.
 * @internal
 */
export class TefFormat2Measure {
    public numerator: number = 4;
    public denominator: number = 4;
    /**
     * The size in 1/64 notes.
     */
    public size: number = 64;
    /**
     * The 1/64 notes the measure is shorter than the longest measure. Its content is right-aligned.
     */
    public cut: number = 0;
    public key: number = 0;
    public isMinor: boolean = false;
}

/**
 * Reads the blocks of a TablEdit 2 file (formats 3 to 9) and translates its grid into the cells of the
 * current format, so that the bar builder and the reading list apply unchanged.
 * @internal
 */
export class TefFormat2Reader {
    private static readonly _stringAreaSize = 200;
    private static readonly _cellsOffset = 0x100;
    private static readonly _cellRecordSize = 6;
    private static readonly _indexUnitsPerCell = 4;
    private static readonly _indexWrap = 0x10000;
    private static readonly _maxReadingListCount = 96;
    private static readonly _wideReadingListMeasures = 255;
    private static readonly _maxInstrumentIndex = 16;
    private static readonly _patternRecordSize = 108;
    private static readonly _chordRecordSize = 32;
    private static readonly _instrumentRecordSize = 50;
    private static readonly _layoutBlockMarker = 0x1e0;
    private static readonly _layoutBlockSize = 480;
    private static readonly _accordionBlockMarker = 0x10;
    private static readonly _wideAccordionMarker = 0x20;
    private static readonly _accordionHeaderSize = 50;
    private static readonly _accordionButtonsSize = 100;
    private static readonly _wideAccordionButtonsSize = 200;
    private static readonly _maxLabelEntry = 0x60;
    private static readonly _bitmapTag = 0x101;
    private static readonly _bitmapHeaderSize = 20;
    private static readonly _trackSettingsFlag = 0x01;
    private static readonly _trackSettingsSize = 28;
    private static readonly _printSettingsFlag = 0x02;
    private static readonly _extendedSettingsFlag = 0x80;
    private static readonly _printSettingsSizes = [0x74, 0x74, 0x74, 0x74, 0x74, 0x74, 0x74, 0x11c, 300, 300];
    private static readonly _extendedSettingsSize = 0x28e;
    private static readonly _minorKeyOffset = 8;
    private static readonly _perMeasureKeyOffset = 16;
    private static readonly _defaultTempo = 120;
    private static readonly _maxStringCount = 12;
    private static readonly _maxMeasureSize = 255;

    private static readonly _lastFretField = 0x19;
    private static readonly _restCell = 0x1a;
    private static readonly _measureCell = 0x1b;
    private static readonly _chordCell = 0x1c;
    private static readonly _textCell = 0x1d;
    private static readonly _accentCell = 0x1e;
    private static readonly _crescendoCell = 0x9e;
    private static readonly _connectionCell = 0x3d;
    private static readonly _strokeCell = 0x3e;
    private static readonly _readingGuideCell = 0x5e;
    private static readonly _lineBreakCell = 0x9d;
    private static readonly _symbolCell = 0xdd;
    private static readonly _tempoCell = 0xfe;
    private static readonly _syncopationCell = 0xfd;
    private static readonly _patchCell = 0x7e;
    private static readonly _bitmapTextFont = 8;

    private static readonly _noteKindMask = 0xe0;
    private static readonly _fingeringKind = 0x20;
    private static readonly _graceKind = 0x40;
    private static readonly _fontKind = 0x60;
    private static readonly _attributeKind = 0x80;
    private static readonly _pitchChangeKind = 0xa0;
    private static readonly _gracePitchKind = 0xc0;
    private static readonly _graceExtendedKind = 0xe0;
    private static readonly _voiceMask = 0x30;
    /**
     * The voice value of a stabilo note, which moves to its own flag.
     */
    private static readonly _stabiloVoice = 0x10;

    private static readonly _noBeamAttribute = 0x0b;
    private static readonly _noStemAttribute = 0x0c;
    private static readonly _ottavaBassaAttribute = 0xc0;
    private static readonly _ottavaAltaAttribute = 0xd0;
    private static readonly _noStemFlag = 0x04;
    private static readonly _restHiddenInNotationBits = 0x42;
    private static readonly _restHiddenInTabBit = 0x10;
    private static readonly _symbolNumberOffset = 100;
    private static readonly _securityCodeOffset = 208;

    private static readonly _currentRecordSize = 68;
    private static readonly _currentDrumFlag = 0x80;
    private static readonly _drumOutput = 89;
    private static readonly _displayModeMask = 0x30;

    private _data: TefBinary;
    private _maxStringLength: number;
    private _p: number = 0;
    private _cells: TefCell[] = [];

    public title: string = '';
    public author: string = '';
    public comment: string = '';
    public notes: string = '';
    public lyrics: string = '';
    public tempo: number = TefFormat2Reader._defaultTempo;
    public syncopation: number = 0;
    public version: number = 0;
    public totalStrings: number = 0;
    public measures: TefFormat2Measure[] = [];
    public texts: string[] = [];
    public chordsOffset: number = 0;
    public chordCount: number = 0;
    public readonly chordRecordSize: number = TefFormat2Reader._chordRecordSize;
    /**
     * The instrument records in the layout of the current format.
     */
    public instruments: TefBinary = new TefBinary(new Uint8Array(0));
    public instrumentCount: number = 0;
    public readonly instrumentRecordSize: number = TefFormat2Reader._currentRecordSize;
    public readingList: TefReadingListItem[] = [];

    public constructor(data: TefBinary, maxStringLength: number) {
        this._data = data;
        this._maxStringLength = maxStringLength;
    }

    public get cells(): TefCell[] {
        return this._cells;
    }

    public read(): void {
        const d = this._data;
        if (d.u16(TefFormat2Reader._securityCodeOffset) !== 0) {
            throw new FormatError('Protected TablEdit files are not supported');
        }
        this._readHeaderStrings();
        const measureCount = d.u16(200);
        const numerator = d.u16(202);
        const denominator = d.u8(204);
        const format = d.u8(205);
        const longestMeasure = (64 / denominator) * numerator;
        let key = d.s16(206);
        const printOptions = d.u8(214);
        this.tempo = d.u16(220) > 0 ? d.u16(220) : TefFormat2Reader._defaultTempo;
        const readingListCount = d.u8(222);
        this.syncopation = d.s8(224);
        const labelCount = d.u8(225);
        const hasLayout = d.u16(226) === TefFormat2Reader._layoutBlockMarker;
        const textCount = d.u16(228);
        const accordion = d.u8(232);
        const drumPatterns = d.u8(234);
        const rhythmPatterns = d.u8(235);
        this.chordCount = d.u16(236);
        const hasNotes = d.u8(238) !== 0;
        this.totalStrings = d.u8(240);
        const lastInstrument = d.u8(241);
        const hasMeasureFlags = d.u16(244) !== 0;
        this.version = d.u16(246);
        const hasBitmap = (d.u8(248) & 0x01) !== 0;
        const hasLyrics = d.u8(250) !== 0;

        if (measureCount === 0) {
            throw new FormatError('TablEdit file without measures');
        }
        if (longestMeasure > TefFormat2Reader._maxMeasureSize) {
            throw new FormatError(`TablEdit 2 measures of ${longestMeasure} 1/64 notes are not supported`);
        }
        if (this.totalStrings === 0 || lastInstrument > TefFormat2Reader._maxInstrumentIndex) {
            throw new FormatError('TablEdit file without instruments');
        }

        const hasMeasureKeys = Math.abs(key) >= TefFormat2Reader._perMeasureKeyOffset;
        if (hasMeasureKeys) {
            key += key > 0 ? -TefFormat2Reader._perMeasureKeyOffset : TefFormat2Reader._perMeasureKeyOffset;
        }
        const isMinor = Math.abs(key) >= TefFormat2Reader._minorKeyOffset;
        if (isMinor) {
            key += key > 0 ? -TefFormat2Reader._minorKeyOffset : TefFormat2Reader._minorKeyOffset;
        }
        for (let i = 0; i < measureCount; i++) {
            const measure = new TefFormat2Measure();
            measure.numerator = numerator;
            measure.denominator = denominator;
            measure.size = longestMeasure;
            measure.key = key;
            measure.isMinor = isMinor;
            this.measures.push(measure);
        }

        this._p = TefFormat2Reader._cellsOffset;
        const raw = this._readRawCells(longestMeasure);
        this._readReadingList(readingListCount, measureCount);
        for (let i = 0; i < textCount; i++) {
            this.texts.push(this._readString());
        }
        if (drumPatterns > 0) {
            Logger.warning('TablEdit', 'Drum patterns of TablEdit 2 files are not imported');
            this._skip(drumPatterns * TefFormat2Reader._patternRecordSize + measureCount);
        }
        this.chordsOffset = this._p;
        this._skip(this.chordCount * TefFormat2Reader._chordRecordSize);
        if (rhythmPatterns > 0) {
            Logger.warning('TablEdit', 'Rhythm patterns of TablEdit 2 files are not imported');
            this._skip(rhythmPatterns * TefFormat2Reader._patternRecordSize + measureCount);
        }
        if (hasNotes) {
            this.notes = this._readString();
        }
        this._readInstruments(lastInstrument + 1, hasLayout);
        if (hasMeasureKeys) {
            for (let i = 0; i < measureCount; i++) {
                this.measures[i].key = d.s8(this._p + i);
            }
            this._skip(measureCount);
        }
        if (hasLayout) {
            this._skip(TefFormat2Reader._layoutBlockSize);
        }
        if (accordion >= TefFormat2Reader._accordionBlockMarker) {
            this._skip(
                TefFormat2Reader._accordionHeaderSize +
                    (accordion < TefFormat2Reader._wideAccordionMarker
                        ? TefFormat2Reader._accordionButtonsSize
                        : TefFormat2Reader._wideAccordionButtonsSize)
            );
        }
        if (hasMeasureFlags) {
            this._skip(measureCount * 2);
        }
        if ((printOptions & TefFormat2Reader._trackSettingsFlag) !== 0) {
            this._skip(TefFormat2Reader._trackSettingsSize);
        }
        if ((printOptions & TefFormat2Reader._printSettingsFlag) !== 0) {
            this._skip(TefFormat2Reader._printSettingsSize(format));
        }
        this._readLabels(labelCount);
        if (hasBitmap) {
            this._skipBitmap();
        }
        if (hasLyrics) {
            this.lyrics = this._readString();
        }
        if ((printOptions & TefFormat2Reader._extendedSettingsFlag) !== 0) {
            const size = d.u16(this._p);
            this._skip(Math.max(size, TefFormat2Reader._extendedSettingsSize));
        }

        this._applyMeasureChanges(raw, longestMeasure);
        this._convertCells(raw);
    }

    private static _printSettingsSize(format: number): number {
        return TefFormat2Reader._printSettingsSizes[Math.min(format, TefFormat2Reader._printSettingsSizes.length - 1)];
    }

    private _readHeaderStrings(): void {
        const strings: string[] = [];
        let start = 0;
        for (let i = 0; i < 3; i++) {
            let end = start;
            while (end < TefFormat2Reader._stringAreaSize && this._data.u8(end) !== 0) {
                end++;
            }
            strings.push(TefBinary.decode(this._data.bytes.subarray(start, end)));
            start = Math.min(end + 1, TefFormat2Reader._stringAreaSize);
        }
        this.title = strings[0];
        this.author = strings[1];
        this.comment = strings[2];
    }

    private _skip(length: number): void {
        this._data.requireRange(this._p, length);
        this._p += length;
    }

    private _readString(): string {
        const value = this._data.readString(this._p, this._maxStringLength);
        this._p += 2 + this._data.u16(this._p);
        return value;
    }

    /**
     * Reads the grid records as measure, row, position and the four data bytes.
     */
    private _readRawCells(longestMeasure: number): number[] {
        const d = this._data;
        const count = d.u16(this._p);
        this._p += 2;
        d.requireRange(this._p, count * TefFormat2Reader._cellRecordSize);
        const raw: number[] = [];
        const measureSlots = longestMeasure * this.totalStrings;
        let wrap = 0;
        let previous = 0;
        for (let i = 0; i < count; i++) {
            const stored = d.u16(this._p);
            if (stored < previous) {
                wrap += TefFormat2Reader._indexWrap;
            }
            previous = stored;
            const slot = Math.floor((stored + wrap) / TefFormat2Reader._indexUnitsPerCell);
            const measure = Math.floor(slot / measureSlots);
            const inMeasure = slot % measureSlots;
            raw.push(measure);
            raw.push(Math.floor(inMeasure / longestMeasure));
            raw.push(inMeasure % longestMeasure);
            for (let k = 2; k < TefFormat2Reader._cellRecordSize; k++) {
                raw.push(d.u8(this._p + k));
            }
            this._p += TefFormat2Reader._cellRecordSize;
        }
        return raw;
    }

    /**
     * Reads the reading list; a list longer than TablEdit allows is skipped.
     */
    private _readReadingList(count: number, measureCount: number): void {
        const wide = measureCount > TefFormat2Reader._wideReadingListMeasures;
        if (count > TefFormat2Reader._maxReadingListCount) {
            this._skip(count * (wide ? 4 : 2));
            return;
        }
        for (let i = 0; i < count; i++) {
            const item = new TefReadingListItem();
            if (wide) {
                item.first = this._data.u16(this._p) - 1;
                item.last = this._data.u16(this._p + 2) - 1;
                this._p += 4;
            } else {
                item.first = this._data.u8(this._p) - 1;
                item.last = this._data.u8(this._p + 1) - 1;
                this._p += 2;
            }
            this.readingList.push(item);
        }
    }

    private _readLabels(count: number): void {
        for (let i = 0; i < count; i++) {
            const length = this._data.u16(this._p);
            const entry = this._data.u16(this._p + 2);
            this._p += 4;
            if (length > 0 && entry < TefFormat2Reader._maxLabelEntry && entry < this.readingList.length) {
                this.readingList[entry].label = this._data.readCString(this._p, length);
            }
            this._skip(length);
        }
    }

    private _skipBitmap(): void {
        const size = this._data.u32(this._p);
        const tag = this._data.u32(this._p + 4);
        this._p += 8;
        if (tag === TefFormat2Reader._bitmapTag) {
            const height = this._data.u32(this._p + 8);
            const rowBytes = this._data.u32(this._p + 12);
            const pixels = height * rowBytes;
            this._skip(TefFormat2Reader._bitmapHeaderSize);
            this._skip(Math.max(0, size - pixels - TefFormat2Reader._bitmapHeaderSize) + pixels);
        }
    }

    /**
     * Copies the instrument records into the record layout of the current format.
     */
    private _readInstruments(count: number, hasLayout: boolean): void {
        const size = TefFormat2Reader._currentRecordSize;
        const records = new Uint8Array(count * size);
        this._data.requireRange(this._p, count * TefFormat2Reader._instrumentRecordSize);
        let strings = 0;
        for (let i = 0; i < count; i++) {
            const source = this._p;
            const target = i * size;
            records.set(this._data.bytes.subarray(source, source + TefFormat2Reader._instrumentRecordSize), target);
            const stringCount = this._data.u16(source);
            TefBinary.ensureLoopBoundary(stringCount, TefFormat2Reader._maxStringCount, 'string count');
            strings += stringCount;
            records[target + 8] &= 0x7f;
            const middleC = this._data.s8(source + 14);
            if (middleC !== 24 && middleC !== 12 && middleC !== -12) {
                records[target + 14] = 0;
            }
            const clef = this._data.u8(source + 15);
            if (clef < 1 || clef > 24) {
                records[target + 15] = 0;
            }
            if (!hasLayout) {
                // without a layout block every instrument shows notation and tablature
                records[target + 16] &= ~TefFormat2Reader._displayModeMask;
            }
            records[target + 4] =
                this._data.s16(source + 6) > TefFormat2Reader._drumOutput ? TefFormat2Reader._currentDrumFlag : 0;
            this._p += TefFormat2Reader._instrumentRecordSize;
        }
        if (strings !== this.totalStrings) {
            throw new FormatError(`TablEdit instruments have ${strings} strings instead of ${this.totalStrings}`);
        }
        this.instruments = new TefBinary(records);
        this.instrumentCount = count;
    }

    /**
     * Measures shorter than the longest one carry their size and denominator in a cell at their start.
     */
    private _applyMeasureChanges(raw: number[], longestMeasure: number): void {
        for (let i = 0; i < raw.length; i += 7) {
            const measure = raw[i];
            const kind: number = raw[i + 3] & 0x1f;
            if (
                kind !== TefFormat2Reader._measureCell ||
                raw[i + 1] !== 0 ||
                raw[i + 2] >= 2 ||
                measure >= this.measures.length
            ) {
                continue;
            }
            const cut = raw[i + 4];
            const denominatorCode = raw[i + 3] >> 5;
            const m = this.measures[measure];
            if (cut >= longestMeasure) {
                continue;
            }
            let denominator = denominatorCode > 0 ? 1 << (denominatorCode - 1) : m.denominator;
            const size = longestMeasure - cut;
            while (denominator < 64 && size % (64 / denominator) !== 0) {
                denominator *= 2;
            }
            m.cut = cut;
            m.size = size;
            m.denominator = denominator;
            m.numerator = size / (64 / denominator);
        }
    }

    private _convertCells(raw: number[]): void {
        const starts: number[] = [];
        let position = 0;
        for (const m of this.measures) {
            starts.push(position);
            position += m.size;
        }
        const byLocation = new Map<string, TefCell>();
        for (let i = 0; i < raw.length; i += 7) {
            const measure = raw[i];
            const row = raw[i + 1];
            const column = raw[i + 2];
            if (measure >= this.measures.length || row >= this.totalStrings) {
                continue;
            }
            const m = this.measures[measure];
            if (column < m.cut) {
                continue;
            }
            const cellPosition = starts[measure] + column - m.cut;
            const b1 = raw[i + 3];
            const b2 = raw[i + 4];
            const b3 = raw[i + 5];
            const b4 = raw[i + 6];
            if (b1 === TefFormat2Reader._strokeCell && b2 === 0 && b3 === 0) {
                const previous = byLocation.get(`${row}:${cellPosition - 1}`);
                if (previous && TefFormat2Reader._isNote(previous) && previous.data[6] === 0) {
                    previous.data[6] = b4;
                    continue;
                }
            }
            const data = TefFormat2Reader._convert(b1, b2, b3, b4);
            if (data) {
                const cell = new TefCell();
                cell.position = cellPosition;
                cell.row = row;
                cell.data = data;
                this._cells.push(cell);
                byLocation.set(`${row}:${cellPosition}`, cell);
            }
        }
    }

    private static _isNote(cell: TefCell): boolean {
        return (cell.data[0] & TefCell.typeMask) < TefCell.rest;
    }

    /**
     * The eight cell bytes of the current format for a 2.x cell, null for cells without a counterpart.
     */
    private static _convert(b1: number, b2: number, b3: number, b4: number): Uint8Array | null {
        const fretField = b1 & 0x1f;
        if (fretField > 0 && fretField <= TefFormat2Reader._lastFretField) {
            return TefFormat2Reader._convertNote(b1, b2, b3, b4);
        }
        const data = new Uint8Array(8);
        switch (b1) {
            case TefFormat2Reader._restCell:
                data[0] = TefCell.rest;
                data[1] = b2;
                data[2] = b3 & TefFormat2Reader._voiceMask;
                if ((b3 & TefFormat2Reader._restHiddenInNotationBits) !== 0) {
                    data[7] |= TefCell.restHiddenInNotationFlag;
                }
                if ((b3 & TefFormat2Reader._restHiddenInTabBit) !== 0) {
                    data[7] |= TefCell.restHiddenInTabFlag;
                }
                return data;
            case TefFormat2Reader._chordCell:
                data[0] = TefCell.chordMarker;
                data[1] = b2;
                return data;
            case TefFormat2Reader._textCell: {
                const font: number = b3 & 0x0f;
                if (font === TefFormat2Reader._bitmapTextFont) {
                    return null;
                }
                data[0] = TefCell.textMarker;
                data[1] = b2;
                return data;
            }
            case TefFormat2Reader._accentCell:
                data[0] = TefCell.accentMarker;
                return data;
            case TefFormat2Reader._crescendoCell:
                data[0] = TefCell.crescendoMarker;
                data[1] = b2;
                data[2] = (((b2 & 0x0f) * 4 + b3) * 4) & 0xff;
                return data;
            case TefFormat2Reader._connectionCell:
                data[0] = b1;
                data[1] = b2 & 0x3f;
                data[2] = b3;
                data[3] = b4;
                return data;
            case TefFormat2Reader._strokeCell:
                data[0] = b1;
                data[3] = b3;
                data[4] = b2;
                data[6] = b4;
                return data;
            case TefFormat2Reader._readingGuideCell:
                data[0] = TefCell.readingGuideMarker;
                data[2] = b3;
                return data;
            case TefFormat2Reader._lineBreakCell:
                data[0] = TefCell.lineBreakMarker;
                data[5] = b4 & 0x0f;
                data[7] = b2;
                return data;
            case TefFormat2Reader._symbolCell:
                data[0] = TefCell.symbolMarker;
                data[1] = ((b2 & 0x7f) + TefFormat2Reader._symbolNumberOffset) & 0xff;
                return data;
            case TefFormat2Reader._tempoCell:
            case TefFormat2Reader._syncopationCell:
            case TefFormat2Reader._patchCell:
                data[0] = b1;
                data[1] = b2;
                data[2] = b3;
                data[3] = b4;
                return data;
        }
        return null;
    }

    /**
     * Notes keep fret, duration, dynamics, effect, voice and accidental. The top bits of the first byte say
     * what the fourth byte holds.
     */
    private static _convertNote(b1: number, b2: number, b3: number, b4: number): Uint8Array {
        const data = new Uint8Array(8);
        let fretField = b1 & 0x1f;
        data[1] = b2;
        data[2] = b3;
        const voice: number = b3 & TefFormat2Reader._voiceMask;
        if (voice === TefFormat2Reader._stabiloVoice) {
            data[2] = b3 & ~TefFormat2Reader._voiceMask;
            data[5] = TefFormat2Reader._stabiloVoice;
        }
        let flags = 0;
        switch (b1 & TefFormat2Reader._noteKindMask) {
            case TefFormat2Reader._fingeringKind:
                data[6] = b4;
                break;
            case TefFormat2Reader._graceKind:
                flags = TefCell.graceFlag;
                data[3] = b4;
                break;
            case TefFormat2Reader._fontKind:
                break;
            case TefFormat2Reader._attributeKind:
                TefFormat2Reader._applyAttribute(data, b4);
                break;
            case TefFormat2Reader._pitchChangeKind:
            case TefFormat2Reader._graceExtendedKind:
                flags = b1 & (TefCell.graceFlag | TefCell.pitchChangeFlag);
                if (fretField === TefFormat2Reader._lastFretField) {
                    fretField += b4 & 0x1f;
                    flags &= ~TefCell.pitchChangeFlag;
                } else {
                    data[3] = b4;
                }
                break;
            case TefFormat2Reader._gracePitchKind:
                flags = TefCell.graceFlag | TefCell.pitchChangeFlag;
                data[3] = b4;
                break;
            default:
                data[3] = b4;
                break;
        }
        data[0] = fretField | flags;
        return data;
    }

    private static _applyAttribute(data: Uint8Array, value: number): void {
        switch (value) {
            case TefFormat2Reader._noBeamAttribute:
                data[7] = TefCell.excludeFromBeaming;
                break;
            case TefFormat2Reader._noStemAttribute:
                data[7] = TefFormat2Reader._noStemFlag;
                break;
            case TefFormat2Reader._ottavaBassaAttribute:
                data[7] = TefCell.ottavaBassa;
                break;
            case TefFormat2Reader._ottavaAltaAttribute:
                data[7] = TefCell.ottavaAlta;
                break;
            default:
                data[4] = value;
                break;
        }
    }
}
