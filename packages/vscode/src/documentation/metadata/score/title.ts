import type { MetadataDoc } from '../../types';

export const title: MetadataDoc = {
    tag: '\\title',
    syntax: ['\\title value', '\\title (value template textAlign)'],
    snippet: '\\title "$1"$0',
    shortDescription: `Set the title of the song.`,
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
        C4
        `
};
