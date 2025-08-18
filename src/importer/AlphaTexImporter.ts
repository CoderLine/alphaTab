import { GeneralMidi } from '@src/midi/GeneralMidi';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType, type FlatSyncPoint } from '@src/model/Automation';
import { Bar, BarLineStyle, SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model/KeySignature';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { PickStroke } from '@src/model/PickStroke';
import { Score, ScoreSubElement } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { Logger } from '@src/Logger';
import { ModelUtils, type TuningParseResult } from '@src/model/ModelUtils';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { BeatCloner } from '@src/generated/model/BeatCloner';
import { IOHelper } from '@src/io/IOHelper';
import type { Settings } from '@src/Settings';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { GolpeType } from '@src/model/GolpeType';
import { FadeType } from '@src/model/FadeType';
import { WahPedal } from '@src/model/WahPedal';
import { BarreShape } from '@src/model/BarreShape';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Rasgueado } from '@src/model/Rasgueado';
import { SynthConstants } from '@src/synth/SynthConstants';
import { Direction } from '@src/model/Direction';
import { Fermata, FermataType } from '@src/model/Fermata';
import { Ottavia } from '@src/model/Ottavia';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { BendType } from '@src/model/BendType';
import { SimileMark } from '@src/model/SimileMark';
import { WhammyType } from '@src/model/WhammyType';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { Color } from '@src/model/Color';
import { BendStyle } from '@src/model/BendStyle';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { TextAlign } from '@src/platform/ICanvas';

/**
 * A list of terminals recognized by the alphaTex-parser
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

enum StaffMetaResult {
    KnownStaffMeta = 0,
    UnknownStaffMeta = 1,
    EndOfMetaDetected = 2
}

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
        Object.setPrototypeOf(this, AlphaTexError.prototype);
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

enum AlphaTexAccidentalMode {
    Auto = 0,
    Explicit = 1
}

export class AlphaTexLexer {
    private static readonly Eof: number = 0;

    private _position: number = 0;
    private _line: number = 1;
    private _col: number = 0;

    private _codepoints: number[];
    private _codepoint: number = AlphaTexLexer.Eof;

    public sy: AlphaTexSymbols = AlphaTexSymbols.No;
    public syData: unknown = '';

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
        this.saveValidSpot();

        this._codepoint = this.nextCodepoint();
        this.sy = this.newSy(allowFloats);
    }

    /**
     * Saves the current position, line, and column.
     * All parsed data until this point is assumed to be valid.
     */
    private saveValidSpot(): void {
        this.lastValidSpot = [this._position, this._line, this._col];
    }

    /**
     * Reads, saves, and returns the next character of the source stream.
     */
    private nextCodepoint(): number {
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
            this._codepoint = AlphaTexLexer.Eof;
        }
        return this._codepoint;
    }

    /**
     * Reads, saves, and returns the next terminal symbol.
     */
    public newSy(allowFloats: boolean = false): AlphaTexSymbols {
        // When a new symbol is read, the previous one is assumed to be valid.
        // The valid spot is also moved forward when reading past whitespace or comments.
        this.saveValidSpot();
        this.sy = AlphaTexSymbols.No;
        while (this.sy === AlphaTexSymbols.No) {
            this.syData = null;

            if (this._codepoint === AlphaTexLexer.Eof) {
                this.sy = AlphaTexSymbols.Eof;
            } else if (AlphaTexLexer.isWhiteSpace(this._codepoint)) {
                // skip whitespaces
                this._codepoint = this.nextCodepoint();
                this.saveValidSpot();
            } else if (this._codepoint === 0x2f /* / */) {
                this._codepoint = this.nextCodepoint();
                if (this._codepoint === 0x2f /* / */) {
                    // single line comment
                    while (
                        this._codepoint !== 0x0d /* \r */ &&
                        this._codepoint !== 0x0a /* \n */ &&
                        this._codepoint !== AlphaTexLexer.Eof
                    ) {
                        this._codepoint = this.nextCodepoint();
                    }
                } else if (this._codepoint === 0x2a /* * */) {
                    // multiline comment
                    while (this._codepoint !== AlphaTexLexer.Eof) {
                        if (this._codepoint === 0x2a /* * */) {
                            this._codepoint = this.nextCodepoint();
                            if (this._codepoint === 0x2f /* / */) {
                                this._codepoint = this.nextCodepoint();
                                break;
                            }
                        } else {
                            this._codepoint = this.nextCodepoint();
                        }
                    }
                } else {
                    this.errorMessage(`Unexpected character ${String.fromCodePoint(this._codepoint)}`);
                }
                this.saveValidSpot();
            } else if (this._codepoint === 0x22 /* " */ || this._codepoint === 0x27 /* ' */) {
                const startChar: number = this._codepoint;
                this._codepoint = this.nextCodepoint();
                let s: string = '';
                this.sy = AlphaTexSymbols.String;

                let previousCodepoint: number = -1;

                while (this._codepoint !== startChar && this._codepoint !== AlphaTexLexer.Eof) {
                    // escape sequences
                    let codepoint = -1;

                    if (this._codepoint === 0x5c /* \ */) {
                        this._codepoint = this.nextCodepoint();
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
                                this._codepoint = this.nextCodepoint();
                                if (this._codepoint === AlphaTexLexer.Eof) {
                                    this.errorMessage('Unexpected end of escape sequence');
                                }
                                hex += String.fromCodePoint(this._codepoint);
                            }

                            codepoint = Number.parseInt(hex, 16);
                            if (Number.isNaN(codepoint)) {
                                this.errorMessage(`Invalid unicode value ${hex}`);
                            }
                        } else {
                            this.errorMessage('Unsupported escape sequence');
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
                    this._codepoint = this.nextCodepoint();
                }
                if (this._codepoint === AlphaTexLexer.Eof) {
                    this.errorMessage('String opened but never closed');
                }
                this.syData = s;
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x2d /* - */) {
                this.readNumberOrName(allowFloats);
            } else if (this._codepoint === 0x2e /* . */) {
                this.sy = AlphaTexSymbols.Dot;
                this.syData = '.';
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x3a /* : */) {
                this.sy = AlphaTexSymbols.DoubleDot;
                this.syData = ':';
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x28 /* ( */) {
                this.sy = AlphaTexSymbols.LParensis;
                this._codepoint = this.nextCodepoint();
                this.syData = '(';
            } else if (this._codepoint === 0x5c /* \ */) {
                this._codepoint = this.nextCodepoint();
                this.sy = AlphaTexSymbols.MetaCommand;
                // allow double backslash (easier to test when copying from escaped Strings)
                if (this._codepoint === 0x5c /* \ */) {
                    this._codepoint = this.nextCodepoint();
                }

                this.syData = this.readName();
            } else if (this._codepoint === 0x29 /* ) */) {
                this.sy = AlphaTexSymbols.RParensis;
                this.syData = ')';
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x7b /* { */) {
                this.sy = AlphaTexSymbols.LBrace;
                this.syData = '{';
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x7d /* } */) {
                this.sy = AlphaTexSymbols.RBrace;
                this.syData = '}';
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x7c /* | */) {
                this.sy = AlphaTexSymbols.Pipe;
                this.syData = '|';
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x2a /* * */) {
                this.sy = AlphaTexSymbols.Multiply;
                this.syData = '*';
                this._codepoint = this.nextCodepoint();
            } else if (this._codepoint === 0x3c /* < */) {
                this.sy = AlphaTexSymbols.LowerThan;
                this.syData = '<';
                this._codepoint = this.nextCodepoint();
            } else if (AlphaTexLexer.isDigit(this._codepoint)) {
                this.readNumberOrName(allowFloats);
            } else if (AlphaTexLexer.isNameLetter(this._codepoint)) {
                const name: string = this.readName();
                const tuning: TuningParseResult | null = this.allowTuning ? ModelUtils.parseTuning(name) : null;
                if (tuning) {
                    this.sy = AlphaTexSymbols.Tuning;
                    this.syData = tuning;
                } else {
                    this.sy = AlphaTexSymbols.String;
                    this.syData = name;
                }
            } else {
                this.errorMessage(`Unexpected character ${String.fromCodePoint(this._codepoint)}`);
            }
        }
        return this.sy;
    }

    private errorMessage(message: string): void {
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

    private readNumberOrName(allowFloat: boolean) {
        let str: string = '';

        // assume number at start
        this.sy = AlphaTexSymbols.Number;

        // negative start or dash
        if (this._codepoint === 0x2d) {
            str += String.fromCodePoint(this._codepoint);
            this._codepoint = this.nextCodepoint();

            // need a number afterwards otherwise we have a string(-)
            if (!AlphaTexLexer.isDigit(this._codepoint)) {
                this.sy = AlphaTexSymbols.String;
            }
        }

        let keepReading = true;

        let hasDot = false;
        do {
            switch (this.sy) {
                case AlphaTexSymbols.Number:
                    // adding digits to the number
                    if (AlphaTexLexer.isDigit(this._codepoint)) {
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this.nextCodepoint();
                        keepReading = true;
                    }
                    // adding a dot to the number (expecting digit after dot)
                    else if (
                        allowFloat &&
                        !hasDot &&
                        this._codepoint === 0x2e /* . */ &&
                        AlphaTexLexer.isDigit(this._codepoints[this._position])
                    ) {
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this.nextCodepoint();
                        keepReading = true;
                        hasDot = true;
                    }
                    // letter in number -> fallback to name reading
                    else if (AlphaTexLexer.isNameLetter(this._codepoint)) {
                        this.sy = AlphaTexSymbols.String;
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this.nextCodepoint();
                        keepReading = true;
                    }
                    // general unknown character -> end reading
                    else {
                        keepReading = false;
                    }
                    break;
                case AlphaTexSymbols.String:
                    if (AlphaTexLexer.isNameLetter(this._codepoint)) {
                        str += String.fromCodePoint(this._codepoint);
                        this._codepoint = this.nextCodepoint();
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
            this.errorMessage('number was empty');
        }

        if (this.sy === AlphaTexSymbols.String) {
            this.syData = str;
        } else {
            this.syData = allowFloat ? Number.parseFloat(str) : Number.parseInt(str);
        }
        return;
    }

    /**
     * Reads a string from the stream.
     * @returns the read string.
     */
    private readName(): string {
        let str: string = '';
        do {
            str += String.fromCodePoint(this._codepoint);
            this._codepoint = this.nextCodepoint();
        } while (
            AlphaTexLexer.isNameLetter(this._codepoint) ||
            AlphaTexLexer.isDigit(this._codepoint) ||
            this._codepoint === 0x2d /*-*/
        );
        return str;
    }

    /**
     * Checks if the given character is a valid letter for a name.
     * (no control characters, whitespaces, numbers or dots)
     */
    private static isNameLetter(ch: number): boolean {
        return (
            !AlphaTexLexer.isTerminal(ch) && // no control characters, whitespaces, numbers or dots
            ((0x21 <= ch && ch <= 0x2f) || (0x3a <= ch && ch <= 0x7e) || 0x80 <= ch) // Unicode Symbols
        );
    }

    private static isTerminal(ch: number): boolean {
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

    private static isWhiteSpace(ch: number): boolean {
        return (
            ch === 0x09 /* \t */ ||
            ch === 0x0a /* \n */ ||
            ch === 0x0b /* \v */ ||
            ch === 0x0d /* \r */ ||
            ch === 0x20 /* space */
        );
    }

    private static isDigit(ch: number): boolean {
        return ch >= 0x30 && ch <= 0x39 /* 0-9 */;
    }
}

/**
 * This importer can parse alphaTex markup into a score structure.
 */
export class AlphaTexImporter extends ScoreImporter {
    private _trackChannel: number = 0;
    private _score!: Score;
    private _currentTrack!: Track;

    private _currentStaff!: Staff;
    private _barIndex: number = 0;
    private _voiceIndex: number = 0;

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

    private _lexer!: AlphaTexLexer;

    private _accidentalMode: AlphaTexAccidentalMode = AlphaTexAccidentalMode.Explicit;
    private _syncPoints: FlatSyncPoint[] = [];

    public logErrors: boolean = true;

    public get name(): string {
        return 'AlphaTex';
    }

    public initFromString(tex: string, settings: Settings) {
        this.data = ByteBuffer.empty();
        this._lexer = new AlphaTexLexer(tex);
        this.settings = settings;
        // when beginning reading a new score we reset the IDs.
        Score.resetIds();
    }

    private get sy() {
        return this._lexer.sy;
    }

    private get syData() {
        return this._lexer.syData;
    }

    private set sy(value: AlphaTexSymbols) {
        this._lexer.sy = value;
    }

    private newSy(allowFloat: boolean = false) {
        return this._lexer.newSy(allowFloat);
    }

    public readScore(): Score {
        try {
            if (this.data.length > 0) {
                this._lexer = new AlphaTexLexer(
                    IOHelper.toString(this.data.readAll(), this.settings.importer.encoding)
                );
            }
            this._lexer.logErrors = this.logErrors;

            this._lexer.allowTuning = true;
            this._lyrics = new Map<number, Lyrics[]>();
            this._sustainPedalToBeat = new Map<SustainPedalMarker, Beat>();

            this._lexer.init();

            this.createDefaultScore();
            this._currentDuration = Duration.Quarter;
            this._currentDynamics = DynamicValue.F;
            this._currentTuplet = 1;
            if (this.sy === AlphaTexSymbols.LowerThan) {
                // potential XML, stop parsing (alphaTex never starts with <)
                throw new UnsupportedFormatError("Unknown start sign '<' (meant to import as XML?)");
            }

            if (this.sy !== AlphaTexSymbols.Eof) {
                const anyMetaRead = this.metaData();
                const anyBarsRead = this.bars();
                if (!anyMetaRead && !anyBarsRead) {
                    throw new UnsupportedFormatError('No alphaTex data found');
                }

                if (this.sy === AlphaTexSymbols.Dot) {
                    this.sy = this.newSy();
                    this.syncPoints();
                }
            }

            ModelUtils.consolidate(this._score);
            this._score.finish(this.settings);
            ModelUtils.trimEmptyBarsAtEnd(this._score);
            this._score.rebuildRepeatGroups();
            this._score.applyFlatSyncPoints(this._syncPoints);
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

    private syncPoints() {
        while (this.sy !== AlphaTexSymbols.Eof) {
            this.syncPoint();
        }
    }

    private syncPoint() {
        // \sync BarIndex Occurence MillisecondOffset
        // \sync BarIndex Occurence MillisecondOffset RatioPosition

        if (this.sy !== AlphaTexSymbols.MetaCommand || (this.syData as string) !== 'sync') {
            this.error('syncPoint', AlphaTexSymbols.MetaCommand, true);
        }

        this.sy = this.newSy();
        if (this.sy !== AlphaTexSymbols.Number) {
            this.error('syncPointBarIndex', AlphaTexSymbols.Number, true);
        }
        const barIndex = this.syData as number;

        this.sy = this.newSy();
        if (this.sy !== AlphaTexSymbols.Number) {
            this.error('syncPointBarOccurence', AlphaTexSymbols.Number, true);
        }
        const barOccurence = this.syData as number;

        this.sy = this.newSy();
        if (this.sy !== AlphaTexSymbols.Number) {
            this.error('syncPointBarMillis', AlphaTexSymbols.Number, true);
        }
        const millisecondOffset = this.syData as number;

        this.sy = this.newSy(true);
        let barPosition = 0;
        if (this.sy === AlphaTexSymbols.Number) {
            barPosition = this.syData as number;
            this.sy = this.newSy();
        }

        this._syncPoints.push({
            barIndex,
            barOccurence,
            barPosition,
            millisecondOffset
        });
    }

    private error(nonterm: string, expected: AlphaTexSymbols, wrongSymbol: boolean = true): void {
        let receivedSymbol: AlphaTexSymbols;
        let showSyData = false;
        if (wrongSymbol) {
            receivedSymbol = this.sy;
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
            showSyData ? this.syData : null
        );
        if (this.logErrors) {
            Logger.error(this.name, e.message!);
        }
        throw e;
    }

    private errorMessage(message: string): void {
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
    private createDefaultScore(): void {
        this._score = new Score();
        this._score.tempo = 120;
        this._score.tempoLabel = '';
        this.newTrack();
    }

    private newTrack(): void {
        this._currentTrack = new Track();
        this._currentTrack.ensureStaveCount(1);
        this._currentTrack.playbackInfo.program = 25;
        this._currentTrack.playbackInfo.primaryChannel = this._trackChannel++;
        this._currentTrack.playbackInfo.secondaryChannel = this._trackChannel++;
        const staff = this._currentTrack.staves[0];
        staff.displayTranspositionPitch = 0;
        staff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
        this._articulationValueToIndex.clear();

        this.beginStaff(staff);

        this._score.addTrack(this._currentTrack);
        this._lyrics.set(this._currentTrack.index, []);
        this._currentDynamics = DynamicValue.F;
    }

    /**
     * Converts a clef string into the clef value.
     * @param str the string to convert
     * @returns the clef value
     */
    private parseClefFromString(str: string): Clef {
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
    private parseClefFromInt(i: number): Clef {
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

    private parseTripletFeelFromString(str: string): TripletFeel {
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

    private parseTripletFeelFromInt(i: number): TripletFeel {
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
    private parseKeySignature(str: string): KeySignature {
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

    private parseKeySignatureType(str: string): KeySignatureType {
        if (str.toLowerCase().endsWith('minor')) {
            return KeySignatureType.Minor;
        }
        return KeySignatureType.Major;
    }

    private metaData(): boolean {
        let anyTopLevelMeta = false;
        let anyOtherMeta = false;
        let continueReading: boolean = true;
        while (this.sy === AlphaTexSymbols.MetaCommand && continueReading) {
            const metadataTag: string = (this.syData as string).toLowerCase();
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
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        // Known issue: Strings that happen to be parsed as valid Tunings or positive Numbers will not pass this.
                        // Need to use quotes in that case, or rewrite parsing logic.
                        this.error(metadataTag, AlphaTexSymbols.String, true);
                    }

                    const metadataValue: string = this.syData as string;
                    this.sy = this.newSy();
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
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error(metadataTag, AlphaTexSymbols.String, true);
                    }

                    this.headerFooterStyle(ScoreSubElement.CopyrightSecondLine);
                    anyTopLevelMeta = true;
                    break;
                case 'wordsandmusic':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error(metadataTag, AlphaTexSymbols.String, true);
                    }

                    this.headerFooterStyle(ScoreSubElement.WordsAndMusic);
                    anyTopLevelMeta = true;
                    break;
                case 'tempo':
                    this.sy = this.newSy(true);
                    if (this.sy === AlphaTexSymbols.Number) {
                        this._score.tempo = this.syData as number;
                    } else {
                        this.error('tempo', AlphaTexSymbols.Number, true);
                    }
                    this.sy = this.newSy();
                    if (this.sy === AlphaTexSymbols.String) {
                        this._score.tempoLabel = this.syData as string;
                        this.sy = this.newSy();
                    }
                    anyTopLevelMeta = true;
                    break;
                case 'defaultsystemslayout':
                    this.sy = this.newSy();
                    if (this.sy === AlphaTexSymbols.Number) {
                        this._score.defaultSystemsLayout = this.syData as number;
                        this.sy = this.newSy();
                        anyTopLevelMeta = true;
                    } else {
                        this.error('default-systems-layout', AlphaTexSymbols.Number, true);
                    }
                    break;
                case 'systemslayout':
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    while (this.sy === AlphaTexSymbols.Number) {
                        this._score.systemsLayout.push(this.syData as number);
                        this.sy = this.newSy();
                    }
                    break;
                case 'hidedynamics':
                    this._score.stylesheet.hideDynamics = true;
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'showdynamics':
                    this._score.stylesheet.hideDynamics = false;
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'bracketextendmode':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('bracketExtendMode', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.bracketExtendMode = this.parseBracketExtendMode(this.syData as string);
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'usesystemsignseparator':
                    this._score.stylesheet.useSystemSignSeparator = true;
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'multibarrest':
                    this._score.stylesheet.multiTrackMultiBarRest = true;
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'singletracktracknamepolicy':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('singleTrackTrackNamePolicy', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.singleTrackTrackNamePolicy = this.parseTrackNamePolicy(
                        this.syData as string
                    );
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'multitracktracknamepolicy':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('multiTrackTrackNamePolicy', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.multiTrackTrackNamePolicy = this.parseTrackNamePolicy(this.syData as string);
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'firstsystemtracknamemode':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('firstSystemTrackNameMode', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.firstSystemTrackNameMode = this.parseTrackNameMode(this.syData as string);
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'othersystemstracknamemode':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('otherSystemsTrackNameMode', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.otherSystemsTrackNameMode = this.parseTrackNameMode(this.syData as string);
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'firstsystemtracknameorientation':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('firstSystemTrackNameOrientation', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.firstSystemTrackNameOrientation = this.parseTrackNameOrientation(
                        this.syData as string
                    );
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                case 'othersystemstracknameorientation':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('otherSystemsTrackNameOrientation', AlphaTexSymbols.String, true);
                    }
                    this._score.stylesheet.otherSystemsTrackNameOrientation = this.parseTrackNameOrientation(
                        this.syData as string
                    );
                    this.sy = this.newSy();
                    anyTopLevelMeta = true;
                    break;
                default:
                    switch (this.handleStaffMeta()) {
                        case StaffMetaResult.KnownStaffMeta:
                            anyOtherMeta = true;
                            break;
                        case StaffMetaResult.UnknownStaffMeta:
                            if (anyTopLevelMeta || anyOtherMeta) {
                                // invalid meta encountered
                                this.error('metaDataTags', AlphaTexSymbols.String, false);
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
            if (this.sy !== AlphaTexSymbols.Dot) {
                this.error('song', AlphaTexSymbols.Dot, true);
            }
            this.sy = this.newSy();
        } else if (this.sy === AlphaTexSymbols.Dot) {
            this.sy = this.newSy();
            anyTopLevelMeta = true; // just to indicate that there is an indication of proper alphaTex
        }

        return anyTopLevelMeta || anyOtherMeta;
    }
    headerFooterStyle(element: ScoreSubElement) {
        const style = ModelUtils.getOrCreateHeaderFooterStyle(this._score, element);
        if (style.isVisible === undefined) {
            style.isVisible = true;
        }

        if (this.sy === AlphaTexSymbols.String) {
            const value = this.syData as string;
            if (value) {
                style.template = value;
            } else {
                style.isVisible = false;
            }
            this.sy = this.newSy();
        }

        if (this.sy === AlphaTexSymbols.String) {
            switch ((this.syData as string).toLowerCase()) {
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
            this.sy = this.newSy();
        }
    }

    private parseTrackNamePolicy(v: string): TrackNamePolicy {
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

    private parseTrackNameMode(v: string): TrackNameMode {
        switch (v.toLowerCase()) {
            case 'fullname':
                return TrackNameMode.FullName;
            // case 'shortname':
            default:
                return TrackNameMode.ShortName;
        }
    }

    private parseTrackNameOrientation(v: string): TrackNameOrientation {
        switch (v.toLowerCase()) {
            case 'horizontal':
                return TrackNameOrientation.Horizontal;
            //case 'vertical':
            default:
                return TrackNameOrientation.Vertical;
        }
    }

    private handleStaffMeta(): StaffMetaResult {
        switch ((this.syData as string).toLowerCase()) {
            case 'capo':
                this.sy = this.newSy();
                if (this.sy === AlphaTexSymbols.Number) {
                    this._currentStaff.capo = this.syData as number;
                } else {
                    this.error('capo', AlphaTexSymbols.Number, true);
                }
                this.sy = this.newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'tuning':
                this.sy = this.newSy();
                const strings: number = this._currentStaff.tuning.length;
                this._staffHasExplicitTuning = true;
                this._staffTuningApplied = false;
                switch (this.sy) {
                    case AlphaTexSymbols.String:
                        const text: string = (this.syData as string).toLowerCase();
                        if (text === 'piano' || text === 'none' || text === 'voice') {
                            this.makeCurrentStaffPitched();
                        } else {
                            this.error('tuning', AlphaTexSymbols.Tuning, true);
                        }
                        this.sy = this.newSy();
                        break;
                    case AlphaTexSymbols.Tuning:
                        const tuning: number[] = [];
                        do {
                            const t: TuningParseResult = this.syData as TuningParseResult;
                            tuning.push(t.realValue);
                            this.sy = this.newSy();
                        } while (this.sy === AlphaTexSymbols.Tuning);
                        this._currentStaff.stringTuning.tunings = tuning;
                        break;
                    default:
                        this.error('tuning', AlphaTexSymbols.Tuning, true);
                        break;
                }

                if (this.sy === AlphaTexSymbols.String) {
                    if ((this.syData as string).toLowerCase() === 'hide') {
                        if (!this._score.stylesheet.perTrackDisplayTuning) {
                            this._score.stylesheet.perTrackDisplayTuning = new Map<number, boolean>();
                        }
                        this._score.stylesheet.perTrackDisplayTuning!.set(this._currentTrack.index, false);
                        this.sy = this.newSy();

                        if (this.sy === AlphaTexSymbols.String) {
                            this._currentStaff.stringTuning.name = this.syData as string;
                            this.sy = this.newSy();
                        }
                    } else {
                        this._currentStaff.stringTuning.name = this.syData as string;
                        this.sy = this.newSy();
                    }
                }

                if (strings !== this._currentStaff.tuning.length && (this._currentStaff.chords?.size ?? 0) > 0) {
                    this.errorMessage('Tuning must be defined before any chord');
                }
                return StaffMetaResult.KnownStaffMeta;
            case 'instrument':
                this.sy = this.newSy();
                this._staffTuningApplied = false;
                if (this.sy === AlphaTexSymbols.Number) {
                    const instrument: number = this.syData as number;
                    if (instrument >= 0 && instrument <= 127) {
                        this._currentTrack.playbackInfo.program = this.syData as number;
                    } else {
                        this.error('instrument', AlphaTexSymbols.Number, false);
                    }
                } else if (this.sy === AlphaTexSymbols.String) {
                    const instrumentName: string = (this.syData as string).toLowerCase();
                    if (instrumentName === 'percussion') {
                        for (const staff of this._currentTrack.staves) {
                            this.applyPercussionStaff(staff);
                        }
                        this._currentTrack.playbackInfo.primaryChannel = SynthConstants.PercussionChannel;
                        this._currentTrack.playbackInfo.secondaryChannel = SynthConstants.PercussionChannel;
                    } else {
                        this._currentTrack.playbackInfo.program = GeneralMidi.getValue(instrumentName);
                    }
                } else {
                    this.error('instrument', AlphaTexSymbols.Number, true);
                }
                this.sy = this.newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'lyrics':
                this.sy = this.newSy();
                const lyrics: Lyrics = new Lyrics();
                lyrics.startBar = 0;
                lyrics.text = '';
                if (this.sy === AlphaTexSymbols.Number) {
                    lyrics.startBar = this.syData as number;
                    this.sy = this.newSy();
                }
                if (this.sy === AlphaTexSymbols.String) {
                    lyrics.text = this.syData as string;
                    this.sy = this.newSy();
                } else {
                    this.error('lyrics', AlphaTexSymbols.String, true);
                }
                this._lyrics.get(this._currentTrack.index)!.push(lyrics);
                return StaffMetaResult.KnownStaffMeta;
            case 'chord':
                this.sy = this.newSy();
                const chord: Chord = new Chord();
                this.chordProperties(chord);
                if (this.sy === AlphaTexSymbols.String) {
                    chord.name = this.syData as string;
                    this.sy = this.newSy();
                } else {
                    this.error('chord-name', AlphaTexSymbols.String, true);
                }
                for (let i: number = 0; i < this._currentStaff.tuning.length; i++) {
                    if (this.sy === AlphaTexSymbols.Number) {
                        chord.strings.push(this.syData as number);
                    } else if (this.sy === AlphaTexSymbols.String && (this.syData as string).toLowerCase() === 'x') {
                        chord.strings.push(-1);
                    }
                    this.sy = this.newSy();
                }
                this._currentStaff.addChord(this.getChordId(this._currentStaff, chord.name), chord);
                return StaffMetaResult.KnownStaffMeta;
            case 'articulation':
                this.sy = this.newSy();

                let name = '';
                if (this.sy === AlphaTexSymbols.String) {
                    name = this.syData as string;
                    this.sy = this.newSy();
                } else {
                    this.error('articulation-name', AlphaTexSymbols.String, true);
                }

                if (name === 'defaults') {
                    for (const [defaultName, defaultValue] of PercussionMapper.instrumentArticulationNames) {
                        this._percussionArticulationNames.set(defaultName.toLowerCase(), defaultValue);
                        this._percussionArticulationNames.set(
                            AlphaTexImporter.toArticulationId(defaultName),
                            defaultValue
                        );
                    }
                    return StaffMetaResult.KnownStaffMeta;
                }

                let number = 0;
                if (this.sy === AlphaTexSymbols.Number) {
                    number = this.syData as number;
                    this.sy = this.newSy();
                } else {
                    this.error('articulation-number', AlphaTexSymbols.Number, true);
                }

                if (!PercussionMapper.instrumentArticulations.has(number)) {
                    this.errorMessage(
                        `Unknown articulation ${number}. Refer to https://www.alphatab.net/docs/alphatex/percussion for available ids`
                    );
                }

                this._percussionArticulationNames.set(name.toLowerCase(), number);
                return StaffMetaResult.KnownStaffMeta;
            case 'accidentals':
                this.handleAccidentalMode();
                return StaffMetaResult.KnownStaffMeta;
            case 'displaytranspose':
                this.sy = this.newSy();
                if (this.sy === AlphaTexSymbols.Number) {
                    this._currentStaff.displayTranspositionPitch = (this.syData as number) * -1;
                    this._staffHasExplicitDisplayTransposition = true;
                } else {
                    this.error('displaytranspose', AlphaTexSymbols.Number, true);
                }
                this.sy = this.newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'transpose':
                this.sy = this.newSy();
                if (this.sy === AlphaTexSymbols.Number) {
                    this._currentStaff.transpositionPitch = (this.syData as number) * -1;
                } else {
                    this.error('transpose', AlphaTexSymbols.Number, true);
                }
                this.sy = this.newSy();
                return StaffMetaResult.KnownStaffMeta;
            case 'track':
            case 'staff':
                // on empty staves we need to proceeed when starting directly a new track or staff
                return StaffMetaResult.EndOfMetaDetected;
            case 'voice':
                this.sy = this.newSy();
                if (this.handleNewVoice()) {
                    return StaffMetaResult.EndOfMetaDetected;
                }
                return StaffMetaResult.KnownStaffMeta;
            default:
                return StaffMetaResult.UnknownStaffMeta;
        }
    }

    private handleAccidentalMode() {
        this.sy = this.newSy();
        if (this.sy !== AlphaTexSymbols.String) {
            this.error('accidental-mode', AlphaTexSymbols.String, true);
        }

        switch (this.syData as string) {
            case 'auto':
                this._accidentalMode = AlphaTexAccidentalMode.Auto;
                break;
            case 'explicit':
                this._accidentalMode = AlphaTexAccidentalMode.Explicit;
                break;
        }

        this.sy = this.newSy();
    }

    private makeCurrentStaffPitched() {
        // clear tuning
        this._currentStaff.stringTuning.tunings = [];
        if (!this._staffHasExplicitDisplayTransposition) {
            this._currentStaff.displayTranspositionPitch = 0;
        }
    }

    /**
     * Encodes a given string to a shorthand text form without spaces or special characters
     */
    private static toArticulationId(plain: string): string {
        return plain.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    private applyPercussionStaff(staff: Staff) {
        staff.isPercussion = true;
        staff.showTablature = false;
        staff.track.playbackInfo.program = 0;
    }

    private chordProperties(chord: Chord): void {
        if (this.sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this.sy = this.newSy();
        while (this.sy === AlphaTexSymbols.String) {
            switch ((this.syData as string).toLowerCase()) {
                case 'firstfret':
                    this.sy = this.newSy();
                    switch (this.sy) {
                        case AlphaTexSymbols.Number:
                            chord.firstFret = this.syData as number;
                            break;
                        default:
                            this.error('chord-firstfret', AlphaTexSymbols.Number, true);
                            break;
                    }
                    this.sy = this.newSy();
                    break;
                case 'showdiagram':
                    this.sy = this.newSy();
                    switch (this.sy) {
                        case AlphaTexSymbols.String:
                            chord.showDiagram = (this.syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showDiagram = (this.syData as number) !== 0;
                            break;
                        default:
                            this.error('chord-showdiagram', AlphaTexSymbols.String, true);
                            break;
                    }
                    this.sy = this.newSy();
                    break;
                case 'showfingering':
                    this.sy = this.newSy();
                    switch (this.sy) {
                        case AlphaTexSymbols.String:
                            chord.showDiagram = (this.syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showFingering = (this.syData as number) !== 0;
                            break;
                        default:
                            this.error('chord-showfingering', AlphaTexSymbols.String, true);
                            break;
                    }
                    this.sy = this.newSy();
                    break;
                case 'showname':
                    this.sy = this.newSy();
                    switch (this.sy) {
                        case AlphaTexSymbols.String:
                            chord.showName = (this.syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showName = (this.syData as number) !== 0;
                            break;
                        default:
                            this.error('chord-showname', AlphaTexSymbols.String, true);
                            break;
                    }
                    this.sy = this.newSy();
                    break;
                case 'barre':
                    this.sy = this.newSy();
                    while (this.sy === AlphaTexSymbols.Number) {
                        chord.barreFrets.push(this.syData as number);
                        this.sy = this.newSy();
                    }
                    break;
                default:
                    this.error('chord-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this.sy !== AlphaTexSymbols.RBrace) {
            this.error('chord-properties', AlphaTexSymbols.RBrace, true);
        }
        this.sy = this.newSy();
    }

    private bars(): boolean {
        const anyData = this.bar();
        while (this.sy !== AlphaTexSymbols.Eof) {
            // read pipe from last bar
            if (this.sy === AlphaTexSymbols.Pipe) {
                this.sy = this.newSy();
                this.bar();
            } else if (this.sy === AlphaTexSymbols.MetaCommand) {
                this.bar();
            } else {
                break;
            }
        }
        return anyData;
    }

    private trackStaffMeta(): boolean {
        if (this.sy !== AlphaTexSymbols.MetaCommand) {
            return false;
        }
        if ((this.syData as string).toLowerCase() === 'track') {
            this._staffHasExplicitDisplayTransposition = false;
            this._staffHasExplicitTuning = false;
            this._staffTuningApplied = false;
            this._staffDisplayTranspositionApplied = false;
            this._ignoredInitialVoice = false;

            this.sy = this.newSy();
            // new track starting? - if no masterbars it's the \track of the initial track.
            if (this._score.masterBars.length > 0) {
                this.newTrack();
            }
            // name
            if (this.sy === AlphaTexSymbols.String) {
                this._currentTrack.name = this.syData as string;
                this.sy = this.newSy();
            }
            // short name
            if (this.sy === AlphaTexSymbols.String) {
                this._currentTrack.shortName = this.syData as string;
                this.sy = this.newSy();
            }

            this.trackProperties();
        }
        if (this.sy === AlphaTexSymbols.MetaCommand && (this.syData as string).toLowerCase() === 'staff') {
            this._staffHasExplicitDisplayTransposition = false;
            this._staffHasExplicitTuning = false;
            this._staffTuningApplied = false;
            this._staffDisplayTranspositionApplied = false;
            this._ignoredInitialVoice = false;

            this.sy = this.newSy();
            if (this._currentTrack.staves[0].bars.length > 0) {
                const previousWasPercussion = this._currentStaff.isPercussion;

                this._currentTrack.ensureStaveCount(this._currentTrack.staves.length + 1);
                this.beginStaff(this._currentTrack.staves[this._currentTrack.staves.length - 1]);

                if (previousWasPercussion) {
                    this.applyPercussionStaff(this._currentStaff);
                }

                this._currentDynamics = DynamicValue.F;
            }
            this.staffProperties();
        }

        if (this.sy === AlphaTexSymbols.MetaCommand && (this.syData as string).toLowerCase() === 'voice') {
            this.sy = this.newSy();

            this.handleNewVoice();
        }

        return true;
    }

    private handleNewVoice(): boolean {
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

    private beginStaff(staff: Staff) {
        this._currentStaff = staff;
        this._slurs.clear();
        this._barIndex = 0;
        this._voiceIndex = 0;
    }

    private trackProperties(): void {
        if (this.sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this.sy = this.newSy();
        while (this.sy === AlphaTexSymbols.String) {
            switch ((this.syData as string).toLowerCase()) {
                case 'color':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.String) {
                        this.error('track-color', AlphaTexSymbols.String, true);
                    }
                    this._currentTrack.color = Color.fromJson(this.syData as string)!;
                    this.sy = this.newSy();

                    break;
                case 'defaultsystemslayout':
                    this.sy = this.newSy();
                    if (this.sy === AlphaTexSymbols.Number) {
                        this._currentTrack.defaultSystemsLayout = this.syData as number;
                        this.sy = this.newSy();
                    } else {
                        this.error('default-systems-layout', AlphaTexSymbols.Number, true);
                    }
                    break;
                case 'systemslayout':
                    this.sy = this.newSy();
                    while (this.sy === AlphaTexSymbols.Number) {
                        this._currentTrack.systemsLayout.push(this.syData as number);
                        this.sy = this.newSy();
                    }
                    break;
                case 'volume':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('track-volume', AlphaTexSymbols.Number, true);
                    }
                    this._currentTrack.playbackInfo.volume = ModelUtils.clamp(this.syData as number, 0, 16);
                    this.sy = this.newSy();
                    break;
                case 'balance':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('track-balance', AlphaTexSymbols.Number, true);
                    }
                    this._currentTrack.playbackInfo.balance = ModelUtils.clamp(this.syData as number, 0, 16);
                    this.sy = this.newSy();
                    break;
                case 'mute':
                    this.sy = this.newSy();
                    this._currentTrack.playbackInfo.isMute = true;
                    break;
                case 'solo':
                    this.sy = this.newSy();
                    this._currentTrack.playbackInfo.isSolo = true;
                    break;
                case 'multibarrest':
                    this.sy = this.newSy();
                    if (!this._score.stylesheet.perTrackMultiBarRest) {
                        this._score.stylesheet.perTrackMultiBarRest = new Set<number>();
                    }
                    this._score.stylesheet.perTrackMultiBarRest!.add(this._currentTrack.index);
                    break;
                default:
                    this.error('track-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this.sy !== AlphaTexSymbols.RBrace) {
            this.error('track-properties', AlphaTexSymbols.RBrace, true);
        }
        this.sy = this.newSy();
    }

    private staffProperties(): void {
        if (this.sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this.sy = this.newSy();
        let showStandardNotation: boolean = false;
        let showTabs: boolean = false;
        let showSlash: boolean = false;
        let showNumbered: boolean = false;
        while (this.sy === AlphaTexSymbols.String) {
            switch ((this.syData as string).toLowerCase()) {
                case 'score':
                    showStandardNotation = true;
                    this.sy = this.newSy();

                    if (this.sy === AlphaTexSymbols.Number) {
                        this._currentStaff.standardNotationLineCount = this.syData as number;
                        this.sy = this.newSy();
                    }

                    break;
                case 'tabs':
                    showTabs = true;
                    this.sy = this.newSy();
                    break;
                case 'slash':
                    showSlash = true;
                    this.sy = this.newSy();
                    break;
                case 'numbered':
                    showNumbered = true;
                    this.sy = this.newSy();
                    break;
                default:
                    this.error('staff-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (showStandardNotation || showTabs || showSlash || showNumbered) {
            this._currentStaff.showStandardNotation = showStandardNotation;
            this._currentStaff.showTablature = showTabs;
            this._currentStaff.showSlash = showSlash;
            this._currentStaff.showNumbered = showNumbered;
        }
        if (this.sy !== AlphaTexSymbols.RBrace) {
            this.error('staff-properties', AlphaTexSymbols.RBrace, true);
        }
        this.sy = this.newSy();
    }

    private bar(): boolean {
        const anyStaffMeta = this.trackStaffMeta();

        const bar: Bar = this.newBar(this._currentStaff);
        if (this._currentStaff.bars.length > this._score.masterBars.length) {
            const master: MasterBar = new MasterBar();
            this._score.addMasterBar(master);
            if (master.index > 0) {
                master.timeSignatureDenominator = master.previousMasterBar!.timeSignatureDenominator;
                master.timeSignatureNumerator = master.previousMasterBar!.timeSignatureNumerator;
                master.tripletFeel = master.previousMasterBar!.tripletFeel;
            }
        }
        const anyBarMeta = this.barMeta(bar);

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
            this.sy === AlphaTexSymbols.MetaCommand &&
            ((this.syData as string).toLowerCase() === 'track' || (this.syData as string).toLowerCase() === 'staff');

        if (!emptyStaffWithNewStart) {
            while (this.sy !== AlphaTexSymbols.Pipe && this.sy !== AlphaTexSymbols.Eof) {
                if (!this.beat(voice)) {
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

    private newBar(staff: Staff): Bar {
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

    private beat(voice: Voice): boolean {
        // duration specifier?
        this.beatDuration();

        const beat: Beat = new Beat();
        voice.addBeat(beat);

        this._lexer.allowTuning = !this._currentStaff.isPercussion;

        // notes
        if (this.sy === AlphaTexSymbols.LParensis) {
            this.sy = this.newSy();
            this.note(beat);
            while (this.sy !== AlphaTexSymbols.RParensis && this.sy !== AlphaTexSymbols.Eof) {
                this._lexer.allowTuning = !this._currentStaff.isPercussion;
                if (!this.note(beat)) {
                    break;
                }
            }
            if (this.sy !== AlphaTexSymbols.RParensis) {
                this.error('note-list', AlphaTexSymbols.RParensis, true);
            }
            this.sy = this.newSy();
        } else if (this.sy === AlphaTexSymbols.String && (this.syData as string).toLowerCase() === 'r') {
            // rest voice -> no notes
            this.sy = this.newSy();
        } else {
            if (!this.note(beat)) {
                voice.beats.splice(voice.beats.length - 1, 1);
                return false;
            }
        }
        // new duration
        if (this.sy === AlphaTexSymbols.Dot) {
            this.sy = this.newSy();
            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('duration', AlphaTexSymbols.Number, true);
            }
            this._currentDuration = this.parseDuration(this.syData as number);
            this.sy = this.newSy();
        }
        beat.duration = this._currentDuration;
        beat.dynamics = this._currentDynamics;
        if (this._currentTuplet !== 1 && !beat.hasTuplet) {
            AlphaTexImporter.applyTuplet(beat, this._currentTuplet);
        }
        // beat multiplier (repeat beat n times)
        let beatRepeat: number = 1;
        if (this.sy === AlphaTexSymbols.Multiply) {
            this.sy = this.newSy();
            // multiplier count
            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('multiplier', AlphaTexSymbols.Number, true);
            } else {
                beatRepeat = this.syData as number;
            }
            this.sy = this.newSy();
        }
        this.beatEffects(beat);
        for (let i: number = 0; i < beatRepeat - 1; i++) {
            voice.addBeat(BeatCloner.clone(beat));
        }
        return true;
    }

    private beatDuration(): void {
        if (this.sy !== AlphaTexSymbols.DoubleDot) {
            return;
        }
        this.sy = this.newSy();
        if (this.sy !== AlphaTexSymbols.Number) {
            this.error('duration', AlphaTexSymbols.Number, true);
        }
        this._currentDuration = this.parseDuration(this.syData as number);
        this._currentTuplet = 1;
        this.sy = this.newSy();
        if (this.sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this.sy = this.newSy();
        while (this.sy === AlphaTexSymbols.String) {
            const effect: string = (this.syData as string).toLowerCase();
            switch (effect) {
                case 'tu':
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('duration-tuplet', AlphaTexSymbols.Number, true);
                    }
                    this._currentTuplet = this.syData as number;
                    this.sy = this.newSy();
                    break;
                default:
                    this.error('beat-duration', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this.sy !== AlphaTexSymbols.RBrace) {
            this.error('beat-duration', AlphaTexSymbols.RBrace, true);
        }
        this.sy = this.newSy();
    }

    private beatEffects(beat: Beat): void {
        if (this.sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this.sy = this.newSy();
        while (this.sy === AlphaTexSymbols.String) {
            if (!this.applyBeatEffect(beat)) {
                this.error('beat-effects', AlphaTexSymbols.String, false);
            }
        }
        if (this.sy !== AlphaTexSymbols.RBrace) {
            this.error('beat-effects', AlphaTexSymbols.RBrace, true);
        }
        this.sy = this.newSy();
    }

    /**
     * Tries to apply a beat effect to the given beat.
     * @returns true if a effect could be applied, otherwise false
     */
    private applyBeatEffect(beat: Beat): boolean {
        const syData: string = (this.syData as string).toLowerCase();
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
            this.sy = this.newSy();
            if (this.sy !== AlphaTexSymbols.String) {
                this.error('beat-text', AlphaTexSymbols.String, true);
                return false;
            }
            beat.text = this.syData as string;
        } else if (syData === 'lyrics') {
            this.sy = this.newSy();

            let lyricsLine = 0;
            if (this.sy === AlphaTexSymbols.Number) {
                lyricsLine = this.syData as number;
                this.sy = this.newSy();
            }

            if (this.sy !== AlphaTexSymbols.String) {
                this.error('lyrics', AlphaTexSymbols.String, true);
                return false;
            }

            if (!beat.lyrics) {
                beat.lyrics = [];
            }

            while (beat.lyrics!.length <= lyricsLine) {
                beat.lyrics.push('');
            }

            beat.lyrics[lyricsLine] = this.syData as string;
        } else if (syData === 'dd') {
            beat.dots = 2;
        } else if (syData === 'd') {
            beat.dots = 1;
        } else if (syData === 'su') {
            beat.pickStroke = PickStroke.Up;
        } else if (syData === 'sd') {
            beat.pickStroke = PickStroke.Down;
        } else if (syData === 'tu') {
            this.sy = this.newSy();
            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('tuplet', AlphaTexSymbols.Number, true);
                return false;
            }

            const numerator = this.syData as number;
            this.sy = this.newSy();

            if (this.sy === AlphaTexSymbols.Number) {
                const denominator = this.syData as number;
                this.sy = this.newSy();
                beat.tupletNumerator = numerator;
                beat.tupletDenominator = denominator;
            } else {
                AlphaTexImporter.applyTuplet(beat, numerator);
            }

            return true;
        } else if (syData === 'tb' || syData === 'tbe') {
            this.sy = this.newSy();

            const exact: boolean = syData === 'tbe';

            // Type
            if (this.sy === AlphaTexSymbols.String) {
                beat.whammyBarType = this.parseWhammyType(this.syData as string);
                this.sy = this.newSy();
            }

            // Style
            if (this.sy === AlphaTexSymbols.String) {
                beat.whammyStyle = this.parseBendStyle(this.syData as string);
                this.sy = this.newSy();
            }

            // read points
            if (this.sy !== AlphaTexSymbols.LParensis) {
                this.error('tremolobar-effect', AlphaTexSymbols.LParensis, true);
            }
            this.sy = this.newSy(true);
            while (this.sy !== AlphaTexSymbols.RParensis && this.sy !== AlphaTexSymbols.Eof) {
                let offset: number = 0;
                let value: number = 0;
                if (exact) {
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('tremolobar-effect', AlphaTexSymbols.Number, true);
                    }
                    offset = this.syData as number;
                    this.sy = this.newSy(true);
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('tremolobar-effect', AlphaTexSymbols.Number, true);
                    }
                    value = this.syData as number;
                } else {
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('tremolobar-effect', AlphaTexSymbols.Number, true);
                    }
                    offset = 0;
                    value = this.syData as number;
                }
                beat.addWhammyBarPoint(new BendPoint(offset, value));
                this.sy = this.newSy(true);
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
            if (this.sy !== AlphaTexSymbols.RParensis) {
                this.error('tremolobar-effect', AlphaTexSymbols.RParensis, true);
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
            this.sy = this.newSy();
            if (this.sy === AlphaTexSymbols.Number) {
                // explicit duration
                beat.brushDuration = this.syData as number;
                this.sy = this.newSy();
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
            this.sy = this.newSy();
            const chordName: string = this.syData as string;
            const chordId: string = this.getChordId(this._currentStaff, chordName);
            if (!this._currentStaff.hasChord(chordId)) {
                const chord: Chord = new Chord();
                chord.showDiagram = false;
                chord.name = chordName;
                this._currentStaff.addChord(chordId, chord);
            }
            beat.chordId = chordId;
        } else if (syData === 'gr') {
            this.sy = this.newSy();
            if ((this.syData as string).toLowerCase() === 'ob') {
                beat.graceType = GraceType.OnBeat;
                this.sy = this.newSy();
            } else if ((this.syData as string).toLowerCase() === 'b') {
                beat.graceType = GraceType.BendGrace;
                this.sy = this.newSy();
            } else {
                beat.graceType = GraceType.BeforeBeat;
            }
            return true;
        } else if (syData === 'dy') {
            this.sy = this.newSy();
            const dynamicString = (this.syData as string).toUpperCase() as keyof typeof DynamicValue;
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
            const tempoAutomation = this.readTempoAutomation(false);
            beat.automations.push(tempoAutomation);
            beat.voice.bar.masterBar.tempoAutomations.push(tempoAutomation);
            return true;
        } else if (syData === 'volume') {
            // NOTE: playbackRatio is calculated on score finish when playback positions are known
            this.sy = this.newSy();
            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('volume', AlphaTexSymbols.Number, true);
            }
            const volumeAutomation: Automation = new Automation();
            volumeAutomation.isLinear = true;
            volumeAutomation.type = AutomationType.Volume;
            volumeAutomation.value = this.syData as number;
            this.sy = this.newSy();

            beat.automations.push(volumeAutomation);
            return true;
        } else if (syData === 'balance') {
            // NOTE: playbackRatio is calculated on score finish when playback positions are known
            this.sy = this.newSy();
            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('balance', AlphaTexSymbols.Number, true);
            }
            const balanceAutomation: Automation = new Automation();
            balanceAutomation.isLinear = true;
            balanceAutomation.type = AutomationType.Balance;
            balanceAutomation.value = ModelUtils.clamp(this.syData as number, 0, 16);
            this.sy = this.newSy();

            beat.automations.push(balanceAutomation);
            return true;
        } else if (syData === 'tp') {
            this.sy = this.newSy();
            beat.tremoloSpeed = Duration.Eighth;
            if (this.sy === AlphaTexSymbols.Number) {
                switch (this.syData as number) {
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
                this.sy = this.newSy();
            }
            return true;
        } else if (syData === 'spd') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Down;
            // exact ratio position will be applied after .finish() when times are known
            sustainPedal.ratioPosition = beat.voice.bar.sustainPedals.length;
            this._sustainPedalToBeat.set(sustainPedal, beat);
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this.sy = this.newSy();
            return true;
        } else if (syData === 'sph') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Hold;
            // exact ratio position will be applied after .finish() when times are known
            sustainPedal.ratioPosition = beat.voice.bar.sustainPedals.length;
            this._sustainPedalToBeat.set(sustainPedal, beat);
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this.sy = this.newSy();
            return true;
        } else if (syData === 'spu') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Up;
            // exact ratio position will be applied after .finish() when times are known
            sustainPedal.ratioPosition = beat.voice.bar.sustainPedals.length;
            this._sustainPedalToBeat.set(sustainPedal, beat);
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this.sy = this.newSy();
            return true;
        } else if (syData === 'spe') {
            const sustainPedal = new SustainPedalMarker();
            sustainPedal.pedalType = SustainPedalMarkerType.Up;
            sustainPedal.ratioPosition = 1;
            beat.voice.bar.sustainPedals.push(sustainPedal);
            this.sy = this.newSy();
            return true;
        } else if (syData === 'slashed') {
            beat.slashed = true;
            this.sy = this.newSy();
            return true;
        } else if (syData === 'ds') {
            beat.deadSlapped = true;
            this.sy = this.newSy();
            if (beat.notes.length === 1 && beat.notes[0].isDead) {
                beat.removeNote(beat.notes[0]);
            }
            return true;
        } else if (syData === 'glpf') {
            this.sy = this.newSy();
            beat.golpe = GolpeType.Finger;
            return true;
        } else if (syData === 'glpt') {
            this.sy = this.newSy();
            beat.golpe = GolpeType.Thumb;
            return true;
        } else if (syData === 'waho') {
            this.sy = this.newSy();
            beat.wahPedal = WahPedal.Open;
            return true;
        } else if (syData === 'wahc') {
            this.sy = this.newSy();
            beat.wahPedal = WahPedal.Closed;
            return true;
        } else if (syData === 'barre') {
            this.sy = this.newSy();

            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('beat-barre', AlphaTexSymbols.Number, true);
            }
            beat.barreFret = this.syData as number;
            beat.barreShape = BarreShape.Full;
            this.sy = this.newSy();

            if (this.sy === AlphaTexSymbols.String) {
                switch ((this.syData as string).toLowerCase()) {
                    case 'full':
                        beat.barreShape = BarreShape.Full;
                        this.sy = this.newSy();
                        break;
                    case 'half':
                        beat.barreShape = BarreShape.Half;
                        this.sy = this.newSy();
                        break;
                }
            }

            return true;
        } else if (syData === 'rasg') {
            this.sy = this.newSy();

            if (this.sy !== AlphaTexSymbols.String) {
                this.error('rasgueado', AlphaTexSymbols.String, true);
            }

            switch ((this.syData as string).toLowerCase()) {
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
            this.sy = this.newSy();

            return true;
        } else if (syData === 'ot') {
            this.sy = this.newSy();

            if (this.sy !== AlphaTexSymbols.String) {
                this.error('beat-ottava', AlphaTexSymbols.String, true);
            }

            beat.ottava = this.parseClefOttavaFromString(this.syData as string);
        } else if (syData === 'legatoorigin') {
            beat.isLegatoOrigin = true;
        } else if (syData === 'instrument') {
            this.sy = this.newSy();

            let program = 0;

            if (this.sy === AlphaTexSymbols.Number) {
                program = this.syData as number;
            } else if (this.sy === AlphaTexSymbols.String) {
                program = GeneralMidi.getValue(this.syData as string);
            } else {
                this.error('instrument-change', AlphaTexSymbols.Number, true);
            }

            const automation = new Automation();
            automation.isLinear = false;
            automation.type = AutomationType.Instrument;
            automation.value = program;
            beat.automations.push(automation);
        } else if (syData === 'fermata') {
            this.sy = this.newSy();
            if (this.sy !== AlphaTexSymbols.String) {
                this.error('fermata', AlphaTexSymbols.Number, true);
            }

            const fermata = new Fermata();
            fermata.type = this.parseFermataFromString(this.syData as string);

            this.sy = this.newSy(true);
            if (this.sy === AlphaTexSymbols.Number) {
                fermata.length = this.syData as number;
                this.sy = this.newSy(true);
            }

            beat.fermata = fermata;

            return true;
        } else if (syData === 'beam') {
            this.sy = this.newSy();
            if (this.sy !== AlphaTexSymbols.String) {
                this.error('beam', AlphaTexSymbols.Number, true);
            }

            switch ((this.syData as string).toLowerCase()) {
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
            this.sy = this.newSy();
            return true;
        } else if (syData === 'timer') {
            beat.showTimer = true;
            this.sy = this.newSy();
            return true;
        } else {
            // string didn't match any beat effect syntax
            return false;
        }
        // default behaviour when a beat effect above
        // does not handle new symbol + return on its own
        this.sy = this.newSy();
        return true;
    }

    private parseBracketExtendMode(str: string): BracketExtendMode {
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

    private parseFermataFromString(str: string): FermataType {
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

    private parseClefOttavaFromString(str: string): Ottavia {
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

    private getChordId(currentStaff: Staff, chordName: string): string {
        return chordName.toLowerCase() + currentStaff.index + currentStaff.track.index;
    }

    private static applyTuplet(beat: Beat, tuplet: number): void {
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

    private isNoteText(txt: string): boolean {
        return txt === 'x' || txt === '-' || txt === 'r';
    }

    private note(beat: Beat): boolean {
        // fret.string or TuningWithAccidentals
        let isDead: boolean = false;
        let isTie: boolean = false;
        let fret: number = -1;
        let octave: number = -1;
        let tone: number = -1;
        let accidentalMode: NoteAccidentalMode = NoteAccidentalMode.Default;
        switch (this.sy) {
            case AlphaTexSymbols.Number:
                fret = this.syData as number;
                if (this._currentStaff.isPercussion && !PercussionMapper.instrumentArticulations.has(fret)) {
                    this.errorMessage(`Unknown percussion articulation ${fret}`);
                }
                break;
            case AlphaTexSymbols.String:
                if (this._currentStaff.isPercussion) {
                    const articulationName = (this.syData as string).toLowerCase();
                    if (this._percussionArticulationNames.has(articulationName)) {
                        fret = this._percussionArticulationNames.get(articulationName)!;
                    } else {
                        this.errorMessage(`Unknown percussion articulation '${this.syData}'`);
                    }
                } else {
                    isDead = (this.syData as string) === 'x';
                    isTie = (this.syData as string) === '-';

                    if (isTie || isDead) {
                        fret = 0;
                    } else {
                        this.error('note-fret', AlphaTexSymbols.Number, true);
                    }
                }
                break;
            case AlphaTexSymbols.Tuning:
                // auto convert staff
                if (beat.index === 0 && beat.voice.index === 0 && beat.voice.bar.index === 0) {
                    this.makeCurrentStaffPitched();
                }

                const tuning: TuningParseResult = this.syData as TuningParseResult;
                octave = tuning.octave;
                tone = tuning.tone.noteValue;
                if (this._accidentalMode === AlphaTexAccidentalMode.Explicit) {
                    accidentalMode = tuning.tone.accidentalMode;
                }
                break;
            default:
                return false;
        }
        this.sy = this.newSy(); // Fret done

        const isFretted: boolean =
            octave === -1 && this._currentStaff.tuning.length > 0 && !this._currentStaff.isPercussion;
        let noteString: number = -1;
        if (isFretted) {
            // Fret [Dot] String
            if (this.sy !== AlphaTexSymbols.Dot) {
                this.error('note', AlphaTexSymbols.Dot, true);
            }
            this.sy = this.newSy(); // dot done

            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('note-string', AlphaTexSymbols.Number, true);
            }
            noteString = this.syData as number;
            if (noteString < 1 || noteString > this._currentStaff.tuning.length) {
                this.error('note-string', AlphaTexSymbols.Number, false);
            }
            this.sy = this.newSy(); // string done
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
                    this.errorMessage(`Unknown articulation value ${articulationValue}`);
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
        this.noteEffects(note);
        return true;
    }

    private noteEffects(note: Note): void {
        if (this.sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this.sy = this.newSy();
        while (this.sy === AlphaTexSymbols.String) {
            const syData = (this.syData as string).toLowerCase();
            if (syData === 'b' || syData === 'be') {
                this.sy = this.newSy();
                const exact: boolean = syData === 'be';

                // Type
                if (this.sy === AlphaTexSymbols.String) {
                    note.bendType = this.parseBendType(this.syData as string);
                    this.sy = this.newSy();
                }

                // Style
                if (this.sy === AlphaTexSymbols.String) {
                    note.bendStyle = this.parseBendStyle(this.syData as string);
                    this.sy = this.newSy();
                }

                // read points
                if (this.sy !== AlphaTexSymbols.LParensis) {
                    this.error('bend-effect', AlphaTexSymbols.LParensis, true);
                }

                if (exact) {
                    // float on position
                    this.sy = this.newSy(true);
                } else {
                    this.sy = this.newSy();
                }

                while (this.sy !== AlphaTexSymbols.RParensis && this.sy !== AlphaTexSymbols.Eof) {
                    let offset: number = 0;
                    let value: number = 0;
                    if (exact) {
                        if (this.sy !== AlphaTexSymbols.Number) {
                            this.error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        offset = this.syData as number;
                        this.sy = this.newSy();
                        if (this.sy !== AlphaTexSymbols.Number) {
                            this.error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        value = this.syData as number;
                    } else {
                        if (this.sy !== AlphaTexSymbols.Number) {
                            this.error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        value = this.syData as number;
                    }
                    note.addBendPoint(new BendPoint(offset, value));

                    if (exact) {
                        // float on position
                        this.sy = this.newSy(true);
                    } else {
                        this.sy = this.newSy();
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
                if (this.sy !== AlphaTexSymbols.RParensis) {
                    this.error('bend-effect', AlphaTexSymbols.RParensis, true);
                }
                this.sy = this.newSy();
            } else if (syData === 'nh') {
                note.harmonicType = HarmonicType.Natural;
                note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(note.fret);
                this.sy = this.newSy();
            } else if (syData === 'ah') {
                // todo: Artificial Key
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = this.harmonicValue(note.harmonicValue);
            } else if (syData === 'th') {
                // todo: store tapped fret in data
                note.harmonicType = HarmonicType.Tap;
                note.harmonicValue = this.harmonicValue(note.harmonicValue);
            } else if (syData === 'ph') {
                note.harmonicType = HarmonicType.Pinch;
                note.harmonicValue = this.harmonicValue(note.harmonicValue);
            } else if (syData === 'sh') {
                note.harmonicType = HarmonicType.Semi;
                note.harmonicValue = this.harmonicValue(note.harmonicValue);
            } else if (syData === 'fh') {
                note.harmonicType = HarmonicType.Feedback;
                note.harmonicValue = this.harmonicValue(note.harmonicValue);
            } else if (syData === 'tr') {
                this.sy = this.newSy();
                if (this.sy !== AlphaTexSymbols.Number) {
                    this.error('trill-effect', AlphaTexSymbols.Number, true);
                }
                const fret: number = this.syData as number;
                this.sy = this.newSy();
                let duration: Duration = Duration.Sixteenth;
                if (this.sy === AlphaTexSymbols.Number) {
                    switch (this.syData as number) {
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
                    this.sy = this.newSy();
                }
                note.trillValue = fret + note.stringTuning;
                note.trillSpeed = duration;
            } else if (syData === 'v') {
                this.sy = this.newSy();
                note.vibrato = VibratoType.Slight;
            } else if (syData === 'vw') {
                this.sy = this.newSy();
                note.vibrato = VibratoType.Wide;
            } else if (syData === 'sl') {
                this.sy = this.newSy();
                note.slideOutType = SlideOutType.Legato;
            } else if (syData === 'ss') {
                this.sy = this.newSy();
                note.slideOutType = SlideOutType.Shift;
            } else if (syData === 'sib') {
                this.sy = this.newSy();
                note.slideInType = SlideInType.IntoFromBelow;
            } else if (syData === 'sia') {
                this.sy = this.newSy();
                note.slideInType = SlideInType.IntoFromAbove;
            } else if (syData === 'sou') {
                this.sy = this.newSy();
                note.slideOutType = SlideOutType.OutUp;
            } else if (syData === 'sod') {
                this.sy = this.newSy();
                note.slideOutType = SlideOutType.OutDown;
            } else if (syData === 'psd') {
                this.sy = this.newSy();
                note.slideOutType = SlideOutType.PickSlideDown;
            } else if (syData === 'psu') {
                this.sy = this.newSy();
                note.slideOutType = SlideOutType.PickSlideUp;
            } else if (syData === 'h') {
                this.sy = this.newSy();
                note.isHammerPullOrigin = true;
            } else if (syData === 'lht') {
                this.sy = this.newSy();
                note.isLeftHandTapped = true;
            } else if (syData === 'g') {
                this.sy = this.newSy();
                note.isGhost = true;
            } else if (syData === 'ac') {
                this.sy = this.newSy();
                note.accentuated = AccentuationType.Normal;
            } else if (syData === 'hac') {
                this.sy = this.newSy();
                note.accentuated = AccentuationType.Heavy;
            } else if (syData === 'ten') {
                this.sy = this.newSy();
                note.accentuated = AccentuationType.Tenuto;
            } else if (syData === 'pm') {
                this.sy = this.newSy();
                note.isPalmMute = true;
            } else if (syData === 'st') {
                this.sy = this.newSy();
                note.isStaccato = true;
            } else if (syData === 'lr') {
                this.sy = this.newSy();
                note.isLetRing = true;
            } else if (syData === 'x') {
                this.sy = this.newSy();
                note.isDead = true;
            } else if (syData === '-' || syData === 't') {
                this.sy = this.newSy();
                note.isTieDestination = true;
            } else if (syData === 'lf') {
                this.sy = this.newSy();
                let finger: Fingers = Fingers.Thumb;
                if (this.sy === AlphaTexSymbols.Number) {
                    finger = this.toFinger(this.syData as number);
                    this.sy = this.newSy();
                }
                note.leftHandFinger = finger;
            } else if (syData === 'rf') {
                this.sy = this.newSy();
                let finger: Fingers = Fingers.Thumb;
                if (this.sy === AlphaTexSymbols.Number) {
                    finger = this.toFinger(this.syData as number);
                    this.sy = this.newSy();
                }
                note.rightHandFinger = finger;
            } else if (syData === 'acc') {
                this.sy = this.newSy();

                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('note-accidental', AlphaTexSymbols.String, true);
                }

                note.accidentalMode = ModelUtils.parseAccidentalMode(this.syData as string);
                this.sy = this.newSy();
            } else if (syData === 'turn') {
                this.sy = this.newSy();
                note.ornament = NoteOrnament.Turn;
            } else if (syData === 'iturn') {
                this.sy = this.newSy();
                note.ornament = NoteOrnament.InvertedTurn;
            } else if (syData === 'umordent') {
                this.sy = this.newSy();
                note.ornament = NoteOrnament.UpperMordent;
            } else if (syData === 'lmordent') {
                this.sy = this.newSy();
                note.ornament = NoteOrnament.LowerMordent;
            } else if (syData === 'string') {
                this.sy = this.newSy();
                note.showStringNumber = true;
            } else if (syData === 'hide') {
                this.sy = this.newSy();
                note.isVisible = false;
            } else if (syData === 'slur') {
                this.sy = this.newSy();
                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('slur', AlphaTexSymbols.String, true);
                }

                const slurId = this.syData as string;
                if (this._slurs.has(slurId)) {
                    const slurOrigin = this._slurs.get(slurId)!;
                    slurOrigin.slurDestination = note;

                    note.slurOrigin = slurOrigin;
                    note.isSlurDestination = true;
                } else {
                    this._slurs.set(slurId, note);
                }

                this.sy = this.newSy();
            } else if (this.applyBeatEffect(note.beat)) {
                // Success
            } else {
                this.error(syData, AlphaTexSymbols.String, false);
            }
        }
        if (this.sy !== AlphaTexSymbols.RBrace) {
            this.error('note-effect', AlphaTexSymbols.RBrace, false);
        }
        this.sy = this.newSy();
    }

    private harmonicValue(harmonicValue: number): number {
        this.sy = this.newSy(true);
        if (this.sy === AlphaTexSymbols.Number) {
            harmonicValue = this.syData as number;
            this.sy = this.newSy(true);
        }
        return harmonicValue;
    }

    private toFinger(num: number): Fingers {
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

    private parseDuration(duration: number): Duration {
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

    private parseBendStyle(str: string): BendStyle {
        switch (str.toLowerCase()) {
            case 'gradual':
                return BendStyle.Gradual;
            case 'fast':
                return BendStyle.Fast;
            default:
                return BendStyle.Default;
        }
    }

    private parseBendType(str: string): BendType {
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

    private barMeta(bar: Bar): boolean {
        let anyMeta = false;
        const master: MasterBar = bar.masterBar;
        let endOfMeta = false;
        while (!endOfMeta && this.sy === AlphaTexSymbols.MetaCommand) {
            anyMeta = true;
            const syData: string = (this.syData as string).toLowerCase();
            if (syData === 'ts') {
                this.sy = this.newSy();
                if (this.sy === AlphaTexSymbols.String) {
                    if ((this.syData as string).toLowerCase() === 'common') {
                        master.timeSignatureCommon = true;
                        master.timeSignatureNumerator = 4;
                        master.timeSignatureDenominator = 4;
                        this.sy = this.newSy();
                    } else {
                        this.error('timesignature-numerator', AlphaTexSymbols.String, true);
                    }
                } else {
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('timesignature-numerator', AlphaTexSymbols.Number, true);
                    }
                    master.timeSignatureNumerator = this.syData as number;
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('timesignature-denominator', AlphaTexSymbols.Number, true);
                    }
                    master.timeSignatureDenominator = this.syData as number;
                    this.sy = this.newSy();
                }
            } else if (syData === 'ft') {
                master.isFreeTime = true;
                this.sy = this.newSy();
            } else if (syData === 'ro') {
                master.isRepeatStart = true;
                this.sy = this.newSy();
            } else if (syData === 'rc') {
                this.sy = this.newSy();
                if (this.sy !== AlphaTexSymbols.Number) {
                    this.error('repeatclose', AlphaTexSymbols.Number, true);
                }
                if ((this.syData as number) > 2048) {
                    this.error('repeatclose', AlphaTexSymbols.Number, false);
                }
                master.repeatCount = this.syData as number;
                this.sy = this.newSy();
            } else if (syData === 'ae') {
                this.sy = this.newSy();
                if (this.sy === AlphaTexSymbols.LParensis) {
                    this.sy = this.newSy();
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('alternateending', AlphaTexSymbols.Number, true);
                    }
                    this.applyAlternateEnding(master);
                    while (this.sy === AlphaTexSymbols.Number) {
                        this.applyAlternateEnding(master);
                    }
                    if (this.sy !== AlphaTexSymbols.RParensis) {
                        this.error('alternateending-list', AlphaTexSymbols.RParensis, true);
                    }
                    this.sy = this.newSy();
                } else {
                    if (this.sy !== AlphaTexSymbols.Number) {
                        this.error('alternateending', AlphaTexSymbols.Number, true);
                    }
                    this.applyAlternateEnding(master);
                }
            } else if (syData === 'ks') {
                this.sy = this.newSy();
                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('keysignature', AlphaTexSymbols.String, true);
                }
                bar.keySignature = this.parseKeySignature(this.syData as string);
                bar.keySignatureType = this.parseKeySignatureType(this.syData as string);
                this.sy = this.newSy();
            } else if (syData === 'clef') {
                this.sy = this.newSy();
                switch (this.sy) {
                    case AlphaTexSymbols.String:
                        bar.clef = this.parseClefFromString(this.syData as string);
                        break;
                    case AlphaTexSymbols.Number:
                        bar.clef = this.parseClefFromInt(this.syData as number);
                        break;
                    case AlphaTexSymbols.Tuning:
                        const parseResult: TuningParseResult = this.syData as TuningParseResult;
                        bar.clef = this.parseClefFromInt(parseResult.realValue);
                        break;
                    default:
                        this.error('clef', AlphaTexSymbols.String, true);
                        break;
                }
                this.sy = this.newSy();
            } else if (syData === 'tempo') {
                const tempoAutomation = this.readTempoAutomation(true);

                master.tempoAutomations.push(tempoAutomation);
            } else if (syData === 'section') {
                this.sy = this.newSy();
                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('section', AlphaTexSymbols.String, true);
                }
                let text: string = this.syData as string;
                this.sy = this.newSy();
                let marker: string = '';
                if (this.sy === AlphaTexSymbols.String && !this.isNoteText((this.syData as string).toLowerCase())) {
                    marker = text;
                    text = this.syData as string;
                    this.sy = this.newSy();
                }
                const section: Section = new Section();
                section.marker = marker;
                section.text = text;
                master.section = section;
            } else if (syData === 'tf') {
                this._lexer.allowTuning = false;
                this.sy = this.newSy();
                this._lexer.allowTuning = true;
                switch (this.sy) {
                    case AlphaTexSymbols.String:
                        master.tripletFeel = this.parseTripletFeelFromString(this.syData as string);
                        break;
                    case AlphaTexSymbols.Number:
                        master.tripletFeel = this.parseTripletFeelFromInt(this.syData as number);
                        break;
                    default:
                        this.error('triplet-feel', AlphaTexSymbols.String, true);
                        break;
                }
                this.sy = this.newSy();
            } else if (syData === 'ac') {
                master.isAnacrusis = true;
                this.sy = this.newSy();
            } else if (syData === 'db') {
                master.isDoubleBar = true;
                bar.barLineRight = BarLineStyle.LightLight;
                this.sy = this.newSy();
            } else if (syData === 'barlineleft') {
                this.sy = this.newSy();
                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('barlineleft', AlphaTexSymbols.String, true);
                }

                bar.barLineLeft = this.parseBarLineStyle(this.syData as string);
                this.sy = this.newSy();
            } else if (syData === 'barlineright') {
                this.sy = this.newSy();
                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('barlineright', AlphaTexSymbols.String, true);
                }

                bar.barLineRight = this.parseBarLineStyle(this.syData as string);
                this.sy = this.newSy();
            } else if (syData === 'accidentals') {
                this.handleAccidentalMode();
            } else if (syData === 'jump') {
                this.handleDirections(master);
            } else if (syData === 'ottava') {
                this.sy = this.newSy();

                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('ottava', AlphaTexSymbols.String, true);
                }

                bar.clefOttava = this.parseClefOttavaFromString(this.syData as string);
                this.sy = this.newSy();
            } else if (syData === 'simile') {
                this.sy = this.newSy();

                if (this.sy !== AlphaTexSymbols.String) {
                    this.error('simile', AlphaTexSymbols.String, true);
                }

                bar.simileMark = this.parseSimileMarkFromString(this.syData as string);
                this.sy = this.newSy();
            } else if (syData === 'scale') {
                this.sy = this.newSy(true);

                if (this.sy !== AlphaTexSymbols.Number) {
                    this.error('scale', AlphaTexSymbols.Number, true);
                }

                master.displayScale = this.syData as number;
                bar.displayScale = this.syData as number;
                this.sy = this.newSy();
            } else if (syData === 'width') {
                this.sy = this.newSy();

                if (this.sy !== AlphaTexSymbols.Number) {
                    this.error('width', AlphaTexSymbols.Number, true);
                }

                master.displayWidth = this.syData as number;
                bar.displayWidth = this.syData as number;
                this.sy = this.newSy();
            } else if (syData === 'spd') {
                const sustainPedal = new SustainPedalMarker();
                sustainPedal.pedalType = SustainPedalMarkerType.Down;

                this.sy = this.newSy(true);
                if (this.sy !== AlphaTexSymbols.Number) {
                    this.error('spd', AlphaTexSymbols.Number, true);
                }
                sustainPedal.ratioPosition = this.syData as number;
                bar.sustainPedals.push(sustainPedal);
                this.sy = this.newSy();
            } else if (syData === 'spu') {
                const sustainPedal = new SustainPedalMarker();
                sustainPedal.pedalType = SustainPedalMarkerType.Up;

                this.sy = this.newSy(true);
                if (this.sy !== AlphaTexSymbols.Number) {
                    this.error('spu', AlphaTexSymbols.Number, true);
                }
                sustainPedal.ratioPosition = this.syData as number;
                bar.sustainPedals.push(sustainPedal);
                this.sy = this.newSy();
            } else if (syData === 'sph') {
                const sustainPedal = new SustainPedalMarker();
                sustainPedal.pedalType = SustainPedalMarkerType.Hold;

                this.sy = this.newSy(true);
                if (this.sy !== AlphaTexSymbols.Number) {
                    this.error('sph', AlphaTexSymbols.Number, true);
                }
                sustainPedal.ratioPosition = this.syData as number;
                bar.sustainPedals.push(sustainPedal);
                this.sy = this.newSy();
            } else {
                if (bar.index === 0) {
                    switch (this.handleStaffMeta()) {
                        case StaffMetaResult.KnownStaffMeta:
                            // ok -> Continue
                            break;
                        case StaffMetaResult.UnknownStaffMeta:
                            this.error('measure-effects', AlphaTexSymbols.String, false);
                            break;
                        case StaffMetaResult.EndOfMetaDetected:
                            endOfMeta = true;
                            break;
                    }
                } else {
                    switch (this.handleStaffMeta()) {
                        case StaffMetaResult.EndOfMetaDetected:
                            endOfMeta = true;
                            break;
                        default:
                            this.error('measure-effects', AlphaTexSymbols.String, false);
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

    private parseBarLineStyle(v: string): BarLineStyle {
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

    private parseSimileMarkFromString(str: string): SimileMark {
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

    private handleDirections(master: MasterBar) {
        this.sy = this.newSy();
        if (this.sy !== AlphaTexSymbols.String) {
            this.error('direction', AlphaTexSymbols.String, true);
        }

        switch ((this.syData as string).toLowerCase()) {
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
                this.errorMessage(`Unexpected direction value: '${this.syData}'`);
                return;
        }

        this.sy = this.newSy();
    }

    private readTempoAutomation(withPosition: boolean) {
        this.sy = this.newSy(true);

        const tempoAutomation: Automation = new Automation();
        tempoAutomation.isLinear = false;
        tempoAutomation.type = AutomationType.Tempo;

        if (this.sy === AlphaTexSymbols.LBrace && withPosition) {
            this.sy = this.newSy(true);
            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('tempo', AlphaTexSymbols.Number, true);
            }

            tempoAutomation.value = this.syData as number;
            this.sy = this.newSy(true);

            if (this.sy === AlphaTexSymbols.String) {
                tempoAutomation.text = this.syData as string;
                this.sy = this.newSy(true);
            }

            if (this.sy !== AlphaTexSymbols.Number) {
                this.error('tempo', AlphaTexSymbols.Number, true);
            }
            tempoAutomation.ratioPosition = this.syData as number;
            this.sy = this.newSy();

            if (this.sy !== AlphaTexSymbols.RBrace) {
                this.error('tempo', AlphaTexSymbols.RBrace, true);
            }
            this.sy = this.newSy();
        } else if (this.sy === AlphaTexSymbols.Number) {
            tempoAutomation.value = this.syData as number;

            this.sy = this.newSy();

            if (this.sy === AlphaTexSymbols.String && (this.syData as string) !== 'r') {
                tempoAutomation.text = this.syData as string;
                this.sy = this.newSy();
            }
        } else {
            this.error('tempo', AlphaTexSymbols.Number, true);
        }

        return tempoAutomation;
    }

    private applyAlternateEnding(master: MasterBar): void {
        const num = this.syData as number;
        if (num < 1) {
            // Repeat numberings start from 1
            this.error('alternateending', AlphaTexSymbols.Number, true);
        }
        // Alternate endings bitflag starts from 0
        master.alternateEndings |= 1 << (num - 1);
        this.sy = this.newSy();
    }

    private parseWhammyType(str: string): WhammyType {
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
