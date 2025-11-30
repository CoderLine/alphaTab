import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const fo: PropertyDefinition = {
    property: 'fo',
    snippet: 'fo',
    shortDescription: 'Fade-Out',
    longDescription: 'Adds a fade-out effect to the beat. Applies to all notes.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).1 { fo }
        `
};
