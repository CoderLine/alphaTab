import type { MetadataDoc } from '../types';

export const instructions: MetadataDoc = {
    tag: '\\instructions',
    syntax: ['\\instructions value'],
    snippet: '\\instructions "$1"$0',
    description: `Sets the additional textual instructions attached to the music sheet (not displayed).`,
    values: [
        {
            name: 'value',
            description: 'The textual instructions of the song',
            type: '`string`',
            required: true
        }
    ],
    example: `
        \\instructions "Practice this piece until you get it perfect."
        C4
        `
};
