import type { PropertyDoc } from '../../types';

export const slur: PropertyDoc = {
    property: 'slur',
    syntax: ['slur id'],
    snippet: 'slur $1$0',
    shortDescription: 'Slur',
    longDescription: `Marks the start or end of a slur for the note.`,
    values: [
        {
            name: 'id',
            shortDescription: 'A unique ID to mark the start and end of the slur.',
            type: '`string` or `identifier`',
            required: true
        }
    ],
    examples: `
        (3.3 {slur s1} 4.4).4 7.3.8 8.3.8 10.3 {slur s1} .8
        `
};
