/*
 * This file contains a copy of the "old" alphaTex importer
 * used until 1.6.x for cross referencing purposes
 */
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { BeatCloner } from '@src/generated/model/BeatCloner';
import { AlphaTexAccidentalMode } from '@src/importer/alphaTex/AlphaTexShared';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';
import { Logger } from '@src/Logger';
import { GeneralMidi } from '@src/midi/GeneralMidi';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType, type FlatSyncPoint } from '@src/model/Automation';
import { Bar, BarLineStyle, SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { BarreShape } from '@src/model/BarreShape';
import { Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Color } from '@src/model/Color';
import { CrescendoType } from '@src/model/CrescendoType';
import { Direction } from '@src/model/Direction';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { FadeType } from '@src/model/FadeType';
import { Fermata, FermataType } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GolpeType } from '@src/model/GolpeType';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { ModelUtils, type TuningParseResult } from '@src/model/ModelUtils';
import { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Ottavia } from '@src/model/Ottavia';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { PickStroke } from '@src/model/PickStroke';
import { Rasgueado } from '@src/model/Rasgueado';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { Score, ScoreSubElement } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { WahPedal } from '@src/model/WahPedal';
import { WhammyType } from '@src/model/WhammyType';
import { TextAlign } from '@src/platform/ICanvas';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import type { Settings } from '@src/Settings';
import { SynthConstants } from '@src/synth/SynthConstants';

/**
 * A list of terminals recognized by the alphaTex-parser
 * @public
 */
export enum AlphaTexSymbols {
    No = 0,
    Eof = 1,
    Number = 2,
    DoubleDot = 3,
    Dot = 4,
    String = 5,
    Tuning = 6,
    LParensis = 7,
    RParensis = 8,
    LBrace = 9,
    RBrace = 10,
    Pipe = 11,
    MetaCommand = 12,
    Multiply = 13,
    LowerThan = 14
}

/**
 * @internal
 */
enum StaffMetaResult {
    KnownStaffMeta = 0,
    UnknownStaffMeta = 1,
    EndOfMetaDetected = 2
}

/**
 * @public
 */
export class AlphaTexError extends AlphaTabError {
    public position: number;
    public line: number;
    public col: number;
    public nonTerm: string;
    public expected: AlphaTexSymbols;
    public symbol: AlphaTexSymbols;
    public symbolData: unknown;

    public constructor(
        message: string | null,
        position: number,
        line: number,
        col: number,
        nonTerm: string | null,
        expected: AlphaTexSymbols | null,
        symbol: AlphaTexSymbols | null,
        symbolData: unknown = null
    ) {
        super(AlphaTabErrorType.AlphaTex, message);
        this.position = position;
        this.line = line;
        this.col = col;
        this.nonTerm = nonTerm ?? '';
        this.expected = expected ?? AlphaTexSymbols.No;
        this.symbol = symbol ?? AlphaTexSymbols.No;
        this.symbolData = symbolData;
    }

    public static symbolError(
        position: number,
        line: number,
        col: number,
        nonTerm: string,
        expected: AlphaTexSymbols,
        symbol: AlphaTexSymbols,
        symbolData: unknown = null
    ): AlphaTexError {
        let message = `MalFormed AlphaTex: @${position} (line ${line}, col ${col}): Error on block ${nonTerm}`;
        if (expected !== symbol) {
            message += `, expected a ${AlphaTexSymbols[expected]} found a ${AlphaTexSymbols[symbol]}`;
            if (symbolData !== null) {
                message += `: '${symbolData}'`;
            }
        } else {
            message += `, invalid value: '${symbolData}'`;
        }
        return new AlphaTexError(message, position, line, col, nonTerm, expected, symbol, symbolData);
    }

    public static errorMessage(message: string, position: number, line: number, col: number): AlphaTexError {
        message = `MalFormed AlphaTex: @${position} (line ${line}, col ${col}): ${message}`;
        return new AlphaTexError(message, position, line, col, null, null, null, null);
    }
}

/**
 * @record
 * @internal
 */
interface AlphaTexTokenLocation {
    line: number;
    col: number;
    offset: number;
}

/**
 * @record
 * @internal
 */
interface AlphaTexTokenInfo {
    symbolType: AlphaTexSymbols;
    tokenType: string;
    start: AlphaTexTokenLocation;
    end: AlphaTexTokenLocation;
}

export class AlphaTexLexerOld {
    private static readonly _eof: number = 0;

    private _position: number = 0;
    private _line: number = 1;
    private _col: number = 0;

    private _codepoints: number[];
    private _codepoint: number = AlphaTexLexer._eof;

    public sy: AlphaTexSymbols = AlphaTexSymbols.No;
    public syData: unknown = '';
    public syStart: AlphaTexTokenLocation = { line: 0, col: 0, offset: 0 };
    public syEnd: AlphaTexTokenLocation = { line: 0, col: 0, offset: 0 };

    public buildTokenInfo(tokenType: string): AlphaTexTokenInfo {
        return {
            symbolType: this.sy,
            tokenType,
            start: this.syStart,
            end: this.syEnd
        };
    }

    public lastValidSpot: number[] = [0, 1, 0];

    public allowTuning: boolean = false;
    public logErrors: boolean = true;

    public constructor(input: string) {
        this._codepoints = [...IOHelper.iterateCodepoints(input)];
    }

    public init(allowFloats: boolean = false) {
        this._position = 0;
        this._line = 1;
        this._col = 0;
        this._saveValidSpot();

        this._codepoint = this._nextCodepoint();
        this.sy = this.newSy(allowFloats);
    }

    /**
     * Saves the current position, line, and column.
     * All parsed data until this point is assumed to be valid.
     */
    private _saveValidSpot(): void {
        this.lastValidSpot = [this._position, this._line, this._col];
        this.syStart = {
            line: this._line,
            col: this._col,
            offset: this._position
        };
    }

    /**
     * Reads, saves, and returns the next character of the source stream.
     */
    private _nextCodepoint(): number {
        if (this._position < this._codepoints.length) {
            this._codepoint = this._codepoints[this._position++];
            // line/col countingF
            if (this._codepoint === 0x0a /* \n */) {
                this._line++;
                this._col = 0;
            } else {
                this._col++;
            }
        } else {
            this._codepoint = AlphaTexLexer._eof;
        }
        return this._codepoint;
    }

    /**
     * Reads, saves, and returns the next terminal symbol.
     */
    public newSy(allowFloats: boolean = false): AlphaTexSymbols {
        // When a new symbol is read, the previous one is assumed to be valid.
        // The valid spot is also moved forward when reading past whitespace or comments.
        this._saveValidSpot();
        this.sy = AlphaTexSymbols.No;
        while (this.sy === AlphaTexSymbols.No) {
            this.syData = null;

            if (this._codepoint === AlphaTexLexer._eof) {
                this.sy = AlphaTexSymbols.Eof;
            } else if (AlphaTexLexer._isWhiteSpace(this._codepoint)) {
                // skip whitespaces
                this._codepoint = this._nextCodepoint();
                this._saveValidSpot();
            } else if (this._codepoint === 0x2f /* / */) {
                this._codepoint = this._nextCodepoint();
                if (this._codepoint === 0x2f /* / */) {
                    // single line comment
                    while (
                        this._codepoint !== 0x0d /* \r */ &&
                        this._codepoint !== 0x0a /* \n */ &&
                        this._codepoint !== AlphaTexLexer._eof
                    ) {
                        this._codepoint = this._nextCodepoint();
                    }
                } else if (this._codepoint === 0x2a /* * */) {
                    // multiline comment
                    while (this._codepoint !== AlphaTexLexer._eof) {
                        if (this._codepoint === 0x2a /* * */) {
                            this._codepoint = this._nextCodepoint();
                            if (this._codepoint === 0x2f /* / */) {
                                this._codepoint = this._nextCodepoint();
                                break;
                            }
                        } else {
                            this._codepoint = this._nextCodepoint();
                        }
                    }
                } else {
                    this._errorMessage(`Unexpected character ${String.fromCodePoint(this._codepoint)}`);
                }
                this._saveValidSpot();
            } else if (this._codepoint === 0x22 /* " */ || this._codepoint === 0x27 /* ' */) {
                const startChar: number = this._codepoint;
                this._codepoint = this._nextCodepoint();
                let s: string = '';
                this.sy = AlphaTexSymbols.String;

                let previousCodepoint: number = -1;

                while (this._codepoint !== startChar && this._codepoint !== AlphaTexLexer._eof) {
                    // escape sequences
                    let codepoint = -1;

                    if (this._codepoint === 0x5c /* \ */) {
                        this._codepoint = this._nextCodepoint();
                        if (this._codepoint === 0x5c /* \\ */) {
                            codepoint = 0x5c;
                        } else if (this._codepoint === startChar /* \<startchar> */) {
                            codepoint = startChar;
                        } else if (this._codepoint === 0x52 /* \R */ || this._codepoint === 0x72 /* \r */) {
                            codepoint = 0x0d;
                        } else if (this._codepoint === 0x4e /* \N */ || this._codepoint === 0x6e /* \n */) {
                            codepoint = 0x0a;
                        } else if (this._codepoint === 0x54 /* \T */ || this._codepoint === 0x74 /* \t */) {
                            codepoint = 0x09;
                        } else if (this._codepoint === 0x75 /* \u */) {
                            // \uXXXX
                            let hex = '';

                            for (let i = 0; i < 4; i++) {
                                this._codepoint = this._nextCodepoint();
                                if (this._codepoint === AlphaTexLexer._eof) {
                                    this._errorMessage('Unexpected end of escape sequence');
                                }
                                hex += String.fromCodePoint(this._codepoint);
                            }

                            codepoint = Number.parseInt(hex, 16);
                            if (Number.isNaN(codepoint)) {
                                this._errorMessage(`Invalid unicode value ${hex}`);
                            }
                        } else {
                            this._errorMessage('Unsupported escape sequence');
                        }
                    } else {
                        codepoint = this._codepoint;
                    }

                    // unicode handling

                    // https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-string-type
                    if (IOHelper.isLeadingSurrogate(previousCodepoint) && IOHelper.isTrailingSurrogate(codepoint)) {
                        codepoint = (previousCodepoint - 0xd800) * 0x400 + (codepoint - 0xdc00) + 0x10000;
                        s += String.fromCodePoint(codepoint);
                    } else if (IOHelper.isLeadingSurrogate(codepoint)) {
                        // only remember for next character to form a surrogate pair
                    } else {
                        // standalone leading surrogate from previous char
                        if (IOHelper.isLeadingSurrogate(previousCodepoint)) {
                            s += String.fromCodePoint(previousCodepoint);
                        }

                        if (codepoint > 0) {
                            s += String.fromCodePoint(codepoint);
                        }
                    }

                    previousCodepoint = codepoint;
                    this._codepoint = this._nextCodepoint();
                }
                if (this._codepoint === AlphaTexLexer._eof) {
                    this._errorMessage('String opened but never closed');
                }
                this.syData = s;
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x2d /* - */) {
                this._readNumberOrName(allowFloats);
            } else if (this._codepoint === 0x2e /* . */) {
                this.sy = AlphaTexSymbols.Dot;
                this.syData = '.';
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x3a /* : */) {
                this.sy = AlphaTexSymbols.DoubleDot;
                this.syData = ':';
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x28 /* ( */) {
                this.sy = AlphaTexSymbols.LParensis;
                this._codepoint = this._nextCodepoint();
                this.syData = '(';
            } else if (this._codepoint === 0x5c /* \ */) {
                this._codepoint = this._nextCodepoint();
                this.sy = AlphaTexSymbols.MetaCommand;
                // allow double backslash (easier to test when copying from escaped Strings)
                if (this._codepoint === 0x5c /* \ */) {
                    this._codepoint = this._nextCodepoint();
                }

                this.syData = this._readName();
            } else if (this._codepoint === 0x29 /* ) */) {
                this.sy = AlphaTexSymbols.RParensis;
                this.syData = ')';
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x7b /* { */) {
                this.sy = AlphaTexSymbols.LBrace;
                this.syData = '{';
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x7d /* } */) {
                this.sy = AlphaTexSymbols.RBrace;
                this.syData = '}';
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x7c /* | */) {
                this.sy = AlphaTexSymbols.Pipe;
                this.syData = '|';
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x2a /* * */) {
                this.sy = AlphaTexSymbols.Multiply;
                this.syData = '*';
                this._codepoint = this._nextCodepoint();
            } else if (this._codepoint === 0x3c /* < */) {
                this.sy = AlphaTexSymbols.LowerThan;
                this.syData = '<';
                this._codepoint = this._nextCodepoint();
            } else if (AlphaTexLexer._isDigit(this._codepoint)) {
                this._readNumberOrName(allowFloats);
            } else if (AlphaTexLexer._isNameLetter(this._codepoint)) {
                const name: string = this._readName();
                const tuning: TuningParseResult | null = this.allowTuning ? ModelUtils.parseTuning(name) : null;
                if (tuning) {
                    this.sy = AlphaTexSymbols.Tuning;
                    this.syData = tuning;
                } else {
                    this.sy = AlphaTexSymbols.String;
                    this.syData = name;
                }
            } else {
                this._errorMessage(`Unexpected character ${String.fromCodePoint(this._codepoint)}`);
            }
        }

        this.syEnd = {
            line: this._line,
            col: this._col,
            offset: this._position
        };
        return this.sy;
    }

    private _errorMessage(message: string): void {
        const e: AlphaTexError = AlphaTexError.errorMessage(
            message,
            this.lastValidSpot[0],
            this.lastValidSpot[1],
            this.lastValidSpot[2]
        );
        if (this.logErrors) {
            Logger.error('AlphaTex', e.message!);
        }
        throw e;
    }

    private _readNumberOrName(allowFloat: boolean) {
        let str: string = '';

        // assume number at start
        this.sy = AlphaTexSymbols.Number;

        // negative start or dash
        if (this._codepoint === 0x2d) {
            str += String.fromCodePoint(this._codepoint);
            this._codepoint = this._nextCodepoint();

            // need a number afterwards otherwise we have a string(-)
            if (!AlphaTexLexer._isDigit(this._codepoint)) {
                this.sy = AlphaTexSymbols.String;
            }
        }

        let keepReading = true;

        let hasDot = false;
        do {
            switch (this.sy) {
                case AlphaTexSymbols.Number:
                    // adding digits to the number
                    if (AlphaTexLexer._isDigit(this._codepoint)) {
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this._nextCodepoint();
                        keepReading = true;
                    }
                    // adding a dot to the number (expecting digit after dot)
                    else if (
                        allowFloat &&
                        !hasDot &&
                        this._codepoint === 0x2e /* . */ &&
                        AlphaTexLexer._isDigit(this._codepoints[this._position])
                    ) {
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this._nextCodepoint();
                        keepReading = true;
                        hasDot = true;
                    }
                    // letter in number -> fallback to name reading
                    else if (AlphaTexLexer._isNameLetter(this._codepoint)) {
                        this.sy = AlphaTexSymbols.String;
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this._nextCodepoint();
                        keepReading = true;
                    }
                    // general unknown character -> end reading
                    else {
                        keepReading = false;
                    }
                    break;
                case AlphaTexSymbols.String:
                    if (AlphaTexLexer._isNameLetter(this._codepoint)) {
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this._nextCodepoint();
                        keepReading = true;
                    } else {
                        keepReading = false;
                    }
                    break;
                default:
                    keepReading = false; // should never happen
                    break;
            }
        } while (keepReading);

        if (str.length === 0) {
            this._errorMessage('number was empty');
        }

        if (this.sy === AlphaTexSymbols.String) {
            this.syData = str;
        } else {
            this.syData = allowFloat ? Number.parseFloat(str) : Number.parseInt(str, 10);
        }
        return;
    }

    /**
     * Reads a string from the stream.
     * @returns the read string.
     */
    private _readName(): string {
        let str: string = '';
        do {
            str += String.fromCodePoint(this._codepoint);
            this._codepoint = this._nextCodepoint();
        } while (
            AlphaTexLexer._isNameLetter(this._codepoint) ||
            AlphaTexLexer._isDigit(this._codepoint) ||
            this._codepoint === 0x2d /*-*/
        );
        return str;
    }

    /**
     * Checks if the given character is a valid letter for a name.
     * (no control characters, whitespaces, numbers or dots)
     */
    private static _isNameLetter(ch: number): boolean {
        return (
            !AlphaTexLexer._isTerminal(ch) && // no control characters, whitespaces, numbers or dots
            ((0x21 <= ch && ch <= 0x2f) || (0x3a <= ch && ch <= 0x7e) || 0x80 <= ch) // Unicode Symbols
        );
    }

    private static _isTerminal(ch: number): boolean {
        return (
            ch === 0x2e /* . */ ||
            ch === 0x7b /* { */ ||
            ch === 0x7d /* } */ ||
            ch === 0x5b /* [ */ ||
            ch === 0x5d /* ] */ ||
            ch === 0x28 /* ( */ ||
            ch === 0x29 /* ) */ ||
            ch === 0x7c /* | */ ||
            ch === 0x27 /* ' */ ||
            ch === 0x22 /* " */ ||
            ch === 0x2a /* * */ ||
            ch === 0x5c /* \ */
        );
    }

    private static _isWhiteSpace(ch: number): boolean {
        return (
            ch === 0x09 /* \t */ ||
            ch === 0x0a /* \n */ ||
            ch === 0x0b /* \v */ ||
            ch === 0x0d /* \r */ ||
            ch === 0x20 /* space */
        );
    }

    private static _isDigit(ch: number): boolean {
        return ch >= 0x30 && ch <= 0x39 /* 0-9 */;
    }
}

/**
 * This importer can parse alphaTex markup into a score structure.
 * @internal
 */
export class AlphaTexImporterOld extends ScoreImporter {
    private _trackChannel: number = 0;
    private _score!: Score;
    private _currentTrack!: Track;

    private _initialTempo = 0;
    private _initialTempoLabel = '';

    private _currentStaff!: Staff;
    private _barIndex: number = 0;
    private _voiceIndex: number = 0;
    private _initialTempo = Automation.buildTempoAutomation(false, 0, 120, 0);

    // Last known position that had valid syntax/symbols
    private _currentDuration: Duration = Duration.QuadrupleWhole;
    private _currentDynamics: DynamicValue = DynamicValue.PPP;
    private _currentTuplet: number = 0;
    private _lyrics!: Map<number, Lyrics[]>;
    private _ignoredInitialVoice = false;

    private _staffHasExplicitDisplayTransposition: boolean = false;
    private _staffDisplayTranspositionApplied: boolean = false;
    private _staffHasExplicitTuning: boolean = false;
    private _staffTuningApplied: boolean = false;
    private _percussionArticulationNames = new Map<string, number>();
    private _sustainPedalToBeat = new Map<SustainPedalMarker, Beat>();

    private _slurs: Map<string, Note> = new Map<string, Note>();

    private _articulationValueToIndex = new Map<number, number>();

    private _lexer!: AlphaTexLexerOld;

    private _accidentalMode: AlphaTexAccidentalMode = AlphaTexAccidentalMode.Explicit;
    private _flatSyncPoints: FlatSyncPoint[] = [];

    public logErrors: boolean = true;

    public get name(): string {
        return 'AlphaTex (old)';
    }

    public initFromString(tex: string, settings: Settings) {
        this.data = ByteBuffer.empty();
        this._lexer = new AlphaTexLexerOld(tex);
        this.settings = settings;
        // when beginning reading a new score we reset the IDs.
        Score.resetIds();
    }

    private get _sy() {
        return this._lexer.sy;
    }

    private get _syData() {
        return this._lexer.syData;
    }

    private set _sy(value: AlphaTexSymbols) {
        this._lexer.sy = value;
    }

    private _newSy(allowFloat: boolean = false) {
        return this._lexer.newSy(allowFloat);
    }

    public readScore(): Score {
        try {
            if (this.data.length > 0) {
                this._lexer = new AlphaTexLexerOld(
                    IOHelper.toString(this.data.readAll(), this.settings.importer.encoding)
                );
            }
            this._lexer.logErrors = this.logErrors;

            this._lexer.allowTuning = true;
            this._lyrics = new Map<number, Lyrics[]>();
            this._sustainPedalToBeat = new Map<SustainPedalMarker, Beat>();

            this._lexer.init();

            this._createDefaultScore();
            this._currentDuration = Duration.Quarter;
            this._currentDynamics = DynamicValue.F;
            this._currentTuplet = 1;
            if (this._sy === AlphaTexSymbols.LowerThan) {
                // potential XML, stop parsing (alphaTex never starts with <)
                throw new UnsupportedFormatError("Unknown start sign '<' (meant to import as XML?)");
            }

            if (this._sy !== AlphaTexSymbols.Eof) {
                const anyMetaRead = this._metaData();
                const anyBarsRead = this._bars();
                if (!anyMetaRead && !anyBarsRead) {
                    throw new UnsupportedFormatError('No alphaTex data found');
                }

                if (this._sy === AlphaTexSymbols.Dot) {
                    this._sy = this._newSy();
                    this._syncPoints();
                }
            }

            ModelUtils.consolidate(this._score);
            this._score.finish(this.settings);
            ModelUtils.trimEmptyBarsAtEnd(this._score);
            this._score.rebuildRepeatGroups();
            this._score.applyFlatSyncPoints(this._flatSyncPoints);
            for (const [track, lyrics] of this._lyrics) {
                this._score.tracks[track].applyLyrics(lyrics);
            }
            for (const [sustainPedal, beat] of this._sustainPedalToBeat) {
                const duration = beat.voice.bar.masterBar.calculateDuration();
                sustainPedal.ratioPosition = beat.playbackStart / duration;
            }
            return this._score;
        } catch (e) {
            if (e instanceof AlphaTexError) {
                throw new UnsupportedFormatError(e.message, e);
            }
            throw e;
        }
    }

    private _syncPoints() {
        while (this._sy !== AlphaTexSymbols.Eof) {
            this._syncPoint();
        }
    }

    private _syncPoint() {
        // \sync BarIndex Occurence MillisecondOffset
        // \sync BarIndex Occurence MillisecondOffset RatioPosition

        if (this._sy !== AlphaTexSymbols.MetaCommand || (this._syData as string) !== 'sync') {
            this._error('syncPoint', AlphaTexSymbols.MetaCommand, true);
        }

        this._sy = this._newSy();
        if (this._sy !== AlphaTexSymbols.Number) {
            this._error('syncPointBarIndex', AlphaTexSymbols.Number, true);
        }
        const barIndex = this._syData as number;

        this._sy = this._newSy();
        if (this._sy !== AlphaTexSymbols.Number) {
            this._error('syncPointBarOccurence', AlphaTexSymbols.Number, true);
        }
        const barOccurence = this._syData as number;

        this._sy = this._newSy();
        if (this._sy !== AlphaTexSymbols.Number) {
            this._error('syncPointBarMillis', AlphaTexSymbols.Number, true);
        }
        const millisecondOffset = this._syData as number;

        this._sy = this._newSy(true);
        let barPosition = 0;
        if (this._sy === AlphaTexSymbols.Number) {
            barPosition = this._syData as number;
            this._sy = this._newSy();
        }

        this._flatSyncPoints.push({
            barIndex,
            barOccurence,
            barPosition,
            millisecondOffset
        });
    }

    private _error(nonterm: string, expected: AlphaTexSymbols, wrongSymbol: boolean = true): void {
        let receivedSymbol: AlphaTexSymbols;
        let showSyData = false;
        if (wrongSymbol) {
            receivedSymbol = this._sy;
            if (
                // These are the only symbols that can have associated _syData set
                receivedSymbol === AlphaTexSymbols.String ||
                receivedSymbol === AlphaTexSymbols.Number ||
                receivedSymbol === AlphaTexSymbols.MetaCommand // ||
                // Tuning does not have a toString() yet, therefore excluded.
                // receivedSymbol === AlphaTexSymbols.Tuning
            ) {
                showSyData = true;
            }
        } else {
            receivedSymbol = expected;
            showSyData = true;
        }
        const e = AlphaTexError.symbolError(
            this._lexer.lastValidSpot[0],
            this._lexer.lastValidSpot[1],
            this._lexer.lastValidSpot[2],
            nonterm,
            expected,
            receivedSymbol,
            showSyData ? this._syData : null
        );
        if (this.logErrors) {
            Logger.error(this.name, e.message!);
        }
        throw e;
    }

    private _errorMessage(message: string): void {
        const e: AlphaTexError = AlphaTexError.errorMessage(
            message,
            this._lexer.lastValidSpot[0],
            this._lexer.lastValidSpot[1],
            this._lexer.lastValidSpot[2]
        );
        if (this.logErrors) {
            Logger.error(this.name, e.message!);
        }
        throw e;
    }

    /**
     * Initializes the song with some required default values.
     * @returns
     */
    private _createDefaultScore(): void {
        this._score = new Score();
        this._newTrack();
    }

    private _newTrack(): void {
        this._currentTrack = new Track();
        this._currentTrack.ensureStaveCount(1);
        this._currentTrack.playbackInfo.program = 25;
        this._currentTrack.playbackInfo.primaryChannel = this._trackChannel++;
        this._currentTrack.playbackInfo.secondaryChannel = this._trackChannel++;
        const staff = this._currentTrack.staves[0];
        staff.displayTranspositionPitch = 0;
        staff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
        this._articulationValueToIndex.clear();

        this._beginStaff(staff);

        this._score.addTrack(this._currentTrack);
        this._lyrics.set(this._currentTrack.index, []);
        this._currentDynamics = DynamicValue.F;
    }

    /**
     * Converts a clef string into the clef value.
     * @param str the string to convert
     * @returns the clef value
     */
    private _parseClefFromString(str: string): Clef {
        switch (str.toLowerCase()) {
            case 'g2':
            case 'treble':
                return Clef.G2;
            case 'f4':
            case 'bass':
                return Clef.F4;
            case 'c3':
            case 'alto':
                return Clef.C3;
            case 'c4':
            case 'tenor':
                return Clef.C4;
            case 'n':
            case 'neutral':
                return Clef.Neutral;
            default:
                return Clef.G2;
            // error("clef-value", AlphaTexSymbols.String, false);
        }
    }

    /**
     * Converts a clef tuning into the clef value.
     * @param i the tuning value to convert
     * @returns the clef value
     */
    private _parseClefFromInt(i: number): Clef {
        switch (i) {
            case 0:
                return Clef.Neutral;
            case 43:
                return Clef.G2;
            case 65:
                return Clef.F4;
            case 48:
                return Clef.C3;
            case 60:
                return Clef.C4;
            default:
                return Clef.G2;
        }
    }

    private _parseTripletFeelFromString(str: string): TripletFeel {
        switch (str.toLowerCase()) {
            case 'no':
            case 'none':
            case 'notripletfeel':
                return TripletFeel.NoTripletFeel;
            case 't16':
            case 'triplet-16th':
            case 'triplet16th':
                return TripletFeel.Triplet16th;
            case 't8':
            case 'triplet-8th':
            case 'triplet8th':
                return TripletFeel.Triplet8th;
            case 'd16':
            case 'dotted-16th':
            case 'dotted16th':
                return TripletFeel.Dotted16th;
            case 'd8':
            case 'dotted-8th':
            case 'dotted8th':
                return TripletFeel.Dotted8th;
            case 's16':
            case 'scottish-16th':
            case 'scottish16th':
                return TripletFeel.Scottish16th;
            case 's8':
            case 'scottish-8th':
            case 'scottish8th':
                return TripletFeel.Scottish8th;
            default:
                return TripletFeel.NoTripletFeel;
        }
    }

    private _parseTripletFeelFromInt(i: number): TripletFeel {
        switch (i) {
            case 0:
                return TripletFeel.NoTripletFeel;
            case 1:
                return TripletFeel.Triplet16th;
            case 2:
                return TripletFeel.Triplet8th;
            case 3:
                return TripletFeel.Dotted16th;
            case 4:
                return TripletFeel.Dotted8th;
            case 5:
                return TripletFeel.Scottish16th;
            case 6:
                return TripletFeel.Scottish8th;
            default:
                return TripletFeel.NoTripletFeel;
        }
    }

    /**
     * Converts a keysignature string into the assocciated value.
     * @param str the string to convert
     * @returns the assocciated keysignature value
     */
    private _parseKeySignature(str: string): KeySignature {
        switch (str.toLowerCase()) {
            case 'cb':
            case 'cbmajor':
            case 'abminor':
                return KeySignature.Cb;
            case 'gb':
            case 'gbmajor':
            case 'ebminor':
                return KeySignature.Gb;
            case 'db':
            case 'dbmajor':
            case 'bbminor':
                return KeySignature.Db;
            case 'ab':
            case 'abmajor':
            case 'fminor':
                return KeySignature.Ab;
            case 'eb':
            case 'ebmajor':
            case 'cminor':
                return KeySignature.Eb;
            case 'bb':
            case 'bbmajor':
            case 'gminor':
                return KeySignature.Bb;
            case 'f':
            case 'fmajor':
            case 'dminor':
                return KeySignature.F;
            case 'c':
            case 'cmajor':
            case 'aminor':
                return KeySignature.C;
            case 'g':
            case 'gmajor':
            case 'eminor':
                return KeySignature.G;
            case 'd':
            case 'dmajor':
            case 'bminor':
                return KeySignature.D;
            case 'a':
            case 'amajor':
            case 'f#minor':
                return KeySignature.A;
            case 'e':
            case 'emajor':
            case 'c#minor':
                return KeySignature.E;
            case 'b':
            case 'bmajor':
            case 'g#minor':
                return KeySignature.B;
            case 'f#':
            case 'f#major':
            case 'd#minor':
                return KeySignature.FSharp;
            case 'c#':
            case 'c#major':
            case 'a#minor':
                return KeySignature.CSharp;
            default:
                return KeySignature.C;
            // error("keysignature-value", AlphaTexSymbols.String, false); return 0
        }
    }

    private _parseKeySignatureType(str: string): KeySignatureType {
        if (str.toLowerCase().endsWith('minor')) {
            return KeySignatureType.Minor;
        }
        return KeySignatureType.Major;
    }

    private _metaData(): boolean {
        let anyTopLevelMeta = false;
        let anyOtherMeta = false;
        let continueReading: boolean = true;
        while (this._sy === AlphaTexSymbols.MetaCommand && continueReading) {
            const metadataTag: string = (this._syData as string).toLowerCase();
            switch (metadataTag) {
                case 'title':
                case 'subtitle':
                case 'artist':
                case 'album':
                case 'words':
                case 'music':
                case 'copyright':
                case 'instructions':
                case 'notices':
                case 'tab':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        // Known issue: Strings that happen to be parsed as valid Tunings or positive Numbers will not pass this.
                        // Need to use quotes in that case, or rewrite parsing logic.
                        this._error(metadataTag, AlphaTexSymbols.String, true);
                    }

                    const metadataValue: string = this._syData as string;
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;

                    let element: ScoreSubElement = ScoreSubElement.ChordDiagramList;
                    switch (metadataTag) {
                        case 'title':
                            this._score.title = metadataValue;
                            element = ScoreSubElement.Title;
                            break;
                        case 'subtitle':
                            this._score.subTitle = metadataValue;
                            element = ScoreSubElement.SubTitle;
                            break;
                        case 'artist':
                            this._score.artist = metadataValue;
                            element = ScoreSubElement.Artist;
                            break;
                        case 'album':
                            this._score.album = metadataValue;
                            element = ScoreSubElement.Album;
                            break;
                        case 'words':
                            this._score.words = metadataValue;
                            element = ScoreSubElement.Words;
                            break;
                        case 'music':
                            this._score.music = metadataValue;
                            element = ScoreSubElement.Music;
                            break;
                        case 'copyright':
                            this._score.copyright = metadataValue;
                            element = ScoreSubElement.Copyright;
                            break;
                        case 'instructions':
                            this._score.instructions = metadataValue;
                            break;
                        case 'notices':
                            this._score.notices = metadataValue;
                            break;
                        case 'tab':
                            this._score.tab = metadataValue;
                            element = ScoreSubElement.Transcriber;
                            break;
                    }

                    if (element !== ScoreSubElement.ChordDiagramList) {
                        this.headerFooterStyle(element);
                    }

                    break;
                case 'copyright2':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error(metadataTag, AlphaTexSymbols.String, true);
                    }

                    this.headerFooterStyle(ScoreSubElement.CopyrightSecondLine);
                    anyTopLevelMeta = true;
                    break;
                case 'wordsandmusic':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error(metadataTag, AlphaTexSymbols.String, true);
                    }

                    this.headerFooterStyle(ScoreSubElement.WordsAndMusic);
                    anyTopLevelMeta = true;
                    break;
                case 'tempo':
                    this._sy = this._newSy(true);
                    if (this._sy === AlphaTexSymbols.Number) {
                        this._initialTempo.value = this._syData as number;
                    } else {
                        this._error('tempo', AlphaTexSymbols.Number, true);
                    }
                    this._sy = this._newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._initialTempo.text = this._syData as string;
                        this._sy = this._newSy();
                    }

                    anyTopLevelMeta = true;
                    break;
                case 'defaultsystemslayout':
                    this._sy = this._newSy();
                    if (this._sy === AlphaTexSymbols.Number) {
                        this._score.defaultSystemsLayout = this._syData as number;
                        this._sy = this._newSy();
                        anyTopLevelMeta = true;
                    } else {
                        this._error('default-systems-layout', AlphaTexSymbols.Number, true);
                    }
                    break;
                case 'systemslayout':
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    while (this._sy === AlphaTexSymbols.Number) {
                        this._score.systemsLayout.push(this._syData as number);
                        this._sy = this._newSy();
                    }
                    break;
                case 'hidedynamics':
                    this._score.stylesheet.hideDynamics = true;
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'showdynamics':
                    this._score.stylesheet.hideDynamics = false;
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'bracketextendmode':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('bracketExtendMode', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.bracketExtendMode = this._parseBracketExtendMode(this._syData as string);
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'usesystemsignseparator':
                    this._score.stylesheet.useSystemSignSeparator = true;
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'multibarrest':
                    this._score.stylesheet.multiTrackMultiBarRest = true;
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'singletracktracknamepolicy':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('singleTrackTrackNamePolicy', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.singleTrackTrackNamePolicy = this._parseTrackNamePolicy(
                        this._syData as string
                    );
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'multitracktracknamepolicy':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('multiTrackTrackNamePolicy', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.multiTrackTrackNamePolicy = this._parseTrackNamePolicy(this._syData as string);
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'firstsystemtracknamemode':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('firstSystemTrackNameMode', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.firstSystemTrackNameMode = this._parseTrackNameMode(this._syData as string);
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'othersystemstracknamemode':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('otherSystemsTrackNameMode', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.otherSystemsTrackNameMode = this._parseTrackNameMode(this._syData as string);
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'firstsystemtracknameorientation':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('firstSystemTrackNameOrientation', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.firstSystemTrackNameOrientation = this._parseTrackNameOrientation(
                        this._syData as string
                    );
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'othersystemstracknameorientation':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('otherSystemsTrackNameOrientation', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.otherSystemsTrackNameOrientation = this._parseTrackNameOrientation(
                        this._syData as string
                    );
                    this._sy = this._newSy();
                    anyTopLevelMeta = true;
                    break;
                default:
                    switch (this._handleStaffMeta()) {
                        case StaffMetaResult.KnownStaffMeta:
                            anyOtherMeta = true;
                            break;
                        case StaffMetaResult.UnknownStaffMeta:
                            if (anyTopLevelMeta || anyOtherMeta) {
                                // invalid meta encountered
                                this._error('metaDataTags', AlphaTexSymbols.String, false);
                            } else {
                                // fall forward to bar meta if unknown score meta was found
                                continueReading = false;
                            }
                            break;
                        case StaffMetaResult.EndOfMetaDetected:
                            continueReading = false;
                            break;
                    }
                    break;
            }
        }
        if (anyTopLevelMeta) {
            if (this._sy !== AlphaTexSymbols.Dot) {
                this._error('song', AlphaTexSymbols.Dot, true);
            }
            this._sy = this._newSy();
        } else if (this._sy === AlphaTexSymbols.Dot) {
            this._sy = this._newSy();
            anyTopLevelMeta = true; // just to indicate that there is an indication of proper alphaTex
        }

        return anyTopLevelMeta || anyOtherMeta;
    }

    headerFooterStyle(element: ScoreSubElement) {
        const style = ModelUtils.getOrCreateHeaderFooterStyle(this._score, element);
        if (style.isVisible === undefined) {
            style.isVisible = true;
        }

        if (this._sy === AlphaTexSymbols.String) {
            const value = this._syData as string;
            if (value) {
                style.template = value;
            } else {
                style.isVisible = false;
            }
            this._sy = this._newSy();
        }

        if (this._sy === AlphaTexSymbols.String) {
            switch ((this._syData as string).toLowerCase()) {
                case 'left':
                    style.textAlign = TextAlign.Left;
                    break;
                case 'center':
                    style.textAlign = TextAlign.Center;
                    break;
                case 'right':
                    style.textAlign = TextAlign.Right;
                    break;
            }
            this._sy = this._newSy();
        }
    }

    private _parseTrackNamePolicy(v: string): TrackNamePolicy {
        switch (v.toLowerCase()) {
            case 'hidden':
                return TrackNamePolicy.Hidden;
            case 'allsystems':
                return TrackNamePolicy.AllSystems;
            // case 'firstsystem':
            default:
                return TrackNamePolicy.FirstSystem;
        }
    }

    private _parseTrackNameMode(v: string): TrackNameMode {
        switch (v.toLowerCase()) {
            case 'fullname':
                return TrackNameMode.FullName;
            // case 'shortname':
            default:
                return TrackNameMode.ShortName;
        }
    }

    private _parseTrackNameOrientation(v: string): TrackNameOrientation {
        switch (v.toLowerCase()) {
            case 'horizontal':
                return TrackNameOrientation.Horizontal;
            //case 'vertical':
            default:
                return TrackNameOrientation.Vertical;
        }
    }

    private _handleStaffMeta(): StaffMetaResult {
        switch ((this._syData as string).toLowerCase()) {
            case 'capo':
                this._sy = this._newSy();
                if (this._sy === AlphaTexSymbols.Number) {
                    this._currentStaff.capo = this._syData as number;
                } else {
                    this._error('capo', AlphaTexSymbols.Number, true);
                }
                this._sy = this._newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'tuning':
                this._sy = this._newSy();
                const strings: number = this._currentStaff.tuning.length;
                this._staffHasExplicitTuning = true;
                this._staffTuningApplied = false;
                switch (this._sy) {
                    case AlphaTexSymbols.String:
                        const text: string = (this._syData as string).toLowerCase();
                        if (text === 'piano' || text === 'none' || text === 'voice') {
                            this._makeCurrentStaffPitched();
                        } else {
                            this._error('tuning', AlphaTexSymbols.Tuning, true);
                        }
                        this._sy = this._newSy();
                        break;
                    case AlphaTexSymbols.Tuning:
                        const tuning: number[] = [];
                        do {
                            const t: TuningParseResult = this._syData as TuningParseResult;
                            tuning.push(t.realValue);
                            this._sy = this._newSy();
                        } while (this._sy === AlphaTexSymbols.Tuning);
                        this._currentStaff.stringTuning.tunings = tuning;
                        break;
                    default:
                        this._error('tuning', AlphaTexSymbols.Tuning, true);
                        break;
                }

                if (this._sy === AlphaTexSymbols.String) {
                    if ((this._syData as string).toLowerCase() === 'hide') {
                        if (!this._score.stylesheet.perTrackDisplayTuning) {
                            this._score.stylesheet.perTrackDisplayTuning = new Map<number, boolean>();
                        }
                        this._score.stylesheet.perTrackDisplayTuning!.set(this._currentTrack.index, false);
                        this._sy = this._newSy();

                        if (this._sy === AlphaTexSymbols.String) {
                            this._currentStaff.stringTuning.name = this._syData as string;
                            this._sy = this._newSy();
                        }
                    } else {
                        this._currentStaff.stringTuning.name = this._syData as string;
                        this._sy = this._newSy();
                    }
                }

                if (strings !== this._currentStaff.tuning.length && (this._currentStaff.chords?.size ?? 0) > 0) {
                    this._errorMessage('Tuning must be defined before any chord');
                }
                return StaffMetaResult.KnownStaffMeta;
            case 'instrument':
                this._staffTuningApplied = false;
                this._readTrackInstrument();

                return StaffMetaResult.KnownStaffMeta;
            case 'bank':
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('bank', AlphaTexSymbols.Number, true);
                }

                this._currentTrack.playbackInfo.bank = this._syData as number;
                this._sy = this._newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'lyrics':
                this._sy = this._newSy();
                const lyrics: Lyrics = new Lyrics();
                lyrics.startBar = 0;
                lyrics.text = '';
                if (this._sy === AlphaTexSymbols.Number) {
                    lyrics.startBar = this._syData as number;
                    this._sy = this._newSy();
                }
                if (this._sy === AlphaTexSymbols.String) {
                    lyrics.text = this._syData as string;
                    this._sy = this._newSy();
                } else {
                    this._error('lyrics', AlphaTexSymbols.String, true);
                }
                this._lyrics.get(this._currentTrack.index)!.push(lyrics);
                return StaffMetaResult.KnownStaffMeta;
            case 'chord':
                this._sy = this._newSy();
                const chord: Chord = new Chord();
                this._chordProperties(chord);
                if (this._sy === AlphaTexSymbols.String) {
                    chord.name = this._syData as string;
                    this._sy = this._newSy();
                } else {
                    this._error('chord-name', AlphaTexSymbols.String, true);
                }
                for (let i: number = 0; i < this._currentStaff.tuning.length; i++) {
                    if (this._sy === AlphaTexSymbols.Number) {
                        chord.strings.push(this._syData as number);
                    } else if (this._sy === AlphaTexSymbols.String && (this._syData as string).toLowerCase() === 'x') {
                        chord.strings.push(-1);
                    }
                    this._sy = this._newSy();
                }
                this._currentStaff.addChord(this._getChordId(this._currentStaff, chord.name), chord);
                return StaffMetaResult.KnownStaffMeta;
            case 'articulation':
                this._sy = this._newSy();

                let name = '';
                if (this._sy === AlphaTexSymbols.String) {
                    name = this._syData as string;
                    this._sy = this._newSy();
                } else {
                    this._error('articulation-name', AlphaTexSymbols.String, true);
                }

                if (name === 'defaults') {
                    for (const [defaultName, defaultValue] of PercussionMapper.instrumentArticulationNames) {
                        this._percussionArticulationNames.set(defaultName.toLowerCase(), defaultValue);
                        this._percussionArticulationNames.set(
                            AlphaTexImporter._toArticulationId(defaultName),
                            defaultValue
                        );
                    }
                    return StaffMetaResult.KnownStaffMeta;
                }

                let number = 0;
                if (this._sy === AlphaTexSymbols.Number) {
                    number = this._syData as number;
                    this._sy = this._newSy();
                } else {
                    this._error('articulation-number', AlphaTexSymbols.Number, true);
                }

                if (!PercussionMapper.instrumentArticulations.has(number)) {
                    this._errorMessage(
                        `Unknown articulation ${number}. Refer to https://www.alphatab.net/docs/alphatex/percussion for available ids`
                    );
                }

                this._percussionArticulationNames.set(name.toLowerCase(), number);
                return StaffMetaResult.KnownStaffMeta;
            case 'accidentals':
                this._handleAccidentalMode();
                return StaffMetaResult.KnownStaffMeta;
            case 'displaytranspose':
                this._sy = this._newSy();
                if (this._sy === AlphaTexSymbols.Number) {
                    this._currentStaff.displayTranspositionPitch = (this._syData as number) * -1;
                    this._staffHasExplicitDisplayTransposition = true;
                } else {
                    this._error('displaytranspose', AlphaTexSymbols.Number, true);
                }
                this._sy = this._newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'transpose':
                this._sy = this._newSy();
                if (this._sy === AlphaTexSymbols.Number) {
                    this._currentStaff.transpositionPitch = (this._syData as number) * -1;
                } else {
                    this._error('transpose', AlphaTexSymbols.Number, true);
                }
                this._sy = this._newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'track':
            case 'staff':
                // on empty staves we need to proceeed when starting directly a new track or staff
                return StaffMetaResult.EndOfMetaDetected;
            case 'voice':
                this._sy = this._newSy();
                if (this._handleNewVoice()) {
                    return StaffMetaResult.EndOfMetaDetected;
                }
                return StaffMetaResult.KnownStaffMeta;
            default:
                return StaffMetaResult.UnknownStaffMeta;
        }
    }
    private _readTrackInstrument() {
        this._sy = this._newSy();

        if (this._sy === AlphaTexSymbols.Number) {
            const instrument: number = this._syData as number;
            if (instrument >= 0 && instrument <= 127) {
                this._currentTrack.playbackInfo.program = this._syData as number;
            } else {
                this._error('instrument', AlphaTexSymbols.Number, false);
            }
        } else if (this._sy === AlphaTexSymbols.String) {
            const instrumentName: string = (this._syData as string).toLowerCase();
            if (instrumentName === 'percussion') {
                for (const staff of this._currentTrack.staves) {
                    this._applyPercussionStaff(staff);
                }
                this._currentTrack.playbackInfo.primaryChannel = SynthConstants.PercussionChannel;
                this._currentTrack.playbackInfo.secondaryChannel = SynthConstants.PercussionChannel;
            } else {
                this._currentTrack.playbackInfo.program = GeneralMidi.getValue(instrumentName);
            }
        } else {
            this._error('instrument', AlphaTexSymbols.Number, true);
        }
        this._sy = this._newSy();
    }

    private _handleAccidentalMode() {
        this._sy = this._newSy();
        if (this._sy !== AlphaTexSymbols.String) {
            this._error('accidental-mode', AlphaTexSymbols.String, true);
        }

        switch (this._syData as string) {
            case 'auto':
                this._accidentalMode = AlphaTexAccidentalMode.Auto;
                break;
            case 'explicit':
                this._accidentalMode = AlphaTexAccidentalMode.Explicit;
                break;
        }

        this._sy = this._newSy();
    }

    private _makeCurrentStaffPitched() {
        // clear tuning
        this._currentStaff.stringTuning.tunings = [];
        if (!this._staffHasExplicitDisplayTransposition) {
            this._currentStaff.displayTranspositionPitch = 0;
        }
    }

    /**
     * Encodes a given string to a shorthand text form without spaces or special characters
     */
    private static _toArticulationId(plain: string): string {
        return plain.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    private _applyPercussionStaff(staff: Staff) {
        staff.isPercussion = true;
        staff.showTablature = false;
        staff.track.playbackInfo.program = 0;
    }

    private _chordProperties(chord: Chord): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this._newSy();
        while (this._sy === AlphaTexSymbols.String) {
            switch ((this._syData as string).toLowerCase()) {
                case 'firstfret':
                    this._sy = this._newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.Number:
                            chord.firstFret = this._syData as number;
                            break;
                        default:
                            this._error('chord-firstfret', AlphaTexSymbols.Number, true);
                            break;
                    }
                    this._sy = this._newSy();
                    break;
                case 'showdiagram':
                    this._sy = this._newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.String:
                            chord.showDiagram = (this._syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showDiagram = (this._syData as number) !== 0;
                            break;
                        default:
                            this._error('chord-showdiagram', AlphaTexSymbols.String, true);
                            break;
                    }
                    this._sy = this._newSy();
                    break;
                case 'showfingering':
                    this._sy = this._newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.String:
                            chord.showDiagram = (this._syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showFingering = (this._syData as number) !== 0;
                            break;
                        default:
                            this._error('chord-showfingering', AlphaTexSymbols.String, true);
                            break;
                    }
                    this._sy = this._newSy();
                    break;
                case 'showname':
                    this._sy = this._newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.String:
                            chord.showName = (this._syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showName = (this._syData as number) !== 0;
                            break;
                        default:
                            this._error('chord-showname', AlphaTexSymbols.String, true);
                            break;
                    }
                    this._sy = this._newSy();
                    break;
                case 'barre':
                    this._sy = this._newSy();
                    while (this._sy === AlphaTexSymbols.Number) {
                        chord.barreFrets.push(this._syData as number);
                        this._sy = this._newSy();
                    }
                    break;
                default:
                    this._error('chord-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this._error('chord-properties', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this._newSy();
    }

    private _bars(): boolean {
        const anyData = this._bar();
        while (this._sy !== AlphaTexSymbols.Eof) {
            // read pipe from last bar
            if (this._sy === AlphaTexSymbols.Pipe) {
                this._sy = this._newSy();
                this._bar();
            } else if (this._sy === AlphaTexSymbols.MetaCommand) {
                this._bar();
            } else {
                break;
            }
        }
        return anyData;
    }

    private _trackStaffMeta(): boolean {
        if (this._sy !== AlphaTexSymbols.MetaCommand) {
            return false;
        }
        if ((this._syData as string).toLowerCase() === 'track') {
            this._staffHasExplicitDisplayTransposition = false;
            this._staffHasExplicitTuning = false;
            this._staffTuningApplied = false;
            this._staffDisplayTranspositionApplied = false;
            this._ignoredInitialVoice = false;

            this._sy = this._newSy();
            // new track starting? - if no masterbars it's the \track of the initial track.
            if (this._score.masterBars.length > 0) {
                this._newTrack();
            }
            // name
            if (this._sy === AlphaTexSymbols.String) {
                this._currentTrack.name = this._syData as string;
                this._sy = this._newSy();
            }
            // short name
            if (this._sy === AlphaTexSymbols.String) {
                this._currentTrack.shortName = this._syData as string;
                this._sy = this._newSy();
            }

            this._trackProperties();
        }
        if (this._sy === AlphaTexSymbols.MetaCommand && (this._syData as string).toLowerCase() === 'staff') {
            this._staffHasExplicitDisplayTransposition = false;
            this._staffHasExplicitTuning = false;
            this._staffTuningApplied = false;
            this._staffDisplayTranspositionApplied = false;
            this._ignoredInitialVoice = false;

            this._sy = this._newSy();
            if (this._currentTrack.staves[0].bars.length > 0) {
                const previousWasPercussion = this._currentStaff.isPercussion;

                this._currentTrack.ensureStaveCount(this._currentTrack.staves.length + 1);
                this._beginStaff(this._currentTrack.staves[this._currentTrack.staves.length - 1]);

                if (previousWasPercussion) {
                    this._applyPercussionStaff(this._currentStaff);
                }

                this._currentDynamics = DynamicValue.F;
            }
            this._staffProperties();
        }

        if (this._sy === AlphaTexSymbols.MetaCommand && (this._syData as string).toLowerCase() === 'voice') {
            this._sy = this._newSy();

            this._handleNewVoice();
        }

        return true;
    }

    private _handleNewVoice(): boolean {
        if (
            this._voiceIndex === 0 &&
            (this._currentStaff.bars.length === 0 ||
                (this._currentStaff.bars.length === 1 &&
                    this._currentStaff.bars[0].isEmpty &&
                    !this._ignoredInitialVoice))
        ) {
            // voice marker on the begining of the first voice without any bar yet?
            // -> ignore
            this._ignoredInitialVoice = true;
            return false;
        }
        // create directly a new empty voice for all bars
        for (const b of this._currentStaff.bars) {
            const v = new Voice();
            b.addVoice(v);
        }
        // start using the new voice (see newBar for details on matching)
        this._voiceIndex++;
        this._barIndex = 0;
        return true;
    }

    private _beginStaff(staff: Staff) {
        this._currentStaff = staff;
        this._slurs.clear();
        this._barIndex = 0;
        this._voiceIndex = 0;
    }

    private _trackProperties(): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this._newSy();
        while (this._sy === AlphaTexSymbols.String) {
            switch ((this._syData as string).toLowerCase()) {
                case 'color':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.String) {
                        this._error('track-color', AlphaTexSymbols.String, true);
                    }
                    this._currentTrack.color = Color.fromJson(this._syData as string)!;
                    this._sy = this._newSy();

                    break;
                case 'defaultsystemslayout':
                    this._sy = this._newSy();
                    if (this._sy === AlphaTexSymbols.Number) {
                        this._currentTrack.defaultSystemsLayout = this._syData as number;
                        this._sy = this._newSy();
                    } else {
                        this._error('default-systems-layout', AlphaTexSymbols.Number, true);
                    }
                    break;
                case 'systemslayout':
                    this._sy = this._newSy();
                    while (this._sy === AlphaTexSymbols.Number) {
                        this._currentTrack.systemsLayout.push(this._syData as number);
                        this._sy = this._newSy();
                    }
                    break;
                case 'volume':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('track-volume', AlphaTexSymbols.Number, true);
                    }
                    this._currentTrack.playbackInfo.volume = ModelUtils.clamp(this._syData as number, 0, 16);
                    this._sy = this._newSy();
                    break;
                case 'balance':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('track-balance', AlphaTexSymbols.Number, true);
                    }
                    this._currentTrack.playbackInfo.balance = ModelUtils.clamp(this._syData as number, 0, 16);
                    this._sy = this._newSy();
                    break;
                case 'mute':
                    this._sy = this._newSy();
                    this._currentTrack.playbackInfo.isMute = true;
                    break;
                case 'solo':
                    this._sy = this._newSy();
                    this._currentTrack.playbackInfo.isSolo = true;
                    break;
                case 'multibarrest':
                    this._sy = this._newSy();
                    if (!this._score.stylesheet.perTrackMultiBarRest) {
                        this._score.stylesheet.perTrackMultiBarRest = new Set<number>();
                    }
                    this._score.stylesheet.perTrackMultiBarRest!.add(this._currentTrack.index);
                    break;
                case 'instrument':
                    this._readTrackInstrument();
                    break;
                case 'bank':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('bank', AlphaTexSymbols.Number, true);
                    }

                    this._currentTrack.playbackInfo.bank = this._syData as number;
                    this._sy = this._newSy();
                    break;
                default:
                    this._error('track-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this._error('track-properties', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this._newSy();
    }

    private _staffProperties(): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this._newSy();
        let showStandardNotation: boolean = false;
        let showTabs: boolean = false;
        let showSlash: boolean = false;
        let showNumbered: boolean = false;
        while (this._sy === AlphaTexSymbols.String) {
            switch ((this._syData as string).toLowerCase()) {
                case 'score':
                    showStandardNotation = true;
                    this._sy = this._newSy();

                    if (this._sy === AlphaTexSymbols.Number) {
                        this._currentStaff.standardNotationLineCount = this._syData as number;
                        this._sy = this._newSy();
                    }

                    break;
                case 'tabs':
                    showTabs = true;
                    this._sy = this._newSy();
                    break;
                case 'slash':
                    showSlash = true;
                    this._sy = this._newSy();
                    break;
                case 'numbered':
                    showNumbered = true;
                    this._sy = this._newSy();
                    break;
                default:
                    this._error('staff-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (showStandardNotation || showTabs || showSlash || showNumbered) {
            this._currentStaff.showStandardNotation = showStandardNotation;
            this._currentStaff.showTablature = showTabs;
            this._currentStaff.showSlash = showSlash;
            this._currentStaff.showNumbered = showNumbered;
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this._error('staff-properties', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this._newSy();
    }

    private _bar(): boolean {
        const anyStaffMeta = this._trackStaffMeta();

        const bar: Bar = this._newBar(this._currentStaff);
        if (this._currentStaff.bars.length > this._score.masterBars.length) {
            const master: MasterBar = new MasterBar();
            this._score.addMasterBar(master);
            if (master.index > 0) {
                master.timeSignatureDenominator = master.previousMasterBar!.timeSignatureDenominator;
                master.timeSignatureNumerator = master.previousMasterBar!.timeSignatureNumerator;
                master.tripletFeel = master.previousMasterBar!.tripletFeel;
            } else {
                master.tempoAutomations.push(this._initialTempo);
            }
        }
        const anyBarMeta = this._barMeta(bar);

        // detect tuning for staff
        const program = this._currentTrack.playbackInfo.program;
        if (!this._staffTuningApplied && !this._staffHasExplicitTuning) {
            // reset to defaults
            this._currentStaff.stringTuning.tunings = [];

            if (program === 15) {
                // dulcimer E4 B3 G3 D3 A2 E2
                this._currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 24 && program <= 31) {
                // guitar E4 B3 G3 D3 A2 E2
                this._currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 32 && program <= 39) {
                // bass G2 D2 A1 E1
                this._currentStaff.stringTuning.tunings = [43, 38, 33, 28];
            } else if (
                program === 40 ||
                program === 44 ||
                program === 45 ||
                program === 48 ||
                program === 49 ||
                program === 50 ||
                program === 51
            ) {
                // violin E3 A3 D3 G2
                this._currentStaff.stringTuning.tunings = [52, 57, 50, 43];
            } else if (program === 41) {
                // viola A3 D3 G2 C2
                this._currentStaff.stringTuning.tunings = [57, 50, 43, 36];
            } else if (program === 42) {
                // cello A2 D2 G1 C1
                this._currentStaff.stringTuning.tunings = [45, 38, 31, 24];
            } else if (program === 43) {
                // contrabass
                // G2 D2 A1 E1
                this._currentStaff.stringTuning.tunings = [43, 38, 33, 28];
            } else if (program === 105) {
                // banjo
                // D3 B2 G2 D2 G3
                this._currentStaff.stringTuning.tunings = [50, 47, 43, 38, 55];
            } else if (program === 106) {
                // shamisen
                // A3 E3 A2
                this._currentStaff.stringTuning.tunings = [57, 52, 45];
            } else if (program === 107) {
                // koto
                // E3 A2 D2 G1
                this._currentStaff.stringTuning.tunings = [52, 45, 38, 31];
            } else if (program === 110) {
                // Fiddle
                // E4 A3 D3 G2
                this._currentStaff.stringTuning.tunings = [64, 57, 50, 43];
            }

            this._staffTuningApplied = true;
        }

        // display transposition
        if (!this._staffDisplayTranspositionApplied && !this._staffHasExplicitDisplayTransposition) {
            if (ModelUtils.displayTranspositionPitches.has(program)) {
                // guitar E4 B3 G3 D3 A2 E2
                this._currentStaff.displayTranspositionPitch = ModelUtils.displayTranspositionPitches.get(program)!;
            } else {
                this._currentStaff.displayTranspositionPitch = 0;
            }
            this._staffDisplayTranspositionApplied = true;
        }

        let anyBeatData = false;
        const voice: Voice = bar.voices[this._voiceIndex];

        // if we have a setup like \track \staff \track \staff (without any notes/beats defined)
        // we are at a track meta at this point and we don't read any beats
        const emptyStaffWithNewStart =
            this._sy === AlphaTexSymbols.MetaCommand &&
            ((this._syData as string).toLowerCase() === 'track' || (this._syData as string).toLowerCase() === 'staff');

        if (!emptyStaffWithNewStart) {
            while (this._sy !== AlphaTexSymbols.Pipe && this._sy !== AlphaTexSymbols.Eof) {
                if (!this._beat(voice)) {
                    break;
                }
                anyBeatData = true;
            }
        }

        if (voice.beats.length === 0) {
            const emptyBeat: Beat = new Beat();
            emptyBeat.isEmpty = true;
            voice.addBeat(emptyBeat);
        }

        return anyStaffMeta || anyBarMeta || anyBeatData;
    }

    private _newBar(staff: Staff): Bar {
        // existing bar? -> e.g. in multi-voice setups where we fill empty voices later
        if (this._barIndex < staff.bars.length) {
            const bar = staff.bars[this._barIndex];
            this._barIndex++;
            return bar;
        }

        const voiceCount = staff.bars.length === 0 ? 1 : staff.bars[0].voices.length;

        // need new bar
        const newBar: Bar = new Bar();
        staff.addBar(newBar);
        if (newBar.previousBar) {
            newBar.clef = newBar.previousBar.clef;
            newBar.clefOttava = newBar.previousBar.clefOttava;
            newBar.keySignature = newBar.previousBar!.keySignature;
            newBar.keySignatureType = newBar.previousBar!.keySignatureType;
        }
        this._barIndex++;

        if (newBar.index > 0) {
            newBar.clef = newBar.previousBar!.clef;
        }

        for (let i = 0; i < voiceCount; i++) {
            const voice: Voice = new Voice();
            newBar.addVoice(voice);
        }

        return newBar;
    }

    private _beat(voice: Voice): boolean {
        // duration specifier?
        this._beatDuration();

        const beat: Beat = new Beat();
        voice.addBeat(beat);

        this._lexer.allowTuning = !this._currentStaff.isPercussion;

        // notes
        if (this._sy === AlphaTexSymbols.LParensis) {
            this._sy = this._newSy();
            this._note(beat);
            while (this._sy !== AlphaTexSymbols.RParensis && this._sy !== AlphaTexSymbols.Eof) {
                this._lexer.allowTuning = !this._currentStaff.isPercussion;
                if (!this._note(beat)) {
                    break;
                }
            }
            if (this._sy !== AlphaTexSymbols.RParensis) {
                this._error('note-list', AlphaTexSymbols.RParensis, true);
            }
            this._sy = this._newSy();
        } else if (this._sy === AlphaTexSymbols.String && (this._syData as string).toLowerCase() === 'r') {
            // rest voice -> no notes
            this._sy = this._newSy();
        } else {
            if (!this._note(beat)) {
                voice.beats.splice(voice.beats.length - 1, 1);
                return false;
            }
        }
        // new duration
        if (this._sy === AlphaTexSymbols.Dot) {
            this._sy = this._newSy();
            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('duration', AlphaTexSymbols.Number, true);
            }
            this._currentDuration = this._parseDuration(this._syData as number);
            this._sy = this._newSy();
        }
        beat.duration = this._currentDuration;
        beat.dynamics = this._currentDynamics;
        if (this._currentTuplet !== 1 && !beat.hasTuplet) {
            AlphaTexImporter._applyTuplet(beat, this._currentTuplet);
        }
        // beat multiplier (repeat beat n times)
        let beatRepeat: number = 1;
        if (this._sy === AlphaTexSymbols.Multiply) {
            this._sy = this._newSy();
            // multiplier count
            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('multiplier', AlphaTexSymbols.Number, true);
            } else {
                beatRepeat = this._syData as number;
            }
            this._sy = this._newSy();
        }
        this._beatEffects(beat);
        for (let i: number = 0; i < beatRepeat - 1; i++) {
            voice.addBeat(BeatCloner.clone(beat));
        }
        return true;
    }

    private _beatDuration(): void {
        if (this._sy !== AlphaTexSymbols.DoubleDot) {
            return;
        }
        this._sy = this._newSy();
        if (this._sy !== AlphaTexSymbols.Number) {
            this._error('duration', AlphaTexSymbols.Number, true);
        }
        this._currentDuration = this._parseDuration(this._syData as number);
        this._currentTuplet = 1;
        this._sy = this._newSy();
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this._newSy();
        while (this._sy === AlphaTexSymbols.String) {
            const effect: string = (this._syData as string).toLowerCase();
            switch (effect) {
                case 'tu':
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('duration-tuplet', AlphaTexSymbols.Number, true);
                    }
                    this._currentTuplet = this._syData as number;
                    this._sy = this._newSy();
                    break;
                default:
                    this._error('beat-duration', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this._error('beat-duration', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this._newSy();
    }

    private _beatEffects(beat: Beat): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this._newSy();
        while (this._sy === AlphaTexSymbols.String) {
            if (!this._applyBeatEffect(beat)) {
                this._error('beat-effects', AlphaTexSymbols.String, false);
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this._error('beat-effects', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this._newSy();
    }

    /**
     * Tries to apply a beat effect to the given beat.
     * @returns true if a effect could be applied, otherwise false
     */
    private _applyBeatEffect(beat: Beat): boolean {
        const syData: string = (this._syData as string).toLowerCase();
        if (syData === 'f') {
            beat.fade = FadeType.FadeIn;
        } else if (syData === 'fo') {
            beat.fade = FadeType.FadeOut;
        } else if (syData === 'vs') {
            beat.fade = FadeType.VolumeSwell;
        } else if (syData === 'v') {
            beat.vibrato = VibratoType.Slight;
        } else if (syData === 'vw') {
            beat.vibrato = VibratoType.Wide;
        } else if (syData === 's') {
            beat.slap = true;
        } else if (syData === 'p') {
            beat.pop = true;
        } else if (syData === 'tt') {
            beat.tap = true;
        } else if (syData === 'txt') {
            this._sy = this._newSy();
            if (this._sy !== AlphaTexSymbols.String) {
                this._error('beat-text', AlphaTexSymbols.String, true);
                return false;
            }
            beat.text = this._syData as string;
        } else if (syData === 'lyrics') {
            this._sy = this._newSy();

            let lyricsLine = 0;
            if (this._sy === AlphaTexSymbols.Number) {
                lyricsLine = this._syData as number;
                this._sy = this._newSy();
            }

            if (this._sy !== AlphaTexSymbols.String) {
                this._error('lyrics', AlphaTexSymbols.String, true);
                return false;
            }

            if (!beat.lyrics) {
                beat.lyrics = [];
            }

            while (beat.lyrics!.length <= lyricsLine) {
                beat.lyrics.push('');
            }

            beat.lyrics[lyricsLine] = this._syData as string;
        } else if (syData === 'dd') {
            beat.dots = 2;
        } else if (syData === 'd') {
            beat.dots = 1;
        } else if (syData === 'su') {
            beat.pickStroke = PickStroke.Up;
        } else if (syData === 'sd') {
            beat.pickStroke = PickStroke.Down;
        } else if (syData === 'tu') {
            this._sy = this._newSy();
            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('tuplet', AlphaTexSymbols.Number, true);
                return false;
            }

            const numerator = this._syData as number;
            this._sy = this._newSy();

            if (this._sy === AlphaTexSymbols.Number) {
                const denominator = this._syData as number;
                this._sy = this._newSy();
                beat.tupletNumerator = numerator;
                beat.tupletDenominator = denominator;
            } else {
                AlphaTexImporter._applyTuplet(beat, numerator);
            }

            return true;
        } else if (syData === 'tb' || syData === 'tbe') {
            this._sy = this._newSy();

            const exact: boolean = syData === 'tbe';

            // Type
            if (this._sy === AlphaTexSymbols.String) {
                beat.whammyBarType = this._parseWhammyType(this._syData as string);
                this._sy = this._newSy();
            }

            // Style
            if (this._sy === AlphaTexSymbols.String) {
                beat.whammyStyle = this._parseBendStyle(this._syData as string);
                this._sy = this._newSy();
            }

            // read points
            if (this._sy !== AlphaTexSymbols.LParensis) {
                this._error('tremolobar-effect', AlphaTexSymbols.LParensis, true);
            }
            this._sy = this._newSy(true);
            while (this._sy !== AlphaTexSymbols.RParensis && this._sy !== AlphaTexSymbols.Eof) {
                let offset: number = 0;
                let value: number = 0;
                if (exact) {
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('tremolobar-effect', AlphaTexSymbols.Number, true);
                    }
                    offset = this._syData as number;
                    this._sy = this._newSy(true);
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('tremolobar-effect', AlphaTexSymbols.Number, true);
                    }
                    value = this._syData as number;
                } else {
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('tremolobar-effect', AlphaTexSymbols.Number, true);
                    }
                    offset = 0;
                    value = this._syData as number;
                }
                beat.addWhammyBarPoint(new BendPoint(offset, value));
                this._sy = this._newSy(true);
            }
            if (beat.whammyBarPoints != null) {
                while (beat.whammyBarPoints.length > 60) {
                    beat.removeWhammyBarPoint(beat.whammyBarPoints.length - 1);
                }
                // set positions
                if (!exact) {
                    const count: number = beat.whammyBarPoints.length;
                    const step: number = (BendPoint.MaxPosition / (count - 1)) | 0;
                    let i: number = 0;
                    while (i < count) {
                        beat.whammyBarPoints[i].offset = Math.min(BendPoint.MaxPosition, i * step);
                        i++;
                    }
                } else {
                    beat.whammyBarPoints.sort((a, b) => a.offset - b.offset);
                }
            }
            if (this._sy !== AlphaTexSymbols.RParensis) {
                this._error('tremolobar-effect', AlphaTexSymbols.RParensis, true);
            }
        } else if (syData === 'bu' || syData === 'bd' || syData === 'au' || syData === 'ad') {
            switch (syData) {
                case 'bu':
                    beat.brushType = BrushType.BrushUp;
                    break;
                case 'bd':
                    beat.brushType = BrushType.BrushDown;
                    break;
                case 'au':
                    beat.brushType = BrushType.ArpeggioUp;
                    break;
                case 'ad':
                    beat.brushType = BrushType.ArpeggioDown;
                    break;
            }
            this._sy = this._newSy();
            if (this._sy === AlphaTexSymbols.Number) {
                // explicit duration
                beat.brushDuration = this._syData as number;
                this._sy = this._newSy();
                return true;
            }
            // default to calculated duration
            beat.updateDurations();
            if (syData === 'bu' || syData === 'bd') {
                beat.brushDuration = beat.playbackDuration / 4 / beat.notes.length;
            } else if (syData === 'au' || syData === 'ad') {
                beat.brushDuration = beat.playbackDuration / beat.notes.length;
            }
            return true;
        } else if (syData === 'ch') {
            this._sy = this._newSy();
            const chordName: string = this._syData as string;
            const chordId: string = this._getChordId(this._currentStaff, chordName);
            if (!this._currentStaff.hasChord(chordId)) {
                const chord: Chord = new Chord();
                chord.showDiagram = false;
                chord.name = chordName;
                this._currentStaff.addChord(chordId, chord);
            }
            beat.chordId = chordId;
        } else if (syData === 'gr') {
            this._sy = this._newSy();
            if ((this._syData as string).toLowerCase() === 'ob') {
                beat.graceType = GraceType.OnBeat;
                this._sy = this._newSy();
            } else if ((this._syData as string).toLowerCase() === 'b') {
                beat.graceType = GraceType.BendGrace;
                this._sy = this._newSy();
            } else {
                beat.graceType = GraceType.BeforeBeat;
            }
            return true;
        } else if (syData === 'dy') {
            this._sy = this._newSy();
            const dynamicString = (this._syData as string).toUpperCase() as keyof typeof DynamicValue;
            switch (dynamicString) {
                case 'PPP':
                case 'PP':
                case 'P':
                case 'MP':
                case 'MF':
                case 'F':
                case 'FF':
                case 'FFF':
                case 'PPPP':
                case 'PPPPP':
                case 'PPPPPP':
                case 'FFFF':
                case 'FFFFF':
                case 'FFFFFF':
                case 'SF':
                case 'SFP':
                case 'SFPP':
                case 'FP':
                case 'RF':
                case 'RFZ':
                case 'SFZ':
                case 'SFFZ':
                case 'FZ':
                case 'N':
                case 'PF':
                case 'SFZP':
                    beat.dynamics = DynamicValue[dynamicString];
                    break;
            }
            this._currentDynamics = beat.dynamics;
        } else if (syData === 'cre') {
            beat.crescendo = CrescendoType.Crescendo;
        } else if (syData === 'dec') {
            beat.crescendo = CrescendoType.Decrescendo;
        } else if (syData === 'tempo') {
            // NOTE: playbackRatio is calculated on score finish when playback positions are known
            const tempoAutomation = this._readTempoAutomation(false);

            if (beat.index === 0) {
                const existing = beat.voice.bar.masterBar.tempoAutomations.find(a => a.ratioPosition === 0);
                if (existing) {
                    existing.value = tempoAutomation.value;
                    existing.text = tempoAutomation.text;
                    beat.automations.push(existing);
                    return true;
                }
            }
            beat.automations.push(tempoAutomation);
            beat.voice.bar.masterBar.tempoAutomations.push(tempoAutomation);

            return true;
        } else if (syData === 'volume') {
            // NOTE: playbackRatio is calculated on score finish when playback positions are known
            this._sy = this._newSy();
            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('volume', AlphaTexSymbols.Number, true);
            }
            const volumeAutomation: Automation = new Automation();
            volumeAutomation.isLinear = true;
            volumeAutomation.type = AutomationType.Volume;
            volumeAutomation.value = this._syData as number;
            this._sy = this._newSy();

            beat.automations.push(volumeAutomation);
            return true;
        } else if (syData === 'balance') {
            // NOTE: playbackRatio is calculated on score finish when playback positions are known
            this._sy = this._newSy();
            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('balance', AlphaTexSymbols.Number, true);
            }
            const balanceAutomation: Automation = new Automation();
            balanceAutomation.isLinear = true;
            balanceAutomation.type = AutomationType.Balance;
            balanceAutomation.value = ModelUtils.clamp(this._syData as number, 0, 16);
            this._sy = this._newSy();

            beat.automations.push(balanceAutomation);
            return true;
        } else if (syData === 'tp') {
            this._sy = this._newSy();
            beat.tremoloSpeed = Duration.Eighth;
            if (this._sy === AlphaTexSymbols.Number) {
                switch (this._syData as number) {
                    case 8:
                        beat.tremoloSpeed = Duration.Eighth;
                        break;
                    case 16:
                        beat.tremoloSpeed = Duration.Sixteenth;
                        break;
                    case 32:
                        beat.tremoloSpeed = Duration.ThirtySecond;
                        break;
                    default:
                        beat.tremoloSpeed = Duration.Eighth;
                        break;
                }
                this._sy = this._newSy();
            }
            return true;
        } else if (syData === 'spd') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Down;
            // exact ratio position will be applied after .finish() when times are known
            sustainPedal.ratioPosition = beat.voice.bar.sustainPedals.length;
            this._sustainPedalToBeat.set(sustainPedal, beat);
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this._sy = this._newSy();
            return true;
        } else if (syData === 'sph') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Hold;
            // exact ratio position will be applied after .finish() when times are known
            sustainPedal.ratioPosition = beat.voice.bar.sustainPedals.length;
            this._sustainPedalToBeat.set(sustainPedal, beat);
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this._sy = this._newSy();
            return true;
        } else if (syData === 'spu') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Up;
            // exact ratio position will be applied after .finish() when times are known
            sustainPedal.ratioPosition = beat.voice.bar.sustainPedals.length;
            this._sustainPedalToBeat.set(sustainPedal, beat);
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this._sy = this._newSy();
            return true;
        } else if (syData === 'spe') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Up;
            sustainPedal.ratioPosition = 1;
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this._sy = this._newSy();
            return true;
        } else if (syData === 'slashed') {
            beat.slashed = true;
            this._sy = this._newSy();
            return true;
        } else if (syData === 'ds') {
            beat.deadSlapped = true;
            this._sy = this._newSy();
            if (beat.notes.length === 1 && beat.notes[0].isDead) {
                beat.removeNote(beat.notes[0]);
            }
            return true;
        } else if (syData === 'glpf') {
            this._sy = this._newSy();
            beat.golpe = GolpeType.Finger;
            return true;
        } else if (syData === 'glpt') {
            this._sy = this._newSy();
            beat.golpe = GolpeType.Thumb;
            return true;
        } else if (syData === 'waho') {
            this._sy = this._newSy();
            beat.wahPedal = WahPedal.Open;
            return true;
        } else if (syData === 'wahc') {
            this._sy = this._newSy();
            beat.wahPedal = WahPedal.Closed;
            return true;
        } else if (syData === 'barre') {
            this._sy = this._newSy();

            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('beat-barre', AlphaTexSymbols.Number, true);
            }
            beat.barreFret = this._syData as number;
            beat.barreShape = BarreShape.Full;
            this._sy = this._newSy();

            if (this._sy === AlphaTexSymbols.String) {
                switch ((this._syData as string).toLowerCase()) {
                    case 'full':
                        beat.barreShape = BarreShape.Full;
                        this._sy = this._newSy();
                        break;
                    case 'half':
                        beat.barreShape = BarreShape.Half;
                        this._sy = this._newSy();
                        break;
                }
            }

            return true;
        } else if (syData === 'rasg') {
            this._sy = this._newSy();

            if (this._sy !== AlphaTexSymbols.String) {
                this._error('rasgueado', AlphaTexSymbols.String, true);
            }

            switch ((this._syData as string).toLowerCase()) {
                case 'ii':
                    beat.rasgueado = Rasgueado.Ii;
                    break;
                case 'mi':
                    beat.rasgueado = Rasgueado.Mi;
                    break;
                case 'miitriplet':
                    beat.rasgueado = Rasgueado.MiiTriplet;
                    break;
                case 'miianapaest':
                    beat.rasgueado = Rasgueado.MiiAnapaest;
                    break;
                case 'pmptriplet':
                    beat.rasgueado = Rasgueado.PmpTriplet;
                    break;
                case 'pmpanapaest':
                    beat.rasgueado = Rasgueado.PmpAnapaest;
                    break;
                case 'peitriplet':
                    beat.rasgueado = Rasgueado.PeiTriplet;
                    break;
                case 'peianapaest':
                    beat.rasgueado = Rasgueado.PeiAnapaest;
                    break;
                case 'paitriplet':
                    beat.rasgueado = Rasgueado.PaiTriplet;
                    break;
                case 'paianapaest':
                    beat.rasgueado = Rasgueado.PaiAnapaest;
                    break;
                case 'amitriplet':
                    beat.rasgueado = Rasgueado.AmiTriplet;
                    break;
                case 'amianapaest':
                    beat.rasgueado = Rasgueado.AmiAnapaest;
                    break;
                case 'ppp':
                    beat.rasgueado = Rasgueado.Ppp;
                    break;
                case 'amii':
                    beat.rasgueado = Rasgueado.Amii;
                    break;
                case 'amip':
                    beat.rasgueado = Rasgueado.Amip;
                    break;
                case 'eami':
                    beat.rasgueado = Rasgueado.Eami;
                    break;
                case 'eamii':
                    beat.rasgueado = Rasgueado.Eamii;
                    break;
                case 'peami':
                    beat.rasgueado = Rasgueado.Peami;
                    break;
            }
            this._sy = this._newSy();

            return true;
        } else if (syData === 'ot') {
            this._sy = this._newSy();

            if (this._sy !== AlphaTexSymbols.String) {
                this._error('beat-ottava', AlphaTexSymbols.String, true);
            }

            beat.ottava = this._parseClefOttavaFromString(this._syData as string);
        } else if (syData === 'legatoorigin') {
            beat.isLegatoOrigin = true;
        } else if (syData === 'instrument') {
            this._sy = this._newSy();

            let program = 0;

            if (this._sy === AlphaTexSymbols.Number) {
                program = this._syData as number;
            } else if (this._sy === AlphaTexSymbols.String) {
                program = GeneralMidi.getValue(this._syData as string);
            } else {
                this._error('instrument-change', AlphaTexSymbols.Number, true);
            }

            const automation = new Automation();
            automation.isLinear = false;
            automation.type = AutomationType.Instrument;
            automation.value = program;
            beat.automations.push(automation);
        } else if (syData === 'bank') {
            this._sy = this._newSy();

            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('bank-change', AlphaTexSymbols.Number, true);
            }

            const automation = new Automation();
            automation.isLinear = false;
            automation.type = AutomationType.Bank;
            automation.value = this._syData as number;
            beat.automations.push(automation);
        } else if (syData === 'fermata') {
            this._sy = this._newSy();
            if (this._sy !== AlphaTexSymbols.String) {
                this._error('fermata', AlphaTexSymbols.Number, true);
            }

            const fermata = new Fermata();
            fermata.type = this._parseFermataFromString(this._syData as string);

            this._sy = this._newSy(true);
            if (this._sy === AlphaTexSymbols.Number) {
                fermata.length = this._syData as number;
                this._sy = this._newSy();
            }

            beat.fermata = fermata;

            return true;
        } else if (syData === 'beam') {
            this._sy = this._newSy();
            if (this._sy !== AlphaTexSymbols.String) {
                this._error('beam', AlphaTexSymbols.Number, true);
            }

            switch ((this._syData as string).toLowerCase()) {
                case 'invert':
                    beat.invertBeamDirection = true;
                    break;
                case 'up':
                    beat.preferredBeamDirection = BeamDirection.Up;
                    break;
                case 'down':
                    beat.preferredBeamDirection = BeamDirection.Down;
                    break;
                case 'auto':
                    beat.beamingMode = BeatBeamingMode.Auto;
                    break;
                case 'split':
                    beat.beamingMode = BeatBeamingMode.ForceSplitToNext;
                    break;
                case 'merge':
                    beat.beamingMode = BeatBeamingMode.ForceMergeWithNext;
                    break;
                case 'splitsecondary':
                    beat.beamingMode = BeatBeamingMode.ForceSplitOnSecondaryToNext;
                    break;
            }
        } else if (syData === 'timer') {
            beat.showTimer = true;
        } else {
            // string didn't match any beat effect syntax
            return false;
        }
        // default behaviour when a beat effect above
        // does not handle new symbol + return on its own
        this._sy = this._newSy();
        return true;
    }

    private _parseBracketExtendMode(str: string): BracketExtendMode {
        switch (str.toLowerCase()) {
            case 'nobrackets':
                return BracketExtendMode.NoBrackets;
            case 'groupstaves':
                return BracketExtendMode.GroupStaves;
            case 'groupsimilarinstruments':
                return BracketExtendMode.GroupSimilarInstruments;
            default:
                return BracketExtendMode.GroupStaves;
        }
    }

    private _parseFermataFromString(str: string): FermataType {
        switch (str.toLowerCase()) {
            case 'short':
                return FermataType.Short;
            case 'medium':
                return FermataType.Medium;
            case 'long':
                return FermataType.Long;
            default:
                return FermataType.Medium;
        }
    }

    private _parseClefOttavaFromString(str: string): Ottavia {
        switch (str.toLowerCase()) {
            case '15ma':
                return Ottavia._15ma;
            case '8va':
                return Ottavia._8va;
            case 'regular':
                return Ottavia.Regular;
            case '8vb':
                return Ottavia._8vb;
            case '15mb':
                return Ottavia._15mb;
            default:
                return Ottavia.Regular;
        }
    }

    private _getChordId(currentStaff: Staff, chordName: string): string {
        return chordName.toLowerCase() + currentStaff.index + currentStaff.track.index;
    }

    private static _applyTuplet(beat: Beat, tuplet: number): void {
        switch (tuplet) {
            case 3:
                beat.tupletNumerator = 3;
                beat.tupletDenominator = 2;
                break;
            case 5:
                beat.tupletNumerator = 5;
                beat.tupletDenominator = 4;
                break;
            case 6:
                beat.tupletNumerator = 6;
                beat.tupletDenominator = 4;
                break;
            case 7:
                beat.tupletNumerator = 7;
                beat.tupletDenominator = 4;
                break;
            case 9:
                beat.tupletNumerator = 9;
                beat.tupletDenominator = 8;
                break;
            case 10:
                beat.tupletNumerator = 10;
                beat.tupletDenominator = 8;
                break;
            case 11:
                beat.tupletNumerator = 11;
                beat.tupletDenominator = 8;
                break;
            case 12:
                beat.tupletNumerator = 12;
                beat.tupletDenominator = 8;
                break;
            default:
                beat.tupletNumerator = 1;
                beat.tupletDenominator = 1;
                break;
        }
    }

    private _isNoteText(txt: string): boolean {
        return txt === 'x' || txt === '-' || txt === 'r';
    }

    private _note(beat: Beat): boolean {
        // fret.string or TuningWithAccidentals
        let isDead: boolean = false;
        let isTie: boolean = false;
        let fret: number = -1;
        let octave: number = -1;
        let tone: number = -1;
        let accidentalMode: NoteAccidentalMode = NoteAccidentalMode.Default;
        switch (this._sy) {
            case AlphaTexSymbols.Number:
                fret = this._syData as number;
                if (this._currentStaff.isPercussion && !PercussionMapper.instrumentArticulations.has(fret)) {
                    this._errorMessage(`Unknown percussion articulation ${fret}`);
                }
                break;
            case AlphaTexSymbols.String:
                if (this._currentStaff.isPercussion) {
                    const articulationName = (this._syData as string).toLowerCase();
                    if (this._percussionArticulationNames.has(articulationName)) {
                        fret = this._percussionArticulationNames.get(articulationName)!;
                    } else {
                        this._errorMessage(`Unknown percussion articulation '${this._syData}'`);
                    }
                } else {
                    isDead = (this._syData as string) === 'x';
                    isTie = (this._syData as string) === '-';

                    if (isTie || isDead) {
                        fret = 0;
                    } else {
                        this._error('note-fret', AlphaTexSymbols.Number, true);
                    }
                }
                break;
            case AlphaTexSymbols.Tuning:
                // auto convert staff
                if (beat.index === 0 && beat.voice.index === 0 && beat.voice.bar.index === 0) {
                    this._makeCurrentStaffPitched();
                }

                const tuning: TuningParseResult = this._syData as TuningParseResult;
                octave = tuning.octave;
                tone = tuning.tone.noteValue;
                if (this._accidentalMode === AlphaTexAccidentalMode.Explicit) {
                    accidentalMode = tuning.tone.accidentalMode;
                }
                break;
            default:
                return false;
        }
        this._sy = this._newSy(); // Fret done

        const isFretted: boolean =
            octave === -1 && this._currentStaff.tuning.length > 0 && !this._currentStaff.isPercussion;
        let noteString: number = -1;
        if (isFretted) {
            // Fret [Dot] String
            if (this._sy !== AlphaTexSymbols.Dot) {
                this._error('note', AlphaTexSymbols.Dot, true);
            }
            this._sy = this._newSy(); // dot done

            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('note-string', AlphaTexSymbols.Number, true);
            }
            noteString = this._syData as number;
            if (noteString < 1 || noteString > this._currentStaff.tuning.length) {
                this._error('note-string', AlphaTexSymbols.Number, false);
            }
            this._sy = this._newSy(); // string done
        }
        // read effects
        const note: Note = new Note();
        if (isFretted) {
            note.string = this._currentStaff.tuning.length - (noteString - 1);
            note.isDead = isDead;
            note.isTieDestination = isTie;
            if (!isTie) {
                note.fret = fret;
            }
        } else if (this._currentStaff.isPercussion) {
            const articulationValue = fret;
            let articulationIndex: number = 0;
            if (this._articulationValueToIndex.has(articulationValue)) {
                articulationIndex = this._articulationValueToIndex.get(articulationValue)!;
            } else {
                articulationIndex = this._currentTrack.percussionArticulations.length;
                const articulation = PercussionMapper.getArticulationByInputMidiNumber(articulationValue);
                if (articulation === null) {
                    this._errorMessage(`Unknown articulation value ${articulationValue}`);
                }

                this._currentTrack.percussionArticulations.push(articulation!);
                this._articulationValueToIndex.set(articulationValue, articulationIndex);
            }

            note.percussionArticulation = articulationIndex;
        } else {
            note.octave = octave;
            note.tone = tone;
            note.accidentalMode = accidentalMode;
            note.isTieDestination = isTie;
        }
        beat.addNote(note);
        this._noteEffects(note);
        return true;
    }

    private _noteEffects(note: Note): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this._newSy();
        while (this._sy === AlphaTexSymbols.String) {
            const syData = (this._syData as string).toLowerCase();
            if (syData === 'b' || syData === 'be') {
                this._sy = this._newSy();
                const exact: boolean = syData === 'be';

                // Type
                if (this._sy === AlphaTexSymbols.String) {
                    note.bendType = this._parseBendType(this._syData as string);
                    this._sy = this._newSy();
                }

                // Style
                if (this._sy === AlphaTexSymbols.String) {
                    note.bendStyle = this._parseBendStyle(this._syData as string);
                    this._sy = this._newSy();
                }

                // read points
                if (this._sy !== AlphaTexSymbols.LParensis) {
                    this._error('bend-effect', AlphaTexSymbols.LParensis, true);
                }

                if (exact) {
                    // float on position
                    this._sy = this._newSy(true);
                } else {
                    this._sy = this._newSy();
                }

                while (this._sy !== AlphaTexSymbols.RParensis && this._sy !== AlphaTexSymbols.Eof) {
                    let offset: number = 0;
                    let value: number = 0;
                    if (exact) {
                        if (this._sy !== AlphaTexSymbols.Number) {
                            this._error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        offset = this._syData as number;
                        this._sy = this._newSy();
                        if (this._sy !== AlphaTexSymbols.Number) {
                            this._error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        value = this._syData as number;
                    } else {
                        if (this._sy !== AlphaTexSymbols.Number) {
                            this._error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        value = this._syData as number;
                    }
                    note.addBendPoint(new BendPoint(offset, value));

                    if (exact) {
                        // float on position
                        this._sy = this._newSy(true);
                    } else {
                        this._sy = this._newSy();
                    }
                }
                const points = note.bendPoints;
                if (points != null) {
                    while (points.length > 60) {
                        points.splice(points.length - 1, 1);
                    }
                    // set positions
                    if (exact) {
                        points.sort((a, b) => {
                            return a.offset - b.offset;
                        });
                    } else {
                        const count: number = points.length;
                        const step: number = (60 / (count - 1)) | 0;
                        let i: number = 0;
                        while (i < count) {
                            points[i].offset = Math.min(60, i * step);
                            i++;
                        }
                    }
                }
                if (this._sy !== AlphaTexSymbols.RParensis) {
                    this._error('bend-effect', AlphaTexSymbols.RParensis, true);
                }
                this._sy = this._newSy();
            } else if (syData === 'nh') {
                note.harmonicType = HarmonicType.Natural;
                note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(note.fret);
                this._sy = this._newSy();
            } else if (syData === 'ah') {
                // todo: Artificial Key
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = this._harmonicValue(note.harmonicValue);
            } else if (syData === 'th') {
                // todo: store tapped fret in data
                note.harmonicType = HarmonicType.Tap;
                note.harmonicValue = this._harmonicValue(note.harmonicValue);
            } else if (syData === 'ph') {
                note.harmonicType = HarmonicType.Pinch;
                note.harmonicValue = this._harmonicValue(note.harmonicValue);
            } else if (syData === 'sh') {
                note.harmonicType = HarmonicType.Semi;
                note.harmonicValue = this._harmonicValue(note.harmonicValue);
            } else if (syData === 'fh') {
                note.harmonicType = HarmonicType.Feedback;
                note.harmonicValue = this._harmonicValue(note.harmonicValue);
            } else if (syData === 'tr') {
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('trill-effect', AlphaTexSymbols.Number, true);
                }
                const fret: number = this._syData as number;
                this._sy = this._newSy();
                let duration: Duration = Duration.Sixteenth;
                if (this._sy === AlphaTexSymbols.Number) {
                    switch (this._syData as number) {
                        case 16:
                            duration = Duration.Sixteenth;
                            break;
                        case 32:
                            duration = Duration.ThirtySecond;
                            break;
                        case 64:
                            duration = Duration.SixtyFourth;
                            break;
                        default:
                            duration = Duration.Sixteenth;
                            break;
                    }
                    this._sy = this._newSy();
                }
                note.trillValue = fret + note.stringTuning;
                note.trillSpeed = duration;
            } else if (syData === 'v') {
                this._sy = this._newSy();
                note.vibrato = VibratoType.Slight;
            } else if (syData === 'vw') {
                this._sy = this._newSy();
                note.vibrato = VibratoType.Wide;
            } else if (syData === 'sl') {
                this._sy = this._newSy();
                note.slideOutType = SlideOutType.Legato;
            } else if (syData === 'ss') {
                this._sy = this._newSy();
                note.slideOutType = SlideOutType.Shift;
            } else if (syData === 'sib') {
                this._sy = this._newSy();
                note.slideInType = SlideInType.IntoFromBelow;
            } else if (syData === 'sia') {
                this._sy = this._newSy();
                note.slideInType = SlideInType.IntoFromAbove;
            } else if (syData === 'sou') {
                this._sy = this._newSy();
                note.slideOutType = SlideOutType.OutUp;
            } else if (syData === 'sod') {
                this._sy = this._newSy();
                note.slideOutType = SlideOutType.OutDown;
            } else if (syData === 'psd') {
                this._sy = this._newSy();
                note.slideOutType = SlideOutType.PickSlideDown;
            } else if (syData === 'psu') {
                this._sy = this._newSy();
                note.slideOutType = SlideOutType.PickSlideUp;
            } else if (syData === 'h') {
                this._sy = this._newSy();
                note.isHammerPullOrigin = true;
            } else if (syData === 'lht') {
                this._sy = this._newSy();
                note.isLeftHandTapped = true;
            } else if (syData === 'g') {
                this._sy = this._newSy();
                note.isGhost = true;
            } else if (syData === 'ac') {
                this._sy = this._newSy();
                note.accentuated = AccentuationType.Normal;
            } else if (syData === 'hac') {
                this._sy = this._newSy();
                note.accentuated = AccentuationType.Heavy;
            } else if (syData === 'ten') {
                this._sy = this._newSy();
                note.accentuated = AccentuationType.Tenuto;
            } else if (syData === 'pm') {
                this._sy = this._newSy();
                note.isPalmMute = true;
            } else if (syData === 'st') {
                this._sy = this._newSy();
                note.isStaccato = true;
            } else if (syData === 'lr') {
                this._sy = this._newSy();
                note.isLetRing = true;
            } else if (syData === 'x') {
                this._sy = this._newSy();
                note.isDead = true;
            } else if (syData === '-' || syData === 't') {
                this._sy = this._newSy();
                note.isTieDestination = true;
            } else if (syData === 'lf') {
                this._sy = this._newSy();
                let finger: Fingers = Fingers.Thumb;
                if (this._sy === AlphaTexSymbols.Number) {
                    finger = this._toFinger(this._syData as number);
                    this._sy = this._newSy();
                }
                note.leftHandFinger = finger;
            } else if (syData === 'rf') {
                this._sy = this._newSy();
                let finger: Fingers = Fingers.Thumb;
                if (this._sy === AlphaTexSymbols.Number) {
                    finger = this._toFinger(this._syData as number);
                    this._sy = this._newSy();
                }
                note.rightHandFinger = finger;
            } else if (syData === 'acc') {
                this._sy = this._newSy();

                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('note-accidental', AlphaTexSymbols.String, true);
                }

                note.accidentalMode = ModelUtils.parseAccidentalMode(this._syData as string);
                this._sy = this._newSy();
            } else if (syData === 'turn') {
                this._sy = this._newSy();
                note.ornament = NoteOrnament.Turn;
            } else if (syData === 'iturn') {
                this._sy = this._newSy();
                note.ornament = NoteOrnament.InvertedTurn;
            } else if (syData === 'umordent') {
                this._sy = this._newSy();
                note.ornament = NoteOrnament.UpperMordent;
            } else if (syData === 'lmordent') {
                this._sy = this._newSy();
                note.ornament = NoteOrnament.LowerMordent;
            } else if (syData === 'string') {
                this._sy = this._newSy();
                note.showStringNumber = true;
            } else if (syData === 'hide') {
                this._sy = this._newSy();
                note.isVisible = false;
            } else if (syData === 'slur') {
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('slur', AlphaTexSymbols.String, true);
                }

                const slurId = this._syData as string;
                if (this._slurs.has(slurId)) {
                    const slurOrigin = this._slurs.get(slurId)!;
                    slurOrigin.slurDestination = note;

                    note.slurOrigin = slurOrigin;
                    note.isSlurDestination = true;
                } else {
                    this._slurs.set(slurId, note);
                }

                this._sy = this._newSy();
            } else if (this._applyBeatEffect(note.beat)) {
                // Success
            } else {
                this._error(syData, AlphaTexSymbols.String, false);
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this._error('note-effect', AlphaTexSymbols.RBrace, false);
        }
        this._sy = this._newSy();
    }

    private _harmonicValue(harmonicValue: number): number {
        this._sy = this._newSy(true);
        if (this._sy === AlphaTexSymbols.Number) {
            harmonicValue = this._syData as number;
            this._sy = this._newSy(true);
        }
        return harmonicValue;
    }

    private _toFinger(num: number): Fingers {
        switch (num) {
            case 1:
                return Fingers.Thumb;
            case 2:
                return Fingers.IndexFinger;
            case 3:
                return Fingers.MiddleFinger;
            case 4:
                return Fingers.AnnularFinger;
            case 5:
                return Fingers.LittleFinger;
        }
        return Fingers.Thumb;
    }

    private _parseDuration(duration: number): Duration {
        switch (duration) {
            case -4:
                return Duration.QuadrupleWhole;
            case -2:
                return Duration.DoubleWhole;
            case 1:
                return Duration.Whole;
            case 2:
                return Duration.Half;
            case 4:
                return Duration.Quarter;
            case 8:
                return Duration.Eighth;
            case 16:
                return Duration.Sixteenth;
            case 32:
                return Duration.ThirtySecond;
            case 64:
                return Duration.SixtyFourth;
            case 128:
                return Duration.OneHundredTwentyEighth;
            case 256:
                return Duration.TwoHundredFiftySixth;
            default:
                return Duration.Quarter;
        }
    }

    private _parseBendStyle(str: string): BendStyle {
        switch (str.toLowerCase()) {
            case 'gradual':
                return BendStyle.Gradual;
            case 'fast':
                return BendStyle.Fast;
            default:
                return BendStyle.Default;
        }
    }

    private _parseBendType(str: string): BendType {
        switch (str.toLowerCase()) {
            case 'none':
                return BendType.None;
            case 'custom':
                return BendType.Custom;
            case 'bend':
                return BendType.Bend;
            case 'release':
                return BendType.Release;
            case 'bendrelease':
                return BendType.BendRelease;
            case 'hold':
                return BendType.Hold;
            case 'prebend':
                return BendType.Prebend;
            case 'prebendbend':
                return BendType.PrebendBend;
            case 'prebendrelease':
                return BendType.PrebendRelease;
            default:
                return BendType.Custom;
        }
    }

    private _barMeta(bar: Bar): boolean {
        let anyMeta = false;
        const master: MasterBar = bar.masterBar;
        let endOfMeta = false;
        while (!endOfMeta && this._sy === AlphaTexSymbols.MetaCommand) {
            anyMeta = true;
            const syData: string = (this._syData as string).toLowerCase();
            if (syData === 'ts') {
                this._sy = this._newSy();
                if (this._sy === AlphaTexSymbols.String) {
                    if ((this._syData as string).toLowerCase() === 'common') {
                        master.timeSignatureCommon = true;
                        master.timeSignatureNumerator = 4;
                        master.timeSignatureDenominator = 4;
                        this._sy = this._newSy();
                    } else {
                        this._error('timesignature-numerator', AlphaTexSymbols.String, true);
                    }
                } else {
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('timesignature-numerator', AlphaTexSymbols.Number, true);
                    }
                    master.timeSignatureNumerator = this._syData as number;
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('timesignature-denominator', AlphaTexSymbols.Number, true);
                    }
                    master.timeSignatureDenominator = this._syData as number;
                    this._sy = this._newSy();
                }
            } else if (syData === 'ft') {
                master.isFreeTime = true;
                this._sy = this._newSy();
            } else if (syData === 'ro') {
                master.isRepeatStart = true;
                this._sy = this._newSy();
            } else if (syData === 'rc') {
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('repeatclose', AlphaTexSymbols.Number, true);
                }
                if ((this._syData as number) > 2048) {
                    this._error('repeatclose', AlphaTexSymbols.Number, false);
                }
                master.repeatCount = this._syData as number;
                this._sy = this._newSy();
            } else if (syData === 'ae') {
                this._sy = this._newSy();
                if (this._sy === AlphaTexSymbols.LParensis) {
                    this._sy = this._newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('alternateending', AlphaTexSymbols.Number, true);
                    }
                    this._applyAlternateEnding(master);
                    while (this._sy === AlphaTexSymbols.Number) {
                        this._applyAlternateEnding(master);
                    }
                    if (this._sy !== AlphaTexSymbols.RParensis) {
                        this._error('alternateending-list', AlphaTexSymbols.RParensis, true);
                    }
                    this._sy = this._newSy();
                } else {
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this._error('alternateending', AlphaTexSymbols.Number, true);
                    }
                    this._applyAlternateEnding(master);
                }
            } else if (syData === 'ks') {
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('keysignature', AlphaTexSymbols.String, true);
                }
                bar.keySignature = this._parseKeySignature(this._syData as string);
                bar.keySignatureType = this._parseKeySignatureType(this._syData as string);
                this._sy = this._newSy();
            } else if (syData === 'clef') {
                this._sy = this._newSy();
                switch (this._sy) {
                    case AlphaTexSymbols.String:
                        bar.clef = this._parseClefFromString(this._syData as string);
                        break;
                    case AlphaTexSymbols.Number:
                        bar.clef = this._parseClefFromInt(this._syData as number);
                        break;
                    case AlphaTexSymbols.Tuning:
                        const parseResult: TuningParseResult = this._syData as TuningParseResult;
                        bar.clef = this._parseClefFromInt(parseResult.realValue);
                        break;
                    default:
                        this._error('clef', AlphaTexSymbols.String, true);
                        break;
                }
                this._sy = this._newSy();
            } else if (syData === 'tempo') {
                const tempoAutomation = this._readTempoAutomation(true);

                const existing = master.tempoAutomations.find(a => a.ratioPosition === tempoAutomation.ratioPosition);
                if (existing) {
                    existing.value = tempoAutomation.value;
                    existing.text = tempoAutomation.text;
                    existing.isVisible = tempoAutomation.isVisible;
                } else {
                    master.tempoAutomations.push(tempoAutomation);
                }
            } else if (syData === 'section') {
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('section', AlphaTexSymbols.String, true);
                }
                let text: string = this._syData as string;
                this._sy = this._newSy();
                let marker: string = '';
                if (this._sy === AlphaTexSymbols.String && !this._isNoteText((this._syData as string).toLowerCase())) {
                    marker = text;
                    text = this._syData as string;
                    this._sy = this._newSy();
                }
                const section: Section = new Section();
                section.marker = marker;
                section.text = text;
                master.section = section;
            } else if (syData === 'tf') {
                this._lexer.allowTuning = false;
                this._sy = this._newSy();
                this._lexer.allowTuning = true;
                switch (this._sy) {
                    case AlphaTexSymbols.String:
                        master.tripletFeel = this._parseTripletFeelFromString(this._syData as string);
                        break;
                    case AlphaTexSymbols.Number:
                        master.tripletFeel = this._parseTripletFeelFromInt(this._syData as number);
                        break;
                    default:
                        this._error('triplet-feel', AlphaTexSymbols.String, true);
                        break;
                }
                this._sy = this._newSy();
            } else if (syData === 'ac') {
                master.isAnacrusis = true;
                this._sy = this._newSy();
            } else if (syData === 'db') {
                master.isDoubleBar = true;
                bar.barLineRight = BarLineStyle.LightLight;
                this._sy = this._newSy();
            } else if (syData === 'barlineleft') {
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('barlineleft', AlphaTexSymbols.String, true);
                }

                bar.barLineLeft = this._parseBarLineStyle(this._syData as string);
                this._sy = this._newSy();
            } else if (syData === 'barlineright') {
                this._sy = this._newSy();
                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('barlineright', AlphaTexSymbols.String, true);
                }

                bar.barLineRight = this._parseBarLineStyle(this._syData as string);
                this._sy = this._newSy();
            } else if (syData === 'accidentals') {
                this._handleAccidentalMode();
            } else if (syData === 'jump') {
                this._handleDirections(master);
            } else if (syData === 'ottava') {
                this._sy = this._newSy();

                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('ottava', AlphaTexSymbols.String, true);
                }

                bar.clefOttava = this._parseClefOttavaFromString(this._syData as string);
                this._sy = this._newSy();
            } else if (syData === 'simile') {
                this._sy = this._newSy();

                if (this._sy !== AlphaTexSymbols.String) {
                    this._error('simile', AlphaTexSymbols.String, true);
                }

                bar.simileMark = this._parseSimileMarkFromString(this._syData as string);
                this._sy = this._newSy();
            } else if (syData === 'scale') {
                this._sy = this._newSy(true);

                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('scale', AlphaTexSymbols.Number, true);
                }

                master.displayScale = this._syData as number;
                bar.displayScale = this._syData as number;
                this._sy = this._newSy();
            } else if (syData === 'width') {
                this._sy = this._newSy();

                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('width', AlphaTexSymbols.Number, true);
                }

                master.displayWidth = this._syData as number;
                bar.displayWidth = this._syData as number;
                this._sy = this._newSy();
            } else if (syData === 'spd') {
                const sustainPedal = new SustainPedalMarker();
                sustainPedal.pedalType = SustainPedalMarkerType.Down;

                this._sy = this._newSy(true);
                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('spd', AlphaTexSymbols.Number, true);
                }
                sustainPedal.ratioPosition = this._syData as number;
                bar.sustainPedals.push(sustainPedal);
                this._sy = this._newSy();
            } else if (syData === 'spu') {
                const sustainPedal = new SustainPedalMarker();
                sustainPedal.pedalType = SustainPedalMarkerType.Up;

                this._sy = this._newSy(true);
                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('spu', AlphaTexSymbols.Number, true);
                }
                sustainPedal.ratioPosition = this._syData as number;
                bar.sustainPedals.push(sustainPedal);
                this._sy = this._newSy();
            } else if (syData === 'sph') {
                const sustainPedal = new SustainPedalMarker();
                sustainPedal.pedalType = SustainPedalMarkerType.Hold;

                this._sy = this._newSy(true);
                if (this._sy !== AlphaTexSymbols.Number) {
                    this._error('sph', AlphaTexSymbols.Number, true);
                }
                sustainPedal.ratioPosition = this._syData as number;
                bar.sustainPedals.push(sustainPedal);
                this._sy = this._newSy();
            } else {
                if (bar.index === 0) {
                    switch (this._handleStaffMeta()) {
                        case StaffMetaResult.KnownStaffMeta:
                            // ok -> Continue
                            break;
                        case StaffMetaResult.UnknownStaffMeta:
                            this._error('measure-effects', AlphaTexSymbols.String, false);
                            break;
                        case StaffMetaResult.EndOfMetaDetected:
                            endOfMeta = true;
                            break;
                    }
                } else {
                    switch (this._handleStaffMeta()) {
                        case StaffMetaResult.EndOfMetaDetected:
                            endOfMeta = true;
                            break;
                        default:
                            this._error('measure-effects', AlphaTexSymbols.String, false);
                            break;
                    }
                }
            }
        }

        if (master.index === 0 && master.tempoAutomations.length === 0) {
            const tempoAutomation: Automation = new Automation();
            tempoAutomation.isLinear = false;
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = this._score.tempo;
            tempoAutomation.text = this._score.tempoLabel;
            master.tempoAutomations.push(tempoAutomation);
        }
        return anyMeta;
    }

    private _parseBarLineStyle(v: string): BarLineStyle {
        switch (v.toLowerCase()) {
            case 'automatic':
                return BarLineStyle.Automatic;
            case 'dashed':
                return BarLineStyle.Dashed;
            case 'dotted':
                return BarLineStyle.Dotted;
            case 'heavy':
                return BarLineStyle.Heavy;
            case 'heavyheavy':
                return BarLineStyle.HeavyHeavy;
            case 'heavylight':
                return BarLineStyle.HeavyLight;
            case 'lightheavy':
                return BarLineStyle.LightHeavy;
            case 'lightlight':
                return BarLineStyle.LightLight;
            case 'none':
                return BarLineStyle.None;
            case 'regular':
                return BarLineStyle.Regular;
            case 'short':
                return BarLineStyle.Short;
            case 'tick':
                return BarLineStyle.Tick;
        }

        return BarLineStyle.Automatic;
    }

    private _parseSimileMarkFromString(str: string): SimileMark {
        switch (str.toLowerCase()) {
            case 'none':
                return SimileMark.None;
            case 'simple':
                return SimileMark.Simple;
            case 'firstofdouble':
                return SimileMark.FirstOfDouble;
            case 'secondofdouble':
                return SimileMark.SecondOfDouble;
            default:
                return SimileMark.None;
        }
    }

    private _handleDirections(master: MasterBar) {
        this._sy = this._newSy();
        if (this._sy !== AlphaTexSymbols.String) {
            this._error('direction', AlphaTexSymbols.String, true);
        }

        switch ((this._syData as string).toLowerCase()) {
            case 'fine':
                master.addDirection(Direction.TargetFine);
                break;
            case 'segno':
                master.addDirection(Direction.TargetSegno);
                break;
            case 'segnosegno':
                master.addDirection(Direction.TargetSegnoSegno);
                break;
            case 'coda':
                master.addDirection(Direction.TargetCoda);
                break;
            case 'doublecoda':
                master.addDirection(Direction.TargetDoubleCoda);
                break;

            case 'dacapo':
                master.addDirection(Direction.JumpDaCapo);
                break;
            case 'dacapoalcoda':
                master.addDirection(Direction.JumpDaCapoAlCoda);
                break;
            case 'dacapoaldoublecoda':
                master.addDirection(Direction.JumpDaCapoAlDoubleCoda);
                break;
            case 'dacapoalfine':
                master.addDirection(Direction.JumpDaCapoAlFine);
                break;

            case 'dalsegno':
                master.addDirection(Direction.JumpDalSegno);
                break;
            case 'dalsegnoalcoda':
                master.addDirection(Direction.JumpDalSegnoAlCoda);
                break;
            case 'dalsegnoaldoublecoda':
                master.addDirection(Direction.JumpDalSegnoAlDoubleCoda);
                break;
            case 'dalsegnoalfine':
                master.addDirection(Direction.JumpDalSegnoAlFine);
                break;

            case 'dalsegnosegno':
                master.addDirection(Direction.JumpDalSegnoSegno);
                break;
            case 'dalsegnosegnoalcoda':
                master.addDirection(Direction.JumpDalSegnoSegnoAlCoda);
                break;
            case 'dalsegnosegnoaldoublecoda':
                master.addDirection(Direction.JumpDalSegnoSegnoAlDoubleCoda);
                break;
            case 'dalsegnosegnoalfine':
                master.addDirection(Direction.JumpDalSegnoSegnoAlFine);
                break;

            case 'dacoda':
                master.addDirection(Direction.JumpDaCoda);
                break;
            case 'dadoublecoda':
                master.addDirection(Direction.JumpDaDoubleCoda);
                break;
            default:
                this._errorMessage(`Unexpected direction value: '${this._syData}'`);
                return;
        }

        this._sy = this._newSy();
    }

    private _readTempoAutomation(withPosition: boolean) {
        this._sy = this._newSy(true);

        const tempoAutomation: Automation = new Automation();
        tempoAutomation.isLinear = false;
        tempoAutomation.type = AutomationType.Tempo;

        if (this._sy === AlphaTexSymbols.LParensis && withPosition) {
            this._sy = this._newSy(true);
            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('tempo', AlphaTexSymbols.Number, true);
            }

            tempoAutomation.value = this._syData as number;
            this._sy = this._newSy(true);

            if (this._sy === AlphaTexSymbols.String) {
                tempoAutomation.text = this._syData as string;
                this._sy = this._newSy(true);
            }

            if (this._sy !== AlphaTexSymbols.Number) {
                this._error('tempo', AlphaTexSymbols.Number, true);
            }
            tempoAutomation.ratioPosition = this._syData as number;
            this._sy = this._newSy();

            if (this._sy === AlphaTexSymbols.String && (this._syData as string) === 'hide') {
                tempoAutomation.isVisible = false;
                this._sy = this._newSy();
            }

            if (this._sy !== AlphaTexSymbols.RParensis) {
                this._error('tempo', AlphaTexSymbols.RParensis, true);
            }
            this._sy = this._newSy();
        } else if (this._sy === AlphaTexSymbols.Number) {
            tempoAutomation.value = this._syData as number;

            this._sy = this._newSy();

            if (this._sy === AlphaTexSymbols.String && (this._syData as string) !== 'r') {
                tempoAutomation.text = this._syData as string;
                this._sy = this._newSy();
            }
        } else {
            this._error('tempo', AlphaTexSymbols.Number, true);
        }

        return tempoAutomation;
    }

    private _applyAlternateEnding(master: MasterBar): void {
        const num = this._syData as number;
        if (num < 1) {
            // Repeat numberings start from 1
            this._error('alternateending', AlphaTexSymbols.Number, true);
        }
        // Alternate endings bitflag starts from 0
        master.alternateEndings |= 1 << (num - 1);
        this._sy = this._newSy();
    }

    private _parseWhammyType(str: string): WhammyType {
        switch (str.toLowerCase()) {
            case 'none':
                return WhammyType.None;
            case 'custom':
                return WhammyType.Custom;
            case 'dive':
                return WhammyType.Dive;
            case 'dip':
                return WhammyType.Dip;
            case 'hold':
                return WhammyType.Hold;
            case 'predive':
                return WhammyType.Predive;
            case 'predivedive':
                return WhammyType.PrediveDive;
            default:
                return WhammyType.Custom;
        }
    }
}
