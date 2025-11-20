import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const slashed: PropertyDefinition = {
    property: 'slashed',
    snippet: 'slashed',
    shortDescription: 'Slash Notation',
    longDescription: 'Marks the beat to be displayed with slash notation.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).2  (0.1 2.2 2.3 2.4 0.5).2 { slashed }
        `
};
