import type { MetadataDoc } from '../types';

export const words: MetadataDoc = {
    tag: '\\words',
    syntax: ['\\words value', '\\words (value template textAlign)'],
    snippet: '\\words "$1"$0',
    description: `Sets the words/lyrics author of the song in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The words/lyrics author of the song',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: 'The text template used to render the words/lyrics author',
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
        \\words "CoderLine"
        C4
        `
};
