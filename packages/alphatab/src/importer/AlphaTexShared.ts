import type {AlphaTexAstNodeLocation} from "@src/importer/AlphaTexAst";

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
    AT105 = 105,

    /**
     * Unexpected end of file.
     */
    AT106 = 106,

    /**
     * Unrecognized metadata '%s'.
     */
    AT107 = 107,

    /**
     * Unrecognized property '%s'.
     */
    AT108 = 108
}

/**
 * An error used to abort the parsing of the alphaTex source into an
 */
export class AlphaTexParserAbort extends Error {
}


export enum AlphaTexAccidentalMode {
    Auto = 0,
    Explicit = 1
}
