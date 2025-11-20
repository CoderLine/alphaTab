import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const noteVibrato: PropertyDefinition = {
    property: 'v',
    snippet: 'v',
    shortDescription: 'Slight Vibrato',
    longDescription: 'Adds a slight vibrato effect to the note.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{v}
        `
};
