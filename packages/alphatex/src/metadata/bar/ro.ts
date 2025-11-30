import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const ro: MetadataTagDefinition = {
    tag: '\\ro',
    snippet: '\\ro $0',
    shortDescription: 'Start a repeat',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 |
        \\ro \\rc 3 1.3 2.3 3.3 4.3
        `
};
