import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const ds: PropertyDoc = {
    property: 'ds',
    syntax: ['ds'],
    snippet: 'ds',
    shortDescription: 'Dead-Slap',
    longDescription: `
    Marks the beat to be a dead-slap beat.

    As no notes should be on such a beat, simply use () to indicate the empty beat which is not a rest.
    `,
    values: [],
    examples: 
        `
        ().4 {ds} ().4 {ds}
        `
};
