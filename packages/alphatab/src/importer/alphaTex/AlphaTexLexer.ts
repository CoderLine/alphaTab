import {
    type AlphaTexAsteriskTokenNode,
    type AlphaTexAstNode,
    type AlphaTexAstNodeLocation,
    type AlphaTexBackSlashTokenNode,
    type AlphaTexBraceCloseTokenNode,
    type AlphaTexBraceOpenTokenNode,
    type AlphaTexColonTokenNode,
    type AlphaTexComment,
    type AlphaTexDotTokenNode,
    type AlphaTexDoubleBackSlashTokenNode,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexParenthesisCloseTokenNode,
    type AlphaTexParenthesisOpenTokenNode,
    type AlphaTexPipeTokenNode,
    type AlphaTexStringLiteral,
    type AlphaTexTokenNode,
    type IAlphaTexMetaDataTagPrefixNode
} from '@src/importer/alphaTex/AlphaTexAst';
import {
    AlphaTexDiagnosticBag,
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity
} from '@src/importer/alphaTex/AlphaTexShared';
import { IOHelper } from '@src/io/IOHelper';

/**
 * @public
 */
export class AlphaTexLexer {
    private static readonly _eof: number = 0;

    private readonly _codepoints: number[];
    private _codepoint: number = AlphaTexLexer._eof;

    private _offset: number = 0;
    private _line: number = 1;
    private _col: number = 1;

    private _fatalError = false;

    private _tokenStart: AlphaTexAstNodeLocation = { line: 0, col: 0, offset: 0 };
    private _leadingComments: AlphaTexComment[] | undefined;
    private _trailingCommentNode: AlphaTexAstNode | undefined;

    private _peekedToken: AlphaTexAstNode | undefined;

    public readonly lexerDiagnostics = new AlphaTexDiagnosticBag();

    public constructor(input: string) {
        this._codepoints = [...IOHelper.iterateCodepoints(input)];
        this._offset = 0;
        this._line = 1;
        this._col = 1;
        this._codepoint = this._codepoints.length > 0 ? this._codepoints[0] : AlphaTexLexer._eof;
    }

    public peekToken(): AlphaTexAstNode | undefined {
        if (this._fatalError) {
            return undefined;
        }

        let peeked = this._peekedToken;
        if (peeked) {
            return peeked;
        }

        peeked = this._readToken();
        this._peekedToken = peeked;
        return peeked;
    }

    public extendToFloat(peekedNode: AlphaTexNumberLiteral): AlphaTexNumberLiteral {
        // float number tokenizing is a bit tricky in alphaTex
        // we chose <fret>.<string>.<duration> (or <fret>.<string>) as
        // syntax for fretted notes, this conflicts now with a context
        // independent tokenization.

        // It would be a good idea to check for 3.3.3 patterns here
        // and then handle the numbers as individual ones? as for now we
        // use "extendToFloat" at dedicated areas when parsing.

        // a float needs a decimal separator and a digit after the peeked node
        if (
            this._codepoint !== 0x2e /* . */ ||
            this._offset + 1 >= this._codepoints.length ||
            !AlphaTexLexer._isDigit(this._codepoints[this._offset + 1])
        ) {
            return peekedNode;
        }

        let offset = this._offset + 2;
        // advance to end of fractional digits
        while (offset < this._codepoints.length && AlphaTexLexer._isDigit(this._codepoints[offset])) {
            offset++;
        }

        // 1.1a -> handle as Number(1) Dot(.) Ident(1a)
        if (offset < this._codepoints.length && AlphaTexLexer._isIdentifierCharacter(this._codepoints[offset])) {
            return peekedNode;
        }

        // jump to last digit
        const characters = offset - this._offset - 1;
        this._offset += characters;
        this._col += characters;
        this._nextCodepoint(); // consume last digit like usual

        // update end and value
        peekedNode.end = this._currentLexerLocation();
        peekedNode.value = Number.parseFloat(
            String.fromCodePoint(...this._codepoints.slice(peekedNode.start!.offset, peekedNode.end!.offset))
        );

        return peekedNode;
    }

    public advance() {
        this._peekedToken = undefined;
    }

    // public nextToken(): AlphaTexAstNode | undefined {
    //     if (this._fatalError) {
    //         return undefined;
    //     }

    //     const reverted = this._revertedToken;
    //     if (reverted) {
    //         this._revertedToken = undefined;
    //         return reverted;
    //     }

    //     const peeked = this._peekedToken;
    //     if (peeked) {
    //         this._peekedToken = undefined;
    //         return peeked;
    //     }

    //     return this._readToken();
    // }

    private _nextCodepoint(): number {
        const codePoints = this._codepoints;
        let offset = this._offset;

        if (offset < codePoints.length - 1) {
            ++offset;
            const codepoint = codePoints[offset];
            this._codepoint = codepoint;
            if (codepoint === 0x0a) {
                ++this._line;
                this._col = 1;
            } else {
                ++this._col;
            }
            this._offset = offset;
            return codepoint;
        } else if (this._codepoint !== AlphaTexLexer._eof) {
            this._codepoint = AlphaTexLexer._eof;
            ++this._col;
            this._offset = codePoints.length;
        }
        return AlphaTexLexer._eof;
    }

    public currentTokenLocation(): AlphaTexAstNodeLocation {
        return this._peekedToken?.start ?? this._currentLexerLocation();
    }

    private _currentLexerLocation(): AlphaTexAstNodeLocation {
        return {
            line: this._line,
            col: this._col,
            offset: this._offset
        };
    }

    private _readToken(): AlphaTexAstNode | undefined {
        this._leadingComments = undefined;
        while (this._codepoint !== AlphaTexLexer._eof) {
            this._tokenStart = this._currentLexerLocation();
            if (AlphaTexLexer._terminalTokens.has(this._codepoint)) {
                const token = AlphaTexLexer._terminalTokens.get(this._codepoint)!(this);
                if (token) {
                    this._trailingCommentNode = token;
                    return token;
                }
            } else if (AlphaTexLexer._isIdentifierCharacter(this._codepoint)) {
                const identifier = this._numberOrIdentifier();
                this._trailingCommentNode = identifier;
                return identifier;
            } else {
                // simply skip unknown characters
                // there are only a few ascii control characters
                // which can hit this path
                this._codepoint = this._nextCodepoint();
            }
        }

        return undefined;
    }

    private _comment(): AlphaTexAstNode | undefined {
        this._codepoint = this._nextCodepoint();
        if (this._codepoint === 0x2f /* / */) {
            this._singleLineComment();
        } else if (this._codepoint === 0x2a /* * */) {
            this._multiLineComment();
        } else {
            this.lexerDiagnostics.push({
                code: AlphaTexDiagnosticCode.AT001,
                message: `Unexpected character at comment start, expected '//' or '/*' but found '/${String.fromCodePoint(this._codepoint)}'`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: this._tokenStart,
                end: this._currentLexerLocation()
            });
            this._fatalError = true;
        }
        return undefined;
    }

    private static _terminalTokens: Map<number, (lexer: AlphaTexLexer) => AlphaTexAstNode | undefined> = new Map([
        [0x2f /* / */, l => l._comment()],
        [0x22 /* " */, l => l._string()],
        [0x27 /* ' */, l => l._string()],
        [0x2d /* - */, l => l._numberOrIdentifier()],
        [0x2e /* . */, l => l._token({ nodeType: AlphaTexNodeType.Dot } as AlphaTexDotTokenNode)],
        [0x3a /* : */, l => l._token({ nodeType: AlphaTexNodeType.Colon } as AlphaTexColonTokenNode)],
        [0x28 /* ( */, l => l._token({ nodeType: AlphaTexNodeType.LParen } as AlphaTexParenthesisOpenTokenNode)],
        [0x29 /* ) */, l => l._token({ nodeType: AlphaTexNodeType.RParen } as AlphaTexParenthesisCloseTokenNode)],
        [0x7b /* { */, l => l._token({ nodeType: AlphaTexNodeType.LBrace } as AlphaTexBraceOpenTokenNode)],
        [0x7d /* } */, l => l._token({ nodeType: AlphaTexNodeType.RBrace } as AlphaTexBraceCloseTokenNode)],
        [0x7c /* | */, l => l._token({ nodeType: AlphaTexNodeType.Pipe } as AlphaTexPipeTokenNode)],
        [0x2a /* * */, l => l._token({ nodeType: AlphaTexNodeType.Asterisk } as AlphaTexAsteriskTokenNode)],
        [0x5c /* \ */, l => l._metaCommand()],

        [0x09 /* \t */, l => l._whitespace()],
        [0x0a /* \n */, l => l._whitespace()],
        [0x0b /* \v */, l => l._whitespace()],
        [0x0d /* \r */, l => l._whitespace()],
        [0x20 /* space */, l => l._whitespace()]
    ]);

    private _metaCommand() {
        const prefixStart = this._currentLexerLocation();

        this._codepoint = this._nextCodepoint();
        let prefix: IAlphaTexMetaDataTagPrefixNode;

        // allow double backslash (easier to test when copying from escaped Strings)
        let prefixEnd: AlphaTexAstNodeLocation;
        if (this._codepoint === 0x5c /* \ */) {
            this._codepoint = this._nextCodepoint();
            prefixEnd = this._currentLexerLocation();
            prefix = {
                nodeType: AlphaTexNodeType.DoubleBackslash,
                start: prefixStart,
                end: prefixEnd
            } as AlphaTexDoubleBackSlashTokenNode;
        } else {
            prefixEnd = this._currentLexerLocation();
            prefix = {
                nodeType: AlphaTexNodeType.Backslash,
                start: prefixStart,
                end: prefixEnd
            } as AlphaTexBackSlashTokenNode;
        }

        let text = '';
        while (AlphaTexLexer._isIdentifierCharacter(this._codepoint)) {
            text += String.fromCodePoint(this._codepoint);
            this._codepoint = this._nextCodepoint();
        }

        if (text.length === 0) {
            this.lexerDiagnostics.push({
                code: AlphaTexDiagnosticCode.AT002,
                message: 'Missing identifier after meta data start',
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: this._tokenStart,
                end: this._currentLexerLocation()
            });
            return undefined;
        }

        const token: AlphaTexMetaDataTagNode = {
            nodeType: AlphaTexNodeType.Tag,
            leadingComments: this._leadingComments,
            start: this._tokenStart,
            end: this._currentLexerLocation(),
            prefix: prefix,
            tag: {
                nodeType: AlphaTexNodeType.Ident,
                text: text,
                start: prefixEnd,
                end: this._currentLexerLocation()
            }
        };
        return token;
    }

    private _token<T extends AlphaTexTokenNode>(t: T): T {
        t.leadingComments = this._leadingComments;
        t.start = this._tokenStart;
        t.end = this._currentLexerLocation();
        // consume char
        this._codepoint = this._nextCodepoint();
        return t;
    }

    private _string() {
        const startChar: number = this._codepoint;
        this._codepoint = this._nextCodepoint();
        let s: string = '';

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
                            this.lexerDiagnostics.push({
                                code: AlphaTexDiagnosticCode.AT003,
                                message: 'Unexpected end of file. Need 4 hex characters on a \\uXXXX escape sequence',
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: this._tokenStart,
                                end: this._currentLexerLocation()
                            });
                            this._fatalError = true;
                            return undefined;
                        }
                        hex += String.fromCodePoint(this._codepoint);
                    }

                    codepoint = Number.parseInt(hex, 16);
                    if (Number.isNaN(codepoint)) {
                        this.lexerDiagnostics.push({
                            code: AlphaTexDiagnosticCode.AT004,
                            message: 'Invalid unicode value. Need 4 hex characters on a \\uXXXX escape sequence.',
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: this._tokenStart,
                            end: this._currentLexerLocation()
                        });
                        this._fatalError = true;
                        return undefined;
                    }
                } else {
                    this.lexerDiagnostics.push({
                        code: AlphaTexDiagnosticCode.AT005,
                        message: `Unsupported escape sequence. Expected '\\n', '\\r', '\\t', or '\\uXXXX' but found '\\${String.fromCodePoint(this._codepoint)}'.`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: this._tokenStart,
                        end: this._currentLexerLocation()
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
            this._codepoint = this._nextCodepoint();
        }
        if (this._codepoint === AlphaTexLexer._eof) {
            this.lexerDiagnostics.push({
                code: AlphaTexDiagnosticCode.AT006,
                message: `Unexpected end of file. String not closed.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: this._tokenStart,
                end: this._currentLexerLocation()
            });
            this._fatalError = true;
            return undefined;
        }

        const stringToken: AlphaTexStringLiteral = {
            nodeType: AlphaTexNodeType.String,
            text: s,
            leadingComments: this._leadingComments,
            start: this._tokenStart,
            end: this._currentLexerLocation()
        };

        // string quote end
        this._codepoint = this._nextCodepoint();

        return stringToken;
    }

    private _multiLineComment() {
        const trailingCommentNode = this._trailingCommentNode;
        const comment: AlphaTexComment = {
            start: this._tokenStart,
            end: this._currentLexerLocation(),
            text: '',
            multiLine: true
        };

        while (this._codepoint !== AlphaTexLexer._eof) {
            if (this._codepoint === 0x2a /* * */) {
                this._codepoint = this._nextCodepoint();
                if (this._codepoint === 0x2f /* / */) {
                    this._codepoint = this._nextCodepoint();
                    break;
                } else {
                    comment.text += `*${String.fromCodePoint(this._codepoint)}`;
                    comment.end!.line = this._line;
                    comment.end!.col = this._col;
                    comment.end!.offset = this._offset;
                }
            } else {
                this._codepoint = this._nextCodepoint();
                comment.text += String.fromCodePoint(this._codepoint);
                comment.end!.line = this._line;
                comment.end!.col = this._col;
                comment.end!.offset = this._offset;
            }
        }

        if (trailingCommentNode) {
            trailingCommentNode.trailingComments ??= [];
            trailingCommentNode.trailingComments.push(comment);
        } else {
            this._leadingComments ??= [];
            this._leadingComments!.push(comment);
        }
    }

    private _numberOrIdentifier(): AlphaTexAstNode {
        let str: string = '';

        // assume number at start
        let isNumber = true;

        // negative start or dash
        if (this._codepoint === 0x2d) {
            str += String.fromCodePoint(this._codepoint);
            this._codepoint = this._nextCodepoint();

            // need a number afterwards otherwise we have a string(-)
            if (!AlphaTexLexer._isDigit(this._codepoint)) {
                isNumber = false;
            }
        }

        let keepReading = true;

        do {
            if (isNumber) {
                // adding digits to the number
                if (AlphaTexLexer._isDigit(this._codepoint)) {
                    str += String.fromCodePoint(this._codepoint);
                    this._codepoint = this._nextCodepoint();
                    keepReading = true;
                }
                // letter in number -> fallback to name reading
                else if (AlphaTexLexer._isIdentifierCharacter(this._codepoint)) {
                    isNumber = false;
                    str += String.fromCodePoint(this._codepoint);
                    this._codepoint = this._nextCodepoint();
                    keepReading = true;
                }
                // general unknown character -> end reading
                else {
                    keepReading = false;
                }
            } else {
                if (AlphaTexLexer._isIdentifierCharacter(this._codepoint)) {
                    str += String.fromCodePoint(this._codepoint);
                    this._codepoint = this._nextCodepoint();
                    keepReading = true;
                } else {
                    keepReading = false;
                }
            }
        } while (keepReading);

        if (isNumber) {
            const numberLiteral: AlphaTexNumberLiteral = {
                nodeType: AlphaTexNodeType.Number,
                leadingComments: this._leadingComments,
                start: this._tokenStart,
                end: this._currentLexerLocation(),
                value: Number.parseInt(str, 10)
            };
            return numberLiteral;
        }

        const identifier: AlphaTexIdentifier = {
            nodeType: AlphaTexNodeType.Ident,
            leadingComments: this._leadingComments,
            start: this._tokenStart,
            end: this._currentLexerLocation(),
            text: str
        };
        return identifier;
    }

    private _singleLineComment() {
        // single line comment
        const trailingCommentNode = this._trailingCommentNode;
        const comment: AlphaTexComment = {
            start: this._tokenStart,
            end: this._currentLexerLocation(),
            text: '',
            multiLine: false
        };
        while (this._codepoint !== AlphaTexLexer._eof) {
            this._codepoint = this._nextCodepoint();
            if (
                this._codepoint !== 0x0d /* \r */ &&
                this._codepoint !== 0x0a /* \n */ &&
                this._codepoint !== AlphaTexLexer._eof
            ) {
                comment.text += String.fromCodePoint(this._codepoint);
                comment.end!.line = this._line;
                comment.end!.col = this._col;
                comment.end!.offset = this._offset;
            } else {
                break;
            }
        }
        if (trailingCommentNode) {
            trailingCommentNode.trailingComments ??= [];
            trailingCommentNode.trailingComments.push(comment);
        } else {
            this._leadingComments ??= [];
            this._leadingComments!.push(comment);
        }
    }

    private _whitespace(): AlphaTexAstNode | undefined {
        // skip whitespaces
        while (AlphaTexLexer._isWhiteSpace(this._codepoint)) {
            if (this._codepoint === 0x0a /* \n */) {
                this._trailingCommentNode = undefined;
            }
            this._nextCodepoint();
        }
        return undefined;
    }

    private static _isDigit(ch: number): boolean {
        return ch >= 0x30 && ch <= 0x39 /* 0-9 */;
    }

    private static _buildNonIdentifierChars() {
        const c = new Set<number>();

        for (const terminal of AlphaTexLexer._terminalTokens.keys()) {
            c.add(terminal);
        }

        // dashes allowed in names
        c.delete(0x2d /* - */);

        // eof
        c.add(AlphaTexLexer._eof);

        return c;
    }
    private static readonly _nonIdentifierChars = AlphaTexLexer._buildNonIdentifierChars();

    private static _isIdentifierCharacter(ch: number): boolean {
        return !AlphaTexLexer._nonIdentifierChars.has(ch);
    }

    private static _isWhiteSpace(ch: number): boolean {
        return (
            ch === 0x20 /* space */ ||
            ch === 0x0a /* \n */ ||
            ch === 0x0d /* \r */ ||
            ch === 0x09 /* \t */ ||
            ch === 0x0b /* \v */
        );
    }
}
