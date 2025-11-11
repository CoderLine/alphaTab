import type { MetadataDoc } from '../types';

export const album: MetadataDoc = {
    tag: '\\album',
    syntax: ['\\album value', '\\album (value template textAlign)'],
    snippet: '\\album "$1"$0',
    description: `Sets the album of the song in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The album of the song',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: 'The text template used to render the album',
            type: '`string`',
            required: false
        },
        {
            name: 'textAlign',
            description: 'The text alignment of the text to display on the music sheet',
            type: '`left`, `center` or `right`',
            required: false
        }
    ],
    example: `
        \\title ("Song Title" "Title: %TITLE%" left)
        \\album "alphaTab vol.1"
        C4
        `
};
