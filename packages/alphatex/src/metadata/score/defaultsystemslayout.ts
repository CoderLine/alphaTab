import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const defaultSystemsLayout: MetadataTagDefinition = {
    tag: '\\defaultSystemsLayout',
    snippet: '\\defaultSystemsLayout ${1:3}$0',
    shortDescription: 'Set the default number of bars per system.',
    longDescription: `
    Defines the default number of bars to display per system when rendering multiple tracks.

    The \`systemsLayout\` and \`defaultSystemsLayout\` allow configuring the system layout. The system layout, defines how many bars should be displayed per system (line) if enabled via [\`systemsLayoutMode\`](https://alphatab.net/docs/reference/settings/display/systemslayoutmode).
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'numberOfBars',
                    shortDescription: 'The number of bars the system should contain.',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                }
            ]
        }
    ],
    examples: {
        options: { display: { systemsLayoutMode: 'UseModelLayout' } },
        tex: `
        \\defaultSystemsLayout 2
        \\track 
            :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
        \\track 
            :1 c4 | c4 | c4 | c4 | c4 | c4 | c4
        `
    }
};
