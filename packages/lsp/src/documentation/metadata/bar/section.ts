import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const section: MetadataDoc = {
    tag: '\\section',
    syntax: ['\\section text', '\\section (marker text)'],
    snippet: '\\section "$1" $0',
    shortDescription: 'Starts a new section',
    values: [
        {
            name: 'marker',
            shortDescription: 'The marker for the section, typically a single letter',
            type: '`string`',
            required: false
        },
        {
            name: 'text',
            shortDescription: 'The text/description of the new section',
            type: '`string`',
            required: true
        }
    ],
    examples: `
        \\section "Intro" // simple section
        1.1 1.1 1.1 1.1 | 1.1 1.1 1.1 1.1 |
        \\section "S" "Solo" // with marker and section name differently
        1.1 1.1 1.1 1.1
        `
};
