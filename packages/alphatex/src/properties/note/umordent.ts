import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const umordent: PropertyDefinition = {
    property: 'umordent',
    snippet: 'umordent',
    shortDescription: 'Upper Mordent Ornament',
    longDescription: 'Applies an upper mordent ornament to the note.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :1 C4{umordent} |
        `
};
