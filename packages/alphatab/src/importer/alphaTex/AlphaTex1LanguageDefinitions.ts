import type { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
/**
 * @target web
 */
type SimpleAlphaTexParameterDefinition =
    | [AlphaTexNodeType[], ArgumentListParseTypesMode]
    | [AlphaTexNodeType[], ArgumentListParseTypesMode, string[]]
    | [AlphaTexNodeType[], ArgumentListParseTypesMode, string[] | null, string[]]
    | null;
/**
 * @record
 * @internal
 */
export interface AlphaTexParameterDefinition {
    expectedTypes: Set<AlphaTexNodeType>;
    parseMode: ArgumentListParseTypesMode;
    allowedValues?: Set<string>;
    reservedIdentifiers?: Set<string>;
}
/**
 * @record
 * @internal
 */
export interface AlphaTexSignatureDefinition {
    isStrict: boolean;
    parameters: AlphaTexParameterDefinition[];
}
/**
 * @internal
 */
export class AlphaTex1LanguageDefinitions {
    private static _param(simple: SimpleAlphaTexParameterDefinition): AlphaTexParameterDefinition | null {
        if (!simple) {
            return null;
        }
        return {
            expectedTypes: new Set<AlphaTexNodeType>(simple[0]),
            parseMode: simple[1],
            allowedValues:
                simple.length > 2 && simple[2] && simple[2]!.length > 0 ? new Set<string>(simple[2]!) : undefined,
            reservedIdentifiers:
                simple.length > 3 && simple[3] && simple[3]!.length > 0 ? new Set<string>(simple[3]!) : undefined
        };
    }
    private static _simple(
        signature: (SimpleAlphaTexParameterDefinition | null)[][] | null
    ): AlphaTexSignatureDefinition[] | null {
        if (signature == null) {
            return null;
        }
        return signature.map(
            s =>
                ({
                    isStrict: s.length > 0 && s[0] === null,
                    parameters: s.map(AlphaTex1LanguageDefinitions._param).filter(p => p !== null)
                }) as AlphaTexSignatureDefinition
        );
    }
    private static _metaProps(props: [string, [string, SimpleAlphaTexParameterDefinition[][] | null][] | null][]) {
        return new Map(
            props.map(p => [
                p[0],
                p[1] === null ? null : new Map(p[1]!.map(p => [p[0], AlphaTex1LanguageDefinitions._simple(p[1])]))
            ])
        );
    }
    private static _props(props: [string, SimpleAlphaTexParameterDefinition[][] | null][]) {
        return new Map(props.map(p => [p[0], AlphaTex1LanguageDefinitions._simple(p[1])]));
    }
    private static _signatures(signatures: [string, SimpleAlphaTexParameterDefinition[][] | null][]) {
        return new Map(signatures.map(s => [s[0], AlphaTex1LanguageDefinitions._simple(s[1])]));
    }
    // The following definitions age auto-generated from the central definitions in
    // the `packages/alphatex`. Do not make manual changes here,
    // to reduce code size, the parameter types are specified as number values and then
    // translated inside AlphaTex1LanguageDefinitions._signatures during runtime
    public static readonly scoreMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        [
            'title',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'subtitle',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'artist',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'album',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'words',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'music',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'wordsandmusic',
            [
                [
                    [[17], 0],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'copyright',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'copyright2',
            [
                [
                    [[17], 0],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        ['instructions', [[[[17, 10], 0]]]],
        ['notices', [[[[17, 10], 0]]]],
        [
            'tab',
            [
                [
                    [[17, 10], 0],
                    [[17], 1],
                    [[10, 17], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        ['systemslayout', [[[[16], 5]]]],
        ['defaultsystemslayout', [[[[16], 0]]]],
        ['showdynamics', null],
        ['hidedynamics', null],
        ['usesystemsignseparator', null],
        ['multibarrest', null],
        ['bracketextendmode', [[[[10, 17], 0, ['nobrackets', 'groupstaves', 'groupsimilarinstruments']]]]],
        ['singletracktracknamepolicy', [[[[10, 17], 0, ['hidden', 'firstsystem', 'allsystems']]]]],
        ['multitracktracknamepolicy', [[[[10, 17], 0, ['hidden', 'firstsystem', 'allsystems']]]]],
        ['firstsystemtracknamemode', [[[[10, 17], 0, ['fullname', 'shortname']]]]],
        ['othersystemstracknamemode', [[[[10, 17], 0, ['fullname', 'shortname']]]]],
        ['firstsystemtracknameorientation', [[[[10, 17], 0, ['horizontal', 'vertical']]]]],
        ['othersystemstracknameorientation', [[[[10, 17], 0, ['horizontal', 'vertical']]]]],
        ['extendbarlines', null],
        ['chorddiagramsinscore', [[[[10], 1, ['true', 'false']]]]],
        ['hideemptystaves', null],
        ['hideemptystavesinfirstsystem', null],
        ['showsinglestaffbrackets', null],
        ['defaultbarnumberdisplay', [[[[10, 17], 0, ['allbars', 'firstofsystem', 'hide']]]]]
    ]);
    public static readonly staffMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        ['tuning', [[[[10, 17], 0, ['piano', 'none', 'voice']]], [[[10, 17], 5]]]],
        [
            'chord',
            [
                [
                    [[17, 10], 0],
                    [[10, 17, 16], 5]
                ]
            ]
        ],
        ['capo', [[[[16], 0]]]],
        [
            'lyrics',
            [
                [[[17], 0]],
                [
                    [[16], 0],
                    [[17], 0]
                ]
            ]
        ],
        [
            'articulation',
            [
                [[[10], 0, ['defaults']]],
                [
                    [[17, 10], 0],
                    [[16], 0]
                ]
            ]
        ],
        ['displaytranspose', [[[[16], 0]]]],
        ['transpose', [[[[16], 0]]]],
        ['instrument', [[[[16], 0]], [[[17, 10], 0]], [[[10], 0, ['percussion']]]]]
    ]);
    public static readonly structuralMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        [
            'track',
            [
                [
                    [[17], 1],
                    [[17], 1]
                ]
            ]
        ],
        ['staff', null],
        ['voice', null]
    ]);
    public static readonly barMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        [
            'ts',
            [
                [[[10, 17], 0, ['common']]],
                [
                    [[16], 0],
                    [[16], 0]
                ]
            ]
        ],
        ['ro', null],
        ['rc', [[[[16], 0]]]],
        ['ae', [[[[16, 13], 4]]]],
        [
            'ks',
            [
                [
                    [
                        [10, 17],
                        0,
                        [
                            'cb',
                            'gb',
                            'db',
                            'ab',
                            'eb',
                            'bb',
                            'f',
                            'c',
                            'g',
                            'd',
                            'a',
                            'e',
                            'b',
                            'f#',
                            'c#',
                            'cbmajor',
                            'abminor',
                            'gbmajor',
                            'ebminor',
                            'dbmajor',
                            'bbminor',
                            'abmajor',
                            'fminor',
                            'ebmajor',
                            'cminor',
                            'bbmajor',
                            'gminor',
                            'fmajor',
                            'dminor',
                            'cmajor',
                            'aminor',
                            'gmajor',
                            'eminor',
                            'dmajor',
                            'bminor',
                            'amajor',
                            'f#minor',
                            'emajor',
                            'c#minor',
                            'bmajor',
                            'g#minor',
                            'f#major',
                            'd#minor',
                            'f#',
                            'c#major',
                            'a#minor',
                            'c#'
                        ]
                    ]
                ]
            ]
        ],
        ['clef', [[[[10, 16, 17], 0, ['neutral', 'c3', 'c4', 'f4', 'g2', 'n', 'alto', 'tenor', 'bass', 'treble']]]]],
        ['ottava', [[[[10, 17], 0, ['15ma', '8va', 'regular', '8vb', '15mb', '15ma', '8va', '8vb', '15mb']]]]],
        [
            'tempo',
            [
                [
                    [[16], 2],
                    [[17], 1]
                ],
                [null, [[16], 2], [[17], 0], [[16], 1], [[10], 1, ['hide']]]
            ]
        ],
        [
            'tf',
            [
                [
                    [
                        [10, 16, 17],
                        0,
                        [
                            'none',
                            'triplet16th',
                            'triplet8th',
                            'dotted16th',
                            'dotted8th',
                            'scottish16th',
                            'scottish8th',
                            'none',
                            'no',
                            'notripletfeel',
                            't16',
                            'triplet-16th',
                            't8',
                            'triplet-8th',
                            'd16',
                            'dotted-16th',
                            'd8',
                            'dotted-8th',
                            's16',
                            'scottish-16th',
                            's8',
                            'scottish-8th'
                        ]
                    ]
                ]
            ]
        ],
        ['ac', null],
        [
            'section',
            [
                [[[17, 10], 0]],
                [
                    [[17, 10], 0],
                    [[17, 10], 0, null, ['x', '-', 'r']]
                ]
            ]
        ],
        [
            'jump',
            [
                [
                    [
                        [10, 17],
                        0,
                        [
                            'fine',
                            'segno',
                            'segnosegno',
                            'coda',
                            'doublecoda',
                            'dacapo',
                            'dacapoalcoda',
                            'dacapoaldoublecoda',
                            'dacapoalfine',
                            'dalsegno',
                            'dalsegnoalcoda',
                            'dalsegnoaldoublecoda',
                            'dalsegnoalfine',
                            'dalsegnosegno',
                            'dalsegnosegnoalcoda',
                            'dalsegnosegnoaldoublecoda',
                            'dalsegnosegnoalfine',
                            'dacoda',
                            'dadoublecoda'
                        ]
                    ]
                ]
            ]
        ],
        ['ft', null],
        ['simile', [[[[10, 17], 0, ['none', 'simple', 'firstofdouble', 'secondofdouble']]]]],
        [
            'barlineleft',
            [
                [
                    [
                        [10, 17],
                        0,
                        [
                            'automatic',
                            'dashed',
                            'dotted',
                            'heavy',
                            'heavyheavy',
                            'heavylight',
                            'lightheavy',
                            'lightlight',
                            'none',
                            'regular',
                            'short',
                            'tick'
                        ]
                    ]
                ]
            ]
        ],
        [
            'barlineright',
            [
                [
                    [
                        [10, 17],
                        0,
                        [
                            'automatic',
                            'dashed',
                            'dotted',
                            'heavy',
                            'heavyheavy',
                            'heavylight',
                            'lightheavy',
                            'lightlight',
                            'none',
                            'regular',
                            'short',
                            'tick'
                        ]
                    ]
                ]
            ]
        ],
        ['scale', [[[[16], 2]]]],
        ['width', [[[[16], 2]]]],
        [
            'sync',
            [
                [
                    [[16], 0],
                    [[16], 0],
                    [[16], 0],
                    [[16], 3]
                ]
            ]
        ],
        ['accidentals', [[[[10, 17], 0, ['auto', 'explicit']]]]],
        ['spd', [[[[16], 2]]]],
        ['sph', [[[[16], 2]]]],
        ['spu', [[[[16], 2]]]],
        ['db', null],
        ['voicemode', [[[[10, 17], 0, ['staffwise', 'barwise']]]]],
        ['barnumberdisplay', [[[[10, 17], 0, ['allbars', 'firstofsystem', 'hide']]]]],
        [
            'beaming',
            [
                [
                    [[16], 0],
                    [[16], 5]
                ]
            ]
        ]
    ]);
    public static readonly metaDataProperties = AlphaTex1LanguageDefinitions._metaProps([
        [
            'track',
            [
                ['color', [[[[17], 0]]]],
                ['systemslayout', [[[[16], 5]]]],
                ['defaultsystemslayout', [[[[16], 0]]]],
                ['solo', null],
                ['mute', null],
                ['volume', [[[[16], 0]]]],
                ['balance', [[[[16], 0]]]],
                ['instrument', [[[[16], 0]], [[[17, 10], 0]], [[[10], 0, ['percussion']]]]],
                ['bank', [[[[16], 0]]]],
                ['multibarrest', null]
            ]
        ],
        [
            'staff',
            [
                ['score', [[[[16], 1]]]],
                ['tabs', null],
                ['slash', null],
                ['numbered', null]
            ]
        ],
        ['voice', null],
        ['title', null],
        ['subtitle', null],
        ['artist', null],
        ['album', null],
        ['words', null],
        ['music', null],
        ['wordsandmusic', null],
        ['copyright', null],
        ['copyright2', null],
        ['instructions', null],
        ['notices', null],
        ['tab', null],
        ['systemslayout', null],
        ['defaultsystemslayout', null],
        ['showdynamics', null],
        ['hidedynamics', null],
        ['usesystemsignseparator', null],
        ['multibarrest', null],
        ['bracketextendmode', null],
        ['singletracktracknamepolicy', null],
        ['multitracktracknamepolicy', null],
        ['firstsystemtracknamemode', null],
        ['othersystemstracknamemode', null],
        ['firstsystemtracknameorientation', null],
        ['othersystemstracknameorientation', null],
        ['extendbarlines', null],
        ['chorddiagramsinscore', null],
        ['hideemptystaves', null],
        ['hideemptystavesinfirstsystem', null],
        ['showsinglestaffbrackets', null],
        ['defaultbarnumberdisplay', null],
        [
            'tuning',
            [
                ['hide', null],
                ['label', [[[[17], 0]]]]
            ]
        ],
        [
            'chord',
            [
                ['firstfret', [[[[16], 0]]]],
                ['barre', [[[[16], 5]]]],
                [
                    'showdiagram',
                    [[], [[[17], 0, ['true', 'false']]], [[[10], 0, ['true', 'false']]], [[[16], 0, ['1', '0']]]]
                ],
                [
                    'showfingering',
                    [[], [[[17], 0, ['true', 'false']]], [[[10], 0, ['true', 'false']]], [[[16], 0, ['1', '0']]]]
                ],
                [
                    'showname',
                    [[], [[[17], 0, ['true', 'false']]], [[[10], 0, ['true', 'false']]], [[[16], 0, ['1', '0']]]]
                ]
            ]
        ],
        ['capo', null],
        ['lyrics', null],
        ['articulation', null],
        ['displaytranspose', null],
        ['transpose', null],
        ['instrument', null],
        ['ts', null],
        ['ro', null],
        ['rc', null],
        ['ae', null],
        ['ks', null],
        ['clef', null],
        ['ottava', null],
        ['tempo', null],
        ['tf', null],
        ['ac', null],
        ['section', null],
        ['jump', null],
        ['ft', null],
        ['simile', null],
        ['barlineleft', null],
        ['barlineright', null],
        ['scale', null],
        ['width', null],
        ['sync', null],
        ['accidentals', null],
        ['spd', null],
        ['sph', null],
        ['spu', null],
        ['db', null],
        ['voicemode', null],
        ['barnumberdisplay', null],
        ['beaming', null]
    ]);
    public static readonly metaDataSignatures = [
        AlphaTex1LanguageDefinitions.scoreMetaDataSignatures,
        AlphaTex1LanguageDefinitions.staffMetaDataSignatures,
        AlphaTex1LanguageDefinitions.structuralMetaDataSignatures,
        AlphaTex1LanguageDefinitions.barMetaDataSignatures
    ];
    public static readonly durationChangeProperties = AlphaTex1LanguageDefinitions._props([
        [
            'tu',
            [
                [[[16], 0, ['3', '5', '6', '7', '9', '10', '12']]],
                [
                    [[16], 0],
                    [[16], 0]
                ]
            ]
        ]
    ]);
    public static readonly beatProperties = AlphaTex1LanguageDefinitions._props([
        ['f', null],
        ['fo', null],
        ['vs', null],
        ['v', null],
        ['vw', null],
        ['s', null],
        ['p', null],
        ['tt', null],
        ['d', null],
        ['dd', null],
        ['su', null],
        ['sd', null],
        ['cre', null],
        ['dec', null],
        ['spd', null],
        ['sph', null],
        ['spu', null],
        ['spe', null],
        ['slashed', null],
        ['ds', null],
        ['glpf', null],
        ['glpt', null],
        ['waho', null],
        ['wahc', null],
        ['legatoorigin', null],
        ['timer', null],
        [
            'tu',
            [
                [[[16], 0, ['3', '5', '6', '7', '9', '10', '12']]],
                [
                    [[16], 0],
                    [[16], 0]
                ]
            ]
        ],
        ['txt', [[[[17, 10], 0]]]],
        [
            'lyrics',
            [
                [[[17], 0]],
                [
                    [[16], 0],
                    [[17], 0]
                ]
            ]
        ],
        [
            'tb',
            [
                [[[16], 5]],
                [
                    [[10, 17], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[16], 5]
                ],
                [
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ],
                [
                    [[10, 17], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ]
            ]
        ],
        [
            'tbe',
            [
                [[[16], 5]],
                [
                    [[10, 17], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[16], 5]
                ],
                [
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ],
                [
                    [[10, 17], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ]
            ]
        ],
        ['bu', [[[[16], 1]]]],
        ['bd', [[[[16], 1]]]],
        ['au', [[[[16], 1]]]],
        ['ad', [[[[16], 1]]]],
        ['ch', [[[[17, 10], 0]]]],
        ['gr', [[[[10, 17], 1, ['onbeat', 'beforebeat', 'bendgrace', 'ob', 'bb', 'b']]]]],
        [
            'dy',
            [
                [
                    [
                        [10, 17],
                        0,
                        [
                            'ppp',
                            'pp',
                            'p',
                            'mp',
                            'mf',
                            'f',
                            'ff',
                            'fff',
                            'pppp',
                            'ppppp',
                            'pppppp',
                            'ffff',
                            'fffff',
                            'ffffff',
                            'sf',
                            'sfp',
                            'sfpp',
                            'fp',
                            'rf',
                            'rfz',
                            'sfz',
                            'sffz',
                            'fz',
                            'n',
                            'pf',
                            'sfzp'
                        ]
                    ]
                ]
            ]
        ],
        [
            'tempo',
            [
                [
                    [[16], 0],
                    [[10], 1, ['hide']]
                ],
                [
                    [[16], 0],
                    [[17], 0],
                    [[10], 1, ['hide']]
                ]
            ]
        ],
        ['volume', [[[[16], 0]]]],
        ['balance', [[[[16], 0]]]],
        [
            'tp',
            [
                [
                    [[16], 0],
                    [[10, 17], 1, ['default', 'buzzroll']]
                ]
            ]
        ],
        [
            'barre',
            [
                [
                    [[16], 0],
                    [[10, 17], 1, ['full', 'half']]
                ]
            ]
        ],
        [
            'rasg',
            [
                [
                    [
                        [10, 17],
                        0,
                        [
                            'ii',
                            'mi',
                            'miitriplet',
                            'miianapaest',
                            'pmptriplet',
                            'pmpanapaest',
                            'peitriplet',
                            'peianapaest',
                            'paitriplet',
                            'paianapaest',
                            'amitriplet',
                            'amianapaest',
                            'ppp',
                            'amii',
                            'amip',
                            'eami',
                            'eamii',
                            'peami'
                        ]
                    ]
                ]
            ]
        ],
        ['ot', [[[[10, 17], 0, ['15ma', '8va', 'regular', '8vb', '15mb', '15ma', '8va', '8vb', '15mb']]]]],
        ['instrument', [[[[16], 0]], [[[17, 10], 0]], [[[10], 0, ['percussion']]]]],
        ['bank', [[[[16], 0]]]],
        [
            'fermata',
            [
                [
                    [[10, 17], 0, ['short', 'medium', 'long']],
                    [[16], 3]
                ]
            ]
        ],
        ['beam', [[[[10, 17], 0, ['invert', 'up', 'down', 'auto', 'split', 'merge', 'splitsecondary']]]]]
    ]);
    public static readonly noteProperties = AlphaTex1LanguageDefinitions._props([
        ['nh', null],
        ['ah', [[[[16], 1]]]],
        ['th', [[[[16], 1]]]],
        ['ph', [[[[16], 1]]]],
        ['sh', [[[[16], 1]]]],
        ['fh', [[[[16], 1]]]],
        ['v', null],
        ['vw', null],
        ['sl', null],
        ['ss', null],
        ['sib', null],
        ['sia', null],
        ['sou', null],
        ['sod', null],
        ['psu', null],
        ['psd', null],
        ['h', null],
        ['lht', null],
        ['g', null],
        ['ac', null],
        ['hac', null],
        ['ten', null],
        [
            'tr',
            [
                [
                    [[16], 0],
                    [[16], 1, ['16', '32', '64']]
                ]
            ]
        ],
        ['pm', null],
        ['st', null],
        ['lr', null],
        ['x', null],
        ['t', null],
        ['turn', null],
        ['iturn', null],
        ['umordent', null],
        ['lmordent', null],
        ['string', null],
        ['hide', null],
        [
            'b',
            [
                [[[16], 5]],
                [
                    [
                        [10, 17],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[16], 5]
                ],
                [
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ],
                [
                    [
                        [10, 17],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ]
            ]
        ],
        [
            'be',
            [
                [[[16], 5]],
                [
                    [
                        [10, 17],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[16], 5]
                ],
                [
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ],
                [
                    [
                        [10, 17],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[10, 17], 0, ['default', 'gradual', 'fast']],
                    [[16], 5]
                ]
            ]
        ],
        ['lf', [[[[16], 0, ['1', '2', '3', '4', '5']]]]],
        ['rf', [[[[16], 0, ['1', '2', '3', '4', '5']]]]],
        [
            'acc',
            [
                [
                    [
                        [10, 17],
                        0,
                        [
                            'default',
                            'forcenone',
                            'forcenatural',
                            'forcesharp',
                            'forcedoublesharp',
                            'forceflat',
                            'forcedoubleflat',
                            'd',
                            '-',
                            'n',
                            '#',
                            '##',
                            'x',
                            'b',
                            'bb'
                        ]
                    ]
                ]
            ]
        ],
        ['slur', [[[[17], 0]], [[[10], 0]]]],
        ['-', null]
    ]);
}
