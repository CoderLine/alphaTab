import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const barNumberDisplay: MetadataTagDefinition = {
    tag: '\\barNumberDisplay',
    snippet: '\\barNumberDisplay ${1:allBars}$0',
    shortDescription: 'Sets the display mode for bar numbers.',
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode to use',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    ...enumParameter('BarNumberDisplay')
                }
            ]
        }
    ],
    examples: [
        {
            options: { display: { layoutMode: 'Parchment' } },
            tex: `
            \\defaultBarNumberDisplay hide
            \\track { defaultsystemslayout 3 }
                C4.1 | \\barNumberDisplay allBars C4.1 | C4.1 |
                \\barNumberDisplay firstOfSystem C4.1 | \\barNumberDisplay firstOfSystem C4.1 | C4.1 
            `
        },
        {
            options: { display: { layoutMode: 'Parchment' } },
            tex: `
            \\defaultBarNumberDisplay firstOfSystem
            \\track { defaultsystemslayout 3 }
                C4.1 | \\barNumberDisplay allBars C4.1 | C4.1 |
                \\barNumberDisplay hide C4.1 | C4.1 | C4.1 
            `
        }
    ]
};
