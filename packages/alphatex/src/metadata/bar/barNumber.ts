import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const barNumber: MetadataTagDefinition = {
    tag: '\\barNumber',
    snippet: '\\barNumber ${1:1}$0',
    shortDescription: 'Sets the bar number display.',
    signatures: [
        {
            parameters: [
                {
                    name: 'text',
                    shortDescription: 'THe custom text shown instead of the number',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    allowAllStringTypes: true
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'number',
                    shortDescription: 'The new number (affects subsequent counting)',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    allowAllStringTypes: true
                }
            ]
        }
    ],
    examples: [
        {
            tex: `
                // anacrusis (no number)
                \\ac 
                    C4.1 
                | 
                // standard bar number 1
                    C4 
                | 
                // custom text instead of bar number 2
                \\barNumber "Hello" 
                    C4
                |
                // a jump to 10 
                \\barNumber 10
                    C4
                |
                // now becomes 11 after the customization before
                    C4
            `
        }
    ]
};
