import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const instructions: MetadataDoc = {
    tag: '\\instructions',
    syntax: ['\\instructions value'],
    snippet: '\\instructions "$1"$0',
    shortDescription: `Sets additional textual instructions for the song (not displayed).`,
    values: [
        {
            name: 'value',
            shortDescription: 'The value to set',
            type: '`string`',
            required: true
        }
    ],
    examples: `
        \\instructions "Practice this piece until you get it perfect."
        C4
        `
};
