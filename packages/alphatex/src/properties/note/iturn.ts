import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const iturn: PropertyDefinition = {
    property: 'iturn',
    snippet: 'iturn',
    shortDescription: 'Inverted Turn Ornament',
    longDescription: 'Applies an inverted turn ornament to the note.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :1 C4{iturn} |
        `
};
