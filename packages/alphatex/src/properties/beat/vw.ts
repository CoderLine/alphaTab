import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const vw: PropertyDefinition = {
    property: 'vw',
    snippet: 'vw',
    shortDescription: 'Wide Vibrato',
    longDescription: 'Adds a wide vibrato effect to the beat. Applies to all notes.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).1 { vw }
        `
};
