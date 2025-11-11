import type { MetadataDoc } from '../types';

export const title: MetadataDoc = {
    tag: '\\title',
    syntax: ['\\title value', '\\title (value template textAlign)'],
    snippet: '\\title "$1"$0',
    description: `Sets the title of the song in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The title of the song',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: '	The text template used to render the title',
            type: '`string`',
            required: false
        },
        {
            name: 'textAlign',
            description: 'The text alignment of the text to display on the music sheet	',
            type: '`left`, `center` or `right`',
            required: false
        }
    ],
    example: `
        \\title ("Song Title" "Title: %TITLE%" left)
        C4
        `
};
