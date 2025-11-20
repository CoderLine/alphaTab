import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const transpose: MetadataTagDefinition = {
    tag: '\\transpose',
    snippet: '\\transpose $1$0',
    shortDescription: 'Set the transpose for the standard notation.',
    longDescription: `
    Defines the number of semitones by which the standard notation should be transposed.

    This affects the display and audio.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'semitones',
                    shortDescription: 'The number of semitones by which the notes should be transposed',
                    type: AlphaTexNodeType.Number,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        \\track \\staff \\instrument piano
        \\transpose -12
            C4.4 D4 E4 F4 | r.1
        `
};
