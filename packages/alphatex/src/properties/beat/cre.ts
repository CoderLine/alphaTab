import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const cre: PropertyDefinition = {
    property: 'cre',
    snippet: 'cre',
    shortDescription: 'Crescendo',
    longDescription: 'Adds a crescendo effect to the beat.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3 { cre } -.3 { cre }
        `
};
