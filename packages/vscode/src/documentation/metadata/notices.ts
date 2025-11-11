import type { MetadataDoc } from '../types';

export const notices: MetadataDoc = {
    tag: '\\notices',
    syntax: ['\\notices value'],
    snippet: '\\notices "$1"$0',
    description: `Sets the general notices attached to the music sheet (not displayed).`,
    values: [
        {
            name: 'value',
            description: 'The general notices attached to the song.',
            type: '`string`',
            required: true
        }
    ],
    example: `
        \\notices "I hope you appreciate this music sheet, it was a lot of effort to create!"
        C4
        `
};
