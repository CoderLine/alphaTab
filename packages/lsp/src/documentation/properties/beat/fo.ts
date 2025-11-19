import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const fo: PropertyDoc = {
    property: 'fo',
    syntax: ['fo'],
    snippet: 'fo',
    shortDescription: 'Fade-Out',
    longDescription: 'Adds a fade-out effect to the beat. Applies to all notes.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).1 { fo }
        `
};
