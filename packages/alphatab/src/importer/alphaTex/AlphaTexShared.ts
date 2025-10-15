import type { AlphaTexAstNodeLocation } from '@src/importer/alphaTex/AlphaTexAst';
import type { FlatSyncPoint } from '@src/model/Automation';
import type { SustainPedalMarker } from '@src/model/Bar';
import type { Beat } from '@src/model/Beat';
import type { DynamicValue } from '@src/model/DynamicValue';
import type { Lyrics } from '@src/model/Lyrics';
import type { Note } from '@src/model/Note';
import type { Score } from '@src/model/Score';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';

/**
 * The different severity levels for diagnostics parsing alphaTex.
 * @public
 */
export enum AlphaTexDiagnosticsSeverity {
    Hint = 0,
    Warning = 1,
    Error = 2
}

/**
 * A diagnostics message for the alphaTex parser.
 * @record
 * @public
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

/**
 * @public
 */
export enum AlphaTexDiagnosticCode {
    // 000 - 99 Lexer Errors
    // 100 - 199 Lexer Warnings
    // 200 - 299 Parser Errors
    // 300 - 399 Parser Warnings
    // 400 - 499 Parser Hints

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
     * Unexpected '%s' token. Expected one of following: %s
     */
    AT202 = 202,

    /**
     * Unexpected end of file.
     */
    AT203 = 203,

    /**
     * Unrecognized metadata '%s'.
     */
    AT204 = 204,

    /**
     * Unrecognized property '%s'.
     */
    AT205 = 205,

    /**
     * Unexpected end of file. Group not closed.
     */
    AT206 = 206,

    /**
     * Missing string for fretted note.
     */
    AT207 = 207,

    /**
     * Note string is out of range. Available range: 1-%s
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
     * Expected no values, but found some. Values are ignored.
     */
    AT300 = 300,

    /**
     * Metadata values should be wrapped into parenthesis.
     */
    AT301 = 301,

    /**
     * Metadata values should be placed before metadata properties.
     */
    AT302 = 302,

    /**
     * Property values should be wrapped into parenthesis.
     */
    AT303 = 303,

    /**
     * The beat multiplier should be specified after the beat effects.
     */
    AT304 = 304,

    /**
     * The dots separating score metadata, score contents and the sync points can be removed.
     */
    AT400 = 400
}

/**
 * @public
 */
export class AlphaTexDiagnosticBag implements Iterable<AlphaTexDiagnostic> {
    private _hasErrors = false;
    public readonly items: AlphaTexDiagnostic[] = [];
    
    public get errors(): AlphaTexDiagnostic[] {
        return this.items.filter(i => i.severity === AlphaTexDiagnosticsSeverity.Error);
    }

    public get hasErrors() {
        return this._hasErrors;
    }

    public push(diagnostic: AlphaTexDiagnostic) {
        this.items.push(diagnostic);
        if (diagnostic.severity === AlphaTexDiagnosticsSeverity.Error) {
            this._hasErrors = true;
        }
    }

    [Symbol.iterator](): Iterator<AlphaTexDiagnostic> {
        return this.items[Symbol.iterator]();
    }
}

/**
 * An error used to abort the parsing of the alphaTex source into an
 * @internal
 */
export class AlphaTexParserAbort extends Error {}

/**
 * @public
 */
export enum AlphaTexAccidentalMode {
    Auto = 0,
    Explicit = 1
}

/**
 * @public
 */
export interface IAlphaTexImporterState {
    score: Score;
    accidentalMode: AlphaTexAccidentalMode;
    currentDynamics: DynamicValue;
    currentTupletNumerator: number;
    currentTupletDenominator: number;

    readonly syncPoints: FlatSyncPoint[];
    readonly slurs: Map<string, Note>;
    readonly percussionArticulationNames: Map<string, number>;
    readonly lyrics: Map<number, Lyrics[]>;
    readonly staffHasExplicitDisplayTransposition: Set<Staff>;
    readonly staffHasExplicitTuning: Set<Staff>;
    readonly staffTuningApplied: Set<Staff>;
    readonly sustainPedalToBeat: Map<SustainPedalMarker, Beat>;
}

/**
 * @public
 */
export interface IAlphaTexImporter {
    readonly state: IAlphaTexImporterState;

    makeStaffPitched(staff: Staff): void;
    startNewVoice(): void;
    startNewTrack(): Track;
    applyPercussionStaff(staff: Staff): void;
    startNewStaff(): Staff;
    addSemanticDiagnostic(diagnostic: AlphaTexDiagnostic): void;
}
