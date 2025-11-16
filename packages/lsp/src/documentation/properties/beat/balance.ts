import type { PropertyDoc } from '@src/documentation/types';

export const balance: PropertyDoc = {
    property: 'balance',
    syntax: ['balance value'],
    snippet: 'balance $1$0',
    shortDescription: 'Balance Change',
    longDescription: `
    Add a balance (pan) change to the beat.

    The change affects all beats after this one.
    `,
    values: [
        {
            name: 'value',
            shortDescription: 'The new balance',
            type: '`number` (0-16 8 is centered)',
            required: true
        }
    ],
    examples: `
        C4 {balance 0} D4 E4 {balance 16} F4
        `
};
