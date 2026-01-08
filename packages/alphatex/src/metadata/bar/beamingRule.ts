import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const beaming: MetadataTagDefinition = {
    tag: '\\beaming',
    snippet: '\\beaming ($1 $2) $0',
    shortDescription: 'Set the time signature',
    // TODO: longer description on how to define beams
    longDescription: `
    Defines a custom beaming rule defining how beams of certain durations should be beamed.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'duration',
                    shortDescription: 'The note duration defining the smallest group size',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                },
                {
                    name: 'groups',
                    shortDescription: 'For every group the number of notes contained in the group.',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.ValueListWithoutParenthesis,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                }
            ]
        }
    ],

    examples: `
        \\ts (4 4)
        \\beaming (8 4 2 2)
        C4.8 * 8 |

        \\ts (4 4)
        \\beaming (8 4 4)
        C4.8 * 8
        `
};
