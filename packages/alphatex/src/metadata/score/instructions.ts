import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const instructions: MetadataTagDefinition = {
    tag: '\\instructions',
    snippet: '\\instructions "$1"$0',
    shortDescription: `Sets additional textual instructions for the song (not displayed).`,
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
        \\instructions "Practice this piece until you get it perfect."
        C4
        `
};
