import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const defaultBarNumberDisplay: MetadataTagDefinition = {
    tag: '\\defaultBarNumberDisplay',
    snippet: '\\defaultBarNumberDisplay ${1:allBars}$0',
    shortDescription: 'Sets the display mode for bar numbers on all bars.',
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
            \\defaultBarNumberDisplay allBars
            \\title "All Bars"
                \\track { defaultsystemslayout 3 }
                C4.1 | C4.1 | C4.1 |
                C4.1 | C4.1 | C4.1 
            `
        },
        {
            options: { display: { layoutMode: 'Parchment' } },
            tex: `
            \\defaultBarNumberDisplay firstOfSystem
            \\title "First of System"
                \\track { defaultsystemslayout 3 }
                C4.1 | C4.1 | C4.1 |
                C4.1 | C4.1 | C4.1 
            `
        },
        {
            options: { display: { layoutMode: 'Parchment' } },
            tex: `
            \\defaultBarNumberDisplay hide
            \\title "Hide"
                \\track { defaultsystemslayout 3 }
                C4.1 | C4.1 | C4.1 |
                C4.1 | C4.1 | C4.1 
            `
        }
    ]
};
