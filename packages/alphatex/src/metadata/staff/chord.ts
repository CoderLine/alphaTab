import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const chord: MetadataTagDefinition = {
    tag: '\\chord',
    snippet: '\\chord ("{$1}" $2)$0',
    shortDescription: 'Define a new chord',
    longDescription: `
    Defines a new chord for a chord diagram display defining how to play it.

    To avoid inconsistencies with tunings, chords should be defined after the tuning is set.

    To use the defined chord the \`ch chordName\` beat property has to be applied. The notes for the chord still have to be specified separately, the definition in this metadata is purely for the chord diagram.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'name',
                    shortDescription: 'The name of the chord',
                    parseMode: ValueListParseTypesMode.Required,
                    type: AlphaTexNodeType.String,
                    allowAllStringTypes: true
                },
                {
                    name: 'strings',
                    shortDescription:
                        'For every string of the staff tuning, the fret to be played or `x` for strings not played.',
                    parseMode: ValueListParseTypesMode.ValueListWithoutParenthesis,
                    type: [AlphaTexNodeType.Ident, AlphaTexNodeType.String, AlphaTexNodeType.Number]
                }
            ]
        }
    ],
    examples: `
        \\chord ("C" 0 1 0 2 3 x)
        \\ts 2 4
        (0.1 1.2 0.3 2.4 3.5){ch "C"} (0.1 1.2 0.3 2.4 3.5)
        `,
    properties: [
        {
            property: 'firstFret',
            snippet: 'firstFret $0',
            shortDescription: 'Shifts the first fret shown in the diagram higher',
            signatures: [
                {
                    parameters: [
                        {
                            name: 'fret',
                            shortDescription: 'The index of the first fret',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Number
                        }
                    ]
                }
            ],
            examples: `
                \\chord ("D#" 6 8 8 8 6 x) {firstfret 6}
                (6.1 8.2 8.3 8.4 6.5){ch "D#"}
                `
        },
        {
            property: 'barre',
            snippet: 'barre $0',
            shortDescription: 'Defines on which frets a barré should be played.',
            longDescription: `Defines on which frets a barré should be played (visually joins the dots to a bar).`,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'fret',
                            shortDescription: 'The frets on which a barré should be played',
                            parseMode: ValueListParseTypesMode.ValueListWithoutParenthesis,
                            type: AlphaTexNodeType.Number
                        }
                    ]
                }
            ],
            examples: `
                \\chord ("D#" 6 8 8 8 6 x) {firstfret 6 barre 6}
                \\chord ("Special" 3 3 3 1 1 1) {showname false barre (1 3)}
                (6.1 8.2 8.3 8.4 6.5){ch "D#"} 
                (3.1 3.2 3.3 1.4 1.5 1.6){ch "Special"}
                `
        },
        {
            property: 'showDiagram',
            snippet: 'showDiagram',
            shortDescription: `Set the chord diagram visibility.`,
            signatures: [
                {
                    parameters: []
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the diagram',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.String,
                            values: [
                                { name: 'true', snippet: '"true"', shortDescription: 'Show the diagram' },
                                { name: 'false', snippet: '"false"', shortDescription: 'Hide the diagram' }
                            ]
                        }
                    ]
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the diagram',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Ident,
                            values: [
                                { name: 'true', snippet: 'true', shortDescription: 'Show the diagram' },
                                { name: 'false', snippet: 'false', shortDescription: 'Hide the diagram' }
                            ]
                        }
                    ]
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the diagram',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Number,
                            values: [
                                { name: '1', snippet: '1', shortDescription: 'Show the diagram' },
                                { name: '0', snippet: '0', shortDescription: 'Hide the diagram' }
                            ]
                        }
                    ]
                }
            ],
            examples: `
                \\chord ("E" 0 0 1 2 2 0) {showdiagram false}
                (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
                `
        },
        {
            property: 'showFingering',
            snippet: 'showFingering',
            shortDescription: `Set the finger position visibility.`,
            signatures: [
                {
                    parameters: []
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the finger position',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.String,
                            values: [
                                { name: 'true', snippet: '"true"', shortDescription: 'Show the fingering' },
                                { name: 'false', snippet: '"false"', shortDescription: 'Hide the fingering' }
                            ]
                        }
                    ]
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the finger position',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Ident,
                            values: [
                                { name: 'true', snippet: 'true', shortDescription: 'Show the fingering' },
                                { name: 'false', snippet: 'false', shortDescription: 'Hide the fingering' }
                            ]
                        }
                    ]
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the finger position',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Number,
                            values: [
                                { name: '1', snippet: '1', shortDescription: 'Show the fingering' },
                                { name: '0', snippet: '0', shortDescription: 'Hide the fingering' }
                            ]
                        }
                    ]
                }
            ],
            examples: `
                \\chord ("E" 0 0 1 2 2 0) {showfingers false}
                (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
                `
        },
        {
            property: 'showName',
            snippet: 'showName',
            shortDescription: `Set the chord name visibility.`,
            signatures: [
                {
                    parameters: []
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the chord name in the diagram',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.String,
                            values: [
                                { name: 'true', snippet: '"true"', shortDescription: 'Show the chord name' },
                                { name: 'false', snippet: '"false"', shortDescription: 'Hide the chord name' }
                            ]
                        }
                    ]
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the chord name in the diagram',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Ident,
                            values: [
                                { name: 'true', snippet: 'true', shortDescription: 'Show the chord name' },
                                { name: 'false', snippet: 'false', shortDescription: 'Hide the chord name' }
                            ]
                        }
                    ]
                },
                {
                    parameters: [
                        {
                            name: 'visibility',
                            shortDescription: 'The visibility of the chord name in the diagram',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Number,
                            values: [
                                { name: '1', snippet: '1', shortDescription: 'Show the chord name' },
                                { name: '0', snippet: '0', shortDescription: 'Hide the chord name' }
                            ]
                        }
                    ]
                }
            ],
            examples: `
                // Hide name
                \\chord ("Special" 3 3 3 1 1 1) {showname false}
                .
                (3.1 3.2 3.3 1.4 1.5 1.6){ch "Special"}
                `
        }
    ]
};
