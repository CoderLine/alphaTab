import type { MetadataDoc } from '../../types';

export const systemsLayout: MetadataDoc = {
    tag: '\\systemsLayout',
    syntax: ['\\systemsLayout (system1Bars system2Bars...)'],
    snippet: '\\systemsLayout (${1:3})$0',
    shortDescription: 'Set the number of bars for every system.',
    longDescription: `
    Defines the number of bars to display per system when rendering multiple tracks.

    The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://next.alphatab.net/docs/reference/settings/display/systemslayoutmode).
    `,
    values: [
        {
            name: 'numberOfBars',
            shortDescription: 'Defines for every system (line) the number of bars it should contain',
            type: '`number` (repeated)',
            required: true,
            isList: true
        }
    ],
    examples: {
        options: { display: { systemsLayoutMode: 'UseModelLayout' } },
        tex: `
        \\systemsLayout (2 3 2)
        \\track 
            :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
        \\track 
            :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
        `
    }
};
