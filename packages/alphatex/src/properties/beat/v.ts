import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const v: PropertyDefinition = {
    property: 'v',
    snippet: 'v',
    shortDescription: 'Slight Vibrato',
    longDescription: 'Adds a slight vibrato effect to the beat. Applies to all notes.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).1 { v }
        `
};
