import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const beaming: MetadataTagDefinition = {
    tag: '\\beaming',
    snippet: '\\beaming ($1 $2) $0',
    shortDescription: 'Set the time signature',
    longDescription: `
    Defines a custom beaming rule defining how beams of certain durations should be beamed.

    To define how beats should be beamed we need 2 parts:

    1. A duration with which we splitup the bars
    2. A list of group sizes defining how many split-parts should be beamed together. 

    The beaming rules go hand-in-hand with the time signature as the rules need to properly
    define the groups for the whole beat. 

    Let's take a simple example of a 4/4 time signature. If we want to ensure that the beats within the quarter notes are 
    beamed together we can write variants like this:

    a. \`\\beaming (4 1 1 1 1)\`
    b. \`\\beaming (8 2 2 2 2)\`
    c. \`\\beaming (16 4 4 4 4)\`

    We slice the bar into 4, 8 or 16 parts. Then we add "groups" to those parts. If two beats start in the same group, they can be beamed together.
    Simple as that. 

    There are some common guidelines on how beaming "should be done" and alphaTab ships a wide range of defaults. But in case of more specialized time signatures,
    you can also customize the beaming as you need by slicing the bar and grouping the beats as needed.
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
