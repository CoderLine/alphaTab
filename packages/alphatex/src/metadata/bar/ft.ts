import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const ft: MetadataTagDefinition = {
    tag: '\\ft',
    snippet: '\\ft $0',
    shortDescription: 'Marks the bar as a free-time bar',
    longDescription: `
    Marks the bar as a free-time bar where players are free to vary the timing.
    `,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :2 
        C4*2 |
        \\ft C4*2 |
        \\ft C4*2 |
        C4*2 |
        `
};
