import type { MetadataDoc } from '@coderline/alphatab-language-server/documentation/types';

export const ae: MetadataDoc = {
    tag: '\\ae',
    syntax: ['\\ae ending', '\\ae (ending ending ...)'],
    snippet: '\\ae $1 $0',
    shortDescription: 'Specify the alternate ending repeats.',
    longDescription: `Specifies on which repeats a bar should be played (to build alternate endings).`,
    values: [
        {
            name: 'ending',
            shortDescription: 'The repeats on which the bar should be played',
            type: '`number` list',
            required: true
        }
    ],
    examples: `
        \\ro 1.3 2.3 3.3 4.3 | \\ae (1 2 3) 5.3 6.3 7.3 8.3 | \\ae 4 \rc 4 5.3 8.3 7.3 6.3
        `
};
