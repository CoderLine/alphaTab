import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const ro: MetadataDoc = {
    tag: '\\ro',
    syntax: ['\\ro'],
    snippet: '\\ro $0',
    shortDescription: 'Start a repeat',
    values: [],
    examples: `
        \\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 |
        \\ro \\rc 3 1.3 2.3 3.3 4.3
        `
};
