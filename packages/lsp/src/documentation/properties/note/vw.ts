import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const noteVibratoWide: PropertyDoc = {
    property: 'vw',
    syntax: ['vw'],
    snippet: 'vw',
    shortDescription: 'Wide Vibrato',
    longDescription: 'Adds a wide vibrato effect to the note.',
    values: [],
    examples: 
        `
        3.3{vw}
        `
};
