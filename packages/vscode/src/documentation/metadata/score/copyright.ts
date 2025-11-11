import type { MetadataDoc } from '../../types';

export const copyright: MetadataDoc = {
    tag: '\\copyright',
    syntax: ['\\copyright value', '\\copyright (value template textAlign)'],
    snippet: '\\copyright "$1"$0',
    shortDescription: `Set the copyright owner of the song.`,
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
        \\copyright "CoderLine"
        C4
        `
};
