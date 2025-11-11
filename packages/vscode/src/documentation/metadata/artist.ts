import type { MetadataDoc } from '../types';

export const artist: MetadataDoc = {
    tag: '\\artist',
    syntax: ['\\artist value', '\\artist (value template textAlign)'],
    snippet: '\\artist "$1"$0',
    description: `Sets the artist of the song in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The artist of the song',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: 'The text template used to render the artist',
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
        \\artist "alphaTab"
                C4
        `
};
