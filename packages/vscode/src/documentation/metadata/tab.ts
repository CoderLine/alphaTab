import type { MetadataDoc } from '../types';

export const tab: MetadataDoc = {
    tag: '\\tab',
    syntax: ['\\tab value', '\\tab (value template textAlign)'],
    snippet: '\\tab "$1"$0',
    description: `Sets the transcriber of the music sheet in the data model.`,
    values: [
        {
            name: 'value',
            description: 'The transcriber of the music sheet.',
            type: '`string`',
            required: true
        },
        {
            name: 'template',
            description: 'The text template used to render the transcriber',
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
        \\tab "Transcribed by me"
        C4
        `
};
