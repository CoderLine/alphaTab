import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const lmordent: PropertyDefinition = {
    property: 'lmordent',
    snippet: 'lmordent',
    shortDescription: 'Lower Mordent Ornament',
    longDescription: 'Applies an lower mordent ornament to the note.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :1 C4{lmordent} |
        `
};
