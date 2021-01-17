import { GeneralMidi } from '@src/midi/GeneralMidi';
import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType } from '@src/model/Automation';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
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
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { Logger } from '@src/Logger';
import { ModelUtils, TuningParseResult } from '@src/model/ModelUtils';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { BeatCloner } from '@src/generated/model/BeatCloner';

/**
 * A list of terminals recognized by the alphaTex-parser
 */
export enum AlphaTexSymbols {
    No,
    Eof,
    Number,
    DoubleDot,
    Dot,
    String,
    Tuning,
    LParensis,
    RParensis,
    LBrace,
    RBrace,
    Pipe,
    MetaCommand,
    Multiply,
    LowerThan,
    Property
}

export class AlphaTexError extends AlphaTabError {
    public position: number = 0;
    public nonTerm: string = '';
    public expected: AlphaTexSymbols = AlphaTexSymbols.No;
    public symbol: AlphaTexSymbols = AlphaTexSymbols.No;
    public symbolData: unknown;

    public constructor(message: string) {
        super(AlphaTabErrorType.AlphaTex, message);
        Object.setPrototypeOf(this, AlphaTexError.prototype);
    }

    public static symbolError(
        position: number,
        nonTerm: string,
        expected: AlphaTexSymbols,
        symbol: AlphaTexSymbols,
        symbolData: unknown = null
    ): AlphaTexError {
        let message: string;
        if (!symbolData) {
            message = `MalFormed AlphaTex: @${position}: Error on block ${nonTerm}, expected a ${AlphaTexSymbols[expected]} found a ${AlphaTexSymbols[symbol]}: '${symbolData}'`;
        } else {
            message = `MalFormed AlphaTex: @${position}: Error on block ${nonTerm}, invalid value: ${symbolData}`;
        }
        let exception: AlphaTexError = new AlphaTexError(message);
        exception.position = position;
        exception.nonTerm = nonTerm;
        exception.expected = expected;
        exception.symbol = symbol;
        exception.symbolData = symbolData;
        return exception;
    }

    public static errorMessage(position: number, message: string): AlphaTexError {
        message = 'MalFormed AlphaTex: @' + position + ': ' + message;
        let exception: AlphaTexError = new AlphaTexError(message);
        exception.position = position;
        return exception;
    }
}

/**
 * This importer can parse alphaTex markup into a score structure.
 */
export class AlphaTexImporter extends ScoreImporter {
    private static readonly Eof: number = 0;
    private _trackChannel: number = 0;
    private _score!: Score;
    private _currentTrack!: Track;
    private _currentStaff!: Staff;
    private _ch: number = 0;
    private _curChPos: number = 0;
    private _sy: AlphaTexSymbols = AlphaTexSymbols.No;
    private _syData: unknown;
    private _allowNegatives: boolean = false;
    private _allowTuning: boolean = false;
    private _currentDuration: Duration = Duration.QuadrupleWhole;
    private _currentDynamics: DynamicValue = DynamicValue.PPP;
    private _currentTuplet: number = 0;
    private _lyrics!: Map<number, Lyrics[]>;

    private _staffHasExplicitTuning: boolean = false;
    private _staffTuningApplied: boolean = false;

    public constructor() {
        super();
    }

    public get name(): string {
        return 'AlphaTex';
    }

    public readScore(): Score {
        try {
            this._allowTuning = true;
            this._lyrics = new Map<number, Lyrics[]>();
            this.createDefaultScore();
            this._curChPos = 0;
            this._currentDuration = Duration.Quarter;
            this._currentDynamics = DynamicValue.F;
            this._currentTuplet = 1;
            this._ch = this.nextChar();
            this._sy = this.newSy();
            if (this._sy === AlphaTexSymbols.LowerThan) {
                // potential XML, stop parsing (alphaTex never starts with <)
                throw new UnsupportedFormatError('Unknown start sign <');
            }
            this.score();
            this.consolidate();
            this._score.finish(this.settings);
            this._score.rebuildRepeatGroups();
            for(const [track, lyrics] of this._lyrics) {
                this._score.tracks[track].applyLyrics(lyrics);
            }
            return this._score;
        } catch (e) {
            if (e instanceof AlphaTexError) {
                throw new UnsupportedFormatError(e.message);
            } else {
                throw e;
            }
        }
    }

    private consolidate(): void {
        // the number of bars per staff and track could be inconsistent,
        // we need to ensure all staffs of all tracks have the correct number of bars
        for (let track of this._score.tracks) {
            for (let staff of track.staves) {
                while (staff.bars.length < this._score.masterBars.length) {
                    let bar: Bar = this.newBar(staff);
                    let emptyBeat: Beat = new Beat();
                    emptyBeat.isEmpty = true;
                    bar.voices[0].addBeat(emptyBeat);
                }
            }
        }
    }

    private error(nonterm: string, expected: AlphaTexSymbols, symbolError: boolean = true): void {
        let e: AlphaTexError;
        if (symbolError) {
            e = AlphaTexError.symbolError(this._curChPos, nonterm, expected, this._sy, null);
        } else {
            e = AlphaTexError.symbolError(this._curChPos, nonterm, expected, expected, this._syData);
        }
        Logger.error(this.name, e.message);
        throw e;
    }

    private errorMessage(message: string): void {
        let e: AlphaTexError = AlphaTexError.errorMessage(this._curChPos, message);
        Logger.error(this.name, e.message);
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
        this._currentStaff = this._currentTrack.staves[0];
        this._currentStaff.displayTranspositionPitch = -12;
        this._currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
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
            case 'tenor':
                return Clef.C3;
            case 'c4':
            case 'alto':
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
                return TripletFeel.NoTripletFeel;
            case 't16':
            case 'triplet-16th':
                return TripletFeel.Triplet16th;
            case 't8':
            case 'triplet-8th':
                return TripletFeel.Triplet8th;
            case 'd16':
            case 'dotted-16th':
                return TripletFeel.Dotted16th;
            case 'd8':
            case 'dotted-8th':
                return TripletFeel.Dotted8th;
            case 's16':
            case 'scottish-16th':
                return TripletFeel.Scottish16th;
            case 's8':
            case 'scottish-8th':
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
    private parseKeySignature(str: string): number {
        switch (str.toLowerCase()) {
            case 'cb':
                return -7;
            case 'gb':
                return -6;
            case 'db':
                return -5;
            case 'ab':
                return -4;
            case 'eb':
                return -3;
            case 'bb':
                return -2;
            case 'f':
                return -1;
            case 'c':
                return 0;
            case 'g':
                return 1;
            case 'd':
                return 2;
            case 'a':
                return 3;
            case 'e':
                return 4;
            case 'b':
                return 5;
            case 'f#':
                return 6;
            case 'c#':
                return 7;
            default:
                return 0;
            // error("keysignature-value", AlphaTexSymbols.String, false); return 0
        }
    }

    /**
     * Reads the next character of the source stream.
     */
    private nextChar(): number {
        let b: number = this.data.readByte();
        if (b === -1) {
            this._ch = 0;
        } else {
            this._ch = b;
            this._curChPos++;
        }
        return this._ch;
    }

    /**
     * Reads the next terminal symbol.
     */
    private newSy(): AlphaTexSymbols {
        this._sy = AlphaTexSymbols.No;
        do {
            if (this._ch === AlphaTexImporter.Eof) {
                this._sy = AlphaTexSymbols.Eof;
            } else if (this._ch === 0x20 || this._ch === 0x0b || this._ch === 0x0d || this._ch === 0x0a || this._ch === 0x09) {
                // skip whitespaces
                this._ch = this.nextChar();
            } else if (this._ch === 0x2f /* / */) {
                this._ch = this.nextChar();
                if (this._ch === 0x2f /* / */) {
                    // single line comment
                    while (
                        this._ch !== 0x0d /* \r */ &&
                        this._ch !== 0x0a /* \n */ &&
                        this._ch !== AlphaTexImporter.Eof
                    ) {
                        this._ch = this.nextChar();
                    }
                } else if (this._ch === 0x2a /* * */) {
                    // multiline comment
                    while (this._ch !== 0) {
                        if (this._ch === 0x2a /* * */) {
                            this._ch = this.nextChar();
                            if (this._ch === 0x2f /* / */) {
                                this._ch = this.nextChar();
                                break;
                            }
                        } else {
                            this._ch = this.nextChar();
                        }
                    }
                } else {
                    this.error('symbol', AlphaTexSymbols.String, false);
                }
            } else if (this._ch === 0x22 /* " */ || this._ch === 0x27 /* ' */) {
                let startChar: number = this._ch;
                this._ch = this.nextChar();
                let s: string = '';
                this._sy = AlphaTexSymbols.String;
                while (this._ch !== startChar && this._ch !== AlphaTexImporter.Eof) {
                    s += String.fromCharCode(this._ch);
                    this._ch = this.nextChar();
                }
                this._syData = s;
                this._ch = this.nextChar();
            } else if (this._ch === 0x2d /* - */) {
                // negative number
                // is number?
                if (this._allowNegatives && this.isDigit(this._ch)) {
                    let num: number = this.readNumber();
                    this._sy = AlphaTexSymbols.Number;
                    this._syData = num;
                } else {
                    this._sy = AlphaTexSymbols.String;
                    this._syData = this.readName();
                }
            } else if (this._ch === 0x2e /* . */) {
                this._sy = AlphaTexSymbols.Dot;
                this._ch = this.nextChar();
            } else if (this._ch === 0x3a /* : */) {
                this._sy = AlphaTexSymbols.DoubleDot;
                this._ch = this.nextChar();
            } else if (this._ch === 0x28 /* ( */) {
                this._sy = AlphaTexSymbols.LParensis;
                this._ch = this.nextChar();
            } else if (this._ch === 0x5c /* \ */) {
                this._ch = this.nextChar();
                let name: string = this.readName();
                this._sy = AlphaTexSymbols.MetaCommand;
                this._syData = name;
            } else if (this._ch === 0x29 /* ) */) {
                this._sy = AlphaTexSymbols.RParensis;
                this._ch = this.nextChar();
            } else if (this._ch === 0x7b /* { */) {
                this._sy = AlphaTexSymbols.LBrace;
                this._ch = this.nextChar();
            } else if (this._ch === 0x7d /* } */) {
                this._sy = AlphaTexSymbols.RBrace;
                this._ch = this.nextChar();
            } else if (this._ch === 0x7c /* | */) {
                this._sy = AlphaTexSymbols.Pipe;
                this._ch = this.nextChar();
            } else if (this._ch === 0x2a /* * */) {
                this._sy = AlphaTexSymbols.Multiply;
                this._ch = this.nextChar();
            } else if (this._ch === 0x3c /* < */) {
                this._sy = AlphaTexSymbols.LowerThan;
                this._ch = this.nextChar();
            } else if (this.isDigit(this._ch)) {
                let num: number = this.readNumber();
                this._sy = AlphaTexSymbols.Number;
                this._syData = num;
            } else if (AlphaTexImporter.isLetter(this._ch)) {
                let name: string = this.readName();
                let tuning: TuningParseResult | null = this._allowTuning ? ModelUtils.parseTuning(name) : null;
                if (tuning) {
                    this._sy = AlphaTexSymbols.Tuning;
                    this._syData = tuning;
                } else {
                    this._sy = AlphaTexSymbols.String;
                    this._syData = name;
                }
            } else {
                this.error('symbol', AlphaTexSymbols.String, false);
            }
        } while (this._sy === AlphaTexSymbols.No);
        return this._sy;
    }

    /**
     * Checks if the given character is a letter.
     * (no control characters, whitespaces, numbers or dots)
     * @param code the character
     * @returns true if the given character is a letter, otherwise false.
     */
    private static isLetter(code: number): boolean {
        // no control characters, whitespaces, numbers or dots
        return (
            !AlphaTexImporter.isTerminal(code) &&
            ((code >= 0x21 && code <= 0x2f) || (code >= 0x3a && code <= 0x7e) || code > 0x80)
        ); /* Unicode Symbols */
    }

    /**
     * Checks if the given charater is a non terminal.
     * @param ch the character
     * @returns true if the given character is a terminal, otherwise false.
     */
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
            ch === 0x5c /* \ */
        );
    }

    /**
     * Checks if the given character is a digit.
     * @param code the character
     * @returns true if the given character is a digit, otherwise false.
     */
    private isDigit(code: number): boolean {
        return (code >= 0x30 && code <= 0x39) /*0-9*/ || (code === 0x2d /* - */ && this._allowNegatives); // allow - if negatives
    }

    /**
     * Reads a string from the stream.
     * @returns the read string.
     */
    private readName(): string {
        let str: string = '';
        do {
            str += String.fromCharCode(this._ch);
            this._ch = this.nextChar();
        } while (AlphaTexImporter.isLetter(this._ch) || this.isDigit(this._ch) || this._ch === 0x23);
        return str;
    }

    /**
     * Reads a number from the stream.
     * @returns the read number.
     */
    private readNumber(): number {
        let str: string = '';
        do {
            str += String.fromCharCode(this._ch);
            this._ch = this.nextChar();
        } while (this.isDigit(this._ch));
        return parseInt(str);
    }

    private score(): void {
        if (this._sy === AlphaTexSymbols.Eof) {
            throw new UnsupportedFormatError('Unexpected end of file');
        }
        const anyMetaRead = this.metaData();
        const anyBarsRead = this.bars();
        if (!anyMetaRead && !anyBarsRead) {
            throw new UnsupportedFormatError('No alphaTex data found');
        }
    }

    private metaData(): boolean {
        let anyMeta: boolean = false;
        let continueReading: boolean = true;
        while (this._sy === AlphaTexSymbols.MetaCommand && continueReading) {
            let syData: string = (this._syData as string).toLowerCase();
            switch (syData) {
                case 'title':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._score.title = (this._syData as string);
                    } else {
                        this.error('title', AlphaTexSymbols.String, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                case 'subtitle':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._score.subTitle = (this._syData as string);
                    } else {
                        this.error('subtitle', AlphaTexSymbols.String, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                case 'artist':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._score.artist = (this._syData as string);
                    } else {
                        this.error('artist', AlphaTexSymbols.String, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                case 'album':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._score.album = (this._syData as string);
                    } else {
                        this.error('album', AlphaTexSymbols.String, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                case 'words':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._score.words = (this._syData as string);
                    } else {
                        this.error('words', AlphaTexSymbols.String, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                case 'music':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._score.music = (this._syData as string);
                    } else {
                        this.error('music', AlphaTexSymbols.String, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                case 'copyright':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.String) {
                        this._score.copyright = (this._syData as string);
                    } else {
                        this.error('copyright', AlphaTexSymbols.String, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                case 'tempo':
                    this._sy = this.newSy();
                    if (this._sy === AlphaTexSymbols.Number) {
                        this._score.tempo = this._syData as number;
                    } else {
                        this.error('tempo', AlphaTexSymbols.Number, true);
                    }
                    this._sy = this.newSy();
                    anyMeta = true;
                    break;
                default:
                    if (this.handleStaffMeta()) {
                        anyMeta = true;
                    } else if (anyMeta) {
                        // invalid meta encountered
                        this.error('metaDataTags', AlphaTexSymbols.String, false);
                    } else {
                        // fall forward to bar meta if unknown score meta was found
                        continueReading = false;
                    }
                    break;
            }
        }
        if (anyMeta) {
            if (this._sy !== AlphaTexSymbols.Dot) {
                this.error('song', AlphaTexSymbols.Dot, true);
            }
            this._sy = this.newSy();
        } else if (this._sy === AlphaTexSymbols.Dot) {
            this._sy = this.newSy();
        }

        return anyMeta;
    }

    private handleStaffMeta(): boolean {
        let syData: string = (this._syData as string).toLowerCase();
        switch (syData) {
            case 'capo':
                this._sy = this.newSy();
                if (this._sy === AlphaTexSymbols.Number) {
                    this._currentStaff.capo = this._syData as number;
                } else {
                    this.error('capo', AlphaTexSymbols.Number, true);
                }
                this._sy = this.newSy();
                return true;
            case 'tuning':
                this._sy = this.newSy();
                let strings: number = this._currentStaff.tuning.length;
                this._staffHasExplicitTuning = true;
                this._staffTuningApplied = false;
                switch (this._sy) {
                    case AlphaTexSymbols.String:
                        let text: string = (this._syData as string).toLowerCase();
                        if (text === 'piano' || text === 'none' || text === 'voice') {
                            // clear tuning
                            this._currentStaff.stringTuning.tunings = [];
                            this._currentStaff.displayTranspositionPitch = 0;
                        } else {
                            this.error('tuning', AlphaTexSymbols.Tuning, true);
                        }
                        this._sy = this.newSy();
                        break;
                    case AlphaTexSymbols.Tuning:
                        let tuning: number[] = [];
                        do {
                            let t: TuningParseResult = this._syData as TuningParseResult;
                            tuning.push(t.realValue);
                            this._sy = this.newSy();
                        } while (this._sy === AlphaTexSymbols.Tuning);
                        this._currentStaff.stringTuning.tunings = tuning;
                        break;
                    default:
                        this.error('tuning', AlphaTexSymbols.Tuning, true);
                        break;
                }
                if (strings !== this._currentStaff.tuning.length && this._currentStaff.chords.size > 0) {
                    this.errorMessage('Tuning must be defined before any chord');
                }
                return true;
            case 'instrument':
                this._sy = this.newSy();
                this._staffTuningApplied = false;
                if (this._sy === AlphaTexSymbols.Number) {
                    let instrument: number = this._syData as number;
                    if (instrument >= 0 && instrument <= 128) {
                        this._currentTrack.playbackInfo.program = this._syData as number;
                    } else {
                        this.error('instrument', AlphaTexSymbols.Number, false);
                    }
                } else if (this._sy === AlphaTexSymbols.String) {
                    let instrumentName: string = (this._syData as string).toLowerCase();
                    this._currentTrack.playbackInfo.program = GeneralMidi.getValue(instrumentName);
                } else {
                    this.error('instrument', AlphaTexSymbols.Number, true);
                }
                this._sy = this.newSy();
                return true;
            case 'lyrics':
                this._sy = this.newSy();
                let lyrics: Lyrics = new Lyrics();
                lyrics.startBar = 0;
                lyrics.text = '';
                if (this._sy === AlphaTexSymbols.Number) {
                    lyrics.startBar = this._syData as number;
                    this._sy = this.newSy();
                }
                if (this._sy === AlphaTexSymbols.String) {
                    lyrics.text = this._syData as string;
                    this._sy = this.newSy();
                } else {
                    this.error('lyrics', AlphaTexSymbols.String, true);
                }
                this._lyrics.get(this._currentTrack.index)!.push(lyrics);
                return true;
            case 'chord':
                this._sy = this.newSy();
                let chord: Chord = new Chord();
                this.chordProperties(chord);
                if (this._sy === AlphaTexSymbols.String) {
                    chord.name = this._syData as string;
                    this._sy = this.newSy();
                } else {
                    this.error('chord-name', AlphaTexSymbols.Number, true);
                }
                for (let i: number = 0; i < this._currentStaff.tuning.length; i++) {
                    if (this._sy === AlphaTexSymbols.Number) {
                        chord.strings.push(this._syData as number);
                    } else if (this._sy === AlphaTexSymbols.String && (this._syData as string).toLowerCase() === 'x') {
                        chord.strings.push(-1);
                    }
                    this._sy = this.newSy();
                }
                this._currentStaff.addChord(this.getChordId(this._currentStaff, chord.name), chord);
                return true;
            default:
                return false;
        }
    }

    private chordProperties(chord: Chord): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this.newSy();
        while (this._sy === AlphaTexSymbols.String) {
            switch ((this._syData as string).toLowerCase()) {
                case 'firstfret':
                    this._sy = this.newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.Number:
                            chord.firstFret = this._syData as number;
                            break;
                        default:
                            this.error('chord-firstfret', AlphaTexSymbols.Number, true);
                            break;
                    }
                    this._sy = this.newSy();
                    break;
                case 'showdiagram':
                    this._sy = this.newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.String:
                            chord.showDiagram = (this._syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showDiagram = (this._syData as number) !== 0;
                            break;
                        default:
                            this.error('chord-showdiagram', AlphaTexSymbols.String, true);
                            break;
                    }
                    this._sy = this.newSy();
                    break;
                case 'showfingering':
                    this._sy = this.newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.String:
                            chord.showDiagram = (this._syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showFingering = (this._syData as number) !== 0;
                            break;
                        default:
                            this.error('chord-showfingering', AlphaTexSymbols.String, true);
                            break;
                    }
                    this._sy = this.newSy();
                    break;
                case 'showname':
                    this._sy = this.newSy();
                    switch (this._sy) {
                        case AlphaTexSymbols.String:
                            chord.showName = (this._syData as string).toLowerCase() !== 'false';
                            break;
                        case AlphaTexSymbols.Number:
                            chord.showName = (this._syData as number) !== 0;
                            break;
                        default:
                            this.error('chord-showname', AlphaTexSymbols.String, true);
                            break;
                    }
                    this._sy = this.newSy();
                    break;
                case 'barre':
                    this._sy = this.newSy();
                    while (this._sy === AlphaTexSymbols.Number) {
                        chord.barreFrets.push(this._syData as number);
                        this._sy = this.newSy();
                    }
                    break;
                default:
                    this.error('chord-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this.error('chord-properties', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this.newSy();
    }

    private bars(): boolean {
        let anyData = this.bar();
        while (this._sy !== AlphaTexSymbols.Eof) {
            // read pipe from last bar
            if (this._sy === AlphaTexSymbols.Pipe) {
                this._sy = this.newSy();
                this.bar();
            } else if (this._sy === AlphaTexSymbols.MetaCommand) {
                this.bar();
            } else {
                break;
            }
        }
        return anyData;
    }

    private trackStaffMeta(): boolean {
        let anyMeta = false;
        if (this._sy === AlphaTexSymbols.MetaCommand) {
            anyMeta = true;
            let syData: string = (this._syData as string).toLowerCase();
            if (syData === 'track') {
                this._staffHasExplicitTuning = false;
                this._staffTuningApplied = false;        

                this._sy = this.newSy();
                // new track starting? - if no masterbars it's the \track of the initial track.
                if (this._score.masterBars.length > 0) {
                    this.newTrack();
                }
                // name
                if (this._sy === AlphaTexSymbols.String) {
                    this._currentTrack.name = (this._syData as string);
                    this._sy = this.newSy();
                }
                // short name
                if (this._sy === AlphaTexSymbols.String) {
                    this._currentTrack.shortName = (this._syData as string);
                    this._sy = this.newSy();
                }
            }
            if (this._sy === AlphaTexSymbols.MetaCommand) {
                syData = (this._syData as string).toLowerCase();
                if (syData === 'staff') {
                    this._staffHasExplicitTuning = false;
                    this._staffTuningApplied = false;
    
                    this._sy = this.newSy();
                    if (this._currentTrack.staves[0].bars.length > 0) {
                        this._currentTrack.ensureStaveCount(this._currentTrack.staves.length + 1);
                        this._currentStaff = this._currentTrack.staves[this._currentTrack.staves.length - 1];
                        this._currentDynamics = DynamicValue.F;
                    }
                    this.staffProperties();
                }
            }
        }
        return anyMeta;
    }

    private staffProperties(): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this.newSy();
        let showStandardNotation: boolean = false;
        let showTabs: boolean = false;
        while (this._sy === AlphaTexSymbols.String) {
            switch ((this._syData as string).toLowerCase()) {
                case 'score':
                    showStandardNotation = true;
                    this._sy = this.newSy();
                    break;
                case 'tabs':
                    showTabs = true;
                    this._sy = this.newSy();
                    break;
                default:
                    this.error('staff-properties', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (showStandardNotation || showTabs) {
            this._currentStaff.showStandardNotation = showStandardNotation;
            this._currentStaff.showTablature = showTabs;
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this.error('staff-properties', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this.newSy();
    }

    private bar(): boolean {
        const anyStaffMeta = this.trackStaffMeta();
        let bar: Bar = this.newBar(this._currentStaff);
        if (this._currentStaff.bars.length > this._score.masterBars.length) {
            let master: MasterBar = new MasterBar();
            this._score.addMasterBar(master);
            if (master.index > 0) {
                master.keySignature = master.previousMasterBar!.keySignature;
                master.keySignatureType = master.previousMasterBar!.keySignatureType;
                master.timeSignatureDenominator = master.previousMasterBar!.timeSignatureDenominator;
                master.timeSignatureNumerator = master.previousMasterBar!.timeSignatureNumerator;
                master.tripletFeel = master.previousMasterBar!.tripletFeel;
            }
        }
        const anyBarMeta = this.barMeta(bar);

        // detect tuning for staff
        if (!this._staffTuningApplied && !this._staffHasExplicitTuning) {
            const program = this._currentTrack.playbackInfo.program;

            // reset to defaults
            this._currentStaff.displayTranspositionPitch = 0;
            this._currentStaff.stringTuning.tunings = [];


            if (program == 15 || program >= 24 && program <= 31) {
                // dulcimer+guitar E4 B3 G3 D3 A2 E2
                this._currentStaff.displayTranspositionPitch = -12;
                this._currentStaff.stringTuning.tunings = Tuning.getDefaultTuningFor(6)!.tunings;
            } else if (program >= 32 && program <= 39) {
                // bass G2 D2 A1 E1
                this._currentStaff.displayTranspositionPitch = -12;
                this._currentStaff.stringTuning.tunings = [43, 38, 33, 28];
            } else if (program == 40 || program == 44 || program == 45 || program == 48 || program == 49 || program == 50 || program == 51) {
                // violin E3 A3 D3 G2
                this._currentStaff.stringTuning.tunings = [52, 57, 50, 43];
            } else if (program == 41) {
                // viola A3 D3 G2 C2
                this._currentStaff.stringTuning.tunings = [57, 50, 43, 36];
            } else if (program == 42) {
                // cello A2 D2 G1 C1
                this._currentStaff.stringTuning.tunings = [45, 38, 31, 24];
            } else if (program == 43) {
                // contrabass
                // G2 D2 A1 E1
                this._currentStaff.displayTranspositionPitch = -12;
                this._currentStaff.stringTuning.tunings = [43, 38, 33, 28];
            } else if (program == 105) {
                // banjo
                // D3 B2 G2 D2 G3
                this._currentStaff.stringTuning.tunings = [50, 47, 43, 38, 55];
            } else if (program == 106) {
                // shamisen
                // A3 E3 A2
                this._currentStaff.stringTuning.tunings = [57, 52, 45];
            } else if (program == 107) {
                // koto
                // E3 A2 D2 G1
                this._currentStaff.stringTuning.tunings = [52, 45, 38, 31];
            } else if (program == 110) {
                // Fiddle
                // E4 A3 D3 G2
                this._currentStaff.stringTuning.tunings = [64, 57, 50, 43];
            }

            this._staffTuningApplied = true;
        }

        let anyBeatData = false;
        let voice: Voice = bar.voices[0];
        while (this._sy !== AlphaTexSymbols.Pipe && this._sy !== AlphaTexSymbols.Eof) {
            if (!this.beat(voice)) {
                break;
            }
            anyBeatData = true;
        }
        if (voice.beats.length === 0) {
            let emptyBeat: Beat = new Beat();
            emptyBeat.isEmpty = true;
            voice.addBeat(emptyBeat);
        }

        return anyStaffMeta || anyBarMeta || anyBeatData;
    }

    private newBar(staff: Staff): Bar {
        let bar: Bar = new Bar();
        staff.addBar(bar);
        if (bar.index > 0) {
            bar.clef = bar.previousBar!.clef;
        }
        let voice: Voice = new Voice();
        bar.addVoice(voice);
        return bar;
    }

    private beat(voice: Voice): boolean {
        // duration specifier?
        this.beatDuration();
        let beat: Beat = new Beat();
        voice.addBeat(beat);
        // notes
        if (this._sy === AlphaTexSymbols.LParensis) {
            this._sy = this.newSy();
            this.note(beat);
            while (this._sy !== AlphaTexSymbols.RParensis && this._sy !== AlphaTexSymbols.Eof) {
                if (!this.note(beat)) {
                    break;
                }
            }
            if (this._sy !== AlphaTexSymbols.RParensis) {
                this.error('note-list', AlphaTexSymbols.RParensis, true);
            }
            this._sy = this.newSy();
        } else if (this._sy === AlphaTexSymbols.String && (this._syData as string).toLowerCase() === 'r') {
            // rest voice -> no notes
            this._sy = this.newSy();
        } else {
            if (!this.note(beat)) {
                voice.beats.splice(voice.beats.length - 1, 1);
                return false;
            }
        }
        // new duration
        if (this._sy === AlphaTexSymbols.Dot) {
            this._allowNegatives = true;
            this._sy = this.newSy();
            this._allowNegatives = false;
            if (this._sy !== AlphaTexSymbols.Number) {
                this.error('duration', AlphaTexSymbols.Number, true);
            }
            this._currentDuration = this.parseDuration(this._syData as number);
            this._sy = this.newSy();
        }
        beat.duration = this._currentDuration;
        beat.dynamics = this._currentDynamics;
        if (this._currentTuplet !== 1 && !beat.hasTuplet) {
            this.applyTuplet(beat, this._currentTuplet);
        }
        // beat multiplier (repeat beat n times)
        let beatRepeat: number = 1;
        if (this._sy === AlphaTexSymbols.Multiply) {
            this._sy = this.newSy();
            // multiplier count
            if (this._sy !== AlphaTexSymbols.Number) {
                this.error('multiplier', AlphaTexSymbols.Number, true);
            } else {
                beatRepeat = this._syData as number;
            }
            this._sy = this.newSy();
        }
        this.beatEffects(beat);
        for (let i: number = 0; i < beatRepeat - 1; i++) {
            voice.addBeat(BeatCloner.clone(beat));
        }
        return true;
    }

    private beatDuration(): void {
        if (this._sy !== AlphaTexSymbols.DoubleDot) {
            return;
        }
        this._allowNegatives = true;
        this._sy = this.newSy();
        this._allowNegatives = false;
        if (this._sy !== AlphaTexSymbols.Number) {
            this.error('duration', AlphaTexSymbols.Number, true);
        }
        this._currentDuration = this.parseDuration(this._syData as number);
        this._currentTuplet = 1;
        this._sy = this.newSy();
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this.newSy();
        while (this._sy === AlphaTexSymbols.String) {
            let effect: string = (this._syData as string).toLowerCase();
            switch (effect) {
                case 'tu':
                    this._sy = this.newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this.error('duration-tuplet', AlphaTexSymbols.Number, true);
                    }
                    this._currentTuplet = this._syData as number;
                    this._sy = this.newSy();
                    break;
                default:
                    this.error('beat-duration', AlphaTexSymbols.String, false);
                    break;
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this.error('beat-duration', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this.newSy();
    }

    private beatEffects(beat: Beat): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this.newSy();
        while (this._sy === AlphaTexSymbols.String) {
            this._syData = (this._syData as string).toLowerCase();
            if (!this.applyBeatEffect(beat)) {
                this.error('beat-effects', AlphaTexSymbols.String, false);
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this.error('beat-effects', AlphaTexSymbols.RBrace, true);
        }
        this._sy = this.newSy();
    }

    /**
     * Tries to apply a beat effect to the given beat.
     * @returns true if a effect could be applied, otherwise false
     */
    private applyBeatEffect(beat: Beat): boolean {
        let syData: string = (this._syData as string).toLowerCase();
        if (syData === 'f') {
            beat.fadeIn = true;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'v') {
            beat.vibrato = VibratoType.Slight;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 's') {
            beat.slap = true;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'p') {
            beat.pop = true;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'tt') {
            beat.tap = true;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'dd') {
            beat.dots = 2;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'd') {
            beat.dots = 1;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'su') {
            beat.pickStroke = PickStroke.Up;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'sd') {
            beat.pickStroke = PickStroke.Down;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'tu') {
            this._sy = this.newSy();
            if (this._sy !== AlphaTexSymbols.Number) {
                this.error('tuplet', AlphaTexSymbols.Number, true);
                return false;
            }
            this.applyTuplet(beat, this._syData as number);
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'tb' || syData === 'tbe') {
            let exact: boolean = syData === 'tbe';
            // read points
            this._sy = this.newSy();
            if (this._sy !== AlphaTexSymbols.LParensis) {
                this.error('tremolobar-effect', AlphaTexSymbols.LParensis, true);
                return false;
            }
            this._allowNegatives = true;
            this._sy = this.newSy();
            while (this._sy !== AlphaTexSymbols.RParensis && this._sy !== AlphaTexSymbols.Eof) {
                let offset: number = 0;
                let value: number = 0;
                if (exact) {
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this.error('tremolobar-effect', AlphaTexSymbols.Number, true);
                        return false;
                    }
                    offset = this._syData as number;
                    this._sy = this.newSy();
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this.error('tremolobar-effect', AlphaTexSymbols.Number, true);
                        return false;
                    }
                    value = this._syData as number;
                } else {
                    if (this._sy !== AlphaTexSymbols.Number) {
                        this.error('tremolobar-effect', AlphaTexSymbols.Number, true);
                        return false;
                    }
                    offset = 0;
                    value = this._syData as number;
                }
                beat.addWhammyBarPoint(new BendPoint(offset, value));
                this._sy = this.newSy();
            }
            while (beat.whammyBarPoints.length > 60) {
                beat.removeWhammyBarPoint(beat.whammyBarPoints.length - 1);
            }
            // set positions
            if (!exact) {
                let count: number = beat.whammyBarPoints.length;
                let step: number = (60 / count) | 0;
                let i: number = 0;
                while (i < count) {
                    beat.whammyBarPoints[i].offset = Math.min(60, i * step);
                    i++;
                }
            } else {
                beat.whammyBarPoints.sort((a, b) => {
                    return a.offset - b.offset;
                });
            }
            this._allowNegatives = false;
            if (this._sy !== AlphaTexSymbols.RParensis) {
                this.error('tremolobar-effect', AlphaTexSymbols.RParensis, true);
                return false;
            }
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'ch') {
            this._sy = this.newSy();
            let chordName: string = (this._syData as string);
            let chordId: string = this.getChordId(this._currentStaff, chordName);
            if (!this._currentStaff.chords.has(chordId)) {
                let chord: Chord = new Chord();
                chord.showDiagram = false;
                chord.name = chordName;
                this._currentStaff.addChord(chordId, chord);
            }
            beat.chordId = chordId;
            this._sy = this.newSy();
            return true;
        }
        if (syData === 'gr') {
            this._sy = this.newSy();
            if ((this._syData as string).toLowerCase() === 'ob') {
                beat.graceType = GraceType.OnBeat;
                this._sy = this.newSy();
            } else if ((this._syData as string).toLowerCase() === 'b') {
                beat.graceType = GraceType.BendGrace;
                this._sy = this.newSy();
            } else {
                beat.graceType = GraceType.BeforeBeat;
            }
            return true;
        }
        if (syData === 'dy') {
            this.newSy();
            switch ((this._syData as string).toLowerCase()) {
                case 'ppp':
                    beat.dynamics = DynamicValue.PPP;
                    break;
                case 'pp':
                    beat.dynamics = DynamicValue.PP;
                    break;
                case 'p':
                    beat.dynamics = DynamicValue.P;
                    break;
                case 'mp':
                    beat.dynamics = DynamicValue.MP;
                    break;
                case 'mf':
                    beat.dynamics = DynamicValue.MF;
                    break;
                case 'f':
                    beat.dynamics = DynamicValue.F;
                    break;
                case 'ff':
                    beat.dynamics = DynamicValue.FF;
                    break;
                case 'fff':
                    beat.dynamics = DynamicValue.FFF;
                    break;
            }
            this._currentDynamics = beat.dynamics;
            this.newSy();
            return true;
        }
        if (syData === 'cre') {
            beat.crescendo = CrescendoType.Crescendo;
            this.newSy();
            return true;
        }
        if (syData === 'dec') {
            beat.crescendo = CrescendoType.Decrescendo;
            this.newSy();
            return true;
        }
        if (syData === 'tp') {
            this._sy = this.newSy();
            let duration: Duration = Duration.Eighth;
            if (this._sy === AlphaTexSymbols.Number) {
                switch (this._syData as number) {
                    case 8:
                        duration = Duration.Eighth;
                        break;
                    case 16:
                        duration = Duration.Sixteenth;
                        break;
                    case 32:
                        duration = Duration.ThirtySecond;
                        break;
                    default:
                        duration = Duration.Eighth;
                        break;
                }
                this._sy = this.newSy();
            }
            beat.tremoloSpeed = duration;
            return true;
        }
        return false;
    }

    private getChordId(currentStaff: Staff, chordName: string): string {
        return chordName.toLowerCase() + currentStaff.index + currentStaff.track.index
    }

    private applyTuplet(beat: Beat, tuplet: number): void {
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

    private note(beat: Beat): boolean {
        // fret.string
        let isDead: boolean = false;
        let isTie: boolean = false;
        let fret: number = -1;
        let octave: number = -1;
        let tone: number = -1;
        switch (this._sy) {
            case AlphaTexSymbols.Number:
                fret = this._syData as number;
                break;
            case AlphaTexSymbols.String:
                isDead = (this._syData as string) === 'x';
                isTie = (this._syData as string) === '-';

                if (isTie || isDead) {
                    fret = 0;
                } else {
                    this.error('note-fret', AlphaTexSymbols.Number, true);
                }
                break;
            case AlphaTexSymbols.Tuning:
                let tuning: TuningParseResult = this._syData as TuningParseResult;
                octave = tuning.octave;
                tone = tuning.noteValue;
                break;
            default:
                return false;
        }
        this._sy = this.newSy(); // Fret done

        let isFretted: boolean = octave === -1 && this._currentStaff.tuning.length > 0;
        let noteString: number = -1;
        if (isFretted) {
            // Fret [Dot] String
            if (this._sy !== AlphaTexSymbols.Dot) {
                this.error('note', AlphaTexSymbols.Dot, true);
            }
            this._sy = this.newSy(); // dot done

            if (this._sy !== AlphaTexSymbols.Number) {
                this.error('note-string', AlphaTexSymbols.Number, true);
            }
            noteString = this._syData as number;
            if (noteString < 1 || noteString > this._currentStaff.tuning.length) {
                this.error('note-string', AlphaTexSymbols.Number, false);
            }
            this._sy = this.newSy(); // string done
        }
        // read effects
        let note: Note = new Note();
        if (isFretted) {
            note.string = this._currentStaff.tuning.length - (noteString - 1);
            note.isDead = isDead;
            note.isTieDestination = isTie;
            if (!isTie) {
                note.fret = fret;
            }
        } else {
            note.octave = octave;
            note.tone = tone;
            note.isTieDestination = isTie;
        }
        beat.addNote(note);
        this.noteEffects(note);
        return true;
    }

    private noteEffects(note: Note): void {
        if (this._sy !== AlphaTexSymbols.LBrace) {
            return;
        }
        this._sy = this.newSy();
        while (this._sy === AlphaTexSymbols.String) {
            let syData: string = (this._syData as string).toLowerCase();
            this._syData = syData;
            if (syData === 'b' || syData === 'be') {
                let exact: boolean = (this._syData as string) === 'be';
                // read points
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.LParensis) {
                    this.error('bend-effect', AlphaTexSymbols.LParensis, true);
                }
                this._sy = this.newSy();
                while (this._sy !== AlphaTexSymbols.RParensis && this._sy !== AlphaTexSymbols.Eof) {
                    let offset: number = 0;
                    let value: number = 0;
                    if (exact) {
                        if (this._sy !== AlphaTexSymbols.Number) {
                            this.error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        offset = this._syData as number;
                        this._sy = this.newSy();
                        if (this._sy !== AlphaTexSymbols.Number) {
                            this.error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        value = this._syData as number;
                    } else {
                        if (this._sy !== AlphaTexSymbols.Number) {
                            this.error('bend-effect-value', AlphaTexSymbols.Number, true);
                        }
                        value = this._syData as number;
                    }
                    note.addBendPoint(new BendPoint(offset, value));
                    this._sy = this.newSy();
                }
                while (note.bendPoints.length > 60) {
                    note.bendPoints.splice(note.bendPoints.length - 1, 1);
                }
                // set positions
                if (exact) {
                    note.bendPoints.sort((a, b) => {
                        return a.offset - b.offset;
                    });
                } else {
                    let count: number = note.bendPoints.length;
                    let step: number = (60 / (count - 1)) | 0;
                    let i: number = 0;
                    while (i < count) {
                        note.bendPoints[i].offset = Math.min(60, i * step);
                        i++;
                    }
                }
                if (this._sy !== AlphaTexSymbols.RParensis) {
                    this.error('bend-effect', AlphaTexSymbols.RParensis, true);
                }
                this._sy = this.newSy();
            } else if (syData === 'nh') {
                note.harmonicType = HarmonicType.Natural;
                this._sy = this.newSy();
            } else if (syData === 'ah') {
                // todo: Artificial Key
                note.harmonicType = HarmonicType.Artificial;
                this._sy = this.newSy();
            } else if (syData === 'th') {
                // todo: store tapped fret in data
                note.harmonicType = HarmonicType.Tap;
                this._sy = this.newSy();
            } else if (syData === 'ph') {
                note.harmonicType = HarmonicType.Pinch;
                this._sy = this.newSy();
            } else if (syData === 'sh') {
                note.harmonicType = HarmonicType.Semi;
                this._sy = this.newSy();
            } else if (syData === 'tr') {
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this.error('trill-effect', AlphaTexSymbols.Number, true);
                }
                let fret: number = this._syData as number;
                this._sy = this.newSy();
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
                    this._sy = this.newSy();
                }
                note.trillValue = fret + note.stringTuning;
                note.trillSpeed = duration;
            } else if (syData === 'v') {
                this._sy = this.newSy();
                note.vibrato = VibratoType.Slight;
            } else if (syData === 'sl') {
                this._sy = this.newSy();
                note.slideOutType = SlideOutType.Legato;
            } else if (syData === 'ss') {
                this._sy = this.newSy();
                note.slideOutType = SlideOutType.Shift;
            } else if (syData === 'sib') {
                this._sy = this.newSy();
                note.slideInType = SlideInType.IntoFromBelow;
            } else if (syData === 'sia') {
                this._sy = this.newSy();
                note.slideInType = SlideInType.IntoFromAbove;
            } else if (syData === 'sou') {
                this._sy = this.newSy();
                note.slideOutType = SlideOutType.OutUp;
            } else if (syData === 'sod') {
                this._sy = this.newSy();
                note.slideOutType = SlideOutType.OutDown;
            } else if (syData === 'psd') {
                this._sy = this.newSy();
                note.slideOutType = SlideOutType.PickSlideDown;
            } else if (syData === 'psu') {
                this._sy = this.newSy();
                note.slideOutType = SlideOutType.PickSlideUp;
            } else if (syData === 'h') {
                this._sy = this.newSy();
                note.isHammerPullOrigin = true;
            } else if (syData === 'lht') {
                this._sy = this.newSy();
                note.isLeftHandTapped = true;
            } else if (syData === 'g') {
                this._sy = this.newSy();
                note.isGhost = true;
            } else if (syData === 'ac') {
                this._sy = this.newSy();
                note.accentuated = AccentuationType.Normal;
            } else if (syData === 'hac') {
                this._sy = this.newSy();
                note.accentuated = AccentuationType.Heavy;
            } else if (syData === 'pm') {
                this._sy = this.newSy();
                note.isPalmMute = true;
            } else if (syData === 'st') {
                this._sy = this.newSy();
                note.isStaccato = true;
            } else if (syData === 'lr') {
                this._sy = this.newSy();
                note.isLetRing = true;
            } else if (syData === 'x') {
                this._sy = this.newSy();
                note.fret = 0;
                note.isDead = true;
            } else if (syData === '-' || syData === 't') {
                this._sy = this.newSy();
                note.isTieDestination = true;
            } else if (syData === 'lf') {
                this._sy = this.newSy();
                let finger: Fingers = Fingers.Thumb;
                if (this._sy === AlphaTexSymbols.Number) {
                    finger = this.toFinger(this._syData as number);
                    this._sy = this.newSy();
                }
                note.leftHandFinger = finger;
            } else if (syData === 'rf') {
                this._sy = this.newSy();
                let finger: Fingers = Fingers.Thumb;
                if (this._sy === AlphaTexSymbols.Number) {
                    finger = this.toFinger(this._syData as number);
                    this._sy = this.newSy();
                }
                note.rightHandFinger = finger;
            } else if (this.applyBeatEffect(note.beat)) {
                // Success
            } else {
                this.error(syData, AlphaTexSymbols.String, false);
            }
        }
        if (this._sy !== AlphaTexSymbols.RBrace) {
            this.error('note-effect', AlphaTexSymbols.RBrace, false);
        }
        this._sy = this.newSy();
    }

    private toFinger(syData: number): Fingers {
        switch (syData) {
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
            default:
                return Duration.Quarter;
        }
    }

    private barMeta(bar: Bar): boolean {
        let anyMeta = false;
        let master: MasterBar = bar.masterBar;
        while (this._sy === AlphaTexSymbols.MetaCommand) {
            anyMeta = true;
            let syData: string = (this._syData as string).toLowerCase();
            if (syData === 'ts') {
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this.error('timesignature-numerator', AlphaTexSymbols.Number, true);
                }
                master.timeSignatureNumerator = this._syData as number;
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this.error('timesignature-denominator', AlphaTexSymbols.Number, true);
                }
                master.timeSignatureDenominator = this._syData as number;
                this._sy = this.newSy();
            } else if (syData === 'ro') {
                master.isRepeatStart = true;
                this._sy = this.newSy();
            } else if (syData === 'rc') {
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this.error('repeatclose', AlphaTexSymbols.Number, true);
                }
                master.repeatCount = this._syData as number;
                this._sy = this.newSy();
            } else if (syData === 'ks') {
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.String) {
                    this.error('keysignature', AlphaTexSymbols.String, true);
                }
                master.keySignature = this.parseKeySignature((this._syData as string).toLowerCase()) as KeySignature;
                this._sy = this.newSy();
            } else if (syData === 'clef') {
                this._sy = this.newSy();
                switch (this._sy) {
                    case AlphaTexSymbols.String:
                        bar.clef = this.parseClefFromString((this._syData as string).toLowerCase());
                        break;
                    case AlphaTexSymbols.Number:
                        bar.clef = this.parseClefFromInt(this._syData as number);
                        break;
                    case AlphaTexSymbols.Tuning:
                        let parseResult: TuningParseResult = this._syData as TuningParseResult;
                        bar.clef = this.parseClefFromInt(parseResult.realValue);
                        break;
                    default:
                        this.error('clef', AlphaTexSymbols.String, true);
                        break;
                }
                this._sy = this.newSy();
            } else if (syData === 'tempo') {
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.Number) {
                    this.error('tempo', AlphaTexSymbols.Number, true);
                }
                let tempoAutomation: Automation = new Automation();
                tempoAutomation.isLinear = false;
                tempoAutomation.type = AutomationType.Tempo;
                tempoAutomation.value = this._syData as number;
                master.tempoAutomation = tempoAutomation;
                this._sy = this.newSy();
            } else if (syData === 'section') {
                this._sy = this.newSy();
                if (this._sy !== AlphaTexSymbols.String) {
                    this.error('section', AlphaTexSymbols.String, true);
                }
                let text: string = this._syData as string;
                this._sy = this.newSy();
                let marker: string = '';
                if (this._sy === AlphaTexSymbols.String) {
                    marker = text;
                    text = this._syData as string;
                    this._sy = this.newSy();
                }
                let section: Section = new Section();
                section.marker = marker;
                section.text = text;
                master.section = section;
            } else if (syData === 'tf') {
                this._allowTuning = false;
                this._sy = this.newSy();
                this._allowTuning = true;
                switch (this._sy) {
                    case AlphaTexSymbols.String:
                        master.tripletFeel = this.parseTripletFeelFromString((this._syData as string).toLowerCase());
                        break;
                    case AlphaTexSymbols.Number:
                        master.tripletFeel = this.parseTripletFeelFromInt(this._syData as number);
                        break;
                    default:
                        this.error('triplet-feel', AlphaTexSymbols.String, true);
                        break;
                }
                this._sy = this.newSy();
            } else if (syData === 'ac') {
                master.isAnacrusis = true;
                this._sy = this.newSy();
            } else {
                if (bar.index === 0 && !this.handleStaffMeta()) {
                    this.error('measure-effects', AlphaTexSymbols.String, false);
                }
            }
        }

        if (master.index === 0 && !master.tempoAutomation) {
            let tempoAutomation: Automation = new Automation();
            tempoAutomation.isLinear = false;
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = this._score.tempo;
            master.tempoAutomation = tempoAutomation;
        }
        return anyMeta;
    }
}
