import type { MetadataDoc } from '../../types';

export const words: MetadataDoc = {
    tag: '\\words',
    syntax: ['\\words value', '\\words (value template textAlign)'],
    snippet: '\\words "$1"$0',
    shortDescription: `Set the lyrics author of the song.`,
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
        \\words "CoderLine"
        C4
        `
};
