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
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'subtitle',
            [
                [
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'artist',
            [
                [
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'album',
            [
                [
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'words',
            [
                [
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'music',
            [
                [
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'wordsandmusic',
            [
                [
                    [[107], 0],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'copyright',
            [
                [
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        [
            'copyright2',
            [
                [
                    [[107], 0],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        ['instructions', [[[[107, 100], 0]]]],
        ['notices', [[[[107, 100], 0]]]],
        [
            'tab',
            [
                [
                    [[107, 100], 0],
                    [[107], 1],
                    [[100, 107], 1, ['left', 'center', 'right']]
                ]
            ]
        ],
        ['systemslayout', [[[[106], 5]]]],
        ['defaultsystemslayout', [[[[106], 0]]]],
        ['showdynamics', null],
        ['hidedynamics', null],
        ['usesystemsignseparator', null],
        ['tuningdisplaymode', [[[[100, 107], 0, ['score', 'staff']]]]],
        ['multibarrest', null],
        ['bracketextendmode', [[[[100, 107], 0, ['nobrackets', 'groupstaves', 'groupsimilarinstruments']]]]],
        ['singletracktracknamepolicy', [[[[100, 107], 0, ['hidden', 'firstsystem', 'allsystems']]]]],
        ['multitracktracknamepolicy', [[[[100, 107], 0, ['hidden', 'firstsystem', 'allsystems']]]]],
        ['firstsystemtracknamemode', [[[[100, 107], 0, ['fullname', 'shortname']]]]],
        ['othersystemstracknamemode', [[[[100, 107], 0, ['fullname', 'shortname']]]]],
        ['firstsystemtracknameorientation', [[[[100, 107], 0, ['horizontal', 'vertical']]]]],
        ['othersystemstracknameorientation', [[[[100, 107], 0, ['horizontal', 'vertical']]]]],
        ['extendbarlines', null],
        ['chorddiagramsinscore', [[[[100], 1, ['true', 'false']]]]],
        ['hideemptystaves', null],
        ['hideemptystavesinfirstsystem', null],
        ['showsinglestaffbrackets', null],
        ['defaultbarnumberdisplay', [[[[100, 107], 0, ['allbars', 'firstofsystem', 'hide']]]]]
    ]);
    public static readonly staffMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        ['tuning', [[[[100, 107], 0, ['piano', 'none', 'voice']]], [[[100, 107], 5]]]],
        [
            'chord',
            [
                [
                    [[107, 100], 0],
                    [[100, 107, 106], 5]
                ]
            ]
        ],
        ['capo', [[[[106], 0]]]],
        [
            'lyrics',
            [
                [[[107], 0]],
                [
                    [[106], 0],
                    [[107], 0]
                ]
            ]
        ],
        [
            'articulation',
            [
                [[[100], 0, ['defaults']]],
                [
                    [[107, 100], 0],
                    [[106], 0]
                ]
            ]
        ],
        ['displaytranspose', [[[[106], 0]]]],
        ['transpose', [[[[106], 0]]]],
        ['instrument', [[[[106], 0]], [[[107, 100], 0]], [[[100], 0, ['percussion']]]]]
    ]);
    public static readonly structuralMetaDataSignatures = AlphaTex1LanguageDefinitions._signatures([
        [
            'track',
            [
                [
                    [[107], 1],
                    [[107], 1]
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
                [[[100, 107], 0, ['common']]],
                [
                    [[106], 0],
                    [[106], 0]
                ]
            ]
        ],
        ['ro', null],
        ['rc', [[[[106], 0]]]],
        ['ae', [[[[106, 103], 4]]]],
        [
            'ks',
            [
                [
                    [
                        [100, 107],
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
        ['clef', [[[[100, 106, 107], 0, ['neutral', 'c3', 'c4', 'f4', 'g2', 'n', 'alto', 'tenor', 'bass', 'treble']]]]],
        ['ottava', [[[[100, 107], 0, ['15ma', '8va', 'regular', '8vb', '15mb', '15ma', '8va', '8vb', '15mb']]]]],
        [
            'tempo',
            [
                [
                    [[106], 2],
                    [[107], 1]
                ],
                [null, [[106], 2], [[107], 0], [[106], 1], [[100], 1, ['hide']]]
            ]
        ],
        [
            'tf',
            [
                [
                    [
                        [100, 106, 107],
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
                [[[107, 100], 0]],
                [
                    [[107, 100], 0],
                    [[107, 100], 0, null, ['x', '-', 'r']]
                ]
            ]
        ],
        [
            'jump',
            [
                [
                    [
                        [100, 107],
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
        ['simile', [[[[100, 107], 0, ['none', 'simple', 'firstofdouble', 'secondofdouble']]]]],
        [
            'barlineleft',
            [
                [
                    [
                        [100, 107],
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
                        [100, 107],
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
        ['scale', [[[[106], 2]]]],
        ['width', [[[[106], 2]]]],
        [
            'sync',
            [
                [
                    [[106], 0],
                    [[106], 0],
                    [[106], 0],
                    [[106], 3]
                ]
            ]
        ],
        ['accidentals', [[[[100, 107], 0, ['auto', 'explicit']]]]],
        ['spd', [[[[106], 2]]]],
        ['sph', [[[[106], 2]]]],
        ['spu', [[[[106], 2]]]],
        ['db', null],
        ['voicemode', [[[[100, 107], 0, ['staffwise', 'barwise']]]]],
        ['barnumberdisplay', [[[[100, 107], 0, ['allbars', 'firstofsystem', 'hide']]]]],
        [
            'beaming',
            [
                [
                    [[106], 0],
                    [[106], 5]
                ]
            ]
        ]
    ]);
    public static readonly metaDataProperties = AlphaTex1LanguageDefinitions._metaProps([
        [
            'track',
            [
                ['color', [[[[107], 0]]]],
                ['systemslayout', [[[[106], 5]]]],
                ['defaultsystemslayout', [[[[106], 0]]]],
                ['solo', null],
                ['mute', null],
                ['volume', [[[[106], 0]]]],
                ['balance', [[[[106], 0]]]],
                ['instrument', [[[[106], 0]], [[[107, 100], 0]], [[[100], 0, ['percussion']]]]],
                ['bank', [[[[106], 0]]]],
                ['multibarrest', null]
            ]
        ],
        [
            'staff',
            [
                ['score', [[[[106], 1]]]],
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
        ['tuningdisplaymode', null],
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
                ['label', [[[[107], 0]]]]
            ]
        ],
        [
            'chord',
            [
                ['firstfret', [[[[106], 0]]]],
                ['barre', [[[[106], 5]]]],
                [
                    'showdiagram',
                    [[], [[[107], 0, ['true', 'false']]], [[[100], 0, ['true', 'false']]], [[[106], 0, ['1', '0']]]]
                ],
                [
                    'showfingering',
                    [[], [[[107], 0, ['true', 'false']]], [[[100], 0, ['true', 'false']]], [[[106], 0, ['1', '0']]]]
                ],
                [
                    'showname',
                    [[], [[[107], 0, ['true', 'false']]], [[[100], 0, ['true', 'false']]], [[[106], 0, ['1', '0']]]]
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
                [[[106], 0, ['3', '5', '6', '7', '9', '10', '12']]],
                [
                    [[106], 0],
                    [[106], 0]
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
                [[[106], 0, ['3', '5', '6', '7', '9', '10', '12']]],
                [
                    [[106], 0],
                    [[106], 0]
                ]
            ]
        ],
        ['txt', [[[[107, 100], 0]]]],
        [
            'lyrics',
            [
                [[[107], 0]],
                [
                    [[106], 0],
                    [[107], 0]
                ]
            ]
        ],
        [
            'tb',
            [
                [[[106], 5]],
                [
                    [[100, 107], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[106], 5]
                ],
                [
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ],
                [
                    [[100, 107], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ]
            ]
        ],
        [
            'tbe',
            [
                [[[106], 5]],
                [
                    [[100, 107], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[106], 5]
                ],
                [
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ],
                [
                    [[100, 107], 0, ['custom', 'dive', 'dip', 'hold', 'predive', 'predivedive']],
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ]
            ]
        ],
        ['bu', [[[[106], 1]]]],
        ['bd', [[[[106], 1]]]],
        ['au', [[[[106], 1]]]],
        ['ad', [[[[106], 1]]]],
        ['ch', [[[[107, 100], 0]]]],
        ['gr', [[[[100, 107], 1, ['onbeat', 'beforebeat', 'bendgrace', 'ob', 'bb', 'b']]]]],
        [
            'dy',
            [
                [
                    [
                        [100, 107],
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
                    [[106], 0],
                    [[100], 1, ['hide']]
                ],
                [
                    [[106], 0],
                    [[107], 0],
                    [[100], 1, ['hide']]
                ]
            ]
        ],
        ['volume', [[[[106], 0]]]],
        ['balance', [[[[106], 0]]]],
        [
            'tp',
            [
                [
                    [[106], 0],
                    [[100, 107], 1, ['default', 'buzzroll']]
                ]
            ]
        ],
        [
            'barre',
            [
                [
                    [[106], 0],
                    [[100, 107], 1, ['full', 'half']]
                ]
            ]
        ],
        [
            'rasg',
            [
                [
                    [
                        [100, 107],
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
        ['ot', [[[[100, 107], 0, ['15ma', '8va', 'regular', '8vb', '15mb', '15ma', '8va', '8vb', '15mb']]]]],
        ['instrument', [[[[106], 0]], [[[107, 100], 0]], [[[100], 0, ['percussion']]]]],
        ['bank', [[[[106], 0]]]],
        [
            'fermata',
            [
                [
                    [[100, 107], 0, ['short', 'medium', 'long']],
                    [[106], 3]
                ]
            ]
        ],
        ['beam', [[[[100, 107], 0, ['invert', 'up', 'down', 'auto', 'split', 'merge', 'splitsecondary']]]]],
        ['restdisplaypitch', [[[[100], 0]]]]
    ]);
    public static readonly noteProperties = AlphaTex1LanguageDefinitions._props([
        ['nh', null],
        ['ah', [[[[106], 1]]]],
        ['th', [[[[106], 1]]]],
        ['ph', [[[[106], 1]]]],
        ['sh', [[[[106], 1]]]],
        ['fh', [[[[106], 1]]]],
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
                    [[106], 0],
                    [[106], 1, ['16', '32', '64']]
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
                [[[106], 5]],
                [
                    [
                        [100, 107],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[106], 5]
                ],
                [
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ],
                [
                    [
                        [100, 107],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ]
            ]
        ],
        [
            'be',
            [
                [[[106], 5]],
                [
                    [
                        [100, 107],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[106], 5]
                ],
                [
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ],
                [
                    [
                        [100, 107],
                        0,
                        ['custom', 'bend', 'release', 'bendrelease', 'hold', 'prebend', 'prebendbend', 'prebendrelease']
                    ],
                    [[100, 107], 0, ['default', 'gradual', 'fast']],
                    [[106], 5]
                ]
            ]
        ],
        ['lf', [[[[106], 0, ['1', '2', '3', '4', '5']]]]],
        ['rf', [[[[106], 0, ['1', '2', '3', '4', '5']]]]],
        [
            'acc',
            [
                [
                    [
                        [100, 107],
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
        ['slur', [[[[107], 0]], [[[100], 0]]]],
        ['-', null]
    ]);
}
