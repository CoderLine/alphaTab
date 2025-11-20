import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const dec: PropertyDefinition = {
    property: 'dec',
    snippet: 'dec',
    shortDescription: 'Decrescendo',
    longDescription: 'Adds a decrescendo (diminuendo) effect to the beat.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3 { dec } -.3 { dec }
        `
};
