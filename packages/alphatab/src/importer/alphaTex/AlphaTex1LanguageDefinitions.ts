import { AlphaTex1EnumMappings } from '@src/importer/alphaTex/AlphaTex1EnumMappings';
import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';

/**
 * Defines how the value of the meta data tag is parsed.
 * @internal
 */
export enum ValueListParseTypesMode {
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

/**
 * @record
 * @internal
 */
export interface ValueListParseTypesExtended {
    expectedTypes: Set<AlphaTexNodeType>;
    parseMode: ValueListParseTypesMode;
    allowedValues?: Set<string>;
    reservedIdentifiers?: Set<string>;
}

/**
 * @internal
 */
export class AlphaTex1LanguageDefinitions {
    private static _valueType(
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
    private static _basicList(
        basic: [AlphaTexNodeType[] /* accepted types */, ValueListParseTypesMode][]
    ): ValueListParseTypesExtended[] {
        return basic.map(b => AlphaTex1LanguageDefinitions._valueType(b[0], b[1]));
    }

    private static readonly _scoreInfoValueListTypes = AlphaTex1LanguageDefinitions._basicList([
        [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.Required],
        [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.Optional],
        [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.Optional]
    ]);
    private static readonly _scoreInfoTemplateValueListTypes = AlphaTex1LanguageDefinitions._basicList([
        [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.Required],
        [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.Optional]
    ]);
    private static readonly _numberOnlyValueListTypes = AlphaTex1LanguageDefinitions._basicList([
        [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required]
    ]);
    private static readonly _textLikeValueListTypes = AlphaTex1LanguageDefinitions._basicList([
        [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.Required]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in `\chord {}` properties.
     */
    public static readonly chordPropertyValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
        // firstfret 3
        ['firstfret', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // showdiagram, showdiagram true, showdiagram false, showdiagram 0, showdiagram 1
        [
            'showdiagram',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.Optional
                ]
            ])
        ],

        // showfingering, showfingering true, showfingering false, showfingering 0, showfingering 1
        [
            'showfingering',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.Optional
                ]
            ])
        ],

        // showname, showname true, showname false, showname 0, showname 1
        [
            'showname',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.Optional
                ]
            ])
        ],

        // barre 1 2 3
        [
            'barre',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.ValueListWithoutParenthesis]
            ])
        ]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in `\staff {}` properties.
     */
    public static readonly staffPropertyValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
        // score, score 1
        [
            'score',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],
        ['tabs', undefined],
        ['slash', undefined],
        ['numbered', undefined]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in `\track {}` properties.
     */
    public static readonly trackPropertyValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
        // color red, color "#FF0000"
        ['color', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // defaultsystemslayout 3
        ['defaultsystemslayout', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // volume 16
        ['volume', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // balance 16
        ['balance', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // bank 16
        ['bank', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // systemslayout 1 2 3 4 5
        [
            'systemslayout',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.ValueListWithoutParenthesis]
            ])
        ],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number],
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
    public static readonly beatPropertyValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
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
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]
            ])
        ],

        // txt "Text", txt Intro
        ['txt', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // lyrics "Lyrics", lyrics 2 "Lyrics Line 2"
        [
            'lyrics',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.String], ValueListParseTypesMode.Required]
            ])
        ],

        // tu 3, tu 3 2
        [
            'tu',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]
            ])
        ],

        // tb dip fast (0 -1 0), tb dip (0 -1 0), tb (0 -1 0)
        [
            'tb',
            [
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.Number],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        // tbe dip fast (0 0 -1 30 0 60), tbe dip (0 0 -1 30 0 60), tbe (0 0 -1 30 0 60)
        [
            'tbe',
            [
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.Number],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        // bu, bu 16
        [
            'bu',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],

        // bd, bd 16
        [
            'bd',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],

        // au, au 16
        [
            'au',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],

        // ad, ad 16
        [
            'ad',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],

        // ch C, ch "C"
        ['ch', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // gr, gr ob, gr b
        [
            'gr',
            [
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.graceTypes.keys())
                )
            ]
        ],

        // dy F, dy "F"
        ['dy', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // tempo 120, tempo 120 "Label", tempo 120 "Label" hide
        [
            'tempo',
            [
                AlphaTex1LanguageDefinitions._valueType([AlphaTexNodeType.Number], ValueListParseTypesMode.Required),
                AlphaTex1LanguageDefinitions._valueType([AlphaTexNodeType.String], ValueListParseTypesMode.Optional),
                AlphaTex1LanguageDefinitions._valueType([AlphaTexNodeType.Ident], ValueListParseTypesMode.Optional, [
                    'hide'
                ])
            ]
        ],

        // volume 10
        ['volume', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // balance 0
        ['balance', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // tp 16
        ['tp', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // barre 7, barre 7 full, barre 7 "half"
        [
            'barre',
            [
                AlphaTex1LanguageDefinitions._valueType([AlphaTexNodeType.Number], ValueListParseTypesMode.Required),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.barreShapes.keys())
                )
            ]
        ],

        // rasg ii, rasg "mi"
        ['rasg', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // ot 15ma, ot "regular"
        ['ot', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.Required
                ]
            ])
        ],

        // bank 127
        ['bank', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // fermata short, fermata short 0.5
        [
            'fermata',
            [
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.fermataTypes.keys())
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.Number],
                    ValueListParseTypesMode.OptionalAsFloat
                )
            ]
        ],

        // beam invert
        ['beam', AlphaTex1LanguageDefinitions._textLikeValueListTypes]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in beat duration properties.
     */
    public static readonly beatDurationPropertyValueListTypes = new Map<
        string,
        ValueListParseTypesExtended[] | undefined
    >([
        // tu 3, tu 3 2
        [
            'tu',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]
            ])
        ]
    ]);

    /**
     * Contains the definitions how to read the values for given properties using {@link readTypedValueList}
     * in note level properties (note effects).
     */
    public static readonly notePropertyValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
        [
            'nh',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],
        [
            'ah',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],
        [
            'th',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],
        [
            'ph',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],
        [
            'sh',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],
        [
            'fh',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
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
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.Number],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        //  be bendRelease fast (0 0 4 30 0 60), be bendRelease (0 0 4 30 0 60), be (0 0 4 30 0 60)
        [
            'be',
            [
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.bendTypes.keys())
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional,
                    Array.from(AlphaTex1EnumMappings.bendStyles.keys())
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.Number],
                    ValueListParseTypesMode.RequiredAsValueList
                )
            ]
        ],

        // tr 14, tr 14 32
        [
            'tr',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]
            ])
        ],

        // lf, lf 1
        [
            'lf',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],

        // rf, rf 1
        [
            'rf',
            AlphaTex1LanguageDefinitions._basicList([[[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]])
        ],

        // acc "#"
        ['acc', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // slur S1, slur "1"
        ['slur', AlphaTex1LanguageDefinitions._textLikeValueListTypes]
    ]);

    public static readonly structuralMetaDataValueListTypes = new Map<
        string,
        ValueListParseTypesExtended[] | undefined
    >([
        // track, track Name, track ShortName Name, track "Name", track "ShortName" "Name"
        [
            'track',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.String], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.String], ValueListParseTypesMode.Optional]
            ])
        ],
        ['staff', undefined],
        ['voice', undefined]
    ]);

    public static readonly staffMetaDataValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
        // tuning E4 B3 G3 D3 A2 E2, \tuning "E4" "B3" "G3" "D3"
        [
            'tuning',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Ident, AlphaTexNodeType.String], ValueListParseTypesMode.ValueListWithoutParenthesis]
            ])
        ],

        // chord "C" 0 1 0 2 3 x
        [
            'chord',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Ident, AlphaTexNodeType.String], ValueListParseTypesMode.Required],
                [
                    [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.ValueListWithoutParenthesis
                ]
            ])
        ],
        // capo 3
        ['capo', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // instrument 27, instrument percussion, instrument "acoustic guitar nylon"
        [
            'instrument',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.Required
                ]
            ])
        ],
        // bank 127
        ['bank', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // lyrics "Text", lyrics 1 "Text"
        [
            'lyrics',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional],
                [[AlphaTexNodeType.String], ValueListParseTypesMode.Required]
            ])
        ],

        // articulation defaults, articulation "Name" 27
        [
            'articulation',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Optional]
            ])
        ],

        // displaytranspose -12
        ['displaytranspose', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // transpose -12
        ['transpose', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes]
    ]);

    public static readonly scoreMetaDataValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
        ['title', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['subtitle', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['artist', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['album', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['words', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['music', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['wordsandmusic', AlphaTex1LanguageDefinitions._scoreInfoTemplateValueListTypes],
        ['copyright', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['copyright2', AlphaTex1LanguageDefinitions._scoreInfoTemplateValueListTypes],
        ['instructions', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['notices', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['tab', AlphaTex1LanguageDefinitions._scoreInfoValueListTypes],
        ['defaultsystemslayout', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],
        // systemslayout 1 2 3 4 5
        [
            'systemslayout',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.ValueListWithoutParenthesis]
            ])
        ],
        ['hidedynamics', undefined],
        ['showdynamics', undefined],
        ['usesystemsignseparator', undefined],
        ['multibarrest', undefined],
        ['bracketextendmode', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        ['singletracktracknamepolicy', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        ['multitracktracknamepolicy', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        ['firstsystemtracknamemode', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        ['othersystemstracknamemode', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        ['firstsystemtracknameorientation', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        ['othersystemstracknameorientation', AlphaTex1LanguageDefinitions._textLikeValueListTypes]
    ]);

    /**
     * Contains the definitions how to read the metadata values for given metadata tags using
     * {@link readTypedValueList}
     * @private
     */
    public static readonly barMetaDataValueListTypes = new Map<string, ValueListParseTypesExtended[] | undefined>([
        // tempo 120, tempo 120 "Moderate", tempo 120 "Moderate" 0.5, tempo 120 hide 0.5, tempo 120 hide
        [
            'tempo',
            [
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.Number],
                    ValueListParseTypesMode.RequiredAsFloat
                ),
                AlphaTex1LanguageDefinitions._valueType([AlphaTexNodeType.String], ValueListParseTypesMode.Optional),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.Number],
                    ValueListParseTypesMode.OptionalAsFloatInValueList
                ),
                AlphaTex1LanguageDefinitions._valueType([AlphaTexNodeType.Ident], ValueListParseTypesMode.Optional, [
                    'hide'
                ])
            ]
        ],

        // rc 2
        ['rc', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // ae (1 2 3), ae 2
        [
            'ae',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.RequiredAsValueList]
            ])
        ],

        // ts common, ts "common", ts 3 4
        [
            'ts',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.String, AlphaTexNodeType.Ident], ValueListParseTypesMode.OptionalAndStop],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required]
            ])
        ],

        // ks fmajor or ks "fmajor"
        ['ks', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // clef G2, clef "g2", clef 43,
        [
            'clef',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.Required
                ]
            ])
        ],

        // section "Text", section "Marker" "Text", section Intro, section I Intro
        [
            'section',
            [
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Required
                ),
                AlphaTex1LanguageDefinitions._valueType(
                    [AlphaTexNodeType.String, AlphaTexNodeType.Ident],
                    ValueListParseTypesMode.Optional,
                    undefined,
                    ['x', '-', 'r']
                )
            ]
        ],

        // tf triplet16th, tf "Triplet16th", tf 1
        [
            'tf',
            AlphaTex1LanguageDefinitions._basicList([
                [
                    [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number],
                    ValueListParseTypesMode.Required
                ]
            ])
        ],

        // barlineleft dotted, barlineleft "dotted"
        ['barlineleft', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        // barlineright dotted, barlineright "dotted"
        ['barlineright', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        // accidentals auto, accidentals "explicit"
        ['accidentals', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        // jump fine, jump "segno"
        ['jump', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        // ottava 15ma, ottava "regular"
        ['ottava', AlphaTex1LanguageDefinitions._textLikeValueListTypes],
        // simile none, simile "firstOfDouble"
        ['simile', AlphaTex1LanguageDefinitions._textLikeValueListTypes],

        // width 300
        ['width', AlphaTex1LanguageDefinitions._numberOnlyValueListTypes],

        // scale 0.5
        [
            'scale',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],

        [
            'spd',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],
        [
            'spu',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],
        [
            'sph',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.RequiredAsFloat]
            ])
        ],

        ['ft', undefined],
        ['ro', undefined],
        ['ac', undefined],
        ['db', undefined],

        // \sync BarIndex Occurence MillisecondOffset
        // \sync BarIndex Occurence MillisecondOffset RatioPosition
        [
            'sync',
            AlphaTex1LanguageDefinitions._basicList([
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.Required],
                [[AlphaTexNodeType.Number], ValueListParseTypesMode.OptionalAsFloat]
            ])
        ]
    ]);

    public static readonly metaDataValueListTypes = [
        AlphaTex1LanguageDefinitions.scoreMetaDataValueListTypes,
        AlphaTex1LanguageDefinitions.staffMetaDataValueListTypes,
        AlphaTex1LanguageDefinitions.structuralMetaDataValueListTypes,
        AlphaTex1LanguageDefinitions.barMetaDataValueListTypes
    ];
}
