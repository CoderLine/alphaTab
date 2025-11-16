import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@src/documentation/types';

export const tb: PropertyDoc = {
    property: 'tb',
    syntax: ['tb (type style value1 value2 value3...)'],
    snippet: 'tb ($1)$0',
    shortDescription: 'Tremolo Bar (Whammy)',
    longDescription: `
        Adds a whammy bar (aka. tremolo bar) effect to the beat.

        * The \`tb\` variant automatically spreads the values across the duration of the beat.
        * The \`tbe\` (exact) variant allows specifying exactly at which offset a value is placed.
    `,
    values: [
        {
            name: 'type',
            shortDescription: 'The type of whammy (affects the display).',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'custom',
                            snippet: 'custom',
                            shortDescription: 'Non standard custom whammys with multiple points'
                        },
                        { name: 'dive', snippet: 'dive', shortDescription: 'A gradual change between two points' },
                        { name: 'dip', snippet: 'dip', shortDescription: 'A A->B->A whammy pattern.' },
                        { name: 'hold', snippet: 'hold', shortDescription: 'Holding whammys (on tied notes).' },
                        {
                            name: 'predive',
                            snippet: 'predive',
                            shortDescription: 'Press/pull before playing the note and then kept'
                        },
                        {
                            name: 'predivedive',
                            snippet: 'predivedive',
                            shortDescription:
                                'Whammy bar is pressed/pulled before playing the note and then further pressed/released'
                        }
                    ]
                ]
            ])
        },
        {
            name: 'style',
            shortDescription: 'The style of the whammy play style.',
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
                                'Will show an additional "grad." on the whammy line. The audio is generated according to the type spread evenly across the play duration.'
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
        3.3.1{tb (0 4 0 8)} | r |
        3.3.1{tb (0 -4 0 -8)} | r |
        3.3.1{tbe (0 0 5 4 30 8 60 0)}
        `
};
