import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const slashed: PropertyDoc = {
    property: 'slashed',
    syntax: ['slashed'],
    snippet: 'slashed',
    shortDescription: 'Slash Notation',
    longDescription: 'Marks the beat to be displayed with slash notation.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).2  (0.1 2.2 2.3 2.4 0.5).2 { slashed }
        `
};
