import type { PropertyDoc } from '@src/documentation/types';

export const v: PropertyDoc = {
    property: 'v',
    syntax: ['v'],
    snippet: 'v',
    shortDescription: 'Slight Vibrato',
    longDescription: 'Adds a slight vibrato effect to the beat. Applies to all notes.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).1 { v }
        `
};
