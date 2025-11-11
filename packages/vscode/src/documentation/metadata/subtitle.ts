import type { MetadataDoc } from '../types';

export const subtitle: MetadataDoc = {
    tag: '\\subtitle',
    syntax: ['\\subtitle value', '\\subtitle (value template textAlign)'],
    snippet: '\\subtitle "$1"$0',
    description: `Sets the subtitle of the song in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The subtitle of the song',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: '	The text template used to render the subtitle',
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
        \\subtitle ("Subtitle" "[%SUBTITLE%]" left)
        C4
        `
};
