import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const vs: PropertyDoc = {
    property: 'vs',
    syntax: ['vs'],
    snippet: 'vs',
    shortDescription: 'Volume-Swell',
    longDescription: 'Adds a volume-swell effect to the beat. Applies to all notes.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).1 { vs }
        `
};
