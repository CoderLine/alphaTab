import type { MetadataDoc } from '../types';

export const music: MetadataDoc = {
    tag: '\\music',
    syntax: ['\\music value', '\\music (value template textAlign)'],
    snippet: '\\music "$1"$0',
    description: `Sets the music author of the song in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The music author of the song	',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: 'The text template used to render the music author',
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
        \\music "CoderLine and Contributors"
        C4
        `
};
