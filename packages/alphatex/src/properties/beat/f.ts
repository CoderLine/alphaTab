import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const f: PropertyDefinition = {
    property: 'f',
    snippet: 'f',
    shortDescription: 'Fade-In',
    longDescription: 'Adds a fade-in effect to the beat. Applies to all notes.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).2 { f }
        `
};
