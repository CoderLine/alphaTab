import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const txt: PropertyDoc = {
    property: 'txt',
    syntax: ['txt text'],
    snippet: 'txt "$1"$0',
    shortDescription: 'Text',
    longDescription: `Adds a text annotation to the beat.`,
    values: [
        {
            name: 'text',
            shortDescription: 'The text to show above the beat',
            type: '`string`',
            required: true
        }
    ],
    examples: `
        C4 {txt "This is a C4 Note"}
        `
};
