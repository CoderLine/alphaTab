import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

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
                    type: AlphaTexNodeType.String,
                    allowAllStringTypes: true,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        \\notices "I hope you appreciate this music sheet, it was a lot of effort to create!"
        C4
        `
};
