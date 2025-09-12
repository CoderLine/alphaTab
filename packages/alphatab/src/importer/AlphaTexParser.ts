import type { AlphaTabError } from '@src/AlphaTabError';
import { AlphaTexError } from '@src/importer/AlphaTexImporter';
import { IOHelper } from '@src/io/IOHelper';
import { Queue } from '@src/synth/ds/Queue';
import type * as ast from './AlphaTexAst';
import { type AlphaTexComment, AlphaTexNodeType } from './AlphaTexAst';

interface AlphaTexTokenLocation {
    line: number;
    col: number;
    offset: number;
}

export class AlphaTexLexer {
    private static readonly Eof: number = 0;

    private _codepoints: number[];
    private _codepoint: number = AlphaTexLexer.Eof;

    private _offset: number = 0;
    private _line: number = 1;
    private _col: number = 1;

    public _tokenStart: AlphaTexTokenLocation = { line: 0, col: 0, offset: 0 };
    public _comments: ast.AlphaTexComment[] | undefined;
    private _tokenQueue: Queue<ast.AlphaTexAstNode> = new Queue<ast.AlphaTexAstNode>();

    public parseErrors: AlphaTabError[] = [];

    public constructor(input: string) {
        this._codepoints = [...IOHelper.iterateCodepoints(input)];
        this._offset = 0;
        this._line = 1;
        this._col = 1;
        this._codepoint = this._codepoints.length > 0 ? this._codepoints[0] : AlphaTexLexer.Eof;
    }

    public peekToken(): ast.AlphaTexAstNode | undefined {
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

    public nextTokenWithFloats(): ast.AlphaTexAstNode | undefined {
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
            return start as ast.AlphaTexNumberLiteral;
        }
        this.nextToken(); // consume dot

        const fractional = this.peekToken();
        if (!fractional) {
            this.addError('Missing fractional digits on floating point number');
            return undefined;
        }

        if (fractional.start!.offset !== floatSeparator.end!.offset + 1) {
            this.addError(`Expected a digits but found whitespace`);
            return undefined;
        }

        // 1.1a
        if (fractional.nodeType !== AlphaTexNodeType.NumberLiteral) {
            this._tokenQueue.enqueueFront(floatSeparator);
            return start;
        }

        // -1.-1
        if ((fractional as ast.AlphaTexNumberLiteral).value < 0) {
            this._tokenQueue.enqueueFront(floatSeparator);
            return start;
        }
        this.nextToken(); // consume fraction

        const floatNumber: ast.AlphaTexNumberLiteral = {
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

    public nextToken(): ast.AlphaTexAstNode | undefined {
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

    private currentLocation(): AlphaTexTokenLocation {
        return {
            line: this._line,
            col: this._col,
            offset: this._offset
        };
    }

    private readToken(): ast.AlphaTexAstNode | undefined {
        this._comments = undefined;

        while (this._codepoint !== AlphaTexLexer.Eof) {
            this._tokenStart = this.currentLocation();
            if (AlphaTexLexer.terminalTokens.has(this._codepoint)) {
                const token = AlphaTexLexer.terminalTokens.get(this._codepoint)!(this);
                if (token) {
                    return token;
                }
            } else if (AlphaTexLexer.isIdentifierCharacter(this._codepoint)) {
                return this.numberOrIdentifier();
            } else {
                this.addError(`Unexpected character ${String.fromCodePoint(this._codepoint)}`);
                return undefined;
            }
        }

        return undefined;
    }

    private comment(): ast.AlphaTexAstNode | undefined {
        this._codepoint = this.nextCodepoint();
        if (this._codepoint === 0x2f /* / */) {
            this.singleLineComment();
        } else if (this._codepoint === 0x2a /* * */) {
            this.multiLineComment();
        } else {
            this.addError(`Unexpected character '${String.fromCodePoint(this._codepoint)}'`);
        }
        return undefined;
    }

    private static terminalTokens: Map<number, (lexer: AlphaTexLexer) => ast.AlphaTexAstNode | undefined> = new Map([
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
        const prefixStart = this.currentLocation();

        this._codepoint = this.nextCodepoint();
        let prefixType: AlphaTexNodeType;

        // allow double backslash (easier to test when copying from escaped Strings)
        if (this._codepoint === 0x5c /* \ */) {
            this._codepoint = this.nextCodepoint();
            prefixType = AlphaTexNodeType.DoubleBackSlashToken;
        } else {
            prefixType = AlphaTexNodeType.BackSlashToken;
        }

        const prefixEnd = this.currentLocation();

        let text = '';
        while (AlphaTexLexer.isIdentifierCharacter(this._codepoint)) {
            text += String.fromCodePoint(this._codepoint);
            this._codepoint = this.nextCodepoint();
        }

        if (text.length === 0) {
            this.addError('Missing identifier after meta command start');
            return undefined;
        }

        const token: ast.AlphaTexMetaDataTagNode = {
            nodeType: AlphaTexNodeType.MetaDataTag,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLocation(),
            prefix: {
                nodeType: prefixType,
                start: prefixStart,
                end: prefixEnd
            },
            tag: {
                nodeType: AlphaTexNodeType.Identifier,
                text: text,
                start: prefixEnd,
                end: this.currentLocation()
            }
        };
        return token;
    }

    private token<T extends AlphaTexNodeType>(nodeType: T): ast.AlphaTexTokenNode<T> {
        const token: ast.AlphaTexTokenNode<T> = {
            nodeType: nodeType,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLocation()
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
                            this.addError('Unexpected end of escape sequence');
                        }
                        hex += String.fromCodePoint(this._codepoint);
                    }

                    codepoint = Number.parseInt(hex, 16);
                    if (Number.isNaN(codepoint)) {
                        this.addError(`Invalid unicode value ${hex}`);
                    }
                } else {
                    this.addError('Unsupported escape sequence');
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
            this.addError('String opened but never closed');
        }

        const stringToken: ast.AlphaTexStringLiteral = {
            nodeType: AlphaTexNodeType.StringLiteral,
            value: s,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLocation()
        };

        // string quote end
        this._codepoint = this.nextCodepoint();

        return stringToken;
    }

    private multiLineComment() {
        // multiline comment
        const comment: AlphaTexComment = {
            start: this._tokenStart,
            end: this.currentLocation(),
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
            const numberLiteral: ast.AlphaTexNumberLiteral = {
                nodeType: AlphaTexNodeType.NumberLiteral,
                comments: this._comments,
                start: this._tokenStart,
                end: this.currentLocation(),
                value: Number.parseInt(str, 10)
            };
            return numberLiteral;
        }

        const identifier: ast.AlphaTexIdentifier = {
            nodeType: AlphaTexNodeType.Identifier,
            comments: this._comments,
            start: this._tokenStart,
            end: this.currentLocation(),
            text: str
        };
        return identifier;
    }

    private singleLineComment() {
        // single line comment
        const comment: AlphaTexComment = {
            start: this._tokenStart,
            end: this.currentLocation(),
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

    private whitespace(): ast.AlphaTexAstNode | undefined {
        // skip whitespaces
        while (AlphaTexLexer.isWhiteSpace(this._codepoint)) {
            this.nextCodepoint();
        }
        return undefined;
    }

    private addError(message: string): void {
        const e: AlphaTexError = AlphaTexError.errorMessage(
            message,
            this._tokenStart.offset,
            this._tokenStart.line,
            this._tokenStart.col
        );
        this.parseErrors.push(e);
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
