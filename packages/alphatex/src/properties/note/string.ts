import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const string: PropertyDefinition = {
    property: 'string',
    snippet: 'string',
    shortDescription: 'Show String Number',
    longDescription: 'Adds an annotation showing the string number of the note above the staff.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{string} 3.4{string} 3.5{string}
        `
};
