import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const dec: PropertyDoc = {
    property: 'dec',
    syntax: ['dec'],
    snippet: 'dec',
    shortDescription: 'Decrescendo',
    longDescription: 'Adds a decrescendo (diminuendo) effect to the beat.',
    values: [],
    examples: 
        `
        3.3 { dec } -.3 { dec }
        `
};
