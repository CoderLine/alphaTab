import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const clef: MetadataTagDefinition = {
    tag: '\\clef',
    snippet: '\\clef $1 $0',
    shortDescription: 'Set the clef.',
    longDescription: `Changes the clef for this and subsequent bars.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'clef',
                    shortDescription: 'The clef',
                    parseMode: ArgumentListParseTypesMode.Required,
                    ...enumParameter('Clef')
                }
            ]
        }
    ],
    examples: `
        \\clef G2 | \\clef F4 | \\clef C3 | \\clef C4 | \\clef N |
        \\clef Treble | \\clef Bass | \\clef Tenor | \\clef Alto | \\clef Neutral |
        `
};
