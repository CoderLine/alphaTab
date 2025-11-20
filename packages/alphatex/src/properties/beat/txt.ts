import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const txt: PropertyDefinition = {
    property: 'txt',
    snippet: 'txt "$1"$0',
    shortDescription: 'Text',
    longDescription: `Adds a text annotation to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'text',
                    shortDescription: 'The text to show above the beat',
                    type: AlphaTexNodeType.String,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        C4 {txt "This is a C4 Note"}
        `
};
