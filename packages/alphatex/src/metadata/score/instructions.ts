import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
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
                    type: AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        \\instructions "Practice this piece until you get it perfect."
        C4
        `
};
