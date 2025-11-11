import type { MetadataDoc } from '../../types';

export const scale: MetadataDoc = {
    tag: '\\scale',
    syntax: ['\\scale scale'],
    snippet: '\\scale $1 $0',
    shortDescription: 'Adjusts the relative scale of the bar',
    longDescription: `Adjusts the relative scale of the bar when using \`systemsLayoutMode: 'UseModelLayout'\` with the page layout.`,
    values: [
        {
            name: 'scale',
            shortDescription: 'The scale of the bar within the system',
            type: '`number` (float)',
            required: true
        }
    ],
    examples: {
        options: { display: {systemsLayoutMode: 'UseModelLayout'} },
        tex: `
        \\track { defaultSystemsLayout 3 }
          \\scale 0.25 :1 c4 | \\scale 0.5 c4 | \\scale 0.25 c4 | 
          \\scale 0.5 c4 | \\scale 2 c4 | \\scale 0.5 c4 |
          c4 | c4
        `
    }
};
