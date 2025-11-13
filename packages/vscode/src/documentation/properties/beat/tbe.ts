import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const tbe: PropertyDoc = {
    property: 'tbe',
    syntax: ['tbe (type style offset1 value1 offset2 value2 offset3 value3...)'],
    snippet: 'tbe ($1)$0',
    shortDescription: 'Tremolo Bar (Whammy) Exact',
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
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'Custom',
                            snippet: 'custom',
                            shortDescription: 'Non standard custom whammys with multiple points'
                        },
                        { name: 'Dive', snippet: 'dive', shortDescription: 'A gradual change between two points' },
                        { name: 'Dip', snippet: 'dip', shortDescription: 'A A->B->A whammy pattern.' },
                        { name: 'Hold', snippet: 'hold', shortDescription: 'Holding whammys (on tied notes).' },
                        {
                            name: 'Pre-Dive',
                            snippet: 'predive',
                            shortDescription: 'Press/pull before playing the note and then kept'
                        },
                        {
                            name: 'Pre-Dive-Dive',
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
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        {
                            name: 'Default',
                            snippet: 'default',
                            longDescription:
                                'No additional text is shown, the bend offsets and values are respected as specified.'
                        },
                        {
                            name: 'Gradual',
                            snippet: 'gradual',
                            longDescription:
                                'Will show an additional "grad." on the whammy line. The audio is generated according to the type spread evenly across the play duration.'
                        },

                        {
                            name: 'Fast',
                            snippet: 'fast',
                            longDescription:
                                'No additional text is shown. The audio is generated according to the type spread evenly across the fixed duration set via settings.player.songBookBendDuration.'
                        }
                    ]
                ]
            ])
        },
        {
            name: 'offset',
            shortDescription: 'The offset at which the value becomes valid',
            type: '`number` (repeated) (0-60)',
            required: true
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
