import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const notices: MetadataTagDefinition = {
    tag: '\\notices',
    snippet: '\\notices "$1"$0',
    shortDescription: `Sets general notices for the song (not displayed).`,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The value to set',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        \\notices "I hope you appreciate this music sheet, it was a lot of effort to create!"
        C4
        `
};
