import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const slur: PropertyDefinition = {
    property: 'slur',
    snippet: 'slur $1$0',
    shortDescription: 'Slur',
    longDescription: `Marks the start or end of a slur for the note.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'id',
                    shortDescription: 'A unique ID to mark the start and end of the slur.',
                    type: AlphaTexNodeType.String,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'id',
                    shortDescription: 'A unique ID to mark the start and end of the slur.',
                    type: AlphaTexNodeType.Ident,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        (3.3 {slur s1} 4.4).4 7.3.8 8.3.8 10.3 {slur s1} .8
        `
};
