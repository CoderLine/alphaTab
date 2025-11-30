import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const noteVibratoWide: PropertyDefinition = {
    property: 'vw',
    snippet: 'vw',
    shortDescription: 'Wide Vibrato',
    longDescription: 'Adds a wide vibrato effect to the note.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: 
        `
        3.3{vw}
        `
};
