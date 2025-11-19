import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const f: PropertyDoc = {
    property: 'f',
    syntax: ['f'],
    snippet: 'f',
    shortDescription: 'Fade-In',
    longDescription: 'Adds a fade-in effect to the beat. Applies to all notes.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).2 { f }
        `
};
