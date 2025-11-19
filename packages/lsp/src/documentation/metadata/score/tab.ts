import type { MetadataDoc } from '@coderline/alphatab-language-server/documentation/types';

export const tab: MetadataDoc = {
    tag: '\\tab',
    syntax: ['\\tab value', '\\tab (value template textAlign)'],
    snippet: '\\tab "$1"$0',
    shortDescription: `Set the transcriber of the music sheet.`,
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
        \\tab "Transcribed by me"
        C4
        `
};
