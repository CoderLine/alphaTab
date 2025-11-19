import type { MetadataDoc } from '@coderline/alphatab-language-server/documentation/types';

export const album: MetadataDoc = {
    tag: '\\album',
    syntax: ['\\album value', '\\album (value template textAlign)'],
    snippet: '\\album "$1"$0',
    shortDescription: `Set the album of the song.`,
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
        \\album "alphaTab vol.1"
        C4
        `
};
