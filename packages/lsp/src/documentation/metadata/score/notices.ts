import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const notices: MetadataDoc = {
    tag: '\\notices',
    syntax: ['\\notices value'],
    snippet: '\\notices "$1"$0',
    shortDescription: `Sets general notices for the song (not displayed).`,
    values: [
        {
            name: 'value',
            shortDescription: 'The value to set',
            type: '`string`',
            required: true
        }    ],
    examples: `
        \\notices "I hope you appreciate this music sheet, it was a lot of effort to create!"
        C4
        `
};
