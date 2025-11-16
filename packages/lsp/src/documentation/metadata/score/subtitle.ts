import type { MetadataDoc } from '@src/documentation/types';

export const subtitle: MetadataDoc = {
    tag: '\\subtitle',
    syntax: ['\\subtitle value', '\\subtitle (value template textAlign)'],
    snippet: '\\subtitle "$1"$0',
    shortDescription: `Set the subtitle of the song.`,
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
        \\subtitle ("Subtitle" "[%SUBTITLE%]" left)
        C4
        `
};
