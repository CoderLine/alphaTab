import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const tf: MetadataTagDefinition = {
    tag: '\\tf',
    snippet: '\\tf $1 $0',
    shortDescription: 'Set the triplet feel (swing)',
    longDescription: `Changes the triplet feel (aka. swing) play style.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'tripletFeel',
                    shortDescription: 'The triplet feel style',
                    parseMode: ArgumentListParseTypesMode.Required,
                    ...enumParameter('TripletFeel')
                }
            ]
        }
    ],
    examples: `
        \\tf none 3.3*4 |
        \\tf triplet16th 3.3*4 | \\tf triplet8th 3.3*4 |
        \\tf dotted16th 3.3*4 | \\tf dotted8th 3.3*4 |
        \\tf scottish16th 3.3*4 | \\tf scottish8th 3.3*4 |
        `
};
