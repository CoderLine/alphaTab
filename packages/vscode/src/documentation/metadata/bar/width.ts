import type { MetadataDoc } from '../../types';

export const width: MetadataDoc = {
    tag: '\\width',
    syntax: ['\\width width'],
    snippet: '\\width $1 $0',
    shortDescription: 'Adjusts the absolute of the bar',
    longDescription: `Adjusts the absolute of the bar when using \`systemsLayoutMode: 'UseModelLayout'\` with the horizontal layout.`,
    values: [
        {
            name: 'width',
            shortDescription: 'The absolute width of the bar',
            type: '`number`',
            required: true
        }
    ],
    examples: {
        options: { display: { layoutMode: 'Horizontal', systemsLayoutMode: 'UseModelLayout' } },
        tex: `
        \\track
            \\width 100 :1 c4 | \\width 300 c4 | \\width 350 c4
        `
    }
};
