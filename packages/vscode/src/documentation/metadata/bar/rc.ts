import type { MetadataDoc } from '../../types';

export const rc: MetadataDoc = {
    tag: '\\rc',
    syntax: ['\\rc repeats'],
    snippet: '\\rc ${1:2} $0',
    shortDescription: 'End a repeat ',
    longDescription: `Marks the end of a repeat.`,
    values: [
        {
            name: 'repeats',
            shortDescription: 'The number of repeats which should be played',
            type: '`number`',
            required: true
        }
    ],
    examples: `
        \\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 |
        \\ro \\rc 3 1.3 2.3 3.3 4.3
        `
};
