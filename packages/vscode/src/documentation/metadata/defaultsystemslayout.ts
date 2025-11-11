import type { MetadataDoc } from '../types';

export const defaultSystemsLayout: MetadataDoc = {
    tag: '\\defaultSystemsLayout',
    syntax: ['\\defaultSystemsLayout numberOfBars'],
    snippet: '\\defaultSystemsLayout ${1:3}$0',
    description: `
    Defines the default number of bars to display per system when rendering multiple tracks.

    The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net/docs/reference/settings/display/systemslayoutmode).
    `,
    values: [
        {
            name: 'numberOfBars',
            description: 'Defines for every system (line) the number of bars it should contain',
            type: '`number` (repeated)',
            required: true
        }
    ],
    example: `
        \\defaultSystemsLayout 2
        \\track 
            :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
        \\track 
            :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
        `
};
