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
    type AlphaTexPropertiesNode,
    type AlphaTexPropertyNode,
    type AlphaTexStringLiteral,
    type AlphaTexTextNode,
    type AlphaTexValueList,
    type AlphaTexValueListItem
} from '@src/importer/AlphaTexAst';
import type { AlphaTexParser } from '@src/importer/AlphaTexParser';
import {
    AlphaTexAccidentalMode,
    type AlphaTexDiagnostic,
    AlphaTexDiagnosticCode,
    AlphaTexDiagnosticsSeverity,
    AlphaTexParserAbort
} from '@src/importer/AlphaTexShared';
import { GeneralMidi } from '@src/midi/GeneralMidi';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType, type FlatSyncPoint } from '@src/model/Automation';
import { type Bar, BarLineStyle, SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { BarreShape } from '@src/model/BarreShape';
import { type Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Color } from '@src/model/Color';
import { CrescendoType } from '@src/model/CrescendoType';
import { Direction } from '@src/model/Direction';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { FadeType } from '@src/model/FadeType';
import { Fermata, FermataType } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GolpeType } from '@src/model/GolpeType';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import type { MasterBar } from '@src/model/MasterBar';
import { ModelUtils } from '@src/model/ModelUtils';
import type { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Ottavia } from '@src/model/Ottavia';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { PickStroke } from '@src/model/PickStroke';
import { Rasgueado } from '@src/model/Rasgueado';
import {
    BracketExtendMode,
    type RenderStylesheet,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy
} from '@src/model/RenderStylesheet';
import { HeaderFooterStyle, Score, ScoreStyle, ScoreSubElement } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
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
    applyBarMetaData(importer: IAlphaTexImporter, bar: Bar, metaData: AlphaTexMetaDataNode): ApplyNodeResult;

    applyBeatDurationProperty(importer: IAlphaTexImporter, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyBeatProperty(importer: IAlphaTexImporter, beat: Beat, property: AlphaTexPropertyNode): ApplyNodeResult;
    applyNoteProperty(importer: IAlphaTexImporter, note: Note, p: AlphaTexPropertyNode): ApplyNodeResult;

    readonly knownStaffMetaDataTags: Set<string>;
    readonly knownBeatProperties: Set<string>;
    readonly knownBarMetaDataTags: Set<string>;
    readonly knownBeatDurationProperties: Set<string>;
    readonly knownNoteProperties: Set<string>;

    buildSyncPoint(importer: IAlphaTexImporter, metaDataNode: AlphaTexMetaDataNode): FlatSyncPoint | undefined;

    buildScoreMetaDataNodes(score: Score): AlphaTexMetaDataNode[];
    buildBarMetaDataNodes(
        staff: Staff,
        bar: Bar | undefined,
        voice: number,
        isMultiVoice: boolean
    ): AlphaTexMetaDataNode[];
    buildSyncPointNodes(score: Score): AlphaTexMetaDataNode[];
    buildBeatEffects(beat: Beat): AlphaTexPropertyNode[];
    buildNoteEffects(data: Note): AlphaTexPropertyNode[];
}

export interface IAlphaTexImporterState {
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
}

export interface IAlphaTexImporter {
    state: IAlphaTexImporterState;

    makeStaffPitched(staff: Staff): void;
    startNewVoice(): void;
    startNewTrack(): Track;
    applyPercussionStaff(staff: Staff): void;
    startNewStaff(): Staff;
    addSemanticDiagnostic(diagnostic: AlphaTexDiagnostic): void;
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
     * Same as {@link Optional} but the next value is interpreted as a float.
     * But this value is only handled on value lists with parenthesis.
     * @remarks
     * This mode primarily serves the need of preventing tempo automations
     * to overlap with stringed notes:
     *    `\tempo 120 "Moderate" 1.0 2.0` - 1.0 should be a fretted note not the ratio position
     * but here it is the ratio position:
     *    `\tempo (120 "Moderate" 1.0) 2.0
     */
    OptionalAsFloatInValueList,

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

type ValueListParseTypesBasic = [AlphaTexNodeType[] /* accepted types */, ValueListParseTypesMode];
type ValueListParseTypesExtended = {
    expectedTypes: Set<AlphaTexNodeType>;
    parseMode: ValueListParseTypesMode;
    allowedValues?: Set<string>;
    reservedIdentifiers?: Set<string>;
};
type ValueListParseTypes = ValueListParseTypesExtended[];

/**
 * AlphaTexNodeFactory (short name for less code)
 */
class ATNF {
    public static metaData(
        tag: string,
        values?: AlphaTexValueList,
        properties?: AlphaTexPropertiesNode
    ): AlphaTexMetaDataNode {
        return {
            nodeType: AlphaTexNodeType.MetaData,
            tag: {
                nodeType: AlphaTexNodeType.MetaDataTag,
                prefix: {
                    nodeType: AlphaTexNodeType.BackSlashToken
                },
                tag: {
                    nodeType: AlphaTexNodeType.Identifier,
                    text: tag
                }
            },
            values,
            properties,
            propertiesBeforeValues: false
        };
    }

    public static identifierMetaData(tag: string, value: string): AlphaTexMetaDataNode {
        return ATNF.metaData(tag, ATNF.identifierValueList(value));
    }

    public static numberMetaData(tag: string, value: number): AlphaTexMetaDataNode {
        return ATNF.metaData(tag, ATNF.numberValueList(value));
    }

    public static valueList(parenthesis: boolean, values: (AlphaTexValueListItem | undefined)[]): AlphaTexValueList {
        const valueList: AlphaTexValueList = {
            nodeType: AlphaTexNodeType.ValueList,
            values: values.filter(v => v !== undefined)
        };

        if (parenthesis) {
            valueList.openParenthesis = {
                nodeType: AlphaTexNodeType.ParenthesisOpenToken
            };
            valueList.closeParenthesis = {
                nodeType: AlphaTexNodeType.ParenthesisCloseToken
            };
        }

        return valueList;
    }

    public static stringValueList(text: string): AlphaTexValueList | undefined {
        return {
            nodeType: AlphaTexNodeType.ValueList,
            values: [
                {
                    nodeType: AlphaTexNodeType.StringLiteral,
                    text
                }
            ]
        };
    }

    public static identifierValueList(text: string): AlphaTexValueList | undefined {
        return {
            nodeType: AlphaTexNodeType.ValueList,
            values: [
                {
                    nodeType: AlphaTexNodeType.Identifier,
                    text
                }
            ]
        };
    }

    public static numberValueList(value: number): AlphaTexValueList | undefined {
        return {
            nodeType: AlphaTexNodeType.ValueList,
            values: [
                {
                    nodeType: AlphaTexNodeType.NumberLiteral,
                    value
                }
            ]
        };
    }

    public static properties(
        properties: ([string, AlphaTexValueList | undefined] | undefined)[]
    ): AlphaTexPropertiesNode {
        const node: AlphaTexPropertiesNode = {
            nodeType: AlphaTexNodeType.Properties,
            properties: properties
                .filter(p => p !== undefined)
                .map(p => ({
                    nodeType: AlphaTexNodeType.Property,
                    property: {
                        nodeType: AlphaTexNodeType.Identifier,
                        text: p[0]
                    },
                    values: p[1]
                })),
            openBrace: {
                nodeType: AlphaTexNodeType.BraceOpenToken
            },
            closeBrace: {
                nodeType: AlphaTexNodeType.BraceCloseToken
            }
        };

        return node;
    }

    public static property(properties: AlphaTexPropertyNode[], identifier: string, values?: AlphaTexValueList) {
        properties.push({
            nodeType: AlphaTexNodeType.Property,
            property: {
                nodeType: AlphaTexNodeType.Identifier,
                text: identifier
            },
            values
        });
    }
}

class AlphaTex1EnumMappings {
    private static reverse<TKey, TValue>(map: Map<TKey, TValue>): Map<TValue, TKey> {
        const reversed = new Map<TValue, TKey>();
        for (const [k, v] of map) {
            if (!reversed.has(v)) {
                reversed.set(v, k);
            }
        }
        return reversed;
    }

    public static readonly whammyTypes = new Map<string, WhammyType>([
        ['none', WhammyType.None],
        ['custom', WhammyType.Custom],
        ['dive', WhammyType.Dive],
        ['dip', WhammyType.Dip],
        ['hold', WhammyType.Hold],
        ['predive', WhammyType.Predive],
        ['predivedive', WhammyType.PrediveDive]
    ]);

    public static readonly whammyTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.whammyTypes);

    public static readonly bendStyles = new Map<string, BendStyle>([
        ['gradual', BendStyle.Gradual],
        ['fast', BendStyle.Fast],
        ['default', BendStyle.Default]
    ]);

    public static readonly bendStylesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.bendStyles);

    public static readonly graceTypes = new Map<string, GraceType>([
        ['ob', GraceType.OnBeat],
        ['b', GraceType.BendGrace],
        ['bb', GraceType.BeforeBeat]
    ]);

    public static readonly graceTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.graceTypes);

    public static readonly fermataTypes = new Map<string, FermataType>([
        ['short', FermataType.Short],
        ['medium', FermataType.Medium],
        ['long', FermataType.Long]
    ]);

    public static readonly fermataTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.fermataTypes);

    public static readonly accidentalModes = new Map<string, AlphaTexAccidentalMode>([
        ['auto', AlphaTexAccidentalMode.Auto],
        ['explicit', AlphaTexAccidentalMode.Explicit]
    ]);

    public static readonly accidentalModesReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.accidentalModes
    );

    public static readonly barreShapes = new Map<string, BarreShape>([
        ['full', BarreShape.Full],
        ['half', BarreShape.Half]
    ]);
    public static readonly barreShapesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.barreShapes);

    public static readonly ottava = new Map<string, Ottavia>([
        ['15ma', Ottavia._15ma],
        ['8va', Ottavia._8va],
        ['regular', Ottavia.Regular],
        ['8vb', Ottavia._8vb],
        ['15mb', Ottavia._15mb]
    ]);
    public static readonly ottavaReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.ottava);

    public static readonly rasgueadoPatterns = new Map<string, Rasgueado>([
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
    public static readonly rasgueadoPatternsReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.rasgueadoPatterns
    );

    public static dynamics = new Map<string, DynamicValue>([
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
    public static readonly dynamicsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.dynamics);

    public static readonly bracketExtendModes = new Map<string, BracketExtendMode>([
        ['nobrackets', BracketExtendMode.NoBrackets],
        ['groupstaves', BracketExtendMode.GroupStaves],
        ['groupsimilarinstruments', BracketExtendMode.GroupSimilarInstruments]
    ]);
    public static readonly bracketExtendModesReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.bracketExtendModes
    );

    public static readonly trackNamePolicies = new Map<string, TrackNamePolicy>([
        ['hidden', TrackNamePolicy.Hidden],
        ['firstsystem', TrackNamePolicy.FirstSystem],
        ['allsystems', TrackNamePolicy.AllSystems]
    ]);
    public static readonly trackNamePoliciesReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.trackNamePolicies
    );

    public static readonly trackNameOrientations = new Map<string, TrackNameOrientation>([
        ['horizontal', TrackNameOrientation.Horizontal],
        ['vertical', TrackNameOrientation.Vertical]
    ]);
    public static readonly trackNameOrientationsReversed = AlphaTex1EnumMappings.reverse(
        AlphaTex1EnumMappings.trackNameOrientations
    );

    public static readonly trackNameMode = new Map<string, TrackNameMode>([
        ['fullname', TrackNameMode.FullName],
        ['shortname', TrackNameMode.ShortName]
    ]);
    public static readonly trackNameModeReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.trackNameMode);

    public static readonly textAligns = new Map<string, TextAlign>([
        ['left', TextAlign.Left],
        ['center', TextAlign.Center],
        ['right', TextAlign.Right]
    ]);
    public static readonly textAlignsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.textAligns);

    public static readonly bendTypes = new Map<string, BendType>([
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
    public static readonly bendTypesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.bendTypes);

    public static readonly keySignatures = new Map<string, KeySignature>([
        ['cb', KeySignature.Cb],
        ['cbmajor', KeySignature.Cb],
        ['abminor', KeySignature.Cb],

        ['gb', KeySignature.Gb],
        ['gbmajor', KeySignature.Gb],
        ['ebminor', KeySignature.Gb],

        ['db', KeySignature.Db],
        ['dbmajor', KeySignature.Db],
        ['bbminor', KeySignature.Db],

        ['ab', KeySignature.Ab],
        ['abmajor', KeySignature.Ab],
        ['fminor', KeySignature.Ab],

        ['eb', KeySignature.Eb],
        ['ebmajor', KeySignature.Eb],
        ['cminor', KeySignature.Eb],

        ['bb', KeySignature.Bb],
        ['bbmajor', KeySignature.Bb],
        ['gminor', KeySignature.Bb],

        ['f', KeySignature.F],
        ['fmajor', KeySignature.F],
        ['dminor', KeySignature.F],

        ['c', KeySignature.C],
        ['cmajor', KeySignature.C],
        ['aminor', KeySignature.C],

        ['g', KeySignature.G],
        ['gmajor', KeySignature.G],
        ['eminor', KeySignature.G],

        ['d', KeySignature.D],
        ['dmajor', KeySignature.D],
        ['bminor', KeySignature.D],

        ['a', KeySignature.A],
        ['amajor', KeySignature.A],
        ['f#minor', KeySignature.A],

        ['e', KeySignature.E],
        ['emajor', KeySignature.E],
        ['c#minor', KeySignature.E],

        ['b', KeySignature.B],
        ['bmajor', KeySignature.B],
        ['g#minor', KeySignature.B],

        ['f#', KeySignature.FSharp],
        ['f#major', KeySignature.FSharp],
        ['d#minor', KeySignature.FSharp],

        ['c#', KeySignature.CSharp],
        ['c#major', KeySignature.CSharp],
        ['a#minor', KeySignature.CSharp]
    ]);

    public static readonly keySignaturesMajorReversed = new Map<KeySignature, string>([
        [KeySignature.Cb, 'cb'],
        [KeySignature.Gb, 'gb'],
        [KeySignature.Db, 'db'],
        [KeySignature.Ab, 'ab'],
        [KeySignature.Eb, 'eb'],
        [KeySignature.Bb, 'bb'],
        [KeySignature.F, 'f'],
        [KeySignature.C, 'c'],
        [KeySignature.G, 'g'],
        [KeySignature.D, 'd'],
        [KeySignature.A, 'a'],
        [KeySignature.E, 'e'],
        [KeySignature.B, 'b'],
        [KeySignature.FSharp, 'f#'],
        [KeySignature.CSharp, 'c#']
    ]);

    public static readonly keySignaturesMinorReversed = new Map<KeySignature, string>([
        [KeySignature.Cb, 'abminor'],
        [KeySignature.Gb, 'ebminor'],
        [KeySignature.Db, 'bbminor'],
        [KeySignature.Ab, 'fminor'],
        [KeySignature.Eb, 'cminor'],
        [KeySignature.Bb, 'gminor'],
        [KeySignature.F, 'dminor'],
        [KeySignature.C, 'aminor'],
        [KeySignature.G, 'eminor'],
        [KeySignature.D, 'bminor'],
        [KeySignature.A, 'f#minor'],
        [KeySignature.E, 'c#minor'],
        [KeySignature.B, 'g#minor'],
        [KeySignature.FSharp, 'd#minor'],
        [KeySignature.CSharp, 'a#minor']
    ]);

    public static readonly keySignatureTypes = new Map<string, KeySignatureType>([
        ['cb', KeySignatureType.Major],
        ['cbmajor', KeySignatureType.Major],
        ['abminor', KeySignatureType.Minor],

        ['gb', KeySignatureType.Major],
        ['gbmajor', KeySignatureType.Major],
        ['ebminor', KeySignatureType.Minor],

        ['db', KeySignatureType.Major],
        ['dbmajor', KeySignatureType.Major],
        ['bbminor', KeySignatureType.Minor],

        ['ab', KeySignatureType.Major],
        ['abmajor', KeySignatureType.Major],
        ['fminor', KeySignatureType.Minor],

        ['eb', KeySignatureType.Major],
        ['ebmajor', KeySignatureType.Major],
        ['cminor', KeySignatureType.Minor],

        ['bb', KeySignatureType.Major],
        ['bbmajor', KeySignatureType.Major],
        ['gminor', KeySignatureType.Minor],

        ['f', KeySignatureType.Major],
        ['fmajor', KeySignatureType.Major],
        ['dminor', KeySignatureType.Minor],

        ['c', KeySignatureType.Major],
        ['cmajor', KeySignatureType.Major],
        ['aminor', KeySignatureType.Minor],

        ['g', KeySignatureType.Major],
        ['gmajor', KeySignatureType.Major],
        ['eminor', KeySignatureType.Minor],

        ['d', KeySignatureType.Major],
        ['dmajor', KeySignatureType.Major],
        ['bminor', KeySignatureType.Minor],

        ['a', KeySignatureType.Major],
        ['amajor', KeySignatureType.Major],
        ['f#minor', KeySignatureType.Minor],

        ['e', KeySignatureType.Major],
        ['emajor', KeySignatureType.Major],
        ['c#minor', KeySignatureType.Minor],

        ['b', KeySignatureType.Major],
        ['bmajor', KeySignatureType.Major],
        ['g#minor', KeySignatureType.Minor],

        ['f#', KeySignatureType.Major],
        ['f#major', KeySignatureType.Major],
        ['d#minor', KeySignatureType.Minor],

        ['c#', KeySignatureType.Major],
        ['c#major', KeySignatureType.Major],
        ['a#minor', KeySignatureType.Minor]
    ]);

    public static readonly clefs = new Map<string, Clef>([
        ['g2', Clef.G2],
        ['treble', Clef.G2],

        ['f4', Clef.F4],
        ['bass', Clef.F4],

        ['c3', Clef.C3],
        ['alto', Clef.C3],

        ['c4', Clef.C4],
        ['tenor', Clef.C4],

        ['n', Clef.Neutral],
        ['neutral', Clef.Neutral]
    ]);
    public static readonly clefsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.clefs);

    public static readonly tripletFeels = new Map<string, TripletFeel>([
        ['notripletfeel', TripletFeel.NoTripletFeel],
        ['no', TripletFeel.NoTripletFeel],
        ['none', TripletFeel.NoTripletFeel],

        ['triplet16th', TripletFeel.Triplet16th],
        ['t16', TripletFeel.Triplet16th],
        ['triplet-16th', TripletFeel.Triplet16th],

        ['triplet8th', TripletFeel.Triplet8th],
        ['t8', TripletFeel.Triplet8th],
        ['triplet-8th', TripletFeel.Triplet8th],

        ['dotted16th', TripletFeel.Dotted16th],
        ['d16', TripletFeel.Dotted16th],
        ['dotted-16th', TripletFeel.Dotted16th],

        ['dotted8th', TripletFeel.Dotted8th],
        ['d8', TripletFeel.Dotted8th],
        ['dotted-8th', TripletFeel.Dotted8th],

        ['scottish16th', TripletFeel.Scottish16th],
        ['s16', TripletFeel.Scottish16th],
        ['scottish-16th', TripletFeel.Scottish16th],

        ['scottish8th', TripletFeel.Scottish8th],
        ['s8', TripletFeel.Scottish8th],
        ['scottish-8th', TripletFeel.Scottish8th]
    ]);
    public static readonly tripletFeelsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.tripletFeels);

    public static readonly barLines = new Map<string, BarLineStyle>([
        ['automatic', BarLineStyle.Automatic],
        ['dashed', BarLineStyle.Dashed],
        ['dotted', BarLineStyle.Dotted],
        ['heavy', BarLineStyle.Heavy],
        ['heavyheavy', BarLineStyle.HeavyHeavy],
        ['heavylight', BarLineStyle.HeavyLight],
        ['lightheavy', BarLineStyle.LightHeavy],
        ['lightlight', BarLineStyle.LightLight],
        ['none', BarLineStyle.None],
        ['regular', BarLineStyle.Regular],
        ['short', BarLineStyle.Short],
        ['tick', BarLineStyle.Tick]
    ]);
    public static readonly barLinesReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.barLines);

    public static readonly ottavia = new Map<string, Ottavia>([
        ['15ma', Ottavia._15ma],
        ['8va', Ottavia._8va],
        ['regular', Ottavia.Regular],
        ['8vb', Ottavia._8vb],
        ['15mb', Ottavia._15mb]
    ]);
    public static readonly ottaviaReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.ottavia);

    public static readonly simileMarks = new Map<string, SimileMark>([
        ['none', SimileMark.None],
        ['simple', SimileMark.Simple],
        ['firstofdouble', SimileMark.FirstOfDouble],
        ['secondofdouble', SimileMark.SecondOfDouble]
    ]);
    public static readonly simileMarksReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.simileMarks);

    public static readonly directions = new Map<string, Direction>([
        ['fine', Direction.TargetFine],
        ['segno', Direction.TargetSegno],
        ['segnosegno', Direction.TargetSegnoSegno],
        ['coda', Direction.TargetCoda],
        ['doublecoda', Direction.TargetDoubleCoda],

        ['dacapo', Direction.JumpDaCapo],
        ['dacapoalcoda', Direction.JumpDaCapoAlCoda],
        ['dacapoaldoublecoda', Direction.JumpDaCapoAlDoubleCoda],
        ['dacapoalfine', Direction.JumpDaCapoAlFine],

        ['dalsegno', Direction.JumpDalSegno],
        ['dalsegnoalcoda', Direction.JumpDalSegnoAlCoda],
        ['dalsegnoaldoublecoda', Direction.JumpDalSegnoAlDoubleCoda],
        ['dalsegnoalfine', Direction.JumpDalSegnoAlFine],

        ['dalsegnosegno', Direction.JumpDalSegnoSegno],
        ['dalsegnosegnoalcoda', Direction.JumpDalSegnoSegnoAlCoda],
        ['dalsegnosegnoaldoublecoda', Direction.JumpDalSegnoSegnoAlDoubleCoda],
        ['dalsegnosegnoalfine', Direction.JumpDalSegnoSegnoAlFine],

        ['dacoda', Direction.JumpDaCoda],
        ['dadoublecoda', Direction.JumpDaDoubleCoda]
    ]);
    public static readonly directionsReversed = AlphaTex1EnumMappings.reverse(AlphaTex1EnumMappings.directions);
}

export class AlphaTex1LanguageHandler implements IAlphaTexMetaDataReader, IAlphaTexLanguageHandler {
    public static readonly instance = new AlphaTex1LanguageHandler();

    private static valueType(
        expectedTypes: AlphaTexNodeType[],
        parseMode: ValueListParseTypesMode,
        allowedValues?: string[],
        reservedIdentifiers?: string[]
    ): ValueListParseTypesExtended {
        return {
            expectedTypes: new Set<AlphaTexNodeType>(expectedTypes),
            parseMode,
            allowedValues: allowedValues ? new Set<string>(allowedValues) : undefined,
            reservedIdentifiers: reservedIdentifiers ? new Set<string>(reservedIdentifiers) : undefined
        };
    }
    private static basicList(basic: ValueListParseTypesBasic[]): ValueListParseTypesExtended[] {
        return basic.map(b => AlphaTex1LanguageHandler.valueType(b[0], b[1]));
    }

    private static readonly scoreInfoValueListTypes: ValueListParseTypes = AlphaTex1LanguageHandler.basicList([
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Required],
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional],
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional]
    ]);
    private static readonly scoreInfoTemplateValueListTypes: ValueListParseTypes = AlphaTex1LanguageHandler.basicList([
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Required],
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Optional]
    ]);
    private static readonly numberOnlyValueListTypes: ValueListParseTypes = AlphaTex1LanguageHandler.basicList([
        [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required]
    ]);
    private static readonly textLikeValueListTypes: ValueListParseTypes = AlphaTex1LanguageHandler.basicList([
        [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Required]
    ]);

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
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Optional
                ]
            ])
        ],

        // showfingering, showfingering true, showfingering false, showfingering 0, showfingering 1
        [
            'showfingering',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Optional
                ]
            ])
        ],

        // showname, showname true, showname false, showname 0, showname 1
        [
            'showname',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Optional
                ]
            ])
        ],

        // barre 1 2 3
        [
            'barre',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.ValueListWithoutParenthesis]
            ])
        ]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in `\staff {}` properties.
     */
    private static readonly staffPropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // score, score 1
        [
            'score',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],
        ['tabs', undefined],
        ['slash', undefined],
        ['numbered', undefined]
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

        // bank 16
        ['bank', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // systemslayout 1 2 3 4 5
        [
            'systemslayout',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.ValueListWithoutParenthesis]
            ])
        ],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ])
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
        ['legatoorigin', undefined],
        ['timer', undefined],

        // tu 3, tu 3,2
        [
            'tu',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ])
        ],

        // txt "Text", txt Intro
        ['txt', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // lyrics "Lyrics", lyrics 2 "Lyrics Line 2"
        [
            'lyrics',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Required]
            ])
        ],

        // tu 3, tu 3 2
        [
            'tu',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ])
        ],

        // tb dip fast (0 -1 0), tb dip (0 -1 0), tb (0 -1 0)
        [
            'tb',
            [
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        // tbe dip fast (0 0 -1 30 0 60), tbe dip (0 0 -1 30 0 60), tbe (0 0 -1 30 0 60)
        [
            'tbe',
            [
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        // bu, bu 16
        [
            'bu',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],

        // bd, bd 16
        [
            'bd',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],

        // au, au 16
        [
            'au',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],

        // ad, ad 16
        [
            'ad',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],

        // ch C, ch "C"
        ['ch', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // gr, gr ob, gr b
        [
            'gr',
            [
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.graceTypes.keys())
                )
            ]
        ],

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
                AlphaTex1LanguageHandler.valueType([AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.barreShapes.keys())
                )
            ]
        ],

        // rasg ii, rasg "mi"
        ['rasg', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // ot 15ma, ot "regular"
        ['ot', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ])
        ],

        // bank 127
        ['bank', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // fermata short, fermata short 0.5
        [
            'fermata',
            [
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.fermataTypes.keys())
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.OptionalAsFloat
                )
            ]
        ],

        // beam invert
        ['beam', AlphaTex1LanguageHandler.textLikeValueListTypes]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in beat duration properties.
     */
    private static readonly beatDurationPropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // tu 3, tu 3,2
        [
            'tu',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ])
        ]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in note level properties (note effects).
     */
    private static readonly notePropertyValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        [
            'nh',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],
        [
            'ah',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],
        [
            'th',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],
        [
            'ph',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],
        [
            'sh',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],
        [
            'fh',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],

        ['v', undefined],
        ['vw', undefined],
        ['sl', undefined],
        ['ss', undefined],
        ['sib', undefined],
        ['sia', undefined],
        ['sou', undefined],
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
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        //  be bendRelease fast (0 0 4 30 0 60), be bendRelease (0 0 4 30 0 60), be (0 0 4 30 0 60)
        [
            'be',
            [
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.bendTypes.keys())
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.bendStyles.keys())
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        // tr 14, tr 14 32
        [
            'tr',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ])
        ],

        // lf, lf 1
        [
            'lf',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],

        // rf, rf 1
        [
            'rf',
            AlphaTex1LanguageHandler.basicList([[[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]])
        ],

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
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.OptionalAsFloat]
            ])
        ]
    ]);

    private static readonly structuralMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // track, track Name, track ShortName Name, track "Name", track "ShortName" "Name"
        [
            'track',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Optional]
            ])
        ],
        ['staff', undefined],
        ['voice', undefined]
    ]);

    private static readonly staffMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // tuning E4 B3 G3 D3 A2 E2, \tuning "E4" "B3" "G3" "D3"
        [
            'tuning',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral],
                    ValueListParseTypesMode.ValueListWithoutParenthesis
                ]
            ])
        ],

        // chord "C" 0 1 0 2 3 x
        [
            'chord',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Required],
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.ValueListWithoutParenthesis
                ]
            ])
        ],
        // capo 3
        ['capo', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ])
        ],
        // bank 127
        ['bank', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // lyrics "Text", lyrics 1 "Text"
        [
            'lyrics',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Required]
            ])
        ],

        // articulation defaults, articulation "Name" 27
        [
            'articulation',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Optional]
            ])
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
        ['wordsandmusic', AlphaTex1LanguageHandler.scoreInfoTemplateValueListTypes],
        ['copyright', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['copyright2', AlphaTex1LanguageHandler.scoreInfoTemplateValueListTypes],
        ['instructions', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['notices', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['tab', AlphaTex1LanguageHandler.scoreInfoValueListTypes],
        ['defaultsystemslayout', AlphaTex1LanguageHandler.numberOnlyValueListTypes],
        // systemslayout 1 2 3 4 5
        [
            'systemslayout',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.ValueListWithoutParenthesis]
            ])
        ],
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
        ['othersystemstracknameorientation', AlphaTex1LanguageHandler.textLikeValueListTypes],
        // tempo 120, tempo 120 "Moderate"
        [
            'tempo',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsFloat],
                [[AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Optional]
            ])
        ]
    ]);

    /**
     * Contains the definitions how to read the metadata values for given metadata tags using
     * {@link readTypedValueList}
     * @private
     */
    private static readonly barMetaDataValueListTypes = new Map<string, ValueListParseTypes | undefined>([
        // tempo 120, tempo 120 "Moderate", tempo 120 "Moderate" 0.5
        [
            'tempo',
            [
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.RequiredAsFloat
                ),
                AlphaTex1LanguageHandler.valueType([AlphaTexNodeType.StringLiteral], ValueListParseTypesMode.Optional),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.OptionalAsFloatInValueList
                )
            ]
        ],

        // rc 2
        ['rc', AlphaTex1LanguageHandler.numberOnlyValueListTypes],

        // ae (1 2 3), ae 2
        [
            'ae',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsValueList]
            ])
        ],

        // ts common, ts "common", ts 3 4
        [
            'ts',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.OptionalAndStop
                ],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.Required]
            ])
        ],

        // ks fmajor or ks "fmajor"
        ['ks', AlphaTex1LanguageHandler.textLikeValueListTypes],

        // clef G2, clef "g2", clef 43,
        [
            'clef',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ])
        ],

        // section "Text", section "Marker" "Text", section Intro, section I Intro
        [
            'section',
            [
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Required
                ),
                AlphaTex1LanguageHandler.valueType(
                    [AlphaTexNodeType.StringLiteral, AlphaTexNodeType.Identifier],
                    ValueListParseTypesMode.Optional,
                    undefined,
                    ['x', '-', 'r']
                )
            ]
        ],

        // tf triplet16th, tf "Triplet16th", tf 1
        [
            'tf',
            AlphaTex1LanguageHandler.basicList([
                [
                    [AlphaTexNodeType.Identifier, AlphaTexNodeType.StringLiteral, AlphaTexNodeType.NumberLiteral],
                    ValueListParseTypesMode.Required
                ]
            ])
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
        [
            'scale',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],

        [
            'spd',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],
        [
            'spu',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],
        [
            'sph',
            AlphaTex1LanguageHandler.basicList([
                [[AlphaTexNodeType.NumberLiteral], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],

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
            code: AlphaTexDiagnosticCode.AT206,
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
            case 'staff':
                return this.readPropertyValues(
                    parser,
                    [AlphaTex1LanguageHandler.staffPropertyValueListTypes],
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
        const endOfProperty = new Set<AlphaTexNodeType>([
            AlphaTexNodeType.Identifier,
            AlphaTexNodeType.BraceCloseToken
        ]);
        for (const lookup of lookups) {
            if (lookup.has(tag)) {
                const types = lookup.get(tag);
                if (types) {
                    return this.readTypedValueList(parser, types, endOfProperty);
                } else {
                    return undefined;
                }
            }
        }
        parser.addParserDiagnostic({
            code: AlphaTexDiagnosticCode.AT207,
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
        expectedValues: ValueListParseTypes,
        endOfListTypes?: Set<AlphaTexNodeType>
    ): AlphaTexValueList | undefined {
        const valueList: AlphaTexValueList = {
            nodeType: AlphaTexNodeType.ValueList,
            values: [],
            start: parser.lexer.peekToken()?.start
        };
        let error = false;
        let parseRemaining = endOfListTypes !== undefined;
        try {
            let i = 0;
            while (i < expectedValues.length) {
                const expected = expectedValues[i];

                const value = parser.lexer.peekToken();

                // prevent parsing of special float values which could overlap
                // with stringed notes
                if (expected.parseMode === ValueListParseTypesMode.OptionalAsFloatInValueList) {
                    parseRemaining = false;
                    break;
                }

                // NOTE: The parser already handles parenthesized value lists, we only need to handle this
                // parse mode in the validation.

                if (
                    value &&
                    (expected.expectedTypes.has(value.nodeType) ||
                        // value lists start with a parenthesis open token
                        AlphaTex1LanguageHandler.isValueListMatch(value, expected))
                ) {
                    this.handleTypeValueListItem(parser, valueList, value, expected);
                    switch (expected.parseMode) {
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
                    switch (expected.parseMode) {
                        // end of value list
                        case ValueListParseTypesMode.ValueListWithoutParenthesis:
                            i++;
                            break;
                        case ValueListParseTypesMode.Required:
                        case ValueListParseTypesMode.RequiredAsFloat:
                            parser.unexpectedToken(value, Array.from(expected.expectedTypes), true);
                            error = true;
                            break;

                        case ValueListParseTypesMode.Optional:
                        case ValueListParseTypesMode.OptionalAsFloat:
                        case ValueListParseTypesMode.OptionalAndStop:
                            // optional not matched -> try next
                            i++;
                            break;

                        case ValueListParseTypesMode.RequiredAsValueList:
                            // optional -> not matched, value listed ended, check next
                            i++;
                            break;
                    }
                }
            }
        } finally {
            valueList.end = parser.lexer.currentTokenLocation();
        }

        if (error) {
            throw new AlphaTexParserAbort();
        }

        // read remaining values user might have supplied
        if (parseRemaining) {
            let remaining = parser.lexer.peekToken();
            while (remaining && !endOfListTypes!.has(remaining.nodeType)) {
                if (this.handleTypeValueListItem(parser, valueList, remaining, undefined)) {
                    remaining = parser.lexer.peekToken();
                } else {
                    remaining = undefined;
                }
            }
        }

        if (valueList.values.length === 0) {
            return undefined;
        }

        return valueList;
    }
    private static isValueListMatch(value: AlphaTexAstNode, expected: ValueListParseTypesExtended): boolean {
        if (value.nodeType !== AlphaTexNodeType.ParenthesisOpenToken) {
            return false;
        }

        return (
            expected.expectedTypes.has(AlphaTexNodeType.ValueList) ||
            expected.parseMode === ValueListParseTypesMode.ValueListWithoutParenthesis ||
            expected.parseMode === ValueListParseTypesMode.RequiredAsValueList
        );
    }

    private handleTypeValueListItem(
        parser: AlphaTexParser,
        valueList: AlphaTexValueList,
        value: AlphaTexAstNode,
        expected: ValueListParseTypesExtended | undefined
    ): boolean {
        switch (value.nodeType) {
            case AlphaTexNodeType.Identifier:
                if (expected?.allowedValues) {
                    const identifierText = (parser.lexer.peekToken() as AlphaTexIdentifier).text;
                    if (expected.allowedValues.has(identifierText.toLowerCase())) {
                        valueList.values.push(parser.lexer.nextToken() as AlphaTexIdentifier);
                    }
                } else if (expected?.reservedIdentifiers) {
                    const identifierText = (parser.lexer.peekToken() as AlphaTexIdentifier).text;
                    if (!expected?.reservedIdentifiers.has(identifierText.toLowerCase())) {
                        valueList.values.push(parser.lexer.nextToken() as AlphaTexIdentifier);
                    }
                } else {
                    valueList.values.push(parser.lexer.nextToken() as AlphaTexIdentifier);
                }

                return true;
            case AlphaTexNodeType.StringLiteral:
                if (expected?.allowedValues) {
                    const identifierText = (parser.lexer.peekToken() as AlphaTexStringLiteral).text;
                    if (expected.allowedValues.has(identifierText.toLowerCase())) {
                        valueList.values.push(parser.lexer.nextToken() as AlphaTexStringLiteral);
                    }
                } else {
                    valueList.values.push(parser.lexer.nextToken() as AlphaTexStringLiteral);
                }
                return true;
            case AlphaTexNodeType.NumberLiteral:
                const parseMode = expected?.parseMode ?? ValueListParseTypesMode.Optional;
                switch (parseMode) {
                    case ValueListParseTypesMode.RequiredAsFloat:
                    case ValueListParseTypesMode.OptionalAsFloat:
                        valueList.values.push(parser.lexer.nextTokenWithFloats() as AlphaTexNumberLiteral);
                        break;
                    default:
                        valueList.values.push(parser.lexer.nextToken() as AlphaTexNumberLiteral);
                        break;
                }
                return true;
            case AlphaTexNodeType.ParenthesisOpenToken:
                const nestedList = parser.valueList();
                if (nestedList) {
                    valueList.values.push(nestedList);
                }
                return true;
        }
        return false;
    }

    public applyScoreMetaData(
        importer: IAlphaTexImporter,
        score: Score,
        metaData: AlphaTexMetaDataNode
    ): ApplyNodeResult {
        const result = this.checkValueListTypes(
            importer,
            [AlphaTex1LanguageHandler.scoreMetaDataValueListTypes],
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
                this.headerFooterStyle(importer, score, ScoreSubElement.CopyrightSecondLine, metaData, 0);
                return ApplyNodeResult.Applied;
            case 'wordsandmusic':
                this.headerFooterStyle(importer, score, ScoreSubElement.WordsAndMusic, metaData, 0);
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
                    AlphaTex1EnumMappings.bracketExtendModes
                );
                if (bracketExtendMode === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                score.stylesheet.bracketExtendMode = bracketExtendMode!;
                return ApplyNodeResult.Applied;
            case 'usesystemsignseparator':
                score.stylesheet.useSystemSignSeparator = true;
                return ApplyNodeResult.Applied;
            case 'multibarrest':
                score.stylesheet.multiTrackMultiBarRest = true;
                return ApplyNodeResult.Applied;
            case 'singletracktracknamepolicy':
                const singleTrackTrackNamePolicy = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'track name policy',
                    AlphaTex1EnumMappings.trackNamePolicies
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
                    AlphaTex1EnumMappings.trackNamePolicies
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
                    AlphaTex1EnumMappings.trackNameMode
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
                    AlphaTex1EnumMappings.trackNameMode
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
                    AlphaTex1EnumMappings.trackNameOrientations
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
                    AlphaTex1EnumMappings.trackNameOrientations
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
                    code: AlphaTexDiagnosticCode.AT300,
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
                let tuningName = '';
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
                            } else if (i === metaData.values!.values.length - 1 && tuning.length > 0) {
                                tuningName = text;
                            } else {
                                const tuningLetters = Array.from(ModelUtils.tuningLetters).join(',');
                                const accidentalModes = Array.from(ModelUtils.accidentalModeMapping.keys()).join(',');
                                importer.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT209,
                                    message: `Unexpected tuning value '${text}', expected: <note><accidental><octave> where <note>=oneOf(${tuningLetters}) <accidental>=oneOf(${accidentalModes}), <octave>=number`,
                                    start: v.start,
                                    end: v.end,
                                    severity: AlphaTexDiagnosticsSeverity.Error
                                });
                            }
                            break;
                    }
                }

                importer.state.staffHasExplicitTuning.add(staff);
                importer.state.staffTuningApplied.delete(staff);
                staff.stringTuning = new Tuning();
                staff.stringTuning.tunings = tuning;
                staff.stringTuning.name = tuningName;
                if (hideTuning) {
                    if (!staff.track.score.stylesheet.perTrackDisplayTuning) {
                        staff.track.score.stylesheet.perTrackDisplayTuning = new Map<number, boolean>();
                    }
                    staff.track.score.stylesheet.perTrackDisplayTuning!.set(staff.track.index, false);
                }
                return ApplyNodeResult.Applied;
            case 'instrument':
                importer.state.staffTuningApplied.delete(staff);
                this.readTrackInstrument(importer, staff.track, metaData.values!);

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
                importer.state.lyrics.get(staff.track.index)!.push(lyrics);

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
                const percussionArticulationNames = importer.state.percussionArticulationNames;
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
                        const articulations = Array.from(PercussionMapper.instrumentArticulations.keys())
                            .map(n => `${n}`)
                            .join(',');
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected articulation value '${number}', expected: ${articulations}`,
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
                importer.state.staffHasExplicitDisplayTransposition.add(staff);
                return ApplyNodeResult.Applied;
            case 'transpose':
                staff.transpositionPitch = (metaData.values!.values[0] as AlphaTexNumberLiteral).value * -1;
                return ApplyNodeResult.Applied;
            default:
                return ApplyNodeResult.NotAppliedUnrecognizedMarker;
        }
    }

    public applyBarMetaData(importer: IAlphaTexImporter, bar: Bar, metaData: AlphaTexMetaDataNode): ApplyNodeResult {
        const result = this.checkValueListTypes(
            importer,
            [AlphaTex1LanguageHandler.barMetaDataValueListTypes],
            metaData,
            metaData.tag.tag.text.toLowerCase(),
            metaData.values
        );
        if (result !== undefined) {
            return result!;
        }

        switch (metaData.tag.tag.text.toLowerCase()) {
            case 'tempo':
                let ti = 0;
                const tempo = (metaData.values!.values[ti++] as AlphaTexNumberLiteral).value;
                let tempoLabel = '';
                let ratioPosition = 0;

                while (ti < metaData.values!.values.length) {
                    switch (metaData.values!.values[ti].nodeType) {
                        case AlphaTexNodeType.Identifier:
                        case AlphaTexNodeType.StringLiteral:
                            tempoLabel = (metaData.values!.values[ti] as AlphaTexTextNode).text;
                            break;
                        case AlphaTexNodeType.NumberLiteral:
                            ratioPosition = (metaData.values!.values[ti] as AlphaTexNumberLiteral).value;
                            break;
                    }
                    ti++;
                }

                let tempoAutomation = bar.masterBar.tempoAutomations.find(a => a.ratioPosition === ratioPosition);
                if (!tempoAutomation) {
                    tempoAutomation = new Automation();
                    bar.masterBar.tempoAutomations.push(tempoAutomation);
                }
                tempoAutomation.isLinear = false;
                tempoAutomation.type = AutomationType.Tempo;
                tempoAutomation.value = tempo;
                tempoAutomation.text = tempoLabel;
                tempoAutomation.ratioPosition = ratioPosition;
                if (bar.index === 0 && ratioPosition === 0) {
                    bar.staff.track.score.tempo = tempo;
                    bar.staff.track.score.tempoLabel = tempoLabel;
                }
                return ApplyNodeResult.Applied;
            case 'rc':
                bar.masterBar.repeatCount = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                return ApplyNodeResult.Applied;
            case 'ae':
                for (const e of metaData.values!.values) {
                    if (e.nodeType === AlphaTexNodeType.NumberLiteral) {
                        const num = (e as AlphaTexNumberLiteral).value;
                        if (num < 1 || num > 31) {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT211,
                                message: `Value is out of valid range. Allowed range: %s, Actual Value: %s`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: e.start,
                                end: e.end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                        } else {
                            // Alternate endings bitflag starts from 0
                            bar.masterBar.alternateEndings |= 1 << (num - 1);
                        }
                    } else {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT204,
                            message: `Unexpected '${AlphaTexNodeType[e.nodeType]}' token. Expected one of following: ${AlphaTexNodeType[AlphaTexNodeType.NumberLiteral]}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: e.start,
                            end: e.end
                        });
                    }
                }
                return ApplyNodeResult.Applied;
            case 'ts':
                switch (metaData.values!.values[0].nodeType) {
                    case AlphaTexNodeType.NumberLiteral:
                        bar.masterBar.timeSignatureNumerator = (
                            metaData.values!.values[0] as AlphaTexNumberLiteral
                        ).value;
                        bar.masterBar.timeSignatureDenominator = (
                            metaData.values!.values[1] as AlphaTexNumberLiteral
                        ).value;
                        break;
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        const tsValue = (metaData.values!.values[0] as AlphaTexTextNode).text;
                        if (tsValue.toLowerCase() === 'common') {
                            bar.masterBar.timeSignatureCommon = true;
                            bar.masterBar.timeSignatureNumerator = 4;
                            bar.masterBar.timeSignatureDenominator = 4;
                        } else {
                            importer.addSemanticDiagnostic({
                                code: AlphaTexDiagnosticCode.AT209,
                                message: `Unexpected time signature value '${tsValue}', expected: common or two numbers`,
                                severity: AlphaTexDiagnosticsSeverity.Error,
                                start: metaData.values!.values[0].start,
                                end: metaData.values!.values[0].end
                            });
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        break;
                }
                return ApplyNodeResult.Applied;
            case 'ks':
                const keySignature = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'key signature',
                    AlphaTex1EnumMappings.keySignatures
                );
                if (keySignature === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }

                const keySignatureType = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'key signature type',
                    AlphaTex1EnumMappings.keySignatureTypes
                );
                if (keySignatureType === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }

                bar.keySignature = keySignature!;
                bar.keySignatureType = keySignatureType!;

                return ApplyNodeResult.Applied;
            case 'clef':
                switch (metaData.values!.values[0].nodeType) {
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        const clef = AlphaTex1LanguageHandler.parseEnumValue(
                            importer,
                            metaData.values!,
                            'clef',
                            AlphaTex1EnumMappings.clefs
                        );
                        if (clef === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        bar.clef = clef!;
                        break;

                    case AlphaTexNodeType.NumberLiteral:
                        const clefValue = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;

                        switch (clefValue) {
                            case 0:
                                bar.clef = Clef.Neutral;
                                break;
                            case 43:
                                bar.clef = Clef.G2;
                                break;
                            case 65:
                                bar.clef = Clef.F4;
                                break;
                            case 48:
                                bar.clef = Clef.C3;
                                break;
                            case 60:
                                bar.clef = Clef.C4;
                                break;
                            default:
                                importer.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT209,
                                    message: `Unexpected clef value '${clef}', expected: ${Array.from(AlphaTex1EnumMappings.clefs.keys()).join(',')}`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: metaData.values!.values[0].start,
                                    end: metaData.values!.values[0].end
                                });
                                return ApplyNodeResult.NotAppliedSemanticError;
                        }

                        break;
                }

                return ApplyNodeResult.Applied;
            case 'section':
                const section = new Section();
                if (metaData.values!.values.length === 1) {
                    section.text = (metaData.values!.values[0] as AlphaTexTextNode).text;
                } else {
                    section.marker = (metaData.values!.values[0] as AlphaTexTextNode).text;
                    section.text = (metaData.values!.values[1] as AlphaTexTextNode).text;
                }
                bar.masterBar.section = section;
                return ApplyNodeResult.Applied;
            case 'tf':
                switch (metaData.values!.values[0].nodeType) {
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        const tripletFeel = AlphaTex1LanguageHandler.parseEnumValue(
                            importer,
                            metaData.values!,
                            'triplet feel',
                            AlphaTex1EnumMappings.tripletFeels
                        );
                        if (tripletFeel === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        bar.masterBar.tripletFeel = tripletFeel!;
                        break;

                    case AlphaTexNodeType.NumberLiteral:
                        const tripletFeelValue = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;

                        switch (tripletFeelValue) {
                            case 0:
                                bar.masterBar.tripletFeel = TripletFeel.NoTripletFeel;
                                break;
                            case 1:
                                bar.masterBar.tripletFeel = TripletFeel.Triplet16th;
                                break;
                            case 2:
                                bar.masterBar.tripletFeel = TripletFeel.Triplet8th;
                                break;
                            case 3:
                                bar.masterBar.tripletFeel = TripletFeel.Dotted16th;
                                break;
                            case 4:
                                bar.masterBar.tripletFeel = TripletFeel.Dotted8th;
                                break;
                            case 5:
                                bar.masterBar.tripletFeel = TripletFeel.Scottish16th;
                                break;
                            case 6:
                                bar.masterBar.tripletFeel = TripletFeel.Scottish8th;
                                break;
                            default:
                                importer.addSemanticDiagnostic({
                                    code: AlphaTexDiagnosticCode.AT209,
                                    message: `Unexpected triplet feel value '${tripletFeelValue}', expected: ${Array.from(AlphaTex1EnumMappings.tripletFeels.keys()).join(',')}`,
                                    severity: AlphaTexDiagnosticsSeverity.Error,
                                    start: metaData.values!.values[0].start,
                                    end: metaData.values!.values[0].end
                                });
                                return ApplyNodeResult.NotAppliedSemanticError;
                        }

                        break;
                }
                return ApplyNodeResult.Applied;
            case 'barlineleft':
                const barLineLeft = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'bar line',
                    AlphaTex1EnumMappings.barLines
                );
                if (barLineLeft === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.barLineLeft = barLineLeft!;
                return ApplyNodeResult.Applied;
            case 'barlineright':
                const barLineRight = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'bar line',
                    AlphaTex1EnumMappings.barLines
                );
                if (barLineRight === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.barLineRight = barLineRight!;
                return ApplyNodeResult.Applied;
            case 'accidentals':
                return AlphaTex1LanguageHandler.handleAccidentalMode(importer, metaData.values!);
            case 'jump':
                const direction = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'direction',
                    AlphaTex1EnumMappings.directions
                );
                if (direction === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.masterBar.addDirection(direction!);
                return ApplyNodeResult.Applied;
            case 'ottava':
                const ottava = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'clef ottava',
                    AlphaTex1EnumMappings.ottavia
                );
                if (ottava === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.clefOttava = ottava!;
                return ApplyNodeResult.Applied;
            case 'simile':
                const simile = AlphaTex1LanguageHandler.parseEnumValue(
                    importer,
                    metaData.values!,
                    'simile mark',
                    AlphaTex1EnumMappings.simileMarks
                );
                if (simile === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                bar.simileMark = simile!;
                return ApplyNodeResult.Applied;
            case 'width':
                bar.masterBar.displayWidth = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.displayWidth = bar.masterBar.displayWidth;
                return ApplyNodeResult.Applied;
            case 'scale':
                bar.masterBar.displayScale = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.displayScale = bar.masterBar.displayScale;
                return ApplyNodeResult.Applied;
            case 'spd':
                const sustainPedalDown = new SustainPedalMarker();
                sustainPedalDown.pedalType = SustainPedalMarkerType.Down;
                sustainPedalDown.ratioPosition = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.sustainPedals.push(sustainPedalDown);
                return ApplyNodeResult.Applied;
            case 'spu':
                const sustainPedalUp = new SustainPedalMarker();
                sustainPedalUp.pedalType = SustainPedalMarkerType.Up;
                sustainPedalUp.ratioPosition = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.sustainPedals.push(sustainPedalUp);
                return ApplyNodeResult.Applied;
            case 'sph':
                const sustainPedalHold = new SustainPedalMarker();
                sustainPedalHold.pedalType = SustainPedalMarkerType.Hold;
                sustainPedalHold.ratioPosition = (metaData.values!.values[0] as AlphaTexNumberLiteral).value;
                bar.sustainPedals.push(sustainPedalHold);
                return ApplyNodeResult.Applied;
            case 'ft':
                bar.masterBar.isFreeTime = true;
                return ApplyNodeResult.Applied;
            case 'ro':
                bar.masterBar.isRepeatStart = true;
                return ApplyNodeResult.Applied;
            case 'ac':
                bar.masterBar.isAnacrusis = true;
                return ApplyNodeResult.Applied;
            case 'db':
                bar.masterBar.isDoubleBar = true;
                bar.barLineRight = BarLineStyle.LightLight;
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
            AlphaTex1EnumMappings.accidentalModes
        );
        if (accidentalMode === undefined) {
            return ApplyNodeResult.NotAppliedSemanticError;
        }
        importer.state.accidentalMode = accidentalMode!;
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
            const anyRequired = expectedValues.some(
                v =>
                    v.parseMode === ValueListParseTypesMode.Required ||
                    v.parseMode === ValueListParseTypesMode.RequiredAsFloat ||
                    v.parseMode === ValueListParseTypesMode.RequiredAsValueList
            );
            if (anyRequired) {
                const expectedTypes = AlphaTex1LanguageHandler.buildExpectedTypesMessage(expectedValues);

                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT210,
                    message: `Missing value. Expected following values: ${expectedTypes}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: parent.start,
                    end: parent.end
                });
                return false;
            } else {
                return true;
            }
        }

        while (expectedIndex < expectedValues.length) {
            const expected = expectedValues[expectedIndex];

            const value = actualIndex < values.values.length ? values.values[actualIndex] : undefined;

            // basic match
            if (value && expected.expectedTypes.has(value.nodeType)) {
                actualIndex++;
                switch (expected.parseMode) {
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
                continue;
            }

            // value list
            if (
                value &&
                value.nodeType === AlphaTexNodeType.ValueList &&
                (expected.parseMode === ValueListParseTypesMode.ValueListWithoutParenthesis ||
                    expected.parseMode === ValueListParseTypesMode.RequiredAsValueList)
            ) {
                actualIndex++;
                expectedIndex++;
                for (const item of (value as AlphaTexValueList).values) {
                    if (!expected.expectedTypes.has(item.nodeType)) {
                        const expectedTypes = AlphaTex1LanguageHandler.buildExpectedTypesMessage([expected]);
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected list item value '${AlphaTexNodeType[value.nodeType]}', expected: ${expectedTypes}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: item.start,
                            end: item.end
                        });
                    }
                }
                continue;
            }

            // error handling
            const expectedTypes = AlphaTex1LanguageHandler.buildExpectedTypesMessage([expected]);
            if (value) {
                switch (expected.parseMode) {
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                        // end of value list as soon we have a different type
                        expectedIndex++;
                        break;
                    case ValueListParseTypesMode.Required:
                    case ValueListParseTypesMode.RequiredAsFloat:
                    case ValueListParseTypesMode.RequiredAsValueList:
                        error = true;
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected required value '${AlphaTexNodeType[value.nodeType]}', expected: ${expectedTypes}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: value.start,
                            end: value.end
                        });
                        expectedIndex++;
                        actualIndex++;
                        break;
                    case ValueListParseTypesMode.Optional:
                    case ValueListParseTypesMode.OptionalAsFloat:
                    case ValueListParseTypesMode.OptionalAsFloatInValueList:
                    case ValueListParseTypesMode.OptionalAndStop:
                        // Skip value and try next
                        expectedIndex++;
                        break;
                }
            } else {
                // no value anymore
                switch (expected.parseMode) {
                    case ValueListParseTypesMode.Required:
                    case ValueListParseTypesMode.RequiredAsFloat:
                        error = true;
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT210,
                            message: `Missing values. Expected following values: ${expectedTypes}`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: values.end,
                            end: values.end
                        });
                        expectedIndex = expectedValues.length;
                        break;
                    case ValueListParseTypesMode.ValueListWithoutParenthesis:
                    case ValueListParseTypesMode.RequiredAsValueList:
                        // end of list
                        expectedIndex++;
                        break;
                    case ValueListParseTypesMode.Optional:
                    case ValueListParseTypesMode.OptionalAsFloat:
                    case ValueListParseTypesMode.OptionalAsFloatInValueList:
                    case ValueListParseTypesMode.OptionalAndStop:
                        // no value for optional item
                        expectedIndex++;
                        break;
                }
            }
        }

        // remaining values?
        if (actualIndex < values.values.length) {
            while (actualIndex < values.values.length) {
                const expectedTypes = AlphaTex1LanguageHandler.buildExpectedTypesMessage(expectedValues);
                const value = values.values[actualIndex];
                importer.addSemanticDiagnostic({
                    code: AlphaTexDiagnosticCode.AT209,
                    message: `Unexpected additional value '${AlphaTexNodeType[value.nodeType]}', expected: ${expectedTypes}`,
                    severity: AlphaTexDiagnosticsSeverity.Error,
                    start: value.start,
                    end: value.end
                });
                actualIndex++;
            }
        }

        return !error;
    }

    private headerFooterStyle(
        importer: IAlphaTexImporter,
        score: Score,
        element: ScoreSubElement,
        metaData: AlphaTexMetaDataNode,
        startIndex: number = 1
    ) {
        const remaining = metaData.values!.values.length - startIndex;
        if (remaining < 1) {
            return;
        }

        const style = ModelUtils.getOrCreateHeaderFooterStyle(score, element);
        if (style.isVisible === undefined) {
            style.isVisible = true;
        }

        const value = (metaData.values!.values[startIndex] as AlphaTexTextNode).text;
        if (value) {
            style.template = value;
        } else {
            style.isVisible = false;
        }

        if (remaining < 2) {
            return;
        }

        const textAlign = AlphaTex1LanguageHandler.parseEnumValue(
            importer,
            metaData.values!,
            'textAlign',
            AlphaTex1EnumMappings.textAligns,
            startIndex + 1
        );
        if (textAlign === undefined) {
            return;
        }
        style.textAlign = textAlign!;
    }

    private static buildExpectedTypesMessage(values: ValueListParseTypes) {
        const parts: string[] = [];

        for (const v of values) {
            const types = Array.from(v.expectedTypes)
                .map(t => AlphaTexNodeType[t])
                .join('|');
            switch (v.parseMode) {
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

    private readTrackInstrument(importer: IAlphaTexImporter, track: Track, values: AlphaTexValueList) {
        switch (values!.values[0].nodeType) {
            case AlphaTexNodeType.NumberLiteral:
                const instrument = (values!.values[0] as AlphaTexNumberLiteral).value;
                if (instrument >= 0 && instrument <= 127) {
                    track.playbackInfo.program = instrument;
                } else {
                    importer.addSemanticDiagnostic({
                        code: AlphaTexDiagnosticCode.AT211,
                        message: `Value is out of valid range. Allowed range: 0-127, Actual Value: ${instrument}`,
                        start: values!.values[0].start,
                        end: values!.values[0].end,
                        severity: AlphaTexDiagnosticsSeverity.Error
                    });
                }
                break;
            case AlphaTexNodeType.Identifier:
            case AlphaTexNodeType.StringLiteral:
                const instrumentName = (values!.values[0] as AlphaTexTextNode).text.toLowerCase();
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
                        code: AlphaTexDiagnosticCode.AT212,
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

        let showStandardNotation: boolean = false;
        let showTabs: boolean = false;
        let showSlash: boolean = false;
        let showNumbered: boolean = false;

        for (const p of metaData.properties.properties) {
            if (!this.checkProperty(importer, [AlphaTex1LanguageHandler.staffPropertyValueListTypes], p)) {
                continue;
            }

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
        }

        if (showStandardNotation || showTabs || showSlash || showNumbered) {
            staff.showStandardNotation = showStandardNotation;
            staff.showTablature = showTabs;
            staff.showSlash = showSlash;
            staff.showNumbered = showNumbered;
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
                            code: AlphaTexDiagnosticCode.AT213,
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
                    this.readTrackInstrument(importer, track, p.values!);
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
                    importer.state.currentTupletNumerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    importer.state.currentTupletDenominator = (p.values!.values[1] as AlphaTexNumberLiteral).value;
                } else {
                    const numerator = (p.values!.values[0] as AlphaTexNumberLiteral).value;
                    importer.state.currentTupletNumerator = numerator;
                    const denominator = AlphaTex1LanguageHandler.getTupletDenominator(numerator);
                    if (denominator < 0) {
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected default tuplet value '${numerator}', expected: 3, 5, 6, 7, 9, 10, 11 or 12`,
                            severity: AlphaTexDiagnosticsSeverity.Error,
                            start: p.values!.values[0].start,
                            end: p.values!.values[0].end
                        });
                        importer.state.currentTupletNumerator = -1;
                        importer.state.currentTupletDenominator = -1;
                    } else {
                        importer.state.currentTupletDenominator = denominator;
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
    private _knownStaffMetaDataTags: Set<string> | undefined = undefined;
    public get knownStaffMetaDataTags() {
        if (!this._knownStaffMetaDataTags) {
            this._knownStaffMetaDataTags = new Set<string>(AlphaTex1LanguageHandler.staffMetaDataValueListTypes.keys());
        }
        return this._knownStaffMetaDataTags;
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

    private _knownNoteProperties: Set<string> | undefined = undefined;
    public get knownNoteProperties() {
        if (!this._knownNoteProperties) {
            this._knownNoteProperties = new Set<string>(AlphaTex1LanguageHandler.notePropertyValueListTypes.keys());
        }
        return this._knownNoteProperties;
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
                        importer.addSemanticDiagnostic({
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected default tuplet value '${numerator}', expected: 3, 5, 6, 7, 9, 10, 11 or 12`,
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
                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        const whammyBarType = AlphaTex1LanguageHandler.parseEnumValue(
                            importer,
                            p.values!,
                            'whammy type',
                            AlphaTex1EnumMappings.whammyTypes,
                            tbi
                        );
                        if (whammyBarType === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        beat.whammyBarType = whammyBarType;
                        tbi++;
                        break;
                }

                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        const whammyBarStyle = AlphaTex1LanguageHandler.parseEnumValue(
                            importer,
                            p.values!,
                            'whammy style',
                            AlphaTex1EnumMappings.bendStyles,
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
                        AlphaTex1EnumMappings.graceTypes
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
                    AlphaTex1EnumMappings.dynamics
                );
                if (dyn === undefined) {
                    return ApplyNodeResult.NotAppliedSemanticError;
                }
                beat.dynamics = dyn!;
                importer.state.currentDynamics = dyn!;
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
                    tempoLabel = (p.values!.values[1] as AlphaTexTextNode).text;
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
                                code: AlphaTexDiagnosticCode.AT209,
                                message: `Unexpected tremolo speed value '${tremoloSpeedValue}, expected: 8, 16 or 32`,
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
                        AlphaTex1EnumMappings.barreShapes,
                        1
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
                    AlphaTex1EnumMappings.rasgueadoPatterns
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
                    AlphaTex1EnumMappings.ottava
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
                    AlphaTex1EnumMappings.fermataTypes
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
                            code: AlphaTexDiagnosticCode.AT209,
                            message: `Unexpected beam value '${beamMode}', expected: ${allowedValues.join(',')}`,
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
        importer.state.sustainPedalToBeat.set(sustainPedal, beat);
        beat.voice.bar.sustainPedals.push(sustainPedal);
    }

    private static applyBrush(beat: Beat, p: AlphaTexPropertyNode, brushType: BrushType, durationFactor: number) {
        beat.brushType = brushType;
        if (p.values) {
            beat.brushDuration = (p.values!.values[0] as AlphaTexNumberLiteral).value;
        } else {
            beat.updateDurations();
            beat.brushDuration = (beat.playbackDuration * durationFactor) / beat.notes.length;
        }
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
                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        const bendType = AlphaTex1LanguageHandler.parseEnumValue(
                            importer,
                            p.values!,
                            'bend type',
                            AlphaTex1EnumMappings.bendTypes,
                            tbi
                        );
                        if (bendType === undefined) {
                            return ApplyNodeResult.NotAppliedSemanticError;
                        }
                        note.bendType = bendType;
                        tbi++;
                        break;
                }

                switch (p.values!.values[tbi].nodeType) {
                    case AlphaTexNodeType.Identifier:
                    case AlphaTexNodeType.StringLiteral:
                        const bendStyle = AlphaTex1LanguageHandler.parseEnumValue(
                            importer,
                            p.values!,
                            'bend style',
                            AlphaTex1EnumMappings.bendStyles,
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
                                code: AlphaTexDiagnosticCode.AT209,
                                message: `Unexpected trill duration value '${trillDurationValue}', expected: 16, 32 or 64`,
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
                if (importer.state.slurs.has(slurId)) {
                    const slurOrigin = importer.state.slurs.get(slurId)!;
                    slurOrigin.slurDestination = note;

                    note.slurOrigin = slurOrigin;
                    note.isSlurDestination = true;
                } else {
                    importer.state.slurs.set(slurId, note);
                }
                return ApplyNodeResult.Applied;
            default:
                // fallback to beat
                return this.applyBeatProperty(importer, note.beat, p);
        }

        // biome-ignore lint/correctness/noUnreachable: for cross compilation
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
                    code: AlphaTexDiagnosticCode.AT211,
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
        let values = p.values!.values;
        let remainingValues = values.length - valueStartIndex;
        let errorNode: AlphaTexAstNode = p.values!;

        // unwrap value list
        if (remainingValues > 0 && values[valueStartIndex].nodeType === AlphaTexNodeType.ValueList) {
            values = (values[valueStartIndex] as AlphaTexValueList).values;
            valueStartIndex = 0;
            remainingValues = values.length;
            errorNode = values[valueStartIndex];
        }

        const valuesPerItem = exact ? 2 : 1;
        if (remainingValues % valuesPerItem !== 0) {
            const pointCount = Math.ceil(remainingValues / valuesPerItem);
            const neededValues = pointCount * valuesPerItem;
            importer.addSemanticDiagnostic({
                code: AlphaTexDiagnosticCode.AT214,
                message: `The '${p.property.text}' effect needs ${valuesPerItem} values per item. With ${pointCount} points, ${neededValues} values are needed, only ${remainingValues} values found.`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: errorNode!.end,
                end: errorNode!.end
            });
            return undefined;
        }

        const points: BendPoint[] = [];
        let vi = valueStartIndex;
        while (vi < values.length) {
            let offset = 0;
            let value = 0;
            if (exact) {
                offset = (values[vi++] as AlphaTexNumberLiteral).value;
                value = (values[vi++] as AlphaTexNumberLiteral).value;
            } else {
                offset = 0;
                value = (values[vi++] as AlphaTexNumberLiteral).value;
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
        if (valueIndex >= p.values.length) {
            return undefined;
        }

        const txt = (p.values[valueIndex] as AlphaTexTextNode).text;
        if (lookup.has(txt.toLowerCase())) {
            return lookup.get(txt.toLowerCase())!;
        } else {
            importer.addSemanticDiagnostic({
                code: AlphaTexDiagnosticCode.AT209,
                message: `Unexpected ${name} value '${txt}', expected: ${Array.from(lookup.keys()).join(',')}`,
                severity: AlphaTexDiagnosticsSeverity.Error,
                start: p.values[valueIndex].start,
                end: p.values[valueIndex].end
            });
            return undefined;
        }
    }

    // used to lookup some default values.
    private static readonly defaultScore = new Score();
    private static readonly defaultTrack = new Track();

    public buildScoreMetaDataNodes(score: Score): AlphaTexMetaDataNode[] {
        const nodes: AlphaTexMetaDataNode[] = [];
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'album', score, score.album, ScoreSubElement.Album);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'artist', score, score.artist, ScoreSubElement.Artist);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(
            nodes,
            'copyright',
            score,
            score.copyright,
            ScoreSubElement.Copyright
        );
        AlphaTex1LanguageHandler.buildScoreInfoMeta(
            nodes,
            'copyright2',
            score,
            undefined,
            ScoreSubElement.CopyrightSecondLine
        );
        AlphaTex1LanguageHandler.buildScoreInfoMeta(
            nodes,
            'wordsandmusic',
            score,
            undefined,
            ScoreSubElement.WordsAndMusic,
            true
        );
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'instructions', score, score.instructions, undefined);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'music', score, score.music, ScoreSubElement.Music);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'notices', score, score.notices, undefined);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'subtitle', score, score.subTitle, ScoreSubElement.SubTitle);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'title', score, score.title, ScoreSubElement.Title);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'words', score, score.words, ScoreSubElement.Words);
        AlphaTex1LanguageHandler.buildScoreInfoMeta(nodes, 'tab', score, score.tab, ScoreSubElement.Transcriber);

        nodes.push(
            ATNF.metaData(
                'tempo',
                ATNF.valueList(false, [
                    { nodeType: AlphaTexNodeType.NumberLiteral, value: score.tempo },
                    score.tempoLabel ? { nodeType: AlphaTexNodeType.StringLiteral, text: score.tempoLabel } : undefined
                ])
            )
        );

        if (score.defaultSystemsLayout !== AlphaTex1LanguageHandler.defaultScore.defaultSystemsLayout) {
            nodes.push(ATNF.numberMetaData('defaultSystemsLayout', score.defaultSystemsLayout));
        }
        if (score.systemsLayout.length > 0) {
            nodes.push(
                ATNF.metaData(
                    'systemsLayout',
                    ATNF.valueList(
                        false,
                        score.systemsLayout.map(l => ({ nodeType: AlphaTexNodeType.NumberLiteral, value: l }))
                    )
                )
            );
        }

        AlphaTex1LanguageHandler.buildStyleSheetMetaData(nodes, score.stylesheet);

        if (nodes.length > 0) {
            nodes[0].leadingComments = [
                {
                    text: 'Score Metadata',
                    multiLine: false
                }
            ];
        }

        return nodes;
    }

    private static buildStyleSheetMetaData(nodes: AlphaTexMetaDataNode[], stylesheet: RenderStylesheet) {
        const firstStyleSheet = nodes.length;

        if (stylesheet.hideDynamics) {
            nodes.push(ATNF.metaData('hideDynamics'));
        }
        if (stylesheet.bracketExtendMode !== AlphaTex1LanguageHandler.defaultScore.stylesheet.bracketExtendMode) {
            nodes.push(
                ATNF.identifierMetaData(
                    'bracketExtendMode',
                    AlphaTex1EnumMappings.bracketExtendModesReversed.get(stylesheet.bracketExtendMode)!
                )
            );
        }
        if (stylesheet.useSystemSignSeparator) {
            nodes.push(ATNF.metaData('useSystemSignSeparator'));
        }
        if (stylesheet.multiTrackMultiBarRest) {
            nodes.push(ATNF.metaData('multiBarRest'));
        }
        if (
            stylesheet.singleTrackTrackNamePolicy !==
            AlphaTex1LanguageHandler.defaultScore.stylesheet.singleTrackTrackNamePolicy
        ) {
            nodes.push(
                ATNF.identifierMetaData(
                    'singleTrackTrackNamePolicy',
                    AlphaTex1EnumMappings.trackNamePoliciesReversed.get(stylesheet.singleTrackTrackNamePolicy)!
                )
            );
        }
        if (
            stylesheet.multiTrackTrackNamePolicy !==
            AlphaTex1LanguageHandler.defaultScore.stylesheet.multiTrackTrackNamePolicy
        ) {
            nodes.push(
                ATNF.identifierMetaData(
                    'multiTrackTrackNamePolicy',
                    AlphaTex1EnumMappings.trackNamePoliciesReversed.get(stylesheet.multiTrackTrackNamePolicy)!
                )
            );
        }
        if (
            stylesheet.firstSystemTrackNameMode !==
            AlphaTex1LanguageHandler.defaultScore.stylesheet.firstSystemTrackNameMode
        ) {
            nodes.push(
                ATNF.identifierMetaData(
                    'firstSystemTrackNameMode',
                    AlphaTex1EnumMappings.trackNameModeReversed.get(stylesheet.firstSystemTrackNameMode)!
                )
            );
        }
        if (
            stylesheet.otherSystemsTrackNameMode !==
            AlphaTex1LanguageHandler.defaultScore.stylesheet.otherSystemsTrackNameMode
        ) {
            nodes.push(
                ATNF.identifierMetaData(
                    'otherSystemsTrackNameMode',
                    AlphaTex1EnumMappings.trackNameModeReversed.get(stylesheet.otherSystemsTrackNameMode)!
                )
            );
        }
        if (
            stylesheet.firstSystemTrackNameOrientation !==
            AlphaTex1LanguageHandler.defaultScore.stylesheet.firstSystemTrackNameOrientation
        ) {
            nodes.push(
                ATNF.identifierMetaData(
                    'firstSystemTrackNameOrientation',
                    AlphaTex1EnumMappings.trackNameOrientationsReversed.get(stylesheet.firstSystemTrackNameOrientation)!
                )
            );
        }
        if (
            stylesheet.otherSystemsTrackNameOrientation !==
            AlphaTex1LanguageHandler.defaultScore.stylesheet.otherSystemsTrackNameOrientation
        ) {
            nodes.push(
                ATNF.identifierMetaData(
                    'otherSystemsTrackNameOrientation',
                    AlphaTex1EnumMappings.trackNameOrientationsReversed.get(
                        stylesheet.otherSystemsTrackNameOrientation
                    )!
                )
            );
        }

        // Unsupported:
        // 'globaldisplaychorddiagramsontop',
        // 'pertrackchorddiagramsontop',
        // 'globaldisplaytuning',
        // 'pertrackdisplaytuning',
        // 'pertrackchorddiagramsontop',
        // 'pertrackmultibarrest',

        if (firstStyleSheet < nodes.length) {
            nodes[firstStyleSheet].leadingComments = [
                {
                    multiLine: false,
                    text: 'Score Stylesheet'
                }
            ];
        }
    }

    private static buildScoreInfoMeta(
        nodes: AlphaTexMetaDataNode[],
        tag: string,
        score: Score,
        value: string | undefined,
        element: ScoreSubElement | undefined,
        writeIfEmpty: boolean = false
    ) {
        if (value !== undefined && value.length === 0 && !writeIfEmpty) {
            return;
        }

        const valueList: AlphaTexValueList = {
            nodeType: AlphaTexNodeType.ValueList,
            values: []
        };

        if (value !== undefined) {
            valueList.values.push({ nodeType: AlphaTexNodeType.StringLiteral, text: value });
        }

        if (element !== undefined) {
            const style =
                score.style && score.style.headerAndFooter.has(element)
                    ? score.style.headerAndFooter.get(element)
                    : undefined;
            const defaultStyle = ScoreStyle.defaultHeaderAndFooter.has(element)
                ? ScoreStyle.defaultHeaderAndFooter.get(element)
                : undefined;
            if (style && (!defaultStyle || !HeaderFooterStyle.equals(defaultStyle, style))) {
                valueList.values.push({
                    nodeType: AlphaTexNodeType.StringLiteral,
                    text: style.isVisible === false ? '' : style.template
                });
                valueList.values.push({
                    nodeType: AlphaTexNodeType.Identifier,
                    text: AlphaTex1EnumMappings.textAlignsReversed.get(style.textAlign)!
                });
            }
        }

        // do not write with all defaults
        if (value === undefined && valueList.values.length === 0) {
            return undefined;
        } else if (value !== undefined && value.length === 0 && valueList.values.length === 1) {
            return undefined;
        }

        nodes.push(ATNF.metaData(tag, valueList));
    }

    public buildSyncPointNodes(score: Score): AlphaTexMetaDataNode[] {
        const nodes: AlphaTexMetaDataNode[] = [];

        const flatSyncPoints = score.exportFlatSyncPoints();
        for (const p of flatSyncPoints) {
            nodes.push(
                ATNF.metaData(
                    'sync',
                    ATNF.valueList(false, [
                        { nodeType: AlphaTexNodeType.NumberLiteral, value: p.barIndex },
                        { nodeType: AlphaTexNodeType.NumberLiteral, value: p.barOccurence },
                        { nodeType: AlphaTexNodeType.NumberLiteral, value: p.millisecondOffset },
                        p.barPosition > 0
                            ? { nodeType: AlphaTexNodeType.NumberLiteral, value: p.barPosition }
                            : undefined
                    ])
                )
            );
        }

        return nodes;
    }

    public buildBarMetaDataNodes(
        staff: Staff,
        bar: Bar | undefined,
        voice: number,
        isMultiVoice: boolean
    ): AlphaTexMetaDataNode[] {
        const nodes: AlphaTexMetaDataNode[] = [];

        AlphaTex1LanguageHandler.buildStructuralMetaDataNodes(bar, staff, nodes, isMultiVoice, voice);
        if (!bar) {
            return nodes;
        }

        if (voice === 0) {
            // Master Bar meta on first track
            if (staff.index === 0 && staff.track.index === 0) {
                AlphaTex1LanguageHandler.buildMasterBarMetaDataNodes(nodes, bar.masterBar);
            }
        }

        const firstBarMetaIndex = nodes.length;

        if (voice === 0 && bar.index === 0 && staff.index === 0 && staff.track.index === 0) {
            nodes.push(ATNF.identifierMetaData('accidentals', 'auto'));
        }

        if (bar.index === 0 || bar.clef !== bar.previousBar?.clef) {
            nodes.push(ATNF.identifierMetaData('clef', AlphaTex1EnumMappings.clefsReversed.get(bar.clef)!));
        }

        if ((bar.index === 0 && bar.clefOttava !== Ottavia.Regular) || bar.clefOttava !== bar.previousBar?.clefOttava) {
            nodes.push(ATNF.identifierMetaData('ottava', AlphaTex1EnumMappings.ottavaReversed.get(bar.clefOttava)!));
        }

        if ((bar.index === 0 && bar.simileMark !== SimileMark.None) || bar.simileMark !== bar.previousBar?.simileMark) {
            nodes.push(
                ATNF.identifierMetaData('simile', AlphaTex1EnumMappings.simileMarksReversed.get(bar.simileMark)!)
            );
        }

        if (bar.displayScale !== 1) {
            nodes.push(ATNF.numberMetaData('scale', bar.displayScale));
        }

        if (bar.displayWidth > 0) {
            nodes.push(ATNF.numberMetaData('width', bar.displayWidth));
        }

        // sustainPedals are on beat level
        for (const sp of bar.sustainPedals) {
            let pedalType = '';
            switch (sp.pedalType) {
                case SustainPedalMarkerType.Down:
                    pedalType = 'spd';
                    break;
                case SustainPedalMarkerType.Hold:
                    pedalType = 'sph';
                    break;
                case SustainPedalMarkerType.Up:
                    pedalType = 'spu';
                    break;
            }
            if (pedalType) {
                nodes.push(ATNF.numberMetaData(pedalType, sp.ratioPosition));
            }
        }

        if (bar.barLineLeft !== BarLineStyle.Automatic) {
            nodes.push(
                ATNF.identifierMetaData('barLineLeft', AlphaTex1EnumMappings.barLinesReversed.get(bar.barLineLeft)!)
            );
        }

        if (bar.barLineRight !== BarLineStyle.Automatic) {
            nodes.push(
                ATNF.identifierMetaData('barLineRight', AlphaTex1EnumMappings.barLinesReversed.get(bar.barLineRight)!)
            );
        }

        if (
            bar.index === 0 ||
            bar.keySignature !== bar.previousBar!.keySignature ||
            bar.keySignatureType !== bar.previousBar!.keySignatureType
        ) {
            let ks = '';
            if (bar.keySignatureType === KeySignatureType.Minor) {
                ks = AlphaTex1EnumMappings.keySignaturesMinorReversed.get(bar.keySignature)!;
            } else {
                ks = AlphaTex1EnumMappings.keySignaturesMajorReversed.get(bar.keySignature)!;
            }
            nodes.push(ATNF.identifierMetaData('ks', ks));
        }

        if (firstBarMetaIndex < nodes.length) {
            nodes[firstBarMetaIndex].leadingComments = [
                {
                    multiLine: false,
                    text: `Bar ${bar.index + 1} Metadata`
                }
            ];
        }

        return nodes;
    }
    private static buildStaffMetaDataNodes(nodes: AlphaTexMetaDataNode[], staff: Staff) {
        const firstStaffMetaIndex = nodes.length;

        if (staff.capo !== 0) {
            nodes.push(ATNF.numberMetaData('capo', staff.capo));
        }
        if (staff.isPercussion) {
            nodes.push(ATNF.identifierMetaData('articulation', 'defaults'));
        } else if (staff.isStringed) {
            const tuning = ATNF.metaData(
                'tuning',
                ATNF.valueList(
                    false,
                    staff.stringTuning.tunings.map(t => ({
                        nodeType: AlphaTexNodeType.Identifier,
                        text: Tuning.getTextForTuning(t, true)
                    }))
                )
            );
            nodes.push(tuning);

            if (
                staff.track.score.stylesheet.perTrackDisplayTuning &&
                staff.track.score.stylesheet.perTrackDisplayTuning!.has(staff.track.index)
            ) {
                tuning.values!.values.push({ nodeType: AlphaTexNodeType.Identifier, text: 'hide' });
            }

            if (staff.stringTuning.name.length > 0) {
                tuning.values!.values.push({ nodeType: AlphaTexNodeType.StringLiteral, text: staff.stringTuning.name });
            }
        }

        if (staff.transpositionPitch !== 0) {
            nodes.push(ATNF.numberMetaData('transpose', -staff.transpositionPitch));
        }

        const defaultTransposition = ModelUtils.displayTranspositionPitches.has(staff.track.playbackInfo.program)
            ? ModelUtils.displayTranspositionPitches.get(staff.track.playbackInfo.program)!
            : 0;
        if (staff.displayTranspositionPitch !== defaultTransposition) {
            nodes.push(ATNF.numberMetaData('displaytranspose', -staff.displayTranspositionPitch));
        }

        if (staff.chords != null) {
            for (const [_, chord] of staff.chords!) {
                nodes.push(AlphaTex1LanguageHandler.buildChordNode(chord));
            }
        }

        if (firstStaffMetaIndex < nodes.length) {
            nodes[firstStaffMetaIndex].leadingComments = [
                {
                    multiLine: false,
                    text: `Staff ${staff.index + 1} Metadata`
                }
            ];
        }
    }

    private static buildChordNode(chord: Chord): AlphaTexMetaDataNode {
        const chordNode = ATNF.metaData(
            'chord',
            ATNF.valueList(false, [{ nodeType: AlphaTexNodeType.StringLiteral, text: chord.name }]),
            ATNF.properties([
                chord.firstFret >= 0 ? ['firstfret', ATNF.numberValueList(chord.firstFret)] : undefined,
                ['showdiagram', ATNF.identifierValueList(chord.showDiagram ? 'true' : 'false')],
                ['showfingering', ATNF.identifierValueList(chord.showFingering ? 'true' : 'false')],
                ['showname', ATNF.identifierValueList(chord.showName ? 'true' : 'false')],
                chord.barreFrets.length > 0
                    ? [
                          'barre',
                          ATNF.valueList(
                              false,
                              chord.barreFrets.map(f => ({ nodeType: AlphaTexNodeType.NumberLiteral, value: f }))
                          )
                      ]
                    : undefined
            ])
        );
        chordNode.propertiesBeforeValues = true;

        for (let i = 0; i < chord.staff.tuning.length; i++) {
            if (i < chord.strings.length && chord.strings[i] >= 0) {
                chordNode.values!.values.push({ nodeType: AlphaTexNodeType.NumberLiteral, value: chord.strings[i] });
            } else {
                chordNode.values!.values.push({ nodeType: AlphaTexNodeType.Identifier, text: 'x' });
            }
        }

        return chordNode;
    }

    private static buildMasterBarMetaDataNodes(nodes: AlphaTexMetaDataNode[], masterBar: MasterBar) {
        const firstMetaIndex = nodes.length;

        if (masterBar.alternateEndings !== 0) {
            nodes.push(
                ATNF.metaData(
                    'ae',
                    ATNF.valueList(
                        true,
                        ModelUtils.getAlternateEndingsList(masterBar.alternateEndings).map(i => ({
                            nodeType: AlphaTexNodeType.NumberLiteral,
                            value: i + 1
                        }))
                    )
                )
            );
        }

        if (masterBar.isRepeatStart) {
            nodes.push(ATNF.metaData('ro'));
        }

        if (masterBar.isRepeatEnd) {
            nodes.push(ATNF.numberMetaData('rc', masterBar.repeatCount));
        }

        if (
            masterBar.index === 0 ||
            masterBar.timeSignatureCommon !== masterBar.previousMasterBar?.timeSignatureCommon ||
            masterBar.timeSignatureNumerator !== masterBar.previousMasterBar.timeSignatureNumerator ||
            masterBar.timeSignatureDenominator !== masterBar.previousMasterBar.timeSignatureDenominator
        ) {
            if (masterBar.timeSignatureCommon) {
                nodes.push(ATNF.identifierMetaData('ts', 'common'));
            } else {
                nodes.push(
                    ATNF.metaData(
                        'ts',
                        ATNF.valueList(false, [
                            {
                                nodeType: AlphaTexNodeType.NumberLiteral,
                                value: masterBar.timeSignatureNumerator
                            },
                            {
                                nodeType: AlphaTexNodeType.NumberLiteral,
                                value: masterBar.timeSignatureDenominator
                            }
                        ])
                    )
                );
            }
        }

        if (
            (masterBar.index > 0 && masterBar.tripletFeel !== masterBar.previousMasterBar?.tripletFeel) ||
            (masterBar.index === 0 && masterBar.tripletFeel !== TripletFeel.NoTripletFeel)
        ) {
            nodes.push(
                ATNF.identifierMetaData('tf', AlphaTex1EnumMappings.tripletFeelsReversed.get(masterBar.tripletFeel)!)
            );
        }

        if (masterBar.isFreeTime) {
            nodes.push(ATNF.metaData('ft'));
        }

        if (masterBar.section != null) {
            nodes.push(
                ATNF.metaData(
                    'section',
                    ATNF.valueList(false, [
                        {
                            nodeType: AlphaTexNodeType.StringLiteral,
                            text: masterBar.section.marker
                        },
                        {
                            nodeType: AlphaTexNodeType.StringLiteral,
                            text: masterBar.section.text
                        }
                    ])
                )
            );
        }

        if (masterBar.isAnacrusis) {
            nodes.push(ATNF.metaData('ac'));
        }

        if (masterBar.displayScale !== 1) {
            nodes.push(ATNF.numberMetaData('scale', masterBar.displayScale));
        }

        if (masterBar.displayWidth > 0) {
            nodes.push(ATNF.numberMetaData('width', masterBar.displayWidth));
        }

        if (masterBar.directions) {
            for (const d of masterBar.directions!) {
                nodes.push(ATNF.identifierMetaData('jump', AlphaTex1EnumMappings.directionsReversed.get(d)!));
            }
        }

        for (const a of masterBar.tempoAutomations) {
            const tempo = ATNF.metaData(
                'tempo',
                ATNF.valueList(true, [
                    {
                        nodeType: AlphaTexNodeType.NumberLiteral,
                        value: a.value
                    },
                    a.text
                        ? {
                              nodeType: AlphaTexNodeType.StringLiteral,
                              text: a.text
                          }
                        : undefined,
                    a.ratioPosition > 0
                        ? {
                              nodeType: AlphaTexNodeType.NumberLiteral,
                              value: a.ratioPosition
                          }
                        : undefined
                ])
            );
            if (tempo.values!.values.length === 1) {
                tempo.values!.openParenthesis = undefined;
                tempo.values!.closeParenthesis = undefined;
            }
            nodes.push(tempo);
        }

        if (firstMetaIndex < nodes.length) {
            nodes[firstMetaIndex].leadingComments = [
                {
                    multiLine: false,
                    text: `Masterbar ${masterBar.index + 1} Metadata`
                }
            ];
        }
    }

    private static buildStructuralMetaDataNodes(
        bar: Bar | undefined,
        staff: Staff,
        nodes: AlphaTexMetaDataNode[],
        isMultiVoice: boolean,
        voice: number
    ) {
        if (bar === undefined || bar.index === 0) {
            if (voice === 0) {
                if (staff.index === 0) {
                    nodes.push(AlphaTex1LanguageHandler.buildNewTrackNode(staff.track));
                }
                nodes.push(AlphaTex1LanguageHandler.buildNewStaffNode(staff));
                AlphaTex1LanguageHandler.buildStaffMetaDataNodes(nodes, staff);
            }

            if (isMultiVoice) {
                const voiceNode = ATNF.metaData('voice');
                voiceNode.trailingComments = [
                    {
                        multiLine: true,
                        text: `Voice ${voice + 1}`
                    }
                ];
                nodes.push(voiceNode);
            }
        }
    }

    private static buildNewStaffNode(staff: Staff): AlphaTexMetaDataNode {
        const node = ATNF.metaData(
            'staff',
            undefined,
            ATNF.properties([
                staff.showStandardNotation
                    ? [
                          'score',
                          ATNF.valueList(false, [
                              staff.standardNotationLineCount !== Staff.DefaultStandardNotationLineCount
                                  ? { nodeType: AlphaTexNodeType.NumberLiteral, value: staff.standardNotationLineCount }
                                  : undefined
                          ])
                      ]
                    : undefined,
                staff.showTablature ? ['tabs', undefined] : undefined,
                staff.showSlash ? ['slash', undefined] : undefined,
                staff.showNumbered ? ['numbered', undefined] : undefined
            ])
        );

        if (node.properties && node.properties.properties.length > 0) {
            node.properties.properties[0]!.leadingComments = [
                {
                    multiLine: false,
                    text: 'Staff Properties'
                }
            ];
        }

        return node;
    }

    private static buildNewTrackNode(track: Track): AlphaTexMetaDataNode {
        const node = ATNF.metaData(
            'track',
            ATNF.valueList(false, [
                { nodeType: AlphaTexNodeType.StringLiteral, text: track.name },
                track.shortName.length > 0
                    ? { nodeType: AlphaTexNodeType.StringLiteral, text: track.shortName }
                    : undefined
            ]),
            ATNF.properties([
                track.color.rgba !== AlphaTex1LanguageHandler.defaultTrack.color.rgba
                    ? ['color', ATNF.stringValueList(track.color.rgba)]
                    : undefined,
                track.defaultSystemsLayout !== AlphaTex1LanguageHandler.defaultTrack.defaultSystemsLayout
                    ? ['defaultSystemsLayout', ATNF.numberValueList(track.defaultSystemsLayout)]
                    : undefined,
                track.systemsLayout.length
                    ? [
                          'systemsLayout',
                          ATNF.valueList(
                              false,
                              track.systemsLayout.map(d => ({ nodeType: AlphaTexNodeType.NumberLiteral, value: d }))
                          )
                      ]
                    : undefined,
                ['volume', ATNF.numberValueList(track.playbackInfo.volume)],
                ['balance', ATNF.numberValueList(track.playbackInfo.balance)],
                track.playbackInfo.isMute ? ['mute', undefined] : undefined,
                track.playbackInfo.isSolo ? ['solo', undefined] : undefined,
                track.score.stylesheet.perTrackMultiBarRest &&
                track.score.stylesheet.perTrackMultiBarRest!.has(track.index)
                    ? ['multiBarRest', undefined]
                    : undefined,
                [
                    'instrument',
                    ATNF.identifierValueList(
                        track.isPercussion ? 'percussion' : GeneralMidi.getName(track.playbackInfo.program)
                    )
                ],
                track.playbackInfo.bank > 0 ? ['bank', ATNF.numberValueList(track.playbackInfo.bank)] : undefined
            ])
        );

        if (node.properties && node.properties.properties.length > 0) {
            node.properties.properties[0]!.leadingComments = [
                {
                    multiLine: false,
                    text: 'Track Properties'
                }
            ];
        }

        return node;
    }

    public buildNoteEffects(note: Note): AlphaTexPropertyNode[] {
        const properties: AlphaTexPropertyNode[] = [];

        if (note.hasBend) {
            ATNF.property(
                properties,
                'be',
                ATNF.valueList(false, [
                    {
                        nodeType: AlphaTexNodeType.Identifier,
                        text: AlphaTex1EnumMappings.bendTypesReversed.get(note.bendType)!
                    },
                    note.bendStyle !== BendStyle.Default
                        ? {
                              nodeType: AlphaTexNodeType.Identifier,
                              text: AlphaTex1EnumMappings.bendStylesReversed.get(note.bendStyle)!
                          }
                        : undefined,
                    ATNF.valueList(
                        true,
                        note.bendPoints!.flatMap(p => [
                            { nodeType: AlphaTexNodeType.NumberLiteral, value: p.offset } as AlphaTexNumberLiteral,
                            { nodeType: AlphaTexNodeType.NumberLiteral, value: p.value } as AlphaTexNumberLiteral
                        ])
                    )
                ])
            );
        }

        let harmonicType = '';
        switch (note.harmonicType) {
            case HarmonicType.Natural:
                ATNF.property(properties, 'nh');
                break;
            case HarmonicType.Artificial:
                harmonicType = 'ah';
                break;
            case HarmonicType.Pinch:
                harmonicType = 'ph';
                break;
            case HarmonicType.Tap:
                harmonicType = 'th';
                break;
            case HarmonicType.Semi:
                harmonicType = 'sh';
                break;
            case HarmonicType.Feedback:
                harmonicType = 'fh';
                break;
        }
        if (harmonicType) {
            ATNF.property(properties, harmonicType, ATNF.numberValueList(note.harmonicValue));
        }

        if (note.showStringNumber) {
            ATNF.property(properties, 'string');
        }

        if (note.isTrill) {
            ATNF.property(
                properties,
                'tr',
                ATNF.valueList(false, [
                    { nodeType: AlphaTexNodeType.NumberLiteral, value: note.trillFret },
                    { nodeType: AlphaTexNodeType.NumberLiteral, value: note.trillSpeed as number }
                ])
            );
        }

        switch (note.vibrato) {
            case VibratoType.Slight:
                ATNF.property(properties, 'v');
                break;
            case VibratoType.Wide:
                ATNF.property(properties, 'vw');
                break;
        }

        switch (note.slideInType) {
            case SlideInType.IntoFromBelow:
                ATNF.property(properties, 'sib');
                break;
            case SlideInType.IntoFromAbove:
                ATNF.property(properties, 'sia');
                break;
        }

        switch (note.slideOutType) {
            case SlideOutType.Shift:
                ATNF.property(properties, 'ss');
                break;
            case SlideOutType.Legato:
                ATNF.property(properties, 'sl');
                break;
            case SlideOutType.OutUp:
                ATNF.property(properties, 'sou');
                break;
            case SlideOutType.OutDown:
                ATNF.property(properties, 'sod');
                break;
            case SlideOutType.PickSlideDown:
                ATNF.property(properties, 'psd');
                break;
            case SlideOutType.PickSlideUp:
                ATNF.property(properties, 'psu');
                break;
        }

        if (note.isHammerPullOrigin) {
            ATNF.property(properties, 'h');
        }

        if (note.isLeftHandTapped) {
            ATNF.property(properties, 'lht');
        }

        if (note.isGhost) {
            ATNF.property(properties, 'g');
        }

        switch (note.accentuated) {
            case AccentuationType.Normal:
                ATNF.property(properties, 'ac');
                break;
            case AccentuationType.Heavy:
                ATNF.property(properties, 'hac');
                break;
            case AccentuationType.Tenuto:
                ATNF.property(properties, 'ten');
                break;
        }

        if (note.isPalmMute) {
            ATNF.property(properties, 'pm');
        }

        if (note.isStaccato) {
            ATNF.property(properties, 'st');
        }

        if (note.isLetRing) {
            ATNF.property(properties, 'lr');
        }

        if (note.isDead) {
            ATNF.property(properties, 'x');
        }

        if (note.isTieDestination) {
            ATNF.property(properties, 't');
        }
        if (note.leftHandFinger >= 0) {
            ATNF.property(properties, 'lf', ATNF.numberValueList((note.leftHandFinger as number) + 1));
        }
        if (note.rightHandFinger >= 0) {
            ATNF.property(properties, 'rf', ATNF.numberValueList((note.rightHandFinger as number) + 1));
        }

        if (!note.isVisible) {
            ATNF.property(properties, 'hide');
        }

        if (note.isSlurOrigin) {
            const slurId = `s${note.id}`;
            ATNF.property(properties, 'slur', ATNF.identifierValueList(slurId));
        }

        if (note.isSlurDestination) {
            const slurId = `s${note.slurOrigin!.id}`;
            ATNF.property(properties, 'slur', ATNF.identifierValueList(slurId));
        }

        if (note.accidentalMode !== NoteAccidentalMode.Default) {
            ATNF.property(
                properties,
                'acc',
                ATNF.identifierValueList(ModelUtils.reverseAccidentalModeMapping.get(note.accidentalMode)!)
            );
        }

        switch (note.ornament) {
            case NoteOrnament.InvertedTurn:
                ATNF.property(properties, 'iturn');
                break;
            case NoteOrnament.Turn:
                ATNF.property(properties, 'turn');
                break;
            case NoteOrnament.UpperMordent:
                ATNF.property(properties, 'umordent');
                break;
            case NoteOrnament.LowerMordent:
                ATNF.property(properties, 'lmordent');
                break;
        }

        return properties;
    }

    public buildBeatEffects(beat: Beat): AlphaTexPropertyNode[] {
        const properties: AlphaTexPropertyNode[] = [];

        switch (beat.fade) {
            case FadeType.FadeIn:
                ATNF.property(properties, 'f');
                break;
            case FadeType.FadeOut:
                ATNF.property(properties, 'fo');
                break;
            case FadeType.VolumeSwell:
                ATNF.property(properties, 'vs');
                break;
        }

        if (beat.vibrato === VibratoType.Slight) {
            ATNF.property(properties, 'v');
        } else if (beat.vibrato === VibratoType.Wide) {
            ATNF.property(properties, 'vw');
        }

        if (beat.slap) {
            ATNF.property(properties, 's');
        }

        if (beat.pop) {
            ATNF.property(properties, 'p');
        }

        if (beat.tap) {
            ATNF.property(properties, 'tt');
        }

        if (beat.dots >= 2) {
            ATNF.property(properties, 'dd');
        } else if (beat.dots > 0) {
            ATNF.property(properties, 'd');
        }

        if (beat.pickStroke === PickStroke.Up) {
            ATNF.property(properties, 'su');
        } else if (beat.pickStroke === PickStroke.Down) {
            ATNF.property(properties, 'sd');
        }

        if (beat.hasTuplet) {
            ATNF.property(
                properties,
                'tu',
                ATNF.valueList(false, [
                    { nodeType: AlphaTexNodeType.NumberLiteral, value: beat.tupletNumerator },
                    { nodeType: AlphaTexNodeType.NumberLiteral, value: beat.tupletDenominator }
                ])
            );
        }

        if (beat.hasWhammyBar) {
            ATNF.property(
                properties,
                'tbe',
                ATNF.valueList(false, [
                    {
                        nodeType: AlphaTexNodeType.Identifier,
                        text: AlphaTex1EnumMappings.whammyTypesReversed.get(beat.whammyBarType)!
                    },
                    {
                        nodeType: AlphaTexNodeType.Identifier,
                        text: AlphaTex1EnumMappings.bendStylesReversed.get(beat.whammyStyle)!
                    },
                    ATNF.valueList(
                        true,
                        beat.whammyBarPoints!.flatMap(p => [
                            { nodeType: AlphaTexNodeType.NumberLiteral, value: p.offset } as AlphaTexNumberLiteral,
                            { nodeType: AlphaTexNodeType.NumberLiteral, value: p.value } as AlphaTexNumberLiteral
                        ])
                    )
                ])
            );
        }

        let brushType = '';
        switch (beat.brushType) {
            case BrushType.BrushUp:
                brushType = 'bu';

                break;
            case BrushType.BrushDown:
                brushType = 'bd';
                break;
            case BrushType.ArpeggioUp:
                brushType = 'au';
                break;
            case BrushType.ArpeggioDown:
                brushType = 'ad';
                break;
        }
        if (brushType) {
            ATNF.property(properties, brushType, ATNF.numberValueList(beat.brushDuration));
        }

        if (beat.chord != null) {
            ATNF.property(properties, 'ch', ATNF.stringValueList(beat.chord.name));
        }

        if (beat.ottava !== Ottavia.Regular) {
            ATNF.property(
                properties,
                'ot',
                ATNF.identifierValueList(AlphaTex1EnumMappings.ottavaReversed.get(beat.ottava)!)
            );
        }

        if (beat.hasRasgueado) {
            ATNF.property(
                properties,
                'rasg',
                ATNF.identifierValueList(AlphaTex1EnumMappings.rasgueadoPatternsReversed.get(beat.rasgueado)!)
            );
        }

        if (beat.text != null) {
            ATNF.property(properties, 'txt', ATNF.stringValueList(beat.text));
        }

        if (beat.lyrics != null && beat.lyrics!.length > 0) {
            if (beat.lyrics.length > 1) {
                for (let i = 0; i < beat.lyrics.length; i++) {
                    ATNF.property(
                        properties,
                        'lyrics',
                        ATNF.valueList(false, [
                            {
                                nodeType: AlphaTexNodeType.NumberLiteral,
                                value: i
                            },
                            {
                                nodeType: AlphaTexNodeType.StringLiteral,
                                text: beat.lyrics[i]
                            }
                        ])
                    );
                }
            } else {
                ATNF.property(properties, 'lyrics', ATNF.stringValueList(beat.lyrics[0]));
            }
        }

        if (beat.graceType !== GraceType.None) {
            ATNF.property(
                properties,
                'gr',
                beat.graceType === GraceType.BeforeBeat
                    ? undefined
                    : ATNF.identifierValueList(AlphaTex1EnumMappings.graceTypesReversed.get(beat.graceType)!)
            );
        }

        if (beat.isTremolo) {
            ATNF.property(properties, 'tp', ATNF.numberValueList(beat.tremoloSpeed as number));
        }

        switch (beat.crescendo) {
            case CrescendoType.Crescendo:
                ATNF.property(properties, 'cre');
                break;
            case CrescendoType.Decrescendo:
                ATNF.property(properties, 'dec');
                break;
        }

        if ((beat.voice.bar.index === 0 && beat.index === 0) || beat.dynamics !== beat.previousBeat?.dynamics) {
            ATNF.property(
                properties,
                'dy',
                ATNF.identifierValueList(AlphaTex1EnumMappings.dynamicsReversed.get(beat.dynamics)!)
            );
        }

        const fermata = beat.fermata;
        if (fermata != null) {
            ATNF.property(
                properties,
                'fermata',
                ATNF.valueList(false, [
                    {
                        nodeType: AlphaTexNodeType.Identifier,
                        text: AlphaTex1EnumMappings.fermataTypesReversed.get(beat.fermata!.type)!
                    },
                    {
                        nodeType: AlphaTexNodeType.NumberLiteral,
                        value: beat.fermata!.length
                    }
                ])
            );
        }

        if (beat.isLegatoOrigin) {
            ATNF.property(properties, 'legatoorigin');
        }

        for (const automation of beat.automations) {
            switch (automation.type) {
                case AutomationType.Tempo:
                    ATNF.property(
                        properties,
                        'tempo',
                        ATNF.valueList(false, [
                            { nodeType: AlphaTexNodeType.NumberLiteral, value: automation.value },
                            automation.text.length === 0
                                ? undefined
                                : {
                                      nodeType: AlphaTexNodeType.StringLiteral,
                                      text: automation.text
                                  }
                        ])
                    );
                    break;
                case AutomationType.Volume:
                    ATNF.property(properties, 'volume', ATNF.numberValueList(automation.value));
                    break;
                case AutomationType.Instrument:
                    if (!beat.voice.bar.staff.isPercussion) {
                        ATNF.property(
                            properties,
                            'instrument',
                            ATNF.identifierValueList(GeneralMidi.getName(automation.value))
                        );
                    }
                    break;
                case AutomationType.Balance:
                    ATNF.property(properties, 'balance', ATNF.numberValueList(automation.value));
                    break;
            }
        }

        switch (beat.wahPedal) {
            case WahPedal.Open:
                ATNF.property(properties, 'waho');
                break;
            case WahPedal.Closed:
                ATNF.property(properties, 'wahc');
                break;
        }

        if (beat.isBarre) {
            ATNF.property(
                properties,
                'barre',
                ATNF.valueList(false, [
                    { nodeType: AlphaTexNodeType.NumberLiteral, value: beat.barreFret },
                    {
                        nodeType: AlphaTexNodeType.Identifier,
                        text: AlphaTex1EnumMappings.barreShapesReversed.get(beat.barreShape)!
                    }
                ])
            );
        }

        if (beat.slashed) {
            ATNF.property(properties, 'slashed');
        }

        if (beat.deadSlapped) {
            ATNF.property(properties, 'ds');
        }

        switch (beat.golpe) {
            case GolpeType.Thumb:
                ATNF.property(properties, 'glpt');
                break;
            case GolpeType.Finger:
                ATNF.property(properties, 'glpf');
                break;
        }

        if (beat.invertBeamDirection) {
            ATNF.property(properties, 'beam', ATNF.identifierValueList('invert'));
        } else if (beat.preferredBeamDirection !== null) {
            ATNF.property(properties, 'beam', ATNF.identifierValueList(BeamDirection[beat.preferredBeamDirection!]));
        }

        let beamingModeValue = '';
        switch (beat.beamingMode) {
            case BeatBeamingMode.ForceSplitToNext:
                beamingModeValue = 'split';
                break;
            case BeatBeamingMode.ForceMergeWithNext:
                beamingModeValue = 'merge';
                break;
            case BeatBeamingMode.ForceSplitOnSecondaryToNext:
                beamingModeValue = 'splitsecondary';
                break;
        }

        if (beamingModeValue) {
            ATNF.property(properties, 'beam', ATNF.identifierValueList(beamingModeValue));
        }

        if (beat.showTimer) {
            ATNF.property(properties, 'timer');
        }

        return properties;
    }
}
