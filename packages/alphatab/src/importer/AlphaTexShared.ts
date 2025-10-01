import type { AlphaTexAstNodeLocation } from '@src/importer/AlphaTexAst';

/**
 * The different severity levels for diagnostics parsing alphaTex.
 */
export enum AlphaTexDiagnosticsSeverity {
    // TODO: hints when syntax without delimiters are used
    Hint = 0,
    Warning = 1,
    Error = 2
}

/**
 * A diagnostics message for the alphaTex parser.
 */
export interface AlphaTexDiagnostic {
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
    // 000 - 99 Lexer Errors
    // 100 - 199 Lexer Warnings
    // 200 - 299 Parser Errors
    // 300 - 399 Parser Warnings

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
     * Missing beat multiplier value after '*'.
     */
    AT200 = 200,

    /**
     * Missing duration value after ':'.
     */
    AT201 = 201,

    /**
     * Unexpected '%s' token. Expected a '\sync' meta data tag.
     */
    AT202 = 202,

    /**
     * Unexpected meta data tag '%s'. Expected a '\sync' meta data tag.
     */
    AT203 = 203,

    /**
     * Unexpected '%s' token. Expected one of following: %s
     */
    AT204 = 204,

    /**
     * Unexpected end of file.
     */
    AT205 = 205,

    /**
     * Unrecognized metadata '%s'.
     */
    AT206 = 206,

    /**
     * Unrecognized property '%s'.
     */
    AT207 = 207,

    /**
     * Unexpected end of file. Group not closed.
     */
    AT208 = 208,

    /**
     * Unexpected %s value '%s', expected: %s
     */
    AT209 = 209,

    /**
     * Missing values. Expected following values: %s
     */
    AT210 = 210,

    /**
     * Value is out of valid range. Allowed range: %s, Actual Value: %s
     */
    AT211 = 211,

    /**
     * Unrecogized property '%s', expected one of %s
     */
    AT212 = 212,

    /**
     * Invalid format for color
     */
    AT213 = 213,

    /**
     * The '%s' effect needs %s values per item. With %s points, %s values are needed, only %s values found.
     */
    AT214 = 214,

    /**
     * Cannot use pitched note value '%s' on %s staff, please specify notes using the 'fret.string' syntax.
     */
    AT215 = 215,

    /**
     * Cannot use pitched note value '%s' on percussion staff, please specify percussion articulations with numbers or names.
     */
    AT216 = 216,

    /**
     * Unrecognized note value '%s'.
     */
    AT217 = 217,

    /**
     * Missing string for fretted note.
     */
    AT218 = 218,

    /**
     * Note string is out of range. Available range: 1-%s
     */
    AT219 = 219,

    /**
     * Expected no values, but found some. Values are ignored.
     */
    AT300 = 300
}

export class AlphaTexDiagnosticBag implements Iterable<AlphaTexDiagnostic> {
    private _hasErrors = false;
    public readonly items: AlphaTexDiagnostic[] = [];
    public get hasErrors() {
        return this._hasErrors;
    }

    public push(diagnostic: AlphaTexDiagnostic) {
        this.items.push(diagnostic);
        if (diagnostic.severity === AlphaTexDiagnosticsSeverity.Error) {
            this._hasErrors = true;
        }
    }

    [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }
}

/**
 * An error used to abort the parsing of the alphaTex source into an
 */
export class AlphaTexParserAbort extends Error {}

export enum AlphaTexAccidentalMode {
    Auto = 0,
    Explicit = 1
}
