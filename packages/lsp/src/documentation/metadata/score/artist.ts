import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const artist: MetadataDoc = {
    tag: '\\artist',
    syntax: ['\\artist value', '\\artist (value template textAlign)'],
    snippet: '\\artist "$1"$0',
    shortDescription: `Set the artist of the song.`,
    values: [
        {
            name: 'value',
            shortDescription: 'The value to set',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            shortDescription: 'The template used to render the text',
            type: '`string`',
            required: false
        },
        {
            name: 'textAlign',
            shortDescription: 'The alignment of the text on the music sheet',
            type: '`left`, `center` or `right`',
            required: false
        }
    ],
    examples: `
        \\title ("Song Title" "Title: %TITLE%" left)
        \\artist "alphaTab"
            C4
        `
};
