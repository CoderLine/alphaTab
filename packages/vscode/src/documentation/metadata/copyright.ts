import type { MetadataDoc } from '../types';

export const copyright: MetadataDoc = {
    tag: '\\copyright',
    syntax: ['\\copyright value', '\\copyright (value template textAlign)'],
    snippet: '\\copyright "$1"$0',
    description: `Sets owner of the copyright of the song in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The owner of the copyright of the song',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: '	The text template used to render the item',
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
        \\copyright "CoderLine"
        C4
        `
};
