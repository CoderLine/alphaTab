import type { MetadataDoc } from '../../types';

export const music: MetadataDoc = {
    tag: '\\music',
    syntax: ['\\music value', '\\music (value template textAlign)'],
    snippet: '\\music "$1"$0',
    shortDescription: `Set the music author of the song.`,
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
        \\music "CoderLine and Contributors"
        C4
        `
};
