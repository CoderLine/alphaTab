import { instrument } from '@coderline/alphatab-alphatex/properties/beat/instrument';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const track: MetadataTagDefinition = {
    tag: '\\track',
    snippet: '\\track "$1"$0',
    shortDescription: 'Start a new track',
    remarks: `The displayed name depends on the configured [Track Name Policy](https://next.alphatab.net/docs/alphatex/score-metadata#singletracktracknamepolicy-and-multitracktracknamepolicy). If the short name is not specified, the first 10 characters of the long name are used as short name.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'name',
                    shortDescription: 'The full name of the track',
                    parseMode: ValueListParseTypesMode.Optional,
                    defaultValue: '',
                    type: AlphaTexNodeType.String
                },
                {
                    name: 'shortName',
                    shortDescription: 'The short name of the track',
                    parseMode: ValueListParseTypesMode.Optional,
                    defaultValue: '`/*computed from name*/`',
                    type: AlphaTexNodeType.String
                }
            ]
        }
    ],
    examples: `
        \\track "First Track" "frst" 
            C4 D4 E4 F4
        \\track
            C5 D5 E5 F5
        `,
    properties: [
        {
            property: 'color',
            snippet: 'color $0',
            shortDescription: 'The color for use in a custom UI',
            longDescription:
                'The data model holds information about the color of the track which might be used by user interfaces to visually differenciate them. This data mainly originates from the Guitar Pro file format where colors are used to differenciate the tracks in the track picker and some other visualizations. It does not have an impact on the color of the music notation but can be used in a custom UI.',
            signatures: [
                {
                    parameters: [
                        {
                            name: 'colorCode',
                            shortDescription: 'The color as CSS color',
                            longDescription:
                                'The colorCode in [any supported color format](https://next.alphatab.net/docs/reference/settings/display/resources#colors)',
                            type: AlphaTexNodeType.String,
                            parseMode: ValueListParseTypesMode.Required
                        }
                    ]
                }
            ],
            examples: `
                \\track { color "#FF0000" }
                1.1 2.1 3.1 4.1
                `
        },
        {
            property: 'systemsLayout',
            snippet: 'systemsLayout ($1)$0',
            shortDescription: 'Set the number of bars to display per system.',
            longDescription: `
                Defines the number of bars to display per system. 

                The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. 
                The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net/docs/reference/settings/display/systemslayoutmode).
                `,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'numberOfBars',
                            shortDescription: 'The number of bars to display per system',
                            longDescription: 'Defines for every system (line) the number of bars it should contain',
                            type: AlphaTexNodeType.Number,
                            parseMode: ValueListParseTypesMode.ValueListWithoutParenthesis
                        }
                    ]
                }
            ],
            examples: `
                \\title "Single Track"
                \\track { systemsLayout (2 3 2) }
                :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
                `
        },
        {
            property: 'defaultSystemsLayout',
            snippet: 'defaultSystemsLayout $0',
            shortDescription: 'Set the default number of bars to display per system',
            longDescription: `
                Defines the default number of bars to display per system. 

                The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. 
                The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net//docs/reference/settings/display/systemslayoutmode).`,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'numberOfBars',
                            shortDescription: 'Defines for every system (line) the number of bars it should contain',
                            type: AlphaTexNodeType.Number,
                            parseMode: ValueListParseTypesMode.Required
                        }
                    ]
                }
            ],
            examples: `
                \\title "Single Track"
                \\track { defaultSystemsLayout 2 }
                    :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
                `
        },
        {
            property: 'solo',
            snippet: 'solo',
            shortDescription: `Set the track to be played solo.`,
            signatures: [
                {
                    parameters: []
                }
            ],
            examples: `
                \\track { solo }
                1.1 2.1 3.1 4.1
                \\track 
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'mute',
            snippet: 'mute',
            shortDescription: `Set the track to be muted.`,
            signatures: [
                {
                    parameters: []
                }
            ],
            examples: `
                \\track 
                1.1 2.1 3.1 4.1
                \\track { mute }
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'volume',
            snippet: 'volume $0',
            shortDescription: `Set the track volume.`,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'value',
                            shortDescription: 'The volume to set (0-16)',
                            type: AlphaTexNodeType.Number,
                            parseMode: ValueListParseTypesMode.Required
                        }
                    ]
                }
            ],
            examples: `
                \\track { volume 0 } 
                1.1 2.1 3.1 4.1
                \\track { volume 16 }
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'balance',
            snippet: 'balance $0',
            shortDescription: `Set the track balance.`,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'value',
                            shortDescription: 'The balance to set (0-16; 8 is centered)',
                            type: AlphaTexNodeType.Number,
                            parseMode: ValueListParseTypesMode.Required
                        }
                    ]
                }
            ],
            examples: `
                \\track { volume 0 } 
                1.1 2.1 3.1 4.1
                \\track { volume 16 }
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'instrument',
            snippet: 'instrument "$1"$0',
            shortDescription: `Set the midi instrument for this track.`,
            signatures: instrument.signatures,
            examples: `
                \\track { instrument 0 } 
                C4 C5 r r
                \\track { instrument "Acoustic Steel Guitar" }
                \\tuning (E4 B3 G3 D3 A2 E2)
                r r 12.1 13.1
                `
        },
        {
            property: 'bank',
            snippet: 'bank $1$0',
            shortDescription: 'Set the MIDI bank for this track.',
            longDescription: `
            Set the MIDI bank to select when playing this track.

            The loaded soundfont needs to have this bank defined, otherwise there might be no audio.`,
            signatures: [
                {
                    parameters: [
                        {
                            name: 'value',
                            shortDescription: 'The midi bank to set',
                            parseMode: ValueListParseTypesMode.Required,
                            type: AlphaTexNodeType.Number
                        }
                    ]
                }
            ],
            examples: `
                \\track { instrument 25 bank 2 }
                `
        },
        {
            property: 'multiBarRest',
            snippet: 'multiBarRest$0',
            shortDescription: 'Display multibar rests',
            longDescription: `Enables the display of multibar rests if this track is shown as standalone.`,
            signatures: [
                {
                    parameters: []
                }
            ],
            examples: [
                `
                \\track { multiBarRest } 
                C4*4 | r.1 | r.1 | r.1 | C4 * 4
                `,
                `
                \\track
                C4*4 | r.1 | r.1 | r.1 | C4 * 4
                `
            ]
        }
    ]
};
