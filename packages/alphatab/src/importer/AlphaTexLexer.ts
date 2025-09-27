import {
    type AlphaTexAstNode,
    type AlphaTexAstNodeLocation,
    type AlphaTexComment,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexStringLiteral,
    type AlphaTexTokenNode
} from '@src/importer/AlphaTexAst';
import {
    AlphaTexDiagnosticCode,
    type AlphaTexDiagnostics,
    AlphaTexDiagnosticsSeverity
} from '@src/importer/AlphaTexShared';
import { IOHelper } from '@src/io/IOHelper';
import { Queue } from '@src/synth/ds/Queue';

export class AlphaTexLexer {
    private static readonly Eof: number = 0;

    private readonly _codepoints: number[];
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

    public revert(node: AlphaTexAstNode) {
        this._tokenQueue.enqueueFront(node);
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

        return {
            nodeType: AlphaTexNodeType.NumberLiteral,
            start: start.start,
            end: fractional.end,
            comments: start.comments,
            value: Number.parseFloat(
                String.fromCodePoint(...this._codepoints.slice(start.start!.offset, fractional.end!.offset))
            )
        } as AlphaTexNumberLiteral;
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
            text: s,
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
        return !(
            (
                AlphaTexLexer.terminalTokens.has(ch) || // terminal tokens end identifiers
                ch <= 0x21 || // control characters
                AlphaTexLexer.isDigit(ch)
            ) // digits
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
}
