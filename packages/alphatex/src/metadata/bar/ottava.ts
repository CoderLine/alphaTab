import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';

export const ottava: MetadataTagDefinition = {
    tag: '\\ottava',
    snippet: '\\ottava $1 $0',
    shortDescription: 'Set the clef ottava.',
    longDescription: `Changes the clef ottave for this and subsequent bars.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'ottava',
                    shortDescription: 'The clef ottava',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('Ottavia')
                }
            ]
        }
    ],
    examples: `
        \\clef F4 \\ottava 15ma | | \\ottava regular | | \\clef C3 \\ottava 8vb | |
        `
};
