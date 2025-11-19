import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const ft: MetadataDoc = {
    tag: '\\ft',
    syntax: ['\\ft'],
    snippet: '\\ft $0',
    shortDescription: 'Marks the bar as a free-time bar',
    longDescription:
    `
    Marks the bar as a free-time bar where players are free to vary the timing.
    `,
    values: [],
    examples: `
        :2 
        C4*2 |
        \\ft C4*2 |
        \\ft C4*2 |
        C4*2 |
        `
};
