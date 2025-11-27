import type { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
type SimpleAlphaTexParameterDefinition = [AlphaTexNodeType[], ArgumentListParseTypesMode, string[]];
/**
 * @record
 * @internal
 */
export interface AlphaTexParameterDefinition {
    expectedTypes: Set<AlphaTexNodeType>;
    parseMode: ArgumentListParseTypesMode;
    allowedValues?: Set<string>;
}
/**
 * @internal
 */
export class AlphaTex1LanguageDefinitions {
    private static _param(simple: SimpleAlphaTexParameterDefinition): AlphaTexParameterDefinition {
        return {
            expectedTypes: new Set(simple[0]),
            parseMode: simple[1],
            allowedValues: simple[2] ? new Set(simple[2]) : undefined
        };
    }
    private static _simple(
        signature: SimpleAlphaTexParameterDefinition[][] | null
    ): AlphaTexParameterDefinition[][] | null {
        return signature === null ? null : signature.map(s => s.map(AlphaTex1LanguageDefinitions._param));
    }
    private static _metaProps(props: [string, [string, SimpleAlphaTexParameterDefinition[][] | null][] | null][]) {
        return new Map(
            props.map(p => [
                p[0],
                p[1] === null ? null : new Map(p[1].map(p => [p[0], AlphaTex1LanguageDefinitions._simple(p[1])]))
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
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'subtitle',
            [
                [
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'artist',
            [
                [
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'album',
            [
                [
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'words',
            [
                [
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'music',
            [
                [
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'wordsandmusic',
            [
                [
                    [[17], 0, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'copyright',
            [
                [
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'copyright2',
            [
                [
                    [[17], 0, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        ['instructions', [[[[17], 0, []]]]],
        ['notices', [[[[17], 0, []]]]],
        [
            'tab',
            [
                [
                    [[17], 0, []],
                    [[17], 1, []],
                    [[10], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        ['systemslayout', [[[[16], 5, []]]]],
        ['defaultsystemslayout', [[[[16], 0, []]]]],
        ['showdynamics', null],
        ['hidedynamics', null],
        ['usesystemsignseparator', null],
        ['multibarrest', null],
        ['bracketextendmode', [[[[10], 0, ['nobrackets', 'groupstaves', 'groupsimilarinstruments']]]]],
        ['singletracktracknamepolicy', [[[[10], 0, ['hidden', 'firstsystem', 'allsystems']]]]],
        ['multitracktracknamepolicy', [[[[10], 0, ['hidden', 'firstsystem', 'allsystems']]]]],
        ['firstsystemtracknamemode', [[[[10], 0, ['fullname', 'shortname']]]]],
        ['othersystemstracknamemode', [[[[10], 0, ['fullname', 'shortname']]]]],
        ['firstsystemtracknameorientation', [[[[10], 0, ['horizontal', 'vertical']]]]],
        ['othersystemstracknameorientation', [[[[10], 0, ['horizontal', 'vertical']]]]]
    ]);
    public static readonly staffMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        ['tuning', [[[[10], 0, ['piano', 'none', 'voice']]], [[[10], 5, []]]]],
        [
            'chord',
            [
                [
                    [[17], 0, []],
                    [[10, 17, 16], 5, []]
                ]
            ]
        ],
        ['capo', [[[[16], 0, []]]]],
        [
            'lyrics',
            [
                [[[17], 0, []]],
                [
                    [[16], 0, []],
                    [[17], 0, []]
                ]
            ]
        ],
        [
            'articulation',
            [
                [[[10], 0, ['defaults']]],
                [
                    [[17], 0, []],
                    [[10], 0, []]
                ],
                [
                    [[10], 0, []],
                    [[10], 0, []]
                ]
            ]
        ],
        ['displaytranspose', [[[[16], 0, []]]]],
        ['transpose', [[[[16], 0, []]]]]
    ]);
    public static readonly structuralMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        [
            'track',
            [
                [
                    [[17], 1, []],
                    [[17], 1, []]
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
                [[[10], 0, ['common']]],
                [
                    [[16], 0, []],
                    [[16], 0, []]
                ]
            ]
        ],
        ['ro', null],
        ['rc', [[[[16], 0, []]]]],
        ['ae', [[[[16], 4, []]]]],
        ['ks', [[[[10], 0, ['cb', 'gb', 'db', 'ab', 'eb', 'bb', 'f', 'c', 'g', 'd', 'a', 'e', 'b', 'f#', 'c#']]]]],
        ['clef', [[[[10], 0, ['neutral', 'c3', 'c4', 'f4', 'g2']]]]],
        ['ottava', [[[[10], 0, ['15ma', '8va', 'regular', '8vb', '15mb']]]]],
        [
            'tempo',
            [
                [
                    [[16], 2, []],
                    [[17], 1, []],
                    [[16], 3, []],
                    [[10], 1, ['hide']]
                ]
            ]
        ],
        [
            'tf',
            [
                [
                    [
                        [10],
                        0,
                        ['none', 'triplet16th', 'triplet8th', 'dotted16th', 'dotted8th', 'scottish16th', 'scottish8th']
                    ]
                ]
            ]
        ],
        ['ac', null],
        [
            'section',
            [
                [[[17], 0, []]],
                [
                    [[17], 0, []],
                    [[17], 0, []]
                ]
            ]
        ],
        [
            'jump',
            [
                [
                    [
                        [10],
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
        ['simile', [[[[10], 0, ['none', 'simple', 'firstofdouble', 'secondofdouble']]]]],
        [
            'barlineleft',
            [
                [
                    [
                        [10],
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
                        [10],
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
        ['scale', [[[[16], 2, []]]]],
        ['width', [[[[16], 2, []]]]],
        [
            'sync',
            [
                [
                    [[16], 0, []],
                    [[16], 0, []],
                    [[16], 0, []],
                    [[16], 3, []]
                ]
            ]
        ],
        ['accidentals', [[[[10], 0, ['auto', 'explicit']]]]],
        ['spd', [[[[16], 2, []]]]],
        ['sph', [[[[16], 2, []]]]],
        ['spu', [[[[16], 2, []]]]]
    ]);
    public static readonly metaDataProperties = AlphaTex1LanguageDefinitions._metaProps([
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
        [
            'track',
            [
                ['color', [[[[17], 0, []]]]],
                ['systemslayout', [[[[16], 5, []]]]],
                ['defaultsystemslayout', [[[[16], 0, []]]]],
                ['solo', null],
                ['mute', null],
                ['volume', [[[[16], 0, []]]]],
                ['balance', [[[[16], 0, []]]]],
                ['instrument', [[[[16], 0, []]], [[[17], 0, []]], [[[10], 0, ['percussion']]]]],
                ['bank', [[[[16], 0, []]]]],
                ['multibarrest', null]
            ]
        ],
        [
            'staff',
            [
                ['score', [[[[16], 1, []]]]],
                ['tabs', null],
                ['slash', null],
                ['numbered', null]
            ]
        ],
        ['voice', null],
        [
            'tuning',
            [
                ['hide', null],
                ['label', [[[[17], 0, []]]]]
            ]
        ],
        [
            'chord',
            [
                ['firstfret', [[[[16], 0, []]]]],
                ['barre', [[[[16], 5, []]]]],
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
        ['spu', null]
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
                    [[16], 0, []],
                    [[16], 0, []]
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
                    [[16], 0, []],
                    [[16], 0, []]
                ]
            ]
        ],
        ['txt', [[[[17], 0, []]]]],
        [
            'lyrics',
            [
                [[[17], 0, []]],
                [
                    [[16], 0, []],
                    [[17], 0, []]
                ]
            ]
        ],
        [
            'tb',
            [
                [[[16], 4, []]],
                [
                    [[10], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[16], 4, []]
                ],
                [
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
                ],
                [
                    [[10], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
                ]
            ]
        ],
        [
            'tbe',
            [
                [[[16], 4, []]],
                [
                    [[10], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[16], 4, []]
                ],
                [
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
                ],
                [
                    [[10], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
                ]
            ]
        ],
        ['bu', [[[[16], 1, []]]]],
        ['bd', [[[[16], 1, []]]]],
        ['au', [[[[16], 1, []]]]],
        ['ad', [[[[16], 1, []]]]],
        ['ch', [[[[17], 0, []]]]],
        ['gr', [[[[10], 1, ['onbeat', 'beforebeat', 'bendgrace']]]]],
        [
            'dy',
            [
                [
                    [
                        [10],
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
                    [[16], 0, []],
                    [[10], 1, ['hide']]
                ],
                [
                    [[16], 0, []],
                    [[17], 0, []],
                    [[10], 1, ['hide']]
                ]
            ]
        ],
        ['volume', [[[[16], 0, []]]]],
        ['balance', [[[[16], 0, []]]]],
        ['tp', [[[[16], 0, ['8', '16', '32']]]]],
        [
            'barre',
            [
                [
                    [[16], 0, []],
                    [[10], 1, ['full', 'half']]
                ]
            ]
        ],
        [
            'rasg',
            [
                [
                    [
                        [10],
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
        ['ot', [[[[10], 0, ['15ma', '8va', 'regular', '8vb', '15mb']]]]],
        ['instrument', [[[[16], 0, []]], [[[17], 0, []]], [[[10], 0, ['percussion']]]]],
        ['bank', [[[[16], 0, []]]]],
        [
            'fermata',
            [
                [
                    [[10], 0, ['short', 'medium', 'long']],
                    [[16], 1, []]
                ]
            ]
        ],
        ['beam', [[[[10], 0, ['invert', 'up', 'down', 'auto', 'split', 'merge', 'splitsecondary']]]]]
    ]);
    public static readonly noteProperties = AlphaTex1LanguageDefinitions._props([
        ['nh', null],
        ['ah', [[[[16], 0, []]]]],
        ['th', [[[[16], 0, []]]]],
        ['ph', [[[[16], 0, []]]]],
        ['sh', [[[[16], 0, []]]]],
        ['fh', [[[[16], 0, []]]]],
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
                    [[16], 0, []],
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
                [[[16], 4, []]],
                [
                    [
                        [10],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[16], 4, []]
                ],
                [
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
                ],
                [
                    [
                        [10],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
                ]
            ]
        ],
        [
            'be',
            [
                [[[16], 4, []]],
                [
                    [
                        [10],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[16], 4, []]
                ],
                [
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
                ],
                [
                    [
                        [10],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[10], 0, ['default', 'gradual', 'fast']],
                    [[16], 4, []]
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
                        [10],
                        0,
                        [
                            'default',
                            'forcenone',
                            'forcenatural',
                            'forcesharp',
                            'forcedoublesharp',
                            'forceflat',
                            'forcedoubleflat'
                        ]
                    ]
                ]
            ]
        ],
        ['slur', [[[[17], 0, []]], [[[10], 0, []]]]]
    ]);
}
