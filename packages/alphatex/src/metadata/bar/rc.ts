import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const rc: MetadataTagDefinition = {
    tag: '\\rc',
    snippet: '\\rc ${1:2} $0',
    shortDescription: 'End a repeat ',
    longDescription: `Marks the end of a repeat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'repeats',
                    shortDescription: 'The number of repeats which should be played',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        \\ro 1.3 2.3 3.3 4.3 | 5.3 6.3 7.3 8.3 | \\rc 2 1.3 2.3 3.3 4.3 |
        \\ro \\rc 3 1.3 2.3 3.3 4.3
        `
};
