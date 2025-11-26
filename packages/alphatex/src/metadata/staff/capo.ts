import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const capo: MetadataTagDefinition = {
    tag: '\\capo',
    snippet: '\\capo {$1}$0',
    shortDescription: 'Set the capo fret',
    longDescription: `Defines the fret on which a capo should be placed.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'fret',
                    shortDescription: 'The fret on which a capo is placed',
                    type: AlphaTexNodeType.Number,
                    parseMode: ArgumentListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        \\track "Guitar"
        \\staff{tabs} 
        \\capo 5
        1.2 3.2 0.1 1.1
        `
};
