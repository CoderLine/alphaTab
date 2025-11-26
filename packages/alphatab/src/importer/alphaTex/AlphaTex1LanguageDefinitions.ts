import type { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
/**
 * @internal
 */
export class AlphaTex1LanguageDefinitions {
    // helpers for correct typing and potential future transformations

    private static _metaProps(
        props: [string, [string, [AlphaTexNodeType[], ValueListParseTypesMode, string[]][][] | null][] | null][]
    ) {
        return props;
    }

    private static _signatures(
        signatures: [string, [AlphaTexNodeType[], ValueListParseTypesMode, string[]][][] | null][]
    ) {
        return signatures;
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
        ['systemslayout', [[[[16], 7, []]]]],
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
        ['tuning', [[[[10], 0, ['piano', 'none', 'voice']]], [[[10], 7, []]]]],
        [
            'chord',
            [
                [
                    [[17], 0, []],
                    [[10, 17, 16], 7, []]
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
        ['ae', [[[[16], 6, []]]]],
        ['ks', [[[[10], 0, ['cb', 'gb', 'db', 'ab', 'eb', 'bb', 'f', 'c', 'g', 'd', 'a', 'e', 'b', 'f#', 'c#']]]]],
        ['clef', [[[[10], 0, ['neutral', 'c3', 'c4', 'f4', 'g2']]]]],
        ['ottava', [[[[10], 0, ['15ma', '8va', 'regular', '8vb', '15mb']]]]],
        [
            'tempo',
            [
                [
                    [[16], 2, []],
                    [[17], 1, []],
                    [[16], 4, []],
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
                ['systemslayout', [[[[16], 7, []]]]],
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
                ['barre', [[[[16], 7, []]]]],
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
}
