// unfortunately the "old" alphaTex syntax had no strict delimiters
// for values and properties. That's why we need to parse the properties exactly
// as needed for the identifiers. In an alphaTex2 we should make this parsing simpler.
// the parser should not need to do that semantic checks, that's the importers job
// but we emit "Hint" diagnostics for now.

import {
    type AlphaTexAstNode,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataNode,
    type AlphaTexMetaDataTagNode,
    AlphaTexNodeType,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertyNode,
    type AlphaTexStringLiteral,
    type AlphaTexTextNode,
    type AlphaTexValueList,
    type AlphaTexValueListItem
} from '@src/importer/AlphaTexAst';
import type { AlphaTexParser } from '@src/importer/AlphaTexParser';
import {
    AlphaTexAccidentalMode,
    AlphaTexDiagnosticCode,
    type AlphaTexDiagnostics,
    AlphaTexDiagnosticsSeverity,
    AlphaTexParserAbort
} from '@src/importer/AlphaTexShared';
import { GeneralMidi } from '@src/midi/GeneralMidi';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType, type FlatSyncPoint } from '@src/model/Automation';
import { SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { BarreShape } from '@src/model/BarreShape';
import { type Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Color } from '@src/model/Color';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { FadeType } from '@src/model/FadeType';
import { Fermata, FermataType } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GolpeType } from '@src/model/GolpeType';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { Lyrics } from '@src/model/Lyrics';
import { ModelUtils } from '@src/model/ModelUtils';
import type { Note } from '@src/model/Note';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Ottavia } from '@src/model/Ottavia';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { PickStroke } from '@src/model/PickStroke';
import { Rasgueado } from '@src/model/Rasgueado';
import { BracketExtendMode, TrackNameMode, TrackNameOrientation, TrackNamePolicy } from '@src/model/RenderStylesheet';
import { type Score, ScoreSubElement } from '@src/model/Score';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';
import { Tuning } from '@src/model/Tuning';
import { VibratoType } from '@src/model/VibratoType';
import { WahPedal } from '@src/model/WahPedal';
import { WhammyType } from '@src/model/WhammyType';
import { TextAlign } from '@src/platform/ICanvas';
import { BeamDirection } from '@src/rendering/_barrel';
import { SynthConstants } from '@src/synth/SynthConstants';

export interface IAlphaTexMetaDataReader {
    readMetaDataValues(parser: AlphaTexParser, metaData: AlphaTexMetaDataTagNode): AlphaTexValueList | undefined;

    readMetaDataPropertyValues(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined;

    readBeatPropertyValues(parser: AlphaTexParser, property: AlphaTexPropertyNode): AlphaTexValueList | undefined;

    readDurationChangePropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined;

    readNotePropertyValues(parser: AlphaTexParser, property: AlphaTexPropertyNode): AlphaTexValueList | undefined;
}

export enum ApplyNodeResult {
    Applied,
    NotAppliedSemanticError,
    NotAppliedUnrecognizedMarker
}

export interface IAlphaTexLanguageHandler {
    applyStructuralMetaData(importer: IAlphaTexImporter, metaData: AlphaTexMetaDataNode): ApplyNodeResult;
    applyScoreMetaData(importer: IAlphaTexImporter, score: Score, metaData: AlphaTexMetaDataNode): ApplyNodeResult;
    applyStaffMetaData(importer: IAlphaTexImporter, staff: Staff, metaData: AlphaTexMetaDataNode): ApplyNodeResult;

    applyBeatDurationProperty(importer: IAlphaTexImporter, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyBeatProperty(importer: IAlphaTexImporter, beat: Beat, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyNoteProperty(importer: IAlphaTexImporter, note: Note, p: AlphaTexPropertyNode): ApplyNodeResult;

    readonly knownBeatProperties: Set<string>;
    readonly knownBarMetaDataTags: Set<string>;
    readonly knownBeatDurationProperties: Set<string>;

    buildSyncPoint(importer: IAlphaTexImporter, metaDataNode: AlphaTexMetaDataNode): FlatSyncPoint | undefined;
}

export interface IAlphaTexImporter {
    makeStaffPitched(staff: Staff): void;
    startNewVoice(): void;
    startNewTrack(): Track;
    applyPercussionStaff(staff: Staff): void;
    startNewStaff(): Staff;

    accidentalMode: AlphaTexAccidentalMode;
    currentDynamics: DynamicValue;
    currentTupletNumerator: number;
    currentTupletDenominator: number;

    readonly slurs: Map<string, Note>;
    readonly percussionArticulationNames: Map<string, number>;
    readonly lyrics: Map<number, Lyrics[]>;
    readonly staffHasExplicitDisplayTransposition: Set<Staff>;
    readonly staffHasExplicitTuning: Set<Staff>;
    readonly staffTuningApplied: Set<Staff>;
    readonly sustainPedalToBeat: Map<SustainPedalMarker, Beat>;

    addSemanticDiagnostic(diagnostic: AlphaTexDiagnostics): void;
}

/**
 * Defines how the value of the meta data tag is parsed.
 */
enum ValueListParseTypesMode {
    /**
     * Indicates that the value of the given types is required.
     * If the token matches, it is added to the value list.
     * If the token does not match, an error diagnostic is added and parsing is stopped.
     */
    Required,
    /**
     * Indicates that the value of the given types is optional.
     * If the token matches, it is added to the value list.
     * If the token does not match, the value list completes and parsing continues.
     */
    Optional,

    /**
     * Same as {@link Required} but the next value is interpreted as a float.
     */
    RequiredAsFloat,

    /**
     * Same as {@link Optional} but the next value is interpreted as a float.
     */
    OptionalAsFloat,

    /**
     * Indicates that the value of the given types is optional and if matched the
     * only value of this list.
     * If the token matches, it is added to the value list and the parsing continues.
     * If the token does not match, the value list completes and parsing continues.
     */
    OptionalAndStop,

    /**
     * Indicates that multiple values of the same types should be parsed as a value list.
     * If the token is a open parenthesis, it starts reading the specified types as value list. If an unexpected item is
     * encountered an error diagnostic is added.
     * If the token is not an open parenthesis, an error diagnostic is added and parsing is stopped.
     */
    RequiredAsValueList,

    /**
     * Indicates that multiple values of the same types should be parsed.
     * If the token matches, it is added to the value list. Parsing stays on the current type.
     * If the token does not match, the value list completes and parsing continues.
     */
    ValueListWithoutParenthesis
}

type ValueListParseTypes = [AlphaTexNodeType[] /* accepted types */, ValueListParseTypesMode][];

export class AlphaTex1LanguageHandler implements IAlphaTexMetaDataReader, IAlphaTexLanguageHandler {
    public static readonly instance = new AlphaTex1LanguageHandler();

    private static readonly scoreInfoValueListTypes: ValueListParseTypes = [
        [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Required],
        [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Optional],
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional]
    ];
    private static readonly numberOnlyValueListTypes: ValueListParseTypes = [
        [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required]
    ];
    private static readonly textLikeValueListTypes: ValueListParseTypes = [
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Required]
    ];

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in `\chord {}` properties.
     */
    private static readonly chordPropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // firstfret 3
        ['firstfret', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // showdiagram, showdiagram true, showdiagram false, showdiagram 0, showdiagram 1
        [
            'showdiagram',
            [
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Optional
                ]
            ]
        ],

        // showfingering, showfingering true, showfingering false, showfingering 0, showfingering 1
        [
            'showfingering',
            [
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Optional
                ]
            ]
        ],

        // showname, showname true, showname false, showname 0, showname 1
        [
            'showname',
            [
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Optional
                ]
            ]
        ],

        // barre 1 2 3
        ['barre', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.ValueListWithoutParenthesis]]]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in `\track {}` properties.
     */
    private static readonly trackPropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // color red, color "#FF0000"
        ['color', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // defaultsystemslayout 3
        ['defaultsystemslayout', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // volume 16
        ['volume', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // balance 16
        ['balance', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // balance 16
        ['bank', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // systemslayout 1 2 3 4 5
        ['systemslayout', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.ValueListWithoutParenthesis]]],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            [
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ]
        ],

        ['mute', undefined],
        ['solo', undefined],
        ['multibarrest', undefined]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in beat level properties (beat effects).
     */
    private static readonly beatPropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        ['f', undefined],
        ['fo', undefined],
        ['vs', undefined],
        ['v', undefined],
        ['vw', undefined],
        ['s', undefined],
        ['p', undefined],
        ['tt', undefined],
        ['dd', undefined],
        ['d', undefined],
        ['su', undefined],
        ['sd', undefined],
        ['cre', undefined],
        ['dec', undefined],
        ['spd', undefined],
        ['sph', undefined],
        ['spu', undefined],
        ['spe', undefined],
        ['slashed', undefined],
        ['ds', undefined],
        ['glpf', undefined],
        ['glpt', undefined],
        ['waho', undefined],
        ['wahc', undefined],

        // tu 3, tu 3,2
        [
            'tu',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ]
        ],

        // txt "Text", txt Intro
        ['txt', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // lyrics "Lyrics", lyrics 2 "Lyrics Line 2"
        [
            'lyrics',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Required]
            ]
        ],

        // tu 3, tu 3 2
        [
            'tu',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ]
        ],

        // tb dip fast (0 -1 0), tb dip (0 -1 0), tb (0 -1 0)
        [
            'tb',
            [
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsValueList]
            ]
        ],

        // tbe dip fast (0 0 -1 30 0 60), tbe dip (0 0 -1 30 0 60), tbe (0 0 -1 30 0 60)
        [
            'tbe',
            [
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsValueList]
            ]
        ],

        // bu, bu 16
        ['bu', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]]],

        // bd, bd 16
        ['bd', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]]],

        // au, au 16
        ['au', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]]],

        // ad, ad 16
        ['ad', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]]],

        // ch C, ch "C"
        ['ch', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // gr, gr ob, gr b
        ['gr', [[[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional]]],

        // dy F, dy "F"
        ['dy', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // tempo 120
        ['tempo', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // volume 10
        ['volume', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // balance 0
        ['balance', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // tp 16
        ['tp', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // barre 7, barre 7 full, barre 7 "half"
        [
            'barre',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional]
            ]
        ],

        // rasg ii, rasg "mi"
        ['rasg', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // ot 15ma, ot "regular"
        ['ot', AlphaTex1LanguageHandler.textLikeValueListTypes]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in beat duration properties.
     */
    private static readonly beatDurationPropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // tu 3, tu 3,2
        [
            'tu',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ]
        ]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in note level properties (note effects).
     */
    private static readonly notePropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        ['nh', undefined],
        ['ah', undefined],
        ['th', undefined],
        ['ph', undefined],
        ['sh', undefined],
        ['v', undefined],
        ['vw', undefined],
        ['sl', undefined],
        ['ss', undefined],
        ['sib', undefined],
        ['sia', undefined],
        ['sod', undefined],
        ['psd', undefined],
        ['psu', undefined],
        ['h', undefined],
        ['lht', undefined],
        ['g', undefined],
        ['ac', undefined],
        ['hac', undefined],
        ['ten', undefined],
        ['pm', undefined],
        ['st', undefined],
        ['lr', undefined],
        ['x', undefined],
        ['-', undefined],
        ['t', undefined],
        ['turn', undefined],
        ['iturn', undefined],
        ['umordent', undefined],
        ['lmordent', undefined],
        ['string', undefined],
        ['hide', undefined],

        // b bendRelease fast (0 4 0), b bendRelease (0 4 0), b (0 4 0)
        [
            'b',
            [
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsValueList]
            ]
        ],

        //  be bendRelease fast (0 0 4 30 0 60), be bendRelease (0 0 4 30 0 60), be (0 0 4 30 0 60)
        [
            'tbe',
            [
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsValueList]
            ]
        ],

        // tr 14, tr 14 32
        [
            'tr',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ]
        ],

        // lf, lf 1
        ['lf', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]]],

        // rf, rf 1
        ['rf', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]]],

        // acc "#"
        ['acc', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // slur S1, slur "1"
        ['slur', AlphaTex1LanguageHandler.textLikeValueListTypes]
    ]);

    private static readonly syncMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // \sync BarIndex Occurence MillisecondOffset
        // \sync BarIndex Occurence MillisecondOffset RatioPosition
        [
            'sync',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.OptionalAsFloat]
            ]
        ]
    ]);

    private static readonly structuralMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // track, track Name, track ShortName Name, track "Name", track "ShortName" "Name"
        [
            'track',
            [
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional]
            ]
        ],
        ['staff', undefined],
        ['voice', undefined]
    ]);

    private static readonly staffMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // tuning E4 B3 G3 D3 A2 E2, \tuning "E4" "B3" "G3" "D3"
        [
            'tuning',
            [
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral],
                    ValueListParseTypesMode.ValueListWithoutParenthesis
                ]
            ]
        ],

        // chord "C" 0 1 0 2 3 x
        [
            'chord',
            [
                [[AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Required],
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.ValueListWithoutParenthesis
                ]
            ]
        ],
        // capo 3
        ['capo', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            [
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ]
        ],
        // bank 127
        ['bank', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // lyrics "Text", lyrics 1 "Text"
        [
            'lyrics',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Required]
            ]
        ],

        // articulation defaults, articulation "Name" 27
        [
            'articulation',
            [
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ]
        ],

        // displaytranspose -12
        ['displaytranspose', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // transpose -12
        ['transpose', AlphaTex1LanguageHandler.numberOnlyValueListTypes]
    ]);

    private static readonly scoreMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        ['title', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['subtitle', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['artist', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['album', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['words', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['music', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['wordsandmusic', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['copyright', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['copyright2', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['instructions', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['notices', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['tab', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        [
            'tempo',
            [
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.OptionalAsFloat]
            ]
        ],
        ['defaultsystemslayout', AlphaTex1LanguageHandler.numberOnlyValueListTypes],
        ['systemslayout', AlphaTex1LanguageHandler.numberOnlyValueListTypes],
        ['hidedynamics', undefined],
        ['showdynamics', undefined],
        ['usesystemsignseparator', undefined],
        ['multibarrest', undefined],
        ['bracketextendmode', AlphaTex1LanguageHandler.textLikeValueListTypes],
        ['singletracktracknamepolicy', AlphaTex1LanguageHandler.textLikeValueListTypes],
        ['multitracktracknamepolicy', AlphaTex1LanguageHandler.textLikeValueListTypes],
        ['firstsystemtracknamemode', AlphaTex1LanguageHandler.textLikeValueListTypes],
        ['othersystemstracknamemode', AlphaTex1LanguageHandler.textLikeValueListTypes],
        ['firstsystemtracknameorientation', AlphaTex1LanguageHandler.textLikeValueListTypes],
        ['othersystemstracknameorientation', AlphaTex1LanguageHandler.textLikeValueListTypes]
    ]);

    /**
     * Contains the definitions how to read the metadata values for given metadata tags using
     * {@link readTypedValueList}
     * @private
     */
    private static readonly barMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // rc 2
        ['rc', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // ae (1 2 3), ae 2
        ['ae', [[[AlphaTexNodeType.ValueList, AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required]]],

        // ts common, ts "common", ts 3 4
        [
            'ts',
            [
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.OptionalAndStop
                ],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required]
            ]
        ],

        // ks fmajor or ks "fmajor"
        ['ks', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // clef G2, clef "g2", clef 43,
        ['clef', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // section "Text", section "Marker" "Text", section Intro, section I Intro
        [
            'section',
            [
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional]
            ]
        ],

        // tf triplet16th, tf "Triplet16th", tf 1
        [
            'tf',
            [
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ]
        ],

        // barlineleft dotted, barlineleft "dotted"
        ['barlineleft', AlphaTex1LanguageHandler.textLikeValueListTypes],
        // barlineright dotted, barlineright "dotted"
        ['barlineright', AlphaTex1LanguageHandler.textLikeValueListTypes],
        // accidentals auto, accidentals "explicit"
        ['accidentals', AlphaTex1LanguageHandler.textLikeValueListTypes],
        // jump fine, jump "segno"
        ['jump', AlphaTex1LanguageHandler.textLikeValueListTypes],
        // ottava 15ma, ottava "regular"
        ['ottava', AlphaTex1LanguageHandler.textLikeValueListTypes],
        // simile none, simile "firstOfDouble"
        ['simile', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // width 300
        ['width', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // scale 0.5
        ['scale', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsFloat]]],

        ['spd', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.OptionalAsFloat]]],
        ['spu', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.OptionalAsFloat]]],
        ['sph', [[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.OptionalAsFloat]]],

        ['ft', undefined],
        ['ro', undefined],
        ['ac', undefined],
        ['db', undefined]
    ]);

    private static readonly metaDataValueListTypes = [
        AlphaTex1LanguageHandler.scoreMetaDataValueListTypes,
        AlphaTex1LanguageHandler.staffMetaDataValueListTypes,
        AlphaTex1LanguageHandler.structuralMetaDataValueListTypes,
        AlphaTex1LanguageHandler.barMetaDataValueListTypes,
        AlphaTex1LanguageHandler.syncMetaDataValueListTypes
    ];

    public readMetaDataValues(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode
    ): AlphaTexValueList | undefined {
        const tag = metaData.tag.text.toLowerCase();

        for (const lookup of AlphaTex1LanguageHandler.metaDataValueListTypes) {
            if (lookup.has(tag)) {
                const types = lookup.get(tag);
                if (types) {
                    return this.readTypedValueList(parser, types);
                } else {
                    return undefined;
                }
            }
        }

        parser.addParserDiagnostic({
            code: AlphaTexDiagnosticCode.AT107,
            message: `Unrecognized metadata '${metaData.tag.text}'.`,
            severity: AlphaTexDiagnosticsSeverity.Error,
            start: metaData.start,
            end: metaData.end
        });
        throw new AlphaTexParserAbort();
    }

    public readMetaDataPropertyValues(
        parser: AlphaTexParser,
        metaData: AlphaTexMetaDataTagNode,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        switch (metaData.tag.text.toLowerCase()) {
            case 'track':
                return this.readPropertyValues(
                    parser,
                    [AlphaTex1LanguageHandler.trackPropertyValueListTypes],
                    property
                );
            case 'chord':
                return this.readPropertyValues(
                    parser,
                    [AlphaTex1LanguageHandler.chordPropertyValueListTypes],
                    property
                );
            default:
                return undefined;
        }
    }

    private readPropertyValues(
        parser: AlphaTexParser,
        lookups: Map<string, ValueListParseTypes | undefined>[],
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        const tag = property.property.text.toLowerCase();
        for (const lookup of lookups) {
            if (lookup.has(tag)) {
                const types = lookup.get(tag);
                if (types) {
                    return this.readTypedValueList(parser, types);
                } else {
                    return undefined;
                }
            }
        }
        parser.addParserDiagnostic({
            code: AlphaTexDiagnosticCode.AT108,
            message: `Unrecognized property '${property.property.text}'.`,
            severity: AlphaTexDiagnosticsSeverity.Error,
            start: property.property.start,
            end: property.property.end
        });
        throw new AlphaTexParserAbort();
    }

    public readBeatPropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        return this.readPropertyValues(parser, [AlphaTex1LanguageHandler.beatPropertyValueListTypes], property);
    }

    public readDurationChangePropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        return this.readPropertyValues(parser, [AlphaTex1LanguageHandler.beatDurationPropertyValueListTypes], property);
    }

    public readNotePropertyValues(
        parser: AlphaTexParser,
        property: AlphaTexPropertyNode
    ): AlphaTexValueList | undefined {
        return this.readPropertyValues(
            parser,
            [AlphaTex1LanguageHandler.notePropertyValueListTypes, AlphaTex1LanguageHandler.beatPropertyValueListTypes],
            property
        );
    }

    private readTypedValueList(
        parser: AlphaTexParser,
        expectedValues: ValueListParseTypes
    ): AlphaTexValueList | undefined {
        const valueList: AlphaTexValueList = {
            nodeType: AlphaTexNodeType.ValueList,
            values: [],
            start: parser.lexer.peekToken()?.start,
            comments: parser.lexer.peekToken()?.comments
        };
        let error = false;
        try {
            let i = 0;
            while (i < expectedValues.length) {
                const expected = expectedValues[i];

                const value = parser.lexer.peekToken();
                if (!value) {
                    break;
                }

                // NOTE: The parser already handles parenthesized value lists, we only need to handle this
                // parse mode in the validation.

                if (expected[0].includes(value.nodeType)) {
                    this.handleTypeValueListItem(parser, valueList, value, expected[1]);
                    switch (expected[1]) {
                        case ValueListParseTypesMode.OptionalAndStop:
                            // stop reading values
                            i = expectedValues.length;
                            break;
                        case ValueListParseTypesMode.ValueListWithoutParenthesis:
                            // stay on current element
                            break;
                        default:
                            // advance to next item
                            i++;
                            break;
                    }
                } else {
                    switch (expected[1]) {
                        // end of value list
                        case ValueListParseTypesMode.ValueListWithoutParenthesis:
                            i++;
                            break;
                        case ValueListParseTypesMode.Required:
                        case ValueListParseTypesMode.RequiredAsFloat:
                            parser.unexpectedToken(value, expected[0], true);
                            error = true;
                            break;
                        // Others: just proceed
                    }
                }
            }
        } finally {
            valueList.end = parser.lexer.currentTokenLocation();
        }

        if (error) {
            throw new AlphaTexParserAbort();
        }

        if (valueList.values.length === 0) {
            return undefined;
        }

        return valueList;
    }

    private handleTypeValueListItem(
        parser: AlphaTexParser,
        valueList: AlphaTexValueList,
        value: AlphaTexAstNode,
        mode: ValueListParseTypesMode
    ) {
        switch (value.nodeType) {
            case AlphaTexNodeType.Identifier:
                valueList.values.push(parser.lexer.nextToken() as AlphaTexIdentifier);
                break;
            case AlphaTexNodeType.StringLiteral:
                valueList.values.push(parser.lexer.nextToken() as AlphaTexStringLiteral);
                break;
            case AlphaTexNodeType.NumberLiteral:
                switch (mode) {
                    case ValueListParseTypesMode.RequiredAsFloat:
                    case ValueListParseTypesMode.OptionalAsFloat:
                        valueList.values.push(parser.lexer.nextTokenWithFloats() as AlphaTexNumberLiteral);
                        break;
                    default:
                        valueList.values.push(parser.lexer.nextToken() as AlphaTexNumberLiteral);
                        break;
                }
                break;
            case AlphaTexNodeType.ParenthesisOpenToken:
                const nestedList = parser.valueList();
                if (nestedList) {
                    valueList.values.push(nestedList);
                }
                break;
        }
    }

    public applyScoreMetaData(
        importer: IAlphaTexImporter,
        score: Score,
        metaData: AlphaTexMetaDataNode
    ): ApplyNodeResult {
        const result = this.checkValueListTypes(
            importer,
            [AlphaTex1LanguageHandler.staffMetaDataValueListTypes],
            metaData,
            metaData.tag.tag.text.toLowerCase(),
            metaData.values
        );
        if (result !== undefined) {
            return result!;
        }

        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'title':
                score.title = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.Title, metaData);
                return ApplyNodeResult.Applied;
            case 'subtitle':
                score.subTitle = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.SubTitle, metaData);
                return ApplyNodeResult.Applied;
            case 'artist':
                score.artist = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.Artist, metaData);
                return ApplyNodeResult.Applied;
            case 'album':
                score.album = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.Album, metaData);
                return ApplyNodeResult.Applied;
            case 'words':
                score.words = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.Words, metaData);
                return ApplyNodeResult.Applied;
            case 'music':
                score.music = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.Music, metaData);
                return ApplyNodeResult.Applied;
            case 'copyright':
                score.copyright = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.Copyright, metaData);
                return ApplyNodeResult.Applied;
            case 'instructions':
                score.instructions = (metaData.values!.values[0] as AlphaTexTextNode).text;
                return ApplyNodeResult.Applied;
            case 'notices':
                score.notices = (metaData.values!.values[0] as AlphaTexTextNode).text;
                return ApplyNodeResult.Applied;
            case 'tab':
                score.tab = (metaData.values!.values[0] as AlphaTexTextNode).text;
                this.headerFooterStyle(importer, score, ScoreSubElement.Transcriber, metaData);
                return ApplyNodeResult.Applied;
            case 'copyright2':
                this.headerFooterStyle(importer, score, ScoreSubElement.CopyrightSecondLine, metaData);
                return ApplyNodeResult.Applied;
            case 'wordsandmusic':
                this.headerFooterStyle(importer, score, ScoreSubElement.WordsAndMusic, metaData);
                return ApplyNodeResult.Applied;
            case 'tempo':
                score.tempo = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                if (metaData.values!.values.length > 1) {
                    score.tempoLabel = (metaData.values!.values[0] as AlphaTexTextNode).text;
                }
                return ApplyNodeResult.Applied;
            case 'defaultsystemslayout':
                score.defaultSystemsLayout = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'systemslayout':
                for (const v of metaData.values!.values) {
                    score.systemsLayout.push((v as AlphaTexNumberLiteral).value);
                }
                return ApplyNodeResult.Applied;
            case 'hidedynamics':
                score.stylesheet.hideDynamics = true;
                return ApplyNodeResult.Applied;
            case 'showdynamics':
                score.stylesheet.hideDynamics = false;
                return ApplyNodeResult.Applied;
            case 'bracketextendmode':
                const bracketExtendMode = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'bracket extend mode',
                    AlphaTex1LanguageHandler.bracketExtendModes
                );
                if (bracketExtendMode === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.bracketExtendMode = bracketExtendMode!;
                return ApplyNodeResult.Applied;
            case 'usesystemsignseparator':
                score.stylesheet.useSystemSignSeparator = false;
                return ApplyNodeResult.Applied;
            case 'multibarrest':
                score.stylesheet.multiTrackMultiBarRest = false;
                return ApplyNodeResult.Applied;
            case 'singletracktracknamepolicy':
                const singleTrackTrackNamePolicy = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name policy',
                    AlphaTex1LanguageHandler.trackNamePolicies
                );
                if (singleTrackTrackNamePolicy === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.singleTrackTrackNamePolicy = singleTrackTrackNamePolicy!;
                return ApplyNodeResult.Applied;
            case 'multitracktracknamepolicy':
                const multiTrackTrackNamePolicy = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name policy',
                    AlphaTex1LanguageHandler.trackNamePolicies
                );
                if (multiTrackTrackNamePolicy === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.multiTrackTrackNamePolicy = multiTrackTrackNamePolicy!;
                return ApplyNodeResult.Applied;
            case 'firstsystemtracknamemode':
                const firstSystemTrackNameMode = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name mode',
                    AlphaTex1LanguageHandler.trackNameMode
                );
                if (firstSystemTrackNameMode === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.firstSystemTrackNameMode = firstSystemTrackNameMode!;
                return ApplyNodeResult.Applied;
            case 'othersystemstracknamemode':
                const otherSystemsTrackNameMode = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name mode',
                    AlphaTex1LanguageHandler.trackNameMode
                );
                if (otherSystemsTrackNameMode === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.otherSystemsTrackNameMode = otherSystemsTrackNameMode!;
                return ApplyNodeResult.Applied;
            case 'firstsystemtracknameorientation':
                const firstSystemTrackNameOrientation = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name orientation',
                    AlphaTex1LanguageHandler.trackNameOrientations
                );
                if (firstSystemTrackNameOrientation === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.firstSystemTrackNameOrientation = firstSystemTrackNameOrientation!;
                return ApplyNodeResult.Applied;
            case 'othersystemstracknameorientation':
                const otherSystemsTrackNameOrientation = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name orientation',
                    AlphaTex1LanguageHandler.trackNameOrientations
                );
                if (otherSystemsTrackNameOrientation === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.otherSystemsTrackNameOrientation = otherSystemsTrackNameOrientation!;
                return ApplyNodeResult.Applied;
            default:
                return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }
    }

    private checkValueListTypes(
        importer: IAlphaTexImporter,
        lookupList: Map<string, ValueListParseTypes | undefined>[],
        parent: AlphaTexAstNode,
        tag: string,
        values: AlphaTexValueList | undefined
    ): ApplyNodeResult | undefined {
        const lookup = lookupList.find(l => l.has(tag));
        if (!lookup) {
            return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }

        const types = lookup.get(tag);
        if (types === undefined) {
            if (values) {
                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT001, // TODO code
                    message: `Expected no values, but found some. Values are ignored.`,
                    start: values.start,
                    end: values.end,
                    severity: AlphaTexDiagnosticsSeverity.Warning
                });
            }
            return undefined;
        }

        if (!this.validateValueListTypes(importer, types, parent, values)) {
            return ApplyNodeResult.NotAppliedSemanticError;
        }

        return undefined;
    }

    public applyStaffMetaData(
        importer: IAlphaTexImporter,
        staff: Staff,
        metaData: AlphaTexMetaDataNode
    ): ApplyNodeResult {
        const result = this.checkValueListTypes(
            importer,
            [AlphaTex1LanguageHandler.staffMetaDataValueListTypes],
            metaData,
            metaData.tag.tag.text.toLowerCase(),
            metaData.values
        );
        if (result !== undefined) {
            return result!;
        }

        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'capo':
                staff.capo = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'tuning':
                const tuning: number[] = [];
                let hideTuning = false;
                for (let i = 0; i < metaData.values!.values.length; i++) {
                    const v = metaData.values!.values[i];
                    const text = (v as AlphaTexTextNode).text;
                    switch (text) {
                        case 'piano':
                        case 'none':
                        case 'voice':
                            importer.makeStaffPitched(staff);
                            i = metaData.values!.values.length;
                            break;
                        case 'hide':
                            hideTuning = true;
                            break;
                        default:
                            const t = ModelUtils.parseTuning(text);
                            if (t) {
                                tuning.push(t.realValue);
                            } else {
                                importer.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT108, // TODO code
                                    message: `Expected a tuning value but found '${text}'`,
                                    start: v.start,
                                    end: v.end,
                                    severity: AlphaTexDiagnosticsSeverity.Error
                                });
                            }
                            break;
                    }
                }

                importer.staffHasExplicitTuning.add(staff);
                importer.staffTuningApplied.delete(staff);
                staff.stringTuning = new Tuning();
                staff.stringTuning.tunings = tuning;
                if (hideTuning) {
                    if (!staff.track.score.stylesheet.perTrackDisplayTuning) {
                        staff.track.score.stylesheet.perTrackDisplayTuning = new Map<number, boolean>();
                    }
                    staff.track.score.stylesheet.perTrackDisplayTuning!.set(staff.track.index, false);
                }
                return ApplyNodeResult.Applied;
            case 'instrument':
                importer.staffTuningApplied.delete(staff);
                this.readTrackInstrument(importer, staff.track, metaData);

                return ApplyNodeResult.Applied;
            case 'bank':
                staff.track.playbackInfo.bank = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'lyrics':
                const lyrics: Lyrics = new Lyrics();
                lyrics.startBar = 0;
                lyrics.text = '';
                if (metaData.values!.values.length === 2) {
                    lyrics.startBar = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                    lyrics.text = (metaData.values!.values[1] as AlphaTexTextNode).text;
                } else {
                    lyrics.text = (metaData.values!.values[0] as AlphaTexTextNode).text;
                }
                importer.lyrics.get(staff.track.index)!.push(lyrics);

                return ApplyNodeResult.Applied;
            case 'chord':
                const chord = new Chord();
                this.chordProperties(importer, chord, metaData);
                chord.name = (metaData.values!.values[0] as AlphaTexTextNode).text;

                for (let i = 1; i < metaData.values!.values.length; i++) {
                    chord.strings.push((metaData.values!.values[i] as AlphaTexNumberLiteral).value);
                }
                staff.addChord(AlphaTex1LanguageHandler.getChordId(staff, chord.name), chord);
                return ApplyNodeResult.Applied;
            case 'articulation':
                const percussionArticulationNames = importer.percussionArticulationNames;
                const articulationName = (metaData.values!.values[0] as AlphaTexTextNode).text;
                if (articulationName === 'defaults') {
                    for (const [defaultName, defaultValue] of PercussionMapper.instrumentArticulationNames) {
                        percussionArticulationNames.set(defaultName.toLowerCase(), defaultValue);
                        percussionArticulationNames.set(
                            AlphaTex1LanguageHandler.toArticulationId(defaultName),
                            defaultValue
                        );
                    }
                    return ApplyNodeResult.Applied;
                }

                if (metaData.values!.values.length === 2) {
                    const number = (metaData.values!.values[1] as AlphaTexNumberLiteral).value;
                    if (PercussionMapper.instrumentArticulations.has(number)) {
                        percussionArticulationNames.set(articulationName.toLowerCase(), number);
                        return ApplyNodeResult.Applied;
                    } else {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT001, // TODO code
                            message: `Unknown articulation ${number}. Refer to https://www.alphatab.net/docs/alphatex/percussion for available ids`,
                            start: metaData.values!.values[1].start,
                            end: metaData.values!.values[1].end,
                            severity: AlphaTexDiagnosticsSeverity.Error
                        });
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                }

                return ApplyNodeResult.Applied;
            case 'accidentals':
                return AlphaTex1LanguageHandler.handleAccidentalMode(importer, metaData.values!);
            case 'displaytranspose':
                staff.displayTranspositionPitch = (metaData.values!.values[0] as AlphaTexNumberLiteral).value * -1;
                importer.staffHasExplicitDisplayTransposition.add(staff);
                return ApplyNodeResult.Applied;
            case 'transpose':
                staff.transpositionPitch = (metaData.values!.values[0] as AlphaTexNumberLiteral).value * -1;
                return ApplyNodeResult.Applied;
            default:
                return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }
    }

    private static handleAccidentalMode(importer: IAlphaTexImporter, values: AlphaTexValueList): ApplyNodeResult {
        const accidentalMode = AlphaTex1LanguageHandler.parseEnumValue(
            importer,
            values,
            'accidental mode',
            AlphaTex1LanguageHandler.accidentalModes
        );
        if (accidentalMode === undefined) {
            return ApplyNodeResult.NotAppliedSemanticError;
        }
        importer.accidentalMode = accidentalMode!;
        return ApplyNodeResult.Applied;
    }

    private static toArticulationId(plain: string): string {
        return plain.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    private static getChordId(currentStaff: Staff, chordName: string): string {
        return chordName.toLowerCase() + currentStaff.index + currentStaff.track.index;
    }

    public buildSyncPoint(importer: IAlphaTexImporter, metaData: AlphaTexMetaDataNode): FlatSyncPoint | undefined {
        const tag = metaData.tag.tag.text.toLowerCase();
        const types = AlphaTex1LanguageHandler.syncMetaDataValueListTypes.get(tag)!;
        if (!this.validateValueListTypes(importer, types, metaData, metaData.values)) {
            return undefined;
        }

        const barIndex = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
        const barOccurence = (metaData.values!.values[1] as AlphaTexNumberLiteral).value;
        const millisecondOffset = (metaData.values!.values[2] as AlphaTexNumberLiteral).value;
        let barPosition = 0;
        if (metaData.values!.values.length > 3) {
            barPosition = (metaData.values!.values[3] as AlphaTexNumberLiteral).value;
        }

        return {
            barIndex,
            barOccurence,
            barPosition,
            millisecondOffset
        };
    }

    private validateValueListTypes(
        importer: IAlphaTexImporter,
        expectedValues: ValueListParseTypes,
        parent: AlphaTexAstNode,
        values: AlphaTexValueList | undefined
    ) {
        let error = false;
        let expectedIndex = 0;
        let actualIndex = 0;

        if (!values) {
            const expectedTypes = AlphaTex1LanguageHandler.buildExpectedTypesMessage(expectedValues);

            importer.addSemanticDiagnostic({
                code: AlphaTexDiagnosticCode.AT001, // TODO code
                message: `Missing values. Expected ${expectedTypes}, found`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: parent.start,
                end: parent.end
            });
            return false;
        }

        while (expectedIndex < expectedValues.length) {
            const expected = expectedValues[expectedIndex];

            if (actualIndex >= values.values.length) {
                error = true;
                break;
            }
            const value = actualIndex < values.values.length ? values.values[actualIndex++] : undefined;

            if (value && expected[0].includes(value.nodeType)) {
                switch (expected[1]) {
                    case ValueListParseTypesMode.OptionalAndStop:
                        // stop reading values
                        expectedIndex = expectedValues.length;
                        break;
                    case ValueListParseTypesMode.RequiredAsValueList:
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                        // stay on current element
                        break;
                    default:
                        // advance to next item
                        expectedIndex++;
                        break;
                }
            } else {
                const expectedTypes = AlphaTex1LanguageHandler.buildExpectedTypesMessage([expected]);
                switch (expected[1]) {
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                        // end of value list as soon ewe have a different tpye
                        expectedIndex++;
                        break;
                    case ValueListParseTypesMode.Required:
                    case ValueListParseTypesMode.RequiredAsFloat:
                    case ValueListParseTypesMode.RequiredAsValueList:
                        error = true;

                        if (value) {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT107, // TODO code
                                message: `Invalid required value. Expected ${expectedTypes}, found: ${AlphaTexNodeType[value.nodeType]}`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: value.start,
                                end: value.end
                            });
                        } else {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT107, // TODO code
                                message: `Missing required value. Expected ${expectedTypes}`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: values.end,
                                end: values.end
                            });
                        }

                        break;
                    case ValueListParseTypesMode.Optional:
                    case ValueListParseTypesMode.OptionalAsFloat:
                        if (value) {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT107, // TODO code
                                message: `Invalid optional value. Expected ${expectedTypes}, found: ${AlphaTexNodeType[value.nodeType]}`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: value.start,
                                end: value.end
                            });
                        }
                        break;
                }
            }
        }

        return !error;
    }

    private headerFooterStyle(
        importer: IAlphaTexImporter,
        score: Score,
        element: ScoreSubElement,
        metaData: AlphaTexMetaDataNode
    ) {
        if (metaData.values!.values.length < 2) {
            return;
        }

        const style = ModelUtils.getOrCreateHeaderFooterStyle(score, element);
        if (style.isVisible === undefined) {
            style.isVisible = true;
        }

        const value = (metaData.values!.values[1] as AlphaTexTextNode).text;
        if (value) {
            style.template = value;
        } else {
            style.isVisible = false;
        }

        if (metaData.values!.values.length < 3) {
            return;
        }

        const textAlign = AlphaTex1LanguageHandler.parseEnumValue(
            importer,
            metaData.values!,
            'textAlign',
            AlphaTex1LanguageHandler.textAligns,
            2
        );
        if (textAlign === undefined) {
            return;
        }
        style.textAlign = textAlign!;
    }

    private static buildExpectedTypesMessage(values: ValueListParseTypes) {
        const parts: string[] = [];

        for (const v of values) {
            const types = v[0].map(t => AlphaTexNodeType[t]).join('|');
            switch (v[1]) {
                case ValueListParseTypesMode.Required:
                case ValueListParseTypesMode.RequiredAsFloat:
                    parts.push(`required(${types})`);
                    break;
                case ValueListParseTypesMode.Optional:
                case ValueListParseTypesMode.OptionalAsFloat:
                    parts.push(`optional(${types})`);
                    break;
                case ValueListParseTypesMode.OptionalAndStop:
                    parts.push(`only(${types})`);
                    break;
                case ValueListParseTypesMode.ValueListWithoutParenthesis:
                    parts.push(`listOf(${types})`);
                    break;
            }
        }

        return parts.join(',');
    }

    private readTrackInstrument(importer: IAlphaTexImporter, track: Track, metaData: AlphaTexMetaDataNode) {
        switch (metaData.values!.values[0].nodeType) {
            case AlphaTexNodeType.NumberLiteral:
                const instrument = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                if (instrument >= 0 && instrument <= 127) {
                    track.playbackInfo.program = instrument;
                } else {
                    importer.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT107, // TODO code
                        message: `Value is out of valid range. Allowed range: 0-127, Actual Value: ${instrument}`,
                        start: metaData.values!.values[0].start,
                        end: metaData.values!.values[0].end,
                        severity: AlphaTexDiagnosticsSeverity.Error
                    });
                }
                break;
            case AlphaTexNodeType.Identifier:
            case AlphaTexNodeType.StringLiteral:
                const instrumentName = (metaData.values!.values[0] as AlphaTexTextNode).text.toLowerCase();
                if (instrumentName === 'percussion') {
                    for (const staff of track.staves) {
                        importer.applyPercussionStaff(staff);
                    }
                    track.playbackInfo.primaryChannel = SynthConstants.PercussionChannel;
                    track.playbackInfo.secondaryChannel = SynthConstants.PercussionChannel;
                } else {
                    track.playbackInfo.program = GeneralMidi.getValue(instrumentName);
                }
                break;
        }
    }

    private chordProperties(importer: IAlphaTexImporter, chord: Chord, metaData: AlphaTexMetaDataNode) {
        if (!metaData.properties) {
            return;
        }

        for (const p of metaData.properties.properties) {
            if (!this.checkProperty(importer, [AlphaTex1LanguageHandler.chordPropertyValueListTypes], p)) {
                continue;
            }

            switch (p.property.text.toLowerCase()) {
                case 'firstfret':
                    chord.firstFret = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'showdiagram':
                    chord.showDiagram = AlphaTex1LanguageHandler.booleanLikeValue(p.values!.values, 0);
                    break;
                case 'showfingering':
                    chord.showFingering = AlphaTex1LanguageHandler.booleanLikeValue(p.values!.values, 0);
                    break;
                case 'showname':
                    chord.showName = AlphaTex1LanguageHandler.booleanLikeValue(p.values!.values, 0);
                    break;
                case 'barre':
                    chord.barreFrets = p.values!.values.map(v => (v as AlphaTexNumberLiteral).value);
                    break;
            }
        }
    }

    private static booleanLikeValue(values: AlphaTexValueListItem[], i: number): boolean {
        if (i >= values.length) {
            return true;
        }

        const v = values[i];
        switch (v.nodeType) {
            case AlphaTexNodeType.StringLiteral:
            case AlphaTexNodeType.Identifier:
                return (v as AlphaTexTextNode).text !== 'false';
            case AlphaTexNodeType.NumberLiteral:
                return (v as AlphaTexNumberLiteral).value !== 0;
            default:
                return false;
        }
    }

    public applyStructuralMetaData(importer: IAlphaTexImporter, metaData: AlphaTexMetaDataNode): ApplyNodeResult {
        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'staff':
                const staff = importer.startNewStaff();
                this.staffProperties(importer, staff, metaData);

                return ApplyNodeResult.Applied;
            case 'track':
                const track = importer.startNewTrack();

                if (metaData.values) {
                    track.name = (metaData.values!.values[0] as AlphaTexTextNode).text;
                    if (metaData.values!.values.length > 1) {
                        track.shortName = (metaData.values!.values[1] as AlphaTexTextNode).text;
                    }
                }

                this.trackProperties(importer, track, metaData);

                return ApplyNodeResult.Applied;
            case 'voice':
                importer.startNewVoice();
                return ApplyNodeResult.Applied;
            default:
                return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }
    }

    private checkProperty(
        importer: IAlphaTexImporter,
        lookupList: Map<string, ValueListParseTypes | undefined>[],
        p: AlphaTexPropertyNode
    ): boolean {
        const result = this.checkValueListTypes(importer, lookupList, p, p.property.text.toLowerCase(), p.values);
        if (result !== undefined) {
            switch (result!) {
                case ApplyNodeResult.Applied:
                case ApplyNodeResult.NotAppliedSemanticError:
                    return false;

                case ApplyNodeResult.NotAppliedUnrecognizedMarker:
                    const knownProps = lookupList.flatMap(l => Array.from(l.keys()));
                    Array.from(AlphaTex1LanguageHandler.chordPropertyValueListTypes.keys()).join(',');
                    importer.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT001, // TODO code
                        message: `Unrecogized property '${p.property.text}', expected one of ${knownProps}`,
                        severity: AlphaTexDiagnosticsSeverity.Error,
                        start: p.start,
                        end: p.end
                    });
                    return false;
            }
        }

        return true;
    }

    private staffProperties(importer: IAlphaTexImporter, staff: Staff, metaData: AlphaTexMetaDataNode) {
        if (!metaData.properties) {
            return;
        }

        for (const p of metaData.properties.properties) {
            if (!this.checkProperty(importer, [AlphaTex1LanguageHandler.chordPropertyValueListTypes], p)) {
                continue;
            }

            let showStandardNotation: boolean = false;
            let showTabs: boolean = false;
            let showSlash: boolean = false;
            let showNumbered: boolean = false;

            switch (p.property.text.toLowerCase()) {
                case 'score':
                    showStandardNotation = true;
                    if (p.values) {
                        staff.standardNotationLineCount = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    }
                    break;
                case 'tabs':
                    showTabs = true;
                    break;
                case 'slash':
                    showSlash = true;
                    break;
                case 'numbered':
                    showNumbered = true;
                    break;
            }

            if (showStandardNotation || showTabs || showSlash || showNumbered) {
                staff.showStandardNotation = showStandardNotation;
                staff.showTablature = showTabs;
                staff.showSlash = showSlash;
                staff.showNumbered = showNumbered;
            }
        }
    }

    private trackProperties(importer: IAlphaTexImporter, track: Track, metaData: AlphaTexMetaDataNode) {
        if (!metaData.properties) {
            return;
        }

        for (const p of metaData.properties.properties) {
            if (!this.checkProperty(importer, [AlphaTex1LanguageHandler.trackPropertyValueListTypes], p)) {
                continue;
            }

            switch (p.property.text.toLowerCase()) {
                case 'color':
                    try {
                        track.color = Color.fromJson((p.values!.values[0] as AlphaTexTextNode).text)!;
                    } catch {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT001, // TODO Code
                            message: `Invalid format for color`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                    }
                    break;
                case 'defaultsystemslayout':
                    track.defaultSystemsLayout = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'systemslayout':
                    track.systemsLayout = p.values!.values.map(v => (v as AlphaTexNumberLiteral).value);
                    break;
                case 'volume':
                    track.playbackInfo.volume = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'balance':
                    track.playbackInfo.balance = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
                case 'mute':
                    track.playbackInfo.isMute = true;
                    break;
                case 'solo':
                    track.playbackInfo.isSolo = true;
                    break;
                case 'multibarrest':
                    if (!track.score.stylesheet.perTrackMultiBarRest) {
                        track.score.stylesheet.perTrackMultiBarRest = new Set<number>();
                    }
                    track.score.stylesheet.perTrackMultiBarRest!.add(track.index);
                    break;
                case 'instrument':
                    this.readTrackInstrument(importer, track, metaData);
                    break;
                case 'bank':
                    track.playbackInfo.bank = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    break;
            }
        }
    }

    public applyBeatDurationProperty(importer: IAlphaTexImporter, p: AlphaTexPropertyNode): ApplyNodeResult {
        const result = this.checkValueListTypes(
            importer,
            [AlphaTex1LanguageHandler.beatDurationPropertyValueListTypes],
            p,
            p.property.text.toLowerCase(),
            p.values
        );
        if (result !== undefined) {
            return result;
        }

        switch (p.property.text.toLowerCase()) {
            case 'tu':
                if (p.values!.values.length === 2) {
                    importer.currentTupletNumerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    importer.currentTupletDenominator = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                } else {
                    const numerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    importer.currentTupletNumerator = numerator;
                    const denominator = AlphaTex1LanguageHandler.getTupletDenominator(numerator);
                    if (denominator < 0) {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT001, // TODO code
                            message: `Unknown default tuplet '${numerator}', also specify the tuplet denominator or use one of: 3, 5, 6, 7, 9, 10, 11, 12`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                        importer.currentTupletNumerator = -1;
                        importer.currentTupletDenominator = -1;
                    } else {
                        importer.currentTupletDenominator = denominator;
                    }
                }
                return ApplyNodeResult.Applied;
        }

        return ApplyNodeResult.NotAppliedUnrecognizedMarker;
    }
    private static getTupletDenominator(numerator: number) {
        switch (numerator) {
            case 3:
                return 2;
            case 5:
                return 4;
            case 6:
                return 4;
            case 7:
                return 4;
            case 9:
                return 8;
            case 10:
                return 8;
            case 11:
                return 8;
            case 12:
                return 8;
            default:
                return -1;
        }
    }

    private _knownBarMetaDataTags: Set<string> | undefined = undefined;
    public get knownBarMetaDataTags() {
        if (!this._knownBarMetaDataTags) {
            this._knownBarMetaDataTags = new Set<string>(AlphaTex1LanguageHandler.barMetaDataValueListTypes.keys());
        }
        return this._knownBarMetaDataTags;
    }

    private _knownBeatDurationProperties: Set<string> | undefined = undefined;
    public get knownBeatDurationProperties() {
        if (!this._knownBeatDurationProperties) {
            this._knownBeatDurationProperties = new Set<string>(
                AlphaTex1LanguageHandler.beatDurationPropertyValueListTypes.keys()
            );
        }
        return this._knownBeatDurationProperties;
    }

    private _knownBeatProperties: Set<string> | undefined = undefined;
    public get knownBeatProperties() {
        if (!this._knownBeatProperties) {
            this._knownBeatProperties = new Set<string>(AlphaTex1LanguageHandler.beatPropertyValueListTypes.keys());
        }
        return this._knownBeatProperties;
    }

    public applyBeatProperty(importer: IAlphaTexImporter, beat: Beat, p: AlphaTexPropertyNode): ApplyNodeResult {
        const tag = p.property.text.toLowerCase();
        const result = this.checkValueListTypes(
            importer,
            [AlphaTex1LanguageHandler.beatPropertyValueListTypes],
            p,
            tag,
            p.values
        );
        if (result !== undefined) {
            return result;
        }

        switch (tag) {
            case 'f':
                beat.fade = FadeType.FadeIn;
                return ApplyNodeResult.Applied;
            case 'fo':
                beat.fade = FadeType.FadeOut;
                return ApplyNodeResult.Applied;
            case 'vs':
                beat.fade = FadeType.VolumeSwell;
                return ApplyNodeResult.Applied;
            case 'v':
                beat.vibrato = VibratoType.Slight;
                return ApplyNodeResult.Applied;
            case 'vw':
                beat.vibrato = VibratoType.Wide;
                return ApplyNodeResult.Applied;
            case 's':
                beat.slap = true;
                return ApplyNodeResult.Applied;
            case 'p':
                beat.pop = true;
                return ApplyNodeResult.Applied;
            case 'tt':
                beat.tap = true;
                return ApplyNodeResult.Applied;
            case 'txt':
                beat.text = (p.values!.values[0] as AlphaTexTextNode).text;
                return ApplyNodeResult.Applied;
            case 'lyrics':
                let lyricsLine = 0;
                let lyricsText = '';
                if (p.values!.values.length === 2) {
                    lyricsLine = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    lyricsText = (p.values!.values[1] as AlphaTexTextNode).text;
                } else {
                    lyricsText = (p.values!.values[0] as AlphaTexTextNode).text;
                }

                if (!beat.lyrics) {
                    beat.lyrics = [];
                }

                while (beat.lyrics!.length <= lyricsLine) {
                    beat.lyrics.push('');
                }

                beat.lyrics[lyricsLine] = lyricsText;
                return ApplyNodeResult.Applied;
            case 'dd':
                beat.dots = 2;
                return ApplyNodeResult.Applied;
            case 'd':
                beat.dots = 1;
                return ApplyNodeResult.Applied;
            case 'su':
                beat.pickStroke = PickStroke.Up;
                return ApplyNodeResult.Applied;
            case 'sd':
                beat.pickStroke = PickStroke.Down;
                return ApplyNodeResult.Applied;
            case 'tu':
                if (p.values!.values.length === 2) {
                    beat.tupletNumerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    beat.tupletDenominator = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                } else {
                    const numerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    beat.tupletNumerator = numerator;
                    const denominator = AlphaTex1LanguageHandler.getTupletDenominator(numerator);
                    if (denominator < 0) {
                        // TODO: part of getTupletDenominator?
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT001, // TODO code
                            message: `Unknown default tuplet '${numerator}', also specify the tuplet denominator or use one of: 3, 5, 6, 7, 9, 10, 11, 12`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                        beat.tupletNumerator = -1;
                        beat.tupletDenominator = -1;
                        return ApplyNodeResult.NotAppliedSemanticError;
                    } else {
                        beat.tupletDenominator = denominator;
                    }
                }
                return ApplyNodeResult.Applied;
            case 'tb':
            case 'tbe':
                let tbi = 0;
                if (p.values!.values[tbi].nodeType !== AlphaTexNodeType.NumberLiteral) {
                    const whammyBarType = AlphaTex1LanguageHandler.parseEnumValue(
                        importer,
                        p.values!,
                        'whammy type',
                        AlphaTex1LanguageHandler.whammyTypes,
                        tbi
                    );
                    if (whammyBarType === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    beat.whammyBarType = whammyBarType;
                    tbi++;
                }

                if (p.values!.values[tbi].nodeType !== AlphaTexNodeType.NumberLiteral) {
                    const whammyBarStyle = AlphaTex1LanguageHandler.parseEnumValue(
                        importer,
                        p.values!,
                        'whammy style',
                        AlphaTex1LanguageHandler.bendStyles,
                        tbi
                    );
                    if (whammyBarStyle === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    beat.whammyStyle = whammyBarStyle!;
                    tbi++;
                    break;
                }

                const points = this.getBendPoints(importer, p, tbi, tag === 'tbe');
                if (points) {
                    for (const point of points) {
                        beat.addWhammyBarPoint(point);
                    }
                }

                return ApplyNodeResult.Applied;
            case 'bu':
                AlphaTex1LanguageHandler.applyBrush(beat, p, BrushType.BrushUp, 0.25);
                return ApplyNodeResult.Applied;
            case 'bd':
                AlphaTex1LanguageHandler.applyBrush(beat, p, BrushType.BrushDown, 0.25);
                return ApplyNodeResult.Applied;
            case 'au':
                AlphaTex1LanguageHandler.applyBrush(beat, p, BrushType.ArpeggioUp, 1);
                return ApplyNodeResult.Applied;
            case 'ad':
                AlphaTex1LanguageHandler.applyBrush(beat, p, BrushType.ArpeggioDown, 1);
                return ApplyNodeResult.Applied;
            case 'ch':
                const chordName: string = (p.values!.values[0] as AlphaTexTextNode).text;
                const chordId: string = AlphaTex1LanguageHandler.getChordId(beat.voice.bar.staff, chordName);
                if (!beat.voice.bar.staff.hasChord(chordId)) {
                    const chord: Chord = new Chord();
                    chord.showDiagram = false;
                    chord.name = chordName;
                    beat.voice.bar.staff.addChord(chordId, chord);
                }
                beat.chordId = chordId;
                return ApplyNodeResult.Applied;
            case 'gr':
                if (p.values) {
                    const graceType = AlphaTex1LanguageHandler.parseEnumValue(
                        importer,
                        p.values!,
                        'whammy style',
                        AlphaTex1LanguageHandler.graceTypes
                    );
                    if (graceType === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    beat.graceType = graceType!;
                } else {
                    beat.graceType = GraceType.BeforeBeat;
                }
                return ApplyNodeResult.Applied;
            case 'dy':
                const dyn = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    p.values!,
                    'dynamic',
                    AlphaTex1LanguageHandler.dynamics
                );
                if (dyn === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                beat.dynamics = dyn!;
                return ApplyNodeResult.Applied;
            case 'cre':
                beat.crescendo = CrescendoType.Crescendo;
                return ApplyNodeResult.Applied;
            case 'dec':
                beat.crescendo = CrescendoType.Decrescendo;
                return ApplyNodeResult.Applied;
            case 'tempo':
                // NOTE: playbackRatio is calculated on score finish when playback positions are known
                const tempo = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                let tempoLabel = '';
                if (p.values!.values.length > 1) {
                    tempoLabel = (p.values!.values[0] as AlphaTexTextNode).text;
                }
                const tempoAutomation = new Automation();
                tempoAutomation.isLinear = false;
                tempoAutomation.type = AutomationType.Tempo;
                tempoAutomation.value = tempo;
                tempoAutomation.text = tempoLabel;
                beat.automations.push(tempoAutomation);
                beat.voice.bar.masterBar.tempoAutomations.push(tempoAutomation);
                return ApplyNodeResult.Applied;
            case 'volume':
                // NOTE: playbackRatio is calculated on score finish when playback positions are known
                const volumeAutomation: Automation = new Automation();
                volumeAutomation.isLinear = true;
                volumeAutomation.type = AutomationType.Volume;
                volumeAutomation.value = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                beat.automations.push(volumeAutomation);
                return ApplyNodeResult.Applied;
            case 'balance':
                // NOTE: playbackRatio is calculated on score finish when playback positions are known
                const balanceAutomation: Automation = new Automation();
                balanceAutomation.isLinear = true;
                balanceAutomation.type = AutomationType.Balance;
                balanceAutomation.value = ModelUtils.clamp((p.values!.values[0] as AlphaTexNumberLiteral).value, 0, 16);
                beat.automations.push(balanceAutomation);
                return ApplyNodeResult.Applied;
            case 'tp':
                beat.tremoloSpeed = Duration.Eighth;
                if (p.values) {
                    const tremoloSpeedValue = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    switch (tremoloSpeedValue) {
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
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT001, // TODO code
                                message: `Invalid tremolo speed '${tremoloSpeedValue}, expected 8, 16 or 32'`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: p.values!.values[0].start,
                                end: p.values!.values[0].end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                    }
                }
                return ApplyNodeResult.Applied;
            case 'spd':
                AlphaTex1LanguageHandler.applySustainPedal(importer, beat, SustainPedalMarkerType.Down);
                return ApplyNodeResult.Applied;
            case 'sph':
                AlphaTex1LanguageHandler.applySustainPedal(importer, beat, SustainPedalMarkerType.Hold);
                return ApplyNodeResult.Applied;
            case 'spu':
                AlphaTex1LanguageHandler.applySustainPedal(importer, beat, SustainPedalMarkerType.Up);
                return ApplyNodeResult.Applied;
            case 'spe':
                AlphaTex1LanguageHandler.applySustainPedal(importer, beat, SustainPedalMarkerType.Up, 1);
                return ApplyNodeResult.Applied;
            case 'slashed':
                beat.slashed = true;
                return ApplyNodeResult.Applied;
            case 'ds':
                beat.deadSlapped = true;
                if (beat.notes.length === 1 && beat.notes[0].isDead) {
                    beat.removeNote(beat.notes[0]);
                }
                return ApplyNodeResult.Applied;
            case 'glpf':
                beat.golpe = GolpeType.Finger;
                return ApplyNodeResult.Applied;
            case 'glpt':
                beat.golpe = GolpeType.Thumb;
                return ApplyNodeResult.Applied;
            case 'waho':
                beat.wahPedal = WahPedal.Open;
                return ApplyNodeResult.Applied;
            case 'wahc':
                beat.wahPedal = WahPedal.Closed;
                return ApplyNodeResult.Applied;
            case 'barre':
                beat.barreFret = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                beat.barreShape = BarreShape.Full;
                if (p.values!.values.length > 1) {
                    const barreShape = AlphaTex1LanguageHandler.parseEnumValue(
                        importer,
                        p.values!,
                        'barre shape',
                        AlphaTex1LanguageHandler.barreShapes
                    );
                    if (barreShape === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    beat.barreShape = barreShape!;
                }
                return ApplyNodeResult.Applied;
            case 'rasg':
                const rasg = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    p.values!,
                    'rasgueado pattern',
                    AlphaTex1LanguageHandler.rasgueadoPatterns
                );
                if (rasg === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                beat.rasgueado = rasg!;
                return ApplyNodeResult.Applied;
            case 'ot':
                const ottava = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    p.values!,
                    'ottava',
                    AlphaTex1LanguageHandler.ottava
                );
                if (ottava === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                beat.ottava = ottava!;
                return ApplyNodeResult.Applied;
            case 'legatoorigin':
                beat.isLegatoOrigin = true;
                return ApplyNodeResult.Applied;
            case 'instrument':
                let program = 0;

                switch (p.values!.values[0].nodeType) {
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        program = GeneralMidi.getValue((p.values!.values[0] as AlphaTexTextNode).text);
                        break;

                    case AlphaTexNodeType.NumberLiteral:
                        program = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                        break;
                }

                const instrumentAutomation = new Automation();
                instrumentAutomation.isLinear = false;
                instrumentAutomation.type = AutomationType.Instrument;
                instrumentAutomation.value = program;
                beat.automations.push(instrumentAutomation);
                return ApplyNodeResult.Applied;
            case 'bank':
                const bankAutomation = new Automation();
                bankAutomation.isLinear = false;
                bankAutomation.type = AutomationType.Bank;
                bankAutomation.value = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                beat.automations.push(bankAutomation);
                return ApplyNodeResult.Applied;
            case 'fermata':
                const fermataType = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    p.values!,
                    'fermata',
                    AlphaTex1LanguageHandler.fermataTypes
                );
                if (fermataType === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }

                const fermata = new Fermata();
                fermata.type = fermataType!;

                if (p.values!.values.length > 1) {
                    fermata.length = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                }

                beat.fermata = fermata;
                return ApplyNodeResult.Applied;

            case 'beam':
                const beamMode = (p.values!.values[0] as AlphaTexTextNode).text;
                switch (beamMode.toLowerCase()) {
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
                    default:
                        const allowedValues = ['invert', 'up', 'down', 'auto', 'split', 'merge', 'splitsecondary'];
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT001, // TODO code
                            message: `Invalid beam value '${beamMode}, expected one of: ${allowedValues.join(',')}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                        return ApplyNodeResult.NotAppliedSemanticError;
                }
                return ApplyNodeResult.Applied;
            case 'timer':
                beat.showTimer = true;
                return ApplyNodeResult.Applied;
        }

        return ApplyNodeResult.NotAppliedUnrecognizedMarker;
    }

    private static applySustainPedal(
        importer: IAlphaTexImporter,
        beat: Beat,
        pedalType: SustainPedalMarkerType,
        ratioPosition: number = -1
    ) {
        const sustainPedal = new SustainPedalMarker();
        sustainPedal.pedalType = pedalType;
        // exact ratio position will be applied after .finish() when times are known
        sustainPedal.ratioPosition = ratioPosition >= 0 ? ratioPosition : beat.voice.bar.sustainPedals.length;
        importer.sustainPedalToBeat.set(sustainPedal, beat);
        beat.voice.bar.sustainPedals.push(sustainPedal);
    }

    private static applyBrush(beat: Beat, p: AlphaTexPropertyNode, brushType: BrushType, durationFactor: number) {
        beat.brushType = brushType;
        if (p.values) {
            beat.brushDuration = (p.values!.values[0] as AlphaTexNumberLiteral).value;
        }
        beat.updateDurations();
        beat.brushDuration = (beat.playbackDuration * durationFactor) / beat.notes.length;
    }

    public applyNoteProperty(importer: IAlphaTexImporter, note: Note, p: AlphaTexPropertyNode): ApplyNodeResult {
        const tag = p.property.text.toLowerCase();
        const result = this.checkValueListTypes(
            importer,
            [AlphaTex1LanguageHandler.notePropertyValueListTypes],
            p,
            tag,
            p.values
        );
        if (result !== undefined) {
            return result;
        }

        switch (tag) {
            case 'b':
            case 'be':
                let tbi = 0;
                if (p.values!.values[tbi].nodeType !== AlphaTexNodeType.NumberLiteral) {
                    const bendType = AlphaTex1LanguageHandler.parseEnumValue(
                        importer,
                        p.values!,
                        'bend type',
                        AlphaTex1LanguageHandler.bendTypes,
                        tbi
                    );
                    if (bendType === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    note.bendType = bendType;
                    tbi++;
                }

                if (p.values!.values[tbi].nodeType !== AlphaTexNodeType.NumberLiteral) {
                    const bendStyle = AlphaTex1LanguageHandler.parseEnumValue(
                        importer,
                        p.values!,
                        'whammy style',
                        AlphaTex1LanguageHandler.bendStyles,
                        tbi
                    );
                    if (bendStyle === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    note.bendStyle = bendStyle!;
                    tbi++;
                    break;
                }

                const points = this.getBendPoints(importer, p, tbi, tag === 'be');
                if (points) {
                    for (const point of points) {
                        note.addBendPoint(point);
                    }
                }

                return ApplyNodeResult.Applied;
            case 'nh':
                note.harmonicType = HarmonicType.Natural;
                note.harmonicValue = ModelUtils.deltaFretToHarmonicValue(note.fret);
                return ApplyNodeResult.Applied;
            case 'ah':
                note.harmonicType = HarmonicType.Artificial;
                note.harmonicValue = AlphaTex1LanguageHandler.harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'th':
                note.harmonicType = HarmonicType.Tap;
                note.harmonicValue = AlphaTex1LanguageHandler.harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'ph':
                note.harmonicType = HarmonicType.Pinch;
                note.harmonicValue = AlphaTex1LanguageHandler.harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'sh':
                note.harmonicType = HarmonicType.Semi;
                note.harmonicValue = AlphaTex1LanguageHandler.harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'fh':
                note.harmonicType = HarmonicType.Feedback;
                note.harmonicValue = AlphaTex1LanguageHandler.harmonicValue(p.values, note.harmonicValue);
                return ApplyNodeResult.Applied;
            case 'tr':
                const trillFret = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                let trillDuration: Duration = Duration.Sixteenth;
                if (p.values!.values.length > 1) {
                    const trillDurationValue = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                    switch (trillDurationValue) {
                        case 16:
                            trillDuration = Duration.Sixteenth;
                            break;
                        case 32:
                            trillDuration = Duration.ThirtySecond;
                            break;
                        case 64:
                            trillDuration = Duration.SixtyFourth;
                            break;
                        default:
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT001, // TODO code
                                message: `Invalid trill duration ${trillDurationValue}, expected 16, 32 or 64'`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: p.values!.values[1].start,
                                end: p.values!.values[1].end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                    }
                }
                note.trillValue = trillFret + note.stringTuning;
                note.trillSpeed = trillDuration;
                return ApplyNodeResult.Applied;
            case 'v':
                note.vibrato = VibratoType.Slight;
                return ApplyNodeResult.Applied;
            case 'vw':
                note.vibrato = VibratoType.Wide;
                return ApplyNodeResult.Applied;
            case 'sl':
                note.slideOutType = SlideOutType.Legato;
                return ApplyNodeResult.Applied;
            case 'ss':
                note.slideOutType = SlideOutType.Shift;
                return ApplyNodeResult.Applied;
            case 'sib':
                note.slideInType = SlideInType.IntoFromBelow;
                return ApplyNodeResult.Applied;
            case 'sia':
                note.slideInType = SlideInType.IntoFromAbove;
                return ApplyNodeResult.Applied;
            case 'sou':
                note.slideOutType = SlideOutType.OutUp;
                return ApplyNodeResult.Applied;
            case 'sod':
                note.slideOutType = SlideOutType.OutDown;
                return ApplyNodeResult.Applied;
            case 'psd':
                note.slideOutType = SlideOutType.PickSlideDown;
                return ApplyNodeResult.Applied;
            case 'psu':
                note.slideOutType = SlideOutType.PickSlideUp;
                return ApplyNodeResult.Applied;
            case 'h':
                note.isHammerPullOrigin = true;
                return ApplyNodeResult.Applied;
            case 'lht':
                note.isLeftHandTapped = true;
                return ApplyNodeResult.Applied;
            case 'g':
                note.isGhost = true;
                return ApplyNodeResult.Applied;
            case 'ac':
                note.accentuated = AccentuationType.Normal;
                return ApplyNodeResult.Applied;
            case 'hac':
                note.accentuated = AccentuationType.Heavy;
                return ApplyNodeResult.Applied;
            case 'ten':
                note.accentuated = AccentuationType.Tenuto;
                return ApplyNodeResult.Applied;
            case 'pm':
                note.isPalmMute = true;
                return ApplyNodeResult.Applied;
            case 'st':
                note.isStaccato = true;
                return ApplyNodeResult.Applied;
            case 'lr':
                note.isLetRing = true;
                return ApplyNodeResult.Applied;
            case 'x':
                note.isDead = true;
                return ApplyNodeResult.Applied;
            case '-':
            case 't':
                note.isTieDestination = true;
                return ApplyNodeResult.Applied;
            case 'lf':
                let leftFinger = Fingers.Thumb;
                if (p.values) {
                    const customFinger = AlphaTex1LanguageHandler.toFinger(importer, p.values);
                    if (customFinger === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    leftFinger = customFinger!;
                }
                note.leftHandFinger = leftFinger;
                return ApplyNodeResult.Applied;
            case 'rf':
                let rightFinger = Fingers.Thumb;
                if (p.values) {
                    const customFinger = AlphaTex1LanguageHandler.toFinger(importer, p.values);
                    if (customFinger === undefined) {
                        return ApplyNodeResult.NotAppliedSemanticError;
                    }
                    rightFinger = customFinger!;
                }
                note.rightHandFinger = rightFinger;
                return ApplyNodeResult.Applied;
            case 'acc':
                note.accidentalMode = ModelUtils.parseAccidentalMode((p.values!.values[0] as AlphaTexTextNode).text);
                return ApplyNodeResult.Applied;
            case 'turn':
                note.ornament = NoteOrnament.Turn;
                return ApplyNodeResult.Applied;
            case 'iturn':
                note.ornament = NoteOrnament.InvertedTurn;
                return ApplyNodeResult.Applied;
            case 'umordent':
                note.ornament = NoteOrnament.UpperMordent;
                return ApplyNodeResult.Applied;
            case 'lmordent':
                note.ornament = NoteOrnament.LowerMordent;
                return ApplyNodeResult.Applied;
            case 'string':
                note.showStringNumber = true;
                return ApplyNodeResult.Applied;
            case 'hide':
                note.isVisible = false;
                return ApplyNodeResult.Applied;
            case 'slur':
                const slurId = (p.values!.values[0] as AlphaTexTextNode).text;
                if (importer.slurs.has(slurId)) {
                    const slurOrigin = importer.slurs.get(slurId)!;
                    slurOrigin.slurDestination = note;

                    note.slurOrigin = slurOrigin;
                    note.isSlurDestination = true;
                } else {
                    importer.slurs.set(slurId, note);
                }
                return ApplyNodeResult.Applied;
            default:
                // fallback to beat
                return this.applyBeatProperty(importer, note.beat, p);
        }

        return ApplyNodeResult.NotAppliedUnrecognizedMarker;
    }

    private static toFinger(importer: IAlphaTexImporter, values: AlphaTexValueList): Fingers | undefined {
        const value = (values.values[0] as AlphaTexNumberLiteral).value;
        switch (value) {
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
            default:
                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT107, // TODO code
                    message: `Value is out of valid range. Allowed range: 1-5, Actual Value: ${value}`,
                    start: values!.values[0].start,
                    end: values!.values[0].end,
                    severity: AlphaTexDiagnosticsSeverity.Error
                });
                return undefined;
        }
    }

    private static harmonicValue(values: AlphaTexValueList | undefined, harmonicValue: number): number {
        if (values) {
            harmonicValue = (values!.values[0] as AlphaTexNumberLiteral).value;
        }
        return harmonicValue;
    }

    private getBendPoints(
        importer: IAlphaTexImporter,
        p: AlphaTexPropertyNode,
        valueStartIndex: number,
        exact: boolean
    ): BendPoint[] | undefined {
        const remainingValues = p.values!.values.length - valueStartIndex;
        const valuesPerItem = exact ? 2 : 1;
        if (remainingValues % valuesPerItem !== 0) {
            const pointCount = Math.ceil(remainingValues / valuesPerItem);
            const neededValues = pointCount * valuesPerItem;
            importer.addSemanticDiagnostic({
                code: AlphaTexDiagnosticCode.AT001, // TODO Code
                message: `The '${p.property.text}' effect needs ${valuesPerItem} values per item. With ${pointCount} points, ${neededValues} values are needed, only ${remainingValues} values found.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: p.values!.end,
                end: p.values!.end
            });
            return undefined;
        }

        const points: BendPoint[] = [];
        let vi = valueStartIndex;
        while (vi < p.values!.values.length) {
            let offset = 0;
            let value = 0;
            if (exact) {
                offset = (p.values!.values[vi++] as AlphaTexNumberLiteral).value;
                value = (p.values!.values[vi++] as AlphaTexNumberLiteral).value;
            } else {
                offset = 0;
                value = (p.values!.values[vi++] as AlphaTexNumberLiteral).value;
            }
            points.push(new BendPoint(offset, value));
        }

        if (points.length > 0) {
            if (points.length > 60) {
                points.splice(60, points.length - 60);
            }

            // set positions
            if (exact) {
                points.sort((a, b) => {
                    return a.offset - b.offset;
                });
            } else {
                const count = points.length;
                const step = (BendPoint.MaxPosition / (count - 1)) | 0;
                let i: number = 0;
                while (i < count) {
                    points[i].offset = Math.min(BendPoint.MaxPosition, i * step);
                    i++;
                }
            }
            return points;
        } else {
            return undefined;
        }
    }

    //
    // string -> enum mappings

    private static parseEnumValue<TValue>(
        importer: IAlphaTexImporter,
        p: AlphaTexValueList,
        name: string,
        lookup: Map<string, TValue>,
        valueIndex: number = 0
    ): TValue | undefined {
        const txt = (p.values[valueIndex] as AlphaTexTextNode).text;
        if (lookup.has(txt.toLowerCase())) {
            return lookup.get(txt.toLowerCase())!;
        } else {
            importer.addSemanticDiagnostic({
                code: AlphaTexDiagnosticCode.AT001, // TODO code
                message: `Invalid ${name} '${txt}, expected one of: ${Array.from(lookup.keys()).join(',')}`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: p.values[valueIndex].start,
                end: p.values[valueIndex].end
            });
            return undefined;
        }
    }

    private static readonly whammyTypes = new Map<string, WhammyType>([
        ['none', WhammyType.None],
        ['custom', WhammyType.Custom],
        ['dive', WhammyType.Dive],
        ['dip', WhammyType.Dip],
        ['hold', WhammyType.Hold],
        ['predive', WhammyType.Predive],
        ['predivedive', WhammyType.PrediveDive]
    ]);

    private static readonly bendStyles = new Map<string, BendStyle>([
        ['gradual', BendStyle.Gradual],
        ['fast', BendStyle.Fast],
        ['default', BendStyle.Default]
    ]);

    private static readonly graceTypes = new Map<string, GraceType>([
        ['ob', GraceType.OnBeat],
        ['b', GraceType.BendGrace],
        ['bb', GraceType.BeforeBeat]
    ]);

    private static readonly fermataTypes = new Map<string, FermataType>([
        ['short', FermataType.Short],
        ['medium', FermataType.Medium],
        ['long', FermataType.Long]
    ]);

    private static readonly accidentalModes = new Map<string, AlphaTexAccidentalMode>([
        ['auto', AlphaTexAccidentalMode.Auto],
        ['explicit', AlphaTexAccidentalMode.Explicit]
    ]);

    private static readonly barreShapes = new Map<string, BarreShape>([
        ['full', BarreShape.Full],
        ['half', BarreShape.Half]
    ]);

    private static readonly ottava = new Map<string, Ottavia>([
        ['15ma', Ottavia._15ma],
        ['8va', Ottavia._8va],
        ['regular', Ottavia.Regular],
        ['8vb', Ottavia._8vb],
        ['15mb', Ottavia._15mb]
    ]);

    private static readonly rasgueadoPatterns = new Map<string, Rasgueado>([
        ['ii', Rasgueado.Ii],
        ['mi', Rasgueado.Mi],
        ['miitriplet', Rasgueado.MiiTriplet],
        ['miianapaest', Rasgueado.MiiAnapaest],
        ['pmptriplet', Rasgueado.PmpTriplet],
        ['pmpanapaest', Rasgueado.PmpAnapaest],
        ['peitriplet', Rasgueado.PeiTriplet],
        ['peianapaest', Rasgueado.PeiAnapaest],
        ['paitriplet', Rasgueado.PaiTriplet],
        ['paianapaest', Rasgueado.PaiAnapaest],
        ['amitriplet', Rasgueado.AmiTriplet],
        ['amianapaest', Rasgueado.AmiAnapaest],
        ['ppp', Rasgueado.Ppp],
        ['amii', Rasgueado.Amii],
        ['amip', Rasgueado.Amip],
        ['eami', Rasgueado.Eami],
        ['eamii', Rasgueado.Eamii],
        ['peami', Rasgueado.Peami]
    ]);

    private static dynamics = new Map<string, DynamicValue>([
        ['ppp', DynamicValue.PPP],
        ['pp', DynamicValue.PP],
        ['p', DynamicValue.P],
        ['mp', DynamicValue.MP],
        ['mf', DynamicValue.MF],
        ['f', DynamicValue.F],
        ['ff', DynamicValue.FF],
        ['fff', DynamicValue.FFF],
        ['pppp', DynamicValue.PPPP],
        ['ppppp', DynamicValue.PPPPP],
        ['pppppp', DynamicValue.PPPPPP],
        ['ffff', DynamicValue.FFFF],
        ['fffff', DynamicValue.FFFFF],
        ['ffffff', DynamicValue.FFFFFF],
        ['sf', DynamicValue.SF],
        ['sfp', DynamicValue.SFP],
        ['sfpp', DynamicValue.SFPP],
        ['fp', DynamicValue.FP],
        ['rf', DynamicValue.RF],
        ['rfz', DynamicValue.RFZ],
        ['sfz', DynamicValue.SFZ],
        ['sffz', DynamicValue.SFFZ],
        ['fz', DynamicValue.FZ],
        ['n', DynamicValue.N],
        ['pf', DynamicValue.PF],
        ['sfzp', DynamicValue.SFZP]
    ]);

    private static readonly bracketExtendModes = new Map<string, BracketExtendMode>([
        ['nobrackets', BracketExtendMode.NoBrackets],
        ['groupstaves', BracketExtendMode.GroupStaves],
        ['groupsimilarinstruments', BracketExtendMode.GroupSimilarInstruments]
    ]);

    private static readonly trackNamePolicies = new Map<string, TrackNamePolicy>([
        ['hidden', TrackNamePolicy.Hidden],
        ['firstsystem', TrackNamePolicy.FirstSystem],
        ['allsystems', TrackNamePolicy.AllSystems]
    ]);

    private static readonly trackNameOrientations = new Map<string, TrackNameOrientation>([
        ['horizontal', TrackNameOrientation.Horizontal],
        ['vertical', TrackNameOrientation.Vertical]
    ]);

    private static readonly trackNameMode = new Map<string, TrackNameMode>([
        ['fullname', TrackNameMode.FullName],
        ['shortname', TrackNameMode.ShortName]
    ]);

    private static readonly textAligns = new Map<string, TextAlign>([
        ['left', TextAlign.Left],
        ['center', TextAlign.Center],
        ['right', TextAlign.Right]
    ]);

    private static readonly bendTypes = new Map<string, BendType>([
        ['none', BendType.None],
        ['custom', BendType.Custom],
        ['bend', BendType.Bend],
        ['release', BendType.Release],
        ['bendrelease', BendType.BendRelease],
        ['hold', BendType.Hold],
        ['prebend', BendType.Prebend],
        ['prebendbend', BendType.PrebendBend],
        ['prebendrelease', BendType.PrebendRelease]
    ]);
}
