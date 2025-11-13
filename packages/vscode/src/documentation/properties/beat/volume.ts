import type { PropertyDoc } from '../../types';

export const volume: PropertyDoc = {
    property: 'volume',
    syntax: ['volume value'],
    snippet: 'volume $1$0',
    shortDescription: 'Volume Change',
    longDescription: `
    Add a volume change to the beat.

    The change affects all beats after this one.
    `,
    values: [
        {
            name: 'value',
            shortDescription: 'The new volume',
            type: '`number` (0-16)',
            required: true
        }
    ],
    examples: `
        C4 {volume 8} D4 E4 {tempo 16} F4
        `
};
