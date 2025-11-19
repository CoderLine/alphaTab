import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const ts: MetadataDoc = {
    tag: '\\ts',
    syntax: ['\\ts common', '\\ts (numerator denominator)'],
    snippet: '\\ts ($1 $2) $0',
    shortDescription: 'Set the time signature',
    longDescription: `
    Defines the time signature for this and subsequent bars.

    AlphaTab does not yet support polytempo notation where instruments might use different time signatures. Therefore be sure to only specify the timesignatures once as part of the first track/staff or ensure they are consistent across the whole document.
    `,
    values: [
        {
            name: 'common',
            shortDescription: 'Specifies a common (4/4) time signature using the special C symbol',
            type: '`identifier`',
            required: true
        },
        {
            name: 'numerator',
            shortDescription: 'The time signature numerator',
            type: '`number`',
            required: true
        },
        {
            name: 'numerator',
            shortDescription: 'The time signature denominator',
            type: '`number`',
            required: true
        }
    ],
    examples: `
        \\ts 3 4 | \\ts 4 4 | \\ts 6 8 | \\ts common
        `
};
