import type { MetadataDoc } from '@coderline/alphatab-lsp/documentation/types';

export const tempo: MetadataDoc = {
    tag: '\\tempo',
    syntax: ['\\tempo tempo', '\\tempo (tempo label position hide)'],
    snippet: '\\tempo $1 $0',
    shortDescription: 'Add a tempo change to the bar.',
    longDescription: `
        Adds a tempo change to the bar.

        A bar can have multiple tempo changes. They can either be relatively positioned using this metadata tag or applied via the \`tempo\` property as beat effect.

        Tempo changes affect the whole song and not only an individual track. To avoid unexpected side effects, we recomment to specify the tempo changes only once on the first track/staff.
    `,
    values: [
        {
            name: 'tempo',
            shortDescription: 'The new tempo in BPM',
            type: '`number`',
            required: true
        },
        {
            name: 'label',
            shortDescription: 'A textual label for the tempo',
            type: '`string`',
            required: false
        },
        {
            name: 'position',
            shortDescription: 'A relative (ratio) position where within the bar the tempo change should happen',
            type: '`number` (float, 0-1)',
            required: false
        },
        {
            name: 'hide',
            shortDescription: 'If specified the tempo change is not visually shown',
            type: '`identifier`',
            required: false
        }
    ],
    examples: `
        \\tempo 30
        C4 D4 E4 F4 |
        \\tempo (120 "Moderate")
        \\tempo (60 "" 0.5 hide)
        C4 D4 E4 F4 |
        `
};
