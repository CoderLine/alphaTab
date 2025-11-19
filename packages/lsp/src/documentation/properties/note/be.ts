import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@coderline/alphatab-lsp/documentation/types';

export const be: PropertyDoc = {
    property: 'be',
    syntax: ['be (type style offset1 value1 offset2 value2 offset3 value3...)'],
    snippet: 'be ($1)$0',
    shortDescription: 'Note Bend (exact)',
    longDescription: `
        Adds an exact bend effect to the note.

        * The \`b\` variant automatically spreads the values across the duration of the beat.
        * The \`be\` (exact) variant allows specifying exactly at which offset a value is placed.
    `,
    values: [
        {
            name: 'type',
            shortDescription: 'The type of bend (affects the display).',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                     [
                        {
                            name: 'custom',
                            snippet: 'custom',
                            shortDescription: 'A non-standard custom bends with multiple points'
                        },
                        {
                            name: 'bend',
                            snippet: 'bend',
                            shortDescription: 'A simple bend up to a higher note.'
                        },
                        {
                            name: 'release',
                            snippet: 'release',
                            shortDescription: 'A release of bends down to a lower note.'
                        },
                        {
                            name: 'bendRelease',
                            snippet: 'bendRelease',
                            shortDescription: 'A bend directly followed by a release.'
                        },
                        {
                            name: 'hold',
                            snippet: 'hold',
                            shortDescription: 'A bend which is held from the previous note.'
                        },
                        {
                            name: 'preBend',
                            snippet: 'preBend',
                            shortDescription: 'A bend applied before the note is played.'
                        },
                        {
                            name: 'preBendBend',
                            snippet: 'preBendBend',
                            shortDescription: 'A pre-bend followed by a bend'
                        },
                        {
                            name: 'preBendRelease',
                            snippet: 'preBendRelease',
                            shortDescription: 'A pre-bend followed by a release'
                        }
                    ]
                ]
            ])
        },
        {
            name: 'style',
            shortDescription: 'The style of the bend play style.',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'Default',
                            snippet: 'default',
                            shortDescription: '',
                            longDescription:
                                'No additional text is shown, the bend offsets and values are respected as specified.'
                        },
                        {
                            name: 'Gradual',
                            snippet: 'gradual',
                            shortDescription: '',
                            longDescription:
                                'Will show an additional "grad." on the bend line. The audio is generated according to the type spread evenly across the play duration.'
                        },

                        {
                            name: 'Fast',
                            snippet: 'fast',
                            shortDescription: '',
                            longDescription:
                                'No additional text is shown. The audio is generated according to the type spread evenly across the fixed duration set via settings.player.songBookBendDuration.'
                        }
                    ]
                ]
            ])
        },
        {
            name: 'value',
            shortDescription:
                'The value of the whammy in quarter-tones relative to the original note, decimals supported',
            type: '`number` (repeated)',
            required: true
        }
    ],
    valueRemarks: `
    It is recommended to rely on the auto-detection of the type and only specify the type explicitly if something is wrong.
    `,
    examples: `
        :1 3.3 {be (0 0 5 2 30 4)}
        `
};
