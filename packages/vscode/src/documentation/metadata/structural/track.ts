import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import { type MetadataDoc, properties, type ValueItemDoc } from '../../types';
import { generalMidiInstruments } from '../../common';

export const track: MetadataDoc = {
    tag: '\\track',
    syntax: ['\\track', '\\track fullName', '\\track (shortName fullName)'],
    snippet: '\\track "$1"$0',
    shortDescription: 'Start a new track',
    valueRemarks: `The displayed name depends on the configured [Track Name Policy](https://next.alphatab.net/docs/alphatex/score-metadata#singletracktracknamepolicy-and-multitracktracknamepolicy). If the short name is not specified, the first 10 characters of the long name are used as short name.`,
    values: [
        {
            name: 'fullName',
            shortDescription: 'The full name of the track',
            type: 'string',
            required: false
        },
        {
            name: 'shortName',
            shortDescription: 'The short name of the track',
            type: 'string',
            required: false
        }
    ],
    examples: `
        \\track "First Track" "frst" 
            C4 D4 E4 F4
        \\track
            C5 D5 E5 F5
        `,
    properties: properties(
        {
            property: 'color',
            syntax: ['color colorCode'],
            snippet: 'color $0',
            shortDescription: 'The color for use in a custom UI',
            longDescription:
                'The data model holds information about the color of the track which might be used by user interfaces to visually differenciate them. This data mainly originates from the Guitar Pro file format where colors are used to differenciate the tracks in the track picker and some other visualizations. It does not have an impact on the color of the music notation but can be used in a custom UI.',
            values: [
                {
                    name: 'colorCode',
                    shortDescription: 'The color as CSS color',
                    longDescription:
                        'The colorCode in [any supported color format](https://next.alphatab.net/docs/reference/settings/display/resources#colors)',
                    type: 'string',
                    required: true
                }
            ],
            examples: `
                \\track { color "#FF0000" }
                1.1 2.1 3.1 4.1
                `
        },
        {
            property: 'systemsLayout',
            syntax: ['systemsLayout (numberOfBars numberOfBars...)'],
            snippet: 'systemsLayout ($1)$0',
            shortDescription: 'Set the number of bars to display per system.',
            longDescription: `
                Defines the number of bars to display per system. 

                The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. 
                The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net/docs/reference/settings/display/systemslayoutmode).
                `,
            values: [
                {
                    name: 'numberOfBars',
                    shortDescription: 'The number of bars to display per system',
                    longDescription: 'Defines for every system (line) the number of bars it should contain',
                    type: '`number` (repeated)',
                    required: true
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
            syntax: ['defaultSystemsLayout numberOfBars'],
            snippet: 'defaultSystemsLayout $0',
            shortDescription: 'Set the default number of bars to display per system',
            longDescription: `
                Defines the default number of bars to display per system. 

                The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. 
                The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net//docs/reference/settings/display/systemslayoutmode).`,
            values: [
                {
                    name: 'numberOfBars',
                    shortDescription: 'Defines for every system (line) the number of bars it should contain',
                    type: '`number`',
                    required: true
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
            syntax: ['solo'],
            snippet: 'solo',
            shortDescription: `Set the track to be played solo.`,
            values: [],
            examples: `
                \\track { solo }
                1.1 2.1 3.1 4.1
                \\track 
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'mute',
            syntax: ['mute'],
            snippet: 'mute',
            shortDescription: `Set the track to be muted.`,
            values: [],
            examples: `
                \\track 
                1.1 2.1 3.1 4.1
                \\track { mute }
                10.1 11.1 12.1 13.1
                `
        },
        {
            property: 'volume',
            syntax: ['volume value'],
            snippet: 'volume $0',
            shortDescription: `Set the track volume.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The volume to set',
                    type: '`number` (0-16)',
                    required: true
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
            syntax: ['balance value'],
            snippet: 'balance $0',
            shortDescription: `Set the track balance.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The balance to set',
                    type: '`number` (0-16; 8 is centered)',
                    required: true
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
            syntax: ['instrument value'],
            snippet: 'instrument "$1"$0',
            shortDescription: `Set the midi instrument for this track.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The MIDI instrument to set',
                    type: '`number`(MIDI program number 0-127) or `string` (midi instrument name)',
                    required: true,
                    values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                        [
                            AlphaTexNodeType.String,
                            generalMidiInstruments.map(v => ({ name: v, snippet: JSON.stringify(v) }))
                        ],
                        [
                            AlphaTexNodeType.Number,
                            generalMidiInstruments.map((v, i) => ({
                                name: `${i} (${v})`,
                                snippet: i.toString()
                            }))
                        ]
                    ])
                }
            ],
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
            syntax: ['bank value'],
            snippet: 'bank $1$0',
            shortDescription: 'Set the MIDI bank for this track.',
            longDescription: `
            Set the MIDI bank to select when playing this track.

            The loaded soundfont needs to have this bank defined, otherwise there might be no audio.`,
            values: [
                {
                    name: 'value',
                    shortDescription: 'The midi bank to set',
                    type: '`number`',
                    required: true,
                    values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                        [
                            AlphaTexNodeType.String,
                            generalMidiInstruments.map(v => ({ name: v, snippet: JSON.stringify(v) }))
                        ],
                        [
                            AlphaTexNodeType.Number,
                            generalMidiInstruments.map((v, i) => ({
                                name: `${i} (${v})`,
                                snippet: i.toString()
                            }))
                        ]
                    ])
                }
            ],
            examples: `
                \\track { instrument 25 bank 2 }
                `
        },
        {
            property: 'multiBarRest',
            syntax: ['multiBarRest'],
            snippet: 'multiBarRest$0',
            shortDescription: 'Display multibar rests',
            longDescription: `Enables the display of multibar rests if this track is shown as standalone.`,
            values: [],
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
    )
};
