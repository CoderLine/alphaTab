import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const width: MetadataTagDefinition = {
    tag: '\\width',
    snippet: '\\width $1 $0',
    shortDescription: 'Adjusts the absolute of the bar',
    longDescription: `Adjusts the absolute of the bar when using \`systemsLayoutMode: 'UseModelLayout'\` with the horizontal layout.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'width',
                    shortDescription: 'The absolute width of the bar',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsFloat
                }
            ]
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
