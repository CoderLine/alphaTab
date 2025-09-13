import { IOHelper } from '@src/io/IOHelper';
import { Queue } from '@src/synth/ds/Queue';
import {
    type AlphaTexAstNode,
    type AlphaTexAstNodeLocation,
    type AlphaTexBarNode,
    type AlphaTexBeatDurationChangeNode,
    type AlphaTexBeatNode,
    type AlphaTexComment,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataTagNode,
    type AlphaTexMetaDataWithPropertiesNode,
    AlphaTexNodeType,
    type AlphaTexNoteListNode,
    type AlphaTexNoteNode,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertiesNode,
    type AlphaTexPropertyNode,
    type AlphaTexScoreNode,
    type AlphaTexStringLiteral,
    type AlphaTexTokenNode,
    type AlphaTexValueList
} from './AlphaTexAst';

/**
 * The different severity levels for diagnostics parsing alphaTex.
 */
export enum AlphaTexDiagnosticsSeverity {
    Hint,
    Warning,
    Error
}

/**
 * A diagnostics message for the alphaTex parser.
 */
export interface AlphaTexDiagnostics {
    /**
     * The severity of the diagnostic.
     */
    severity: AlphaTexDiagnosticsSeverity;

    /**
     * The start location to which the diagnostic message belongs.
     */
    start?: AlphaTexAstNodeLocation;

    /**
     * The end location to which the diagnostic message belongs.
     */
    end?: AlphaTexAstNodeLocation;

    /**
     * A technical code describing the diagnostic message.
     */
    code: AlphaTexDiagnosticCode;

    /**
     * The textual message for the diagnostic.
     */
    message: string;
}

export enum AlphaTexDiagnosticCode {
    // 000 - 100 Lexer
    // 000 - 200 Parser

    /**
     * Unexpected character at comment start, expected '//' or '/*' but found '/%s'.
     */
    AT001 = 1,

    /**
     * Missing identifier after meta data start.
     */
    AT002 = 2,

    /**
     * Unexpected end of file. Need 4 hex characters on a \uXXXX escape sequence.
     */
    AT003 = 3,

    /**
     * Invalid unicode value. Need 4 hex characters on a \uXXXX escape sequence.
     */
    AT004 = 4,

    /**
     * Unsupported escape sequence. Expected '\n', '\r', '\t', or '\uXXXX' but found '\%s'.
     */
    AT005 = 5,

    /**
     * Unexpected end of file. String not closed.
     */
    AT006 = 6,

    /**
     * Expected a '.' separating the score meta data tags and the bars.
     */
    AT100 = 100,

    /**
     * Missing beat multiplier value after '*'.
     */
    AT101 = 101,

    /**
     * Missing duration value after ':'.
     */
    AT102 = 102,

    /**
     * Unexpected '%s' token. Expected a '\sync' meta data tag.
     */
    AT103 = 103,

    /**
     * Unexpected meta data tag '%s'. Expected a '\sync' meta data tag.
     */
    AT104 = 104,

    /**
     * Unexpected '%s' token. Expected one of following: %s
     */
    AT105 = 105
}

export class AlphaTexLexer {
    private static readonly Eof: number = 0;

    private _codepoints: number[];
    private _codepoint: number = AlphaTexLexer.Eof;

    private _offset: number = 0;
    private _line: number = 1;
    private _col: number = 1;

    private _fatalError = false;

    private _tokenStart: AlphaTexAstNodeLocation = { line: 0, col: 0, offset: 0 };
    private _comments: AlphaTexComment[] | undefined;
    private _tokenQueue: Queue<AlphaTexAstNode> = new Queue<AlphaTexAstNode>();

    public diagnostics: AlphaTexDiagnostics[] = [];

    public constructor(input: string) {
        this._codepoints = [...IOHelper.iterateCodepoints(input)];
        this._offset = 0;
        this._line = 1;
        this._col = 1;
        this._codepoint = this._codepoints.length > 0 ? this._codepoints[0] : AlphaTexLexer.Eof;
    }

    public get canRead() {
        return !this._fatalError && (!this._tokenQueue.isEmpty || this._offset < this._codepoints.length);
    }

    public peekToken(): AlphaTexAstNode | undefined {
        if (this._fatalError) {
            return undefined;
        }

        if (this._tokenQueue.isEmpty) {
            const token = this.readToken();
            if (!token) {
                return token;
            }
            this._tokenQueue.enqueue(token);
            return token;
        }

        return this._tokenQueue.peek();
    }

    public nextTokenWithFloats(): AlphaTexAstNode | undefined {
        // float number tokenizing is a bit tricky in alphaTex
        // we chose <fret>.<string>.<duration> (or <fret>.<string>) as
        // syntax for fretted notes, this conflicts now with a context
        // independent tokenization.

        // It would be a good idea to check for 3.3.3 patterns here
        // and then handle the numbers as individual ones? as for now we
        // use "nextTokenAsFloat" at dedicated areas when parsing.

        const start = this.nextToken();
        if (!start) {
            return undefined;
        }
        if (start.nodeType !== AlphaTexNodeType.NumberLiteral) {
            return start;
        }

        const floatSeparator = this.peekToken();
        // integer number
        if (
            !floatSeparator ||
            floatSeparator.nodeType !== AlphaTexNodeType.DotToken ||
            floatSeparator.start!.offset !== start.end!.offset
        ) {
            return start;
        }
        this.nextToken(); // consume dot

        const fractional = this.peekToken();
        if (
            // 1 at end
            !fractional ||
            // 1 . 1
            fractional.start!.offset !== floatSeparator.end!.offset + 1 ||
            // 1.1a
            fractional.nodeType !== AlphaTexNodeType.NumberLiteral ||
            // -1.-1
            (fractional as AlphaTexNumberLiteral).value < 0
        ) {
            this._tokenQueue.enqueueFront(floatSeparator);
            return start;
        }
        this.nextToken(); // consume fraction

        const floatNumber: AlphaTexNumberLiteral = {
            nodeType: AlphaTexNodeType.NumberLiteral,
            start: start.start,
            end: fractional.end,
            comments: start.comments,
            value: Number.parseFloat(
                String.fromCodePoint(...this._codepoints.slice(start.start!.offset, fractional.end!.offset))
            )
        };

        return floatNumber;
    }

    public nextToken(): AlphaTexAstNode | undefined {
        if (this._fatalError) {
            return undefined;
        }

        if (this._tokenQueue.isEmpty) {
            return this.readToken();
        }
        return this._tokenQueue.dequeue();
    }

    private nextCodepoint(): number {
        if (this._offset < this._codepoints.length - 1) {
            ++this._offset;
            this._codepoint = this._codepoints[this._offset];
            if (this._codepoint === 0x0a) {
                this._line++;
                this._col = 1;
            } else {
                this._col++;
            }
        } else if (this._codepoint !== AlphaTexLexer.Eof) {
            this._codepoint = AlphaTexLexer.Eof;
            this._col++;
            this._offset = this._codepoints.length;
        }
        return this._codepoint;
    }

    public currentTokenLocation(): AlphaTexAstNodeLocation {
        return this._tokenQueue.peek()?.start ?? this.currentLexerLocation();
    }

    private currentLexerLocation(): AlphaTexAstNodeLocation {
        return {
            line: this._line,
            col: this._col,
            offset: this._offset
        };
    }

    private readToken(): AlphaTexAstNode | undefined {
        this._comments = undefined;

        while (this._codepoint !== AlphaTexLexer.Eof) {
            this._tokenStart = this.currentLexerLocation();
            if (AlphaTexLexer.terminalTokens.has(this._codepoint)) {
                const token = AlphaTexLexer.terminalTokens.get(this._codepoint)!(this);
                if (token) {
                    return token;
                }
            } else if (AlphaTexLexer.isIdentifierCharacter(this._codepoint)) {
                return this.numberOrIdentifier();
            } else {
                // simply skip unknown characters
                // there are only a few ascii control characters
                // which can hit this path
                this._codepoint = this.nextCodepoint();
            }
        }

        return undefined;
    }

    private comment(): AlphaTexAstNode | undefined {
        this._codepoint = this.nextCodepoint();
        if (this._codepoint === 0x2f /* / */) {
            this.singleLineComment();
        } else if (this._codepoint === 0x2a /* * */) {
            this.multiLineComment();
        } else {
            this.diagnostics.push({
                code: AlphaTexDiagnosticCode.AT001,
                message: `Unexpected character at comment start, expected '//' or '/*' but found '/${String.fromCodePoint(this._codepoint)}'`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: this._tokenStart,
                end: this.currentLexerLocation()
            });
            this._fatalError = true;
        }
        return undefined;
    }

    private static terminalTokens: Map<number, (lexer: AlphaTexLexer) => AlphaTexAstNode | undefined> = new Map([
        [0x2f /* / */, l => l.comment()],
        [0x22 /* " */, l => l.string()],
        [0x27 /* ' */, l => l.string()],
        [0x2d /* - */, l => l.numberOrIdentifier()],
        [0x2e /* . */, l => l.token<AlphaTexNodeType.DotToken>(AlphaTexNodeType.DotToken)],
        [0x3a /* : */, l => l.token<AlphaTexNodeType.ColonToken>(AlphaTexNodeType.ColonToken)],
        [0x28 /* ( */, l => l.token<AlphaTexNodeType.ParenthesisOpenToken>(AlphaTexNodeType.ParenthesisOpenToken)],
        [0x29 /* ) */, l => l.token<AlphaTexNodeType.ParenthesisCloseToken>(AlphaTexNodeType.ParenthesisCloseToken)],
        [0x7b /* { */, l => l.token<AlphaTexNodeType.BraceOpenToken>(AlphaTexNodeType.BraceOpenToken)],
        [0x7d /* } */, l => l.token<AlphaTexNodeType.BraceCloseToken>(AlphaTexNodeType.BraceCloseToken)],
        [0x7c /* | */, l => l.token<AlphaTexNodeType.PipeToken>(AlphaTexNodeType.PipeToken)],
        [0x2a /* * */, l => l.token<AlphaTexNodeType.AsteriskToken>(AlphaTexNodeType.AsteriskToken)],
        [0x5c /* \ */, l => l.metaCommand()],

        [0x09 /* \t */, l => l.whitespace()],
        [0x0a /* \n */, l => l.whitespace()],
        [0x0b /* \v */, l => l.whitespace()],
        [0x0d /* \r */, l => l.whitespace()],
        [0x20 /* space */, l => l.whitespace()]
    ]);

    private metaCommand() {
        const prefixStart = this.currentLexerLocation();

        this._codepoint = this.nextCodepoint();
        let prefixType: AlphaTexNodeType;

        // allow double backslash (easier to test when copying from escaped Strings)
        if (this._codepoint === 0x5c /* \ */) {
            this._codepoint = this.nextCodepoint();
            prefixType = AlphaTexNodeType.DoubleBackSlashToken;
        } else {
            prefixType = AlphaTexNodeType.BackSlashToken;
        }

        const prefixEnd = this.currentLexerLocation();

        let text = '';
        while (AlphaTexLexer.isIdentifierCharacter(this._codepoint)) {
            text += String.fromCodePoint(this._codepoint);
            this._codepoint = this.nextCodepoint();
        }

        if (text.length === 0) {
            this.diagnostics.push({
                code: AlphaTexDiagnosticCode.AT002,
                message: 'Missing identifier after meta data start',
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: this._tokenStart,
                end: this.currentLexerLocation()
            });
            return undefined;
        }

        const token: AlphaTexMetaDataTagNode = {
            nodeType: AlphaTexNodeType.MetaDataTag,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLexerLocation(),
            prefix: {
                nodeType: prefixType,
                start: prefixStart,
                end: prefixEnd
            },
            tag: {
                nodeType: AlphaTexNodeType.Identifier,
                text: text,
                start: prefixEnd,
                end: this.currentLexerLocation()
            }
        };
        return token;
    }

    private token<T extends AlphaTexNodeType>(nodeType: T): AlphaTexTokenNode<T> {
        const token: AlphaTexTokenNode<T> = {
            nodeType: nodeType,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLexerLocation()
        };
        // consume char
        this._codepoint = this.nextCodepoint();
        return token;
    }

    private string() {
        const startChar: number = this._codepoint;
        this._codepoint = this.nextCodepoint();
        let s: string = '';

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
                            this.diagnostics.push({
                                code: AlphaTexDiagnosticCode.AT003,
                                message: 'Unexpected end of file. Need 4 hex characters on a \\uXXXX escape sequence',
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: this._tokenStart,
                                end: this.currentLexerLocation()
                            });
                            this._fatalError = true;
                            return undefined;
                        }
                        hex += String.fromCodePoint(this._codepoint);
                    }

                    codepoint = Number.parseInt(hex, 16);
                    if (Number.isNaN(codepoint)) {
                        this.diagnostics.push({
                            code: AlphaTexDiagnosticCode.AT004,
                            message: 'Invalid unicode value. Need 4 hex characters on a \\uXXXX escape sequence.',
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: this._tokenStart,
                            end: this.currentLexerLocation()
                        });
                        this._fatalError = true;
                        return undefined;
                    }
                } else {
                    this.diagnostics.push({
                        code: AlphaTexDiagnosticCode.AT005,
                        message: `Unsupported escape sequence. Expected '\\n', '\\r', '\\t', or '\\uXXXX' but found '\\${String.fromCodePoint(this._codepoint)}'.`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: this._tokenStart,
                        end: this.currentLexerLocation()
                    });
                    this._fatalError = true;
                    return undefined;
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
            this.diagnostics.push({
                code: AlphaTexDiagnosticCode.AT006,
                message: `Unexpected end of file. String not closed.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: this._tokenStart,
                end: this.currentLexerLocation()
            });
            this._fatalError = true;
            return undefined;
        }

        const stringToken: AlphaTexStringLiteral = {
            nodeType: AlphaTexNodeType.StringLiteral,
            value: s,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLexerLocation()
        };

        // string quote end
        this._codepoint = this.nextCodepoint();

        return stringToken;
    }

    private multiLineComment() {
        // multiline comment
        const comment: AlphaTexComment = {
            start: this._tokenStart,
            end: this.currentLexerLocation(),
            text: '',
            multiLine: true
        };

        while (this._codepoint !== AlphaTexLexer.Eof) {
            if (this._codepoint === 0x2a /* * */) {
                this._codepoint = this.nextCodepoint();
                if (this._codepoint === 0x2f /* / */) {
                    this._codepoint = this.nextCodepoint();
                    break;
                } else {
                    comment.text += `*${String.fromCodePoint(this._codepoint)}`;
                    comment.end!.line = this._line;
                    comment.end!.col = this._col;
                    comment.end!.offset = this._offset;
                }
            } else {
                this._codepoint = this.nextCodepoint();
                comment.text += String.fromCodePoint(this._codepoint);
                comment.end!.line = this._line;
                comment.end!.col = this._col;
                comment.end!.offset = this._offset;
            }
        }

        this._comments ??= [];
        this._comments!.push(comment);
    }

    private numberOrIdentifier() {
        let str: string = '';

        // assume number at start
        let isNumber = true;

        // negative start or dash
        if (this._codepoint === 0x2d) {
            str += String.fromCodePoint(this._codepoint);
            this._codepoint = this.nextCodepoint();

            // need a number afterwards otherwise we have a string(-)
            if (!AlphaTexLexer.isDigit(this._codepoint)) {
                isNumber = false;
            }
        }

        let keepReading = true;

        do {
            if (isNumber) {
                // adding digits to the number
                if (AlphaTexLexer.isDigit(this._codepoint)) {
                    str += String.fromCodePoint(this._codepoint);
                    this._codepoint = this.nextCodepoint();
                    keepReading = true;
                }
                // letter in number -> fallback to name reading
                else if (AlphaTexLexer.isIdentifierCharacter(this._codepoint)) {
                    isNumber = false;
                    str += String.fromCodePoint(this._codepoint);
                    this._codepoint = this.nextCodepoint();
                    keepReading = true;
                }
                // general unknown character -> end reading
                else {
                    keepReading = false;
                }
            } else {
                if (AlphaTexLexer.isIdentifierCharacter(this._codepoint)) {
                    str += String.fromCodePoint(this._codepoint);
                    this._codepoint = this.nextCodepoint();
                    keepReading = true;
                } else {
                    keepReading = false;
                }
            }
        } while (keepReading);

        if (isNumber) {
            const numberLiteral: AlphaTexNumberLiteral = {
                nodeType: AlphaTexNodeType.NumberLiteral,
                comments: this._comments,
                start: this._tokenStart,
                end: this.currentLexerLocation(),
                value: Number.parseInt(str, 10)
            };
            return numberLiteral;
        }

        const identifier: AlphaTexIdentifier = {
            nodeType: AlphaTexNodeType.Identifier,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLexerLocation(),
            text: str
        };
        return identifier;
    }

    private singleLineComment() {
        // single line comment
        const comment: AlphaTexComment = {
            start: this._tokenStart,
            end: this.currentLexerLocation(),
            text: '',
            multiLine: false
        };
        while (this._codepoint !== AlphaTexLexer.Eof) {
            this._codepoint = this.nextCodepoint();
            if (
                this._codepoint !== 0x0d /* \r */ &&
                this._codepoint !== 0x0a /* \n */ &&
                this._codepoint !== AlphaTexLexer.Eof
            ) {
                comment.text += String.fromCodePoint(this._codepoint);
                comment.end!.line = this._line;
                comment.end!.col = this._col;
                comment.end!.offset = this._offset;
            } else {
                break;
            }
        }
        this._comments ??= [];
        this._comments!.push(comment);
    }

    private whitespace(): AlphaTexAstNode | undefined {
        // skip whitespaces
        while (AlphaTexLexer.isWhiteSpace(this._codepoint)) {
            this.nextCodepoint();
        }
        return undefined;
    }

    private static isDigit(ch: number): boolean {
        return ch >= 0x30 && ch <= 0x39 /* 0-9 */;
    }

    private static isIdentifierCharacter(ch: number): boolean {
        return AlphaTexLexer.isIdentifierStart(ch) || AlphaTexLexer.isDigit(ch);
    }

    private static isIdentifierStart(ch: number): boolean {
        // allow almost all characters:
        // - terminal tokens end identifiers
        // - control characters
        // - digits
        if (
            AlphaTexLexer.terminalTokens.has(ch) || // terminal tokens end identifiers
            ch <= 0x21 || // control characters
            AlphaTexLexer.isDigit(ch) // digits
        ) {
            return false;
        }

        return true;
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
}

/**
 * An error used to abort the parsing of the alphaTex source into an
 */
class AlphaTexParserAbort extends Error {}

/**
 * A parser for translating a given alphaTex source into an AST for further use
 * in the alphaTex importer, editors etc.
 */
export class AlphaTexParser {
    private _lexer: AlphaTexLexer;
    private _score!: AlphaTexScoreNode;
    private _diagnostics: AlphaTexDiagnostics[] = [];

    public get diagnostics(): AlphaTexDiagnostics[] {
        return [...this._lexer.diagnostics, ...this._diagnostics];
    }

    public constructor(source: string) {
        this._lexer = new AlphaTexLexer(source);
    }

    public read(): AlphaTexScoreNode {
        this.score();

        return this._score;
    }

    // recursive decent

    private score() {
        this._score = {
            nodeType: AlphaTexNodeType.Score,
            metaData: [],
            metaDataBarSeparator: undefined,
            bars: [],
            barsSyncPointSeparator: undefined,
            syncPoints: [],
            start: this._lexer.peekToken()?.start,
            comments: this._lexer.peekToken()?.comments
        };

        try {
            this.scoreMetaData();
            this.bars();
            this.syncPoints();
        } catch (e) {
            if (e instanceof AlphaTexParserAbort) {
                // OK
            } else {
                throw e;
            }
        } finally {
            this._score.end = this._lexer.currentTokenLocation();
        }
    }

    private scoreMetaData() {
        while (this._lexer.peekToken()?.nodeType === AlphaTexNodeType.MetaDataTag) {
            const metaData = this.metaDataWithProperties(
                metaData => this.readScoreMetaDataValues(metaData),
                property => this.readScoreMetaDataPropertyValues(property)
            );
            if (metaData) {
                this._score.metaData.push();
            } else {
                break;
            }
        }

        const dot = this._lexer.peekToken();
        // EOF
        if (!dot) {
            return;
        }
        if (dot.nodeType !== AlphaTexNodeType.DotToken) {
            this._diagnostics.push({
                code: AlphaTexDiagnosticCode.AT100,
                message: "Expected a '.' separating the score meta data tags and the bars.",
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: dot.start,
                end: dot.end
            });
        } else {
            this._score.metaDataBarSeparator = this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.DotToken>;
        }
    }

    private bars() {
        while (this._lexer.canRead) {
            const token = this._lexer.peekToken();
            // EOF
            if (!token) {
                return;
            }

            // dot separator marking end of bars
            if (token.nodeType === AlphaTexNodeType.DotToken) {
                this._score.barsSyncPointSeparator = token as AlphaTexTokenNode<AlphaTexNodeType.DotToken>;
                return;
            }

            // still reading bars
            this.bar();
        }
    }

    private bar() {
        const bar: AlphaTexBarNode = {
            nodeType: AlphaTexNodeType.Bar,
            trackMetaData: undefined,
            staffMetaData: undefined,
            voiceMetaData: undefined,
            barMetaData: [],
            beats: [],
            pipe: undefined,
            start: this._lexer.peekToken()?.start,
            comments: this._lexer.peekToken()?.comments
        };
        try {
            this.trackMetaData(bar);
            this.staffMetaData(bar);
            this.voiceMetaData(bar);
            this.barMetaData(bar);
            this.barBeats(bar);

            if (this._lexer.peekToken()?.nodeType === AlphaTexNodeType.PipeToken) {
                bar.pipe = this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.PipeToken>;
            }

            if (
                bar.trackMetaData ||
                bar.staffMetaData ||
                bar.voiceMetaData ||
                bar.barMetaData.length > 0 ||
                bar.beats.length > 0 ||
                bar.pipe
            ) {
                bar.end = this._lexer.currentTokenLocation();
                this._score.bars.push(bar);
            }
        } finally {
            bar.end = this._lexer.currentTokenLocation();
        }
    }

    private barMetaData(bar: AlphaTexBarNode) {
        let token = this._lexer.peekToken();
        while (token?.nodeType === AlphaTexNodeType.MetaDataTag) {
            bar.barMetaData.push(
                this.metaDataWithProperties(
                    metaData => this.readBarMetaDataValues(metaData),
                    property => this.readBarMetaDataPropertyValues(property)
                )!
            );
            token = this._lexer.peekToken();
        }
    }

    private trackMetaData(bar: AlphaTexBarNode) {
        const token = this._lexer.peekToken();
        if (
            token?.nodeType === AlphaTexNodeType.MetaDataTag &&
            (token as AlphaTexMetaDataTagNode).tag.text === 'track'
        ) {
            bar.trackMetaData = this.metaDataWithProperties(
                metaData => this.readTrackMetaDataValues(metaData),
                property => this.readTrackMetaDataPropertyValues(property)
            );
        }
    }

    private staffMetaData(bar: AlphaTexBarNode) {
        const token = this._lexer.peekToken();
        if (
            token?.nodeType === AlphaTexNodeType.MetaDataTag &&
            (token as AlphaTexMetaDataTagNode).tag.text === 'staff'
        ) {
            bar.staffMetaData = this.metaDataWithProperties(
                metaData => this.readStaffMetaDataValues(metaData),
                property => this.readStaffMetaDataPropertyValues(property)
            );
        }
    }

    private voiceMetaData(bar: AlphaTexBarNode) {
        const token = this._lexer.peekToken();
        if (
            token?.nodeType === AlphaTexNodeType.MetaDataTag &&
            (token as AlphaTexMetaDataTagNode).tag.text === 'voice'
        ) {
            bar.voiceMetaData = this.metaDataWithProperties(
                metaData => this.readVoiceMetaDataValues(metaData),
                property => this.readVoiceMetaDataPropertyValues(property)
            );
        }
    }

    private barBeats(bar: AlphaTexBarNode) {
        let token = this._lexer.peekToken();
        while (token && token.nodeType !== AlphaTexNodeType.PipeToken) {
            const beat = this.beat();
            if (beat) {
                bar.beats.push(beat);
            }
            token = this._lexer.peekToken();
        }
    }

    private beat(): AlphaTexBeatNode | undefined {
        const beat: AlphaTexBeatNode = {
            nodeType: AlphaTexNodeType.Beat,
            durationChange: undefined,
            notes: undefined,
            rest: undefined,
            beatEffects: undefined,
            beatMultiplier: undefined,
            beatMultiplierValue: undefined,
            start: this._lexer.peekToken()?.start,
            comments: this._lexer.peekToken()?.comments
        };

        try {
            beat.durationChange = this.beatDurationChange();

            this.beatContent(beat);
            if (!beat.notes && !beat.rest) {
                return undefined;
            }

            beat.beatEffects = this.properties(property => this.readBeatPropertyValues(property));

            this.beatMultiplier(beat);
        } finally {
            beat.end = this._lexer.currentTokenLocation();
        }

        return beat;
    }

    private beatDurationChange(): AlphaTexBeatDurationChangeNode | undefined {
        const colon = this._lexer.peekToken();
        if (colon?.nodeType !== AlphaTexNodeType.ColonToken) {
            return undefined;
        }

        const durationChange: AlphaTexBeatDurationChangeNode = {
            nodeType: AlphaTexNodeType.BeatDurationChange,
            colon: this._lexer.nextToken()! as AlphaTexTokenNode<AlphaTexNodeType.ColonToken>,
            value: undefined,
            properties: undefined,
            start: colon.start,
            comments: colon.comments
        };
        try {
            const durationValue = this._lexer.peekToken();
            if (!durationValue || durationValue.nodeType !== AlphaTexNodeType.NumberLiteral) {
                this.diagnostics.push({
                    code: AlphaTexDiagnosticCode.AT102,
                    message: "Missing duration value after ':'.",
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: colon!.start,
                    end: colon!.end
                });
                return undefined;
            }
            durationChange.value = this._lexer.nextToken() as AlphaTexNumberLiteral;

            durationChange.properties = this.properties(property => this.readDurationChangePropertyValues(property));
        } finally {
            durationChange.end = this._lexer.currentTokenLocation();
        }

        return durationChange;
    }

    private beatContent(beat: AlphaTexBeatNode) {
        const notes = this._lexer.peekToken();
        if (!notes) {
            return;
        }
        if (notes.nodeType === AlphaTexNodeType.Identifier && (notes as AlphaTexIdentifier).text === 'r') {
            beat.rest = notes as AlphaTexIdentifier;
        } else if (notes.nodeType === AlphaTexNodeType.ParenthesisOpenToken) {
            beat.notes = this.noteList();
        } else {
            const note = this.note();
            if (note) {
                beat.notes = {
                    nodeType: AlphaTexNodeType.NoteList,
                    openParenthesis: undefined,
                    notes: [note],
                    closeParenthesis: undefined,
                    start: note.start,
                    end: note.end
                };
            }
        }
    }

    private beatMultiplier(beat: AlphaTexBeatNode) {
        const multiplier = this._lexer.peekToken();
        if (!multiplier || multiplier.nodeType !== AlphaTexNodeType.AsteriskToken) {
            return;
        }
        beat.beatMultiplier = this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.AsteriskToken>;

        const multiplierValue = this._lexer.peekToken();
        if (!multiplierValue || multiplierValue.nodeType !== AlphaTexNodeType.NumberLiteral) {
            this.diagnostics.push({
                code: AlphaTexDiagnosticCode.AT101,
                message: "Missing beat multiplier value after '*'.",
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: beat.beatMultiplier!.start,
                end: beat.beatMultiplier!.end
            });
            return;
        }

        beat.beatMultiplierValue = this._lexer.nextToken() as AlphaTexNumberLiteral;
    }

    private noteList(): AlphaTexNoteListNode {
        const noteList: AlphaTexNoteListNode = {
            nodeType: AlphaTexNodeType.NoteList,
            openParenthesis: undefined,
            notes: [],
            closeParenthesis: undefined,
            start: this._lexer.peekToken()?.start,
            comments: this._lexer.peekToken()?.comments
        };
        try {
            if (this._lexer.peekToken()?.nodeType === AlphaTexNodeType.ParenthesisOpenToken) {
                noteList.openParenthesis =
                    this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>;
            }

            let token = this._lexer.peekToken();
            while (token && token.nodeType !== AlphaTexNodeType.ParenthesisCloseToken) {
                const note = this.note();
                if (note) {
                    noteList.notes.push(note);
                }
                token = this._lexer.nextToken();
            }

            if (this._lexer.peekToken()?.nodeType === AlphaTexNodeType.ParenthesisCloseToken) {
                noteList.closeParenthesis =
                    this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.ParenthesisCloseToken>;
            }
        } finally {
            noteList.end = this._lexer.currentTokenLocation();
        }

        return noteList;
    }

    private note(): AlphaTexNoteNode | undefined {
        const noteValue = this._lexer.peekToken();
        if (!noteValue) {
            return undefined;
        }

        const note: AlphaTexNoteNode = {
            nodeType: AlphaTexNodeType.Note,
            noteValue: {
                // placeholder value
                nodeType: AlphaTexNodeType.Identifier,
                text: ''
            } as AlphaTexIdentifier,
            start: noteValue.start,
            comments: noteValue.comments
        };
        try {
            switch (noteValue.nodeType) {
                case AlphaTexNodeType.NumberLiteral:
                    note.noteValue = this._lexer.nextToken() as AlphaTexNumberLiteral;
                    break;
                case AlphaTexNodeType.StringLiteral:
                    note.noteValue = this._lexer.nextToken() as AlphaTexStringLiteral;
                    break;
                case AlphaTexNodeType.Identifier:
                    note.noteValue = this._lexer.nextToken() as AlphaTexIdentifier;
                    break;
                default:
                    const allowedTypes: string[] = [
                        AlphaTexNodeType[AlphaTexNodeType.NumberLiteral],
                        AlphaTexNodeType[AlphaTexNodeType.StringLiteral],
                        AlphaTexNodeType[AlphaTexNodeType.Identifier]
                    ];
                    this.diagnostics.push({
                        code: AlphaTexDiagnosticCode.AT105,
                        message: `Unexpected '${AlphaTexNodeType[noteValue.nodeType]}' token. Expected one of following: ${allowedTypes.join(',')}`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: noteValue.start,
                        end: noteValue.end
                    });
                    throw new AlphaTexParserAbort();
            }

            if (this._lexer.peekToken()?.nodeType === AlphaTexNodeType.DotToken) {
                note.noteStringDot = this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.DotToken>;

                const noteString = this._lexer.peekToken();
                if (!noteString) {
                    return undefined;
                }

                if (noteString.nodeType === AlphaTexNodeType.NumberLiteral) {
                    note.noteString = this._lexer.nextToken() as AlphaTexNumberLiteral;
                } else {
                    const allowedTypes: string[] = [AlphaTexNodeType[AlphaTexNodeType.NumberLiteral]];
                    this.diagnostics.push({
                        code: AlphaTexDiagnosticCode.AT105,
                        message: `Unexpected '${AlphaTexNodeType[noteString.nodeType]}' token. Expected one of following: ${allowedTypes.join(',')}`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: noteString.start,
                        end: noteString.end
                    });
                    throw new AlphaTexParserAbort();
                }
            }

            note.noteEffects = this.properties(property => this.readNotePropertyValues(property));
        } finally {
            note.end = this._lexer.currentTokenLocation();
        }

        return note;
    }

    private syncPoints() {
        while (this._lexer.canRead) {
            const syncPoint = this.syncPoint();
            if (!syncPoint) {
                return;
            }
            this._score.syncPoints.push(syncPoint);
        }
    }

    private syncPoint(): AlphaTexMetaDataWithPropertiesNode | undefined {
        const tag = this._lexer.peekToken();
        if (!tag) {
            return undefined;
        }
        if (tag.nodeType !== AlphaTexNodeType.MetaDataTag) {
            this._diagnostics.push({
                code: AlphaTexDiagnosticCode.AT103,
                message: `Unexpected '${AlphaTexNodeType[tag.nodeType]}' token. Expected a '\\sync' meta data tag.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: tag.start,
                end: tag.end
            });
            return undefined;
        }
        if ((tag as AlphaTexMetaDataTagNode).tag.text !== 'sync') {
            this._diagnostics.push({
                code: AlphaTexDiagnosticCode.AT104,
                message: `Unexpected meta data tag '${(tag as AlphaTexMetaDataTagNode).tag.text}'. Expected a '\\sync' meta data tag.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: tag.start,
                end: tag.end
            });
            return undefined;
        }

        return this.metaDataWithProperties(
            metaData => this.readSyncPointMetaDataValues(metaData),
            property => this.readSyncPointMetaDataPropertyValues(property)
        );
    }

    private metaDataWithProperties(
        readValues: (metaData: AlphaTexMetaDataWithPropertiesNode) => AlphaTexValueList | undefined,
        readPropertyValues: (property: AlphaTexPropertyNode) => AlphaTexValueList | undefined
    ): AlphaTexMetaDataWithPropertiesNode | undefined {
        const tag = this._lexer.peekToken();
        if (!tag || tag.nodeType !== AlphaTexNodeType.MetaDataTag) {
            return undefined;
        }

        const metaDataWithProperties: AlphaTexMetaDataWithPropertiesNode = {
            nodeType: AlphaTexNodeType.MetaDataWithProperties,
            tag: this._lexer.nextToken() as AlphaTexMetaDataTagNode,
            start: tag.start,
            comments: tag.comments,
            properties: undefined
        };
        try {
            metaDataWithProperties.values = this.valueList() ?? readValues(metaDataWithProperties);
            metaDataWithProperties.properties = this.properties(readPropertyValues);
        } finally {
            metaDataWithProperties.end = this._lexer.currentTokenLocation();
        }
        return metaDataWithProperties;
    }

    private properties(
        readPropertyValues: (property: AlphaTexPropertyNode) => AlphaTexValueList | undefined
    ): AlphaTexPropertiesNode | undefined {
        const braceOpen = this._lexer.peekToken();
        if (!braceOpen || braceOpen.nodeType !== AlphaTexNodeType.BraceOpenToken) {
            return undefined;
        }

        const properties: AlphaTexPropertiesNode = {
            nodeType: AlphaTexNodeType.Properties,
            openBrace: this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.BraceOpenToken>,
            properties: [],
            closeBrace: undefined,
            start: braceOpen.start,
            comments: braceOpen.comments
        };
        try {
            let token = this._lexer.peekToken();
            while (token?.nodeType === AlphaTexNodeType.Identifier) {
                properties.properties.push(this.property(readPropertyValues));
                token = this._lexer.nextToken();
            }

            const braceClose = this._lexer.peekToken();
            if (braceClose?.nodeType !== AlphaTexNodeType.BraceCloseToken) {
                properties.closeBrace = this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.BraceCloseToken>;
            }
        } finally {
            properties.end = this._lexer.currentTokenLocation();
        }

        return properties;
    }

    private property(
        readPropertyValues: (property: AlphaTexPropertyNode) => AlphaTexValueList | undefined
    ): AlphaTexPropertyNode {
        const property: AlphaTexPropertyNode = {
            nodeType: AlphaTexNodeType.Property,
            property: this._lexer.nextToken() as AlphaTexIdentifier,
            values: undefined
        };
        property.start = property.property.start;
        property.comments = property.property.comments;
        try {
            property.values = this.valueList() ?? readPropertyValues(property);
        } finally {
            property.end = this._lexer.currentTokenLocation();
        }

        return property;
    }

    private valueList(): AlphaTexValueList | undefined {
        const openParenthesis = this._lexer.peekToken();
        if (openParenthesis?.nodeType !== AlphaTexNodeType.ParenthesisOpenToken) {
            return undefined;
        }

        const valueList: AlphaTexValueList = {
            nodeType: AlphaTexNodeType.ValueList,
            openParenthesis: this._lexer.nextToken() as AlphaTexTokenNode<AlphaTexNodeType.ParenthesisOpenToken>,
            values: [],
            closeParenthesis: undefined,
            start: openParenthesis.start,
            comments: openParenthesis.comments
        };

        try {
            let token = this._lexer.peekToken();
            while (token && token?.nodeType !== AlphaTexNodeType.ParenthesisCloseToken) {
                switch (token.nodeType) {
                    case AlphaTexNodeType.Identifier:
                        valueList.values.push(this._lexer.nextToken() as AlphaTexIdentifier);
                        break;
                    case AlphaTexNodeType.StringLiteral:
                        valueList.values.push(this._lexer.nextToken() as AlphaTexStringLiteral);
                        break;
                    case AlphaTexNodeType.NumberLiteral:
                        valueList.values.push(this._lexer.nextToken() as AlphaTexNumberLiteral);
                        break;
                    default:
                        const allowedTypes: string[] = [
                            AlphaTexNodeType[AlphaTexNodeType.Identifier],
                            AlphaTexNodeType[AlphaTexNodeType.StringLiteral],
                            AlphaTexNodeType[AlphaTexNodeType.NumberLiteral]
                        ];
                        this.diagnostics.push({
                            code: AlphaTexDiagnosticCode.AT105,
                            message: `Unexpected '${AlphaTexNodeType[token.nodeType]}' token. Expected one of following: ${allowedTypes.join(',')}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: token.start,
                            end: token.end
                        });
                        // try to skip and continue parsing
                        this._lexer.nextToken();
                        break;
                }

                token = this._lexer.peekToken();
            }
        } finally {
            valueList.end = this._lexer.currentTokenLocation();
        }

        return valueList;
    }

    // unfortunately the "old" alphaTex syntax had no strict delimiters
    // for values and properties. That's why we need to parse the properties exactly
    // as needed for the identifiers. In an alphaTex2 we should make this parsing simpler.
    // the parser should not need to do that semantic checks, that's the importers job
    // but we emit "Hint" diagnostics for now.

    private readScoreMetaDataValues(metaData: AlphaTexMetaDataWithPropertiesNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readScoreMetaDataPropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readBarMetaDataValues(metaData: AlphaTexMetaDataWithPropertiesNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readBarMetaDataPropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readTrackMetaDataValues(metaData: AlphaTexMetaDataWithPropertiesNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readTrackMetaDataPropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readStaffMetaDataValues(metaData: AlphaTexMetaDataWithPropertiesNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readStaffMetaDataPropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readVoiceMetaDataValues(metaData: AlphaTexMetaDataWithPropertiesNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readSyncPointMetaDataPropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readSyncPointMetaDataValues(metaData: AlphaTexMetaDataWithPropertiesNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readVoiceMetaDataPropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readBeatPropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readDurationChangePropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }

    private readNotePropertyValues(property: AlphaTexPropertyNode): AlphaTexValueList | undefined {
        throw new Error('TODO');
    }
}

// NOTE: Semantic errors will be reported by alphaTexImporter when translating into the
// score model
