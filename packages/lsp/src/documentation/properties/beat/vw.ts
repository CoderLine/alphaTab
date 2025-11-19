import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const vw: PropertyDoc = {
    property: 'vw',
    syntax: ['vw'],
    snippet: 'vw',
    shortDescription: 'Wide Vibrato',
    longDescription: 'Adds a wide vibrato effect to the beat. Applies to all notes.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).1 { vw }
        `
};
